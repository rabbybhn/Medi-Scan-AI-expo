import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
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
import { LinearGradient } from "expo-linear-gradient";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  React.useEffect(() => { startPulse(); }, [startPulse]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: true });
      if (photo?.base64) {
        router.push({ pathname: "/result", params: { imageBase64: photo.base64, imageUri: photo.uri } });
      }
    } catch { /* ignore */ } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, router]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!permission) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad, gap: 16 }]}>
        <TouchableOpacity style={styles.backBtnAlt} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <MaterialCommunityIcons name="camera-off" size={64} color={colors.outline} />
        <Text style={[styles.permissionTitle, { color: colors.foreground }]}>Camera Access Needed</Text>
        <Text style={[styles.permissionSubtitle, { color: colors.mutedForeground }]}>Point your camera at any medicine to identify it instantly</Text>
        <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={[styles.permissionBtnText, { color: colors.primaryForeground }]}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
      <LinearGradient colors={["rgba(0,0,0,0.75)", "rgba(0,0,0,0.0)"]} style={[styles.topOverlay, { paddingTop: topPad + 12 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Medicine</Text>
          <TouchableOpacity style={styles.flipBtn} onPress={() => setFacing(f => f === "back" ? "front" : "back")}>
            <Ionicons name="camera-reverse-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Point at the label or packaging</Text>
      </LinearGradient>

      <View style={styles.frameContainer}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <View style={styles.frameHint}>
            <Text style={styles.frameHintText}>Center the medicine label</Text>
          </View>
        </View>
      </View>

      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"]} style={[styles.bottomOverlay, { paddingBottom: bottomPad + 16 }]}>
        <View style={styles.controls}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable onPress={handleCapture} disabled={isCapturing} style={({ pressed }) => [styles.captureBtn, { opacity: pressed ? 0.85 : 1 }]}>
              <Ionicons name="camera" size={32} color="#fff" />
            </Pressable>
          </Animated.View>
          <Text style={styles.captureLabel}>Tap to Capture</Text>
        </View>
      </LinearGradient>

      {isCapturing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#0052cc" size="large" />
            <Text style={styles.loadingTitle}>Please Wait</Text>
            <Text style={styles.loadingMessage}>
              We are working to fetch information..
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const CORNER = 28, THICKNESS = 3, COLOR = "#0052cc";
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  backBtnAlt: { position: "absolute", top: 20, left: 20, padding: 8 },
  topOverlay: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600" as const, color: "#fff", fontFamily: "Manrope_600SemiBold" },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", textAlign: "center" },
  backBtn: { padding: 4 },
  flipBtn: { padding: 4 },
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
  loadingOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center", justifyContent: "center",
  },
  loadingBox: {
    backgroundColor: "#fff", borderRadius: 20,
    paddingVertical: 36, paddingHorizontal: 40,
    alignItems: "center", gap: 14,
    marginHorizontal: 32,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 24, elevation: 12,
  },
  loadingTitle: {
    fontSize: 18, fontFamily: "Manrope_700Bold", fontWeight: "700",
    color: "#0a1628", letterSpacing: -0.3,
  },
  loadingMessage: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: "#5a6a85",
    textAlign: "center", lineHeight: 21,
  },
  permissionTitle: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Manrope_700Bold", textAlign: "center" },
  permissionSubtitle: { fontSize: 15, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 22 },
  permissionBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8, marginTop: 8 },
  permissionBtnText: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Manrope_600SemiBold" },
});
