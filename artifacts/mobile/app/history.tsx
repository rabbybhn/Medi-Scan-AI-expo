import React from "react";
import {
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLocalHistory, type LocalScanItem } from "@/hooks/useLocalHistory";

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

function HistoryCard({ item, onPress }: { item: LocalScanItem; onPress: () => void }) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.cardThumb, { backgroundColor: colors.surfaceContainerLow }]}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.thumbImage} contentFit="cover" />
        ) : (
          <MaterialCommunityIcons name="pill" size={26} color={colors.primary} />
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={[styles.chip, { backgroundColor: item.identified ? colors.successContainer : colors.surfaceContainer }]}>
            <Text style={[styles.chipText, { color: item.identified ? colors.success : colors.mutedForeground }]}>
              {item.identified ? "শনাক্ত" : "অজানা"}
            </Text>
          </View>
          <Text style={[styles.timeText, { color: colors.outline }]}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.cardUse, { color: colors.mutedForeground }]} numberOfLines={2}>{item.primaryUse}</Text>
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

  const { items, isLoading, reload } = useLocalHistory();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.outlineVariant }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>স্ক্যান ইতিহাস</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={colors.primary} />
        }
      >
        {!isLoading && items.length === 0 && (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialCommunityIcons name="history" size={48} color={colors.outline} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>এখনো কোনো স্ক্যান নেই</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              প্রথম ওষুধ স্ক্যান করুন এখানে দেখতে
            </Text>
            <TouchableOpacity
              style={[styles.scanBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/scan")}
            >
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={[styles.scanBtnText, { color: "#fff" }]}>ওষুধ স্ক্যান করুন</Text>
            </TouchableOpacity>
          </View>
        )}

        {items.length > 0 && (
          <View style={styles.list}>
            <Text style={[styles.countLabel, { color: colors.mutedForeground }]}>
              {items.length}টি স্ক্যান এই ডিভাইসে সংরক্ষিত
            </Text>
            {items.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onPress={() => router.push({ pathname: "/detail", params: { scanId: item.id } })}
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  scroll: { padding: 20 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
  scanBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 8 },
  scanBtnText: { fontSize: 15, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  list: { gap: 10 },
  countLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  card: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 14, gap: 12, alignItems: "flex-start" },
  cardThumb: { width: 52, height: 52, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
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
