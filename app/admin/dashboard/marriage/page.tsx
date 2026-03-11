"use client";

import React, { useState } from "react";
import { Printer, Settings, FileText, Download } from "lucide-react";
import jsPDF from "jspdf";

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

type ActiveTab = "marriage-certificate" | "marriage-permission";

export default function MarriageCertificateGenerator() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("marriage-certificate");

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

  const loadImageAsDataUrl = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context not available"));
            return;
          }

          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  };

  const openPdfInNewTabAndPrint = (pdf: jsPDF) => {
    const blobUrl = pdf.output("bloburl");
    const printWindow = window.open(blobUrl, "_blank");

    if (!printWindow) {
      alert("Pop-up blocked. Please allow pop-ups to print the certificate.");
      return;
    }

    const tryPrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch {
        // Ignore browser-specific errors
      }
    };

    setTimeout(tryPrint, 700);
    setTimeout(tryPrint, 1500);
  };

  const generatePdf = async (mode: "download" | "print") => {
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 297;
      const pageHeight = 210;
      const SCALE = 1.5;

      const templateDataUrl = await loadImageAsDataUrl(getTemplatePath());

      // Full background image
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
        pdf.setFont("times", options?.bold ? "bold" : "normal");
        pdf.setFontSize(fontSize);

        if (options?.maxWidth) {
          const lines = pdf.splitTextToSize(text || "", options.maxWidth);
          pdf.text(lines, x, y, { align: options?.align || "left" });
        } else {
          pdf.text(text || "", x, y, { align: options?.align || "left" });
        }
      };

      /**
       * These PDF coordinates are mapped from your existing preview positions.
       * Preview sizes and layout are kept unchanged.
       * If needed, later you can fine-tune 1-2 mm after a sample print.
       */

      // Reg No
      drawText(data.regNo, 47.5, 57, 10.5 * SCALE, { bold: true });

      // Issue Date
      drawText(data.issueDate, 243.5, 65.5, 10.5 * SCALE, { bold: true });

      // Person 1 Name
      drawText(person1Name, 140, 81, 15.5 * SCALE, {
        bold: true,
        align: "center",
      });

      // Person 1 Father + Address
      drawText(person1FatherAddress, 81, 90.2, 11.5 * SCALE, {
        maxWidth: 175,
      });

      // Person 1 Place
      drawText(person1Place, 65.3, 100.2, 11.5 * SCALE, {
        maxWidth: 145,
      });

      // Person 2 Name
      drawText(person2Name, 85, 110, 15.5 * SCALE, {
        bold: true,
        align: "center",
      });

      // Person 2 Father + Address
      drawText(person2FatherAddress, 80, 120, 11.5 * SCALE, {
        maxWidth: 190,
      });

      // Person 2 Place
      drawText(person2Place, 38.6, 130, 11.5 * SCALE, {
        maxWidth: 165,
      });

      // Marriage Date
      drawText(data.marriageDate, 254, 130, 11.5 * SCALE, {
        bold: true,
        align: "center",
      });

      // Marriage Place
      drawText(data.marriagePlace, 44.6, 140, 11.5 * SCALE, {
        bold: true,
        maxWidth: 190,
      });

      if (mode === "download") {
        pdf.save(`Marriage_Certificate_${data.regNo}.pdf`);
      } else {
        openPdfInNewTabAndPrint(pdf);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate certificate PDF.");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-emerald-600" />
          Marriage Section
        </h1>
        <p className="text-slate-500 mt-1">
          Fill out the details below to generate and print a formal certificate.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("marriage-certificate")}
          className={`px-5 py-3 rounded-xl font-semibold border transition-all ${activeTab === "marriage-certificate"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
        >
          Marriage Certificate
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("marriage-permission")}
          className={`px-5 py-3 rounded-xl font-semibold border transition-all ${activeTab === "marriage-permission"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
        >
          Marriage Permission Certificate
        </button>
      </div>

      {activeTab === "marriage-permission" ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">
            Marriage Permission Certificate
          </h2>
          <p className="text-slate-500 mt-2">
            This section will be added in future.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* --- LEFT SIDE: ENTRY FORM --- */}
          <div className="xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Settings className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-800">
                Certificate Details
              </h2>
            </div>

            <form className="space-y-5">
              {/* Template Selector */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Who appears first?
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${data.template === "male"
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
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${data.template === "female"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
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
                onClick={() => generatePdf("print")}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Printer className="w-5 h-5" />
                Print Certificate
              </button>

              <button
                type="button"
                onClick={() => generatePdf("download")}
                className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>

          {/* --- RIGHT SIDE: LIVE PREVIEW --- */}
          <div className="xl:col-span-8 sticky top-24">
            <div className="bg-slate-200/50 p-4 md:p-8 rounded-3xl border border-slate-300 flex items-center justify-center overflow-hidden">
              <div
                id="printable-area"
                className="relative w-full aspect-[1.414/1] bg-cover bg-center bg-no-repeat shadow-2xl bg-white text-slate-900"
                style={{
                  backgroundImage: `url('/mr-${data.template}.png')`,
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                  containerType: "inline-size",
                }}
              >
                <div
                  className="absolute font-inter font-bold"
                  style={{ top: "24.3%", left: "16%", fontSize: "1.6cqw" }}
                >
                  {data.regNo}
                </div>

                <div
                  className="absolute font-inter font-bold"
                  style={{ top: "26%", left: "82%", fontSize: "1.6cqw" }}
                >
                  {data.issueDate}
                </div>

                <div
                  className="absolute font-inter font-bold"
                  style={{ top: "34%", left: "45%", fontSize: "2.6cqw" }}
                >
                  {person1Name}
                </div>

                <div
                  className="absolute font-inter"
                  style={{ top: "38.8%", left: "28%", fontSize: "2.2cqw" }}
                >
                  {person1FatherAddress}
                </div>

                <div
                  className="absolute font-inter"
                  style={{ top: "43.8%", left: "22%", fontSize: "2.2cqw" }}
                >
                  {person1Place}
                </div>

                <div
                  className="absolute font-inter font-bold"
                  style={{ top: "48%", left: "27%", fontSize: "2.6cqw" }}
                >
                  {person2Name}
                </div>

                <div
                  className="absolute font-inter"
                  style={{ top: "53%", left: "16%", fontSize: "2.2cqw" }}
                >
                  {person2FatherAddress}
                </div>

                <div
                  className="absolute font-inter"
                  style={{ top: "57.5%", left: "13%", fontSize: "2.2cqw" }}
                >
                  {person2Place}
                </div>

                <div
                  className="absolute font-inter font-bold"
                  style={{ top: "58%", left: "80%", fontSize: "2cqw" }}
                >
                  {data.marriageDate}
                </div>

                <div
                  className="absolute font-inter font-bold"
                  style={{ top: "62.6%", left: "15%", fontSize: "2.2cqw" }}
                >
                  {data.marriagePlace}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}