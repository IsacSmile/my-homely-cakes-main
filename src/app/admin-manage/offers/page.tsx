'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, Calendar, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminOffersPage() {
  const [offersList, setOffersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);

  // Form states
  const [heading, setHeading] = useState('');
  const [discountPercent, setDiscountPercent] = useState('15');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchOffers = () => {
    fetch('/api/offers')
      .then(res => res.json())
      .then(data => {
        if (data.offers) setOffersList(data.offers);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const openAddModal = () => {
    setEditingOffer(null);
    setHeading('🎉 Onam Special Offer');
    setDiscountPercent('15');
    setIsActive(true);
    setStartDate('');
    setEndDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (o: any) => {
    setEditingOffer(o);
    setHeading(o.heading);
    setDiscountPercent(o.discountPercent.toString());
    setIsActive(o.isActive !== false);
    setStartDate(o.startDate || '');
    setEndDate(o.endDate || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOffersList(prev => prev.filter(o => o.id !== id));
      }
    } catch (e) {
      alert('Failed to delete offer');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heading || !discountPercent) return;

    setIsSaving(true);
    const payload = {
      heading,
      discountPercent: parseInt(discountPercent, 10),
      isActive,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    try {
      const url = editingOffer ? `/api/offers/${editingOffer.id}` : '/api/offers';
      const method = editingOffer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchOffers();
      } else {
        const err = await res.json();
        alert(err.error || 'Operation failed');
      }
    } catch (e) {
      alert('Failed to save offer');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-bakery-chocolate">
            Occasion Offers Manager
          </h1>
          <p className="text-xs text-bakery-600">
            Create occasion-based discount offers (e.g. &quot;🎉 Onam Offer&quot;) with active toggle and optional date ranges.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-3 rounded-full shadow-soft transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* Offers Cards List */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-bakery-600">Loading offers...</div>
      ) : offersList.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-bakery-200 text-center space-y-3">
          <Tag className="w-10 h-10 text-bakery-300 mx-auto" />
          <h3 className="font-serif text-base font-bold text-bakery-chocolate">No Active Offers</h3>
          <p className="text-xs text-bakery-600">Create an occasion offer to show discount banners on the home page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offersList.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white rounded-3xl p-6 border shadow-soft space-y-4 flex flex-col justify-between ${
                offer.isActive ? 'border-amber-400 ring-2 ring-amber-500/10' : 'border-bakery-200 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    offer.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {offer.isActive ? 'Active Banner' : 'Inactive'}
                  </span>
                  <span className="font-serif text-2xl font-extrabold text-amber-800">
                    {offer.discountPercent}% OFF
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-bakery-chocolate">
                  {offer.heading}
                </h3>

                {offer.endDate && (
                  <p className="text-xs text-bakery-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Valid until: {new Date(offer.endDate).toLocaleDateString('en-IN')}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-bakery-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(offer)}
                  className="bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(offer.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-bakery-chocolate">
                {editingOffer ? 'Edit Occasion Offer' : 'Create New Occasion Offer'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-bakery-400 hover:text-bakery-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-bakery-800 block mb-1">Offer Heading *</label>
                <input
                  type="text"
                  required
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g. 🎉 Onam Special Offer"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-800 block mb-1">Discount Percentage (%) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="15"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-bakery-800 block mb-1">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-bakery-800 block mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="offerActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <label htmlFor="offerActiveCheck" className="text-xs font-semibold text-bakery-chocolate">
                  Active (Show banner on website)
                </label>
              </div>

              <div className="pt-3 border-t border-bakery-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-bakery-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-soft"
                >
                  {isSaving ? 'Saving...' : editingOffer ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
