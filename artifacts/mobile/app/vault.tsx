import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useColors } from "@/hooks/useColors";
import { useVault, type VaultItem, type ReminderSettings, removeFromVault, updateReminder } from "@/hooks/useVault";
import { getScanById, type LocalScanItem } from "@/hooks/useLocalHistory";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const FREQUENCY_OPTIONS: { key: ReminderSettings["frequency"]; label: string; hour: number; minute: number; icon: string }[] = [
  { key: "morning",   label: "সকাল",   hour: 8,  minute: 0,  icon: "sunny-outline" },
  { key: "afternoon", label: "দুপুর", hour: 13, minute: 0,  icon: "partly-sunny-outline" },
  { key: "evening",   label: "সন্ধ্যা",   hour: 19, minute: 0,  icon: "moon-outline" },
  { key: "daily",     label: "কাস্টম",    hour: 9,  minute: 0,  icon: "alarm-outline" },
];

function ReminderModal({
  visible,
  scanId,
  medicineName,
  existing,
  onClose,
  onSaved,
}: {
  visible: boolean;
  scanId: string;
  medicineName: string;
  existing: ReminderSettings | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const colors = useColors();
  const [selected, setSelected] = useState<ReminderSettings["frequency"]>(existing?.frequency ?? "morning");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setSelected(existing?.frequency ?? "morning");
  }, [visible, existing]);

  async function requestPermission(): Promise<boolean> {
    if (Platform.OS === "web") return false;
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") return true;
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === "granted";
  }

  async function scheduleNotification(freq: ReminderSettings["frequency"], hour: number, minute: number): Promise<string> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "ওষুধের রিমাইন্ডার",
        body: `${medicineName} খাওয়ার সময় হয়েছে`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return id;
  }

  async function save() {
    setSaving(true);
    try {
      const option = FREQUENCY_OPTIONS.find((o) => o.key === selected)!;
      let notificationId: string | undefined;

      const granted = await requestPermission();
      if (granted) {
        notificationId = await scheduleNotification(selected, option.hour, option.minute);
      } else if (Platform.OS !== "web") {
        Alert.alert(
          "বিজ্ঞপ্তি অক্ষম",
          "রিমাইন্ডার পেতে সেটিংসে বিজ্ঞপ্তি চালু করুন। আপনার রিমাইন্ডার সংরক্ষিত হয়েছে।"
        );
      }

      const reminder: ReminderSettings = {
        enabled: true,
        hour: option.hour,
        minute: option.minute,
        frequency: selected,
        notificationId,
      };
      await updateReminder(scanId, reminder);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    try {
      if (existing?.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(existing.notificationId);
      }
      await updateReminder(scanId, null);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.outlineVariant }]} />

        <Text style={[styles.sheetTitle, { color: colors.foreground }]}>ওষুধের রিমাইন্ডার</Text>
        <Text style={[styles.sheetSub, { color: colors.mutedForeground }]} numberOfLines={2}>
          {medicineName}
        </Text>

        <View style={styles.freqGrid}>
          {FREQUENCY_OPTIONS.map((opt) => {
            const active = selected === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.freqBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
                    borderColor: active ? colors.primary : colors.outlineVariant,
                  },
                ]}
                onPress={() => setSelected(opt.key)}
                activeOpacity={0.8}
              >
                <Ionicons name={opt.icon as never} size={22} color={active ? "#fff" : colors.foreground} />
                <Text style={[styles.freqLabel, { color: active ? "#fff" : colors.foreground }]}>{opt.label}</Text>
                <Text style={[styles.freqTime, { color: active ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>
                  {opt.hour < 12
                    ? `${opt.hour}:00 AM`
                    : opt.hour === 12
                    ? "12:00 PM"
                    : `${opt.hour - 12}:00 PM`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.saveReminderBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]}
          onPress={save}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Ionicons name="alarm" size={18} color="#fff" />
          <Text style={styles.saveReminderText}>{saving ? "সংরক্ষণ হচ্ছে…" : "রিমাইন্ডার সেট করুন"}</Text>
        </TouchableOpacity>

        {existing?.enabled && (
          <TouchableOpacity
            style={[styles.removeReminderBtn, { borderColor: colors.destructive }]}
            onPress={remove}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={[styles.removeReminderText, { color: colors.destructive }]}>রিমাইন্ডার সরান</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>বাতিল</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function VaultCard({
  vault,
  scan,
  colors,
  onPress,
  onRemove,
  onReminder,
}: {
  vault: VaultItem;
  scan: LocalScanItem;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
  onRemove: () => void;
  onReminder: () => void;
}) {
  const hasReminder = vault.reminder?.enabled;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}>
      <TouchableOpacity style={styles.cardMain} onPress={onPress} activeOpacity={0.75}>
        <View style={[styles.cardThumb, { backgroundColor: colors.surfaceContainerLow }]}>
          {scan.imageUri ? (
            <Image source={{ uri: scan.imageUri }} style={styles.thumbImg} contentFit="cover" />
          ) : (
            <MaterialCommunityIcons name="pill" size={26} color={colors.primary} />
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
            {scan.name}
          </Text>
          <Text style={[styles.cardDosage, { color: colors.mutedForeground }]} numberOfLines={1}>
            {scan.dosage}
          </Text>
          <Text style={[styles.cardUse, { color: colors.mutedForeground }]} numberOfLines={2}>
            {scan.primaryUse}
          </Text>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={colors.outlineVariant} />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={[styles.cardFooter, { borderTopColor: colors.outlineVariant }]}>
        {hasReminder && (
          <View style={[styles.reminderChip, { backgroundColor: colors.successContainer }]}>
            <Ionicons name="alarm" size={12} color={colors.success} />
            <Text style={[styles.reminderChipText, { color: colors.success }]}>
              রিমাইন্ডার চালু আছে
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.reminderBtn,
            {
              backgroundColor: hasReminder ? colors.surfaceContainerLow : colors.primary,
              borderColor: hasReminder ? colors.outlineVariant : colors.primary,
            },
          ]}
          onPress={onReminder}
          activeOpacity={0.85}
        >
          <Ionicons name={hasReminder ? "alarm" : "alarm-outline"} size={15} color={hasReminder ? colors.foreground : "#fff"} />
          <Text style={[styles.reminderBtnText, { color: hasReminder ? colors.foreground : "#fff" }]}>
            ওষুধের রিমাইন্ডার
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function VaultScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 52 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const { items, isLoading, reload, remove, setReminder } = useVault();
  const [scans, setScans] = useState<Record<string, LocalScanItem>>({});
  const [reminderTarget, setReminderTarget] = useState<VaultItem | null>(null);

  useEffect(() => {
    async function fetchScans() {
      const map: Record<string, LocalScanItem> = {};
      await Promise.all(
        items.map(async (v) => {
          const s = await getScanById(v.scanId);
          if (s) map[v.scanId] = s;
        })
      );
      setScans(map);
    }
    if (items.length > 0) void fetchScans();
  }, [items]);

  async function handleRemove(scanId: string, name: string) {
    Alert.alert(
      "আমার ওষুধ থেকে সরান",
      `"${name}" আপনার ভল্ট থেকে সরাবেন?`,
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "সরান",
          style: "destructive",
          onPress: async () => {
            await removeFromVault(scanId);
            await reload();
          },
        },
      ]
    );
  }

  const validItems = items.filter((v) => scans[v.scanId]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.outlineVariant, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>আমার ওষুধ</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>আপনার ব্যক্তিগত ওষুধ ভান্ডার</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerBadgeText}>{validItems.length}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 30 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={colors.primary} />}
      >
        {!isLoading && validItems.length === 0 && (
          <View style={styles.empty}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialCommunityIcons name="shield-plus-outline" size={52} color={colors.outline} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>আপনার ভল্ট খালি</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              ওষুধ স্ক্যান করার পরে বিবরণ স্ক্রিনে বুকমার্ক আইকনে চাপুন এখানে যোগ করতে।
            </Text>
            <TouchableOpacity
              style={[styles.scanNowBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/scan")}
              activeOpacity={0.85}
            >
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={styles.scanNowText}>ওষুধ স্ক্যান করুন</Text>
            </TouchableOpacity>
          </View>
        )}

        {validItems.length > 0 && (
          <View style={styles.list}>
            <Text style={[styles.listLabel, { color: colors.mutedForeground }]}>
              {validItems.length}টি ওষুধ সংরক্ষিত
            </Text>
            {validItems.map((v) => (
              <VaultCard
                key={v.scanId}
                vault={v}
                scan={scans[v.scanId]}
                colors={colors}
                onPress={() => router.push({ pathname: "/detail", params: { scanId: v.scanId } })}
                onRemove={() => handleRemove(v.scanId, scans[v.scanId]?.name ?? "this medicine")}
                onReminder={() => setReminderTarget(v)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {reminderTarget && scans[reminderTarget.scanId] && (
        <ReminderModal
          visible={!!reminderTarget}
          scanId={reminderTarget.scanId}
          medicineName={scans[reminderTarget.scanId].name}
          existing={reminderTarget.reminder}
          onClose={() => setReminderTarget(null)}
          onSaved={reload}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  headerBadge: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  headerBadgeText: { fontSize: 13, fontFamily: "Manrope_700Bold", fontWeight: "700", color: "#fff" },

  scroll: { padding: 20 },

  empty: { alignItems: "center", paddingTop: 80, gap: 14, paddingHorizontal: 32 },
  emptyIconWrap: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontFamily: "Manrope_700Bold", fontWeight: "700", textAlign: "center" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  scanNowBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 10, marginTop: 4 },
  scanNowText: { fontSize: 15, fontFamily: "Manrope_700Bold", fontWeight: "700", color: "#fff" },

  list: { gap: 12 },
  listLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },

  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  cardMain: { flexDirection: "row", padding: 14, gap: 12, alignItems: "flex-start" },
  cardThumb: { width: 54, height: 54, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  thumbImg: { width: "100%", height: "100%" },
  cardBody: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontFamily: "Manrope_700Bold", fontWeight: "700", lineHeight: 20 },
  cardDosage: { fontSize: 12, fontFamily: "Inter_600SemiBold", fontWeight: "600" },
  cardUse: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  removeBtn: { padding: 2 },

  cardFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  reminderChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, flex: 1 },
  reminderChipText: { fontSize: 12, fontFamily: "Inter_500Medium", fontWeight: "500" },
  reminderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: "auto",
  },
  reminderBtnText: { fontSize: 13, fontFamily: "Manrope_700Bold", fontWeight: "700" },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontFamily: "Manrope_700Bold", fontWeight: "700", marginBottom: 2 },
  sheetSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },

  freqGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  freqBtn: {
    flex: 1,
    minWidth: "44%",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  freqLabel: { fontSize: 14, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  freqTime: { fontSize: 12, fontFamily: "Inter_400Regular" },

  saveReminderBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, marginBottom: 10 },
  saveReminderText: { fontSize: 16, fontFamily: "Manrope_700Bold", fontWeight: "700", color: "#fff" },
  removeReminderBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center", marginBottom: 8 },
  removeReminderText: { fontSize: 15, fontFamily: "Inter_600SemiBold", fontWeight: "600" },
  cancelBtn: { alignItems: "center", paddingVertical: 10 },
  cancelText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
