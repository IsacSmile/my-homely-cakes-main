'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Store, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Upload, Link as LinkIcon, Loader2, X, Sparkles, CheckCircle2, MapPin, ExternalLink, UserCheck, Save } from 'lucide-react';

export default function AdminOutletsPage() {
  const [activeTab, setActiveTab] = useState<'outlets' | 'founder'>('outlets');

  // Outlets states
  const [outletsList, setOutletsList] = useState<any[]>([]);
  const [isLoadingOutlets, setIsLoadingOutlets] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<any | null>(null);

  // Outlet form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('Trivandrum Store');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isUploadingOutletImage, setIsUploadingOutletImage] = useState(false);
  const [showOutletUrlInput, setShowOutletUrlInput] = useState(false);
  const [isSavingOutlet, setIsSavingOutlet] = useState(false);

  // Founder form states
  const [founderName, setFounderName] = useState('');
  const [founderTitle, setFounderTitle] = useState('');
  const [founderPhotoUrl, setFounderPhotoUrl] = useState('');
  const [founderHeading, setFounderHeading] = useState('');
  const [founderExperience, setFounderExperience] = useState('');
  const [founderBio, setFounderBio] = useState('');
  const [isLoadingFounder, setIsLoadingFounder] = useState(true);
  const [isUploadingFounderPhoto, setIsUploadingFounderPhoto] = useState(false);
  const [showFounderUrlInput, setShowFounderUrlInput] = useState(false);
  const [isSavingFounder, setIsSavingFounder] = useState(false);
  const [founderSaveSuccess, setFounderSaveSuccess] = useState(false);

  const outletFileInputRef = useRef<HTMLInputElement>(null);
  const founderFileInputRef = useRef<HTMLInputElement>(null);

  const fetchOutlets = () => {
    fetch('/api/admin/outlets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.outlets)) {
          setOutletsList(data.outlets);
        } else {
          setOutletsList([]);
        }
      })
      .catch(() => setOutletsList([]))
      .finally(() => setIsLoadingOutlets(false));
  };

  const fetchFounder = () => {
    fetch('/api/admin/founder')
      .then(res => res.json())
      .then(data => {
        if (data.founder) {
          setFounderName(data.founder.name || '');
          setFounderTitle(data.founder.title || '');
          setFounderPhotoUrl(data.founder.photoUrl || '');
          setFounderHeading(data.founder.heading || '');
          setFounderExperience(data.founder.experience || '');
          setFounderBio(data.founder.bio || '');
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingFounder(false));
  };

  useEffect(() => {
    fetchOutlets();
    fetchFounder();
  }, []);

  const openAddOutletModal = () => {
    setEditingOutlet(null);
    setName('');
    setAddress('');
    setImageUrl('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80');
    setBadge('TRIVANDRUM STORE');
    setSortOrder(outletsList.length + 1);
    setShowOutletUrlInput(false);
    setIsModalOpen(true);
  };

  const openEditOutletModal = (outlet: any) => {
    setEditingOutlet(outlet);
    setName(outlet.name);
    setAddress(outlet.address);
    setImageUrl(outlet.imageUrl);
    setBadge(outlet.badge || 'TRIVANDRUM STORE');
    setSortOrder(outlet.sortOrder || 1);
    setShowOutletUrlInput(false);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File, target: 'outlet' | 'founder') => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Please upload a valid JPG, PNG, or WebP image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    if (target === 'outlet') setIsUploadingOutletImage(true);
    else setIsUploadingFounderPhoto(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        if (target === 'outlet') setImageUrl(data.url);
        else setFounderPhotoUrl(data.url);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (e) {
      alert('Error uploading image');
    } finally {
      if (target === 'outlet') setIsUploadingOutletImage(false);
      else setIsUploadingFounderPhoto(false);
    }
  };

  const handleReorder = async (outlet: any, direction: 'up' | 'down') => {
    const currentIndex = outletsList.findIndex(o => o.id === outlet.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= outletsList.length) return;

    const targetOutlet = outletsList[targetIndex];
    const newOrderCurrent = targetOutlet.sortOrder || (targetIndex + 1);
    const newOrderTarget = outlet.sortOrder || (currentIndex + 1);

    try {
      await Promise.all([
        fetch(`/api/admin/outlets/${outlet.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: newOrderCurrent }),
        }),
        fetch(`/api/admin/outlets/${targetOutlet.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: newOrderTarget }),
        }),
      ]);
      fetchOutlets();
    } catch (e) {
      console.error('Reorder error', e);
    }
  };

  const handleDeleteOutlet = async (id: string, outletName: string) => {
    if (!confirm(`Are you sure you want to delete outlet "${outletName}"?\n\nIt will be permanently removed from the live About page.`)) return;

    try {
      const res = await fetch(`/api/admin/outlets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOutletsList(prev => prev.filter(o => o.id !== id));
      } else {
        alert('Failed to delete outlet');
      }
    } catch (e) {
      alert('Error deleting outlet');
    }
  };

  const handleSubmitOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !imageUrl) return;

    setIsSavingOutlet(true);
    const payload = { name, address, imageUrl, badge: badge ? badge.trim() : 'TRIVANDRUM STORE', sortOrder: Number(sortOrder) || 1 };

    try {
      const url = editingOutlet ? `/api/admin/outlets/${editingOutlet.id}` : '/api/admin/outlets';
      const method = editingOutlet ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchOutlets();
      } else {
        const err = await res.json();
        alert(err.error || 'Operation failed');
      }
    } catch (e) {
      alert('Failed to save outlet');
    } finally {
      setIsSavingOutlet(false);
    }
  };

  const handleSaveFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFounder(true);
    setFounderSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/founder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: founderName,
          title: founderTitle,
          photoUrl: founderPhotoUrl,
          heading: founderHeading,
          experience: founderExperience,
          bio: founderBio,
        }),
      });

      if (res.ok) {
        setFounderSaveSuccess(true);
        setTimeout(() => setFounderSaveSuccess(false), 4000);
      } else {
        alert('Failed to update founder profile');
      }
    } catch (e) {
      alert('Error saving founder profile');
    } finally {
      setIsSavingFounder(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-bakery-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>About Page Content Management</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate">
            About Page & Store Outlets
          </h1>
          <p className="text-xs text-bakery-800/70 mt-1">
            Manage physical bakery locations and edit the Founder profile displayed on the live About page.
          </p>
        </div>

        {/* Tab Toggle Controls */}
        <div className="flex items-center gap-2 bg-bakery-100/70 p-1.5 rounded-2xl border border-bakery-200">
          <button
            onClick={() => setActiveTab('outlets')}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'outlets'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-bakery-700 hover:text-amber-800 hover:bg-white/60'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Outlets ({outletsList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('founder')}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'founder'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-bakery-700 hover:text-amber-800 hover:bg-white/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Founder Profile</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: OUTLETS MANAGEMENT ─── */}
      {activeTab === 'outlets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-bakery-chocolate flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-600" />
              <span>Outlets & Bakery Locations</span>
            </h2>

            <button
              onClick={openAddOutletModal}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-soft transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Outlet</span>
            </button>
          </div>

          {isLoadingOutlets ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-bakery-200 p-8">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-bakery-600 font-medium">Loading outlets...</p>
            </div>
          ) : outletsList.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-bakery-200 p-8 space-y-4">
              <Store className="w-12 h-12 text-bakery-300 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-bakery-chocolate">No Outlets Available</h3>
              <p className="text-xs text-bakery-600">Click &quot;Add New Outlet&quot; to add bakery locations to your website.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outletsList.map((outlet, idx) => (
                <div
                  key={outlet.id}
                  className="bg-white rounded-3xl overflow-hidden border border-bakery-200/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Storefront Image */}
                    <div className="relative h-48 w-full bg-bakery-100 overflow-hidden">
                      <Image
                        src={outlet.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'}
                        alt={outlet.name}
                        fill
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-amber-900/80 backdrop-blur-xs text-amber-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-700/50">
                        {outlet.badge || 'TRIVANDRUM STORE'}
                      </span>
                      <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Order #{outlet.sortOrder || idx + 1}
                      </span>
                    </div>

                    {/* Info Container */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-serif text-base font-bold text-bakery-chocolate line-clamp-1">
                        {outlet.name}
                      </h3>
                      
                      <div className="flex items-start gap-2 text-xs text-bakery-800/80 leading-relaxed bg-bakery-50/80 p-3 rounded-2xl border border-bakery-100">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <address className="not-italic text-[11px] leading-snug">{outlet.address}</address>
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(outlet.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 hover:text-amber-800 pt-1"
                      >
                        <span>Test Google Maps Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-bakery-100 flex items-center justify-between gap-2 bg-bakery-50/40">
                    {/* Reorder Up/Down */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-bakery-200 shadow-2xs">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleReorder(outlet, 'up')}
                        className="p-1.5 text-bakery-500 hover:text-amber-800 disabled:opacity-30 transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === outletsList.length - 1}
                        onClick={() => handleReorder(outlet, 'down')}
                        className="p-1.5 text-bakery-500 hover:text-amber-800 disabled:opacity-30 transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit & Delete */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditOutletModal(outlet)}
                        className="bg-white hover:bg-amber-50 text-bakery-chocolate font-bold text-xs py-2 px-3 rounded-xl border border-bakery-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOutlet(outlet.id, outlet.name)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200/60 transition-colors cursor-pointer"
                        title="Delete Outlet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: FOUNDER PROFILE EDITING ─── */}
      {activeTab === 'founder' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-bakery-200/80 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-bakery-100 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-bakery-chocolate flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-600" />
                <span>Founder Profile & Story Editor</span>
              </h2>
              <p className="text-xs text-bakery-600 mt-0.5">
                Update the founder photo, name, title, heading, and bio copy shown on the About page.
              </p>
            </div>

            {founderSaveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved Live!
              </span>
            )}
          </div>

          {isLoadingFounder ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-bakery-600 font-medium">Loading founder details...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveFounder} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-bakery-chocolate block mb-1">Founder Name *</label>
                  <input
                    type="text"
                    required
                    value={founderName}
                    onChange={(e) => setFounderName(e.target.value)}
                    placeholder="e.g. Aswathy S."
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-bakery-chocolate block mb-1">Title / Designation *</label>
                  <input
                    type="text"
                    required
                    value={founderTitle}
                    onChange={(e) => setFounderTitle(e.target.value)}
                    placeholder="e.g. Founder & Head Baker"
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Main Heading *</label>
                <input
                  type="text"
                  required
                  value={founderHeading}
                  onChange={(e) => setFounderHeading(e.target.value)}
                  placeholder="e.g. Baking with Pure Love, Tradition & Zero Preservatives"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Experience Badge Text</label>
                <input
                  type="text"
                  value={founderExperience}
                  onChange={(e) => setFounderExperience(e.target.value)}
                  placeholder="e.g. 10+ Years of Passionate Home Baking"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Founder Photo Box */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-700" />
                  Founder Photo *
                </label>

                <input
                  type="file"
                  ref={founderFileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'founder')}
                  className="hidden"
                />

                {isUploadingFounderPhoto ? (
                  <div className="py-6 rounded-xl bg-white border border-dashed border-amber-300 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                    <span className="text-xs font-bold text-amber-800">Uploading founder photo...</span>
                  </div>
                ) : founderPhotoUrl ? (
                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-amber-200">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-amber-400 shrink-0 bg-bakery-100">
                      <Image src={founderPhotoUrl} alt="Founder Preview" fill unoptimized className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Photo Selected
                      </span>
                      <p className="text-[10px] text-bakery-500 truncate">{founderPhotoUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => founderFileInputRef.current?.click()}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] px-3 py-1.5 rounded-lg border border-amber-200 shrink-0 cursor-pointer"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => founderFileInputRef.current?.click()}
                    className="py-6 rounded-xl bg-white border-2 border-dashed border-amber-300 hover:border-amber-500 cursor-pointer text-center space-y-1"
                  >
                    <Upload className="w-5 h-5 text-amber-700 mx-auto" />
                    <span className="text-xs font-bold text-bakery-chocolate block">Click to upload founder photo</span>
                    <span className="text-[10px] text-bakery-500 block">JPG, PNG, WebP up to 5MB</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowFounderUrlInput(!showFounderUrlInput)}
                  className="text-[10px] font-semibold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3 text-amber-600" />
                  <span>{showFounderUrlInput ? 'Hide URL paste option' : 'or paste photo URL'}</span>
                </button>

                {showFounderUrlInput && (
                  <input
                    type="url"
                    value={founderPhotoUrl}
                    onChange={(e) => setFounderPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-bakery-chocolate focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Founder Story & Bio Copy (Separate paragraphs with double newlines) *</label>
                <textarea
                  rows={6}
                  required
                  value={founderBio}
                  onChange={(e) => setFounderBio(e.target.value)}
                  placeholder="Paragraph 1...\n\nParagraph 2...\n\nParagraph 3..."
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600 leading-relaxed font-mono"
                />
              </div>

              <div className="pt-3 border-t border-bakery-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSavingFounder || isUploadingFounderPhoto}
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-soft disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingFounder ? 'Saving Changes...' : 'Save Founder Profile'}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* Add / Edit Outlet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-bakery-chocolate flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-600" />
                {editingOutlet ? 'Edit Bakery Outlet' : 'Add New Outlet'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-bakery-100 text-bakery-400 hover:text-bakery-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOutlet} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Outlet Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MyHomelyCake — Kowdiar Flagship"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Badge Name (e.g. TRIVANDRUM STORE)</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. TRIVANDRUM STORE"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600 uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Full Address *</label>
                <textarea
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near Golf Club, Main Road, Kowdiar, Thiruvananthapuram, Kerala 695003"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Display Sort Order</label>
                <input
                  type="number"
                  min={1}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Outlet Image Upload Box */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-700" />
                  Outlet Storefront Image *
                </label>

                <input
                  type="file"
                  ref={outletFileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'outlet')}
                  className="hidden"
                />

                {isUploadingOutletImage ? (
                  <div className="py-6 rounded-xl bg-white border border-dashed border-amber-300 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                    <span className="text-xs font-bold text-amber-800">Uploading outlet image...</span>
                  </div>
                ) : imageUrl ? (
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-amber-200">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-amber-400 shrink-0 bg-bakery-100">
                      <Image src={imageUrl} alt="Preview" fill unoptimized className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Image Loaded
                      </span>
                      <p className="text-[10px] text-bakery-500 truncate">{imageUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => outletFileInputRef.current?.click()}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] px-3 py-1.5 rounded-lg border border-amber-200 shrink-0 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => outletFileInputRef.current?.click()}
                    className="py-6 rounded-xl bg-white border-2 border-dashed border-amber-300 hover:border-amber-500 cursor-pointer text-center space-y-1"
                  >
                    <Upload className="w-5 h-5 text-amber-700 mx-auto" />
                    <span className="text-xs font-bold text-bakery-chocolate block">Click to upload storefront image</span>
                    <span className="text-[10px] text-bakery-500 block">JPG, PNG, WebP up to 5MB</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowOutletUrlInput(!showOutletUrlInput)}
                  className="text-[10px] font-semibold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3 text-amber-600" />
                  <span>{showOutletUrlInput ? 'Hide URL paste option' : 'or paste photo URL'}</span>
                </button>

                {showOutletUrlInput && (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-bakery-chocolate focus:outline-none"
                  />
                )}
              </div>

              <div className="pt-3 border-t border-bakery-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-bakery-600 hover:bg-bakery-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingOutlet || isUploadingOutletImage}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-soft disabled:opacity-50 cursor-pointer"
                >
                  {isSavingOutlet ? 'Saving...' : editingOutlet ? 'Update Outlet' : 'Create Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
