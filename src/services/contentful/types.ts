export type ContentfulSys = {
  id: string;
  type: string;
};

export type ContentfulEntry<TFields> = {
  sys: ContentfulSys;
  fields: TFields;
};

export type ContentfulAssetLink = {
  sys: { type: "Link"; linkType: "Asset"; id: string };
};

export type ContentfulAssetFields = {
  title: string;
  description?: string;
  file: {
    url: string;
    details: { image: { width: number; height: number } };
    contentType: string;
  };
};

export type ContentfulAsset = {
  sys: ContentfulSys;
  fields: ContentfulAssetFields;
};

export type ContentfulIncludes = {
  Asset?: ContentfulAsset[];
  Entry?: ContentfulEntry<Record<string, unknown>>[];
};

export type ContentfulCollection<TFields> = {
  items: ContentfulEntry<TFields>[];
  includes?: ContentfulIncludes;
  total: number;
  skip: number;
  limit: number;
};

export type ContentfulQueryParams = Record<
  string,
  string | number | boolean | undefined
>;

export type RepeatingItemsFields = {
  staticId: string;
  items: unknown;
};

export type ContentfulItem = {
  id: string;
  key: string;
  value: string;
};

export type MobileAppBookingData = {
  notice: string | null;
  hurlingDisabledUntil: string | null;
  gaelicDisabledUntil: string | null;
};

export type MobileAppData = {
  notice: string | null;
  booking?: MobileAppBookingData;
};

export type MobileAppDataFields = {
  staticId: string;
  jsonData: MobileAppData;
};

// --- Gallery types ---

export type GalleryFields = {
  contentfulTitle: string;
  title: string;
  description?: string;
  date: string;
  cover: ContentfulAssetLink;
  items: ContentfulAssetLink[];
};

export type ContentfulImageInfo = {
  id: string;
  url: string;
  width: number;
  height: number;
  title: string;
};

export type Gallery = {
  id: string;
  title: string;
  description?: string;
  date: string;
  year: number;
  cover: ContentfulImageInfo;
  items: ContentfulImageInfo[];
};

// --- Quote types ---

export type ContentfulEntryLink = {
  sys: { type: "Link"; linkType: "Entry"; id: string };
};

export type PersonFields = {
  name: string;
  image: ContentfulAssetLink;
};

export type QuoteFields = {
  quoteText: string;
  person?: ContentfulEntryLink;
};

export type TrainingQuotePerson = {
  name: string;
  imageUrl: string;
};

export type TrainingQuote = {
  quoteText: string;
  person?: TrainingQuotePerson;
};
