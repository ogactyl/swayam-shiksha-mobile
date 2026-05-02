import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface LiveStream {
  id: number;
  title: string;
  description?: string | null;
  instructorName: string;
  status: string;
  scheduledAt: string;
  viewerCount: number;
}

export function LiveStreamCard({ stream }: { stream: LiveStream }) {
  const colors = useColors();
  const isLive = stream.status === "live";
  const isScheduled = stream.status === "scheduled";

  const scheduledDate = new Date(stream.scheduledAt);
  const dateStr = scheduledDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
  const timeStr = scheduledDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isLive ? "#ef444466" : colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      onPress={() => router.push(`/live/${stream.id}` as never)}
    >
      <LinearGradient
        colors={isLive ? ["#ef4444", "#dc2626"] : ["#2a2647", "#1e1b35"]}
        style={styles.banner}
      >
        {isLive ? (
          <Feather name="radio" size={28} color="white" />
        ) : (
          <Feather name="video" size={28} color="rgba(255,255,255,0.6)" />
        )}
        <View style={[styles.statusBadge, { backgroundColor: isLive ? "#ef4444" : isScheduled ? colors.primary : colors.muted }]}>
          <Text style={styles.statusText}>
            {isLive ? "LIVE" : isScheduled ? "UPCOMING" : "ENDED"}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {stream.title}
        </Text>
        <Text style={[styles.instructor, { color: colors.mutedForeground }]}>
          {stream.instructorName}
        </Text>
        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {isLive ? "Happening now" : `${dateStr} · ${timeStr}`}
            </Text>
          </View>
          {isLive && (
            <View style={styles.metaItem}>
              <Feather name="users" size={12} color="#ef4444" />
              <Text style={[styles.metaText, { color: "#ef4444" }]}>
                {stream.viewerCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  banner: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "white",
    letterSpacing: 0.5,
  },
  info: {
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
  },
  instructor: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
