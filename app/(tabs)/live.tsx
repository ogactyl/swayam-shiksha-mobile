import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { LiveStreamCard } from "@/components/LiveStreamCard";
import { LoadingState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useListLiveStreams } from "@/api/client";

export default function LiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: streams, isLoading, refetch } = useListLiveStreams();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const liveNow = streams?.filter((s) => s.status === "live") ?? [];
  const scheduled = streams?.filter((s) => s.status === "scheduled") ?? [];
  const ended = streams?.filter((s) => s.status === "ended") ?? [];

  const sections = [
    ...(liveNow.length > 0 ? [{ type: "header", label: "Live Now" }, ...liveNow.map(s => ({ type: "stream", ...s }))] : []),
    ...(scheduled.length > 0 ? [{ type: "header", label: "Upcoming" }, ...scheduled.map(s => ({ type: "stream", ...s }))] : []),
    ...(ended.length > 0 ? [{ type: "header", label: "Ended" }, ...ended.map(s => ({ type: "stream", ...s }))] : []),
  ];

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.background }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Live Classes</Text>
          {liveNow.length > 0 && (
            <View style={[styles.liveBadge, { backgroundColor: "#ef444422" }]}>
              <View style={[styles.liveDot, { backgroundColor: "#ef4444" }]} />
              <Text style={[styles.liveBadgeText, { color: "#ef4444" }]}>
                {liveNow.length} LIVE
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Join live classes from top educators
        </Text>
      </View>

      {isLoading && !refreshing ? (
        <LoadingState />
      ) : sections.length === 0 ? (
        <EmptyState
          icon="video"
          title="No live classes"
          subtitle="Check back soon for upcoming classes"
        />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item, idx) =>
            item.type === "header" ? `header-${idx}` : `stream-${(item as any).id}`
          }
          renderItem={({ item }) => {
            if (item.type === "header") {
              return (
                <View style={styles.sectionHeader}>
                  {item.label === "Live Now" && (
                    <Feather name="radio" size={14} color="#ef4444" style={{ marginRight: 4 }} />
                  )}
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: item.label === "Live Now" ? "#ef4444" : colors.foreground },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              );
            }
            return <LiveStreamCard stream={item as any} />;
          }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  liveBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
