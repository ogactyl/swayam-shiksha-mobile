import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { LoadingState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useGetTestSeries } from "@/api/client";

export default function TestSeriesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const testId = parseInt(id ?? "0");
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: test, isLoading } = useGetTestSeries(testId);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) return <LoadingState />;
  if (!test) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Test not found</Text>
      </View>
    );
  }

  const questions = test.questions ?? [];

  const handleAnswer = (questionId: number, optionIdx: number) => {
    if (submitted) return;
    Haptics.selectionAsync();
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctOption) correct++;
    });
    return correct;
  };

  if (!started) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={["#1a1540", "#0f0e1a"]}
          style={[styles.introHero, { paddingTop: topPadding + 10 }]}
        >
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="white" />
          </Pressable>

          <View style={styles.introContent}>
            <View style={[styles.testIcon, { backgroundColor: "#7c6ef044" }]}>
              <Feather name="check-square" size={36} color="#7c6ef0" />
            </View>
            <Text style={styles.introTitle}>{test.title}</Text>
            {test.description && (
              <Text style={styles.introDesc}>{test.description}</Text>
            )}
          </View>
        </LinearGradient>

        <View style={styles.introStats}>
          <StatBlock icon="help-circle" value={`${test.totalQuestions}`} label="Questions" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatBlock icon="clock" value={`${test.duration}`} label="Minutes" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatBlock
            icon="tag"
            value={test.isFree ? "FREE" : `₹${test.price}`}
            label={test.isFree ? "" : "Price"}
          />
        </View>

        <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.rulesTitle, { color: colors.foreground }]}>Instructions</Text>
          {[
            "Each question has 4 options, select the correct one",
            "You can navigate between questions",
            "Submit when you're ready to see your score",
            "Your answers are saved automatically",
          ].map((rule, idx) => (
            <View key={idx} style={styles.ruleItem}>
              <View style={[styles.ruleDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.ruleText, { color: colors.mutedForeground }]}>{rule}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          onPress={() => setStarted(true)}
        >
          <Text style={styles.startBtnText}>Start Test</Text>
          <Feather name="arrow-right" size={18} color="white" />
        </Pressable>
      </View>
    );
  }

  if (submitted) {
    const score = getScore();
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={passed ? ["#14532d", "#0f0e1a"] : ["#7f1d1d", "#0f0e1a"]}
          style={[styles.resultHero, { paddingTop: topPadding + 30 }]}
        >
          <Feather
            name={passed ? "award" : "frown"}
            size={56}
            color={passed ? "#22c55e" : "#ef4444"}
          />
          <Text style={styles.resultTitle}>{passed ? "Excellent!" : "Keep Practicing!"}</Text>
          <Text style={styles.scoreText}>
            {score} / {questions.length}
          </Text>
          <Text style={styles.percentText}>{pct}%</Text>
        </LinearGradient>

        <ScrollView style={styles.reviewList}>
          <Text style={[styles.reviewLabel, { color: colors.foreground }]}>Answer Review</Text>
          {questions.map((q, idx) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correctOption;
            const options = [q.option1, q.option2, q.option3, q.option4];
            return (
              <View
                key={q.id}
                style={[
                  styles.reviewCard,
                  { backgroundColor: colors.card, borderColor: isCorrect ? "#22c55e44" : "#ef444444" },
                ]}
              >
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewQNum, { color: colors.mutedForeground }]}>Q{idx + 1}</Text>
                  <Feather
                    name={isCorrect ? "check-circle" : "x-circle"}
                    size={16}
                    color={isCorrect ? "#22c55e" : "#ef4444"}
                  />
                </View>
                <Text style={[styles.reviewQ, { color: colors.foreground }]}>{q.question}</Text>
                {options.map((opt, i) => (
                  <View
                    key={i}
                    style={[
                      styles.reviewOption,
                      {
                        backgroundColor:
                          i === q.correctOption
                            ? "#22c55e22"
                            : i === userAns && !isCorrect
                            ? "#ef444422"
                            : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reviewOptionText,
                        {
                          color:
                            i === q.correctOption
                              ? "#22c55e"
                              : i === userAns && !isCorrect
                              ? "#ef4444"
                              : colors.mutedForeground,
                          fontFamily:
                            i === q.correctOption ? "Inter_600SemiBold" : "Inter_400Regular",
                        },
                      ]}
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
          <Pressable
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const question = questions[currentQ];
  const options = question ? [question.option1, question.option2, question.option3, question.option4] : [];
  const answeredCount = Object.keys(answers).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.testHeader, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPadding + 10 }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="x" size={20} color={colors.mutedForeground} />
        </Pressable>
        <Text style={[styles.testProgress, { color: colors.foreground }]}>
          {currentQ + 1} / {questions.length}
        </Text>
        <Text style={[styles.answeredCount, { color: colors.primary }]}>
          {answeredCount} answered
        </Text>
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${((currentQ + 1) / questions.length) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView style={styles.questionArea} showsVerticalScrollIndicator={false}>
        {question && (
          <>
            <Text style={[styles.questionText, { color: colors.foreground }]}>
              {question.question}
            </Text>

            <View style={styles.optionsList}>
              {options.map((opt, idx) => {
                const selected = answers[question.id] === idx;
                return (
                  <Pressable
                    key={idx}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selected ? colors.primary + "22" : colors.card,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleAnswer(question.id, idx)}
                  >
                    <View
                      style={[
                        styles.optionBubble,
                        {
                          backgroundColor: selected ? colors.primary : colors.secondary,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLetter,
                          { color: selected ? "white" : colors.mutedForeground },
                        ]}
                      >
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, { color: colors.foreground }]} numberOfLines={3}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.navBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={[styles.navBtn, { backgroundColor: colors.secondary, opacity: currentQ === 0 ? 0.4 : 1 }]}
          onPress={() => setCurrentQ((p) => Math.max(0, p - 1))}
          disabled={currentQ === 0}
        >
          <Feather name="chevron-left" size={20} color={colors.foreground} />
          <Text style={[styles.navBtnText, { color: colors.foreground }]}>Prev</Text>
        </Pressable>

        {currentQ < questions.length - 1 ? (
          <Pressable
            style={[styles.navBtn, { backgroundColor: colors.primary }]}
            onPress={() => setCurrentQ((p) => p + 1)}
          >
            <Text style={[styles.navBtnText, { color: "white" }]}>Next</Text>
            <Feather name="chevron-right" size={20} color="white" />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.navBtn, { backgroundColor: "#22c55e" }]}
            onPress={handleSubmit}
          >
            <Feather name="check" size={18} color="white" />
            <Text style={[styles.navBtnText, { color: "white" }]}>Submit</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function StatBlock({ icon, value, label }: { icon: keyof typeof Feather.glyphMap; value: string; label: string }) {
  const colors = useColors();
  return (
    <View style={styles.statBlock}>
      <Feather name={icon} size={20} color={colors.primary} />
      <Text style={[styles.statVal, { color: colors.foreground }]}>{value}</Text>
      {label ? <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  introHero: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  introContent: { alignItems: "center", gap: 12 },
  testIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  introTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "white",
    textAlign: "center",
  },
  introDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  introStats: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  statBlock: { flex: 1, alignItems: "center", gap: 4 },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  divider: { width: 1, height: 40 },
  rulesCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginBottom: 20,
  },
  rulesTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  ruleItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  ruleDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  ruleText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
  },
  startBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "white" },
  resultHero: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 16,
    gap: 8,
  },
  resultTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "white", marginTop: 8 },
  scoreText: { fontSize: 32, fontFamily: "Inter_700Bold", color: "white" },
  percentText: { fontSize: 16, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
  reviewList: { padding: 16 },
  reviewLabel: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  reviewCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 12, gap: 8 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between" },
  reviewQNum: { fontSize: 12, fontFamily: "Inter_500Medium" },
  reviewQ: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  reviewOption: { padding: 8, borderRadius: 8 },
  reviewOptionText: { fontSize: 13, lineHeight: 18 },
  doneBtn: {
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  doneBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "white" },
  testHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  testProgress: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  answeredCount: { fontSize: 13, fontFamily: "Inter_500Medium" },
  progressBar: { height: 3 },
  progressFill: { height: 3 },
  questionArea: { padding: 16 },
  questionText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 26,
    marginBottom: 20,
  },
  optionsList: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  optionBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  optionLetter: { fontSize: 14, fontFamily: "Inter_700Bold" },
  optionText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  navBar: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  navBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
