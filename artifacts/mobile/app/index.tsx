import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLocalHistory, type LocalScanItem } from "@/hooks/useLocalHistory";

const AppLogo = require("../assets/logo.png") as number;

const DRAWER_WIDTH = 300;

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

function DrawerMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const native = Platform.OS !== "web";

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: native, bounciness: 0, speed: 20 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: native }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: native }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: native }),
      ]).start();
    }
  }, [visible]);

  const menuItems = [
    { icon: "information-circle-outline", label: "About This App", sub: "Version 1.0.0 • Medi Scan AI" },
    { icon: "language-outline", label: "Change App Language", sub: "English (default)" },
    { icon: "code-slash-outline", label: "About Developers", sub: "Built with care for your health" },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.drawerBackdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: colors.card,
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 24,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Drawer header */}
        <View style={[styles.drawerHeader, { borderBottomColor: colors.outlineVariant }]}>
          <Image source={AppLogo} style={styles.drawerLogo} resizeMode="contain" />
          <TouchableOpacity onPress={onClose} style={styles.drawerCloseBtn}>
            <Ionicons name="close" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Menu items */}
        <View style={styles.drawerItems}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.drawerItem,
                { borderBottomColor: colors.outlineVariant },
                index === menuItems.length - 1 && { borderBottomWidth: 0 },
              ]}
              activeOpacity={0.7}
            >
              <View style={[styles.drawerItemIcon, { backgroundColor: "#e6edff" }]}>
                <Ionicons name={item.icon as never} size={20} color="#003d9b" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.drawerItemLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.drawerItemSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.outlineVariant} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.drawerFooter}>
          <Image source={AppLogo} style={styles.drawerFooterLogo} resizeMode="contain" />
        </View>
      </Animated.View>
    </Modal>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const topPad = Platform.OS === "web" ? 52 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const { items, isLoading, reload } = useLocalHistory();
  const recentItems = items.slice(0, 3);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: bottomPad + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
            <Ionicons name="menu" size={26} color={colors.foreground} />
          </TouchableOpacity>
          <Image source={AppLogo} style={styles.headerLogo} resizeMode="contain" />
          <View style={{ width: 38 }} />
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.greetingTitle, { color: colors.foreground }]}>Welcome Back</Text>
          <Text style={[styles.greetingSubtitle, { color: colors.mutedForeground }]}>
            Stay on top of your health journey today.
          </Text>
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
          <TouchableOpacity onPress={() => router.push("/history")}>
            <Text style={[styles.viewHistory, { color: colors.primary }]}>View History</Text>
          </TouchableOpacity>
        </View>

        {!isLoading && recentItems.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
            <MaterialCommunityIcons name="line-scan" size={28} color={colors.outline} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No scans yet. Tap "Scan Medicine" to get started.
            </Text>
          </View>
        )}

        {recentItems.map((scan: LocalScanItem) => (
          <TouchableOpacity
            key={scan.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}
            onPress={() => router.push({ pathname: "/detail", params: { scanId: scan.id } })}
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
        <BottomTab icon="person-outline" label="Profile" active={false} onPress={() => router.push("/profile")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  menuBtn: { padding: 4 },
  headerLogo: { height: 32, width: 140 },

  greeting: { marginBottom: 32 },
  greetingTitle: { fontSize: 32, fontFamily: "Manrope_700Bold", fontWeight: "700", letterSpacing: -0.5, lineHeight: 40 },
  greetingSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, marginTop: 4 },

  scanSection: { alignItems: "center", marginBottom: 36, gap: 14 },
  scanCircle: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", shadowColor: "#0052cc", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 8 },
  scanLabel: { fontSize: 17, fontFamily: "Manrope_700Bold", fontWeight: "700", letterSpacing: -0.2 },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  viewHistory: { fontSize: 14, fontFamily: "Inter_400Regular", fontWeight: "600" },

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

  drawerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  drawer: { position: "absolute", top: 0, bottom: 0, left: 0, width: DRAWER_WIDTH, shadowColor: "#000", shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 16 },
  drawerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  drawerLogo: { height: 36, width: 160 },
  drawerCloseBtn: { padding: 4 },
  drawerItems: { paddingHorizontal: 12, flex: 1 },
  drawerItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  drawerItemIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  drawerItemLabel: { fontSize: 15, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  drawerItemSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  drawerFooter: { alignItems: "center", justifyContent: "center", paddingTop: 16 },
  drawerFooterLogo: { height: 28, width: 120, opacity: 0.45 },
});
