// src/components/shared/LogoNexo4Pro.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function LogoNexo4Pro() {
  const angle = useSharedValue(0);

  React.useEffect(() => {
    angle.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
  }, [angle]);

  // Função para gerar partículas animadas
  const useParticle = (offset: number, radius: number) => {
    return useAnimatedProps(() => {
      const rad = ((angle.value + offset) * Math.PI) / 180;
      return {
        cx: 50 + radius * Math.cos(rad),
        cy: 50 + radius * Math.sin(rad),
      };
    });
  };

  const particles = [
    useParticle(0, 28),
    useParticle(120, 35),
    useParticle(240, 40),
    useParticle(60, 22),
  ];

  return (
    <View style={styles.container}>
      <Svg width={160} height={160} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#EA1D2C" stopOpacity="1" />
            <Stop offset="60%" stopColor="#FF4F4F" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#FFB08A" stopOpacity="0.2" />
          </RadialGradient>
        </Defs>

        {/* Glow externo */}
        <Circle
          cx="50"
          cy="50"
          r="44"
          stroke="url(#grad)"
          strokeWidth="3"
          fill="none"
          opacity={0.6}
        />

        {/* Círculo principal */}
        <Circle
          cx="50"
          cy="50"
          r="34"
          stroke="#EA1D2C"
          strokeWidth="2.5"
          strokeOpacity={0.9}
          fill="none"
        />

        {/* Círculo interno */}
        <Circle
          cx="50"
          cy="50"
          r="22"
          stroke="#FFB08A"
          strokeWidth="1.6"
          strokeOpacity={0.6}
          fill="none"
        />

        {/* Partículas orbitando */}
        {particles.map((props, i) => (
          <AnimatedCircle
            key={`p-${i}`}
            r={i % 2 === 0 ? 3.8 : 2.8}
            fill={i % 2 === 0 ? "#EA1D2C" : "#FFB08A"}
            animatedProps={props}
          />
        ))}
      </Svg>

      {/* Texto central */}
      <Text style={styles.text}>Nexo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  text: {
    position: "absolute",
    fontSize: 28,
    fontWeight: "bold",
    color: "#EA1D2C",
    letterSpacing: 1.2,
    textShadowColor: "rgba(234,29,44,0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
