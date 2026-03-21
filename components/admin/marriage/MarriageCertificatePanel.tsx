"use client";

import React, { useState } from "react";
import { Download, FileText, Loader2, Settings } from "lucide-react";
import {
  createA4Pdf,
  downloadBlankTemplatePdf,
  loadImageAsDataUrl,
  registerAnekMalayalamFont,
} from "./pdfUtils";

interface CertificateData {
  template: "male" | "female";
  regNo: string;
  issueDate: string;
  groomName: string;
  groomFatherAddress: string;
  groomPlace: string;
  brideName: string;
  brideFatherAddress: string;
  bridePlace: string;
  marriageDate: string;
  marriagePlace: string;
}

export default function MarriageCertificatePanel() {
  const [data, setData] = useState<CertificateData>({
    template: "male",
    regNo: "245",
    issueDate: "15/12/2025",
    groomName: "Mohammed Zayd M",
    groomFatherAddress: "Amr S, Makkah Manzil, Perunguzhi PO",
    groomPlace: "Azhoor, Pin 695305",
    brideName: "Ayisha Beegum",
    brideFatherAddress: "Abdul Kareem, Mannath Veedu, Karichara",
    bridePlace: "Kaniyapuram, Pin 695306",
    marriageDate: "05/12/2025",
    marriagePlace: "Safa Auditorium, Kallambalam",
  });

  const [isGeneratingFilledPdf, setIsGeneratingFilledPdf] = useState(false);
  const [isDownloadingBlankPdf, setIsDownloadingBlankPdf] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const isMaleFirst = data.template === "male";

  const person1Name = isMaleFirst ? data.groomName : data.brideName;
  const person1FatherAddress = isMaleFirst
    ? data.groomFatherAddress
    : data.brideFatherAddress;
  const person1Place = isMaleFirst ? data.groomPlace : data.bridePlace;

  const person2Name = isMaleFirst ? data.brideName : data.groomName;
  const person2FatherAddress = isMaleFirst
    ? data.brideFatherAddress
    : data.groomFatherAddress;
  const person2Place = isMaleFirst ? data.bridePlace : data.groomPlace;

  const getTemplatePath = () =>
    data.template === "male" ? "/mr-male.png" : "/mr-female.png";

  const generateFilledPdf = async () => {
    setIsGeneratingFilledPdf(true);

    try {
      const pdf = createA4Pdf("landscape");
      const pageWidth = 297;
      const pageHeight = 210;
      const SCALE = 1.5;

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

      pdf.setTextColor(30, 30, 30);

      const drawText = (
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

      drawText(data.regNo, 47.5, 57, 10.5 * SCALE, { bold: true });
      drawText(data.issueDate, 243.5, 65.5, 10.5 * SCALE, { bold: true });

      drawText(person1Name, 140, 81, 15.5 * SCALE, {
        bold: true,
        align: "center",
      });

      drawText(person1FatherAddress, 81, 90.2, 11.5 * SCALE, {
        maxWidth: 175,
      });

      drawText(person1Place, 65.3, 100.2, 11.5 * SCALE, {
        maxWidth: 145,
      });

      drawText(person2Name, 85, 110, 15.5 * SCALE, {
        bold: true,
        align: "center",
      });

      drawText(person2FatherAddress, 80, 120, 11.5 * SCALE, {
        maxWidth: 190,
      });

      drawText(person2Place, 38.6, 130, 11.5 * SCALE, {
        maxWidth: 165,
      });

      drawText(data.marriageDate, 254, 130, 11.5 * SCALE, {
        bold: true,
        align: "center",
      });

      drawText(data.marriagePlace, 44.6, 140, 11.5 * SCALE, {
        bold: true,
        maxWidth: 190,
      });

      pdf.save(`Marriage_Certificate_${data.regNo}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate marriage certificate PDF.");
    } finally {
      setIsGeneratingFilledPdf(false);
    }
  };

  const downloadBlankPdf = async () => {
    setIsDownloadingBlankPdf(true);

    try {
      await downloadBlankTemplatePdf({
        templatePath: getTemplatePath(),
        fileName: `Marriage_Certificate_Blank_${data.template}.pdf`,
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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <div className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Settings className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-800">
            Certificate Details
          </h2>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Who appears first?
            </label>
            <div className="flex gap-4">
              <label
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  data.template === "male"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 hover:border-emerald-300"
                }`}
              >
                <input
                  type="radio"
                  name="template"
                  value="male"
                  checked={data.template === "male"}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="font-semibold">Groom First</span>
              </label>

              <label
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  data.template === "female"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 hover:border-emerald-300"
                }`}
              >
                <input
                  type="radio"
                  name="template"
                  value="female"
                  checked={data.template === "female"}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="font-semibold">Bride First</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Reg No
              </label>
              <input
                type="text"
                name="regNo"
                value={data.regNo}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Issue Date
              </label>
              <input
                type="text"
                name="issueDate"
                value={data.issueDate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Groom Name
            </label>
            <input
              type="text"
              name="groomName"
              value={data.groomName}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Groom&apos;s Father & Address
            </label>
            <input
              type="text"
              name="groomFatherAddress"
              value={data.groomFatherAddress}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Groom&apos;s Place
            </label>
            <input
              type="text"
              name="groomPlace"
              value={data.groomPlace}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Bride Name
            </label>
            <input
              type="text"
              name="brideName"
              value={data.brideName}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Bride&apos;s Father & Address
            </label>
            <input
              type="text"
              name="brideFatherAddress"
              value={data.brideFatherAddress}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Bride&apos;s Place
            </label>
            <input
              type="text"
              name="bridePlace"
              value={data.bridePlace}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Marriage Date
              </label>
              <input
                type="text"
                name="marriageDate"
                value={data.marriageDate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Marriage Place
              </label>
              <input
                type="text"
                name="marriagePlace"
                value={data.marriagePlace}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </form>

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

      <div className="xl:col-span-8 sticky top-24">
        <div className="bg-slate-200/50 p-4 md:p-8 rounded-2xl border border-slate-300 flex items-center justify-center overflow-hidden">
          <div
            className="relative w-full aspect-[1.414/1] bg-cover bg-center bg-no-repeat shadow-2xl bg-white text-slate-900"
            style={{
              backgroundImage: `url('${getTemplatePath()}')`,
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
              containerType: "inline-size",
            }}
          >
            <div
              className="absolute font-anek font-bold"
              style={{ top: "24.2%", left: "16%", fontSize: "1.8cqw" }}
            >
              {data.regNo}
            </div>

            <div
              className="absolute font-anek font-bold"
              style={{ top: "28.2%", left: "82%", fontSize: "1.8cqw" }}
            >
              {data.issueDate}
            </div>

            <div
              className="absolute font-anek font-bold"
              style={{ top: "35%", left: "45%", fontSize: "2.6cqw" }}
            >
              {person1Name}
            </div>

            <div
              className="absolute font-anek"
              style={{ top: "40%", left: "28%", fontSize: "2.2cqw" }}
            >
              {person1FatherAddress}
            </div>

            <div
              className="absolute font-anek"
              style={{ top: "45%", left: "22%", fontSize: "2.2cqw" }}
            >
              {person1Place}
            </div>

            <div
              className="absolute font-anek font-bold"
              style={{ top: "49%", left: "27%", fontSize: "2.6cqw" }}
            >
              {person2Name}
            </div>

            <div
              className="absolute font-anek"
              style={{ top: "54%", left: "25%", fontSize: "2.2cqw" }}
            >
              {person2FatherAddress}
            </div>

            <div
              className="absolute font-anek"
              style={{ top: "58.6%", left: "13%", fontSize: "2.2cqw" }}
            >
              {person2Place}
            </div>

            <div
              className="absolute font-anek font-bold"
              style={{ top: "59%", left: "80%", fontSize: "2cqw" }}
            >
              {data.marriageDate}
            </div>

            <div
              className="absolute font-anek font-bold"
              style={{ top: "63.8%", left: "15%", fontSize: "2.2cqw" }}
            >
              {data.marriagePlace}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}