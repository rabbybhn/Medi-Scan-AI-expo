import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();

  const topPad = Platform.OS === "web" ? 52 : insets.top;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom;

  const features = [
    { icon: "camera-outline", text: "তাৎক্ষণিকভাবে যেকোনো ওষুধ স্ক্যান করুন" },
    { icon: "information-circle-outline", text: "ডোজ, ব্যবহার ও মূল্যের তথ্য" },
    { icon: "time-outline", text: "ব্যক্তিগতকৃত স্ক্যান ইতিহাস" },
    { icon: "shield-checkmark-outline", text: "নিরাপদ ও ব্যক্তিগত" },
  ];

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad },
      ]}
    >
      {/* Branding */}
      <View style={styles.brand}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="shield-plus-outline" size={36} color="#fff" />
        </View>
        <Text style={[styles.appName, { color: colors.primary }]}>মেডি স্ক্যান AI</Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          আপনার আঙুলের ডগায় নির্ভুল স্বাস্থ্যসেবা বিশ্লেষণ।
        </Text>
      </View>

      {/* Feature list */}
      <View
        style={[
          styles.featureCard,
          { backgroundColor: colors.card, borderColor: colors.outlineVariant },
        ]}
      >
        {features.map((f, i) => (
          <View
            key={i}
            style={[
              styles.featureRow,
              i < features.length - 1 && {
                borderBottomColor: colors.outlineVariant,
                borderBottomWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            <View style={[styles.featureIcon, { backgroundColor: "#e6edff" }]}>
              <Ionicons name={f.icon as never} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.featureText, { color: colors.foreground }]}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Bottom actions */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[
            styles.loginBtn,
            { backgroundColor: colors.primary },
            isLoading && { opacity: 0.7 },
          ]}
          onPress={login}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.loginBtnText}>প্রবেশ করুন</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: colors.outline }]}>
          চালিয়ে যাওয়ার মাধ্যমে আপনি আমাদের পরিষেবার শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত হচ্ছেন।
        </Text>
        <View style={styles.hipaaRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.outline} />
          <Text style={[styles.hipaaText, { color: colors.outline }]}>
            এনক্রিপ্টেড ডেটা সুরক্ষা
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between" },
  brand: { alignItems: "center", paddingTop: 32, gap: 12 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#003d9b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  featureCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginVertical: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 20 },
  bottom: { gap: 12, paddingBottom: 8 },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
    borderRadius: 30,
    shadowColor: "#003d9b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtnText: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    color: "#fff",
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  hipaaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  hipaaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
