'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Trash2, X, Upload, Link as LinkIcon, RefreshCw, Loader2, Scale } from 'lucide-react';
import { parseProductVariants, WeightVariant } from '@/lib/pricing';

interface ProductModalLazyProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: any | null;
  categoriesList: any[];
  onSaved: (product: any, isEdit: boolean) => void;
}

export default function ProductModalLazy({
  isOpen,
  onClose,
  editingProduct,
  categoriesList,
  onSaved,
}: ProductModalLazyProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Signature Cakes');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const [photos, setPhotos] = useState<string[]>(['', '', '', '']);
  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>([false, false, false, false]);
  const [uploadErrors, setUploadErrors] = useState<string[]>(['', '', '', '']);
  const [showUrlPaste, setShowUrlPaste] = useState<boolean[]>([false, false, false, false]);

  const [weightVariants, setWeightVariants] = useState<WeightVariant[]>([
    { weightG: 500, price: 650, isDefault: true },
    { weightG: 1000, price: 1200, isDefault: false },
    { weightG: 1500, price: 1750, isDefault: false },
    { weightG: 2000, price: 2250, isDefault: false },
  ]);

  useEffect(() => {
    if (!isOpen) return;

    if (editingProduct) {
      setName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setIsFeatured(Boolean(editingProduct.isFeatured));
      setFeaturedOrder(Number(editingProduct.featuredOrder || 0));
      
      let loadedPhotos: string[] = ['', '', '', ''];
      try {
        if (editingProduct.images) {
          const parsed = typeof editingProduct.images === 'string' ? JSON.parse(editingProduct.images) : editingProduct.images;
          if (Array.isArray(parsed)) {
            loadedPhotos = [
              parsed[0] || editingProduct.imageUrl || '',
              parsed[1] || '',
              parsed[2] || '',
              parsed[3] || ''
            ];
          }
        } else if (editingProduct.imageUrl) {
          loadedPhotos[0] = editingProduct.imageUrl;
        }
      } catch (e) {
        loadedPhotos[0] = editingProduct.imageUrl || '';
      }

      setPhotos(loadedPhotos);
      setUploadingSlots([false, false, false, false]);
      setUploadErrors(['', '', '', '']);
      setShowUrlPaste([false, false, false, false]);
      setCategory(editingProduct.category || categoriesList[0]?.name || 'Signature Cakes');
      setWeightVariants(parseProductVariants(editingProduct));
      setIsAvailable(editingProduct.isAvailable !== false);
    } else {
      setName('');
      setDescription('');
      setPhotos([
        'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
        '',
        '',
        ''
      ]);
      setUploadingSlots([false, false, false, false]);
      setUploadErrors(['', '', '', '']);
      setShowUrlPaste([false, false, false, false]);
      setCategory(categoriesList[0]?.name || 'Signature Cakes');
      setWeightVariants([
        { weightG: 500, price: 650, isDefault: true },
        { weightG: 1000, price: 1200, isDefault: false },
        { weightG: 1500, price: 1750, isDefault: false },
        { weightG: 2000, price: 2250, isDefault: false },
      ]);
      setIsAvailable(true);
    }
  }, [isOpen, editingProduct, categoriesList]);

  if (!isOpen) return null;

  const handleFileUpload = async (slotIndex: number, file: File) => {
    // Clear previous error for this slot
    setUploadErrors(prev => {
      const copy = [...prev];
      copy[slotIndex] = '';
      return copy;
    });

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadErrors(prev => {
        const copy = [...prev];
        copy[slotIndex] = 'Invalid format (JPG, PNG, WebP only)';
        return copy;
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors(prev => {
        const copy = [...prev];
        copy[slotIndex] = 'File exceeds 5MB limit';
        return copy;
      });
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
        setUploadErrors(prev => {
          const copy = [...prev];
          copy[slotIndex] = data.error || 'Failed to upload image';
          return copy;
        });
      }
    } catch (e: any) {
      setUploadErrors(prev => {
        const copy = [...prev];
        copy[slotIndex] = e?.message || 'Error uploading image file';
        return copy;
      });
    } finally {
      setUploadingSlots(prev => {
        const copy = [...prev];
        copy[slotIndex] = false;
        return copy;
      });
    }
  };

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

  const isAnyUploading = uploadingSlots.some(Boolean);

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyUploading) {
      alert('Please wait for all image uploads to finish.');
      return;
    }

    if (!name || !description) return;

    if (!photos[0] || !photos[0].trim()) {
      alert('Main Photo (Slot 1) is mandatory. Please upload or provide a main image.');
      return;
    }

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
      isFeatured,
      featuredOrder,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        onSaved(data.product || { ...payload, id: editingProduct?.id || ('prod_' + Date.now()) }, !!editingProduct);
        onClose();
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (e) {
      alert('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-bakery-100 text-bakery-400 hover:text-bakery-900 transition-colors">
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
                  uploadError={uploadErrors[slotIdx]}
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

          <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/70">
            <div className="flex items-center gap-2">
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-200/50">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-amber-600 h-4 w-4"
                />
                <label htmlFor="featuredCheck" className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  ⭐ Feature this cake on Home Page (&quot;Handpicked Favorites&quot;)
                </label>
              </div>

              {isFeatured && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <label htmlFor="featuredOrderInput" className="text-[11px] font-bold text-amber-800">
                    Sort Order:
                  </label>
                  <input
                    id="featuredOrderInput"
                    type="number"
                    min={0}
                    value={featuredOrder}
                    onChange={(e) => setFeaturedOrder(Number(e.target.value))}
                    className="w-16 bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-bold text-center text-bakery-chocolate focus:outline-none"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-bakery-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
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
  );
}

// Single Image Upload Slot Component
function ImageUploadSlot({
  slotIndex,
  imageUrl,
  isUploading,
  uploadError,
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
  uploadError?: string;
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
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-32 rounded-xl bg-bakery-50 hover:bg-amber-50/80 border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center p-2 space-y-1.5 group ${
            uploadError ? 'border-rose-400 bg-rose-50/40' : 'border-bakery-300/80 hover:border-amber-500'
          }`}
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

      {uploadError && (
        <p className="text-[10px] font-semibold text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
          ⚠️ {uploadError}
        </p>
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
