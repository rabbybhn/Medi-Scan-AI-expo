import React, { useState, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";

const PRIMARY = "#003d9b";
const SURFACE = "#faf9ff";
const BORDER = "#d8e2ff";
const MUTED = "#737685";
const FOREGROUND = "#051a3e";

type Tab = "signin" | "signup";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const tabAnim = useRef(new Animated.Value(0)).current;

  const switchTab = (t: Tab) => {
    setTab(t);
    Animated.spring(tabAnim, {
      toValue: t === "signin" ? 0 : 1,
      useNativeDriver: false,
      bounciness: 0,
    }).start();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    await login({ name: "Alex", email: "alex@medical.com", avatar: "A" });
    router.replace("/");
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const displayName = tab === "signup" ? (name || email.split("@")[0] || "User") : (email.split("@")[0] || "User");
    await login({
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email,
      avatar: displayName[0]?.toUpperCase() ?? "U",
    });
    router.replace("/");
    setLoading(false);
  };

  const underlineLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: SURFACE }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="shield-plus-outline" size={22} color={PRIMARY} />
          </View>
          <Text style={styles.logoText}>Medi Scan AI</Text>
        </View>

        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>Welcome Back</Text>
          <Text style={styles.heroSubtitle}>
            Precision healthcare analysis at your fingertips.
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab("signin")}>
              <Text style={[styles.tabText, tab === "signin" && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab("signup")}>
              <Text style={[styles.tabText, tab === "signup" && styles.tabTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
            <View style={styles.tabUnderlineTrack}>
              <Animated.View style={[styles.tabUnderline, { left: underlineLeft }]} />
            </View>
          </View>

          <View style={styles.cardBody}>
            {/* Google button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={FOREGROUND} />
              ) : (
                <>
                  <MaterialCommunityIcons name="google" size={18} color="#4285F4" />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Name field (signup only) */}
            {tab === "signup" && (
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={17} color={MUTED} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Jane Smith"
                    placeholderTextColor={MUTED}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={17} color={MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@medical.com"
                  placeholderTextColor={MUTED}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.fieldLabel}>Password</Text>
                {tab === "signin" && (
                  <TouchableOpacity>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={17} color={MUTED} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={MUTED}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color={MUTED}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Keep signed in */}
            {tab === "signin" && (
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setKeepSignedIn((v) => !v)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, keepSignedIn && styles.checkboxChecked]}>
                  {keepSignedIn && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={styles.checkLabel}>Keep me signed in for 30 days</Text>
              </TouchableOpacity>
            )}

            {/* Submit */}
            <Pressable
              style={({ pressed }) => [styles.submitBtn, { opacity: pressed ? 0.88 : 1 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {tab === "signin" ? "Access Dashboard" : "Create Account"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsRow}>
          <Text style={styles.termsText}>By continuing, you agree to our </Text>
          <TouchableOpacity>
            <Text style={styles.termsLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.termsText}>{"\n"}and </Text>
          <TouchableOpacity>
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.termsText}>.</Text>
        </View>

        {/* HIPAA badge */}
        <View style={styles.hipaaRow}>
          <MaterialCommunityIcons name="shield-check-outline" size={15} color={MUTED} />
          <Text style={styles.hipaaText}>HIPAA Compliant Data Encryption</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 0 },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 36,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#e6edff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    color: PRIMARY,
    letterSpacing: -0.2,
  },

  heroBlock: { marginBottom: 28, gap: 6 },
  heroTitle: {
    fontSize: 32,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    color: FOREGROUND,
    letterSpacing: -0.6,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: MUTED,
    textAlign: "center",
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    marginBottom: 28,
    shadowColor: "#0052cc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },

  tabRow: {
    flexDirection: "row",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tabBtn: { flex: 1, paddingVertical: 16, alignItems: "center" },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: MUTED,
  },
  tabTextActive: { color: PRIMARY },
  tabUnderlineTrack: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
  },
  tabUnderline: {
    position: "absolute",
    width: "50%",
    height: 2,
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },

  cardBody: { padding: 24, gap: 18 },

  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
  },
  googleBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: FOREGROUND,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { fontSize: 12, fontFamily: "Inter_400Regular", color: MUTED, flexShrink: 0 },

  fieldWrap: { gap: 7 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: FOREGROUND,
  },
  passwordLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  forgotText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: PRIMARY,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "#fff",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: FOREGROUND,
    padding: 0,
  },
  eyeBtn: { padding: 2, marginLeft: 8 },

  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  checkLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: FOREGROUND,
    flex: 1,
  },

  submitBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  termsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  termsText: { fontSize: 13, fontFamily: "Inter_400Regular", color: MUTED, textAlign: "center" },
  termsLink: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600", color: PRIMARY },

  hipaaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  hipaaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: MUTED },
});
