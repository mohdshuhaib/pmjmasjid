"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Edit, Trash2, Users, Loader2, AlertTriangle, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import EditMember, { Member } from "@/components/admin/EditMember";
import { deleteMemberAction } from "@/app/admin/actions";

export default function MembersList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [maritalFilter, setMaritalFilter] = useState<"all" | "married" | "single">("all");

  // Modals
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // --- 1. Fetch All Members securely bypassing 1000 limit ---
  useEffect(() => {
    async function fetchAllMembers() {
      setLoading(true);
      let allData: Member[] = [];
      let from = 0;
      const step = 1000;

      while (true) {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('mr_no', { ascending: true })
          .range(from, from + step - 1);

        if (error) {
          console.error("Error fetching members:", error);
          break;
        }

        if (data) allData = [...allData, ...data];
        if (data.length < step) break; // Reached the end
        from += step;
      }

      setMembers(allData);
      setLoading(false);
    }

    fetchAllMembers();
  }, [supabase]);

  // --- 2. Filter Logic (Memoized for performance) ---
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Status Filter
      if (statusFilter !== "all" && member.status !== statusFilter) return false;

      // Marital Filter (Married = has pmj_no, Single = null pmj_no)
      if (maritalFilter === "married" && !member.pmj_no) return false;
      if (maritalFilter === "single" && member.pmj_no) return false;

      // Search Query Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(q);
        const matchesAddress = (member.address || "").toLowerCase().includes(q);
        const matchesPmj = member.pmj_no?.toString().includes(q) || member.head_pmj_no?.toString().includes(q);
        const matchesMr = member.mr_no.toString().includes(q);

        if (!matchesName && !matchesAddress && !matchesPmj && !matchesMr) return false;
      }

      return true;
    });
  }, [members, statusFilter, maritalFilter, searchQuery]);

  // --- 3. Action Handlers ---
  const handleSaveEdit = (updatedMember: Member) => {
    setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const confirmDelete = async () => {
    if (!deletingMember) return;
    setDeleteLoading(true);

    const result = await deleteMemberAction(deletingMember.id, deletingMember.auth_id);

    if (result.success) {
      setMembers(members.filter(m => m.id !== deletingMember.id));
      setDeletingMember(null);
    } else {
      alert("Failed to delete member: " + result.error);
    }
    setDeleteLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">

      {/* --- STICKY HEADER & FILTERS --- */}
      <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 pb-4 shadow-sm mb-6 pt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Members Directory</h1>
            <p className="text-sm text-slate-500">Showing {filteredMembers.length} of {members.length} total members</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Bar */}
          <div className="md:col-span-6 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Address, PMJ or MR No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          {/* Filters */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-3 px-4 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">🟢 Active Members</option>
              <option value="inactive">🔴 Inactive Members</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={maritalFilter}
              onChange={(e) => setMaritalFilter(e.target.value as any)}
              className="w-full py-3 px-4 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-medium text-slate-700"
            >
              <option value="all">All Marital Status</option>
              <option value="married">Married (Has PMJ)</option>
              <option value="single">Single (Dependent)</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- TABLE CONTENT AREA --- */}
      <div className="flex-1 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
            <p>Loading Member Database...</p>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 shadow-sm z-10">
                <tr>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">SL</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">PMJ No</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">MR No</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Member Details</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Address</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Book/Page</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Financials</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member, index) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500 text-sm">{index + 1}</td>

                    {/* PMJ No Logic */}
                    <td className="p-4 font-mono font-bold text-lg">
                      {member.pmj_no ? (
                        <span className="text-slate-800">{member.pmj_no}</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-red-500">{member.head_pmj_no || 'N/A'}</span>
                          <span className="text-[10px] text-red-400 uppercase tracking-wider">Head PMJ</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-mono font-bold text-slate-600 text-lg">{member.mr_no}</td>

                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-base">{member.name}</p>
                      <p className="text-xs text-slate-500">S/O: <span className="font-medium text-slate-600">{member.father_name || 'N/A'}</span></p>
                    </td>

                    {/* Address Column with inner scrolling for long texts */}
                    <td className="p-4">
                      <div className="max-w-[200px] max-h-16 overflow-y-auto text-sm text-slate-600 pr-2 custom-scrollbar">
                        {member.address || '-'}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <div className="inline-flex bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <span className="px-2 py-1 text-xs font-bold text-slate-600 border-r border-slate-200">{member.book_no || '-'}</span>
                        <span className="px-2 py-1 text-xs font-mono text-slate-500">{member.page_no || '-'}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold">
                          Subs: {member.annual_subs}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded font-bold ${member.arrears === '0' || member.arrears === 'NA' ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-600'}`}>
                          Due: {member.arrears}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                        {member.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingMember(member)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                          title="Edit Member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingMember(member)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-400">
                      No members found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {editingMember && (
        <EditMember
          member={editingMember}
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deletingMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Member?</h2>
            <p className="text-slate-500 text-sm mb-6">
              Are you absolutely sure you want to delete <strong>{deletingMember.name}</strong>?
              {deletingMember.pmj_no && " This will also permanently delete their login account."}
              <br/><br/>This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingMember(null)}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide Scrollbar styling for Address container */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
}