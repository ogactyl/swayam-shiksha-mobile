import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import {
  useEnroll,
  useGetCourse,
  useListDpps,
  useListEnrollments,
  useListPdfs,
  useListVideos,
} from "@/api/client";

type TabKey = "videos" | "pdfs" | "dpps";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = parseInt(id ?? "0");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("videos");

  const { data: course, isLoading } = useGetCourse(courseId);
  const { data: videos } = useListVideos(courseId);
  const { data: pdfs } = useListPdfs(courseId);
  const { data: dpps } = useListDpps(courseId);
  const { data: enrollments, refetch: refetchEnrollments } = useListEnrollments();
  const enrollMutation = useEnroll();

  if (isLoading) return <LoadingState />;
  if (!course) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Course not found</Text>
      </View>
    );
  }

  const isEnrolled = enrollments?.some((e) => e.courseId === courseId);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login" as never);
      return;
    }
    if (isEnrolled) return;
    try {
      await enrollMutation.mutateAsync({ courseId });
      await refetchEnrollments();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Enrolled!", `You are now enrolled in ${course.title}`);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not enroll");
    }
  };

  const tabs: { key: TabKey; label: string; icon: keyof typeof Feather.glyphMap; count: number }[] = [
    { key: "videos", label: "Videos", icon: "play-circle", count: course.totalVideos },
    { key: "pdfs", label: "PDFs", icon: "file-text", count: course.totalPdfs },
    { key: "dpps", label: "DPPs", icon: "edit-3", count: course.totalDpps },
  ];

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#1a1540", "#0f0e1a"]}
          style={[styles.hero, { paddingTop: topPadding + 10 }]}
        >
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="white" />
          </Pressable>

          <View style={styles.heroContent}>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: "#7c6ef044" }]}>
                <Text style={[styles.badgeText, { color: "#c4c1e8" }]}>
                  {course.categoryName}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: "#ffffff11" }]}>
                <Text style={[styles.badgeText, { color: "#9090a8" }]}>
                  {course.level}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: "#ffffff11" }]}>
                <Text style={[styles.badgeText, { color: "#9090a8" }]}>
                  {course.language}
                </Text>
              </View>
            </View>

            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.instructor}>by {course.instructorName}</Text>

            <View style={styles.metaRow}>
              <MetaItem icon="play-circle" label={`${course.totalVideos} videos`} />
              <MetaItem icon="file-text" label={`${course.totalPdfs} PDFs`} />
              <MetaItem icon="edit-3" label={`${course.totalDpps} DPPs`} />
              <MetaItem icon="users" label={`${course.enrollmentCount} enrolled`} />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.enrollSection}>
          <View style={styles.priceBlock}>
            {course.isFree ? (
              <Text style={[styles.freeText, { color: "#22c55e" }]}>FREE Course</Text>
            ) : (
              <Text style={[styles.priceText, { color: colors.primary }]}>
                ₹{course.price.toLocaleString("en-IN")}
              </Text>
            )}
            {isEnrolled && (
              <View style={[styles.enrolledBadge, { backgroundColor: "#22c55e22" }]}>
                <Feather name="check-circle" size={14} color="#22c55e" />
                <Text style={[styles.enrolledText, { color: "#22c55e" }]}>Enrolled</Text>
              </View>
            )}
          </View>
          <Pressable
            style={[
              styles.enrollBtn,
              {
                backgroundColor: isEnrolled ? colors.secondary : colors.primary,
                opacity: enrollMutation.isPending ? 0.7 : 1,
              },
            ]}
            onPress={handleEnroll}
            disabled={enrollMutation.isPending || isEnrolled}
          >
            {enrollMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={[styles.enrollBtnText, { color: isEnrolled ? colors.mutedForeground : "white" }]}>
                {isEnrolled ? "Already Enrolled" : course.isFree ? "Enroll Free" : "Enroll Now"}
              </Text>
            )}
          </Pressable>
        </View>

        {course.description && (
          <View style={[styles.descSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {course.description}
            </Text>
          </View>
        )}

        <View style={[styles.tabBar, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Feather
                name={tab.icon}
                size={14}
                color={activeTab === tab.key ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.key ? colors.primary : colors.mutedForeground },
                ]}
              >
                {tab.label} ({tab.count})
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.contentList}>
          {activeTab === "videos" &&
            (videos && videos.length > 0 ? (
              videos.map((video, idx) => (
                <Pressable
                  key={video.id}
                  style={[styles.contentItem, { borderColor: colors.border, backgroundColor: colors.card }]}
                  onPress={() => router.push(`/video/${video.id}` as never)}
                >
                  <View style={[styles.itemNum, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.itemNumText, { color: colors.primary }]}>{idx + 1}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>
                      {video.title}
                    </Text>
                    {video.duration && (
                      <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>
                        {video.duration}
                      </Text>
                    )}
                  </View>
                  {video.isFree ? (
                    <Text style={{ color: "#22c55e", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>FREE</Text>
                  ) : (
                    <Feather name="play-circle" size={20} color={colors.primary} />
                  )}
                </Pressable>
              ))
            ) : (
              <Text style={[styles.emptyMsg, { color: colors.mutedForeground }]}>
                No videos available yet
              </Text>
            ))}

          {activeTab === "pdfs" &&
            (pdfs && pdfs.length > 0 ? (
              pdfs.map((pdf) => (
                <View
                  key={pdf.id}
                  style={[styles.contentItem, { borderColor: colors.border, backgroundColor: colors.card }]}
                >
                  <View style={[styles.fileIcon, { backgroundColor: "#ef444422" }]}>
                    <Feather name="file-text" size={18} color="#ef4444" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>
                      {pdf.title}
                    </Text>
                    {pdf.description && (
                      <Text style={[styles.itemMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {pdf.description}
                      </Text>
                    )}
                  </View>
                  {pdf.isFree && (
                    <Text style={{ color: "#22c55e", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>FREE</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={[styles.emptyMsg, { color: colors.mutedForeground }]}>
                No PDFs available yet
              </Text>
            ))}

          {activeTab === "dpps" &&
            (dpps && dpps.length > 0 ? (
              dpps.map((dpp) => (
                <View
                  key={dpp.id}
                  style={[styles.contentItem, { borderColor: colors.border, backgroundColor: colors.card }]}
                >
                  <View style={[styles.fileIcon, { backgroundColor: "#7c6ef022" }]}>
                    <Feather name="edit-3" size={18} color="#7c6ef0" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>
                      {dpp.title}
                    </Text>
                    {dpp.description && (
                      <Text style={[styles.itemMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {dpp.description}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyMsg, { color: colors.mutedForeground }]}>
                No DPPs available yet
              </Text>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

function MetaItem({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon} size={12} color="rgba(255,255,255,0.6)" />
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroContent: { gap: 8 },
  badges: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  courseTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "white",
    lineHeight: 30,
  },
  instructor: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaLabel: { fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular" },
  enrollSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  priceBlock: { gap: 4 },
  freeText: { fontSize: 22, fontFamily: "Inter_700Bold" },
  priceText: { fontSize: 26, fontFamily: "Inter_700Bold" },
  enrolledBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  enrolledText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  enrollBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  enrollBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  descSection: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  contentList: { padding: 16, gap: 8 },
  contentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemNum: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  itemNumText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { flex: 1, gap: 2 },
  itemTitle: { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },
  itemMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  emptyMsg: { textAlign: "center", padding: 20, fontSize: 14, fontFamily: "Inter_400Regular" },
});
