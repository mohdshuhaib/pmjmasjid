import {
  BlankNoticeDesignState,
  NoticeDesignState,
  MarginPreset,
  RoleValue,
  FontWeightKey,
  PageSize,
  Orientation,
} from "./types";

export const FONT_FAMILY = "AnekMalayalam";
export const FONT_URL = "/AnekMalayalam-Variable.ttf";
export const LOGO_URL = "/logo.png";

export const weightMap: Record<FontWeightKey, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const marginPresetMap: Record<MarginPreset, number> = {
  narrow: 28,
  standard: 40,
  wide: 56,
};

export const confirmedByMalayalamMap: Record<RoleValue, string> = {
  Secretary: "സെക്രട്ടറി",
  President: "പ്രസിഡന്റ്",
  "Vice President": "വൈസ് പ്രസിഡന്റ്",
  "Joint Secretary": "ജോയിന്റ് സെക്രട്ടറി",
  Committee: "കമ്മിറ്റി",
};

export const pageDimensionsPx: Record<PageSize, Record<Orientation, { width: number; height: number }>> = {
  A4: {
    portrait: { width: 794, height: 1123 },
    landscape: { width: 1123, height: 794 },
  },
  A3: {
    portrait: { width: 1123, height: 1587 },
    landscape: { width: 1587, height: 1123 },
  },
};

export const defaultDesignState: NoticeDesignState = {
  heading: "പ്രധാന അറിയിപ്പ്",
  details:
    "പ്രിയ ജമാഅത്ത് അംഗങ്ങളേ, പ്രത്യേക യോഗം സംബന്ധിച്ച അറിയിപ്പാണ് ഇത്. ദയവായി നിശ്ചയിച്ച തീയതിയിലും സമയത്തും പങ്കെടുക്കണമെന്ന് അഭ്യർത്ഥിക്കുന്നു.",
  noticeDate: new Date().toISOString().split("T")[0],
  confirmedBy: "Secretary",
  pageSize: "A4",
  orientation: "portrait",
  marginPreset: "standard",
  refNumber: "001",
  typography: {
    heading: { size: 18, weight: "semibold", align: "center" },
    details: { size: 12.5, weight: "normal", align: "justify" },
    meta: { size: 11, weight: "medium", align: "left" },
    confirmedBy: { size: 12, weight: "medium", align: "right" },
  },
};

export const defaultBlankNoticeState: BlankNoticeDesignState = {
  heading: "പ്രധാന അറിയിപ്പ്",
  details: "ഇവിടെ ഉള്ളടക്കം എഴുതാം.",
  noticeDate: new Date().toISOString().split("T")[0],
  confirmedBy: "Secretary",
  pageSize: "A4",
  orientation: "portrait",
  marginPreset: "standard",
  typography: {
    heading: { size: 22, weight: "semibold", align: "center" },
    details: { size: 13, weight: "normal", align: "justify" },
    meta: { size: 11, weight: "medium", align: "left" },
    confirmedBy: { size: 11, weight: "medium", align: "right" },
  },
};