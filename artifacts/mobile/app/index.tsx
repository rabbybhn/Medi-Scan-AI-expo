import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/hooks/useAuth";

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

function BottomTab({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.tabIconWrap, active && { backgroundColor: colors.primary }]}>
        <Ionicons name={icon as never} size={22} color={active ? "#fff" : colors.outline} />
      </View>
      <Text style={[styles.tabLabel, { color: active ? colors.primary : colors.outline }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const topPad = Platform.OS === "web" ? 52 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const baseUrl = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["medicineHistory"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/medicine/history`);
      if (!res.ok) throw new Error("Failed to load history");
      return res.json() as Promise<{ items: ScanHistoryItem[]; total: number }>;
    },
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });

  const recentItems = (data?.items ?? []).slice(0, 3);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: bottomPad + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="menu" size={26} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.appName, { color: colors.primary }]}>Medi Scan AI</Text>
          <TouchableOpacity style={[styles.avatar, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{user?.avatar ?? "U"}</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.greetingTitle, { color: colors.foreground }]}>Hello, {user?.name ?? "there"}</Text>
          <Text style={[styles.greetingSubtitle, { color: colors.mutedForeground }]}>
            Stay on top of your health journey today.
          </Text>
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}>
          <Ionicons name="search-outline" size={20} color={colors.outline} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search medication or symptoms..."
            placeholderTextColor={colors.outline}
            editable={false}
          />
          <Ionicons name="mic-outline" size={20} color={colors.outline} />
        </View>

        {/* Scan button */}
        <View style={styles.scanSection}>
          <TouchableOpacity
            style={[styles.scanCircle, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/scan")}
            activeOpacity={0.85}
          >
            <Ionicons name="camera" size={40} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.scanLabel, { color: colors.primary }]}>Scan Medicine</Text>
        </View>

        {/* Recent Activity header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push("/history")}>
            <Text style={[styles.viewHistory, { color: colors.primary }]}>View History</Text>
          </TouchableOpacity>
        </View>

        {/* Loading state */}
        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Loading recent scans...
            </Text>
          </View>
        )}

        {/* Real scan history cards */}
        {!isLoading && recentItems.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
            <MaterialCommunityIcons name="line-scan" size={28} color={colors.outline} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No scans yet. Tap "Scan Medicine" to get started.
            </Text>
          </View>
        )}

        {!isLoading && recentItems.map((scan) => (
          <TouchableOpacity
            key={scan.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}
            onPress={() => router.push({ pathname: "/detail", params: { scanId: String(scan.id) } })}
            activeOpacity={0.75}
          >
            <View style={[styles.pillThumb, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialCommunityIcons name="pill" size={26} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardRow}>
                <View style={[styles.chip, { backgroundColor: scan.identified ? colors.successContainer : colors.surfaceContainer }]}>
                  <Text style={[styles.chipText, { color: scan.identified ? colors.success : colors.mutedForeground }]}>
                    {scan.identified ? "Identified" : "Unknown"}
                  </Text>
                </View>
                <Text style={[styles.cardTime, { color: colors.outline }]}>{timeAgo(scan.createdAt)}</Text>
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>{scan.name}</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]} numberOfLines={2}>{scan.primaryUse}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.outlineVariant} style={{ alignSelf: "center" }} />
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Bottom tab bar */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.card, borderTopColor: colors.outlineVariant, paddingBottom: bottomPad > 0 ? bottomPad : 12 },
        ]}
      >
        <BottomTab icon="home" label="Home" active />
        <BottomTab icon="time-outline" label="History" active={false} onPress={() => router.push("/history")} />
        <BottomTab icon="shield-checkmark-outline" label="Vault" active={false} />
        <BottomTab icon="person-outline" label="Profile" active={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  menuBtn: { padding: 4 },
  appName: { fontSize: 18, fontFamily: "Manrope_700Bold", fontWeight: "700", letterSpacing: -0.3 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  greeting: { marginBottom: 20 },
  greetingTitle: { fontSize: 32, fontFamily: "Manrope_700Bold", fontWeight: "700", letterSpacing: -0.5, lineHeight: 40 },
  greetingSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, marginTop: 4 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, marginBottom: 28 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", padding: 0 },
  scanSection: { alignItems: "center", marginBottom: 36, gap: 14 },
  scanCircle: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", shadowColor: "#0052cc", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 8 },
  scanLabel: { fontSize: 17, fontFamily: "Manrope_700Bold", fontWeight: "700", letterSpacing: -0.2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  viewHistory: { fontSize: 14, fontFamily: "Inter_400Regular", fontWeight: "600" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 16 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 20 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  cardBody: { flex: 1, gap: 4 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 15, fontFamily: "Manrope_700Bold", fontWeight: "700", lineHeight: 22 },
  cardSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  cardTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  pillThumb: { width: 52, height: 52, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  chip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  chipText: { fontSize: 12, fontFamily: "Inter_400Regular", fontWeight: "600" },
  tabBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", paddingTop: 12, paddingHorizontal: 8, borderTopWidth: StyleSheet.hairlineWidth },
  tabItem: { flex: 1, alignItems: "center", gap: 4 },
  tabIconWrap: { width: 44, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  tabLabel: { fontSize: 11, fontFamily: "Inter_400Regular", fontWeight: "500" },
});
