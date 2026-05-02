import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryCard } from "@/components/CategoryCard";
import { CourseCard } from "@/components/CourseCard";
import { EmptyState } from "@/components/EmptyState";
import { LiveStreamCard } from "@/components/LiveStreamCard";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import {
  useListCategories,
  useListCourses,
  useListLiveStreams,
} from "@/api/client";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data: categories, isLoading: catLoading, refetch: refetchCat } = useListCategories();
  const { data: featuredCourses, isLoading: coursesLoading, refetch: refetchCourses } =
    useListCourses({ featured: true });
  const { data: liveStreams, isLoading: liveLoading, refetch: refetchLive } = useListLiveStreams();

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCat(), refetchCourses(), refetchLive()]);
    setRefreshing(false);
  };

  const isLoading = catLoading || coursesLoading || liveLoading;
  if (isLoading && !refreshing) return <LoadingState />;

  const liveSteamsNow = liveStreams?.filter((s) => s.status === "live") ?? [];
  const upcomingStreams = liveStreams?.filter((s) => s.status === "scheduled") ?? [];

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#1a1540", colors.background]}
        style={[styles.hero, { paddingTop: topPadding + 20 }]}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroTextBlock}>
            <Text style={[styles.heroGreeting, { color: colors.mutedForeground }]}>
              {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome to"}
            </Text>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              Swayam{"\n"}
              <Text style={{ color: colors.primary }}>Shiksha</Text>
            </Text>
            <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
              JEE · NEET · UPSC Preparation
            </Text>
          </View>
          <Pressable
            style={[styles.searchBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/courses" as never)}
          >
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <Text style={[styles.searchText, { color: colors.mutedForeground }]}>
              Search courses...
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {liveSteamsNow.length > 0 && (
          <View style={[styles.liveAlert, { backgroundColor: "#ef444415", borderColor: "#ef444440" }]}>
            <View style={[styles.liveDot, { backgroundColor: "#ef4444" }]} />
            <Text style={[styles.liveAlertText, { color: "#ef4444" }]}>
              {liveSteamsNow.length} live class{liveSteamsNow.length > 1 ? "es" : ""} happening now!
            </Text>
            <Pressable onPress={() => router.push("/live" as never)}>
              <Text style={[styles.liveJoinText, { color: "#ef4444" }]}>Join →</Text>
            </Pressable>
          </View>
        )}

        <SectionHeader title="Categories" onSeeAll={() => router.push("/courses" as never)} />
        {categories && categories.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </ScrollView>
        ) : (
          <EmptyState icon="grid" title="No categories yet" />
        )}

        <SectionHeader
          title="Featured Courses"
          onSeeAll={() => router.push("/courses" as never)}
        />
        {featuredCourses && featuredCourses.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} horizontal />
            ))}
          </ScrollView>
        ) : (
          <EmptyState icon="book" title="No featured courses" />
        )}

        {(liveSteamsNow.length > 0 || upcomingStreams.length > 0) && (
          <>
            <SectionHeader title="Live & Upcoming" onSeeAll={() => router.push("/live" as never)} />
            {[...liveSteamsNow, ...upcomingStreams].slice(0, 3).map((stream) => (
              <LiveStreamCard key={stream.id} stream={stream} />
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <Pressable onPress={onSeeAll}>
        <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingBottom: 28,
  },
  heroContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  heroTextBlock: {
    gap: 4,
  },
  heroGreeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    lineHeight: 40,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  content: {
    padding: 16,
    gap: 4,
  },
  liveAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveAlertText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  liveJoinText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  horizontalList: {
    paddingBottom: 8,
  },
});
