import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from "@expo-google-fonts/inter";
import {
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts as useManropeFonts,
} from "@expo-google-fonts/manrope";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";

if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const AppLogo = require("../assets/logo.png") as number;

function CustomSplash({ onDone }: { onDone: () => void }) {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const native = Platform.OS !== "web";
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: native,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: native,
        }),
      ]),
      Animated.delay(900),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 420,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: native,
      }),
    ]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity: screenOpacity }]}>
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
          alignItems: "center",
          gap: 20,
        }}
      >
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.splashIcon}
          resizeMode="contain"
        />
        <Image
          source={AppLogo}
          style={styles.splashLogo}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

export default function RootLayout() {
  const [interLoaded, interError] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [manropeLoaded, manropeError] = useManropeFonts({
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const loaded = interLoaded && manropeLoaded;
  const error = interError ?? manropeError;
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="scan" options={{ presentation: "fullScreenModal" }} />
                  <Stack.Screen name="result" options={{ presentation: "card" }} />
                  <Stack.Screen name="history" options={{ presentation: "card" }} />
                  <Stack.Screen name="detail" options={{ presentation: "card" }} />
                </Stack>

                {showSplash && (
                  <CustomSplash onDone={() => setShowSplash(false)} />
                )}
              </View>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#003d9b",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  splashIcon: {
    width: 110,
    height: 110,
  },
  splashLogo: {
    width: 220,
    height: 56,
  },
});
