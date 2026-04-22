import hashlib
import json
import secrets
import time
import uuid

import boto3
from botocore.exceptions import ClientError
from fastapi import Body, Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import BigInteger, Boolean, Column, ForeignKey, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker


DATABASE_URL = "postgresql://user:password@localhost:5432/malanka"
LOCAL_IP = 'http://192.168.0.125'
S3_ENDPOINT = LOCAL_IP + ':9000'

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def _now_ms() -> int:
    return int(time.time() * 1000)


def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_salt = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    token = Column(String, unique=True, index=True, nullable=True)


class ExerciseSync(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    local_id = Column(Integer, nullable=False)
    title = Column(String)
    reps = Column(String)
    date = Column(String)
    status = Column(String)
    is_deleted = Column(Boolean, default=False)
    updated_at = Column(BigInteger, default=_now_ms, index=True)


Base.metadata.create_all(bind=engine)


def _migrate_schema():
    """Add columns added after initial release — safe to run repeatedly."""
    from sqlalchemy import text
    stmts = [
        "ALTER TABLE exercises ADD COLUMN IF NOT EXISTS user_id INTEGER",
        "ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE",
        "ALTER TABLE exercises ADD COLUMN IF NOT EXISTS updated_at BIGINT DEFAULT 0",
        "ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_local_id_key",
        "DROP INDEX IF EXISTS ix_exercises_local_id",
        "DELETE FROM exercises WHERE user_id IS NULL",
        "CREATE INDEX IF NOT EXISTS ix_exercises_user_updated ON exercises (user_id, updated_at)",
    ]
    with engine.begin() as conn:
        for s in stmts:
            try:
                conn.execute(text(s))
            except Exception as e:
                print(f"Migration step failed (ok if already applied): {e}")


_migrate_schema()


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


s3 = boto3.client('s3', endpoint_url=S3_ENDPOINT, aws_access_key_id='admin', aws_secret_access_key='password123')


def init_minio():
    bucket_name = "avatars"
    try:
        s3.head_bucket(Bucket=bucket_name)
        print(f"Bucket '{bucket_name}' already exists.")
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            print(f"Bucket '{bucket_name}' not found. Creating...")
            s3.create_bucket(Bucket=bucket_name)

            public_read_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
                        "Resource": [f"arn:aws:s3:::{bucket_name}"]
                    },
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
                    }
                ]
            }
            s3.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(public_read_policy))
            print(f"Bucket '{bucket_name}' created with public policy.")
        else:
            print(f"Unexpected error checking MinIO: {e}")


init_minio()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> User:
    prefix = "Bearer "
    if not authorization.startswith(prefix):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization[len(prefix):].strip()
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


@app.post("/auth")
async def auth(payload: dict = Body(...), db: Session = Depends(get_db)):
    """Single endpoint: creates user if missing, otherwise logs in."""
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    user = db.query(User).filter(User.username == username).first()
    created = False
    if user is None:
        salt = secrets.token_hex(8)
        user = User(
            username=username,
            password_salt=salt,
            password_hash=_hash_password(password, salt),
            token=secrets.token_urlsafe(24),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        created = True
    else:
        if user.password_hash != _hash_password(password, user.password_salt):
            raise HTTPException(status_code=401, detail="Wrong password")
        if not user.token:
            user.token = secrets.token_urlsafe(24)
            db.commit()

    return {
        "token": user.token,
        "user_id": user.id,
        "username": user.username,
        "avatar_url": user.avatar_url,
        "created": created,
    }


@app.get("/me")
async def me(user: User = Depends(get_current_user)):
    return {
        "user_id": user.id,
        "username": user.username,
        "avatar_url": user.avatar_url,
    }


@app.post("/sync")
async def sync_data(
    payload: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Bidirectional sync.

    Request:  { "exercises": [...], "since": <ms> }
    Response: { "exercises": [...remote changes since `since`...], "server_time": <ms> }
    """
    incoming = payload.get("exercises") or []
    since = int(payload.get("since") or 0)

    for ex in incoming:
        local_id = ex.get("id")
        if local_id is None:
            continue
        existing = (
            db.query(ExerciseSync)
            .filter(ExerciseSync.user_id == user.id, ExerciseSync.local_id == local_id)
            .first()
        )
        if existing is None:
            db.add(ExerciseSync(
                user_id=user.id,
                local_id=local_id,
                title=ex.get("title"),
                reps=ex.get("reps"),
                date=ex.get("date"),
                status=ex.get("status", "pending"),
                is_deleted=bool(ex.get("is_deleted", False)),
                updated_at=_now_ms(),
            ))
        else:
            existing.title = ex.get("title", existing.title)
            existing.reps = ex.get("reps", existing.reps)
            existing.date = ex.get("date", existing.date)
            existing.status = ex.get("status", existing.status)
            existing.is_deleted = bool(ex.get("is_deleted", existing.is_deleted))
            existing.updated_at = _now_ms()
    db.commit()

    updates = (
        db.query(ExerciseSync)
        .filter(ExerciseSync.user_id == user.id, ExerciseSync.updated_at > since)
        .order_by(ExerciseSync.updated_at.asc())
        .all()
    )
    return {
        "exercises": [
            {
                "id": e.local_id,
                "title": e.title,
                "reps": e.reps,
                "date": e.date,
                "status": e.status,
                "is_deleted": bool(e.is_deleted),
                "updated_at": int(e.updated_at or 0),
            }
            for e in updates
        ],
        "server_time": _now_ms(),
    }


@app.get("/exercises/updates")
async def get_updates(
    since: int = 0,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lightweight realtime poll: returns changes since given timestamp."""
    updates = (
        db.query(ExerciseSync)
        .filter(ExerciseSync.user_id == user.id, ExerciseSync.updated_at > since)
        .order_by(ExerciseSync.updated_at.asc())
        .all()
    )
    return {
        "exercises": [
            {
                "id": e.local_id,
                "title": e.title,
                "reps": e.reps,
                "date": e.date,
                "status": e.status,
                "is_deleted": bool(e.is_deleted),
                "updated_at": int(e.updated_at or 0),
            }
            for e in updates
        ],
        "server_time": _now_ms(),
    }


@app.post("/upload_avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ext = (file.filename or "avatar.jpg").split('.')[-1]
    file_name = f"avatar_{user.id}_{uuid.uuid4()}.{ext}"

    s3.upload_fileobj(file.file, 'avatars', file_name, ExtraArgs={'ACL': 'public-read'})

    file_url = f"{S3_ENDPOINT}/avatars/{file_name}"
    user.avatar_url = file_url
    db.commit()

    return {"url": file_url}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
