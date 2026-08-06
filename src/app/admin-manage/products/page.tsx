'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Tag, X, Image as ImageIcon, Sparkles, Check, AlertCircle, ShoppingBag } from 'lucide-react';
import { formatINR } from '@/lib/pricing';

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
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');
  const [image3, setImage3] = useState('');
  const [image4, setImage4] = useState('');
  const [category, setCategory] = useState('Signature Cakes');
  const [baseWeightG, setBaseWeightG] = useState('500');
  const [basePrice, setBasePrice] = useState('650');
  const [variantsStr, setVariantsStr] = useState('500, 1000, 1500, 2000');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Category modal state
  const [newCategoryName, setNewCategoryName] = useState('');

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
    setImage1('https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80');
    setImage2('');
    setImage3('');
    setImage4('');
    setCategory(categoriesList[0]?.name || 'Signature Cakes');
    setBaseWeightG('500');
    setBasePrice('650');
    setVariantsStr('500, 1000, 1500, 2000');
    setIsAvailable(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    
    let photos: string[] = [p.imageUrl];
    try {
      if (p.images) {
        const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        if (Array.isArray(parsed) && parsed.length > 0) photos = parsed;
      }
    } catch (e) {}

    setImage1(photos[0] || p.imageUrl || '');
    setImage2(photos[1] || '');
    setImage3(photos[2] || '');
    setImage4(photos[3] || '');

    setCategory(p.category);
    setBaseWeightG(p.baseWeightG.toString());
    setBasePrice(p.basePrice.toString());
    
    let vars = '500, 1000, 1500, 2000';
    try {
      const parsed = typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants;
      if (Array.isArray(parsed)) vars = parsed.join(', ');
    } catch (e) {}
    setVariantsStr(vars);
    setIsAvailable(p.isAvailable !== false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, prodName: string) => {
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setCategory(data.category.name);
        setNewCategoryName('');
        setIsCategoryModalOpen(false);
      } else {
        alert(data.error || 'Failed to add category');
      }
    } catch (e) {
      alert('Error adding category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !image1 || !basePrice) return;

    setIsSaving(true);

    const galleryImages = [image1, image2, image3, image4]
      .map(img => img.trim())
      .filter(img => img.length > 0);

    const variantsArray = variantsStr
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v) && v > 0);

    const payload = {
      name,
      description,
      imageUrl: galleryImages[0],
      images: galleryImages,
      category,
      baseWeightG: parseInt(baseWeightG, 10),
      basePrice: parseInt(basePrice, 10),
      variants: variantsArray,
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
      
      {/* Header Area with Clear Hierarchy */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-bakery-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Storefront Catalog Manager</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate">
            Products & Categories ({productsList.length})
          </h1>
          <p className="text-xs text-bakery-800/70 mt-1">
            Manage bakery menu items, multi-photo galleries, category pills, and stock availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center gap-2 bg-bakery-50 hover:bg-bakery-100 text-bakery-chocolate font-semibold text-xs px-4 py-3 rounded-full border border-bakery-200 transition-all shadow-xs"
          >
            <Tag className="w-4 h-4 text-amber-700" />
            <span>Categories ({categoriesList.length})</span>
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

      {/* Redesigned Responsive Grid (No Collisions, Clear Photo Container) */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-bakery-200/60 p-8">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-bakery-600">Loading catalog items...</p>
        </div>
      ) : productsList.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-bakery-200 p-8 space-y-4">
          <ImageIcon className="w-12 h-12 text-bakery-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate">No Products Found</h3>
          <p className="text-xs text-bakery-600">Click "Add New Cake" above to start populating your catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsList.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              onEdit={() => openEditModal(product)}
              onDelete={() => handleDelete(product.id, product.name)}
            />
          ))}
        </div>
      )}

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl relative animate-scaleIn">
            <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-bakery-chocolate">
                  Manage Categories
                </h3>
                <p className="text-[11px] text-bakery-600">Add or view shop category filter pills</p>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1.5 rounded-full hover:bg-bakery-100 text-bakery-400 hover:text-bakery-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <label className="text-xs font-bold text-bakery-chocolate block">Add New Category Pill *</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Eggless & Vegan Cakes"
                  className="flex-1 bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                />
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  Add
                </button>
              </div>
            </form>

            <div className="space-y-2 pt-3 border-t border-bakery-100">
              <span className="text-xs font-bold text-bakery-chocolate block">Active Categories ({categoriesList.length}):</span>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {categoriesList.map((cat: any) => (
                  <span key={cat.id} className="text-xs bg-bakery-50 border border-bakery-200/80 text-bakery-chocolate px-3 py-1.5 rounded-full font-semibold">
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl max-h-[92vh] rounded-3xl p-6 overflow-y-auto space-y-5 shadow-2xl relative animate-scaleIn">
            <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-bakery-chocolate">
                  {editingProduct ? 'Edit Cake Details' : 'Add New Cake to Store'}
                </h3>
                <p className="text-[11px] text-bakery-600">Configure cake gallery, variants, and stock status</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-bakery-100 text-bakery-400 hover:text-bakery-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Photo Gallery URLs */}
              <div className="space-y-2 bg-bakery-50 p-4 rounded-2xl border border-bakery-200/80">
                <label className="text-xs font-bold text-amber-900 block">
                  Product Image Gallery (Mandatory Main Photo, Up to 4 Photos) *
                </label>
                
                <div>
                  <span className="text-[10px] font-bold text-bakery-700">Main Photo URL *</span>
                  <input
                    type="url"
                    required
                    value={image1}
                    onChange={(e) => setImage1(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-white border border-bakery-200 rounded-xl px-3.5 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600 mt-0.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] font-medium text-bakery-600">Photo 2 (Optional)</span>
                    <input
                      type="url"
                      value={image2}
                      onChange={(e) => setImage2(e.target.value)}
                      placeholder="Photo 2 URL..."
                      className="w-full bg-white border border-bakery-200 rounded-xl px-3 py-1.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600 mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-bakery-600">Photo 3 (Optional)</span>
                    <input
                      type="url"
                      value={image3}
                      onChange={(e) => setImage3(e.target.value)}
                      placeholder="Photo 3 URL..."
                      className="w-full bg-white border border-bakery-200 rounded-xl px-3 py-1.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600 mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-bakery-600">Photo 4 (Optional)</span>
                    <input
                      type="url"
                      value={image4}
                      onChange={(e) => setImage4(e.target.value)}
                      placeholder="Photo 4 URL..."
                      className="w-full bg-white border border-bakery-200 rounded-xl px-3 py-1.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600 mt-0.5"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-bakery-chocolate block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                  >
                    {categoriesList.map((cat: any) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-bakery-chocolate block mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="650"
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-bakery-chocolate block mb-1">Base Weight (grams) *</label>
                  <input
                    type="number"
                    required
                    value={baseWeightG}
                    onChange={(e) => setBaseWeightG(e.target.value)}
                    placeholder="500"
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-bakery-chocolate block mb-1">Weight Variants (g list)</label>
                  <input
                    type="text"
                    value={variantsStr}
                    onChange={(e) => setVariantsStr(e.target.value)}
                    placeholder="500, 1000, 1500, 2000"
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3.5 py-2.5 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
                  />
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
                  disabled={isSaving}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-soft"
                >
                  {isSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

  let photoCount = 1;
  try {
    if (product.images) {
      const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(parsed) && parsed.length > 0) photoCount = parsed.length;
    }
  } catch (e) {}

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-bakery-200/80 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between">
      
      {/* 1. Actual Product Photo Container (No Overlap) */}
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

      {/* 2. Structured Details Area (Category Badge positioned above Title cleanly) */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category Tag (No overlap!) */}
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

        {/* Pricing & Orders Metrics */}
        <div className="pt-3 border-t border-bakery-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-bakery-600 font-medium block">
              Base ({product.baseWeightG}g)
            </span>
            <span className="font-serif text-lg font-extrabold text-amber-800">
              {formatINR(product.basePrice)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-bakery-600 font-medium block">Total Orders</span>
            <span className="text-xs font-bold text-bakery-chocolate">
              {product.orderCount || 0} orders
            </span>
          </div>
        </div>

        {/* Action Buttons: Edit Cake (Primary) & Delete (Icon-only muted rose) */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-bakery-50 hover:bg-bakery-100 text-bakery-chocolate font-semibold text-xs py-2.5 rounded-2xl border border-bakery-200/80 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Edit Cake</span>
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
