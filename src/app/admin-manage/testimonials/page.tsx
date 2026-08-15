'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Star, CheckCircle2, X, Cake } from 'lucide-react';
import { Testimonial } from '@/components/TestimonialsSection';

export default function AdminTestimonialsPage() {
  const [eyebrow, setEyebrow] = useState('');
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Form / Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    cakeName: '',
    rating: 5,
    quote: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTestimonialsData = () => {
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setEyebrow(data.eyebrow || 'Customer Stories');
          setHeading(data.heading || 'What Our Customers Say');
          setSubheading(data.subheading || '');
          if (Array.isArray(data.testimonials)) {
            setTestimonialsList(data.testimonials);
          } else {
            setTestimonialsList([]);
          }
        }
      })
      .catch(() => setTestimonialsList([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTestimonialsData();
  }, []);

  const handleSaveHeaderSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          eyebrow,
          heading,
          subheading,
        }),
      });

      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (e) {
      alert('Error updating section settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      location: 'Trivandrum',
      cakeName: 'Tender Coconut Dream Cake',
      rating: 5,
      quote: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Testimonial) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      location: item.location,
      cakeName: item.cakeName,
      rating: item.rating || 5,
      quote: item.quote,
    });
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.quote || !formData.cakeName) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        // Edit Review
        const res = await fetch(`/api/testimonials/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setIsModalOpen(false);
          fetchTestimonialsData();
        } else {
          alert('Failed to edit review');
        }
      } else {
        // Add New Review
        const res = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setIsModalOpen(false);
          fetchTestimonialsData();
        } else {
          alert('Failed to add review');
        }
      }
    } catch (e) {
      alert('Error saving review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the review from "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTestimonialsList((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert('Failed to delete review');
      }
    } catch (e) {
      alert('Error deleting review');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', direction }),
      });

      if (res.ok) {
        fetchTestimonialsData();
      }
    } catch (e) {}
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-bakery-600">Loading reviews management...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      
      {/* PAGE TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate flex items-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-amber-700" />
            <span>Customer Reviews & Testimonials</span>
          </h1>
          <p className="text-xs text-bakery-600 mt-1">
            Manage customer feedback cards, star ratings, and custom section header titles.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-soft transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Review</span>
        </button>
      </div>

      {/* SECTION HEADER CUSTOMIZATION CARD */}
      <form onSubmit={handleSaveHeaderSettings} className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-soft space-y-4">
        <div className="border-b border-bakery-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-bakery-chocolate">
              Testimonials Section Header Customization
            </h3>
            <p className="text-[11px] text-bakery-600">Change the Eyebrow badge, Main Heading, and Subheading displayed on the website</p>
          </div>

          <button
            type="submit"
            disabled={isSavingSettings}
            className="bg-bakery-chocolate hover:bg-bakery-chocolateLight text-white font-bold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {isSavingSettings ? 'Saving...' : 'Save Header Title'}
          </button>
        </div>

        {settingsSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Header titles updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Eyebrow Badge</label>
            <input
              type="text"
              required
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder="Customer Stories"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Main Heading</label>
            <input
              type="text"
              required
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="What Our Customers Say"
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-bakery-chocolate block mb-1">Subheading Description</label>
            <input
              type="text"
              required
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="Real stories from the people..."
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>
      </form>

      {/* REVIEWS LIST TABLE / CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate">
            Active Reviews ({testimonialsList.length})
          </h3>
          <span className="text-xs text-bakery-600">Drag/reorder using arrows</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonialsList.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-bakery-200/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full border text-xs font-bold flex items-center justify-center ${item.avatarBg || 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                      {item.initials}
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-bakery-chocolate leading-none">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-bakery-600">{item.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-bakery-800/80 italic leading-relaxed line-clamp-3">
                  &quot;{item.quote}&quot;
                </p>

                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-200/70">
                  <Cake className="w-3 h-3 text-amber-700 shrink-0" />
                  <span>{item.cakeName}</span>
                </span>
              </div>

              <div className="pt-3 border-t border-bakery-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleReorder(item.id, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg bg-bakery-50 hover:bg-amber-100 text-bakery-800 disabled:opacity-30 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(item.id, 'down')}
                    disabled={index === testimonialsList.length - 1}
                    className="p-1.5 rounded-lg bg-bakery-50 hover:bg-amber-100 text-bakery-800 disabled:opacity-30 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-700" /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteReview(item.id, item.name)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD / EDIT REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-200 shadow-2xl space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-bakery-chocolate">
                {editingId ? 'Edit Review' : 'Add New Customer Review'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-bakery-600 hover:bg-bakery-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Anjali Nair"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Location / Area *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Kowdiar, Trivandrum"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Cake Ordered *</label>
                <input
                  type="text"
                  required
                  value={formData.cakeName}
                  onChange={(e) => setFormData({ ...formData, cakeName: e.target.value })}
                  placeholder="e.g. Tender Coconut Dream Cake"
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Rating (Stars)</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Review Quote / Story *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Write the customer's testimonial review here..."
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-bakery-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-bakery-300 text-bakery-800 text-xs font-semibold hover:bg-bakery-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-soft transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Review' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
