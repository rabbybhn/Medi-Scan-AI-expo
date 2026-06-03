import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Image as RNImage,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/hooks/useLanguage";
import { addScanToHistory } from "@/hooks/useLocalHistory";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AppLogo = require("../assets/logo.png") as number;

type Phase = "camera" | "analyzing" | "error";

interface CapturedPhoto {
  uri: string;
  base64: string;
}

function AnalyzingOverlay({
  imageUri,
  errorMsg,
  onRetry,
  topPad,
  bottomPad,
}: {
  imageUri: string;
  errorMsg: string | null;
  onRetry: () => void;
  topPad: number;
  bottomPad: number;
}) {
  const { t } = useLanguage();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    if (!errorMsg) {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true })
      ).start();

      const dot = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 420, useNativeDriver: true }),
          ])
        ).start();

      dot(dotAnim1, 0);
      dot(dotAnim2, 180);
      dot(dotAnim3, 360);
    }
  }, [errorMsg]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
      <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />

      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.55)" }]} />

      {/* Back button */}
      <TouchableOpacity
        style={[styles.backBtn, { top: topPad + 12 }]}
        onPress={onRetry}
      >
        <Ionicons name="chevron-back" size={26} color="#fff" />
      </TouchableOpacity>

      <View style={styles.overlayCenter}>
        {!errorMsg ? (
          <View style={styles.analyzeCard}>
            <View style={styles.spinnerWrap}>
              <Animated.View style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]} />
              <RNImage source={AppLogo} style={styles.spinnerLogo} resizeMode="contain" />
            </View>
            <Text style={styles.analyzeTitle}>{t("scan.analyzingTitle")}</Text>
            <Text style={styles.analyzeSubtitle}>{t("scan.analyzingSubtitle")}</Text>
            <View style={styles.dots}>
              <Animated.View style={[styles.dot, { opacity: dotAnim1 }]} />
              <Animated.View style={[styles.dot, { opacity: dotAnim2 }]} />
              <Animated.View style={[styles.dot, { opacity: dotAnim3 }]} />
            </View>
          </View>
        ) : (
          <View style={styles.analyzeCard}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.analyzeTitle}>{t("scan.errorTitle")}</Text>
            <Text style={styles.analyzeSubtitle}>{t("scan.errorMsg")}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
              <Text style={styles.retryBtnText}>{t("tryAgain")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>("camera");
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [captured, setCaptured] = useState<CapturedPhoto | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { t } = useLanguage();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => { startPulse(); }, [startPulse]);

  const runAnalysis = useCallback(async (photo: CapturedPhoto) => {
    setErrorMsg(null);
    setPhase("analyzing");

    try {
      const baseUrl = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
      const response = await fetch(`${baseUrl}/api/medicine/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: photo.base64 }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json() as {
        identified: boolean;
        name: string;
        dosage: string;
        primaryUse: string;
        approximatePrice: string;
        generalInfo: string;
        warnings: string;
      };

      const saved = await addScanToHistory({
        name: data.name,
        dosage: data.dosage,
        primaryUse: data.primaryUse,
        approximatePrice: data.approximatePrice,
        generalInfo: data.generalInfo,
        warnings: data.warnings,
        identified: data.identified,
        imageUri: photo.uri,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: "/detail", params: { scanId: saved.id } });
    } catch {
      setErrorMsg("ওষুধ বিশ্লেষণ করা সম্ভব হয়নি। আপনার সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।");
      setPhase("error");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [router]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || phase !== "camera") return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: true });
      if (photo?.base64 && photo?.uri) {
        const cap: CapturedPhoto = { uri: photo.uri, base64: photo.base64 };
        setCaptured(cap);
        await runAnalysis(cap);
      }
    } catch { /* ignore */ }
  }, [phase, runAnalysis]);

  const handleRetry = useCallback(() => {
    setCaptured(null);
    setErrorMsg(null);
    setPhase("camera");
  }, []);

  if (!permission) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad, gap: 16 }]}>
        <TouchableOpacity style={[styles.backBtn, { top: topPad + 12 }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <MaterialCommunityIcons name="camera-off" size={64} color={colors.outline} />
        <Text style={[styles.permissionTitle, { color: colors.foreground }]}>{t("scan.permissionTitle")}</Text>
        <Text style={[styles.permissionSubtitle, { color: colors.mutedForeground }]}>{t("scan.permissionSub")}</Text>
        <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={[styles.permissionBtnText, { color: colors.primaryForeground }]}>{t("scan.permissionBtn")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Live camera — always mounted so it's ready instantly */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      {/* Top gradient + header — only shown in camera phase */}
      {phase === "camera" && (
        <>
          <LinearGradient
            colors={["rgba(0,0,0,0.75)", "rgba(0,0,0,0)"]}
            style={[styles.topOverlay, { paddingTop: topPad + 12 }]}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t("scan.headerTitle")}</Text>
              <TouchableOpacity style={styles.headerBtn} onPress={() => setFacing(f => f === "back" ? "front" : "back")}>
                <Ionicons name="camera-reverse-outline" size={26} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerSubtitle}>{t("scan.headerSubtitle")}</Text>
          </LinearGradient>

          {/* Scan frame corners */}
          <View style={styles.frameContainer}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.frameHint}>
                <Text style={styles.frameHintText}>ওষুধের লেবেল কেন্দ্রে রাখুন</Text>
              </View>
            </View>
          </View>

          {/* Capture button */}
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"]}
            style={[styles.bottomOverlay, { paddingBottom: bottomPad + 16 }]}
          >
            <View style={styles.controls}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable onPress={handleCapture} style={({ pressed }) => [styles.captureBtn, { opacity: pressed ? 0.85 : 1 }]}>
                  <Ionicons name="camera" size={32} color="#fff" />
                </Pressable>
              </Animated.View>
              <Text style={styles.captureLabel}>ক্যাপচার করতে চাপুন</Text>
            </View>
          </LinearGradient>
        </>
      )}

      {/* Frozen photo + analyzing overlay */}
      {(phase === "analyzing" || phase === "error") && captured && (
        <AnalyzingOverlay
          imageUri={captured.uri}
          errorMsg={errorMsg}
          onRetry={handleRetry}
          topPad={topPad}
          bottomPad={bottomPad}
        />
      )}
    </View>
  );
}

const CORNER = 28, THICKNESS = 3, COLOR = "#0052cc";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },

  backBtn: { position: "absolute", left: 16, zIndex: 10, width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },

  topOverlay: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  headerBtn: { padding: 4, width: 40, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600" as const, color: "#fff", fontFamily: "Manrope_600SemiBold" },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", textAlign: "center" },

  frameContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  scanFrame: { width: 280, height: 200, position: "relative", alignItems: "center", justifyContent: "center" },
  corner: { position: "absolute", width: CORNER, height: CORNER, borderColor: COLOR },
  cornerTL: { top: 0, left: 0, borderTopWidth: THICKNESS, borderLeftWidth: THICKNESS, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: THICKNESS, borderRightWidth: THICKNESS, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: THICKNESS, borderLeftWidth: THICKNESS, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: THICKNESS, borderRightWidth: THICKNESS, borderBottomRightRadius: 4 },
  frameHint: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20 },
  frameHintText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Inter_400Regular" },

  bottomOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, paddingTop: 40 },
  controls: { alignItems: "center", gap: 12 },
  captureBtn: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "#0052cc",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#0052cc", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10,
    borderWidth: 3, borderColor: "rgba(255,255,255,0.35)",
  },
  captureLabel: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontFamily: "Inter_500Medium", letterSpacing: 0.2 },

  overlayCenter: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  analyzeCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 16,
  },
  spinnerWrap: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  spinnerRing: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#0052cc",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  spinnerLogo: { width: 48, height: 24 },
  analyzeTitle: { fontSize: 20, fontFamily: "Manrope_700Bold", fontWeight: "700", color: "#0a1628", letterSpacing: -0.3 },
  analyzeSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#5a6a85", textAlign: "center", lineHeight: 20 },
  dots: { flexDirection: "row", gap: 6, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#0052cc" },

  retryBtn: { backgroundColor: "#0052cc", paddingHorizontal: 32, paddingVertical: 13, borderRadius: 24, marginTop: 8 },
  retryBtnText: { color: "#fff", fontSize: 15, fontFamily: "Manrope_700Bold", fontWeight: "700" },

  permissionTitle: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Manrope_700Bold", textAlign: "center" },
  permissionSubtitle: { fontSize: 15, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 22 },
  permissionBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8, marginTop: 8 },
  permissionBtnText: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Manrope_600SemiBold" },
});
