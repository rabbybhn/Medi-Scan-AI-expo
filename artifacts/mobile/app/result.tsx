import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { addScanToHistory } from "@/hooks/useLocalHistory";

interface MedicineResult {
  identified: boolean;
  name: string;
  dosage: string;
  primaryUse: string;
  approximatePrice: string;
  generalInfo: string;
  warnings: string;
}

function InfoCard({
  icon,
  iconLib,
  label,
  value,
  accent,
  colors,
}: {
  icon: string;
  iconLib: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome5" | "Feather";
  label: string;
  value: string;
  accent: string;
  colors: ReturnType<typeof useColors>;
}) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const IconComp =
    iconLib === "Ionicons"
      ? Ionicons
      : iconLib === "FontAwesome5"
      ? FontAwesome5
      : iconLib === "Feather"
      ? Feather
      : MaterialCommunityIcons;

  return (
    <Animated.View
      style={[
        styles.infoCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: fadeIn,
          transform: [{ translateY: slideUp }],
        },
      ]}
    >
      <View style={[styles.infoIconWrap, { backgroundColor: accent + "1a" }]}>
        <IconComp name={icon as never} size={20} color={accent} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </Animated.View>
  );
}

export default function ResultScreen() {
  const { imageBase64, imageUri } = useLocalSearchParams<{
    imageBase64: string;
    imageUri: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [result, setResult] = useState<MedicineResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!imageBase64) return;

    const analyze = async () => {
      try {
        const baseUrl = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
        const response = await fetch(`${baseUrl}/api/medicine/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64 }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = (await response.json()) as MedicineResult;
        setResult(data);

        await addScanToHistory({
          name: data.name,
          dosage: data.dosage,
          primaryUse: data.primaryUse,
          approximatePrice: data.approximatePrice,
          generalInfo: data.generalInfo,
          warnings: data.warnings,
          identified: data.identified,
          imageUri: imageUri ?? null,
        });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        setError("Could not analyze medicine. Please try again.");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setLoading(false);
      }
    };

    void analyze();
  }, [imageBase64]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Analysis Result</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {imageUri ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: imageUri }} style={styles.capturedImage} contentFit="cover" />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.5)"]} style={StyleSheet.absoluteFill} />
          </View>
        ) : null}

        {loading && (
          <View style={styles.loadingContainer}>
            <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingTitle, { color: colors.foreground }]}>Analyzing Medicine</Text>
              <Text style={[styles.loadingSubtitle, { color: colors.mutedForeground }]}>
                AI is identifying your medicine...
              </Text>
            </View>
          </View>
        )}

        {error && !loading && (
          <View style={styles.loadingContainer}>
            <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.destructive} />
              <Text style={[styles.loadingTitle, { color: colors.foreground }]}>{error}</Text>
              <Pressable
                style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.retryBtnText, { color: colors.primaryForeground }]}>Try Again</Text>
              </Pressable>
            </View>
          </View>
        )}

        {result && !loading && (
          <View style={styles.resultContainer}>
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.medicineName, { color: colors.foreground }]}>{result.name}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: result.identified ? colors.success + "22" : colors.warning + "22" },
                ]}
              >
                <Ionicons
                  name={result.identified ? "checkmark-circle" : "help-circle"}
                  size={14}
                  color={result.identified ? colors.success : colors.warning}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: result.identified ? colors.success : colors.warning },
                  ]}
                >
                  {result.identified ? "Identified" : "Uncertain"}
                </Text>
              </View>
            </View>

            <View style={styles.cards}>
              <InfoCard icon="medical" iconLib="Ionicons" label="Primary Use" value={result.primaryUse} accent="#0ea5e9" colors={colors} />
              <InfoCard icon="pill" iconLib="MaterialCommunityIcons" label="Dosage" value={result.dosage} accent="#8b5cf6" colors={colors} />
              <InfoCard icon="tag" iconLib="Feather" label="Approximate Price" value={result.approximatePrice} accent="#10b981" colors={colors} />
              <InfoCard icon="information-circle-outline" iconLib="Ionicons" label="General Information" value={result.generalInfo} accent="#06b6d4" colors={colors} />
              <InfoCard icon="warning-outline" iconLib="Ionicons" label="Warnings & Side Effects" value={result.warnings} accent="#f59e0b" colors={colors} />
            </View>

            <View style={[styles.disclaimer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="alert-triangle" size={14} color={colors.mutedForeground} />
              <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
                For informational purposes only. Always consult a healthcare professional before taking any medication.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.scanAgainBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/scan")}
            >
              <MaterialCommunityIcons name="line-scan" size={20} color={colors.primaryForeground} />
              <Text style={[styles.scanAgainText, { color: colors.primaryForeground }]}>
                Scan Another Medicine
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  scrollContent: { paddingHorizontal: 0 },
  imageWrap: { height: 220, overflow: "hidden", backgroundColor: "#000" },
  capturedImage: { width: "100%", height: "100%" },
  loadingContainer: { padding: 24 },
  loadingCard: { borderRadius: 20, padding: 36, alignItems: "center", gap: 12, borderWidth: StyleSheet.hairlineWidth },
  loadingTitle: { fontSize: 18, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  loadingSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  retryBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  retryBtnText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  resultContainer: { padding: 20, gap: 16 },
  nameRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, flexWrap: "wrap" },
  medicineName: { fontSize: 24, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.5, lineHeight: 30 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
  badgeText: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  cards: { gap: 10 },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  infoIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  infoContent: { flex: 1, gap: 3 },
  infoLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.6 },
  infoValue: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  disclaimer: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  disclaimerText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  scanAgainBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 30, marginTop: 4 },
  scanAgainText: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
