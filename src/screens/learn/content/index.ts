import type { LearnSport, SportContent } from "./types";

export const LEARN_CONTENT: Record<LearnSport, SportContent> = {
  hurling: {
    taglineKey: "learn.hurling.tagline",
    hubImage: {
      uri: "https://placehold.co/600x300/e8ecf4/4b5a8c?text=Hurling",
    },
    history: {
      introKey: "learn.hurling.history.intro",
      bodyKey: "learn.hurling.history.body",
      stats: [
        {
          labelKey: "learn.hurling.history.stat1.label",
          valueKey: "learn.hurling.history.stat1.value",
          icon: "hourglass-outline",
        },
        {
          labelKey: "learn.hurling.history.stat2.label",
          valueKey: "learn.hurling.history.stat2.value",
          icon: "people-outline",
        },
        {
          labelKey: "learn.hurling.history.stat3.label",
          valueKey: "learn.hurling.history.stat3.value",
          icon: "calendar-outline",
        },
      ],
    },
    rules: {
      scoringKey: "learn.hurling.rules.scoring",
      rulesUrl: "https://www.gaa.ie/article/gaa-official-guides-codes",
      ruleKeys: [
        "learn.hurling.rules.rule1",
        "learn.hurling.rules.rule2",
        "learn.hurling.rules.rule3",
        "learn.hurling.rules.rule4",
        "learn.hurling.rules.rule5",
        "learn.hurling.rules.rule6",
        "learn.hurling.rules.rule7",
      ],
    },
    equipment: [
      {
        nameKey: "learn.hurling.equipment.hurley.name",
        descriptionKey: "learn.hurling.equipment.hurley.description",
        placeholderUrl:
          "https://placehold.co/160x160/e8ecf4/4b5a8c?text=Hurley",
      },
      {
        nameKey: "learn.hurling.equipment.sliotar.name",
        descriptionKey: "learn.hurling.equipment.sliotar.description",
        placeholderUrl:
          "https://placehold.co/160x160/e8ecf4/4b5a8c?text=Sliotar",
      },
      {
        nameKey: "learn.hurling.equipment.helmet.name",
        descriptionKey: "learn.hurling.equipment.helmet.description",
        placeholderUrl:
          "https://placehold.co/160x160/e8ecf4/4b5a8c?text=Helmet",
      },
    ],
    drills: [
      {
        titleKey: "learn.hurling.drills.wallball.title",
        descriptionKey: "learn.hurling.drills.wallball.description",
        steps: [
          { stepKey: "learn.hurling.drills.wallball.step1" },
          { stepKey: "learn.hurling.drills.wallball.step2" },
          { stepKey: "learn.hurling.drills.wallball.step3" },
          { stepKey: "learn.hurling.drills.wallball.step4" },
        ],
      },
      {
        titleKey: "learn.hurling.drills.solo.title",
        descriptionKey: "learn.hurling.drills.solo.description",
        steps: [
          { stepKey: "learn.hurling.drills.solo.step1" },
          { stepKey: "learn.hurling.drills.solo.step2" },
          { stepKey: "learn.hurling.drills.solo.step3" },
        ],
      },
      {
        titleKey: "learn.hurling.drills.striking.title",
        descriptionKey: "learn.hurling.drills.striking.description",
        steps: [
          { stepKey: "learn.hurling.drills.striking.step1" },
          { stepKey: "learn.hurling.drills.striking.step2" },
          { stepKey: "learn.hurling.drills.striking.step3" },
          { stepKey: "learn.hurling.drills.striking.step4" },
        ],
      },
      {
        titleKey: "learn.hurling.drills.groundstrike.title",
        descriptionKey: "learn.hurling.drills.groundstrike.description",
        steps: [
          { stepKey: "learn.hurling.drills.groundstrike.step1" },
          { stepKey: "learn.hurling.drills.groundstrike.step2" },
          { stepKey: "learn.hurling.drills.groundstrike.step3" },
        ],
      },
    ],
  },

  camogie: {
    taglineKey: "learn.camogie.tagline",
    hubImage: {
      uri: "https://placehold.co/600x300/e8ecf4/4b5a8c?text=Camogie",
    },
    history: {
      introKey: "learn.camogie.history.intro",
      bodyKey: "learn.camogie.history.body",
      stats: [
        {
          labelKey: "learn.camogie.history.stat1.label",
          valueKey: "learn.camogie.history.stat1.value",
          icon: "trophy-outline",
        },
        {
          labelKey: "learn.camogie.history.stat2.label",
          valueKey: "learn.camogie.history.stat2.value",
          icon: "people-outline",
        },
        {
          labelKey: "learn.camogie.history.stat3.label",
          valueKey: "learn.camogie.history.stat3.value",
          icon: "calendar-outline",
        },
      ],
    },
    rules: {
      scoringKey: "learn.camogie.rules.scoring",
      rulesUrl:
        "https://camogie.ie/administration/official-rules/official-playing-rules/",
      ruleKeys: [
        "learn.camogie.rules.rule1",
        "learn.camogie.rules.rule2",
        "learn.camogie.rules.rule3",
        "learn.camogie.rules.rule4",
        "learn.camogie.rules.rule5",
        "learn.camogie.rules.rule6",
        "learn.camogie.rules.rule7",
      ],
    },
    equipment: [
      {
        nameKey: "learn.camogie.equipment.hurley.name",
        descriptionKey: "learn.camogie.equipment.hurley.description",
        placeholderUrl:
          "https://placehold.co/160x160/e8ecf4/4b5a8c?text=Hurley",
      },
      {
        nameKey: "learn.camogie.equipment.sliotar.name",
        descriptionKey: "learn.camogie.equipment.sliotar.description",
        placeholderUrl:
          "https://placehold.co/160x160/e8ecf4/4b5a8c?text=Sliotar",
      },
      {
        nameKey: "learn.camogie.equipment.helmet.name",
        descriptionKey: "learn.camogie.equipment.helmet.description",
        placeholderUrl:
          "https://placehold.co/160x160/e8ecf4/4b5a8c?text=Helmet",
      },
    ],
    drills: [
      {
        titleKey: "learn.camogie.drills.wallball.title",
        descriptionKey: "learn.camogie.drills.wallball.description",
        steps: [
          { stepKey: "learn.camogie.drills.wallball.step1" },
          { stepKey: "learn.camogie.drills.wallball.step2" },
          { stepKey: "learn.camogie.drills.wallball.step3" },
          { stepKey: "learn.camogie.drills.wallball.step4" },
        ],
      },
      {
        titleKey: "learn.camogie.drills.solo.title",
        descriptionKey: "learn.camogie.drills.solo.description",
        steps: [
          { stepKey: "learn.camogie.drills.solo.step1" },
          { stepKey: "learn.camogie.drills.solo.step2" },
          { stepKey: "learn.camogie.drills.solo.step3" },
        ],
      },
      {
        titleKey: "learn.camogie.drills.striking.title",
        descriptionKey: "learn.camogie.drills.striking.description",
        steps: [
          { stepKey: "learn.camogie.drills.striking.step1" },
          { stepKey: "learn.camogie.drills.striking.step2" },
          { stepKey: "learn.camogie.drills.striking.step3" },
          { stepKey: "learn.camogie.drills.striking.step4" },
        ],
      },
    ],
  },

  football: {
    taglineKey: "learn.football.tagline",
    hubImage: {
      uri: "https://placehold.co/600x300/e8ecf4/4b5a8c?text=Football",
    },
    history: {
      introKey: "learn.football.history.intro",
      bodyKey: "learn.football.history.body",
      stats: [
        {
          labelKey: "learn.football.history.stat1.label",
          valueKey: "learn.football.history.stat1.value",
          icon: "trophy-outline",
        },
        {
          labelKey: "learn.football.history.stat2.label",
          valueKey: "learn.football.history.stat2.value",
          icon: "people-outline",
        },
        {
          labelKey: "learn.football.history.stat3.label",
          valueKey: "learn.football.history.stat3.value",
          icon: "calendar-outline",
        },
      ],
    },
    rules: {
      scoringKey: "learn.football.rules.scoring",
      rulesUrl: "https://www.gaa.ie/article/gaa-official-guides-codes",
      ruleKeys: [
        "learn.football.rules.rule1",
        "learn.football.rules.rule2",
        "learn.football.rules.rule3",
        "learn.football.rules.rule4",
        "learn.football.rules.rule5",
        "learn.football.rules.rule6",
        "learn.football.rules.rule7",
        "learn.football.rules.rule8",
      ],
    },
    equipment: [
      {
        nameKey: "learn.football.equipment.ball.name",
        descriptionKey: "learn.football.equipment.ball.description",
        placeholderUrl: "https://placehold.co/160x160/e8ecf4/4b5a8c?text=Ball",
      },
      {
        nameKey: "learn.football.equipment.gumshield.name",
        descriptionKey: "learn.football.equipment.gumshield.description",
        placeholderUrl:
          "https://placehold.co/160x160/e8ecf4/4b5a8c?text=Gumshield",
      },
    ],
    drills: [
      {
        titleKey: "learn.football.drills.solorun.title",
        descriptionKey: "learn.football.drills.solorun.description",
        steps: [
          { stepKey: "learn.football.drills.solorun.step1" },
          { stepKey: "learn.football.drills.solorun.step2" },
          { stepKey: "learn.football.drills.solorun.step3" },
        ],
      },
      {
        titleKey: "learn.football.drills.kickpass.title",
        descriptionKey: "learn.football.drills.kickpass.description",
        steps: [
          { stepKey: "learn.football.drills.kickpass.step1" },
          { stepKey: "learn.football.drills.kickpass.step2" },
          { stepKey: "learn.football.drills.kickpass.step3" },
          { stepKey: "learn.football.drills.kickpass.step4" },
        ],
      },
      {
        titleKey: "learn.football.drills.handpass.title",
        descriptionKey: "learn.football.drills.handpass.description",
        steps: [
          { stepKey: "learn.football.drills.handpass.step1" },
          { stepKey: "learn.football.drills.handpass.step2" },
          { stepKey: "learn.football.drills.handpass.step3" },
        ],
      },
      {
        titleKey: "learn.football.drills.highcatch.title",
        descriptionKey: "learn.football.drills.highcatch.description",
        steps: [
          { stepKey: "learn.football.drills.highcatch.step1" },
          { stepKey: "learn.football.drills.highcatch.step2" },
          { stepKey: "learn.football.drills.highcatch.step3" },
        ],
      },
    ],
  },
};
