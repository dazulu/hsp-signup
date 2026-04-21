import type { ImageSourcePropType } from "react-native";
import type { SectionKey } from "../../../components/anchor-nav/types";
import type { TranslationKey } from "../../../i18n/types";

export type { SectionKey };

export type LearnSport = "hurling" | "camogie" | "football";

export const LEARN_SPORTS: LearnSport[] = ["hurling", "camogie", "football"];

export const SECTION_KEYS: SectionKey[] = [
  "history",
  "rules",
  "equipment",
  "drills",
];

export const SPORT_NAME_KEYS: Record<LearnSport, TranslationKey> = {
  hurling: "learn.sport.hurling",
  camogie: "learn.sport.camogie",
  football: "learn.sport.football",
};

export type StatItem = {
  labelKey: TranslationKey;
  valueKey: TranslationKey;
  icon: string;
};

export type HistoryContent = {
  introKey: TranslationKey;
  bodyKey: TranslationKey;
  stats: [StatItem, StatItem, StatItem];
};

export type RulesContent = {
  scoringKey: TranslationKey;
  ruleKeys: TranslationKey[];
};

export type EquipmentItem = {
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  placeholderUrl: string;
};

export type DrillStep = {
  stepKey: TranslationKey;
};

export type Drill = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  steps: DrillStep[];
};

export type SportContent = {
  taglineKey: TranslationKey;
  hubImage: ImageSourcePropType;
  history: HistoryContent;
  rules: RulesContent;
  equipment: EquipmentItem[];
  drills: Drill[];
};
