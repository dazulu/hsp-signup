import type { EventsData } from "../services/contentful";

export type TabParamList = {
  Club: undefined;
  Book: undefined;
  Training: undefined;
  TrainingInfo: undefined;
  Photos: undefined;
  UpcomingEvents: { events?: EventsData } | undefined;
  Settings: undefined;
};
