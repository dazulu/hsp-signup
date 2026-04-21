export type TabParamList = {
  Club: undefined;
  Book: undefined;
  Training: undefined;
  Photos: undefined;
  Learn: undefined;
  Settings: undefined;
};

export type ClubStackParamList = {
  ClubHome: undefined;
  UpcomingEvents: undefined;
};

export type TrainingStackParamList = {
  TrainingHome: undefined;
  TrainingInfo: undefined;
};

import type { LearnSport } from "../screens/learn/content/types";

export type PhotosStackParamList = {
  PhotosHome: undefined;
  GalleryDetail: { galleryId: string; galleryTitle: string };
};

export type LearnStackParamList = {
  LearnHome: undefined;
  SportDetail: { sport: LearnSport };
};
