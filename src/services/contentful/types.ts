export type ContentfulSys = {
  id: string;
  type: string;
};

export type ContentfulEntry<TFields> = {
  sys: ContentfulSys;
  fields: TFields;
};

export type ContentfulCollection<TFields> = {
  items: ContentfulEntry<TFields>[];
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
