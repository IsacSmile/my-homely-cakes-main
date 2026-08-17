'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Plus, Trash2, X, Upload, Link as LinkIcon, RefreshCw, Loader2, Scale,
  Star, ArrowLeft, ArrowRight, AlertTriangle, RotateCcw, GripVertical
} from 'lucide-react';
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
  const [validationError, setValidationError] = useState<string | null>(null);

  const [photos, setPhotos] = useState<string[]>(['', '', '', '']);
  const [lastFiles, setLastFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>([false, false, false, false]);
  const [uploadErrors, setUploadErrors] = useState<string[]>(['', '', '', '']);
  const [showUrlPaste, setShowUrlPaste] = useState<boolean[]>([false, false, false, false]);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState<number | null>(null);

  const [weightVariants, setWeightVariants] = useState<WeightVariant[]>([
    { weightG: 500, price: 650, isDefault: true },
    { weightG: 1000, price: 1200, isDefault: false },
    { weightG: 1500, price: 1750, isDefault: false },
    { weightG: 2000, price: 2250, isDefault: false },
  ]);

  const globalFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setValidationError(null);

    if (editingProduct) {
      setName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setIsFeatured(Boolean(editingProduct.isFeatured));
      setFeaturedOrder(Number(editingProduct.featuredOrder || 0));
      
      let loadedPhotos: string[] = ['', '', '', ''];
      try {
        if (editingProduct.images) {
          const parsed = typeof editingProduct.images === 'string' ? JSON.parse(editingProduct.images) : editingProduct.images;
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter((u: any) => typeof u === 'string' && u.trim().length > 0);
            loadedPhotos = [
              valid[0] || editingProduct.imageUrl || '',
              valid[1] || '',
              valid[2] || '',
              valid[3] || ''
            ];
          } else if (editingProduct.imageUrl) {
            loadedPhotos[0] = editingProduct.imageUrl;
          }
        } else if (editingProduct.imageUrl) {
          loadedPhotos[0] = editingProduct.imageUrl;
        }
      } catch (e) {
        loadedPhotos[0] = editingProduct.imageUrl || '';
      }

      setPhotos(loadedPhotos);
      setLastFiles([null, null, null, null]);
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
        '',
        '',
        '',
        ''
      ]);
      setLastFiles([null, null, null, null]);
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

  // Single file upload worker
  const uploadSingleFile = async (slotIndex: number, file: File) => {
    // Store last file for retry
    setLastFiles(prev => {
      const copy = [...prev];
      copy[slotIndex] = file;
      return copy;
    });

    // Reset error
    setUploadErrors(prev => {
      const copy = [...prev];
      copy[slotIndex] = '';
      return copy;
    });

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadErrors(prev => {
        const copy = [...prev];
        copy[slotIndex] = 'Invalid format. JPG, PNG, WebP, or GIF only.';
        return copy;
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors(prev => {
        const copy = [...prev];
        copy[slotIndex] = 'File exceeds 5MB limit. Please choose a smaller image.';
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
        setValidationError(null);
      } else {
        setUploadErrors(prev => {
          const copy = [...prev];
          copy[slotIndex] = data.error || 'Failed to upload image.';
          return copy;
        });
      }
    } catch (e: any) {
      setUploadErrors(prev => {
        const copy = [...prev];
        copy[slotIndex] = e?.message || 'Network error during file upload.';
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

  // Batch Multi-File Upload
  const handleBatchFilesUpload = async (files: FileList | File[], startSlotIdx = 0) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    let currentSlot = startSlotIdx;
    for (let i = 0; i < fileArray.length; i++) {
      // Find next available slot if current is out of range
      while (currentSlot < 4 && (uploadingSlots[currentSlot])) {
        currentSlot++;
      }
      if (currentSlot >= 4) break;

      await uploadSingleFile(currentSlot, fileArray[i]);
      currentSlot++;
    }
  };

  // Delete Image from storage and reset state
  const handleRemovePhoto = async (slotIndex: number) => {
    const currentUrl = photos[slotIndex];

    setPhotos(prev => {
      const copy = [...prev];
      copy[slotIndex] = '';
      return copy;
    });
    setUploadErrors(prev => {
      const copy = [...prev];
      copy[slotIndex] = '';
      return copy;
    });
    setLastFiles(prev => {
      const copy = [...prev];
      copy[slotIndex] = null;
      return copy;
    });

    if (currentUrl && (currentUrl.startsWith('/uploads/') || currentUrl.includes('public.blob.vercel-storage.com'))) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: currentUrl }),
        });
      } catch (e) {
        console.error('Failed to remove image from server storage:', e);
      }
    }
  };

  // Reorder & Cover controls
  const handleSwapSlots = (indexA: number, indexB: number) => {
    if (indexA < 0 || indexA >= 4 || indexB < 0 || indexB >= 4 || indexA === indexB) return;

    setPhotos(prev => {
      const copy = [...prev];
      const temp = copy[indexA];
      copy[indexA] = copy[indexB];
      copy[indexB] = temp;
      return copy;
    });

    setUploadErrors(prev => {
      const copy = [...prev];
      const temp = copy[indexA];
      copy[indexA] = copy[indexB];
      copy[indexB] = temp;
      return copy;
    });

    setShowUrlPaste(prev => {
      const copy = [...prev];
      const temp = copy[indexA];
      copy[indexA] = copy[indexB];
      copy[indexB] = temp;
      return copy;
    });

    setLastFiles(prev => {
      const copy = [...prev];
      const temp = copy[indexA];
      copy[indexA] = copy[indexB];
      copy[indexB] = temp;
      return copy;
    });
  };

  const handleSetAsCover = (slotIndex: number) => {
    if (slotIndex === 0 || !photos[slotIndex]) return;

    setPhotos(prev => {
      const selected = prev[slotIndex];
      const rest = prev.filter((_, i) => i !== slotIndex);
      return [selected, ...rest];
    });

    setUploadErrors(prev => {
      const selected = prev[slotIndex];
      const rest = prev.filter((_, i) => i !== slotIndex);
      return [selected, ...rest];
    });

    setShowUrlPaste(prev => {
      const selected = prev[slotIndex];
      const rest = prev.filter((_, i) => i !== slotIndex);
      return [selected, ...rest];
    });
  };

  // Variant Rows
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
    setWeightVariants(prev =>
      prev.map((v, i) => {
        if (field === 'isDefault') {
          return { ...v, isDefault: i === index };
        }
        if (i === index) {
          return { ...v, [field]: value };
        }
        return { ...v };
      })
    );
  };

  const isAnyUploading = uploadingSlots.some(Boolean);

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (isAnyUploading) {
      setValidationError('Please wait for image uploads to complete.');
      return;
    }

    if (!name.trim() || !description.trim()) {
      setValidationError('Cake name and description are required.');
      return;
    }

    if (!photos[0] || !photos[0].trim()) {
      setValidationError('Main Cover Photo (Slot 1) is mandatory. Please upload or paste a main image.');
      return;
    }

    if (weightVariants.length === 0) {
      setValidationError('At least one weight-price variant is required.');
      return;
    }

    const weightSet = new Set<number>();
    for (const v of weightVariants) {
      if (!v.weightG || v.weightG <= 0) {
        setValidationError('All weight values must be positive numbers in grams.');
        return;
      }
      if (!v.price || v.price <= 0) {
        setValidationError('All price values must be positive numbers in ₹.');
        return;
      }
      if (weightSet.has(v.weightG)) {
        setValidationError(`Duplicate weight option found (${v.weightG}g). Weights must be unique.`);
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
        setValidationError(data.error || 'Failed to save product.');
      }
    } catch (e) {
      setValidationError('Network error while saving product.');
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
            <p className="text-[11px] text-bakery-600">
              Upload product photos, set weight prices, drag to reorder gallery, and toggle availability
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-bakery-100 text-bakery-400 hover:text-bakery-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Validation Error Banner */}
        {validationError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-800 flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitProduct} className="space-y-6">
          
          {/* Product Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-bakery-chocolate block mb-1">Cake Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => { setName(e.target.value); setValidationError(null); }}
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

          {/* PRIMARY FILE UPLOAD PRODUCT GALLERY (4 Photo Slots with Reordering & Batch Upload) */}
          <div className="space-y-3 bg-amber-50/70 p-5 rounded-3xl border border-amber-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-700" />
                  Product Image Gallery (Batch Upload &amp; Reorder) *
                </label>
                <p className="text-[10px] text-amber-800">
                  Select or drag-and-drop single/multiple image files (JPG, PNG, WebP up to 5MB). Slot 1 is the primary storefront cover photo. Drag cards to reorder.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={globalFileInputRef}
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleBatchFilesUpload(e.target.files, 0);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => globalFileInputRef.current?.click()}
                  className="bg-amber-700 hover:bg-amber-600 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Multiple Files</span>
                </button>

                {isAnyUploading && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                  </span>
                )}
              </div>
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
                  lastFile={lastFiles[slotIdx]}
                  isDragging={draggedSlotIndex === slotIdx}
                  onDragStart={() => setDraggedSlotIndex(slotIdx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDropSlot={() => {
                    if (draggedSlotIndex !== null && draggedSlotIndex !== slotIdx) {
                      handleSwapSlots(draggedSlotIndex, slotIdx);
                      setDraggedSlotIndex(null);
                    }
                  }}
                  onBatchFilesSelect={(files) => handleBatchFilesUpload(files, slotIdx)}
                  onFileSelect={(file) => uploadSingleFile(slotIdx, file)}
                  onRetry={() => {
                    if (lastFiles[slotIdx]) uploadSingleFile(slotIdx, lastFiles[slotIdx]!);
                  }}
                  onSetAsCover={() => handleSetAsCover(slotIdx)}
                  onMoveLeft={() => handleSwapSlots(slotIdx, slotIdx - 1)}
                  onMoveRight={() => handleSwapSlots(slotIdx, slotIdx + 1)}
                  onUrlChange={(url) => setPhotos(prev => {
                    const copy = [...prev];
                    copy[slotIdx] = url;
                    return copy;
                  })}
                  onRemove={() => handleRemovePhoto(slotIdx)}
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
                  Weight &amp; Price Variants (Admin Custom Prices) *
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
              onChange={(e) => { setDescription(e.target.value); setValidationError(null); }}
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
                In Stock &amp; Available for Direct Customer Orders
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

// Single Image Upload Slot Component with Drag-and-Drop & Action Controls
function ImageUploadSlot({
  slotIndex,
  imageUrl,
  isUploading,
  uploadError,
  showUrlOption,
  isMandatory,
  lastFile,
  isDragging,
  onDragStart,
  onDragOver,
  onDropSlot,
  onBatchFilesSelect,
  onFileSelect,
  onRetry,
  onSetAsCover,
  onMoveLeft,
  onMoveRight,
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
  lastFile: File | null;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropSlot: () => void;
  onBatchFilesSelect: (files: FileList) => void;
  onFileSelect: (file: File) => void;
  onRetry: () => void;
  onSetAsCover: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onUrlChange: (url: string) => void;
  onRemove: () => void;
  onToggleUrlOption: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgErr, setImgErr] = useState(false);

  // Automatically reset image error state whenever the image URL changes
  useEffect(() => {
    setImgErr(false);
  }, [imageUrl]);

  const slotTitle = slotIndex === 0 ? 'Main Cover *' : `Photo ${slotIndex + 1}`;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1) {
        onBatchFilesSelect(e.dataTransfer.files);
      } else {
        onFileSelect(e.dataTransfer.files[0]);
      }
    } else {
      onDropSlot();
    }
  };

  return (
    <div
      draggable={Boolean(imageUrl && !isUploading)}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={handleDrop}
      className={`bg-white p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2 relative shadow-xs ${
        isDragging ? 'opacity-40 border-dashed border-amber-500' : 'border-amber-200/70 hover:border-amber-400'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-bakery-chocolate flex items-center gap-1">
          {imageUrl && <GripVertical className="w-3 h-3 text-bakery-400 cursor-grab shrink-0" />}
          {slotTitle}
        </span>
        {isMandatory ? (
          <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Required</span>
        ) : imageUrl ? (
          <button
            type="button"
            onClick={onSetAsCover}
            className="text-[9px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5 transition-colors"
            title="Make this photo the main cover photo"
          >
            <Star className="w-2.5 h-2.5 text-amber-600 fill-amber-600" /> Cover
          </button>
        ) : null}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            if (e.target.files.length > 1) {
              onBatchFilesSelect(e.target.files);
            } else {
              onFileSelect(e.target.files[0]);
            }
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
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
            <div className="flex items-center gap-1">
              {slotIndex > 0 && (
                <button
                  type="button"
                  onClick={onMoveLeft}
                  className="p-1 rounded bg-white/90 hover:bg-white text-bakery-chocolate text-[10px]"
                  title="Move left"
                >
                  <ArrowLeft className="w-3 h-3 text-bakery-700" />
                </button>
              )}
              {slotIndex < 3 && (
                <button
                  type="button"
                  onClick={onMoveRight}
                  className="p-1 rounded bg-white/90 hover:bg-white text-bakery-chocolate text-[10px]"
                  title="Move right"
                >
                  <ArrowRight className="w-3 h-3 text-bakery-700" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setImgErr(false);
                fileInputRef.current?.click();
              }}
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
      ) : imageUrl && imgErr ? (
        <div className="h-32 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center justify-center p-2 text-center space-y-1">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <span className="text-[10px] font-bold text-rose-800">Preview Failed</span>
          <div className="flex items-center gap-1 pt-1">
            <button
              type="button"
              onClick={() => {
                setImgErr(false);
                fileInputRef.current?.click();
              }}
              className="bg-white border border-rose-300 text-rose-800 text-[9px] font-bold px-2 py-0.5 rounded shadow-xs"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => {
            setImgErr(false);
            fileInputRef.current?.click();
          }}
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
            <span className="text-[9px] text-bakery-500 block">Drag &amp; drop or browse (max 5MB)</span>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
            ⚠️ {uploadError}
          </p>
          {lastFile && (
            <button
              type="button"
              onClick={onRetry}
              className="text-[10px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors w-full justify-center"
            >
              <RotateCcw className="w-3 h-3 text-amber-700" />
              <span>Retry Upload</span>
            </button>
          )}
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
