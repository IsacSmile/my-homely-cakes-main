'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Settings, Lock, Mail, CheckCircle2, ShieldAlert, Sparkles, Upload, Link as LinkIcon, RefreshCw, Loader2, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { HeroSlide } from '@/app/api/hero/route';

export const dynamic = 'force-dynamic';

export default function AdminSettingsPage() {
  const [email, setEmail] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Hero Section Customization state
  const [heroBadge, setHeroBadge] = useState('');
  const [heroHeading, setHeroHeading] = useState('');
  const [heroSubheading, setHeroSubheading] = useState('');
  const [ctaPrimaryText, setCtaPrimaryText] = useState('');
  const [ctaPrimaryLink, setCtaPrimaryLink] = useState('');
  const [ctaSecondaryText, setCtaSecondaryText] = useState('');
  const [ctaSecondaryPhone, setCtaSecondaryPhone] = useState('');
  
  // Dynamic Hero Slides Array State
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [showUrlOption, setShowUrlOption] = useState<boolean[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [message, setMessage] = useState('');
  const [heroMessage, setHeroMessage] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings').then(res => res.json()),
      fetch('/api/hero').then(res => res.json())
    ])
      .then(([settingsData, heroData]) => {
        if (settingsData) {
          setEmail(settingsData.email || '');
          setNewEmail(settingsData.email || '');
          setNotificationEmail(settingsData.notificationEmail || 'myhomelycakes@gmail.com');
        }

        if (heroData) {
          setHeroBadge(heroData.badge || '');
          setHeroHeading(heroData.heading || '');
          setHeroSubheading(heroData.subheading || '');
          setCtaPrimaryText(heroData.ctaPrimaryText || '');
          setCtaPrimaryLink(heroData.ctaPrimaryLink || '');
          setCtaSecondaryText(heroData.ctaSecondaryText || '');
          setCtaSecondaryPhone(heroData.ctaSecondaryPhone || '');
          setHeroSlides(heroData.slides || []);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleHeroFileUpload = async (index: number, file: File) => {
    setUploadingIndex(index);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setHeroSlides(prev => {
          const copy = [...prev];
          copy[index] = { ...copy[index], imageUrl: data.url };
          return copy;
        });
      } else {
        alert(data.error || 'Failed to upload photo');
      }
    } catch (e) {
      alert('Error uploading photo');
    } finally {
      setUploadingIndex(null);
      setActiveUploadIndex(null);
    }
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: 'hs_' + Date.now(),
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
      cardTag: 'SPECIAL FAV',
      cardTitle: 'Custom Artisanal Cake',
      cardPrice: '₹700',
      linkUrl: '/shop',
    };
    setHeroSlides(prev => [...prev, newSlide]);
  };

  const handleDeleteSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      alert('You must keep at least 1 hero image slide.');
      return;
    }
    if (confirm('Delete this hero photo slide?')) {
      setHeroSlides(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= heroSlides.length) return;

    setHeroSlides(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: string) => {
    setHeroSlides(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveHeroSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeroMessage('');
    setIsSavingHero(true);

    try {
      const res = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badge: heroBadge,
          heading: heroHeading,
          subheading: heroSubheading,
          ctaPrimaryText,
          ctaPrimaryLink,
          ctaSecondaryText,
          ctaSecondaryPhone,
          slides: heroSlides,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHeroMessage('Home page Hero banner updated successfully! 🚀');
      } else {
        alert(data.error || 'Failed to update Hero settings');
      }
    } catch (err) {
      alert('Error saving Hero settings');
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleSaveAccountSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentPassword) {
      setError('Current password is required to save account changes.');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newEmail,
          newPassword,
          notificationEmail,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Settings updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setEmail(data.email);
      } else {
        setError(data.error || 'Failed to update settings.');
      }
    } catch (err) {
      setError('Network error updating settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-bakery-600">Loading admin settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate">
          Admin Settings & Hero Customization
        </h1>
        <p className="text-xs text-bakery-600 mt-1">
          Add, edit, or delete Hero banner slides with live redirect links, prices, titles, and store notification credentials.
        </p>
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files?.[0] && activeUploadIndex !== null) {
            handleHeroFileUpload(activeUploadIndex, e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* HERO SECTION CUSTOMIZATION CARD */}
      <form onSubmit={handleSaveHeroSettings} className="bg-white rounded-3xl p-6 md:p-8 border border-amber-200/80 shadow-soft space-y-8">
        <div className="border-b border-bakery-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-bakery-chocolate flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Home Page Hero Banner & Slides Manager</span>
            </h3>
            <p className="text-[11px] text-bakery-600 mt-0.5">Customize main hero titles, CTA buttons, and manage individual hero slides (Add, Edit, Delete)</p>
          </div>

          <button
            type="submit"
            disabled={isSavingHero}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-soft transition-all shrink-0 disabled:opacity-50"
          >
            {isSavingHero ? 'Saving Hero...' : 'Save Hero Banner'}
          </button>
        </div>

        {heroMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{heroMessage}</span>
          </div>
        )}

        {/* DYNAMIC HERO SLIDES MANAGER */}
        <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-amber-900 block">
                Hero Image Slides ({heroSlides.length} Active Slides)
              </label>
              <span className="text-[10px] text-amber-800">Cycles every 3s if 2+ slides exist. You can add or delete slides as needed.</span>
            </div>

            <button
              type="button"
              onClick={handleAddSlide}
              className="inline-flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Slide</span>
            </button>
          </div>

          <div className="space-y-4">
            {heroSlides.map((slide, index) => (
              <div key={slide.id || index} className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4 relative">
                
                {/* Header Row for Slide Item */}
                <div className="flex items-center justify-between border-b border-bakery-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                      Slide #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-bakery-chocolate truncate max-w-[200px]">
                      {slide.cardTitle || 'Untitled Cake'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-bakery-50 hover:bg-amber-100 text-bakery-800 disabled:opacity-30 transition-colors"
                      title="Move Slide Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(index, 'down')}
                      disabled={index === heroSlides.length - 1}
                      className="p-1.5 rounded-lg bg-bakery-50 hover:bg-amber-100 text-bakery-800 disabled:opacity-30 transition-colors"
                      title="Move Slide Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(index)}
                      className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center gap-1 transition-colors ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* Photo Preview & Upload */}
                  <div className="sm:col-span-4 space-y-2">
                    {uploadingIndex === index ? (
                      <div className="h-36 rounded-xl bg-amber-50 border border-dashed border-amber-300 flex flex-col items-center justify-center space-y-1">
                        <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                        <span className="text-[10px] font-bold text-amber-800">Uploading...</span>
                      </div>
                    ) : slide.imageUrl ? (
                      <div className="relative h-36 w-full rounded-xl overflow-hidden bg-bakery-100 border border-bakery-200 group">
                        <Image src={slide.imageUrl} alt={`Slide ${index + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setActiveUploadIndex(index);
                            fileInputRef.current?.click();
                          }}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Replace Photo
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setActiveUploadIndex(index);
                          fileInputRef.current?.click();
                        }}
                        className="h-36 rounded-xl bg-bakery-50 hover:bg-amber-50 border-2 border-dashed border-bakery-300 hover:border-amber-500 cursor-pointer flex flex-col items-center justify-center text-center p-2 space-y-1"
                      >
                        <Upload className="w-4 h-4 text-amber-700" />
                        <span className="text-[10px] font-bold text-bakery-chocolate block">Upload Photo</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowUrlOption(prev => {
                        const copy = [...prev];
                        copy[index] = !copy[index];
                        return copy;
                      })}
                      className="text-[10px] font-semibold text-amber-800 hover:underline flex items-center gap-1"
                    >
                      <LinkIcon className="w-3 h-3 text-amber-600" />
                      <span>{showUrlOption[index] ? 'Hide URL paste' : 'or paste image URL'}</span>
                    </button>

                    {showUrlOption[index] && (
                      <input
                        type="url"
                        value={slide.imageUrl}
                        onChange={(e) => handleSlideChange(index, 'imageUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-bakery-50 border border-bakery-200 rounded-lg px-2 py-1 text-[10px]"
                      />
                    )}
                  </div>

                  {/* Slide Fields: Tag, Title, Price, Link */}
                  <div className="sm:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-bakery-chocolate block mb-1">Featured Card Tag</label>
                      <input
                        type="text"
                        value={slide.cardTag}
                        onChange={(e) => handleSlideChange(index, 'cardTag', e.target.value)}
                        placeholder="e.g. TRIVANDRUM FAVORITE"
                        className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-1.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-bakery-chocolate block mb-1">Cake Name / Title *</label>
                      <input
                        type="text"
                        required
                        value={slide.cardTitle}
                        onChange={(e) => handleSlideChange(index, 'cardTitle', e.target.value)}
                        placeholder="Tender Coconut Dream Cake"
                        className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-1.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-bakery-chocolate block mb-1">Cake Price *</label>
                      <input
                        type="text"
                        required
                        value={slide.cardPrice}
                        onChange={(e) => handleSlideChange(index, 'cardPrice', e.target.value)}
                        placeholder="₹650"
                        className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-1.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600 font-price"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-bakery-chocolate block mb-1">Redirect / Product Link</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={slide.linkUrl || '/shop'}
                          onChange={(e) => handleSlideChange(index, 'linkUrl', e.target.value)}
                          placeholder="/shop"
                          className="w-full bg-bakery-50 border border-bakery-200 rounded-xl pl-3 pr-7 py-1.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                        />
                        <ExternalLink className="w-3.5 h-3.5 text-amber-700 absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        </div>

        {/* TEXT CONTENT FIELDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Header Badge Text</label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="e.g. Trivandrum's Most Loved Home Bakery"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Primary Button Link</label>
            <input
              type="text"
              value={ctaPrimaryLink}
              onChange={(e) => setCtaPrimaryLink(e.target.value)}
              placeholder="/shop"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Main Heading *</label>
            <textarea
              rows={2}
              required
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              placeholder="Freshly Baked Homemade Cakes Delivered in Trivandrum."
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs font-bold text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Subheading / Description *</label>
            <textarea
              rows={3}
              required
              value={heroSubheading}
              onChange={(e) => setHeroSubheading(e.target.value)}
              placeholder="Handcrafted with 100% natural butter..."
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Primary Button Text</label>
            <input
              type="text"
              value={ctaPrimaryText}
              onChange={(e) => setCtaPrimaryText(e.target.value)}
              placeholder="e.g. Explore Cake Menu"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Secondary Button Phone Number</label>
            <input
              type="text"
              value={ctaSecondaryPhone}
              onChange={(e) => setCtaSecondaryPhone(e.target.value)}
              placeholder="+91 99470 66011"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingHero}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-xs shadow-soft transition-all active:scale-95 disabled:opacity-50"
        >
          {isSavingHero ? 'Updating Hero Banner...' : 'Save All Hero Banner Settings'}
        </button>
      </form>

      {/* ACCOUNT & NOTIFICATIONS SETTINGS */}
      <form onSubmit={handleSaveAccountSettings} className="bg-white rounded-3xl p-6 md:p-8 border border-bakery-200 shadow-soft space-y-6">
        
        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Notifications Settings */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate flex items-center gap-2 border-b border-bakery-100 pb-2">
            <Mail className="w-4 h-4 text-amber-700" />
            <span>Store Email Alerts</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-bakery-800 block mb-1">
              Admin Notification Email (for Resend order emails)
            </label>
            <input
              type="email"
              required
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="myhomelycakes@gmail.com"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>

        {/* Section 2: Account Security */}
        <div className="space-y-4 pt-4 border-t border-bakery-200">
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate flex items-center gap-2 border-b border-bakery-100 pb-2">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>Admin Credentials Update</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-bakery-800 block mb-1">
              Admin Login Email
            </label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-800 block mb-1">
              New Password (leave blank if keeping current password)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="pt-2 bg-amber-50 p-4 rounded-2xl border border-amber-200/60">
            <label className="text-xs font-bold text-amber-900 block mb-1">
              Confirm Current Password * (Required to save account changes)
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-700"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-xs shadow-soft transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? 'Updating Settings...' : 'Save Account Settings'}
        </button>
      </form>
    </div>
  );
}
