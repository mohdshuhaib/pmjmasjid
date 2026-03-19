export type PageSize = "A4" | "A3";
export type Orientation = "portrait" | "landscape";
export type MarginPreset = "narrow" | "standard" | "wide";
export type FontWeightKey = "normal" | "medium" | "semibold" | "bold";
export type FieldKey = "heading" | "details" | "meta" | "confirmedBy";
export type RoleValue = "Secretary" | "President" | "Vice President" | "Joint Secretary" | "Committee";

export interface TypographyConfig {
  size: number;
  weight: FontWeightKey;
  align: "left" | "center" | "right" | "justify";
}

export interface NoticeDesignState {
  heading: string;
  details: string;
  noticeDate: string;
  confirmedBy: RoleValue;
  pageSize: PageSize;
  orientation: Orientation;
  marginPreset: MarginPreset;
  refNumber: string;
  typography: Record<FieldKey, TypographyConfig>;
}