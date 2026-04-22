import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "../constants/colors";
import { useSettings } from "../context/settings-context";

const AnimatedView = Animated.createAnimatedComponent(View);

interface Props {
  onAnimationFinish: () => void;
}

export const AnimatedSplashScreen = ({ onAnimationFinish }: Props) => {
  const { isDark } = useSettings();
  const theme = isDark ? Colors.dark : Colors.light;

  const fillAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  const boltPath = "M13 2L3 14h9l-1 8 10-12h-9l1-8z";

  useEffect(() => {
    SplashScreen.hideAsync();

    Animated.sequence([
      Animated.timing(fillAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => onAnimationFinish());
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Animated.View style={[styles.container, { backgroundColor: theme.background, opacity: screenFade }]}>
        <View style={styles.iconContainer}>
          <Svg width="120" height="120" viewBox="0 0 24 24" style={styles.boltSvg}>
            <Path d={boltPath} fill={theme.boltOutline} />
          </Svg>
          <AnimatedView style={[styles.fillWrapper, { height: fillAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] }) }]}>
            <Svg width="120" height="120" viewBox="0 0 24 24" style={styles.boltSvgAbsolute}>
              <Path d={boltPath} fill={Colors.dark.malanka} />
            </Svg>
          </AnimatedView>
        </View>

        <Animated.View style={{ opacity: textOpacity, alignItems: "center" }}>
          <Text style={[styles.title, { color: theme.text }]}>Malanka Sports</Text>
          <View style={styles.loadingBarBg}>
            <AnimatedView
              style={[
                styles.loadingBarIndicator,
                { width: fillAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
              ]}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  iconContainer: { width: 120, height: 120, marginBottom: 30 },
  boltSvg: { position: "absolute", bottom: 0 },
  boltSvgAbsolute: { position: "absolute", bottom: 0 },
  fillWrapper: { position: "absolute", bottom: 0, width: 120, overflow: "hidden" },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", fontStyle: "italic" },
  loadingBarBg: { width: 160, height: 4, backgroundColor: "rgba(150, 150, 150, 0.2)", marginTop: 15, borderRadius: 10, overflow: "hidden" },
  loadingBarIndicator: { height: "100%", backgroundColor: "#FFD700" },
});