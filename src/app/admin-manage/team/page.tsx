'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Users, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Upload, Link as LinkIcon, RefreshCw, Loader2, X, Sparkles, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminTeamPage() {
  const [teamList, setTeamList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTeam = () => {
    fetch('/api/team')
      .then(res => res.json())
      .then(data => {
        if (data.members) setTeamList(data.members);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setOccupation('');
    setPhotoUrl('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80');
    setBio('');
    setShowUrlInput(false);
    setIsModalOpen(true);
  };

  const openEditModal = (member: any) => {
    setEditingMember(member);
    setName(member.name);
    setOccupation(member.occupation);
    setPhotoUrl(member.photoUrl);
    setBio(member.bio || '');
    setShowUrlInput(false);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Please upload a valid JPG, PNG, or WebP image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setPhotoUrl(data.url);
      } else {
        alert(data.error || 'Failed to upload photo');
      }
    } catch (e) {
      alert('Error uploading photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', direction }),
      });
      if (res.ok) {
        fetchTeam();
      }
    } catch (e) {
      console.error('Reorder error', e);
    }
  };

  const handleDelete = async (id: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove "${memberName}" from the team list?`)) return;

    try {
      const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTeamList(prev => prev.filter(m => m.id !== id));
      } else {
        alert('Failed to delete team member');
      }
    } catch (e) {
      alert('Error deleting team member');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !occupation || !photoUrl) return;

    setIsSaving(true);
    const payload = { name, occupation, photoUrl, bio };

    try {
      const url = editingMember ? `/api/team/${editingMember.id}` : '/api/team';
      const method = editingMember ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchTeam();
      } else {
        const err = await res.json();
        alert(err.error || 'Operation failed');
      }
    } catch (e) {
      alert('Failed to save team member');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-bakery-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Home Page &quot;Meet the Team&quot; Showcase</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate">
            Team & Bakers Management ({teamList.length})
          </h1>
          <p className="text-xs text-bakery-800/70 mt-1">
            Manage the artisans, bakers, and coordinators featured in the Home page &quot;Behind the Scenes&quot; carousel.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-3 rounded-full shadow-soft transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Team Members Grid / List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-bakery-200 p-8">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-bakery-600 font-medium">Loading team members...</p>
        </div>
      ) : teamList.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-bakery-200 p-8 space-y-4">
          <Users className="w-12 h-12 text-bakery-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate">No Team Members Found</h3>
          <p className="text-xs text-bakery-600">Click &quot;Add Team Member&quot; to populate your home page section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamList.map((member, idx) => (
            <div
              key={member.id}
              className="bg-white rounded-3xl p-5 border border-bakery-200/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Photo Header */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-600/40 ring-4 ring-amber-50 shadow-xs shrink-0">
                    <Image
                      src={member.photoUrl || '/cake-placeholder.svg'}
                      alt={member.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-base font-bold text-bakery-chocolate truncate">
                      {member.name}
                    </h3>
                    <span className="inline-block bg-amber-50 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200/60 mt-1 truncate max-w-full">
                      {member.occupation}
                    </span>
                  </div>
                </div>

                {/* Bio snippet */}
                {member.bio && (
                  <p className="text-xs text-bakery-800/70 line-clamp-2 leading-relaxed bg-bakery-50 p-3 rounded-2xl border border-bakery-100">
                    &quot;{member.bio}&quot;
                  </p>
                )}
              </div>

              {/* Action Toolbar & Reorder controls */}
              <div className="pt-4 border-t border-bakery-100 flex items-center justify-between gap-2 mt-4">
                {/* Reorder Up/Down */}
                <div className="flex items-center gap-1 bg-bakery-50 p-1 rounded-xl border border-bakery-200">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleReorder(member.id, 'up')}
                    className="p-1 text-bakery-500 hover:text-amber-800 disabled:opacity-30 transition-colors"
                    title="Move Left/Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === teamList.length - 1}
                    onClick={() => handleReorder(member.id, 'down')}
                    className="p-1 text-bakery-500 hover:text-amber-800 disabled:opacity-30 transition-colors"
                    title="Move Right/Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Edit & Delete Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(member)}
                    className="bg-bakery-50 hover:bg-bakery-100 text-bakery-chocolate font-semibold text-xs py-2 px-3 rounded-xl border border-bakery-200 flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200/60 transition-colors"
                    title="Delete Team Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Team Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 relative">
            
            <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-bakery-chocolate flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-bakery-100 text-bakery-400 hover:text-bakery-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Member Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anitha Kumar"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Occupation / Role *</label>
                <input
                  type="text"
                  required
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Head Baker & Founder"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Photo File Upload Box */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-700" />
                  Member Photo (Upload Primary) *
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />

                {isUploading ? (
                  <div className="py-6 rounded-xl bg-white border border-dashed border-amber-300 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                    <span className="text-xs font-bold text-amber-800">Uploading photo...</span>
                  </div>
                ) : photoUrl ? (
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-amber-200">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-400 shrink-0">
                      <Image src={photoUrl} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Photo Loaded
                      </span>
                      <p className="text-[10px] text-bakery-500 truncate">{photoUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] px-3 py-1.5 rounded-lg border border-amber-200 shrink-0"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="py-6 rounded-xl bg-white border-2 border-dashed border-amber-300 hover:border-amber-500 cursor-pointer text-center space-y-1"
                  >
                    <Upload className="w-5 h-5 text-amber-700 mx-auto" />
                    <span className="text-xs font-bold text-bakery-chocolate block">Click to upload photo</span>
                    <span className="text-[10px] text-bakery-500 block">JPG, PNG, WebP up to 5MB</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[10px] font-semibold text-amber-800 hover:underline flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3 text-amber-600" />
                  <span>{showUrlInput ? 'Hide URL paste option' : 'or paste photo URL'}</span>
                </button>

                {showUrlInput && (
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-bakery-chocolate focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Short Quote / Bio (Optional)</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Master decorator with 10 years of sugar craft experience..."
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-3 border-t border-bakery-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-bakery-600 hover:bg-bakery-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-soft disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
