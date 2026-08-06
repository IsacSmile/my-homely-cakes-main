'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Lock, Phone, Mail, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminSettingsPage() {
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setEmail(data.email || '');
          setNewEmail(data.email || '');
          setWhatsapp(data.whatsapp || '919876543210');
          setNotificationEmail(data.notificationEmail || 'orders@myhomelycakes.com');
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentPassword) {
      setError('Current password is required to save changes.');
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
          whatsapp,
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-bakery-chocolate">
          Admin Account & Notification Settings
        </h1>
        <p className="text-xs text-bakery-600">
          Update login credentials and configure shop WhatsApp/email notification alerts.
        </p>
      </div>

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

      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 md:p-8 border border-bakery-200 shadow-soft space-y-6">
        
        {/* Section 1: Notifications Settings */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate flex items-center gap-2 border-b border-bakery-100 pb-2">
            <Phone className="w-4 h-4 text-amber-700" />
            <span>Store Contact & Order Alerts</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-bakery-800 block mb-1">
              Shop WhatsApp Mobile Number (for WhatsApp order notifications)
            </label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="919876543210"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
            <span className="text-[10px] text-bakery-400 block mt-1">Include country code without + (e.g. 919876543210)</span>
          </div>

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
              Confirm Current Password * (Required to save changes)
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
          {isSaving ? 'Updating Settings...' : 'Save Settings & Credentials'}
        </button>
      </form>
    </div>
  );
}
