import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

// ─── Static recent activity data ────────────────────────────────────────────
const RECENT_SCANS = [
  {
    id: "1",
    name: "Amoxicillin 500mg",
    subtitle: "Scanned successfully • No interactions found",
    status: "Normal",
    time: "2 hours ago",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

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
        <Ionicons
          name={icon as never}
          size={22}
          color={active ? "#fff" : colors.outline}
        />
      </View>
      <Text style={[styles.tabLabel, { color: active ? colors.primary : colors.outline }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 52 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Scrollable body ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: bottomPad + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="menu" size={26} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.appName, { color: colors.primary }]}>Medi Scan AI</Text>
          <TouchableOpacity style={[styles.avatar, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>A</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.greetingTitle, { color: colors.foreground }]}>Hello, Alex</Text>
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

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={[styles.viewHistory, { color: colors.primary }]}>View History</Text>
          </TouchableOpacity>
        </View>

        {/* Scan result card */}
        {RECENT_SCANS.map((scan) => (
          <View
            key={scan.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}
          >
            {/* Medicine image placeholder */}
            <View style={[styles.pillThumb, { backgroundColor: colors.surfaceContainer }]}>
              <MaterialCommunityIcons name="pill" size={28} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardRow}>
                <View style={[styles.chip, { backgroundColor: colors.successContainer }]}>
                  <Text style={[styles.chipText, { color: colors.success }]}>{scan.status}</Text>
                </View>
                <Text style={[styles.cardTime, { color: colors.outline }]}>{scan.time}</Text>
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{scan.name}</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{scan.subtitle}</Text>
            </View>
          </View>
        ))}

        {/* Monthly Adherence card */}
        <View style={[styles.card, styles.cardRow2, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Monthly Adherence</Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
              You've missed only 1 dose this week.
            </Text>
          </View>
          <Text style={[styles.adherencePct, { color: colors.primary }]}>92%</Text>
        </View>

        {/* Next Reminder card */}
        <View style={[styles.card, styles.cardRow2, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="alarm-outline" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.reminderTime, { color: colors.foreground }]}>8:00 PM</Text>
            <Text style={[styles.reminderLabel, { color: colors.mutedForeground }]}>
              Next Reminder
            </Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>Vitamin D3 Supplement</Text>
          </View>
        </View>

        {/* AI Health Insight banner */}
        <View style={[styles.insightCard, { backgroundColor: colors.accent }]}>
          <View style={styles.insightHeader}>
            <MaterialCommunityIcons name="shimmer" size={18} color="#b2c5ff" />
            <Text style={styles.insightTag}>AI HEALTH INSIGHT</Text>
          </View>
          <Text style={styles.insightBody}>
            Based on your recent scans, we've noticed an increase in anti-inflammatory use.
            Consider consulting your health profile for alternative relief options.
          </Text>
          <TouchableOpacity style={styles.insightBtn}>
            <Text style={[styles.insightBtnText, { color: colors.accent }]}>Explore Insights</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom tab bar ── */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.outlineVariant,
            paddingBottom: bottomPad > 0 ? bottomPad : 12,
          },
        ]}
      >
        <BottomTab icon="home" label="Home" active />
        <BottomTab icon="time-outline" label="History" active={false} />
        <BottomTab icon="shield-checkmark-outline" label="Vault" active={false} />
        <BottomTab icon="person-outline" label="Profile" active={false} />
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  menuBtn: { padding: 4 },
  appName: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
  },

  // Greeting
  greeting: { marginBottom: 20 },
  greetingTitle: {
    fontSize: 32,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  greetingSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginTop: 4,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 28,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },

  // Scan button
  scanSection: { alignItems: "center", marginBottom: 36, gap: 14 },
  scanCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0052cc",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  scanLabel: {
    fontSize: 17,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
  },
  viewHistory: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontWeight: "600",
  },

  // Cards
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  cardRow2: { alignItems: "center" },
  cardBody: { flex: 1, gap: 4 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    lineHeight: 22,
  },
  cardSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  cardTime: { fontSize: 12, fontFamily: "Inter_400Regular" },

  // Pill thumbnail
  pillThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // Status chip
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontWeight: "600",
  },

  // Icon circle
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // Adherence
  adherencePct: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  // Reminder
  reminderTime: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    lineHeight: 26,
  },
  reminderLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 1,
  },

  // AI Insight banner
  insightCard: {
    borderRadius: 14,
    padding: 20,
    gap: 12,
    marginBottom: 8,
  },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  insightTag: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontWeight: "600",
    color: "#b2c5ff",
    letterSpacing: 1.2,
  },
  insightBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#dae2ff",
    lineHeight: 21,
  },
  insightBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  insightBtnText: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
  },

  // Bottom tab bar
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  tabIconWrap: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontWeight: "500",
  },
});
