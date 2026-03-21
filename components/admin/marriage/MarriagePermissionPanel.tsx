"use client";

import React, { useMemo, useState } from "react";
import { Download, FileText, Loader2, Settings } from "lucide-react";
import {
  createA4Pdf,
  downloadBlankTemplatePdf,
  loadImageAsDataUrl,
  registerAnekMalayalamFont,
} from "./pdfUtils";

interface PersonBlock {
  name: string;
  age: string;
  job: string;
  fatherName: string;
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  marriageNature: string;
  jamaath1: string;
  jamaath2: string;
  jamaath3: string;
}

interface PermissionData {
  refNo: string;
  issueDate: string;
  toMasjidName: string;
  toMasjidAddress: string;
  groom: PersonBlock;
  bride: PersonBlock;
  nikahDate: string;
  nikahTime: string;
  nikahPlace: string;
  contributionAmount: string;
}

const demoGroom = (): PersonBlock => ({
  name: "മുഹമ്മദ് ഷമീർ",
  age: "28",
  job: "ബിസിനസ്",
  fatherName: "അബ്ദുൽ റഹ്മാൻ",
  address1: "റഹ്മത്ത് മൻസിൽ",
  address2: "പെരുങ്ങുഴി പി.ഒ",
  address3: "തിരുവനന്തപുരം",
  address4: "695305",
  marriageNature: "ഒന്നാം വിവാഹം",
  jamaath1: "പെരുങ്ങുഴി മുസ്ലിം ജമാഅത്ത്",
  jamaath2: "പെരുങ്ങുഴി, 695305",
  jamaath3: "തിരുവനന്തപുരം",
});

const demoBride = (): PersonBlock => ({
  name: "ആയിഷ ബീവി",
  age: "24",
  job: "വിദ്യാർത്ഥിനി",
  fatherName: "അബ്ദുൽ കരീം",
  address1: "മന്നത്ത് വീട്",
  address2: "കാരിച്ചറ പി.ഒ",
  address3: "തിരുവനന്തപുരം",
  address4: "695310",
  marriageNature: "ഒന്നാം വിവാഹം",
  jamaath1: "കരിച്ചാറ മുസ്ലിം ജമാഅത്ത്",
  jamaath2: "കരിച്ചാറ, 695310",
  jamaath3: "തിരുവനന്തപുരം",
});

function PersonForm({
  title,
  value,
  onChange,
}: {
  title: string;
  value: PersonBlock;
  onChange: (field: keyof PersonBlock, fieldValue: string) => void;
}) {
  return (
    <div className="bg-slate-50 border font-anek border-slate-200 rounded-2xl p-4 space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            വയസ്സ്
          </label>
          <input
            value={value.age}
            onChange={(e) => onChange("age", e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            തൊഴിൽ
          </label>
          <input
            value={value.job}
            onChange={(e) => onChange("job", e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
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

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          മേൽവിലാസം
        </label>
        <input
          value={value.address1}
          onChange={(e) => onChange("address1", e.target.value)}
          placeholder="House Name"
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          value={value.address2}
          onChange={(e) => onChange("address2", e.target.value)}
          placeholder="Place + P.O."
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          value={value.address3}
          onChange={(e) => onChange("address3", e.target.value)}
          placeholder="District"
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          value={value.address4}
          onChange={(e) => onChange("address4", e.target.value)}
          placeholder="Pincode"
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          വിവാഹത്തിന്റെ സ്വഭാവം
        </label>
        <input
          value={value.marriageNature}
          onChange={(e) => onChange("marriageNature", e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          ഉൾപ്പെടുന്ന ജമാ അത്ത്
        </label>
        <input
          value={value.jamaath1}
          onChange={(e) => onChange("jamaath1", e.target.value)}
          placeholder="Masjid Name"
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          value={value.jamaath2}
          onChange={(e) => onChange("jamaath2", e.target.value)}
          placeholder="Place + Pincode"
          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          value={value.jamaath3}
          onChange={(e) => onChange("jamaath3", e.target.value)}
          placeholder="District"
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

export default function MarriagePermissionPanel() {
  const [data, setData] = useState<PermissionData>({
    refNo: "112",
    issueDate: "15/12/2025",
    toMasjidName: "പെരുങ്ങുഴി മുസ്ലിം ജമാഅത്ത് പള്ളി",
    toMasjidAddress: "പെരുങ്ങുഴി പി.ഒ, തിരുവനന്തപുരം, 695305",
    groom: demoGroom(),
    bride: demoBride(),
    nikahDate: "20/12/2025",
    nikahTime: "02:30 PM",
    nikahPlace: "സഫാ ഓഡിറ്റോറിയം, കല്ലമ്പലം",
    contributionAmount: "5000",
  });

  const [isGeneratingFilledPdf, setIsGeneratingFilledPdf] = useState(false);
  const [isDownloadingBlankPdf, setIsDownloadingBlankPdf] = useState(false);

  const preview = useMemo(
    () => ({
      toCombined1: data.toMasjidName,
      toCombined2: data.toMasjidAddress,
    }),
    [data.toMasjidName, data.toMasjidAddress]
  );

  const updatePerson = (
    personKey: "groom" | "bride",
    field: keyof PersonBlock,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [personKey]: {
        ...prev[personKey],
        [field]: value,
      },
    }));
  };

  const generateFilledPdf = async () => {
    setIsGeneratingFilledPdf(true);

    try {
      const pdf = createA4Pdf("portrait");
      const pageWidth = 210;
      const pageHeight = 297;
      const SCALE = 1.0;

      const templateDataUrl = await loadImageAsDataUrl("/mr-permission.png");
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

      pdf.setTextColor(40, 40, 40);

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

      await drawHybridText({
        text: data.refNo,
        x: 23.6,
        y: 70.4,
        fontSize: 12.4 * SCALE,
        bold: true,
      });

      await drawHybridText({
        text: data.issueDate,
        x: 185,
        y: 79,
        fontSize: 12 * SCALE,
        bold: true,
        align: "center",
        maxWidth: 25,
      });

      await drawHybridText({
        text: preview.toCombined1,
        x: 40,
        y: 90,
        fontSize: 13 * SCALE,
        bold: true,
        maxWidth: 90,
        imageFontPx: 22,
      });

      await drawHybridText({
        text: preview.toCombined2,
        x: 40,
        y: 101,
        fontSize: 12 * SCALE,
        maxWidth: 100,
        imageFontPx: 20,
      });

      await drawHybridText({
        text: data.groom.name,
        x: 26,
        y: 122,
        fontSize: 11.5 * SCALE,
        maxWidth: 70,
        imageFontPx: 20,
      });

      await drawHybridText({
        text: data.groom.age,
        x: 28,
        y: 130,
        fontSize: 11.5 * SCALE,
        maxWidth: 35,
      });

      await drawHybridText({
        text: data.groom.job,
        x: 29,
        y: 138,
        fontSize: 11.5 * SCALE,
        maxWidth: 70,
        imageFontPx: 19,
      });

      await drawHybridText({
        text: data.groom.fatherName,
        x: 48,
        y: 144,
        fontSize: 11.5 * SCALE,
        maxWidth: 55,
        imageFontPx: 19,
      });

      await drawHybridText({
        text: data.groom.address1,
        x: 41,
        y: 153,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 18,
      });

      await drawHybridText({
        text: data.groom.address2,
        x: 20,
        y: 159,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 18,
      });

      await drawHybridText({
        text: data.groom.address3,
        x: 20,
        y: 165,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 18,
      });

      await drawHybridText({
        text: data.groom.address4,
        x: 22,
        y: 171,
        fontSize: 11 * SCALE,
        maxWidth: 72,
      });

      await drawHybridText({
        text: data.groom.marriageNature,
        x: 82,
        y: 183.6,
        fontSize: 11 * SCALE,
        bold: true,
        align: "center",
        maxWidth: 38,
        imageFontPx: 17,
      });

      await drawHybridText({
        text: data.groom.jamaath1,
        x: 20,
        y: 199,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 17,
      });

      await drawHybridText({
        text: data.groom.jamaath2,
        x: 29,
        y: 205.6,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 17,
      });

      await drawHybridText({
        text: data.groom.jamaath3,
        x: 30,
        y: 211.2,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 17,
      });

      await drawHybridText({
        text: data.bride.name,
        x: 123,
        y: 122,
        fontSize: 11.5 * SCALE,
        maxWidth: 70,
        imageFontPx: 20,
      });

      await drawHybridText({
        text: data.bride.age,
        x: 127,
        y: 130,
        fontSize: 11.5 * SCALE,
        maxWidth: 35,
      });

      await drawHybridText({
        text: data.bride.job,
        x: 128,
        y: 138,
        fontSize: 11.5 * SCALE,
        maxWidth: 70,
        imageFontPx: 19,
      });

      await drawHybridText({
        text: data.bride.fatherName,
        x: 147,
        y: 144,
        fontSize: 11.5 * SCALE,
        maxWidth: 55,
        imageFontPx: 19,
      });

      await drawHybridText({
        text: data.bride.address1,
        x: 140,
        y: 153,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 18,
      });

      await drawHybridText({
        text: data.bride.address2,
        x: 119,
        y: 159,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 18,
      });

      await drawHybridText({
        text: data.bride.address3,
        x: 119,
        y: 165,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 18,
      });

      await drawHybridText({
        text: data.bride.address4,
        x: 121,
        y: 171,
        fontSize: 11 * SCALE,
        maxWidth: 72,
      });

      await drawHybridText({
        text: data.bride.marriageNature,
        x: 181,
        y: 183.6,
        fontSize: 11 * SCALE,
        bold: true,
        align: "center",
        maxWidth: 38,
        imageFontPx: 17,
      });

      await drawHybridText({
        text: data.bride.jamaath1,
        x: 119,
        y: 199,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 17,
      });

      await drawHybridText({
        text: data.bride.jamaath2,
        x: 128,
        y: 205.6,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 17,
      });

      await drawHybridText({
        text: data.bride.jamaath3,
        x: 129,
        y: 211.2,
        fontSize: 11 * SCALE,
        maxWidth: 72,
        imageFontPx: 17,
      });

      await drawHybridText({
        text: data.nikahDate,
        x: 57,
        y: 227,
        fontSize: 11.5 * SCALE,
        maxWidth: 55,
      });

      await drawHybridText({
        text: data.nikahTime,
        x: 141,
        y: 227,
        fontSize: 11.5 * SCALE,
        maxWidth: 40,
      });

      await drawHybridText({
        text: data.nikahPlace,
        x: 57,
        y: 233,
        fontSize: 11.5 * SCALE,
        maxWidth: 130,
        imageFontPx: 20,
      });

      await drawHybridText({
        text: data.contributionAmount,
        x: 149,
        y: 285.6,
        fontSize: 11.5 * SCALE,
        bold: true,
        align: "center",
        maxWidth: 25,
      });

      pdf.save(`Marriage_Permission_${data.refNo}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate marriage permission PDF.");
    } finally {
      setIsGeneratingFilledPdf(false);
    }
  };

  const downloadBlankPdf = async () => {
    setIsDownloadingBlankPdf(true);

    try {
      await downloadBlankTemplatePdf({
        templatePath: "/mr-permission.png",
        fileName: "Marriage_Permission_Blank.pdf",
        orientation: "portrait",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to download blank PDF.");
    } finally {
      setIsDownloadingBlankPdf(false);
    }
  };

  return (
    <div className="grid font-anek grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Settings className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">
              Permission Certificate Details
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Ref No
              </label>
              <input
                value={data.refNo}
                onChange={(e) => setData({ ...data, refNo: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                value={data.issueDate}
                onChange={(e) =>
                  setData({ ...data, issueDate: e.target.value })
                }
                placeholder="15/12/2025"
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                To - Secretary / Masjid Name
              </label>
              <input
                value={data.toMasjidName}
                onChange={(e) =>
                  setData({ ...data, toMasjidName: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                To - Address
              </label>
              <input
                value={data.toMasjidAddress}
                onChange={(e) =>
                  setData({ ...data, toMasjidAddress: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <PersonForm
          title="വരൻ Details"
          value={data.groom}
          onChange={(field, value) => updatePerson("groom", field, value)}
        />

        <PersonForm
          title="വധു Details"
          value={data.bride}
          onChange={(field, value) => updatePerson("bride", field, value)}
        />

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800">Nikah Details</h3>

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
                സമയം
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
              നടത്തപ്പെടുന്ന സ്ഥലം
            </label>
            <input
              value={data.nikahPlace}
              onChange={(e) =>
                setData({ ...data, nikahPlace: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              സംഭാവനയായി അടക്കേണ്ട രൂപ
            </label>
            <input
              value={data.contributionAmount}
              onChange={(e) =>
                setData({ ...data, contributionAmount: e.target.value })
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
          <div className="w-full max-w-[760px]">
            <div
              className="relative w-full aspect-[210/297] bg-cover bg-center bg-no-repeat shadow-2xl bg-white text-slate-900"
              style={{
                backgroundImage: "url('/mr-permission.png')",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
                containerType: "inline-size",
              }}
            >
              <div
                className="absolute font-anek font-bold"
                style={{ top: "22.4%", left: "12%", fontSize: "2cqw" }}
              >
                {data.refNo}
              </div>

              <div
                className="absolute font-anek font-bold"
                style={{ top: "25.2%", left: "84%", fontSize: "2cqw" }}
              >
                {data.issueDate}
              </div>

              <div
                className="absolute font-anek font-bold"
                style={{
                  top: "29%",
                  left: "20%",
                  fontSize: "3cqw",
                  maxWidth: "100%",
                }}
              >
                {preview.toCombined1}
              </div>

              <div
                className="absolute font-anek"
                style={{
                  top: "32.3%",
                  left: "20%",
                  fontSize: "3cqw",
                  maxWidth: "100%",
                }}
              >
                {preview.toCombined2}
              </div>

              <div
                className="absolute font-anek"
                style={{ top: "40%", left: "13.5%", fontSize: "2cqw", maxWidth: "32%" }}
              >
                {data.groom.name}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "42.5%", left: "15%", fontSize: "2cqw", maxWidth: "18%" }}
              >
                {data.groom.age}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "45.4%", left: "15%", fontSize: "2cqw", maxWidth: "32%" }}
              >
                {data.groom.job}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "47.6%", left: "25%", fontSize: "2cqw", maxWidth: "25%" }}
              >
                {data.groom.fatherName}
              </div>

              <div
                className="absolute font-anek"
                style={{ top: "50.4%", left: "22%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.groom.address1}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "52.3%", left: "10%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.groom.address2}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "54.3%", left: "10%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.groom.address3}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "56.3%", left: "10%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.groom.address4}
              </div>

              <div
                className="absolute font-anek font-bold"
                style={{
                  top: "60.6%",
                  left: "31%",
                  fontSize: "2cqw",
                  maxWidth: "50%",
                  textAlign: "center",
                }}
              >
                {data.groom.marriageNature}
              </div>

              <div
                className="absolute font-anek"
                style={{ top: "66%", left: "10%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.groom.jamaath1}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "68%", left: "12%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.groom.jamaath2}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "70%", left: "13.5%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.groom.jamaath3}
              </div>

              <div
                className="absolute font-anek"
                style={{ top: "40%", left: "59%", fontSize: "2cqw", maxWidth: "32%" }}
              >
                {data.bride.name}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "42.5%", left: "63%", fontSize: "2cqw", maxWidth: "18%" }}
              >
                {data.bride.age}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "45.4%", left: "63%", fontSize: "2cqw", maxWidth: "32%" }}
              >
                {data.bride.job}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "47.6%", left: "72%", fontSize: "2cqw", maxWidth: "25%" }}
              >
                {data.bride.fatherName}
              </div>

              <div
                className="absolute font-anek"
                style={{ top: "50.4%", left: "69%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.bride.address1}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "52.3%", left: "55%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.bride.address2}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "54.3%", left: "55%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.bride.address3}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "56.3%", left: "55%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.bride.address4}
              </div>

              <div
                className="absolute font-anek font-bold"
                style={{
                  top: "60.6%",
                  left: "77%",
                  fontSize: "2cqw",
                  maxWidth: "50%",
                  textAlign: "center",
                }}
              >
                {data.bride.marriageNature}
              </div>

              <div
                className="absolute font-anek"
                style={{ top: "66%", left: "59%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.bride.jamaath1}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "68%", left: "64%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.bride.jamaath2}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "70%", left: "64%", fontSize: "2cqw", maxWidth: "33%" }}
              >
                {data.bride.jamaath3}
              </div>

              <div
                className="absolute font-anek"
                style={{ top: "75%", left: "27.2%", fontSize: "2cqw" }}
              >
                {data.nikahDate}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "75%", left: "67%", fontSize: "2cqw" }}
              >
                {data.nikahTime}
              </div>
              <div
                className="absolute font-anek"
                style={{ top: "77.4%", left: "30%", fontSize: "2cqw", maxWidth: "58%" }}
              >
                {data.nikahPlace}
              </div>
              <div
                className="absolute font-anek font-bold"
                style={{ top: "94.7%", left: "68%", fontSize: "2cqw" }}
              >
                {data.contributionAmount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}