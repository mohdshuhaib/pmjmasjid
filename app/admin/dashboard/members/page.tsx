"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { deleteMemberAction } from "@/app/admin/actions";
import EditMember, { Member } from "@/components/admin/EditMember";
import MembersFilter from "@/components/admin/MembersFilter";
import MembersTable from "@/components/admin/MembersTable";
import DeleteMemberModal from "@/components/admin/DeleteMemberModal";

export default function MembersList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deceased" | "fee_exempt" | "fee_disc">("all");
  const [maritalFilter, setMaritalFilter] = useState<"all" | "married" | "single">("all");

  // Modals
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // --- Fetch All Members ---
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

        if (error) break;
        if (data) allData = [...allData, ...data];
        if (data.length < step) break;
        from += step;
      }
      setMembers(allData);
      setLoading(false);
    }
    fetchAllMembers();
  }, [supabase]);

  // --- Filter Logic ---
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      if (statusFilter !== "all" && member.status !== statusFilter) return false;
      if (maritalFilter === "married" && !member.pmj_no) return false;
      if (maritalFilter === "single" && member.pmj_no) return false;

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

  // --- EXPORT TO EXCEL LOGIC ---
  const handleExportExcel = () => {
    // 1. Sort ascending by PMJ No
    const sorted = [...filteredMembers].sort((a, b) => {
      const valA = a.pmj_no || a.head_pmj_no || 999999;
      const valB = b.pmj_no || b.head_pmj_no || 999999;
      return valA - valB;
    });

    // 2. Define Headers
    const headers = ["SL NO", "Name", "Father's Name", "Address", "PMJ No", "MR No", "Annual Subs", "Arrears", "Book No", "Page No"];

    // 3. Map Data Rows
    const rows = sorted.map((m, index) => {
      // Logic: Give pmj_no those who dont have from head_pmj_no
      const finalPmj = m.pmj_no || m.head_pmj_no || 'N/A';

      // Wrapping text in double quotes to prevent commas from breaking the Excel columns
      return [
        index + 1,
        `"${(m.name || '').replace(/"/g, '""')}"`,
        `"${(m.father_name || '').replace(/"/g, '""')}"`,
        `"${(m.address || '').replace(/"/g, '""')}"`,
        finalPmj,
        m.mr_no || 'N/A',
        m.annual_subs || '0',
        m.arrears || '0',
        `"${(m.book_no || '').replace(/"/g, '""')}"`,
        `"${(m.page_no || '').replace(/"/g, '""')}"`
      ].join(",");
    });

    // 4. Combine and add UTF-8 BOM so Excel opens Malayalam/Special chars perfectly
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // 5. Trigger Download
    const link = document.createElement("a");
    link.href = url;
    link.download = `PMJ_Members_Export_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Action Handlers ---
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

      <MembersFilter
        totalMembers={members.length}
        filteredCount={filteredMembers.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        maritalFilter={maritalFilter}
        setMaritalFilter={setMaritalFilter}
        onExport={handleExportExcel}
      />

      <MembersTable
        members={filteredMembers}
        loading={loading}
        onEdit={setEditingMember}
        onDelete={setDeletingMember}
      />

      {editingMember && (
        <EditMember
          member={editingMember}
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deletingMember && (
        <DeleteMemberModal
          member={deletingMember}
          loading={deleteLoading}
          onClose={() => setDeletingMember(null)}
          onConfirm={confirmDelete}
        />
      )}

    </div>
  );
}