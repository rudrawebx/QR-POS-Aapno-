'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { MASTER_AAPNO_KHANO_CATEGORIES } from '@/lib/menuData';
import { uploadImageToServer } from '@/lib/imageUtils';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Sparkles,
  Edit3,
  Trash2,
  Copy,
  Check,
  X,
  Flame,
  Clock,
  Filter,
  Download,
  Upload,
  Layers,
  FolderPlus,
  ArrowUpDown,
  Tag,
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Camera,
  CheckCircle2,
} from 'lucide-react';

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<any[]>(MASTER_AAPNO_KHANO_CATEGORIES);
  const [kitchenStations, setKitchenStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [filterDiet, setFilterDiet] = useState<string>('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'
  const [filterAvailability, setFilterAvailability] = useState<string>('ALL'); // 'ALL' | 'AVAILABLE' | 'SOLD_OUT'
  const [filterBestseller, setFilterBestseller] = useState(false);

  // Selected items for bulk operations
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Modals
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<any | null>(null);

  // Form State for Adding / Editing Dish
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    sku: '',
    categoryId: '',
    kitchenStationId: '',
    basePrice: '',
    discountPrice: '',
    hasVariations: false,
    variationType: 'HALF_FULL',
    priceSmallHalf: '',
    priceMedium: '',
    priceLargeFull: '',
    gstRate: '5.0',
    taxCategory: 'GST 5%',
    description: '',
    imageUrl: '',
    isVeg: true,
    isVegan: false,
    isJain: false,
    isGlutenFree: false,
    spiceLevel: '1',
    preparationTimeMinutes: '15',
    isAvailable: true,
    isBestseller: false,
    isRecommended: false,
    isFeatured: false,
    displayOrder: '0',
  });

  // Category Form State
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    icon: 'Utensils',
    isVegCategory: true,
    displayOrder: '0',
  });

  // CSV Import State
  const [importCsvText, setImportCsvText] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleImageFileSelect = async (file: File, isCategory = false) => {
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const url = await uploadImageToServer(file, (status) => setUploadStatus(status));
      if (url) {
        if (isCategory) {
          setCategoryFormData((prev) => ({ ...prev, imageUrl: url } as any));
          showToast('✓ Category image uploaded successfully!');
        } else {
          setFormData((prev) => ({ ...prev, imageUrl: url }));
          showToast('✓ Dish photo uploaded & optimized!');
        }
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      alert('Unable to process photo. Please try another image file or enter a URL.');
    } finally {
      setIsUploadingImage(false);
      setUploadStatus('');
    }
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const resRest = await fetch('/api/restaurants/aapno-khano');
      const restData = await resRest.json();
      const restId = restData.restaurant?.id || 'aapno-khano';

      const resMenu = await fetch(`/api/menu/${restId}`);
      const menuData = await resMenu.json();
      if (menuData.categories && menuData.categories.length > 0) {
        setCategories(menuData.categories);
        if (!formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: menuData.categories[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Open modal to Create New Dish
  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setFormData({
      name: '',
      shortName: '',
      sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
      categoryId: categories[0]?.id || '',
      kitchenStationId: '',
      basePrice: '',
      discountPrice: '',
      hasVariations: false,
      variationType: 'HALF_FULL',
      priceSmallHalf: '',
      priceMedium: '',
      priceLargeFull: '',
      gstRate: '5.0',
      taxCategory: 'GST 5%',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600',
      isVeg: true,
      isVegan: false,
      isJain: false,
      isGlutenFree: false,
      spiceLevel: '1',
      preparationTimeMinutes: '15',
      isAvailable: true,
      isBestseller: false,
      isRecommended: false,
      isFeatured: false,
      displayOrder: '0',
    });
    setIsDishModalOpen(true);
  };

  // Open modal to Edit Existing Dish
  const handleOpenEditModal = (p: any) => {
    setEditingProductId(p.id);
    setFormData({
      name: p.name || '',
      shortName: p.shortName || p.name || '',
      sku: p.sku || `SKU-${p.id.slice(0, 6).toUpperCase()}`,
      categoryId: p.categoryId || categories[0]?.id || '',
      kitchenStationId: p.kitchenStationId || '',
      basePrice: String(p.basePrice ?? ''),
      discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      hasVariations: Boolean(p.hasVariations),
      variationType: p.variationType || 'HALF_FULL',
      priceSmallHalf: p.priceSmallHalf ? String(p.priceSmallHalf) : '',
      priceMedium: p.priceMedium ? String(p.priceMedium) : '',
      priceLargeFull: p.priceLargeFull ? String(p.priceLargeFull) : '',
      gstRate: String(p.gstRate || '5.0'),
      taxCategory: p.taxCategory || 'GST 5%',
      description: p.description || '',
      imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600',
      isVeg: Boolean(p.isVeg),
      isVegan: Boolean(p.isVegan),
      isJain: Boolean(p.isJain),
      isGlutenFree: Boolean(p.isGlutenFree),
      spiceLevel: String(p.spiceLevel ?? '1'),
      preparationTimeMinutes: String(p.preparationTimeMinutes ?? '15'),
      isAvailable: p.isAvailable !== false,
      isBestseller: Boolean(p.isBestseller),
      isRecommended: Boolean(p.isRecommended),
      isFeatured: Boolean(p.isFeatured),
      displayOrder: String(p.displayOrder ?? '0'),
    });
    setIsDishModalOpen(true);
  };

  // Save Dish (Create or Update in database immediately)
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.basePrice || !formData.categoryId) {
      alert('Please fill in Dish Name, Category, and Base Price');
      return;
    }

    try {
      if (editingProductId) {
        // Optimistically update categories local state immediately
        setCategories((prevCats) =>
          prevCats.map((cat) => ({
            ...cat,
            products: (cat.products || []).map((prod: any) =>
              prod.id === editingProductId
                ? {
                    ...prod,
                    ...formData,
                    basePrice: parseFloat(formData.basePrice || '0'),
                    discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                    priceSmallHalf: formData.priceSmallHalf ? parseFloat(formData.priceSmallHalf) : null,
                    priceLargeFull: formData.priceLargeFull ? parseFloat(formData.priceLargeFull) : null,
                  }
                : prod
            ),
          }))
        );

        // UPDATE (PATCH)
        const res = await fetch('/api/menu/product', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProductId,
            ...formData,
          }),
        });
        if (res.ok) {
          showToast(`✓ Updated "${formData.name}" successfully!`);
          setIsDishModalOpen(false);
          fetchMenu();
        }
      } else {
        // CREATE (POST)
        const res = await fetch('/api/menu/product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.product) {
            setCategories((prevCats) =>
              prevCats.map((cat) =>
                cat.id === formData.categoryId
                  ? { ...cat, products: [...(cat.products || []), resData.product] }
                  : cat
              )
            );
          }
          showToast(`✓ Created new dish "${formData.name}"!`);
        }
      }
      setIsDishModalOpen(false);
      fetchMenu();
    } catch (err) {
      console.error('Error saving dish:', err);
      alert('Failed to save dish to database.');
    }
  };

  // 1-Click Duplicate Dish
  const handleDuplicateDish = async (productId: string) => {
    try {
      const res = await fetch('/api/menu/product', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DUPLICATE', productId }),
      });
      if (res.ok) {
        showToast('✓ Duplicated dish! You can now edit its details.');
        fetchMenu();
      }
    } catch (err) {
      console.error('Error duplicating dish:', err);
    }
  };

  // Soft-Delete / Archive Dish
  const handleConfirmDelete = async () => {
    if (!deleteConfirmProduct) return;
    try {
      const res = await fetch(`/api/menu/product?id=${deleteConfirmProduct.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`✓ Archived "${deleteConfirmProduct.name}". Historical invoices are safe.`);
        setDeleteConfirmProduct(null);
        fetchMenu();
      }
    } catch (err) {
      console.error('Error deleting dish:', err);
    }
  };

  // Instant Availability Toggle
  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/menu/product', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, isAvailable: !currentStatus }),
      });
      showToast(!currentStatus ? '✓ Dish marked In Stock' : '✕ Dish marked Sold Out');
      fetchMenu();
    } catch (err) {
      console.error('Error updating stock status:', err);
    }
  };

  // Instant Bestseller Toggle
  const handleToggleBestseller = async (productId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/menu/product', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, isBestseller: !currentStatus }),
      });
      showToast(!currentStatus ? '⭐ Marked as Bestseller' : 'Removed from Bestseller');
      fetchMenu();
    } catch (err) {
      console.error('Error updating bestseller flag:', err);
    }
  };

  // Bulk Actions
  const handleBulkAction = async (bulkAction: string, bulkValue?: any) => {
    if (selectedProductIds.length === 0) return;
    try {
      const res = await fetch('/api/menu/product', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK',
          productIds: selectedProductIds,
          bulkAction,
          bulkValue,
        }),
      });
      if (res.ok) {
        showToast(`✓ Updated ${selectedProductIds.length} dishes in bulk!`);
        setSelectedProductIds([]);
        fetchMenu();
      }
    } catch (err) {
      console.error('Bulk action error:', err);
    }
  };

  // Create New Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name) return;
    try {
      const res = await fetch('/api/menu/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData),
      });
      if (res.ok) {
        showToast(`✓ Category "${categoryFormData.name}" created!`);
        setIsCategoryModalOpen(false);
        setCategoryFormData({ name: '', description: '', imageUrl: '', icon: 'Utensils', isVegCategory: true, displayOrder: '0' });
        fetchMenu();
      }
    } catch (err) {
      console.error('Create category error:', err);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open('/api/menu/import-export?format=csv', '_blank');
  };

  // Parse & Import CSV
  const handleImportCsv = async () => {
    if (!importCsvText.trim()) return;
    setIsImporting(true);
    setImportErrors([]);

    try {
      const lines = importCsvText.trim().split('\n');
      if (lines.length < 2) {
        setImportErrors(['CSV must contain a header row and at least one item row.']);
        setIsImporting(false);
        return;
      }

      const items = lines.slice(1).map((line) => {
        const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        return {
          sku: cols[0] || '',
          name: cols[1] || '',
          shortName: cols[2] || cols[1] || '',
          category: cols[3] || 'Specialties',
          basePrice: parseFloat(cols[4]) || 0,
          discountPrice: cols[5] ? parseFloat(cols[5]) : null,
          isVeg: cols[6]?.toUpperCase() !== 'FALSE',
          hasVariations: cols[7]?.toUpperCase() === 'TRUE',
          priceSmallHalf: cols[8] ? parseFloat(cols[8]) : null,
          priceLargeFull: cols[9] ? parseFloat(cols[9]) : null,
          gstRate: cols[10] ? parseFloat(cols[10]) : 5.0,
          preparationTimeMinutes: cols[11] ? parseInt(cols[11]) : 15,
          spiceLevel: cols[12] ? parseInt(cols[12]) : 1,
          isBestseller: cols[13]?.toUpperCase() === 'TRUE',
          isAvailable: cols[14]?.toUpperCase() !== 'FALSE',
          kitchenStation: cols[15] || '',
          description: cols[16] || '',
        };
      });

      const res = await fetch('/api/menu/import-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`✓ Successfully imported ${data.importedCount} dishes!`);
        setIsImportModalOpen(false);
        setImportCsvText('');
        fetchMenu();
      } else if (data.errors) {
        setImportErrors(data.errors);
      }
    } catch (err: any) {
      setImportErrors([err.message || 'Failed to parse CSV']);
    } finally {
      setIsImporting(false);
    }
  };

  // Filtered Products
  const allProducts = categories.flatMap((c) =>
    (c.products || []).map((p: any) => ({ ...p, categoryName: c.name }))
  );

  const filteredProducts = allProducts.filter((p) => {
    if (selectedCatId !== 'ALL' && p.categoryId !== selectedCatId) return false;
    if (filterDiet === 'VEG' && !p.isVeg) return false;
    if (filterDiet === 'NON_VEG' && p.isVeg) return false;
    if (filterAvailability === 'AVAILABLE' && !p.isAvailable) return false;
    if (filterAvailability === 'SOLD_OUT' && p.isAvailable) return false;
    if (filterBestseller && !p.isBestseller) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchId = p.id?.toLowerCase().includes(q);
      return matchName || matchDesc || matchSku || matchId;
    }
    return true;
  });

  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-7xl mx-auto pb-12">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#7A0C16] text-[#D4AF37] px-4 py-2.5 rounded-2xl shadow-xl border border-[#D4AF37] flex items-center gap-2 text-xs font-black animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Sticky Top Action Header, Search & Category Filters */}
        <div className="sticky top-0 z-20 bg-[#FEFBF5] pt-0 pb-2 space-y-3">
          {/* Top Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7A0C16]/10 flex items-center justify-center border border-[#7A0C16]/20">
                <UtensilsCrossed className="w-5 h-5 text-[#7A0C16]" />
              </div>
              <div>
                <h1 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <span>Menu &amp; Catalog Management</span>
                  <span className="bg-[#7A0C16] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Live Database
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  {allProducts.length} total dishes across {categories.length} categories • Instant synchronization
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-slate-600" />
                <span>+ Add Category</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="bg-[#7A0C16] hover:bg-[#600810] text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 border border-[#D4AF37] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add New Dish</span>
              </button>
            </div>
          </div>

          {/* Search, Filter & Dietary Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dishes by Name, SKU, ID, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7A0C16]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Diet */}
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                  <button
                    onClick={() => setFilterDiet('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      filterDiet === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Diet
                  </button>
                  <button
                    onClick={() => setFilterDiet('VEG')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                      filterDiet === 'VEG' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-300" />
                    <span>Veg</span>
                  </button>
                  <button
                    onClick={() => setFilterDiet('NON_VEG')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                      filterDiet === 'NON_VEG' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-300" />
                    <span>Non-Veg</span>
                  </button>
                </div>

                {/* Availability Filter */}
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                  <button
                    onClick={() => setFilterAvailability('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      filterAvailability === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Stock
                  </button>
                  <button
                    onClick={() => setFilterAvailability('AVAILABLE')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      filterAvailability === 'AVAILABLE' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    onClick={() => setFilterAvailability('SOLD_OUT')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      filterAvailability === 'SOLD_OUT' ? 'bg-white text-red-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sold Out
                  </button>
                </div>

                {/* Bestseller Toggle */}
                <button
                  onClick={() => setFilterBestseller(!filterBestseller)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    filterBestseller
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${filterBestseller ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>Bestsellers</span>
                </button>

                {/* Refresh */}
                <button
                  onClick={fetchMenu}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
                  title="Refresh from Database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
              <button
                onClick={() => setSelectedCatId('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCatId === 'ALL'
                    ? 'bg-[#7A0C16] text-[#D4AF37] shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Categories ({allProducts.length})
              </button>
              {categories.map((cat) => {
                const count = (cat.products || []).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      selectedCatId === cat.id
                        ? 'bg-[#7A0C16] text-[#D4AF37] shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        cat.isVegCategory ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bulk Actions Floating / Top Bar (When items are selected) */}
        {selectedProductIds.length > 0 && (
          <div className="bg-[#7A0C16] text-white p-3 rounded-2xl shadow-lg border border-[#D4AF37] flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-bold text-xs">
                {selectedProductIds.length} {selectedProductIds.length === 1 ? 'dish' : 'dishes'} selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <button
                onClick={() => handleBulkAction('MARK_AVAILABLE')}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg"
              >
                Mark In Stock
              </button>
              <button
                onClick={() => handleBulkAction('MARK_SOLD_OUT')}
                className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg"
              >
                Mark Sold Out
              </button>
              <button
                onClick={() => handleBulkAction('SET_BESTSELLER', true)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Set Bestseller</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Archive ${selectedProductIds.length} dishes?`)) {
                    handleBulkAction('ARCHIVE');
                  }
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-black text-red-300 rounded-lg flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Archive Selected</span>
              </button>
              <button
                onClick={() => setSelectedProductIds([])}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Food Items Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#7A0C16]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3">Dish / SKU</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Base &amp; Variants</th>
                  <th className="py-3.5 px-3">Diet &amp; Spice</th>
                  <th className="py-3.5 px-3">Prep Time</th>
                  <th className="py-3.5 px-3">Bestseller</th>
                  <th className="py-3.5 px-3">Stock Status</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#7A0C16]" />
                      <p className="font-bold text-slate-700 text-sm">No dishes match your filter</p>
                      <p className="text-xs text-slate-400 mt-1">Try clearing your search or add a new dish</p>
                      <button
                        onClick={handleOpenAddModal}
                        className="mt-3 px-3 py-1.5 bg-[#7A0C16] text-white rounded-xl text-xs font-bold"
                      >
                        + Add First Dish
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-amber-50/40 transition-colors ${
                          isSelected ? 'bg-amber-50/70' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleSelectProduct(p.id)}
                            className="cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#7A0C16]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* Dish name & image */}
                        <td className="py-3 px-3 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 shadow-2xs relative">
                            <img
                              src={p.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600';
                              }}
                            />
                            {p.hasVariations && (
                              <span className="absolute bottom-0 right-0 bg-black/75 text-[#D4AF37] text-[8px] font-black px-1 rounded-tl">
                                VAR
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs truncate max-w-xs">{p.name}</p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <span className="font-mono bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                                {p.sku || `SKU-${p.id.slice(0, 6)}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            {p.categoryName}
                          </span>
                        </td>

                        {/* Price & Variations */}
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {p.hasVariations ? (
                            <div>
                              <span className="text-[10px] text-slate-400 font-normal block">
                                {p.variationType === 'HALF_FULL' ? 'Half / Full:' : 'Small / Large:'}
                              </span>
                              <span className="text-xs text-[#7A0C16] font-black">
                                ₹{p.priceSmallHalf ?? p.basePrice} - ₹{p.priceLargeFull ?? p.basePrice}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-xs text-[#7A0C16] font-black">₹{p.discountPrice ?? p.basePrice}</span>
                              {p.discountPrice && (
                                <span className="line-through text-[10px] text-slate-400 ml-1 font-normal">
                                  ₹{p.basePrice}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Diet / Spice */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-3.5 h-3.5 rounded-xs border-2 bg-white flex items-center justify-center ${
                                p.isVeg ? 'border-emerald-600' : 'border-red-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  p.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                                }`}
                              />
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {p.spiceLevel > 0 ? '🌶️'.repeat(Math.min(p.spiceLevel, 3)) : 'Mild'}
                            </span>
                          </div>
                        </td>

                        {/* Prep Time */}
                        <td className="py-3 px-3 text-slate-600">{p.preparationTimeMinutes || 15}m</td>

                        {/* Bestseller Toggle */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleBestseller(p.id, p.isBestseller)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              p.isBestseller
                                ? 'bg-amber-50 text-amber-600 border-amber-300'
                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                            }`}
                            title="Toggle Bestseller Badge"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </td>

                        {/* In-Stock / Sold-Out Toggle */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleAvailability(p.id, p.isAvailable)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              p.isAvailable
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {p.isAvailable ? 'In Stock ✓' : 'Sold Out ✕'}
                          </button>
                        </td>

                        {/* Actions (Edit, Duplicate, Delete) */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="Edit Dish & Update Price"
                            >
                              <Edit3 className="w-3 h-3 text-blue-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDuplicateDish(p.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Duplicate Dish"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmProduct(p)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Archive Dish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 1. FULL FOOD DISH MODAL (ADD & EDIT) */}
        {isDishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200 border border-slate-200">
              <div className="flex items-center justify-between bg-[#7A0C16] text-[#D4AF37] px-6 py-4 border-b border-[#D4AF37]/30">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-black text-sm text-white">
                    {editingProductId ? 'Edit Food Dish & Variations' : 'Add New Royal Dish'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDishModalOpen(false)}
                  className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDish} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dish Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Paneer Pasanda"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Short Name (For KOT/Bill)</label>
                    <input
                      type="text"
                      placeholder="e.g. Paneer Pasanda"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* SKU & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SKU / Item Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SKU-PAN-001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description &amp; Ingredients</label>
                  <textarea
                    rows={2}
                    placeholder="Rich description of spices, gravies, and preparation style..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Pricing & Variations */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-xs">Pricing &amp; Portion Variations</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasVariations}
                        onChange={(e) => setFormData({ ...formData, hasVariations: e.target.checked })}
                        className="rounded text-[#7A0C16]"
                      />
                      <span className="font-bold text-slate-700">Has Sizing Variations (Half/Full or Small/Large)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Base Price (₹) *</label>
                      <input
                        type="number"
                        required
                        step="1"
                        placeholder="e.g. 299"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Discount Price (₹)</label>
                      <input
                        type="number"
                        step="1"
                        placeholder="Optional"
                        value={formData.discountPrice}
                        onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">GST Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.gstRate}
                        onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  {formData.hasVariations && (
                    <div className="pt-2 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Variation Type</label>
                        <select
                          value={formData.variationType}
                          onChange={(e) => setFormData({ ...formData, variationType: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                        >
                          <option value="HALF_FULL">Half / Full</option>
                          <option value="SMALL_LARGE">Small / Large</option>
                          <option value="SMALL_MED_LARGE">Small / Medium / Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Half / Small Price (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 299"
                          value={formData.priceSmallHalf}
                          onChange={(e) => setFormData({ ...formData, priceSmallHalf: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Full / Large Price (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 549"
                          value={formData.priceLargeFull}
                          onChange={(e) => setFormData({ ...formData, priceLargeFull: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dietary & Kitchen Settings */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Diet Type</label>
                    <select
                      value={formData.isVeg ? 'VEG' : 'NON_VEG'}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'VEG' })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="VEG">🟢 Pure Veg</option>
                      <option value="NON_VEG">🔴 Non-Veg</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Spice Level</label>
                    <select
                      value={formData.spiceLevel}
                      onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="0">Mild</option>
                      <option value="1">🌶️ Medium</option>
                      <option value="2">🌶️🌶️ Spicy</option>
                      <option value="3">🌶️🌶️🌶️ Extra Hot</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prep Time (mins)</label>
                    <input
                      type="number"
                      value={formData.preparationTimeMinutes}
                      onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Flags: Bestseller, Recommended, In Stock */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold text-slate-800">In Stock / Available for Order</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBestseller}
                      onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                      className="rounded text-amber-600"
                    />
                    <span className="font-bold text-amber-900">⭐ Mark as Bestseller</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecommended}
                      onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span className="font-bold text-blue-900">Chef's Recommended</span>
                  </label>
                </div>

                {/* Image URL & File Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-slate-700">Dish Photo / Image</label>
                    {formData.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="text-[10px] font-bold text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  {/* Dropzone & 1-Click Upload */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleImageFileSelect(file);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-3 transition-all flex flex-col sm:flex-row items-center gap-3 ${
                      isDraggingImage
                        ? 'border-[#AA1B2A] bg-red-50/60 scale-[1.01]'
                        : formData.imageUrl
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
                    }`}
                  >
                    {formData.imageUrl ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative shadow-xs">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#FFF0E8] border border-[#E09D3D]/30 flex items-center justify-center flex-shrink-0 text-[#AA1B2A]">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                    )}

                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <label className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 shadow-xs transition-all ${
                          isUploadingImage
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#80101C] hover:to-[#B82E25] text-white'
                        }`}>
                          <Camera className="w-4 h-4" />
                          <span>{isUploadingImage ? (uploadStatus || 'Processing Photo...') : 'Upload Photo / Gallery'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingImage}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageFileSelect(file);
                            }}
                          />
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">or drag & drop</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Select JPG, PNG or WebP from mobile or laptop. High quality auto-compressed.
                      </p>
                    </div>
                  </div>

                  {/* Direct Path / URL input fallback */}
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Or enter direct URL: /images/menu/... or https://..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsDishModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#7A0C16] hover:bg-[#600810] text-[#D4AF37] border border-[#D4AF37] rounded-xl font-black shadow-sm"
                  >
                    {editingProductId ? 'Save Dish Changes' : 'Create Dish in Menu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. CATEGORY MODAL */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-bold text-sm text-slate-900">Add Menu Category</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Handi Specialties"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Slow cooked curries and signature handi dishes"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Default Diet</label>
                    <select
                      value={categoryFormData.isVegCategory ? 'VEG' : 'NON_VEG'}
                      onChange={(e) =>
                        setCategoryFormData({ ...categoryFormData, isVegCategory: e.target.value === 'VEG' })
                      }
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="VEG">🟢 Vegetarian</option>
                      <option value="NON_VEG">🔴 Non-Vegetarian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={categoryFormData.displayOrder}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, displayOrder: e.target.value })}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Category Image Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Category Banner / Image (Optional)</label>
                    {categoryFormData.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setCategoryFormData({ ...categoryFormData, imageUrl: '' })}
                        className="text-[10px] font-bold text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {categoryFormData.imageUrl && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        <img
                          src={categoryFormData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200';
                          }}
                        />
                      </div>
                    )}
                    <label className={`px-3 py-2 border rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-all ${
                      isUploadingImage
                        ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    }`}>
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isUploadingImage ? (uploadStatus || 'Uploading...') : 'Choose File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileSelect(file, true);
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter image URL: /images/menu/... or https://..."
                      value={categoryFormData.imageUrl}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#7A0C16] text-[#D4AF37] rounded-xl font-bold"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. IMPORT CSV MODAL */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl p-6 border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h3 className="font-bold text-sm text-slate-900">Import Dishes via CSV</h3>
                <button onClick={() => setIsImportModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Paste CSV text below with columns: <br />
                  <code className="font-mono bg-slate-100 p-1 rounded text-[10px] block mt-1 overflow-x-auto">
                    SKU,Name,ShortName,Category,BasePrice,DiscountPrice,IsVeg,HasVariations,PriceSmallHalf,PriceLargeFull,GSTRate,PrepTimeMins,SpiceLevel,IsBestseller,IsAvailable,KitchenStation,Description
                  </code>
                </p>

                <textarea
                  rows={6}
                  placeholder={`SKU,Name,ShortName,Category,BasePrice,DiscountPrice,IsVeg,HasVariations,PriceSmallHalf,PriceLargeFull,GSTRate,PrepTimeMins,SpiceLevel,IsBestseller,IsAvailable,KitchenStation,Description\nSKU-001,Royal Paneer Handi,Paneer Handi,Main Course,279,,TRUE,FALSE,,,5.0,15,1,TRUE,TRUE,,Fresh paneer in handi gravy`}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />

                {importErrors.length > 0 && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 space-y-1">
                    {importErrors.map((err, i) => (
                      <p key={i} className="text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        <span>{err}</span>
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportCsv}
                    disabled={isImporting || !importCsvText.trim()}
                    className="px-5 py-2 bg-[#7A0C16] text-[#D4AF37] rounded-xl font-bold disabled:opacity-50"
                  >
                    {isImporting ? 'Importing...' : 'Start Import'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. DELETE / ARCHIVE CONFIRMATION MODAL */}
        {deleteConfirmProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 text-center animate-in zoom-in-95 border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Archive this menu dish?</h3>
              <p className="text-xs text-slate-500 mb-4">
                Are you sure you want to archive <strong>"{deleteConfirmProduct.name}"</strong>? It will no longer appear on menus, but past orders &amp; invoices remain intact.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setDeleteConfirmProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Archive Dish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
