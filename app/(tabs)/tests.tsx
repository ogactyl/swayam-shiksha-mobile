import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { TestSeriesCard } from "@/components/TestSeriesCard";
import { useColors } from "@/hooks/useColors";
import { useListCategories, useListTestSeries } from "@/api/client";

export default function TestsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [selectedCat, setSelectedCat] = useState<number | null>(
    params.categoryId ? parseInt(params.categoryId) : null,
  );

  const { data: categories } = useListCategories();
  const { data: tests, isLoading, refetch } = useListTestSeries(
    selectedCat ? { categoryId: selectedCat } : {},
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Test Series</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Practice with MCQ tests for JEE, NEET &amp; UPSC
        </Text>

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
      ) : !tests || tests.length === 0 ? (
        <EmptyState icon="check-square" title="No tests found" subtitle="More test series coming soon!" />
      ) : (
        <FlatList
          data={tests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TestSeriesCard test={item} />}
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
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  filterList: {
    paddingVertical: 8,
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
