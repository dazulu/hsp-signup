export type TabParamList = {
  Club: undefined;
  Book: undefined;
  Training: undefined;
  Photos: undefined;
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

export type PhotosStackParamList = {
  PhotosHome: undefined;
  GalleryDetail: { galleryId: string; galleryTitle: string };
};
