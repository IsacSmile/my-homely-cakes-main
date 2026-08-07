'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Tag, X, Image as ImageIcon, Sparkles, Scale, Upload, Link as LinkIcon, RefreshCw, Loader2, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatINR, parseProductVariants, WeightVariant } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export default function AdminProductsPage() {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Signature Cakes');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 4 Photo Slots state (Slot 1 mandatory, Slots 2-4 optional)
  const [photos, setPhotos] = useState<string[]>(['', '', '', '']);
  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>([false, false, false, false]);
  const [showUrlPaste, setShowUrlPaste] = useState<boolean[]>([false, false, false, false]);

  // Repeatable Weight & Price Variants list state
  const [weightVariants, setWeightVariants] = useState<WeightVariant[]>([
    { weightG: 500, price: 650, isDefault: true },
    { weightG: 1000, price: 1200, isDefault: false },
    { weightG: 1500, price: 1750, isDefault: false },
    { weightG: 2000, price: 2250, isDefault: false },
  ]);

  // Category manager states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [catFeedbackMsg, setCatFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = () => {
    Promise.all([
      fetch('/api/products?limit=100').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ])
      .then(([prodData, catData]) => {
        if (prodData.products) setProductsList(prodData.products);
        if (catData.categories) setCategoriesList(catData.categories);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPhotos([
      'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      '',
      '',
      ''
    ]);
    setUploadingSlots([false, false, false, false]);
    setShowUrlPaste([false, false, false, false]);
    setCategory(categoriesList[0]?.name || 'Signature Cakes');
    setWeightVariants([
      { weightG: 500, price: 650, isDefault: true },
      { weightG: 1000, price: 1200, isDefault: false },
      { weightG: 1500, price: 1750, isDefault: false },
      { weightG: 2000, price: 2250, isDefault: false },
    ]);
    setIsAvailable(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    
    let loadedPhotos: string[] = ['', '', '', ''];
    try {
      if (p.images) {
        const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        if (Array.isArray(parsed)) {
          loadedPhotos = [
            parsed[0] || p.imageUrl || '',
            parsed[1] || '',
            parsed[2] || '',
            parsed[3] || ''
          ];
        }
      } else if (p.imageUrl) {
        loadedPhotos[0] = p.imageUrl;
      }
    } catch (e) {
      loadedPhotos[0] = p.imageUrl || '';
    }

    setPhotos(loadedPhotos);
    setUploadingSlots([false, false, false, false]);
    setShowUrlPaste([false, false, false, false]);
    setCategory(p.category);
    setWeightVariants(parseProductVariants(p));
    setIsAvailable(p.isAvailable !== false);
    setIsModalOpen(true);
  };

  // Upload handler for single photo slot
  const handleFileUpload = async (slotIndex: number, file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Invalid file format. Please select a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setUploadingSlots(prev => {
      const copy = [...prev];
      copy[slotIndex] = true;
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
        setPhotos(prev => {
          const copy = [...prev];
          copy[slotIndex] = data.url;
          return copy;
        });
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (e) {
      alert('Error uploading image file');
    } finally {
      setUploadingSlots(prev => {
        const copy = [...prev];
        copy[slotIndex] = false;
        return copy;
      });
    }
  };

  // Helper functions for Repeatable Weight Variants
  const handleAddVariantRow = () => {
    const nextWeight = (weightVariants[weightVariants.length - 1]?.weightG || 500) + 500;
    const nextPrice = (weightVariants[weightVariants.length - 1]?.price || 500) + 500;
    setWeightVariants(prev => [
      ...prev,
      { weightG: nextWeight, price: nextPrice, isDefault: false }
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    if (weightVariants.length <= 1) {
      alert('At least one weight-price pair is required per product.');
      return;
    }
    const updated = weightVariants.filter((_, i) => i !== index);
    if (!updated.some(v => v.isDefault)) {
      updated[0].isDefault = true;
    }
    setWeightVariants(updated);
  };

  const handleUpdateVariant = (index: number, field: keyof WeightVariant, value: any) => {
    setWeightVariants(prev => {
      const copy = [...prev];
      if (field === 'isDefault') {
        copy.forEach((v, i) => {
          v.isDefault = i === index;
        });
      } else {
        (copy[index] as any)[field] = value;
      }
      return copy;
    });
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Are you sure you want to delete "${prodName}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProductsList(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      alert('Failed to delete product');
    }
  };

  // Category Management Handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatFeedbackMsg(null);
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategoriesList(prev => [...prev, data.category]);
        setNewCategoryName('');
        setCatFeedbackMsg({ type: 'success', text: `Category "${data.category.name}" created successfully!` });
      } else {
        setCatFeedbackMsg({ type: 'error', text: data.error || 'Failed to add category' });
      }
    } catch (e) {
      setCatFeedbackMsg({ type: 'error', text: 'Error creating category' });
    }
  };

  const handleEditCategory = async (catId: string) => {
    setCatFeedbackMsg(null);
    if (!editingCatName.trim()) return;

    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingCatName }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditingCatId(null);
        setEditingCatName('');
        setCatFeedbackMsg({ type: 'success', text: `Category updated to "${data.category.name}". ${data.updatedProductsCount || 0} product(s) updated.` });
        fetchData();
      } else {
        setCatFeedbackMsg({ type: 'error', text: data.error || 'Failed to update category' });
      }
    } catch (e) {
      setCatFeedbackMsg({ type: 'error', text: 'Error updating category' });
    }
  };

  const handleReorderCategory = async (catId: string, direction: 'up' | 'down') => {
    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', displayOrder: direction }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Failed to reorder category', e);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    setCatFeedbackMsg(null);
    const msg = cat.productCount > 0
      ? `"${cat.name}" has ${cat.productCount} product(s). Deleting will reassign affected products to "Uncategorized". Proceed?`
      : `Are you sure you want to delete category "${cat.name}"?`;

    if (!confirm(msg)) return;

    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCatFeedbackMsg({ type: 'success', text: `Category deleted. ${data.reassignedProductsCount || 0} product(s) reassigned to "${data.fallbackCategory}".` });
        fetchData();
      } else {
        setCatFeedbackMsg({ type: 'error', text: data.error || 'Failed to delete category' });
      }
    } catch (e) {
      setCatFeedbackMsg({ type: 'error', text: 'Error deleting category' });
    }
  };

  const isAnyUploading = uploadingSlots.some(Boolean);

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyUploading) {
      alert('Please wait for all image uploads to finish.');
      return;
    }

    if (!name || !description) return;

    // Slot 1 (Main Photo) is mandatory
    if (!photos[0] || !photos[0].trim()) {
      alert('Main Photo (Slot 1) is mandatory. Please upload or provide a main image.');
      return;
    }

    // Validate weight variants
    if (weightVariants.length === 0) {
      alert('At least one weight-price pair is required.');
      return;
    }

    const weightSet = new Set<number>();
    for (const v of weightVariants) {
      if (!v.weightG || v.weightG <= 0) {
        alert('All weight values must be positive numbers (in grams).');
        return;
      }
      if (!v.price || v.price <= 0) {
        alert('All price values must be positive numbers (in ₹).');
        return;
      }
      if (weightSet.has(v.weightG)) {
        alert(`Duplicate weight option found (${v.weightG}g). Weights must be unique per product.`);
        return;
      }
      weightSet.add(v.weightG);
    }

    let finalVariants = [...weightVariants];
    if (!finalVariants.some(v => v.isDefault)) {
      finalVariants[0].isDefault = true;
    }

    setIsSaving(true);

    const validGallery = photos
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const defaultVar = finalVariants.find(v => v.isDefault) || finalVariants[0];

    const payload = {
      name,
      description,
      imageUrl: validGallery[0],
      images: validGallery,
      category,
      baseWeightG: defaultVar.weightG,
      basePrice: defaultVar.price,
      variants: finalVariants,
      isAvailable,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Operation failed');
      }
    } catch (e) {
      alert('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* Header Area */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-bakery-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Storefront Catalog & Category Manager</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate">
            Products & Categories ({productsList.length})
          </h1>
          <p className="text-xs text-bakery-800/70 mt-1">
            Manage bakery menu items, custom weight prices, live category pills, and stock availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCatFeedbackMsg(null);
              setIsCategoryModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-bakery-50 hover:bg-bakery-100 text-bakery-chocolate font-bold text-xs px-4 py-3 rounded-full border border-bakery-200 transition-all shadow-xs"
          >
            <Tag className="w-4 h-4 text-amber-700" />
            <span>Category Manager ({categoriesList.length})</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-3 rounded-full shadow-soft transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Cake</span>
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-bakery-200/60 p-8">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-bakery-600">Loading catalog items...</p>
        </div>
      ) : productsList.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-bakery-200 p-8 space-y-4">
          <ImageIcon className="w-12 h-12 text-bakery-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate">No Products Found</h3>
          <p className="text-xs text-bakery-600">Click &quot;Add New Cake&quot; above to start populating your catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsList.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              onEdit={() => openEditModal(product)}
              onDelete={() => handleDeleteProduct(product.id, product.name)}
            />
          ))}
        </div>
      )}

      {/* FULL CATEGORY MANAGER MODAL (Add / Edit / Delete / Reorder with Live Product Counts) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-3xl p-6 overflow-y-auto space-y-5 shadow-2xl relative animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-bakery-chocolate flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-600" />
                  Category Manager ({categoriesList.length})
                </h3>
                <p className="text-[11px] text-bakery-600">Add, rename, reorder, or delete shop filter categories</p>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1.5 rounded-full hover:bg-bakery-100 text-bakery-400 hover:text-bakery-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Feedback Alerts */}
            {catFeedbackMsg && (
              <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                catFeedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {catFeedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{catFeedbackMsg.text}</span>
              </div>
            )}

            {/* Add New Category Form */}
            <form onSubmit={handleAddCategory} className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2">
              <label className="text-xs font-bold text-amber-900 block">Add New Category *</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Eggless & Vegan Cakes"
                  className="flex-1 bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-700"
                />
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors shrink-0"
                >
                  + Add Category
                </button>
              </div>
            </form>

            {/* Live Categories List with Reorder, Edit, Delete & Product Counts */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold text-bakery-chocolate block">Active Categories & Live Product Count:</span>
              
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {categoriesList.map((cat: any, idx: number) => {
                  const isEditingThis = editingCatId === cat.id;

                  return (
                    <div key={cat.id} className="bg-bakery-50 p-3 rounded-2xl border border-bakery-200 flex items-center justify-between gap-3 shadow-xs">
                      
                      {/* Left: Reorder Up/Down buttons + Category Name or Edit Input */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleReorderCategory(cat.id, 'up')}
                            className="p-1 text-bakery-500 hover:text-amber-800 disabled:opacity-30 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === categoriesList.length - 1}
                            onClick={() => handleReorderCategory(cat.id, 'down')}
                            className="p-1 text-bakery-500 hover:text-amber-800 disabled:opacity-30 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Inline Name Editor or Display */}
                        {isEditingThis ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              required
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              className="flex-1 bg-white border border-amber-600 rounded-lg px-2.5 py-1 text-xs font-bold text-bakery-chocolate focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleEditCategory(cat.id)}
                              className="bg-emerald-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-xs"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCatId(null)}
                              className="text-xs text-bakery-500 hover:text-bakery-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-bakery-chocolate block truncate">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-semibold inline-block mt-0.5">
                              {cat.productCount || 0} {cat.productCount === 1 ? 'Product' : 'Products'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right Actions: Edit & Delete */}
                      {!isEditingThis && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatName(cat.name);
                            }}
                            className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                            title="Edit Category Name"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl p-6 overflow-y-auto space-y-6 shadow-2xl relative animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-bakery-chocolate">
                  {editingProduct ? 'Edit Cake Details & Photos' : 'Add New Cake to Store'}
                </h3>
                <p className="text-[11px] text-bakery-600">Upload product photos, set weight prices, and toggle availability</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-bakery-100 text-bakery-400 hover:text-bakery-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-6">
              
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-bakery-chocolate block mb-1">Cake Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tender Coconut Dream Cake"
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-bakery-chocolate block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600 font-medium"
                  >
                    {categoriesList.map((cat: any) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PRIMARY FILE UPLOAD PRODUCT GALLERY (4 Photo Slots) */}
              <div className="space-y-3 bg-amber-50/70 p-5 rounded-3xl border border-amber-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-amber-700" />
                      Product Image Gallery (File Upload Primary) *
                    </label>
                    <p className="text-[10px] text-amber-800">
                      Upload image files directly (JPG, PNG, WebP up to 5MB). Slot 1 is mandatory for the main storefront card.
                    </p>
                  </div>
                  {isAnyUploading && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading image...
                    </span>
                  )}
                </div>

                {/* 4 Image Upload Slots Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {[0, 1, 2, 3].map((slotIdx) => (
                    <ImageUploadSlot
                      key={slotIdx}
                      slotIndex={slotIdx}
                      imageUrl={photos[slotIdx]}
                      isUploading={uploadingSlots[slotIdx]}
                      showUrlOption={showUrlPaste[slotIdx]}
                      isMandatory={slotIdx === 0}
                      onFileSelect={(file) => handleFileUpload(slotIdx, file)}
                      onUrlChange={(url) => setPhotos(prev => {
                        const copy = [...prev];
                        copy[slotIdx] = url;
                        return copy;
                      })}
                      onRemove={() => setPhotos(prev => {
                        const copy = [...prev];
                        copy[slotIdx] = '';
                        return copy;
                      })}
                      onToggleUrlOption={() => setShowUrlPaste(prev => {
                        const copy = [...prev];
                        copy[slotIdx] = !copy[slotIdx];
                        return copy;
                      })}
                    />
                  ))}
                </div>
              </div>

              {/* Repeatable Weight & Price Pairs UI */}
              <div className="bg-bakery-50 p-4 rounded-2xl border border-bakery-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-bakery-chocolate flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-amber-700" />
                      Weight & Price Variants (Admin Custom Prices) *
                    </label>
                    <p className="text-[10px] text-bakery-600">
                      Specify weight (g) and price (₹) pairs. Radio button selects the default pre-selected option.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="inline-flex items-center gap-1 bg-amber-700 hover:bg-amber-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Weight</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {weightVariants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-bakery-200 shadow-xs">
                      
                      {/* Default Radio */}
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-bakery-chocolate cursor-pointer shrink-0 pr-1">
                        <input
                          type="radio"
                          name="defaultVariant"
                          checked={v.isDefault === true}
                          onChange={() => handleUpdateVariant(idx, 'isDefault', true)}
                          className="text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                        />
                        <span className={v.isDefault ? 'text-amber-800 font-bold' : 'text-bakery-600'}>
                          {v.isDefault ? '⭐ Default' : 'Set Default'}
                        </span>
                      </label>

                      {/* Weight Input (g) */}
                      <div className="flex-1 flex items-center bg-bakery-50 rounded-lg border border-bakery-200 px-2 py-1">
                        <input
                          type="number"
                          required
                          min={50}
                          step={50}
                          value={v.weightG}
                          onChange={(e) => handleUpdateVariant(idx, 'weightG', parseInt(e.target.value, 10) || 0)}
                          placeholder="e.g. 900"
                          className="w-full bg-transparent text-xs font-bold text-bakery-chocolate focus:outline-none"
                        />
                        <span className="text-[10px] font-semibold text-bakery-500 ml-1">g</span>
                      </div>

                      {/* Price Input (₹) */}
                      <div className="flex-1 flex items-center bg-bakery-50 rounded-lg border border-bakery-200 px-2 py-1">
                        <span className="text-[10px] font-bold text-amber-800 mr-1">₹</span>
                        <input
                          type="number"
                          required
                          min={1}
                          value={v.price}
                          onChange={(e) => handleUpdateVariant(idx, 'price', parseInt(e.target.value, 10) || 0)}
                          placeholder="e.g. 550"
                          className="w-full bg-transparent text-xs font-bold text-bakery-chocolate focus:outline-none"
                        />
                      </div>

                      {/* Remove Row Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantRow(idx)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove weight variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-bakery-chocolate block mb-1">Cake Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fresh layers of soft sponge infused with..."
                  className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded text-amber-600 h-4 w-4"
                />
                <label htmlFor="availCheck" className="text-xs font-semibold text-bakery-chocolate">
                  In Stock & Available for Direct Customer Orders
                </label>
              </div>

              <div className="pt-4 border-t border-bakery-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-bakery-600 hover:bg-bakery-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isAnyUploading}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-soft disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? 'Saving Cake...' : isAnyUploading ? 'Uploading Photos...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Single Image Upload Slot Component
function ImageUploadSlot({
  slotIndex,
  imageUrl,
  isUploading,
  showUrlOption,
  isMandatory,
  onFileSelect,
  onUrlChange,
  onRemove,
  onToggleUrlOption,
}: {
  slotIndex: number;
  imageUrl: string;
  isUploading: boolean;
  showUrlOption: boolean;
  isMandatory: boolean;
  onFileSelect: (file: File) => void;
  onUrlChange: (url: string) => void;
  onRemove: () => void;
  onToggleUrlOption: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgErr, setImgErr] = useState(false);

  const slotTitle = slotIndex === 0 ? 'Main Photo *' : `Photo ${slotIndex + 1}`;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white p-3 rounded-2xl border border-amber-200/70 shadow-xs flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-bakery-chocolate">
          {slotTitle}
        </span>
        {isMandatory && <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Required</span>}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {isUploading ? (
        <div className="h-32 rounded-xl bg-amber-50 border-2 border-dashed border-amber-300 flex flex-col items-center justify-center space-y-2 p-2">
          <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
          <span className="text-[10px] font-bold text-amber-800">Uploading File...</span>
        </div>
      ) : imageUrl && !imgErr ? (
        <div className="relative h-32 w-full rounded-xl overflow-hidden bg-bakery-100 group border border-bakery-200">
          <Image
            src={imageUrl}
            alt={slotTitle}
            fill
            sizes="160px"
            className="object-cover"
            onError={() => setImgErr(true)}
          />
          
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/90 hover:bg-white text-bakery-chocolate text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-amber-700" />
              <span>Replace</span>
            </button>

            <button
              type="button"
              onClick={onRemove}
              className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="h-32 rounded-xl bg-bakery-50 hover:bg-amber-50/80 border-2 border-dashed border-bakery-300/80 hover:border-amber-500 transition-all cursor-pointer flex flex-col items-center justify-center text-center p-2 space-y-1.5 group"
        >
          <div className="w-8 h-8 rounded-full bg-white text-amber-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-bakery-chocolate block group-hover:text-amber-800">
              Upload Image File
            </span>
            <span className="text-[9px] text-bakery-500 block">Drag & drop or browse (max 5MB)</span>
          </div>
        </div>
      )}

      <div className="pt-1">
        <button
          type="button"
          onClick={onToggleUrlOption}
          className="text-[10px] font-semibold text-amber-800 hover:underline flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3 text-amber-600" />
          <span>{showUrlOption ? 'Hide URL paste option' : 'or paste an image URL instead'}</span>
        </button>

        {showUrlOption && (
          <div className="mt-1.5 animate-fadeIn">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImgErr(false);
                onUrlChange(e.target.value);
              }}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-bakery-50 border border-bakery-200 rounded-lg px-2.5 py-1.5 text-[10px] text-bakery-chocolate focus:outline-none focus:border-amber-600"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Redesigned Admin Product Card Component
function AdminProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imgSrc, setImgSrc] = useState<string>(product.imageUrl || '/cake-placeholder.svg');

  const variantsList: WeightVariant[] = parseProductVariants(product);
  const defaultVar = variantsList.find(v => v.isDefault) || variantsList[0];

  let photoCount = 1;
  try {
    if (product.images) {
      const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(parsed) && parsed.length > 0) photoCount = parsed.length;
    }
  } catch (e) {}

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-bakery-200/80 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between">
      
      {/* Product Photo Container */}
      <div className="relative h-48 w-full bg-bakery-100 overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgSrc('/cake-placeholder.svg')}
        />

        {/* Stock Status Badge Overlay */}
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
            product.isAvailable !== false
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {product.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
        </span>

        {/* Photo Counter Pill Overlay */}
        <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          📷 {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
        </span>
      </div>

      {/* Structured Details Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category Tag */}
          <span className="inline-block bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200/60 mb-1.5">
            {product.category}
          </span>

          {/* Product Name */}
          <h3 className="font-serif text-base font-bold text-bakery-chocolate line-clamp-1">
            {product.name}
          </h3>

          {/* Truncated Short Description */}
          <p className="text-xs text-bakery-800/70 line-clamp-2 leading-relaxed mt-1">
            {product.description}
          </p>
        </div>

        {/* Weight Variants Pricing Breakdown */}
        <div className="space-y-2 pt-2 border-t border-bakery-100">
          <span className="text-[10px] font-bold text-bakery-600 uppercase tracking-wider block">
            Weight Prices ({variantsList.length} Options)
          </span>

          <div className="flex flex-wrap gap-1.5">
            {variantsList.map((v, i) => (
              <span
                key={i}
                className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                  v.isDefault
                    ? 'bg-amber-600 text-white border-amber-600 font-bold'
                    : 'bg-bakery-50 text-bakery-chocolate border-bakery-200/70'
                }`}
              >
                {v.weightG >= 1000 ? `${v.weightG / 1000}kg` : `${v.weightG}g`}: <strong className="font-serif tracking-tight font-extrabold">{formatINR(v.price)}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Orders Metrics with Premium Price Typography */}
        <div className="pt-2 border-t border-bakery-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-bakery-600 font-medium block">
              Default ({defaultVar.weightG >= 1000 ? `${defaultVar.weightG / 1000}kg` : `${defaultVar.weightG}g`})
            </span>
            <span className="font-serif text-lg font-extrabold text-amber-800 tracking-tight">
              {formatINR(defaultVar.price)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-bakery-600 font-medium block">Total Orders</span>
            <span className="text-xs font-bold text-bakery-chocolate">
              {product.orderCount || 0} orders
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-bakery-50 hover:bg-bakery-100 text-bakery-chocolate font-semibold text-xs py-2.5 rounded-2xl border border-bakery-200/80 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Edit Cake & Photos</span>
          </button>

          <button
            onClick={onDelete}
            className="p-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-2xl border border-rose-200/60 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
