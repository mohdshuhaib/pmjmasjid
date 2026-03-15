"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import EditWidow, { Widow } from "@/components/admin/EditWidow";
import WidowsFilter from "@/components/admin/WidowsFilter";
import WidowsTable from "@/components/admin/WidowsTable";
import DeleteWidowModal from "@/components/admin/DeleteWidowModal";

export default function WidowsPage() {
  const [widows, setWidows] = useState<Widow[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deceased">("all");

  const [editingWidow, setEditingWidow] = useState<Widow | null>(null);
  const [deletingWidow, setDeletingWidow] = useState<Widow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  useEffect(() => {
    async function fetchWidows() {
      setLoading(true);

      const { data, error } = await supabase
        .from("widows")
        .select("*")
        .order("pmj_no", { ascending: true });

      if (!error && data) {
        setWidows(data);
      }

      setLoading(false);
    }

    fetchWidows();
  }, [supabase]);

  const filteredWidows = useMemo(() => {
    return widows.filter((widow) => {
      if (statusFilter !== "all" && widow.status !== statusFilter) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = widow.name.toLowerCase().includes(q);
        const matchesAddress = (widow.address || "").toLowerCase().includes(q);
        const matchesPmj = widow.pmj_no?.toString().includes(q);
        const matchesBook = (widow.book_no || "").toLowerCase().includes(q);
        const matchesPage = (widow.page_no || "").toLowerCase().includes(q);

        if (!matchesName && !matchesAddress && !matchesPmj && !matchesBook && !matchesPage) {
          return false;
        }
      }

      return true;
    });
  }, [widows, statusFilter, searchQuery]);

  const handleSaveEdit = (updatedWidow: Widow) => {
    setWidows((prev) => prev.map((w) => (w.id === updatedWidow.id ? updatedWidow : w)));
  };

  const confirmDelete = async () => {
    if (!deletingWidow) return;

    setDeleteLoading(true);

    const { error } = await supabase.from("widows").delete().eq("id", deletingWidow.id);

    if (!error) {
      setWidows((prev) => prev.filter((w) => w.id !== deletingWidow.id));
      setDeletingWidow(null);
    } else {
      alert("Failed to delete widow: " + error.message);
    }

    setDeleteLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <WidowsFilter
        totalWidows={widows.length}
        filteredCount={filteredWidows.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <WidowsTable
        widows={filteredWidows}
        loading={loading}
        onEdit={setEditingWidow}
        onDelete={setDeletingWidow}
      />

      {editingWidow && (
        <EditWidow
          widow={editingWidow}
          isOpen={!!editingWidow}
          onClose={() => setEditingWidow(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deletingWidow && (
        <DeleteWidowModal
          widow={deletingWidow}
          loading={deleteLoading}
          onClose={() => setDeletingWidow(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}