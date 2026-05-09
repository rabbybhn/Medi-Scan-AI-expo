import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function HistoryCard({
  item,
  onPress,
  baseUrl,
}: {
  item: ScanHistoryItem;
  onPress: () => void;
  baseUrl: string;
}) {
  const colors = useColors();
  const imageSource = item.imageUrl
    ? { uri: `${baseUrl}/api/storage${item.imageUrl}` }
    : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.cardThumb, { backgroundColor: colors.surfaceContainerLow }]}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.thumbImage}
            contentFit="cover"
          />
        ) : (
          <MaterialCommunityIcons name="pill" size={26} color={colors.primary} />
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={[
            styles.chip,
            { backgroundColor: item.identified ? colors.successContainer : colors.surfaceContainer },
          ]}>
            <Text style={[
              styles.chipText,
              { color: item.identified ? colors.success : colors.mutedForeground },
            ]}>
              {item.identified ? "Identified" : "Unknown"}
            </Text>
          </View>
          <Text style={[styles.timeText, { color: colors.outline }]}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.cardUse, { color: colors.mutedForeground }]} numberOfLines={2}>
          {item.primaryUse}
        </Text>
        <View style={styles.cardMeta}>
          <Ionicons name="pricetag-outline" size={12} color={colors.outline} />
          <Text style={[styles.cardMetaText, { color: colors.outline }]}>{item.approximatePrice}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.outlineVariant} style={{ alignSelf: "center" }} />
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 52 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const baseUrl = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

  const { user } = useAuth();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["medicineHistory", user?.email],
    queryFn: async () => {
      if (!user?.email) return { items: [], total: 0 };
      const res = await fetch(`${baseUrl}/api/medicine/history?userEmail=${encodeURIComponent(user.email)}`);
      if (!res.ok) throw new Error("Failed to load history");
      return res.json() as Promise<{ items: ScanHistoryItem[]; total: number }>;
    },
    staleTime: 5000,
    enabled: !!user?.email,
  });

  const items = data?.items ?? [];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.outlineVariant }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Scan History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.mutedForeground }]}>Loading history...</Text>
          </View>
        )}

        {error && !isLoading && (
          <View style={styles.center}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.destructive} />
            <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
              Could not load history
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.primary }]}
              onPress={() => refetch()}
            >
              <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && items.length === 0 && (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialCommunityIcons name="history" size={48} color={colors.outline} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No scans yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Scan your first medicine to see it here
            </Text>
            <TouchableOpacity
              style={[styles.scanBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/scan")}
            >
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={[styles.scanBtnText, { color: "#fff" }]}>Scan Medicine</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && items.length > 0 && (
          <View style={styles.list}>
            <Text style={[styles.countLabel, { color: colors.mutedForeground }]}>
              {data?.total} scan{data?.total !== 1 ? "s" : ""} total
            </Text>
            {items.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                baseUrl={baseUrl}
                onPress={() =>
                  router.push({
                    pathname: "/detail",
                    params: { scanId: String(item.id) },
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  scroll: { padding: 20 },
  center: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  statusText: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
  retryBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8, marginTop: 4 },
  retryText: { fontSize: 15, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
  scanBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 8 },
  scanBtnText: { fontSize: 15, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  list: { gap: 10 },
  countLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  card: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    alignItems: "flex-start",
  },
  cardThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  thumbImage: { width: "100%", height: "100%" },
  cardBody: { flex: 1, gap: 4 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  chip: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  chipText: { fontSize: 11, fontFamily: "Inter_400Regular", fontWeight: "600" },
  timeText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardName: { fontSize: 15, fontFamily: "Manrope_700Bold", fontWeight: "700", lineHeight: 20 },
  cardUse: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  cardMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
