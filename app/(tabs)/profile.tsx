import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useListEnrollments } from "@/api/client";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isLoading, logout } = useAuth();
  const { data: enrollments } = useListEnrollments();

  if (isLoading) return <LoadingState />;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={["#1a1540", colors.background]}
          style={[styles.guestHero, { paddingTop: topPadding + 40 }]}
        >
          <View style={[styles.avatarCircle, { backgroundColor: colors.secondary }]}>
            <Feather name="user" size={48} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.guestTitle, { color: colors.foreground }]}>
            Join Swayam Shiksha
          </Text>
          <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>
            Sign in to track your progress, access courses, and more
          </Text>
        </LinearGradient>

        <View style={styles.authButtons}>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/login" as never)}
          >
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push("/register" as never)}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
              Create Account
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#1a1540", colors.background]}
        style={[styles.profileHero, { paddingTop: topPadding + 20 }]}
      >
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "33" }]}>
          <Text style={[styles.avatarInitials, { color: colors.primary }]}>
            {user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.userName, { color: colors.foreground }]}>{user.name}</Text>
        <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user.email}</Text>
        {user.role === "admin" && (
          <View style={[styles.adminBadge, { backgroundColor: colors.primary + "33" }]}>
            <Feather name="shield" size={12} color={colors.primary} />
            <Text style={[styles.adminText, { color: colors.primary }]}>Admin</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatCard label="Enrolled" value={enrollments?.length ?? 0} icon="book-open" />
        <StatCard label="Tests Done" value={0} icon="check-square" />
        <StatCard label="Streak" value={1} icon="zap" />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionTitle title="Account" />
        <MenuItem icon="user" label="Edit Profile" onPress={() => {}} />
        <MenuItem icon="phone" label={user.phone || "Add phone number"} onPress={() => {}} />
        <MenuItem icon="mail" label={user.email} onPress={() => {}} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionTitle title="Learning" />
        <MenuItem icon="book-open" label="My Courses" onPress={() => router.push("/courses" as never)} />
        <MenuItem icon="check-square" label="Test Series" onPress={() => router.push("/tests" as never)} />
        <MenuItem icon="video" label="Live Classes" onPress={() => router.push("/live" as never)} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionTitle title="Support" />
        <MenuItem icon="help-circle" label="Help & FAQ" onPress={() => {}} />
        <MenuItem icon="info" label="About Swayam Shiksha" onPress={() => {}} />
      </View>

      <Pressable
        style={[styles.logoutBtn, { borderColor: "#ef444433" }]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={18} color="#ef4444" />
        <Text style={[styles.logoutText, { color: "#ef4444" }]}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: keyof typeof Feather.glyphMap }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={18} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title}</Text>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { borderTopColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <Feather name={icon} size={18} color={colors.mutedForeground} />
      <Text style={[styles.menuLabel, { color: colors.foreground }]} numberOfLines={1}>
        {label}
      </Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guestHero: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  profileHero: {
    alignItems: "center",
    paddingBottom: 28,
    paddingHorizontal: 20,
    gap: 6,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarInitials: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  guestTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  guestSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  authButtons: {
    padding: 20,
    gap: 12,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "white",
  },
  secondaryBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  userName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  adminText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingTop: 14,
    paddingBottom: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
