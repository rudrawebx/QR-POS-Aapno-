'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CustomerHeader from '@/components/CustomerHeader';
import FoodCustomizationModal from '@/components/FoodCustomizationModal';
import StickyCartDrawer from '@/components/StickyCartDrawer';
import RazorpayModal from '@/components/RazorpayModal';
import { CartItem } from '@/lib/types';
import { MASTER_AAPNO_KHANO_CATEGORIES } from '@/lib/menuData';
import {
  UtensilsCrossed,
  Plus,
  Sparkles,
  Flame,
  Clock,
  Car,
  ShoppingBag,
  Star,
  Layers,
  MessageCircle,
  AlertCircle,
  Lock,
} from 'lucide-react';

export default function CustomerQsrMenuPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'aapno-khano';
  const tableParam = (params?.table as string) || null;

  // Extract clean table number if present e.g. "table-04" -> "04"
  const lockedTableNumber = tableParam ? tableParam.replace(/^table-?/i, '') : null;

  const [restaurant, setRestaurant] = useState<any>({
    id: 'rest_aapno_khano',
    name: 'आपणो खाणो (Aapno Khaano)',
    slug: 'aapno-khano',
    logoUrl: '/images/aapno-khano-logo.png',
    phone: '+91 99962 13962',
    address: 'Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053',
    city: 'Fatehabad',
    state: 'Haryana',
    postalCode: '125053',
    gstin: '08AABCU9603R1ZM',
    fssaiNumber: '12224026000189',
    currencySymbol: '₹',
    isOpen: true,
    settings: {
      isRestaurantOpen: true,
      openingHoursText: '11:00 AM - 11:30 PM',
      closureMessage: 'We are currently closed for orders. Please visit during regular hours.',
      upiId: '9996213962m@pnb',
      upiMerchantName: 'AAPNO KHANO',
      upiQrImageUrl: '/images/pnb-upi-qr.png',
      taxRateGst: 5.0,
      supportWhatsappNumber: '+919996213962',
      themePrimaryColor: '#AA1B2A',
      themeGoldColor: '#E09D3D',
    },
  });

  // Pre-load all 60+ authentic dishes so menu is NEVER empty
  const [categories, setCategories] = useState<any[]>(MASTER_AAPNO_KHANO_CATEGORIES);
  const [loading, setLoading] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Modal & Cart State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOrderDetails, setCheckoutOrderDetails] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const isStoreOpen = restaurant.settings?.isRestaurantOpen ?? restaurant.isOpen ?? true;

  useEffect(() => {
    async function loadData() {
      try {
        const resRest = await fetch(`/api/restaurants/${slug}`);
        const restData = await resRest.json();

        if (restData.restaurant) {
          setRestaurant(restData.restaurant);
          const resMenu = await fetch(`/api/menu/${restData.restaurant.id || 'aapno-khano'}`);
          const menuData = await resMenu.json();
          if (menuData.categories && menuData.categories.length > 0) {
            setCategories(menuData.categories);
          }
        }
      } catch (err) {
        console.error('Error fetching QSR menu:', err);
      }
    }
    loadData();
  }, [slug]);

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    if (!isStoreOpen) {
      alert('The restaurant is currently closed for new orders. Please view the menu or check back later.');
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (p) =>
          p.productId === item.productId &&
          p.selectedVariation === item.selectedVariation &&
          p.specialNotes === item.specialNotes
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.cartId === cartId) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (cartId: string) => {
    setCart((prev) => prev.filter((it) => it.cartId !== cartId));
  };

  const handleProceedToPayment = (orderDetails: any) => {
    setCheckoutOrderDetails(orderDetails);
    setIsPaymentModalOpen(true);
  };

  // Filter Categories & Products
  const filteredCategories = categories
    .map((cat) => {
      const filteredProducts = (cat.products || []).filter((prod: any) => {
        // Veg / Non-Veg filter
        if (selectedFilter === 'VEG' && !prod.isVeg) return false;
        if (selectedFilter === 'NON_VEG' && prod.isVeg) return false;

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = prod.name.toLowerCase().includes(q);
          const matchDesc = prod.description?.toLowerCase().includes(q);
          const matchLocal = prod.localName?.toLowerCase().includes(q);
          return matchName || matchDesc || matchLocal;
        }
        return true;
      });

      return {
        ...cat,
        products: filteredProducts,
      };
    })
    .filter((cat) => {
      if (activeCategory !== 'ALL' && cat.id !== activeCategory) return false;
      return cat.products.length > 0;
    });

  const whatsappNumber = (restaurant.settings?.supportWhatsappNumber || '9996213962').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello Aapno Khaano team, I am looking at the menu${lockedTableNumber ? ` at Table ${lockedTableNumber}` : ''} and need some assistance.`
  )}`;

  return (
    <div className="min-h-screen bg-[#FEFBF5] text-[#331E17] flex flex-col font-sans pb-28 selection:bg-[#E09D3D] selection:text-[#AA1B2A]">
      {/* Sticky Header with Veg/Non-Veg Filters and Category Nav */}
      <CustomerHeader
        restaurant={restaurant}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilter={selectedFilter}
        onFilterSelect={setSelectedFilter}
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
      />

      {/* Table Lock Banner if present */}
      {lockedTableNumber && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-center text-xs font-bold text-emerald-900 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>Ordering for Dine-In: <b>Table {lockedTableNumber}</b></span>
        </div>
      )}

      {/* Closed Notice Banner */}
      {!isStoreOpen && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-center text-xs font-bold text-red-900 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>
            {restaurant.settings?.closureMessage ||
              'We are currently closed for orders. (Hours: 11:00 AM - 11:30 PM). Menu is view-only.'}
          </span>
        </div>
      )}

      {/* Main Menu Feed */}
      <main className="max-w-4xl mx-auto px-4 py-6 w-full space-y-8 flex-1">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E1D6] p-8 shadow-xs">
            <UtensilsCrossed className="w-10 h-10 text-[#AA1B2A] mx-auto mb-2 opacity-50" />
            <h3 className="font-bold text-base text-[#331E17]">No matching royal dishes found</h3>
            <p className="text-xs text-[#745E55] mt-1">Try clearing search or filters to see the full menu</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('ALL');
                setActiveCategory('ALL');
              }}
              className="mt-4 px-5 py-2 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white rounded-2xl text-xs font-black shadow-xs"
            >
              Show All Dishes
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.id} id={category.slug} className="space-y-3.5 scroll-mt-36">
              {/* Category Title Header */}
              <div className="flex items-center justify-between border-b-2 border-[#E09D3D]/30 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center ${
                      category.isVegCategory ? 'border-emerald-600 bg-emerald-50' : 'border-red-600 bg-red-50'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        category.isVegCategory ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    />
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-[#AA1B2A] uppercase tracking-wide">
                    {category.name}
                  </h2>
                </div>
                <span className="text-xs font-bold text-[#745E55]">
                  {category.products.length} {category.products.length === 1 ? 'Dish' : 'Dishes'}
                </span>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {category.products.map((product: any) => {
                  return (
                    <div
                      key={product.id}
                      onClick={() => isStoreOpen && setSelectedProduct(product)}
                      className={`bg-white rounded-3xl p-3 sm:p-3.5 border border-[#E8E1D6] shadow-xs hover:shadow-md hover:border-[#E09D3D] transition-all flex gap-3 group relative overflow-hidden ${
                        isStoreOpen ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'
                      }`}
                    >
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                        <div>
                          {/* Veg/Non-Veg & Bestseller */}
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`w-3.5 h-3.5 rounded-xs border-2 bg-white flex items-center justify-center shadow-2xs ${
                                product.isVeg ? 'border-emerald-600' : 'border-red-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  product.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                                }`}
                              />
                            </span>

                            {product.isBestseller && (
                              <span className="bg-amber-100 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 border border-amber-300">
                                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                <span>Bestseller</span>
                              </span>
                            )}
                          </div>

                          <h3 className="font-black text-xs sm:text-sm text-[#331E17] group-hover:text-[#AA1B2A] transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          {product.localName && (
                            <p className="text-[10px] text-[#745E55] line-clamp-1">{product.localName}</p>
                          )}

                          {product.description && (
                            <p className="text-[11px] text-[#745E55] line-clamp-2 mt-0.5 leading-relaxed">
                              {product.description}
                            </p>
                          )}
                        </div>

                        {/* Price & Add Action */}
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            {product.hasVariations ? (
                              <div>
                                <span className="text-[11px] text-[#745E55] font-medium">Starts from </span>
                                <span className="text-sm font-black text-[#AA1B2A]">
                                  ₹{product.priceSmallHalf ?? product.basePrice}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-black text-[#AA1B2A]">
                                ₹{product.basePrice}
                              </span>
                            )}
                          </div>

                          {isStoreOpen ? (
                            <button
                              type="button"
                              className="px-3.5 py-1.5 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white rounded-2xl font-black text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 border border-[#E09D3D]"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#E09D3D]" />
                              <span>Add</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">Closed</span>
                          )}
                        </div>
                      </div>

                      {/* Right: Food Image */}
                      <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-[#E8E1D6] shadow-2xs">
                        <img
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80'}
                          alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        {product.hasVariations && (
                          <div className="absolute bottom-1 right-1 bg-black/75 text-[#E09D3D] text-[9px] font-black px-1.5 py-0.5 rounded backdrop-blur-xs">
                            Portions
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Floating WhatsApp Support Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs transition-transform hover:scale-105 border-2 border-white cursor-pointer"
        title="Chat with Restaurant on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="hidden sm:inline">WhatsApp Help</span>
      </a>

      {/* Food Customization Modal */}
      {selectedProduct && (
        <FoodCustomizationModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Sticky Bottom Cart Drawer */}
      <StickyCartDrawer
        cart={cart}
        lockedTableNumber={lockedTableNumber}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToPayment={handleProceedToPayment}
      />

      {/* Razorpay / UPI QR Payment Modal */}
      {isPaymentModalOpen && checkoutOrderDetails && (
        <RazorpayModal
          restaurant={restaurant}
          orderDetails={checkoutOrderDetails}
          cart={cart}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}
    </div>
  );
}
