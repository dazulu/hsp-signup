import type { EventsData } from "../services/contentful";

export type TabParamList = {
  Club: undefined;
  Book: undefined;
  Photos: undefined;
  UpcomingEvents: { events?: EventsData } | undefined;
  Settings: undefined;
};
