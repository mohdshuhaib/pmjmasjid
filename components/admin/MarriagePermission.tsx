"use client";

import React, { useState } from "react";
import { Settings, Download, FileImage, User, UserCheck } from "lucide-react";
import jsPDF from "jspdf";

interface PermissionData {
  refNo: string;
  date: string;
  secMasjid: string;
  secAddress: string;

  gName: string;
  gAge: string;
  gJob: string;
  gFather: string;
  gHouse: string;
  gPlacePO: string;
  gDistrict: string;
  gPin: string;
  gNature: string;
  gMahalName: string;
  gMahalPlace: string;
  gMahalDistrict: string;

  bName: string;
  bAge: string;
  bJob: string;
  bFather: string;
  bHouse: string;
  bPlacePO: string;
  bDistrict: string;
  bPin: string;
  bNature: string;
  bMahalName: string;
  bMahalPlace: string;
  bMahalDistrict: string;

  nDate: string;
  nTime: string;
  nPlace: string;
  donation: string;
}

export default function MarriagePermission() {
  const [data, setData] = useState<PermissionData>({
    refNo: "PMJ/2025/104",
    date: "15/05/2025",
    secMasjid: "Town Juma Masjid Committee",
    secAddress: "Kaniyapuram, TVM",
    gName: "Mohammed Zayd", gAge: "28", gJob: "Software Engineer", gFather: "Abdul Jabbar",
    gHouse: "Makkah Manzil", gPlacePO: "Perunguzhi PO", gDistrict: "Thiruvananthapuram", gPin: "695305",
    gNature: "ആദ്യ വിവാഹം", gMahalName: "Perunguzhi Muslim Jama-ath", gMahalPlace: "Perunguzhi", gMahalDistrict: "TVM",
    bName: "Fathima Suhra", bAge: "24", bJob: "Teacher", bFather: "Sulaiman",
    bHouse: "Kalluvila Veedu", bPlacePO: "Kaniyapuram PO", bDistrict: "Thiruvananthapuram", bPin: "695301",
    bNature: "ആദ്യ വിവാഹം", bMahalName: "Town Juma Masjid", bMahalPlace: "Kaniyapuram", bMahalDistrict: "TVM",
    nDate: "20/05/2025", nTime: "11:30 AM", nPlace: "Al-Safa Auditorium, Kazhakoottam",
    donation: "10,000"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

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
        resolve(canvas.toDataURL("image/jpeg"));
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
      // Portrait mode since mr-permission.jpg is vertical
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const templateDataUrl = await loadImageAsDataUrl("/mr-permission.png");

      // A4 Size: 210 x 297 mm
      pdf.addImage(templateDataUrl, "JPEG", 0, 0, 210, 297, undefined, "FAST");

      if (type === "filled") {
        await registerAnekMalayalamFont(pdf);
        pdf.setTextColor(20, 20, 20); // Very dark gray
        const drawText = (text: string, x: number, y: number, fontSize = 11, isBold = false) => {
          pdf.setFont("AnekMalayalam", isBold ? "bold" : "normal");
          pdf.setFontSize(fontSize);
          pdf.text(text || "", x, y, { baseline: "alphabetic" });
        };

        // Header
        drawText(data.refNo, 25, 69.5, 12, true);
        drawText(data.date, 175, 69.5, 12, true);
        drawText(data.secMasjid, 35, 96, 12, true);
        drawText(data.secAddress, 35, 105, 12, true);

        // Groom Side (X ~ 53) & Bride Side (X ~ 140)
        const L_X = 53; const R_X = 140;

        // Rows
        drawText(data.gName, L_X, 123.5, 12, true);       drawText(data.bName, R_X, 123.5, 12, true);
        drawText(data.gAge, L_X, 132);                    drawText(data.bAge, R_X, 132);
        drawText(data.gJob, L_X, 140.5);                  drawText(data.bJob, R_X, 140.5);
        drawText(data.gFather, L_X + 13, 150);            drawText(data.bFather, R_X + 13, 150); // Offset for long label

        drawText(data.gHouse, L_X + 2, 158.5);            drawText(data.bHouse, R_X + 2, 158.5);
        drawText(data.gPlacePO, 22, 167);                 drawText(data.bPlacePO, 110, 167);
        drawText(data.gDistrict, 22, 176);                drawText(data.bDistrict, 110, 176);
        drawText(data.gPin, 22, 185.5);                   drawText(data.bPin, 110, 185.5);

        drawText(data.gNature, 55, 194.5, 11, true);      drawText(data.bNature, 142, 194.5, 11, true);

        drawText(data.gMahalName, 22, 212.5);             drawText(data.bMahalName, 110, 212.5);
        drawText(data.gMahalPlace, 22, 222);              drawText(data.bMahalPlace, 110, 222);
        drawText(data.gMahalDistrict, 22, 230.5);         drawText(data.bMahalDistrict, 110, 230.5);

        // Footer Details
        drawText(data.nDate, 50, 242.5, 12, true);
        drawText(data.nTime, 145, 242.5, 12, true);
        drawText(data.nPlace, 60, 251.5, 12, true);

        drawText(data.donation, 150, 287.5, 14, true);
      }

      pdf.save(`NOC_${type === 'blank' ? 'Blank' : data.refNo}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF. Make sure mr-permission.png is in the public folder.");
    }
  };

  const InputRow = ({ label, name, val, width = "w-full" }: any) => (
    <div className={width}>
      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
      <input type="text" name={name} value={val} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* LEFT FORM */}
      <div className="xl:col-span-5 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[80vh]">
        <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" /> Fill NOC Details
          </h2>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">

          <div className="grid grid-cols-2 gap-4">
            <InputRow label="Ref No" name="refNo" val={data.refNo} />
            <InputRow label="Date" name="date" val={data.date} />
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
            <h3 className="font-bold text-sm text-emerald-800">To Secretary (Recipient)</h3>
            <InputRow label="Masjid / Jama'ath Name" name="secMasjid" val={data.secMasjid} />
            <InputRow label="Place / Address" name="secAddress" val={data.secAddress} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Groom Column */}
            <div className="space-y-3 border-r border-slate-100 pr-4">
               <h3 className="font-bold text-sm text-blue-800 flex items-center gap-1 border-b pb-2"><User className="w-4 h-4"/> വരൻ (Groom)</h3>
               <InputRow label="പേര് (Name)" name="gName" val={data.gName} />
               <div className="flex gap-2">
                  <InputRow label="വയസ്സ്" name="gAge" val={data.gAge} width="w-1/3" />
                  <InputRow label="തൊഴിൽ" name="gJob" val={data.gJob} width="w-2/3" />
               </div>
               <InputRow label="പിതാവിന്റെ പേര്" name="gFather" val={data.gFather} />
               <div className="space-y-2 pt-2">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Address Lines</p>
                 <InputRow label="House/Manzil" name="gHouse" val={data.gHouse} />
                 <InputRow label="Place & PO" name="gPlacePO" val={data.gPlacePO} />
                 <InputRow label="District" name="gDistrict" val={data.gDistrict} />
                 <InputRow label="PIN Code" name="gPin" val={data.gPin} />
               </div>
               <InputRow label="വിവാഹ സ്വഭാവം" name="gNature" val={data.gNature} />
               <div className="space-y-2 pt-2">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Mahal Details</p>
                 <InputRow label="Masjid Name" name="gMahalName" val={data.gMahalName} />
                 <InputRow label="Place" name="gMahalPlace" val={data.gMahalPlace} />
                 <InputRow label="District" name="gMahalDistrict" val={data.gMahalDistrict} />
               </div>
            </div>

            {/* Bride Column */}
            <div className="space-y-3 pl-2">
               <h3 className="font-bold text-sm text-pink-700 flex items-center gap-1 border-b pb-2"><UserCheck className="w-4 h-4"/> വധു (Bride)</h3>
               <InputRow label="പേര് (Name)" name="bName" val={data.bName} />
               <div className="flex gap-2">
                  <InputRow label="വയസ്സ്" name="bAge" val={data.bAge} width="w-1/3" />
                  <InputRow label="തൊഴിൽ" name="bJob" val={data.bJob} width="w-2/3" />
               </div>
               <InputRow label="പിതാവിന്റെ പേര്" name="bFather" val={data.bFather} />
               <div className="space-y-2 pt-2">
                 <p className="text-[10px] font-bold text-slate-400 uppercase opacity-0">Address Lines</p>
                 <InputRow label="House/Manzil" name="bHouse" val={data.bHouse} />
                 <InputRow label="Place & PO" name="bPlacePO" val={data.bPlacePO} />
                 <InputRow label="District" name="bDistrict" val={data.bDistrict} />
                 <InputRow label="PIN Code" name="bPin" val={data.bPin} />
               </div>
               <InputRow label="വിവാഹ സ്വഭാവം" name="bNature" val={data.bNature} />
               <div className="space-y-2 pt-2">
                 <p className="text-[10px] font-bold text-slate-400 uppercase opacity-0">Mahal Details</p>
                 <InputRow label="Masjid Name" name="bMahalName" val={data.bMahalName} />
                 <InputRow label="Place" name="bMahalPlace" val={data.bMahalPlace} />
                 <InputRow label="District" name="bMahalDistrict" val={data.bMahalDistrict} />
               </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
             <InputRow label="നിക്കാഹ് തീയതി (Date)" name="nDate" val={data.nDate} />
             <InputRow label="സമയം (Time)" name="nTime" val={data.nTime} />
             <InputRow label="നടത്തപ്പെടുന്ന സ്ഥലം (Venue)" name="nPlace" val={data.nPlace} width="col-span-2" />
             <InputRow label="സംഭാവനയായി അടക്കേണ്ട രൂപ" name="donation" val={data.donation} width="col-span-2" />
          </div>
        </div>

        {/* Buttons (Sticky Bottom) */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-3 shrink-0">
          <button onClick={() => generatePdf("filled")} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
            <Download className="w-5 h-5" /> Download Filled PDF
          </button>
          <button onClick={() => generatePdf("blank")} className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
            <FileImage className="w-5 h-5" /> Download Blank Certificate
          </button>
        </div>
      </div>

      {/* RIGHT PREVIEW */}
      <div className="xl:col-span-7 sticky top-24">
        <div className="bg-slate-200/50 p-4 md:p-8 rounded-3xl border border-slate-300 flex items-center justify-center overflow-hidden h-[80vh] overflow-y-auto">
          <div
            className="relative w-full aspect-[1/1.414] bg-cover bg-center bg-no-repeat shadow-2xl bg-white text-slate-900 text-[1.4cqw]"
            style={{ backgroundImage: `url('/mr-permission.png')`, containerType: "inline-size" }}
          >
             {/* Header */}
             <div className="absolute font-anek font-bold" style={{ top: "22%", left: "10%"}}>{data.refNo}</div>
             <div className="absolute font-anek font-bold" style={{ top: "22%", left: "80%"}}>{data.date}</div>
             <div className="absolute font-anek font-bold" style={{ top: "31%", left: "18%"}}>{data.secMasjid}</div>
             <div className="absolute font-anek font-bold" style={{ top: "34%", left: "18%"}}>{data.secAddress}</div>

             {/* Groom Data */}
             <div className="absolute font-anek font-bold" style={{ top: "41.5%", left: "25%"}}>{data.gName}</div>
             <div className="absolute font-anek" style={{ top: "44.5%", left: "25%"}}>{data.gAge}</div>
             <div className="absolute font-anek" style={{ top: "47.5%", left: "25%"}}>{data.gJob}</div>
             <div className="absolute font-anek" style={{ top: "50.5%", left: "32%"}}>{data.gFather}</div>

             <div className="absolute font-anek" style={{ top: "53.5%", left: "25%"}}>{data.gHouse}</div>
             <div className="absolute font-anek" style={{ top: "56.5%", left: "11%"}}>{data.gPlacePO}</div>
             <div className="absolute font-anek" style={{ top: "59.5%", left: "11%"}}>{data.gDistrict}</div>
             <div className="absolute font-anek" style={{ top: "62.5%", left: "11%"}}>{data.gPin}</div>

             <div className="absolute font-anek font-bold" style={{ top: "65.5%", left: "26%"}}>{data.gNature}</div>
             <div className="absolute font-anek" style={{ top: "71.5%", left: "11%"}}>{data.gMahalName}</div>
             <div className="absolute font-anek" style={{ top: "74.5%", left: "11%"}}>{data.gMahalPlace}</div>
             <div className="absolute font-anek" style={{ top: "77.5%", left: "11%"}}>{data.gMahalDistrict}</div>

             {/* Bride Data */}
             <div className="absolute font-anek font-bold" style={{ top: "41.5%", left: "67%"}}>{data.bName}</div>
             <div className="absolute font-anek" style={{ top: "44.5%", left: "67%"}}>{data.bAge}</div>
             <div className="absolute font-anek" style={{ top: "47.5%", left: "67%"}}>{data.bJob}</div>
             <div className="absolute font-anek" style={{ top: "50.5%", left: "74%"}}>{data.bFather}</div>

             <div className="absolute font-anek" style={{ top: "53.5%", left: "67%"}}>{data.bHouse}</div>
             <div className="absolute font-anek" style={{ top: "56.5%", left: "53%"}}>{data.bPlacePO}</div>
             <div className="absolute font-anek" style={{ top: "59.5%", left: "53%"}}>{data.bDistrict}</div>
             <div className="absolute font-anek" style={{ top: "62.5%", left: "53%"}}>{data.bPin}</div>

             <div className="absolute font-anek font-bold" style={{ top: "65.5%", left: "68%"}}>{data.bNature}</div>
             <div className="absolute font-anek" style={{ top: "71.5%", left: "53%"}}>{data.bMahalName}</div>
             <div className="absolute font-anek" style={{ top: "74.5%", left: "53%"}}>{data.bMahalPlace}</div>
             <div className="absolute font-anek" style={{ top: "77.5%", left: "53%"}}>{data.bMahalDistrict}</div>

             {/* Bottom Details */}
             <div className="absolute font-anek font-bold" style={{ top: "81.6%", left: "25%"}}>{data.nDate}</div>
             <div className="absolute font-anek font-bold" style={{ top: "81.6%", left: "70%"}}>{data.nTime}</div>
             <div className="absolute font-anek font-bold" style={{ top: "84.5%", left: "28%"}}>{data.nPlace}</div>
             <div className="absolute font-anek font-bold text-[1.8cqw]" style={{ top: "96.5%", left: "72%"}}>{data.donation}</div>

          </div>
        </div>
      </div>
    </div>
  );
}