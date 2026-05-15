import React, { useState } from "react";
import {
  Alert,
  Appearance,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useColors } from "@/hooks/useColors";
import { useProfile } from "@/hooks/useProfile";
import { useColorScheme } from "react-native";

function SectionLabel({ label, colors }: { label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{label}</Text>
  );
}

function SettingsRow({
  icon,
  iconBg,
  label,
  right,
  onPress,
  colors,
  noBorder,
}: {
  icon: string;
  iconBg: string;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  colors: ReturnType<typeof useColors>;
  noBorder?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.settingsRow,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.outlineVariant,
          borderBottomWidth: noBorder ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as never} size={18} color="#fff" />
      </View>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.rowRight}>{right}</View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, save } = useProfile();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", phone: "" });

  const topPad = Platform.OS === "web" ? 52 : insets.top;
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  function startEdit() {
    setDraft({ name: profile.name, email: profile.email, phone: profile.phone });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function saveEdit() {
    await save(draft);
    setEditing(false);
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to change your profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await save({ profilePicture: result.assets[0].uri });
    }
  }

  function toggleDarkMode(value: boolean) {
    if (Platform.OS !== "web") {
      Appearance.setColorScheme(value ? "dark" : "light");
    }
  }

  async function shareApp() {
    try {
      await Share.share({
        title: "MediScan — AI Medicine Scanner",
        message:
          "Check out MediScan! Point your camera at any medicine and instantly get dosage info, uses, and warnings. Download it now.",
      });
    } catch {
    }
  }

  const initials =
    profile.name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join("") || "?";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.outlineVariant,
            paddingTop: topPad + 8,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        <TouchableOpacity onPress={editing ? cancelEdit : startEdit} style={styles.editBtn}>
          <Text style={[styles.editBtnText, { color: colors.primary }]}>
            {editing ? "Cancel" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Pressable onPress={pickPhoto} style={styles.avatarWrap}>
            {profile.profilePicture ? (
              <Image source={{ uri: profile.profilePicture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={[styles.cameraChip, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </Pressable>
          <Text style={[styles.avatarHint, { color: colors.mutedForeground }]}>
            Tap to change photo
          </Text>
        </View>

        {/* Info fields */}
        <SectionLabel label="PERSONAL INFO" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}>
          <InfoField
            label="Name"
            value={editing ? draft.name : profile.name || "—"}
            editing={editing}
            placeholder="Your full name"
            onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
            colors={colors}
          />
          <InfoField
            label="Email"
            value={editing ? draft.email : profile.email || "—"}
            editing={editing}
            placeholder="your@email.com"
            keyboardType="email-address"
            onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
            colors={colors}
          />
          <InfoField
            label="Phone"
            value={editing ? draft.phone : profile.phone || "—"}
            editing={editing}
            placeholder="+1 (000) 000-0000"
            keyboardType="phone-pad"
            onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
            colors={colors}
            last
          />
        </View>

        {editing && (
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={saveEdit}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        )}

        {/* Preferences */}
        <SectionLabel label="PREFERENCES" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}>
          <SettingsRow
            icon="moon"
            iconBg="#3b2f7f"
            label="Dark Mode"
            colors={colors}
            noBorder
            right={
              <Switch
                value={isDark}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.outlineVariant, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Actions */}
        <SectionLabel label="MORE" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outlineVariant }]}>
          <SettingsRow
            icon="share-social"
            iconBg="#0052cc"
            label="Share This App"
            colors={colors}
            onPress={shareApp}
            noBorder
            right={<Ionicons name="chevron-forward" size={16} color={colors.outlineVariant} />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoField({
  label,
  value,
  editing,
  placeholder,
  keyboardType,
  onChange,
  colors,
  last,
}: {
  label: string;
  value: string;
  editing: boolean;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  onChange: (v: string) => void;
  colors: ReturnType<typeof useColors>;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.fieldRow,
        {
          borderBottomColor: colors.outlineVariant,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {editing ? (
        <TextInput
          style={[styles.fieldInput, { color: colors.foreground }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize={keyboardType ? "none" : "words"}
        />
      ) : (
        <Text
          style={[
            styles.fieldValue,
            { color: value === "—" ? colors.outline : colors.foreground },
          ]}
        >
          {value}
        </Text>
      )}
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
  headerTitle: { fontSize: 17, fontFamily: "Manrope_700Bold", fontWeight: "700" },
  backBtn: { padding: 4, width: 44 },
  editBtn: { padding: 4, width: 44, alignItems: "flex-end" },
  editBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", fontWeight: "600" },

  scroll: { paddingHorizontal: 20, paddingTop: 24 },

  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarWrap: { position: "relative", marginBottom: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  avatarInitials: { fontSize: 34, fontFamily: "Manrope_700Bold", fontWeight: "700", color: "#fff" },
  cameraChip: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarHint: { fontSize: 13, fontFamily: "Inter_400Regular" },

  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },

  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 16,
  },

  fieldRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
    width: 64,
    flexShrink: 0,
  },
  fieldValue: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  fieldInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", padding: 0 },

  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#0052cc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { fontSize: 16, fontFamily: "Manrope_700Bold", fontWeight: "700", color: "#fff" },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 14,
  },
  rowIcon: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", fontWeight: "500" },
  rowRight: { flexShrink: 0 },
});
