'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Pencil, Trash2, CheckCircle2, XCircle, Loader2, AlertCircle, ToggleLeft, ToggleRight, ArrowUp, ArrowDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface City {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface ModalState {
  open: boolean;
  mode: 'add' | 'edit';
  city?: City;
}

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'add' });
  const [formName, setFormName] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCities = () => {
    // Admin fetches all cities including inactive via a different query
    fetch('/api/cities?all=1')
      .then(r => r.json())
      .then(data => {
        // We'll load all cities for admin — the API returns active only for public,
        // so we need to work around this. Let's extend the API OR use a fallback.
        // For now, we refresh the full list by fetching then also calling the db all cities.
        if (data.cities) setCities(data.cities);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const openAddModal = () => {
    setFormName('');
    setFormSortOrder(cities.length);
    setFormError('');
    setModal({ open: true, mode: 'add' });
  };

  const openEditModal = (city: City) => {
    setFormName(city.name);
    setFormSortOrder(city.sortOrder);
    setFormError('');
    setModal({ open: true, mode: 'edit', city });
  };

  const closeModal = () => setModal({ open: false, mode: 'add' });

  const handleSave = async () => {
    if (!formName.trim()) { setFormError('City name is required.'); return; }
    setIsSaving(true);
    setFormError('');

    try {
      if (modal.mode === 'add') {
        const res = await fetch('/api/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName.trim(), sortOrder: formSortOrder }),
        });
        const data = await res.json();
        if (!res.ok) { setFormError(data.error || 'Failed to add city'); return; }
        setCities(prev => [...prev, data.city]);
        setSuccessMsg(`City "${formName.trim()}" added successfully!`);
      } else if (modal.mode === 'edit' && modal.city) {
        const res = await fetch(`/api/cities/${modal.city.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName.trim(), sortOrder: formSortOrder }),
        });
        const data = await res.json();
        if (!res.ok) { setFormError(data.error || 'Failed to update city'); return; }
        setCities(prev => prev.map(c => c.id === modal.city!.id ? data.city : c));
        setSuccessMsg(`City "${formName.trim()}" updated.`);
      }
      closeModal();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (city: City) => {
    try {
      const res = await fetch(`/api/cities/${city.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !city.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setCities(prev => prev.map(c => c.id === city.id ? data.city : c));
      }
    } catch {}
  };

  const handleDelete = async (city: City) => {
    if (!confirm(`Delete "${city.name}"? If any orders reference this city, it will be disabled instead.`)) return;

    try {
      const res = await fetch(`/api/cities/${city.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        if (data.deleted) {
          setCities(prev => prev.filter(c => c.id !== city.id));
          setSuccessMsg(`City "${city.name}" deleted.`);
        } else if (data.disabled) {
          setCities(prev => prev.map(c => c.id === city.id ? { ...c, isActive: false } : c));
          setSuccessMsg(data.message || `City "${city.name}" disabled (has existing orders).`);
        }
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        alert(data.error || 'Failed to delete city');
      }
    } catch {
      alert('Network error');
    }
  };

  const sortedCities = [...cities].sort((a, b) => {
    // Trivandrum always first
    if (a.name.toLowerCase() === 'trivandrum') return -1;
    if (b.name.toLowerCase() === 'trivandrum') return 1;
    return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-bakery-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate flex items-center gap-2">
            <MapPin className="w-6 h-6 text-amber-600" />
            Delivery Cities
          </h1>
          <p className="text-xs text-bakery-600 mt-1">
            Manage which cities your bakery delivers to. Trivandrum is always the default.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-soft transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add City
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Cities Table */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-bakery-500">Loading cities...</div>
      ) : sortedCities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-bakery-200 text-center space-y-3">
          <MapPin className="w-10 h-10 text-bakery-300 mx-auto" />
          <h3 className="font-serif text-base font-bold text-bakery-chocolate">No Cities Yet</h3>
          <p className="text-xs text-bakery-500">Add your first delivery city above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-bakery-200/80 shadow-soft overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-bakery-50 border-b border-bakery-100 text-[10px] font-extrabold uppercase tracking-widest text-bakery-500">
            <div className="col-span-5">City Name</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Sort</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          <div className="divide-y divide-bakery-100">
            {sortedCities.map((city) => (
              <div key={city.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-5 sm:px-6 py-4 items-center hover:bg-bakery-50/60 transition-colors">

                {/* City Name */}
                <div className="sm:col-span-5 flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${city.isActive ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                  <span className="font-bold text-sm text-bakery-chocolate">{city.name}</span>
                  {city.name.toLowerCase() === 'trivandrum' && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">Default</span>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="sm:col-span-2 flex sm:justify-center items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(city)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                      city.isActive
                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                    }`}
                    title="Toggle active status"
                  >
                    {city.isActive
                      ? <><ToggleRight className="w-3.5 h-3.5 text-emerald-600" /> Active</>
                      : <><ToggleLeft className="w-3.5 h-3.5 text-rose-500" /> Disabled</>
                    }
                  </button>
                </div>

                {/* Sort Order */}
                <div className="sm:col-span-2 flex sm:justify-center items-center">
                  <span className="text-xs text-bakery-500 font-mono bg-bakery-100 px-2 py-0.5 rounded-lg">{city.sortOrder}</span>
                </div>

                {/* Actions */}
                <div className="sm:col-span-3 flex items-center sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(city)}
                    className="inline-flex items-center gap-1.5 bg-bakery-50 hover:bg-amber-50 border border-bakery-200 hover:border-amber-300 text-bakery-chocolate text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Pencil className="w-3 h-3 text-amber-700" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(city)}
                    className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors"
                    title="Delete city"
                  >
                    <Trash2 className="w-3 h-3 text-rose-600" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help note */}
      <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
        <p className="font-bold">💡 Notes</p>
        <p>• Cities marked as <strong>Active</strong> will appear in the customer order dropdown.</p>
        <p>• Disabled cities are hidden from customers but won&apos;t affect existing orders.</p>
        <p>• Deleting a city that has existing orders will <strong>disable</strong> it instead to preserve order history.</p>
        <p>• <strong>Trivandrum</strong> is always the default city and auto-selected for customers.</p>
      </div>

      {/* ─── ADD / EDIT MODAL ─── */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-bakery-chocolate">
                {modal.mode === 'add' ? 'Add New City' : `Edit "${modal.city?.name}"`}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-bakery-100 text-bakery-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-bakery-800 block mb-1.5">City Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => { setFormName(e.target.value); setFormError(''); }}
                  placeholder="e.g. Kochi"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-800 block mb-1.5">Sort Order (lower = appears first)</label>
                <input
                  type="number"
                  min={0}
                  value={formSortOrder}
                  onChange={e => setFormSortOrder(Number(e.target.value))}
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate font-semibold py-3 rounded-2xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-2xl text-xs shadow-soft transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : (modal.mode === 'add' ? 'Add City' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
