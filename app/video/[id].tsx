import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";

import { LoadingState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useGetVideo } from "@/api/client";
import {
  getEmbedUrl,
  getPreviewUrl,
  isGoogleDriveUrl,
  isYouTubeUrl,
  isGoogleMeetUrl,
  detectLinkType,
} from "@/lib/google-drive";

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const videoId = parseInt(id ?? "0");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: video, isLoading } = useGetVideo(videoId);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) return <LoadingState />;

  if (!video) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Video not found</Text>
      </View>
    );
  }

  const url = video.videoUrl;
  const isDrive = isGoogleDriveUrl(url);
  const isYT = isYouTubeUrl(url);
  const isMeet = isGoogleMeetUrl(url);
  const embedUrl = getEmbedUrl(url);
  const previewUrl = getPreviewUrl(url);
  const linkLabel = detectLinkType(url);

  const openInBrowser = async () => {
    await WebBrowser.openBrowserAsync(previewUrl || url);
  };

  const badgeColor = isDrive ? "#22c55e" : isYT ? "#ef4444" : isMeet ? "#3b82f6" : colors.primary;
  const badgeBg = isDrive ? "#22c55e22" : isYT ? "#ef444422" : isMeet ? "#3b82f622" : colors.primary + "22";
  const badgeIcon = isDrive ? "hard-drive" : isYT ? "youtube" : isMeet ? "video" : "link";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#000000", "#0f0e1a"]}
        style={[styles.playerArea, { paddingTop: topPadding + 10 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="white" />
        </Pressable>

        {/* Embedded player for Drive and YouTube */}
        {(isDrive || isYT) && Platform.OS !== "web" ? (
          <View style={styles.webviewContainer}>
            <WebView
              source={{ uri: embedUrl }}
              style={styles.webview}
              allowsFullscreenVideo
              javaScriptEnabled
              mediaPlaybackRequiresUserAction={false}
            />
          </View>
        ) : (
          /* Web platform or Meet: show tap-to-open card */
          <Pressable style={styles.playContainer} onPress={openInBrowser}>
            <View style={styles.thumbnail}>
              <View style={[styles.playButton, { backgroundColor: badgeColor }]}>
                <Feather name={badgeIcon as any} size={28} color="white" />
              </View>
              <Text style={styles.tapText}>
                {isMeet ? "Tap to join Google Meet" : "Tap to open video"}
              </Text>
            </View>
          </Pressable>
        )}
      </LinearGradient>

      <ScrollView style={styles.details} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>{video.title}</Text>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Feather name={badgeIcon as any} size={11} color={badgeColor} />
            <Text style={[styles.badgeText, { color: badgeColor }]}>{linkLabel}</Text>
          </View>
        </View>

        {video.duration && (
          <View style={styles.metaRow}>
            <Feather name="clock" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {Math.floor(Number(video.duration) / 60)}m {Number(video.duration) % 60}s
            </Text>
            {video.isFree && (
              <View style={[styles.freeBadge, { backgroundColor: "#22c55e22" }]}>
                <Text style={{ color: "#22c55e", fontSize: 12, fontFamily: "Inter_600SemiBold" }}>FREE</Text>
              </View>
            )}
          </View>
        )}

        {video.description && (
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {video.description}
          </Text>
        )}

        <Pressable
          style={[styles.openBtn, { backgroundColor: badgeColor }]}
          onPress={openInBrowser}
        >
          <Feather name="external-link" size={16} color="white" />
          <Text style={styles.openBtnText}>
            {isDrive ? "Open in Google Drive" : isYT ? "Watch on YouTube" : isMeet ? "Join Google Meet" : "Open Video"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  playerArea: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  webviewContainer: {
    borderRadius: 16,
    overflow: "hidden",
    height: 210,
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  playContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  thumbnail: {
    height: 200,
    backgroundColor: "#1a1540",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  playButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  tapText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  details: {
    padding: 16,
  },
  titleRow: {
    marginBottom: 10,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  freeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 16,
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  openBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "white",
  },
});
