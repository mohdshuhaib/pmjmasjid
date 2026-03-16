"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Widow } from "./EditWidow";

interface DeleteModalProps {
  widow: Widow;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteWidowModal({ widow, loading, onClose, onConfirm }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Record?</h2>
        <p className="text-slate-500 text-sm mb-6">
          Are you absolutely sure you want to delete <strong>{widow.name}</strong>?
          <br /><br />This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}