import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  courseCount: number;
}

export function CategoryCard({ category }: { category: Category }) {
  const colors = useColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
      onPress={() =>
        router.push({ pathname: "/courses", params: { categoryId: category.id } } as never)
      }
    >
      <View
        style={[styles.iconCircle, { backgroundColor: category.color + "22" }]}
      >
        <Feather name="book" size={20} color={category.color} />
      </View>
      <Text
        style={[styles.name, { color: colors.foreground }]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
      <Text style={[styles.count, { color: colors.mutedForeground }]}>
        {category.courseCount} courses
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    marginRight: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  count: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
