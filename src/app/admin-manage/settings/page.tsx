'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Settings, Lock, Mail, CheckCircle2, ShieldAlert, Sparkles, Upload, Link as LinkIcon, RefreshCw, Loader2 } from 'lucide-react';

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
  const [heroImages, setHeroImages] = useState<string[]>(['', '', '']);
  const [cardTag, setCardTag] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [cardPrice, setCardPrice] = useState('');

  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>([false, false, false]);
  const [showUrlOption, setShowUrlOption] = useState<boolean[]>([false, false, false]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [message, setMessage] = useState('');
  const [heroMessage, setHeroMessage] = useState('');
  const [error, setError] = useState('');

  const fileInputRef0 = useRef<HTMLInputElement>(null);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings').then(res => res.json()),
      fetch('/api/hero').then(res => res.json())
    ])
      .then(([settingsData, heroData]) => {
        if (settingsData) {
          setEmail(settingsData.email || '');
          setNewEmail(settingsData.email || '');
          setNotificationEmail(settingsData.notificationEmail || 'orders@myhomelycakes.com');
        }

        if (heroData) {
          setHeroBadge(heroData.badge || '');
          setHeroHeading(heroData.heading || '');
          setHeroSubheading(heroData.subheading || '');
          setCtaPrimaryText(heroData.ctaPrimaryText || '');
          setCtaPrimaryLink(heroData.ctaPrimaryLink || '');
          setCtaSecondaryText(heroData.ctaSecondaryText || '');
          setCtaSecondaryPhone(heroData.ctaSecondaryPhone || '');
          setHeroImages(heroData.images && heroData.images.length === 3 ? heroData.images : ['', '', '']);
          setCardTag(heroData.cardTag || '');
          setCardTitle(heroData.cardTitle || '');
          setCardPrice(heroData.cardPrice || '');
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleHeroFileUpload = async (slotIdx: number, file: File) => {
    setUploadingSlots(prev => {
      const copy = [...prev];
      copy[slotIdx] = true;
      return copy;
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setHeroImages(prev => {
          const copy = [...prev];
          copy[slotIdx] = data.url;
          return copy;
        });
      } else {
        alert(data.error || 'Failed to upload photo');
      }
    } catch (e) {
      alert('Error uploading photo');
    } finally {
      setUploadingSlots(prev => {
        const copy = [...prev];
        copy[slotIdx] = false;
        return copy;
      });
    }
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
          images: heroImages,
          cardTag,
          cardTitle,
          cardPrice,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHeroMessage('Home page Hero section updated successfully! 🚀');
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

  const fileInputRefs = [fileInputRef0, fileInputRef1, fileInputRef2];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate">
          Admin Settings & Hero Customization
        </h1>
        <p className="text-xs text-bakery-600 mt-1">
          Customize the Home page Hero banner text & images, login credentials, and store notification email alerts.
        </p>
      </div>

      {/* HERO SECTION CUSTOMIZATION CARD */}
      <form onSubmit={handleSaveHeroSettings} className="bg-white rounded-3xl p-6 md:p-8 border border-amber-200/80 shadow-soft space-y-6">
        <div className="border-b border-bakery-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-bakery-chocolate flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Home Page Hero Section Customization</span>
            </h3>
            <p className="text-[11px] text-bakery-600">Change badge, main heading, subheading, CTA buttons, and 3 auto-fading hero images</p>
          </div>

          <button
            type="submit"
            disabled={isSavingHero}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-soft transition-all shrink-0 disabled:opacity-50"
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

        {/* 3 HERO IMAGES AUTO-FADE SLOTS */}
        <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200/80 space-y-3">
          <label className="text-xs font-bold text-amber-900 block">
            3 Auto-Fading Hero Photos (Cycles every 3 seconds) *
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((slotIdx) => (
              <div key={slotIdx} className="bg-white p-3 rounded-2xl border border-amber-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-bakery-chocolate block">
                  Photo Slot {slotIdx + 1}
                </span>

                <input
                  type="file"
                  ref={fileInputRefs[slotIdx]}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => e.target.files?.[0] && handleHeroFileUpload(slotIdx, e.target.files[0])}
                  className="hidden"
                />

                {uploadingSlots[slotIdx] ? (
                  <div className="h-32 rounded-xl bg-amber-50 border border-dashed border-amber-300 flex flex-col items-center justify-center space-y-1">
                    <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                    <span className="text-[10px] font-bold text-amber-800">Uploading...</span>
                  </div>
                ) : heroImages[slotIdx] ? (
                  <div className="relative h-32 w-full rounded-xl overflow-hidden bg-bakery-100 border border-bakery-200 group">
                    <Image src={heroImages[slotIdx]} alt={`Hero ${slotIdx + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => fileInputRefs[slotIdx].current?.click()}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Replace Photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRefs[slotIdx].current?.click()}
                    className="h-32 rounded-xl bg-bakery-50 hover:bg-amber-50 border-2 border-dashed border-bakery-300 hover:border-amber-500 cursor-pointer flex flex-col items-center justify-center text-center p-2 space-y-1"
                  >
                    <Upload className="w-4 h-4 text-amber-700" />
                    <span className="text-[10px] font-bold text-bakery-chocolate block">Upload Photo</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowUrlOption(prev => {
                    const copy = [...prev];
                    copy[slotIdx] = !copy[slotIdx];
                    return copy;
                  })}
                  className="text-[10px] font-semibold text-amber-800 hover:underline flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3 text-amber-600" />
                  <span>{showUrlOption[slotIdx] ? 'Hide URL paste' : 'or paste URL'}</span>
                </button>

                {showUrlOption[slotIdx] && (
                  <input
                    type="url"
                    value={heroImages[slotIdx]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHeroImages(prev => {
                        const copy = [...prev];
                        copy[slotIdx] = val;
                        return copy;
                      });
                    }}
                    placeholder="https://..."
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-lg px-2 py-1 text-[10px]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TEXT CONTENT FIELDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Badge Text</label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="e.g. Trivandrum's Most Loved Home Bakery"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Featured Card Tag</label>
            <input
              type="text"
              value={cardTag}
              onChange={(e) => setCardTag(e.target.value)}
              placeholder="e.g. TRIVANDRUM FAVORITE"
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
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Primary Button Link</label>
            <input
              type="text"
              value={ctaPrimaryLink}
              onChange={(e) => setCtaPrimaryLink(e.target.value)}
              placeholder="/shop"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Secondary Call Button Text</label>
            <input
              type="text"
              value={ctaSecondaryText}
              onChange={(e) => setCtaSecondaryText(e.target.value)}
              placeholder="e.g. Call Baker Direct"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Baker Phone Number</label>
            <input
              type="text"
              value={ctaSecondaryPhone}
              onChange={(e) => setCtaSecondaryPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Featured Card Cake Title</label>
            <input
              type="text"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              placeholder="Tender Coconut Dream Cake"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Featured Card Cake Price</label>
            <input
              type="text"
              value={cardPrice}
              onChange={(e) => setCardPrice(e.target.value)}
              placeholder="₹650"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingHero}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-xs shadow-soft transition-all active:scale-95 disabled:opacity-50"
        >
          {isSavingHero ? 'Updating Hero Banner...' : 'Save Hero Banner Settings'}
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
              placeholder="orders@myhomelycakes.com"
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
