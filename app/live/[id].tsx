import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useGetLiveStream } from "@/api/client";

export default function LiveStreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const streamId = parseInt(id ?? "0");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: stream, isLoading } = useGetLiveStream(streamId);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) return <LoadingState />;
  if (!stream) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Stream not found</Text>
      </View>
    );
  }

  const isLive = stream.status === "live";
  const isScheduled = stream.status === "scheduled";
  const scheduledDate = new Date(stream.scheduledAt);

  const openStream = async () => {
    if (stream.streamUrl) {
      await WebBrowser.openBrowserAsync(stream.streamUrl);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isLive ? ["#7f1d1d", "#0f0e1a"] : ["#1a1540", "#0f0e1a"]}
        style={[styles.hero, { paddingTop: topPadding + 10 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="white" />
        </Pressable>

        <View style={styles.streamVisual}>
          {isLive ? (
            <Feather name="radio" size={48} color="white" />
          ) : (
            <Feather name="video" size={48} color="rgba(255,255,255,0.5)" />
          )}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isLive ? "#ef4444" : isScheduled ? "#7c6ef0" : "#374151" },
            ]}
          >
            <Text style={styles.statusText}>
              {isLive ? "LIVE NOW" : isScheduled ? "UPCOMING" : "ENDED"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.details} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.foreground }]}>{stream.title}</Text>

        <View style={styles.metaGroup}>
          <View style={styles.metaItem}>
            <Feather name="user" size={14} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {stream.instructorName}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={14} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {scheduledDate.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={14} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {scheduledDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          {isLive && (
            <View style={styles.metaItem}>
              <Feather name="users" size={14} color="#ef4444" />
              <Text style={[styles.metaText, { color: "#ef4444" }]}>
                {stream.viewerCount} watching
              </Text>
            </View>
          )}
        </View>

        {stream.description && (
          <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.descTitle, { color: colors.foreground }]}>About this class</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {stream.description}
            </Text>
          </View>
        )}

        {isLive && stream.streamUrl ? (
          <Pressable
            style={[styles.joinBtn, { backgroundColor: "#ef4444" }]}
            onPress={openStream}
          >
            <Feather name="radio" size={18} color="white" />
            <Text style={styles.joinBtnText}>Join Live Class</Text>
          </Pressable>
        ) : isScheduled ? (
          <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="bell" size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.secondaryForeground }]}>
              This class is scheduled. Come back when it starts!
            </Text>
          </View>
        ) : (
          <View style={[styles.infoCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="clock" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              This class has ended. Recording may be available soon.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    paddingBottom: 32,
    paddingHorizontal: 16,
    gap: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  streamVisual: {
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "white",
    letterSpacing: 1,
  },
  details: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
    marginBottom: 16,
  },
  metaGroup: {
    gap: 10,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  descCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  descTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  joinBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "white",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
