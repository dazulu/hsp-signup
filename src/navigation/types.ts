export type TabParamList = {
  Club: undefined;
  Book: undefined;
  Training: undefined;
  Photos: undefined;
  Settings: undefined;
};

export type ClubStackParamList = {
  Club: undefined;
  UpcomingEvents: undefined;
};

export type TrainingStackParamList = {
  Training: undefined;
  TrainingInfo: undefined;
};

export type PhotosStackParamList = {
  Photos: undefined;
  GalleryDetail: { galleryId: string; galleryTitle: string };
};
