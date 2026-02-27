"use client";

import React, { useState } from "react";
import { UploadCloud, UserPlus, CheckCircle2, AlertCircle, Link as LinkIcon } from "lucide-react";
import { addIndividualMember, processCSVUpload, CSVMemberRow } from "@/app/admin/actions";
import Conversion from "@/components/admin/Conversion"; // Import the new component

export default function ManageMembers() {
  const [activeTab, setActiveTab] = useState<"individual" | "csv" | "conversion">("individual");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleIndividualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await addIndividualMember(formData);

    if (result.success) {
      setMessage({ type: 'success', text: "Member added successfully!" });
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage({ type: 'error', text: result.error || "Failed to add member." });
    }
    setLoading(false);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim().length > 0);

      const parsedData: CSVMemberRow[] = [];
      const startIndex = rows[0].toLowerCase().includes('name') ? 1 : 0;

      for (let i = startIndex; i < rows.length; i++) {
        // Advanced Split: Ignores commas inside double quotes (for addresses)
        const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').trim());

        if (cols.length >= 5) {
          parsedData.push({
            name: cols[0],
            father_name: cols[1] || "",
            address: cols[2] || "",
            pmj_no: cols[3] ? parseInt(cols[3]) : null,
            mr_no: parseInt(cols[4]),
            head_pmj_no: cols[5] ? parseInt(cols[5]) : null,
            annual_subs: cols[6] || "0",
            arrears: cols[7] || "0",
            book_no: cols[8] || "",
            page_no: cols[9] || "",
            status: (cols[10]?.toLowerCase() === 'inactive' ? 'inactive' : 'active')
          });
        }
      }

      const result = await processCSVUpload(parsedData);

      if (result.errors.length === 0) {
        setMessage({ type: 'success', text: `Successfully uploaded ${result.created} members!` });
      } else {
        setMessage({
          type: 'error',
          text: `Created ${result.created}, but encountered ${result.errors.length} errors. First error: ${result.errors[0]}`
        });
      }
      setLoading(false);
      e.target.value = "";
    };

    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manage Members</h1>
        <p className="text-slate-500 mt-1">Add detailed member profiles, bulk upload, or convert dependents.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("individual")}
          className={`pb-3 px-2 font-medium transition-all whitespace-nowrap ${activeTab === 'individual' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Add Individual
        </button>
        <button
          onClick={() => setActiveTab("csv")}
          className={`pb-3 px-2 font-medium transition-all whitespace-nowrap ${activeTab === 'csv' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Bulk Upload CSV
        </button>
        <button
          onClick={() => setActiveTab("conversion")}
          className={`pb-3 px-2 font-medium transition-all whitespace-nowrap flex items-center gap-1 ${activeTab === 'conversion' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <LinkIcon className="w-4 h-4" /> Convert to Head
        </button>
      </div>

      {message && activeTab !== "conversion" && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

        {/* --- INDIVIDUAL TAB --- */}
        {activeTab === "individual" && (
          <form onSubmit={handleIndividualSubmit} className="space-y-8">
            <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-4">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold">Personal Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                <input type="text" name="name" required className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Mohammed Ali" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Father's Name</label>
                <input type="text" name="father_name" className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Abdul Rahman" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">House Address</label>
                <textarea name="address" rows={2} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Enter full address..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">MR Number (Must be unique) *</label>
                <input type="number" name="mr_no" required className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 1045" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                <select name="status" className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">PMJ Number (Heads Only)</label>
                <input type="number" name="pmj_no" className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white" placeholder="Leave blank if dependent" />
                <p className="text-xs text-slate-500 mt-2">Providing this generates a login account automatically.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Head PMJ Number (Dependents Only)</label>
                <input type="number" name="head_pmj_no" className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none bg-white" placeholder="Father/Husband's PMJ No" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-4 pt-4">
              <h2 className="text-xl font-bold">Records & Dues</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Book No</label>
                <input type="text" name="book_no" className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. B-12" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Page No</label>
                <input type="text" name="page_no" className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 45" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Annual Subs (₹/NA)</label>
                <input type="text" name="annual_subs" defaultValue="0" className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 500 or NA" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Arrears (₹/NA)</label>
                <input type="text" name="arrears" defaultValue="0" className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. 1000 or NA" />
              </div>
            </div>

            <button disabled={loading} type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all disabled:opacity-50 w-full md:w-auto">
              {loading ? "Saving to Database..." : "Save Member Details"}
            </button>
          </form>
        )}

        {/* --- CSV TAB --- */}
        {activeTab === "csv" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-800 mb-6">
              <UploadCloud className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold">Upload Bulk Data</h2>
            </div>

            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center flex flex-col items-center">
              <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-slate-600 mb-4 max-w-lg">
                Ensure your CSV file matches exactly this 11-column order. Enclose addresses with commas inside double quotes (e.g. <code className="text-slate-800 bg-slate-200 px-1">"123 St, Kerala"</code>).
              </p>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 text-xs font-mono text-slate-600 text-left overflow-x-auto w-full">
                Name, Father Name, Address, PMJ_NO, MR_NO, HEAD_PMJ_NO, Annual Subs, Arrears, Book No, Page No, Status
              </div>

              <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-xl shadow-sm transition-all">
                {loading ? "Processing File..." : "Select CSV File"}
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCSVUpload}
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        )}

        {/* --- CONVERSION TAB --- */}
        {activeTab === "conversion" && (
          <Conversion />
        )}

      </div>
    </div>
  );
}