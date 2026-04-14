"use client";

import React, { useState } from "react";
import { Download, FileText, Loader2, Settings } from "lucide-react";
import {
  createA4Pdf,
  downloadBlankTemplatePdf,
  loadImageAsDataUrl,
  registerAnekMalayalamFont,
} from "./pdfUtils";

interface NoticePersonData {
  name: string;
  fatherName: string;
  homeName: string;
  homeAddress: string;
  placeAndPincode: string;
  jamaathName: string;
}

interface MarriageNoticeData {
  groom: NoticePersonData;
  bride: NoticePersonData;
  nikahDate: string;
  nikahTime: string;
  nikahVenue: string;
}

const demoPerson = (type: "groom" | "bride"): NoticePersonData =>
  type === "groom"
    ? {
        name: "മുഹമ്മദ് ഷമീർ",
        fatherName: "അബ്ദുറഹ്മാൻ",
        homeName: "റഹ്മത്ത് മൻസിൽ",
        homeAddress: "പെരുങ്ങുഴി പി.ഒ, തിരുവനന്തപുരം",
        placeAndPincode: "ആഴൂർ, 695305",
        jamaathName: "പെരുങ്ങുഴി മുസ്ലിം ജമാഅത്ത്",
      }
    : {
        name: "ആയിഷ ബീവി",
        fatherName: "അബ്ദുൽ കരീം",
        homeName: "മന്നത്ത് വീട്",
        homeAddress: "കാരിച്ചറ പി.ഒ, തിരുവനന്തപുരം",
        placeAndPincode: "കണിയാപുരം, 695310",
        jamaathName: "കാരിച്ചാറ മുസ്ലിം ജമാഅത്ത്",
      };

function PersonForm({
  title,
  value,
  onChange,
}: {
  title: string;
  value: NoticePersonData;
  onChange: (field: keyof NoticePersonData, value: string) => void;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 font-anek">
      <h3 className="font-bold text-slate-800">{title}</h3>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          പേര്
        </label>
        <input
          value={value.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          പിതാവിന്റെ പേര്
        </label>
        <input
          value={value.fatherName}
          onChange={(e) => onChange("fatherName", e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          വീട്ടുപേര്
        </label>
        <input
          value={value.homeName}
          onChange={(e) => onChange("homeName", e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          വീട്ടുവിലാസം
        </label>
        <input
          value={value.homeAddress}
          onChange={(e) => onChange("homeAddress", e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          സ്ഥലം & പിൻകോഡ്
        </label>
        <input
          value={value.placeAndPincode}
          onChange={(e) => onChange("placeAndPincode", e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          ജമാഅത്ത് പേര്
        </label>
        <input
          value={value.jamaathName}
          onChange={(e) => onChange("jamaathName", e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
}

const containsMalayalam = (text: string) => /[\u0D00-\u0D7F]/.test(text);

const loadBrowserFont = async (fontName: string, fontUrl: string) => {
  const alreadyLoaded = Array.from(document.fonts).some(
    (font) => font.family === fontName
  );

  if (!alreadyLoaded) {
    const fontFace = new FontFace(fontName, `url(${fontUrl})`);
    await fontFace.load();
    document.fonts.add(fontFace);
  }

  await document.fonts.load(`16px "${fontName}"`);
};

const renderComplexTextToImage = async ({
  text,
  width,
  fontSize = 28,
  fontFamily = "AnekPdfMalayalam",
  color = "#222222",
  fontWeight = "400",
  lineHeight = 1.35,
  textAlign = "left",
}: {
  text: string;
  width: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
}): Promise<{ dataUrl: string; widthPx: number; heightPx: number }> => {
  await loadBrowserFont(fontFamily, "/AnekMalayalam-Variable.ttf");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;

  const lines = (text || "").split("\n");
  const paddingX = 8;
  const paddingY = 6;
  const linePx = fontSize * lineHeight;

  let maxWidth = width;

  for (const line of lines) {
    const measured = ctx.measureText(line).width;
    if (measured > maxWidth) {
      maxWidth = measured;
    }
  }

  canvas.width = Math.ceil(maxWidth + paddingX * 2);
  canvas.height = Math.ceil(lines.length * linePx + paddingY * 2);

  const ctx2 = canvas.getContext("2d");
  if (!ctx2) {
    throw new Error("Canvas context not available");
  }

  ctx2.clearRect(0, 0, canvas.width, canvas.height);
  ctx2.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;
  ctx2.fillStyle = color;
  ctx2.textBaseline = "top";

  lines.forEach((line, index) => {
    let x = paddingX;

    if (textAlign === "center") {
      const lineWidth = ctx2.measureText(line).width;
      x = (canvas.width - lineWidth) / 2;
    } else if (textAlign === "right") {
      const lineWidth = ctx2.measureText(line).width;
      x = canvas.width - paddingX - lineWidth;
    }

    const y = paddingY + index * linePx;
    ctx2.fillText(line, x, y);
  });

  return {
    dataUrl: canvas.toDataURL("image/png"),
    widthPx: canvas.width,
    heightPx: canvas.height,
  };
};

export default function MarriageNoticePanel() {
  const [data, setData] = useState<MarriageNoticeData>({
    groom: demoPerson("groom"),
    bride: demoPerson("bride"),
    nikahDate: "20/12/2025",
    nikahTime: "02:30 PM",
    nikahVenue: "സഫാ ഓഡിറ്റോറിയം, കല്ലമ്പലം",
  });

  const [isGeneratingFilledPdf, setIsGeneratingFilledPdf] = useState(false);
  const [isDownloadingBlankPdf, setIsDownloadingBlankPdf] = useState(false);

  const updatePerson = (
    person: "groom" | "bride",
    field: keyof NoticePersonData,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [person]: {
        ...prev[person],
        [field]: value,
      },
    }));
  };

  const getTemplatePath = () => "/mr-notice.jpeg";

  const generateFilledPdf = async () => {
    setIsGeneratingFilledPdf(true);

    try {
      const pdf = createA4Pdf("landscape");
      const pageWidth = 297;
      const pageHeight = 210;

      const templateDataUrl = await loadImageAsDataUrl(getTemplatePath());
      await registerAnekMalayalamFont(pdf);

      pdf.addImage(
        templateDataUrl,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST"
      );

      pdf.setTextColor(25, 25, 25);

      const drawPdfText = (
  text: string,
  x: number,
  y: number,
  fontSize: number,
  options?: {
    align?: "left" | "center" | "right";
    bold?: boolean;
    maxWidth?: number;
  }
) => {
  pdf.setFont("AnekMalayalam", options?.bold ? "bold" : "normal");
  pdf.setFontSize(fontSize);

  if (options?.maxWidth) {
    const lines = pdf.splitTextToSize(text || "", options.maxWidth);
    pdf.text(lines, x, y, {
      align: options?.align || "left",
      baseline: "alphabetic",
    });
  } else {
    pdf.text(text || "", x, y, {
      align: options?.align || "left",
      baseline: "alphabetic",
    });
  }
};

const drawHybridText = async ({
  text,
  x,
  y,
  fontSize,
  maxWidth,
  bold = false,
  align = "left",
  imageFontPx,
}: {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  maxWidth?: number;
  bold?: boolean;
  align?: "left" | "center" | "right";
  imageFontPx?: number;
}) => {
  const safeText = text || "";

  if (!safeText.trim()) return;

  if (!containsMalayalam(safeText)) {
    drawPdfText(safeText, x, y, fontSize, {
      maxWidth,
      bold,
      align,
    });
    return;
  }

  const pxPerMm = 3.78;
  const widthMm = maxWidth || 60;
  const renderWidthPx = widthMm * pxPerMm;

  const { dataUrl, heightPx } = await renderComplexTextToImage({
    text: safeText,
    width: renderWidthPx,
    fontSize: imageFontPx || Math.max(18, fontSize * 1.7),
    fontWeight: bold ? "700" : "400",
    textAlign: align,
  });

  const heightMm = heightPx / pxPerMm;

  let drawX = x;
  if (align === "center" && maxWidth) {
    drawX = x - maxWidth / 2;
  } else if (align === "right" && maxWidth) {
    drawX = x - maxWidth;
  }

  pdf.addImage(
    dataUrl,
    "PNG",
    drawX,
    y - 4,
    widthMm,
    heightMm,
    undefined,
    "FAST"
  );
};

      // Groom side
      await drawHybridText({text: data.groom.name, x: 30, y: 78, fontSize: 12, maxWidth: 60, imageFontPx: 20,});
      await drawHybridText({text: data.groom.fatherName, x: 68, y: 90, fontSize: 12, maxWidth: 55 });
      await drawHybridText({text: data.groom.homeName, x: 58, y: 101, fontSize: 12, maxWidth: 55 });
      await drawHybridText({text: data.groom.homeAddress, x: 51, y: 107, fontSize: 12, maxWidth: 105 });
      await drawHybridText({text: data.groom.placeAndPincode, x: 51, y: 113, fontSize: 12, maxWidth: 105 });
      await drawHybridText({text: data.groom.jamaathName, x: 28, y: 159, fontSize: 12, maxWidth: 95 });

      // Bride side
      await drawHybridText({text: data.bride.name, x: 170, y: 78, fontSize: 12, maxWidth: 60, imageFontPx: 20,});
      await drawHybridText({text: data.bride.fatherName, x: 208, y: 90, fontSize: 12, maxWidth: 55 });
      await drawHybridText({text: data.bride.homeName, x: 198, y: 101, fontSize: 12, maxWidth: 55 });
      await drawHybridText({text: data.bride.homeAddress, x: 190, y: 107, fontSize: 12, maxWidth: 105 });
      await drawHybridText({text: data.bride.placeAndPincode, x: 190, y: 113, fontSize: 12, maxWidth: 105 });
      await drawHybridText({text: data.bride.jamaathName, x: 169, y: 159, fontSize: 12, maxWidth: 95 });

      // Bottom nikah details
      await drawHybridText({text: data.nikahDate, x: 68, y: 189, fontSize: 12, maxWidth: 55 });
      await drawHybridText({text: data.nikahTime, x: 200, y: 189, fontSize: 12, maxWidth: 40 });
      await drawHybridText({text: data.nikahVenue, x: 81, y: 195, fontSize: 12, maxWidth: 200 });

      pdf.save("Marriage_Notice.pdf");
    } catch (error) {
      console.error(error);
      alert("Failed to generate marriage notice PDF.");
    } finally {
      setIsGeneratingFilledPdf(false);
    }
  };

  const downloadBlankPdf = async () => {
    setIsDownloadingBlankPdf(true);

    try {
      await downloadBlankTemplatePdf({
        templatePath: getTemplatePath(),
        fileName: "Marriage_Notice_Blank.pdf",
        orientation: "landscape",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to download blank PDF.");
    } finally {
      setIsDownloadingBlankPdf(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start font-anek">
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Settings className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">
              Marriage Notice Details
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            Fill groom, bride and nikah details to generate the marriage notice.
          </p>
        </div>

        <PersonForm
          title="വരൻ വിവരങ്ങൾ"
          value={data.groom}
          onChange={(field, value) => updatePerson("groom", field, value)}
        />

        <PersonForm
          title="വധു വിവരങ്ങൾ"
          value={data.bride}
          onChange={(field, value) => updatePerson("bride", field, value)}
        />

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800">നിക്കാഹ് വിവരങ്ങൾ</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                നിക്കാഹ് തീയതി
              </label>
              <input
                value={data.nikahDate}
                onChange={(e) =>
                  setData({ ...data, nikahDate: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                നിക്കാഹ് സമയം
              </label>
              <input
                value={data.nikahTime}
                onChange={(e) =>
                  setData({ ...data, nikahTime: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              നിക്കാഹ് സ്ഥലം
            </label>
            <input
              value={data.nikahVenue}
              onChange={(e) =>
                setData({ ...data, nikahVenue: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={generateFilledPdf}
            disabled={isGeneratingFilledPdf || isDownloadingBlankPdf}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isGeneratingFilledPdf ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Filled PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Filled PDF
              </>
            )}
          </button>

          <button
            type="button"
            onClick={downloadBlankPdf}
            disabled={isGeneratingFilledPdf || isDownloadingBlankPdf}
            className="w-full bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-900 border border-slate-300 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isDownloadingBlankPdf ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Downloading Blank PDF...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Download Blank PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="xl:col-span-7 sticky top-24">
        <div className="bg-slate-200/50 p-4 md:p-8 rounded-2xl border border-slate-300 flex items-center justify-center overflow-auto">
          <div className="w-full">
            <div
              className="relative w-full aspect-[297/210] bg-cover bg-center bg-no-repeat shadow-2xl bg-white text-slate-900"
              style={{
                backgroundImage: `url('${getTemplatePath()}')`,
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
                containerType: "inline-size",
              }}
            >
              {/* Groom */}
              <div
                className="absolute font-anek"
                style={{ top: "35%", left: "13%", fontSize: "1.85cqw", maxWidth: "39%" }}
              >
                {data.groom.name}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "41%", left: "25%", fontSize: "1.75cqw", maxWidth: "33%" }}
              >
                {data.groom.fatherName}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "46%", left: "25%", fontSize: "1.75cqw", maxWidth: "33%" }}
              >
                {data.groom.homeName}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "49%", left: "11.8%", fontSize: "1.75cqw", maxWidth: "38%" }}
              >
                {data.groom.homeAddress}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "52%", left: "11.8%", fontSize: "1.75cqw", maxWidth: "38%" }}
              >
                {data.groom.placeAndPincode}
              </div>
              <div
                className="absolute font-anek text-emerald-700 font-semibold"
                style={{ top: "73.7%", left: "10.5%", fontSize: "1.85cqw", maxWidth: "36%" }}
              >
                {data.groom.jamaathName}
              </div>

              {/* Bride */}
              <div
                className="absolute font-anek"
                style={{ top: "35%", left: "59%", fontSize: "1.85cqw", maxWidth: "39%" }}
              >
                {data.bride.name}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "41%", left: "72%", fontSize: "1.75cqw", maxWidth: "33%" }}
              >
                {data.bride.fatherName}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "46%", left: "72%", fontSize: "1.75cqw", maxWidth: "33%" }}
              >
                {data.bride.homeName}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "49%", left: "57%", fontSize: "1.75cqw", maxWidth: "38%" }}
              >
                {data.bride.homeAddress}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "52%", left: "57%", fontSize: "1.75cqw", maxWidth: "38%" }}
              >
                {data.bride.placeAndPincode}
              </div>
              <div
                className="absolute font-anek text-emerald-700 font-semibold"
                style={{ top: "73.7%", left: "55.5%", fontSize: "1.85cqw", maxWidth: "36%" }}
              >
                {data.bride.jamaathName}
              </div>

              {/* Bottom details */}
              <div
                className="absolute font-anek"
                style={{ top: "87.5%", left: "24%", fontSize: "1.8cqw" }}
              >
                {data.nikahDate}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "87.5%", left: "68%", fontSize: "1.8cqw" }}
              >
                {data.nikahTime}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "91%", left: "29%", fontSize: "1.8cqw", maxWidth: "65%" }}
              >
                {data.nikahVenue}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}