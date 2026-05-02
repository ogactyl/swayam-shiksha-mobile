import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Course {
  id: number;
  title: string;
  categoryName: string;
  price: number;
  isFree: boolean;
  level: string;
  language: string;
  totalVideos: number;
  totalPdfs: number;
  enrollmentCount: number;
  instructorName: string;
  thumbnailUrl?: string | null;
}

interface CourseCardProps {
  course: Course;
  horizontal?: boolean;
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#22c55e",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

export function CourseCard({ course, horizontal }: CourseCardProps) {
  const colors = useColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        horizontal && styles.horizontal,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={() => router.push(`/course/${course.id}` as never)}
    >
      <LinearGradient
        colors={["#4f3df5", "#7c6ef0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.thumbnail, horizontal && styles.thumbnailHorizontal]}
      >
        <Feather name="book-open" size={28} color="rgba(255,255,255,0.8)" />
      </LinearGradient>

      <View style={[styles.info, horizontal && styles.infoHorizontal]}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.badgeText, { color: colors.secondaryForeground }]}>
              {course.categoryName}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: LEVEL_COLORS[course.level] + "22" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: LEVEL_COLORS[course.level] || colors.primary },
              ]}
            >
              {course.level}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {course.title}
        </Text>

        <Text style={[styles.instructor, { color: colors.mutedForeground }]}>
          {course.instructorName}
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Feather name="play-circle" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {course.totalVideos} videos
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="users" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {course.enrollmentCount}
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          {course.isFree ? (
            <Text style={[styles.freeLabel, { color: "#22c55e" }]}>FREE</Text>
          ) : (
            <Text style={[styles.price, { color: colors.primary }]}>
              ₹{course.price.toLocaleString("en-IN")}
            </Text>
          )}
          <Feather name="chevron-right" size={16} color={colors.primary} />
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
  horizontal: {
    flexDirection: "row",
    width: 260,
    marginRight: 12,
    marginBottom: 0,
  },
  thumbnail: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailHorizontal: {
    width: 90,
    height: "auto",
    minHeight: 110,
  },
  info: {
    padding: 12,
    gap: 6,
  },
  infoHorizontal: {
    flex: 1,
    padding: 10,
    gap: 4,
  },
  badges: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textTransform: "capitalize",
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
  meta: {
    flexDirection: "row",
    gap: 12,
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
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  freeLabel: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
