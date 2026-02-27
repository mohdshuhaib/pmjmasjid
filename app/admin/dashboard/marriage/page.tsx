"use client";

import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Settings, FileText } from "lucide-react";

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

export default function MarriageCertificateGenerator() {
  const [data, setData] = useState<CertificateData>({
    template: "male",
    regNo: "245",
    issueDate: "15/12/2025",
    groomName: "Mohammed Shuhaib M",
    groomFatherAddress: "Muneer S, Madeena Manzil, Perunguzhi PO",
    groomPlace: "Azhoor, Pin 695305",
    brideName: "Ayisha Beegum",
    brideFatherAddress: "Abdul Kareem, Mannath Veedu, Karichara",
    bridePlace: "Kaniyapuram, Pin 695306",
    marriageDate: "05/12/2025",
    marriagePlace: "Safa Auditorium, Kallambalam",
  });

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Marriage_Certificate_${data.regNo}`,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Logic to swap who goes first based on template selection
  const isMaleFirst = data.template === "male";

  const person1Name = isMaleFirst ? data.groomName : data.brideName;
  const person1FatherAddress = isMaleFirst ? data.groomFatherAddress : data.brideFatherAddress;
  const person1Place = isMaleFirst ? data.groomPlace : data.bridePlace;

  const person2Name = isMaleFirst ? data.brideName : data.groomName;
  const person2FatherAddress = isMaleFirst ? data.brideFatherAddress : data.groomFatherAddress;
  const person2Place = isMaleFirst ? data.bridePlace : data.groomPlace;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-emerald-600" />
          Marriage Certificate Generator
        </h1>
        <p className="text-slate-500 mt-1">Fill out the details below to generate and print a formal certificate.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

        {/* --- LEFT SIDE: ENTRY FORM --- */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Settings className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Certificate Details</h2>
          </div>

          <form className="space-y-5">
            {/* Template Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Who appears first?</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${data.template === 'male' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 hover:border-emerald-300'}`}>
                  <input type="radio" name="template" value="male" checked={data.template === 'male'} onChange={handleChange} className="hidden" />
                  <span className="font-semibold">Groom First</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${data.template === 'female' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 hover:border-emerald-300'}`}>
                  <input type="radio" name="template" value="female" checked={data.template === 'female'} onChange={handleChange} className="hidden" />
                  <span className="font-semibold">Bride First</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reg No</label>
                <input type="text" name="regNo" value={data.regNo} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Issue Date</label>
                <input type="text" name="issueDate" value={data.issueDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Groom Name</label>
              <input type="text" name="groomName" value={data.groomName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Groom's Father & Address</label>
              <input type="text" name="groomFatherAddress" value={data.groomFatherAddress} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Groom's Place</label>
              <input type="text" name="groomPlace" value={data.groomPlace} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bride Name</label>
              <input type="text" name="brideName" value={data.brideName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bride's Father & Address</label>
              <input type="text" name="brideFatherAddress" value={data.brideFatherAddress} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bride's Place</label>
              <input type="text" name="bridePlace" value={data.bridePlace} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Marriage Date</label>
                <input type="text" name="marriageDate" value={data.marriageDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Marriage Place</label>
                <input type="text" name="marriagePlace" value={data.marriagePlace} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </form>

          <button
            onClick={handlePrint}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Printer className="w-5 h-5" />
            Print Certificate
          </button>
        </div>

        {/* --- RIGHT SIDE: LIVE PREVIEW --- */}
        <div className="xl:col-span-8 sticky top-24">
          <div className="bg-slate-200/50 p-4 md:p-8 rounded-3xl border border-slate-300 flex items-center justify-center overflow-hidden">

            <div
              ref={componentRef}
              id="printable-area"
              className="relative w-full aspect-[1.414/1] bg-cover bg-center bg-no-repeat shadow-2xl bg-white text-slate-900"
              style={{
                backgroundImage: `url('/mr-${data.template}.jpeg')`,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
                // THIS ONE LINE FIXES THE SCALING BUG ON LARGE SCREENS:
                containerType: 'inline-size',
              }}
            >

              <div
                className="absolute font-inter font-bold"
                style={{ top: '24.3%', left: '16%', fontSize: '1.6cqw' }}
              >
                {data.regNo}
              </div>

              <div
                className="absolute font-inter font-bold"
                style={{ top: '26%', left: '82%', fontSize: '1.6cqw' }}
              >
                {data.issueDate}
              </div>

              <div
                className="absolute font-inter font-bold"
                style={{ top: '34%', left: '45%', fontSize: '2.6cqw' }}
              >
                {person1Name}
              </div>

              <div
                className="absolute font-inter"
                style={{ top: '38.8%', left: '28%', fontSize: '2.2cqw' }}
              >
                {person1FatherAddress}
              </div>

              <div
                className="absolute font-inter"
                style={{ top: '43.8%', left: '22%', fontSize: '2.2cqw' }}
              >
                {person1Place}
              </div>

              <div
                className="absolute font-inter font-bold"
                style={{ top: '48%', left: '27%', fontSize: '2.6cqw' }}
              >
                {person2Name}
              </div>

              <div
                className="absolute font-inter"
                style={{ top: '53%', left: '16%', fontSize: '2.2cqw' }}
              >
                {person2FatherAddress}
              </div>

              <div
                className="absolute font-inter"
                style={{ top: '57.5%', left: '13%', fontSize: '2.2cqw' }}
              >
                {person2Place}
              </div>

              <div
                className="absolute font-inter font-bold"
                style={{ top: '58%', left: '80%', fontSize: '2cqw' }}
              >
                {data.marriageDate}
              </div>

              <div
                className="absolute font-inter font-bold"
                style={{ top: '62.6%', left: '15%', fontSize: '2.2cqw' }}
              >
                {data.marriagePlace}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}