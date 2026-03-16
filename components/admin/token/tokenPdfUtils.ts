import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface TokenRecord {
  id: string;
  name: string;
  address: string | null;
  pmj_no: number | null;
  source: "members" | "widows";
}

export interface TokenPdfRecord extends TokenRecord {
  token_no: number;
}

export type TokenLayoutOption = "1x15" | "1x8";

export interface TokenLayoutConfig {
  key: TokenLayoutOption;
  label: string;
  cols: number;
  rows: number;
  perPage: number;
}

export const TOKEN_LAYOUTS: Record<TokenLayoutOption, TokenLayoutConfig> = {
  "1x15": {
    key: "1x15",
    label: "1 × 15",
    cols: 3,
    rows: 5,
    perPage: 15,
  },
  "1x8": {
    key: "1x8",
    label: "1 × 8",
    cols: 2,
    rows: 4,
    perPage: 8,
  },
};

export const MASJID_TITLE_ML = "പെരുങ്ങുഴി മുസ്ലിം ജമാഅത്ത് പള്ളി";

export const getListSubtitle = (source: "members" | "widows") =>
  source === "members"
    ? "ജമാഅത്ത് അംഗങ്ങളുടെ ടോക്കൺ ലിസ്റ്റ്"
    : "ജമാഅത്ത് വിധവകളുടെ ടോക്കൺ ലിസ്റ്റ്";

export const getSafeFileName = (value: string) =>
  value.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s+/g, "_");

export const paginateTokenRecords = (
  records: TokenPdfRecord[],
  layoutOption: TokenLayoutOption
) => {
  const perPage = TOKEN_LAYOUTS[layoutOption].perPage;
  const pages: TokenPdfRecord[][] = [];

  for (let i = 0; i < records.length; i += perPage) {
    pages.push(records.slice(i, i + perPage));
  }

  return pages;
};

const estimateRowUnits = (name: string) => {
  const length = (name || "").trim().length;

  if (length <= 26) return 1;
  if (length <= 46) return 1.35;
  if (length <= 70) return 1.7;
  return 2;
};

export const paginateListRecords = (records: TokenPdfRecord[]) => {
  const firstPageCapacity = 20;
  const otherPageCapacity = 24;

  const pages: TokenPdfRecord[][] = [];
  let currentPage: TokenPdfRecord[] = [];
  let currentUsed = 0;
  let capacity = firstPageCapacity;

  for (const record of records) {
    const rowUnits = estimateRowUnits(record.name);

    if (currentUsed + rowUnits > capacity && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentUsed = 0;
      capacity = otherPageCapacity;
    }

    currentPage.push(record);
    currentUsed += rowUnits;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
};

export const ensureMalayalamFontLoaded = async () => {
  if (typeof window === "undefined") return;

  const fontName = "AnekMalayalam";
  const check = document.fonts.check(`16px "${fontName}"`);
  if (!check) {
    const font = new FontFace(
      fontName,
      `url("/AnekMalayalam-Variable.ttf") format("truetype")`,
      {
        weight: "100 900",
        style: "normal",
      }
    );

    await font.load();
    document.fonts.add(font);
  }

  await document.fonts.ready;
};

const waitForImages = async (element: HTMLElement) => {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }

          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        })
    )
  );
};

const renderElementToCanvas = async (element: HTMLElement) => {
  await waitForImages(element);
  await ensureMalayalamFontLoaded();

  return html2canvas(element, {
    scale: Math.max(2, Math.min(3, window.devicePixelRatio || 2)),
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });
};

export const generateTokenPdfFromRenderedPages = async ({
  tokenPageElements,
  listPageElements,
  fileName,
}: {
  tokenPageElements: HTMLElement[];
  listPageElements: HTMLElement[];
  fileName: string;
}) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  let isFirstPage = true;

  const addCanvasPage = async (element: HTMLElement) => {
  const canvas = await renderElementToCanvas(element);
  const imgData = canvas.toDataURL("image/jpeg", 0.96);

  if (!isFirstPage) {
    pdf.addPage();
  }

  pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
  isFirstPage = false;
};

  for (const page of tokenPageElements) {
    await addCanvasPage(page);
  }

  for (let i = 0; i < listPageElements.length; i++) {
  await addCanvasPage(listPageElements[i]);
}

  pdf.save(fileName);
};