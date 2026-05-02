import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CourseCard } from "@/components/CourseCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useListCategories, useListCourses } from "@/api/client";

export default function CoursesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId?: string }>();

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(
    params.categoryId ? parseInt(params.categoryId) : null,
  );

  const { data: categories } = useListCategories();
  const { data: courses, isLoading, refetch } = useListCourses(
    selectedCat ? { categoryId: selectedCat } : {},
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    if (!courses) return [];
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q) ||
        c.categoryName.toLowerCase().includes(q),
    );
  }, [courses, search]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.background, paddingTop: topPadding + 12 },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Courses</Text>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search courses..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Feather
              name="x"
              size={16}
              color={colors.mutedForeground}
              onPress={() => setSearch("")}
            />
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          <FilterChip
            label="All"
            active={selectedCat === null}
            onPress={() => setSelectedCat(null)}
          />
          {categories?.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.name}
              active={selectedCat === cat.id}
              onPress={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
              color={cat.color}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading && !refreshing ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="book"
          title="No courses found"
          subtitle={search ? "Try a different search term" : "Check back soon!"}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <CourseCard course={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  color,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  color?: string;
}) {
  const colors = useColors();
  const activeColor = color || colors.primary;
  return (
    <Text
      style={[
        styles.chip,
        {
          backgroundColor: active ? activeColor + "22" : colors.card,
          color: active ? activeColor : colors.mutedForeground,
          borderColor: active ? activeColor + "55" : colors.border,
        },
      ]}
      onPress={onPress}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  filterList: {
    paddingBottom: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    borderWidth: 1,
    marginRight: 0,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
});
