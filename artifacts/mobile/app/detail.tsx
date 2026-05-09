import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth";

interface ScanHistoryItem {
  id: number;
  name: string;
  dosage: string;
  primaryUse: string;
  approximatePrice: string;
  generalInfo: string;
  warnings: string;
  identified: boolean;
  createdAt: string;
  imageUrl?: string | null;
}

function InfoCard({ icon, label, value, accent, colors }: {
  icon: string; label: string; value: string; accent: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}>
      <View style={[styles.infoIconWrap, { backgroundColor: accent + "18" }]}>
        <Ionicons name={icon as never} size={20} color={accent} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function DetailScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 52 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const baseUrl = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

  const { user } = useAuth();

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["scanDetail", scanId, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const res = await fetch(`${baseUrl}/api/medicine/history?userEmail=${encodeURIComponent(user.email)}`);
      if (!res.ok) throw new Error("Failed to load");
      const body = await res.json() as { items: ScanHistoryItem[] };
      return body.items.find((i) => String(i.id) === scanId) ?? null;
    },
    enabled: !!scanId && !!user?.email,
  });

  const storedImageUri = item?.imageUrl
    ? `${baseUrl}/api/storage${item.imageUrl}`
    : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.outlineVariant }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Scan Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        {(error || (!isLoading && !item)) && (
          <View style={styles.center}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.destructive} />
            <Text style={[styles.statusText, { color: colors.mutedForeground }]}>Scan not found</Text>
          </View>
        )}
        {item && (
          <>
            {/* Hero image */}
            {storedImageUri && (
              <View style={styles.heroWrap}>
                <Image
                  source={{ uri: storedImageUri }}
                  style={styles.heroImage}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.55)"]}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            )}

            <View style={[styles.content, !storedImageUri && { paddingTop: 20 }]}>
              <View style={styles.nameRow}>
                <Text style={[styles.medicineName, { color: colors.foreground }]}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: item.identified ? colors.successContainer : colors.surfaceContainer }]}>
                  <Ionicons name={item.identified ? "checkmark-circle" : "help-circle"} size={13} color={item.identified ? colors.success : colors.mutedForeground} />
                  <Text style={[styles.badgeText, { color: item.identified ? colors.success : colors.mutedForeground }]}>
                    {item.identified ? "Identified" : "Uncertain"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.dateText, { color: colors.outline }]}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>

              <View style={styles.cards}>
                <InfoCard icon="medical" label="Primary Use" value={item.primaryUse} accent="#0052cc" colors={colors} />
                <InfoCard icon="flask-outline" label="Dosage" value={item.dosage} accent="#8b5cf6" colors={colors} />
                <InfoCard icon="pricetag-outline" label="Approximate Price" value={item.approximatePrice} accent="#10b981" colors={colors} />
                <InfoCard icon="information-circle-outline" label="General Information" value={item.generalInfo} accent="#06b6d4" colors={colors} />
                <InfoCard icon="warning-outline" label="Warnings & Side Effects" value={item.warnings} accent="#f59e0b" colors={colors} />
              </View>

              <View style={[styles.disclaimer, { backgroundColor: colors.muted, borderColor: colors.outlineVariant }]}>
                <Feather name="alert-triangle" size={13} color={colors.mutedForeground} />
                <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
                  For informational purposes only. Always consult a healthcare professional.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.scanAgainBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/scan")}
              >
                <Ionicons name="camera" size={18} color="#fff" />
                <Text style={styles.scanAgainText}>Scan Another</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  scroll: { paddingHorizontal: 0 },
  heroWrap: { height: 220, overflow: "hidden", backgroundColor: "#000" },
  heroImage: { width: "100%", height: "100%" },
  center: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  statusText: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
  content: { padding: 20, gap: 12 },
  nameRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, flexWrap: "wrap" },
  medicineName: { fontSize: 24, fontFamily: "Manrope_700Bold", fontWeight: "700", letterSpacing: -0.4, lineHeight: 30, flex: 1 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginTop: 4 },
  badgeText: { fontSize: 12, fontFamily: "Inter_400Regular", fontWeight: "600" },
  dateText: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -4 },
  cards: { gap: 10, marginTop: 4 },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  infoIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  infoContent: { flex: 1, gap: 3 },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.7 },
  infoValue: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  disclaimer: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  disclaimerText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 17 },
  scanAgainBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 10, marginTop: 4 },
  scanAgainText: { fontSize: 15, fontFamily: "Manrope_700Bold", fontWeight: "700", color: "#fff" },
});
