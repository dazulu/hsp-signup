import type { TranslationKey } from "../i18n/types";
import type { TabParamList } from "../navigation/types";

export type WhatsNewItem = {
  // Stable kebab-case ID. Currently only used for React keys, but kept stable
  // so per-item tracking can be added later without a migration.
  id: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  // Mark entries added in the current release so the sheet can visually
  // distinguish them from backfilled historical items. Hard-code per release;
  // unset (or false) means backfill/older.
  isNew?: boolean;
  cta?: {
    labelKey: TranslationKey;
    target: keyof TabParamList;
  };
};

// Bump whenever WHATS_NEW_ITEMS changes (added entry, edited copy, reordered).
// Bumping re-shows the dot to every existing user, on both binary releases and
// OTA updates. Use a plain monotonic integer — not semver, not tied to
// app.json version.
export const WHATS_NEW_VERSION = 1;

export const WHATS_NEW_ITEMS: WhatsNewItem[] = [
  // Newest entry first — the sheet renders them in array order.
  {
    id: "reminders",
    titleKey: "whatsNew.reminders.title",
    bodyKey: "whatsNew.reminders.body",
    isNew: true,
    cta: { labelKey: "whatsNew.reminders.cta", target: "Settings" },
  },
  {
    id: "already-booked",
    titleKey: "whatsNew.alreadyBooked.title",
    bodyKey: "whatsNew.alreadyBooked.body",
  },
  {
    id: "hsp-membership",
    titleKey: "whatsNew.hspMembership.title",
    bodyKey: "whatsNew.hspMembership.body",
  },
  {
    id: "strava",
    titleKey: "whatsNew.strava.title",
    bodyKey: "whatsNew.strava.body",
    cta: { labelKey: "whatsNew.strava.cta", target: "Club" },
  },
  {
    id: "learn",
    titleKey: "whatsNew.learn.title",
    bodyKey: "whatsNew.learn.body",
    cta: { labelKey: "whatsNew.learn.cta", target: "Learn" },
  },
  {
    id: "training-info",
    titleKey: "whatsNew.trainingInfo.title",
    bodyKey: "whatsNew.trainingInfo.body",
    cta: { labelKey: "whatsNew.trainingInfo.cta", target: "Training" },
  },
  {
    id: "photo-galleries",
    titleKey: "whatsNew.photoGalleries.title",
    bodyKey: "whatsNew.photoGalleries.body",
    cta: { labelKey: "whatsNew.photoGalleries.cta", target: "Photos" },
  },
];
