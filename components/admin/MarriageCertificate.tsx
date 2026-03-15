"use client";

import React, { useState } from "react";
import { Settings, Download, FileImage } from "lucide-react";
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

export default function MarriageCertificate() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const isMaleFirst = data.template === "male";
  const person1Name = isMaleFirst ? data.groomName : data.brideName;
  const person1FatherAddress = isMaleFirst ? data.groomFatherAddress : data.brideFatherAddress;
  const person1Place = isMaleFirst ? data.groomPlace : data.bridePlace;
  const person2Name = isMaleFirst ? data.brideName : data.groomName;
  const person2FatherAddress = isMaleFirst ? data.brideFatherAddress : data.groomFatherAddress;
  const person2Place = isMaleFirst ? data.bridePlace : data.groomPlace;

  const getTemplatePath = () => data.template === "male" ? "/mr-male.png" : "/mr-female.png";

  const loadImageAsDataUrl = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context not available"));
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  const loadFontAsBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  };

  const registerAnekMalayalamFont = async (pdf: jsPDF) => {
    const fontBase64 = await loadFontAsBase64("/AnekMalayalam-Variable.ttf");
    pdf.addFileToVFS("AnekMalayalam-Variable.ttf", fontBase64);
    pdf.addFont("AnekMalayalam-Variable.ttf", "AnekMalayalam", "normal", "Identity-H");
    pdf.addFont("AnekMalayalam-Variable.ttf", "AnekMalayalam", "bold", "Identity-H");
  };

  const generatePdf = async (type: "filled" | "blank") => {
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
      const templateDataUrl = await loadImageAsDataUrl(getTemplatePath());

      pdf.addImage(templateDataUrl, "PNG", 0, 0, 297, 210, undefined, "FAST");

      if (type === "filled") {
        await registerAnekMalayalamFont(pdf);
        pdf.setTextColor(30, 30, 30);
        const SCALE = 1.5;

        const drawText = (text: string, x: number, y: number, fontSize: number, options?: any) => {
          pdf.setFont("AnekMalayalam", options?.bold ? "bold" : "normal");
          pdf.setFontSize(fontSize);
          if (options?.maxWidth) {
            const lines = pdf.splitTextToSize(text || "", options.maxWidth);
            pdf.text(lines, x, y, { align: options?.align || "left", baseline: "alphabetic" });
          } else {
            pdf.text(text || "", x, y, { align: options?.align || "left", baseline: "alphabetic" });
          }
        };

        drawText(data.regNo, 47.5, 57, 10.5 * SCALE, { bold: true });
        drawText(data.issueDate, 243.5, 65.5, 10.5 * SCALE, { bold: true });
        drawText(person1Name, 140, 81, 15.5 * SCALE, { bold: true, align: "center" });
        drawText(person1FatherAddress, 81, 90.2, 11.5 * SCALE, { maxWidth: 175 });
        drawText(person1Place, 65.3, 100.2, 11.5 * SCALE, { maxWidth: 145 });
        drawText(person2Name, 85, 110, 15.5 * SCALE, { bold: true, align: "center" });
        drawText(person2FatherAddress, 80, 120, 11.5 * SCALE, { maxWidth: 190 });
        drawText(person2Place, 38.6, 130, 11.5 * SCALE, { maxWidth: 165 });
        drawText(data.marriageDate, 254, 130, 11.5 * SCALE, { bold: true, align: "center" });
        drawText(data.marriagePlace, 44.6, 140, 11.5 * SCALE, { bold: true, maxWidth: 190 });
      }

      pdf.save(`Marriage_Certificate_${type === 'blank' ? 'Blank' : data.regNo}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate certificate PDF.");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Left Form */}
      <div className="xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Settings className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-800">Certificate Details</h2>
        </div>
        <form className="space-y-4">
          {/* Form Fields (Simplified for brevity, exactly as your original code) */}
          <div className="flex gap-4 mb-4">
            <label className={`flex-1 flex justify-center p-3 rounded-xl border-2 cursor-pointer ${data.template === "male" ? "border-emerald-600 bg-emerald-50" : "border-slate-200"}`}>
              <input type="radio" name="template" value="male" checked={data.template === "male"} onChange={handleChange} className="hidden" />
              <span className="font-semibold">Groom First</span>
            </label>
            <label className={`flex-1 flex justify-center p-3 rounded-xl border-2 cursor-pointer ${data.template === "female" ? "border-emerald-600 bg-emerald-50" : "border-slate-200"}`}>
              <input type="radio" name="template" value="female" checked={data.template === "female"} onChange={handleChange} className="hidden" />
              <span className="font-semibold">Bride First</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-500 uppercase">Reg No</label><input type="text" name="regNo" value={data.regNo} onChange={handleChange} className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Issue Date</label><input type="text" name="issueDate" value={data.issueDate} onChange={handleChange} className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          </div>
          <div><label className="text-xs font-bold text-slate-500 uppercase">Groom Name</label><input type="text" name="groomName" value={data.groomName} onChange={handleChange} className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase">Groom's Father & Address</label><input type="text" name="groomFatherAddress" value={data.groomFatherAddress} onChange={handleChange} className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase">Groom's Place</label><input type="text" name="groomPlace" value={data.groomPlace} onChange={handleChange} className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-emerald-500" /></div>

          <div className="pt-2 border-t border-slate-100"><label className="text-xs font-bold text-slate-500 uppercase">Bride Name</label><input type="text" name="brideName" value={data.brideName} onChange={handleChange} className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase">Bride's Father & Address</label><input type="text" name="brideFatherAddress" value={data.brideFatherAddress} onChange={handleChange} className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase">Bride's Place</label><input type="text" name="bridePlace" value={data.bridePlace} onChange={handleChange} className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-emerald-500" /></div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-2">
            <div><label className="text-xs font-bold text-slate-500 uppercase">Marriage Date</label><input type="text" name="marriageDate" value={data.marriageDate} onChange={handleChange} className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Marriage Place</label><input type="text" name="marriagePlace" value={data.marriagePlace} onChange={handleChange} className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          </div>
        </form>

        {/* Buttons updated to requested standard */}
        <div className="space-y-3">
          <button onClick={() => generatePdf("filled")} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
            <Download className="w-5 h-5" /> Download Filled PDF
          </button>
          <button onClick={() => generatePdf("blank")} className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
            <FileImage className="w-5 h-5" /> Download Blank Certificate
          </button>
        </div>
      </div>

      {/* Right Live Preview */}
      <div className="xl:col-span-8 sticky top-24">
        <div className="bg-slate-200/50 p-4 md:p-8 rounded-3xl border border-slate-300 flex items-center justify-center overflow-hidden">
          <div
            className="relative w-full aspect-[1.414/1] bg-cover bg-center bg-no-repeat shadow-2xl bg-white text-slate-900"
            style={{ backgroundImage: `url('/mr-${data.template}.png')` }}
          >
            <div className="absolute font-anek font-bold" style={{ top: "24.2%", left: "16%", fontSize: "1.8cqw" }}>{data.regNo}</div>
            <div className="absolute font-anek font-bold" style={{ top: "28.2%", left: "82%", fontSize: "1.8cqw" }}>{data.issueDate}</div>
            <div className="absolute font-anek font-bold" style={{ top: "35%", left: "45%", fontSize: "2.6cqw" }}>{person1Name}</div>
            <div className="absolute font-anek" style={{ top: "40%", left: "28%", fontSize: "2.2cqw" }}>{person1FatherAddress}</div>
            <div className="absolute font-anek" style={{ top: "45%", left: "22%", fontSize: "2.2cqw" }}>{person1Place}</div>
            <div className="absolute font-anek font-bold" style={{ top: "49%", left: "27%", fontSize: "2.6cqw" }}>{person2Name}</div>
            <div className="absolute font-anek" style={{ top: "54%", left: "25%", fontSize: "2.2cqw" }}>{person2FatherAddress}</div>
            <div className="absolute font-anek" style={{ top: "58.6%", left: "13%", fontSize: "2.2cqw" }}>{person2Place}</div>
            <div className="absolute font-anek font-bold" style={{ top: "59%", left: "80%", fontSize: "2cqw" }}>{data.marriageDate}</div>
            <div className="absolute font-anek font-bold" style={{ top: "63.8%", left: "15%", fontSize: "2.2cqw" }}>{data.marriagePlace}</div>
          </div>
        </div>
      </div>
    </div>
  );
}