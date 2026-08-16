'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Plus, Edit2, Trash2, Tag, X, Image as ImageIcon, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { formatINR, parseProductVariants, WeightVariant } from '@/lib/pricing';

const ProductModalLazy = dynamic(() => import('./ProductModalLazy'), {
  ssr: false,
});

const ITEMS_PER_PAGE = 12;

interface AdminProductsClientProps {
  initialProducts: any[];
  initialCategories: any[];
}

export default function AdminProductsClient({
  initialProducts,
  initialCategories,
}: AdminProductsClientProps) {
  const [productsList, setProductsList] = useState<any[]>(initialProducts || []);
  const [categoriesList, setCategoriesList] = useState<any[]>(initialCategories || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Search & Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Category manager states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [catFeedbackMsg, setCatFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchesSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'all'
        ? true
        : selectedCategory === 'featured'
          ? Boolean(p.isFeatured)
          : p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [productsList, searchQuery, selectedCategory]);

  const handleToggleFeatured = async (product: any) => {
    const newFeatured = !product.isFeatured;
    setProductsList(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: newFeatured } : p));

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: newFeatured }),
      });
      if (!res.ok) {
        setProductsList(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: !newFeatured } : p));
      }
    } catch {
      setProductsList(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: !newFeatured } : p));
    }
  };

  // Paginated products slice
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  // Surgical state update when saved
  const handleProductSaved = (savedProduct: any, isEdit: boolean) => {
    if (isEdit) {
      setProductsList(prev => prev.map(p => p.id === savedProduct.id ? { ...p, ...savedProduct } : p));
    } else {
      setProductsList(prev => [savedProduct, ...prev]);
    }
  };

  // Surgical state update when deleted
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

  // Category Handlers
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
        setCategoriesList(prev => prev.map(c => c.id === catId ? data.category : c));
        setCatFeedbackMsg({ type: 'success', text: `Category updated to "${data.category.name}".` });
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
        const catRes = await fetch('/api/categories').then(r => r.json());
        if (catRes.categories) setCategoriesList(catRes.categories);
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
        setCategoriesList(prev => prev.filter(c => c.id !== cat.id));
        setCatFeedbackMsg({ type: 'success', text: `Category deleted.` });
      } else {
        setCatFeedbackMsg({ type: 'error', text: data.error || 'Failed to delete category' });
      }
    } catch (e) {
      setCatFeedbackMsg({ type: 'error', text: 'Error deleting category' });
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

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-bakery-200/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-bakery-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search products by name or description..."
            className="w-full bg-bakery-50 border border-bakery-200 rounded-xl pl-9 pr-4 py-2 text-xs text-bakery-chocolate focus:outline-none focus:border-amber-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs font-semibold text-bakery-chocolate focus:outline-none focus:border-amber-600"
          >
            <option value="all">All Categories ({productsList.length})</option>
            <option value="featured">⭐ Featured Only ({productsList.filter(p => p.isFeatured).length})</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-bakery-200 p-8 space-y-4">
          <ImageIcon className="w-12 h-12 text-bakery-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate">No Products Found</h3>
          <p className="text-xs text-bakery-600">Try clearing search filters or click &quot;Add New Cake&quot; to populate your catalog.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <AdminProductCard
                key={product.id}
                product={product}
                onEdit={() => openEditModal(product)}
                onDelete={() => handleDeleteProduct(product.id, product.name)}
                onToggleFeatured={() => handleToggleFeatured(product)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-bakery-200/80 shadow-xs">
              <span className="text-xs text-bakery-600 font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-bakery-200 text-bakery-chocolate hover:bg-bakery-50 disabled:opacity-30 transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      currentPage === pg
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-bakery-chocolate hover:bg-bakery-100'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-bakery-200 text-bakery-chocolate hover:bg-bakery-50 disabled:opacity-30 transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LAZY LOADED ADD/EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <ProductModalLazy
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingProduct={editingProduct}
          categoriesList={categoriesList}
          onSaved={handleProductSaved}
        />
      )}

      {/* CATEGORY MANAGER MODAL */}
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

            {/* Live Categories List */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold text-bakery-chocolate block">Active Categories & Live Product Count:</span>
              
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {categoriesList.map((cat: any, idx: number) => {
                  const isEditingThis = editingCatId === cat.id;

                  return (
                    <div key={cat.id} className="bg-bakery-50 p-3 rounded-2xl border border-bakery-200 flex items-center justify-between gap-3 shadow-xs">
                      
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
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
    </div>
  );
}

// Individual Admin Product Card Component with Lazy-loaded image
function AdminProductCard({
  product,
  onEdit,
  onDelete,
  onToggleFeatured,
}: {
  product: any;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
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
    <div className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
      product.isFeatured ? 'border-amber-400 ring-2 ring-amber-500/20 shadow-soft-lg' : 'border-bakery-200/80 shadow-soft hover:shadow-soft-lg'
    }`}>
      
      {/* Product Photo Container */}
      <div className="relative h-48 w-full bg-bakery-100 overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgSrc('/cake-placeholder.svg')}
          loading="lazy"
        />

        {/* Featured Badge */}
        {product.isFeatured && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            ⭐ Featured
          </span>
        )}

        <span
          className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
            product.isAvailable !== false
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {product.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
        </span>

        <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          📷 {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="inline-block bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200/60">
              {product.category}
            </span>

            {/* Quick 1-Click Featured Toggle */}
            <button
              type="button"
              onClick={onToggleFeatured}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                product.isFeatured
                  ? 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200'
                  : 'bg-bakery-50 text-bakery-500 border-bakery-200 hover:border-amber-300 hover:text-amber-800'
              }`}
              title={product.isFeatured ? 'Click to remove from Featured' : 'Click to mark as Featured on Home Page'}
            >
              <span>{product.isFeatured ? '⭐ Featured' : '☆ Feature'}</span>
            </button>
          </div>

          <h3 className="font-serif text-base font-bold text-bakery-chocolate line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-bakery-800/70 line-clamp-2 leading-relaxed mt-1">
            {product.description}
          </p>
        </div>

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

        <div className="pt-2 border-t border-bakery-100">
          <span className="text-[10px] text-bakery-600 font-medium block">
            Default ({defaultVar.weightG >= 1000 ? `${defaultVar.weightG / 1000}kg` : `${defaultVar.weightG}g`})
          </span>
          <span className="font-serif text-lg font-extrabold text-amber-800 tracking-tight">
            {formatINR(defaultVar.price)}
          </span>
        </div>

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
