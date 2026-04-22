import json
import uuid

import boto3
from botocore.exceptions import ClientError
from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = "postgresql://user:password@localhost:5432/malanka"
LOCAL_IP = 'http://10.20.100.130'
S3_ENDPOINT = LOCAL_IP + ':9000'

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ExerciseSync(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    local_id = Column(Integer, unique=True)
    title = Column(String)
    reps = Column(String)
    date = Column(String)
    status = Column(String)


Base.metadata.create_all(bind=engine)


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


@app.post("/sync")
async def sync_data(exercises: list = Body(...)):
    db = SessionLocal()
    for ex in exercises:
        existing = db.query(ExerciseSync).filter(ExerciseSync.local_id == ex['id']).first()
        if not existing:
            db_ex = ExerciseSync(
                local_id=ex['id'],
                title=ex['title'],
                reps=ex['reps'],
                date=ex['date'],
                status=ex.get('status', 'pending')
            )
            db.add(db_ex)
    db.commit()
    return {"status": "synced", "count": len(exercises)}


@app.post("/upload_avatar")
async def upload_avatar(file: UploadFile = File(...)):
    ext = file.filename.split('.')[-1]
    file_name = f"avatar_{uuid.uuid4()}.{ext}"
    
    s3.upload_fileobj(file.file, 'avatars', file_name, ExtraArgs={'ACL': 'public-read'})
    
    file_url = f"{S3_ENDPOINT}/avatars/{file_name}"
    
    return {"url": file_url}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)