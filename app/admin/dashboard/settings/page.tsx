"use client";

import React, { useState, useEffect } from "react";
import {
  Settings, Users, Shield, Plus, Edit, Trash2,
  Save, X, CheckCircle2, AlertCircle
} from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

interface CommitteeMember {
  id: string;
  name: string;
  role_key: string;
  contact_number: string;
  display_order: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"committee" | "security">("committee");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Initialize the SSR-compatible browser client to correctly read secure cookies
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // --- COMMITTEE STATE ---
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState<Partial<CommitteeMember>>({
    name: "", role_key: "", contact_number: "", display_order: 0
  });

  // --- PASSWORD STATE ---
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Fetch Members on Mount
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    const { data, error } = await supabase
      .from('committee_members')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setMembers(data);
    }
    setLoadingMembers(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // --- COMMITTEE ACTIONS ---
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const isUpdate = !!currentMember.id;

    if (isUpdate) {
      const { error } = await supabase
        .from('committee_members')
        .update({
          name: currentMember.name,
          role_key: currentMember.role_key,
          contact_number: currentMember.contact_number,
          display_order: currentMember.display_order
        })
        .eq('id', currentMember.id);

      if (error) showMessage('error', error.message);
      else showMessage('success', 'Committee member updated successfully!');
    } else {
      const { error } = await supabase
        .from('committee_members')
        .insert([{
          name: currentMember.name,
          role_key: currentMember.role_key,
          contact_number: currentMember.contact_number,
          display_order: currentMember.display_order
        }]);

      if (error) showMessage('error', error.message);
      else showMessage('success', 'Committee member added successfully!');
    }

    setIsEditing(false);
    setCurrentMember({ name: "", role_key: "", contact_number: "", display_order: 0 });
    fetchMembers();
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this committee member?")) return;

    const { error } = await supabase.from('committee_members').delete().eq('id', id);
    if (error) {
      showMessage('error', error.message);
    } else {
      showMessage('success', 'Member removed successfully.');
      fetchMembers();
    }
  };

  const startEdit = (member: CommitteeMember) => {
    setCurrentMember(member);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setCurrentMember({ name: "", role_key: "", contact_number: "", display_order: 0 });
    setIsEditing(false);
  };

  // --- PASSWORD ACTIONS ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showMessage('error', "Passwords do not match!");
      return;
    }
    if (passwords.newPassword.length < 6) {
      showMessage('error', "Password must be at least 6 characters long.");
      return;
    }

    setLoadingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: passwords.newPassword
    });

    if (error) {
      showMessage('error', error.message);
    } else {
      showMessage('success', 'Password updated successfully!');
      setPasswords({ newPassword: "", confirmPassword: "" });
    }
    setLoadingPassword(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-emerald-600" />
          System Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage committee members and update your security settings.</p>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("committee")}
          className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 ${activeTab === 'committee' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Users className="w-4 h-4" /> Committee Management
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 ${activeTab === 'security' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Shield className="w-4 h-4" /> Account Security
        </button>
      </div>

      {/* Global Status Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* --- TAB CONTENT: COMMITTEE --- */}
      {activeTab === "committee" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Member List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-bold text-slate-800">Current Members</h2>
                <button onClick={() => {cancelEdit(); setIsEditing(true);}} className="text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {loadingMembers ? (
                  <div className="p-8 text-center text-slate-400">Loading members...</div>
                ) : members.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No committee members found.</div>
                ) : (
                  members.map(member => (
                    <div key={member.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800">{member.name}</p>
                        <div className="flex items-center gap-3 text-sm mt-1">
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium uppercase tracking-wider text-[10px]">
                            {member.role_key}
                          </span>
                          <span className="text-slate-500">{member.contact_number}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteMember(member.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Add/Edit Form */}
          {isEditing && (
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24 animate-in slide-in-from-right-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  {currentMember.id ? <Edit className="w-5 h-5 text-emerald-600"/> : <Plus className="w-5 h-5 text-emerald-600"/>}
                  {currentMember.id ? 'Edit Member' : 'Add New Member'}
                </h2>
                <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" required value={currentMember.name || ""} onChange={e => setCurrentMember({...currentMember, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Abdul Rahman" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role Key (Used for Translation)</label>
                  <input type="text" required value={currentMember.role_key || ""} onChange={e => setCurrentMember({...currentMember, role_key: e.target.value.toLowerCase()})} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. president, secretary, member" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Number</label>
                  <input type="text" required value={currentMember.contact_number || ""} onChange={e => setCurrentMember({...currentMember, contact_number: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. +91 98765 43210" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Display Order (1 is first)</label>
                  <input type="number" required value={currentMember.display_order || 0} onChange={e => setCurrentMember({...currentMember, display_order: parseInt(e.target.value)})} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2">
                  <Save className="w-4 h-4" /> Save Member
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: SECURITY --- */}
      {activeTab === "security" && (
        <div className="max-w-md">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 text-lg mb-2">Change Password</h2>
            <p className="text-sm text-slate-500 mb-6">Update your admin portal access password. You will remain logged in after saving.</p>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwords.newPassword}
                  onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loadingPassword}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 mt-2"
              >
                {loadingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}