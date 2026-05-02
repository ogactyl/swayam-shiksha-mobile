import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface TestSeries {
  id: number;
  title: string;
  description?: string | null;
  totalQuestions: number;
  duration: number;
  isFree: boolean;
  price: number;
  categoryId: number;
}

export function TestSeriesCard({ test }: { test: TestSeries }) {
  const colors = useColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={() => router.push(`/test/${test.id}` as never)}
    >
      <LinearGradient
        colors={["#0f0e1a", "#1e1b35"]}
        style={styles.iconArea}
      >
        <Feather name="check-square" size={24} color="#7c6ef0" />
      </LinearGradient>

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {test.title}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Feather name="help-circle" size={12} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              {test.totalQuestions} Qs
            </Text>
          </View>
          <View style={styles.stat}>
            <Feather name="clock" size={12} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              {test.duration} min
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          {test.isFree ? (
            <Text style={[styles.freeLabel, { color: "#22c55e" }]}>FREE</Text>
          ) : (
            <Text style={[styles.price, { color: colors.primary }]}>
              ₹{test.price.toLocaleString("en-IN")}
            </Text>
          )}
          <View style={[styles.startBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.startBtnText}>Start</Text>
            <Feather name="arrow-right" size={12} color="white" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  iconArea: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
  },
  stats: {
    flexDirection: "row",
    gap: 14,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  startBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "white",
  },
});
