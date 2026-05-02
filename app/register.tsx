import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    if (password !== confirmPass) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(name.trim(), email.trim(), password, phone.trim() || undefined);
      router.back();
    } catch (e: any) {
      setError(e.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#1a1540", colors.background]}
          style={[styles.topSection, { paddingTop: topPadding + 16 }]}
        >
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="x" size={22} color="rgba(255,255,255,0.7)" />
          </Pressable>
          <Text style={styles.heroTitle}>Create your account</Text>
          <Text style={styles.heroSub}>Start your JEE/NEET/UPSC preparation today</Text>
        </LinearGradient>

        <View style={styles.form}>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: "#ef444415", borderColor: "#ef444440" }]}>
              <Feather name="alert-circle" size={14} color="#ef4444" />
              <Text style={[styles.errorText, { color: "#ef4444" }]}>{error}</Text>
            </View>
          ) : null}

          <Field
            label="Full Name *"
            icon="user"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            autoCapitalize="words"
          />
          <Field
            label="Email *"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Phone (optional)"
            icon="phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
          />

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <Pressable onPress={() => setShowPass((p) => !p)}>
                <Feather name={showPass ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Confirm Password *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Re-enter password"
                placeholderTextColor={colors.mutedForeground}
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry={!showPass}
              />
            </View>
          </View>

          <Pressable
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitBtnText}>Create Account</Text>
            )}
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
              Already have an account?
            </Text>
            <Pressable onPress={() => router.replace("/login" as never)}>
              <Text style={[styles.switchLink, { color: colors.primary }]}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  const colors = useColors();
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name={icon} size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 8,
  },
  backBtn: {
    alignSelf: "flex-end",
    padding: 4,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "white",
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
  },
  form: {
    padding: 20,
    gap: 14,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "white",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  switchLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
