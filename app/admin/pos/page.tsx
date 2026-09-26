'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PrintDualThermal from '@/components/PrintDualThermal';
import PosHoldOrdersDrawer, { HeldOrder, getAmountColorTier } from '@/components/PosHoldOrdersDrawer';
import { MASTER_AAPNO_KHANO_CATEGORIES } from '@/lib/menuData';
import { CartItem } from '@/lib/types';
import {
  CreditCard,
  Search,
  Plus,
  Minus,
  Trash2,
  Car,
  ShoppingBag,
  Utensils,
  Receipt,
  User,
  Phone,
  Tag,
  Clock,
  Sparkles,
  CheckCircle2,
  Check,
  Printer,
  ChevronRight,
  ShieldCheck,
  PauseCircle,
  FileText,
  Calendar,
  AlertTriangle,
  Play,
  X,
  Layers,
} from 'lucide-react';

const MAX_HELD_ORDERS = 20;

export default function AdminPosPage() {
  const [categories, setCategories] = useState<any[]>(MASTER_AAPNO_KHANO_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Active Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'CAR_SERVICE' | 'TAKEAWAY'>('CAR_SERVICE');
  const [isQuickGuest, setIsQuickGuest] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'SPLIT'>('UPI');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Held Orders (Parking Tickets) State & UI
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [isHoldDrawerOpen, setIsHoldDrawerOpen] = useState(false);
  const [holdLimitAlert, setHoldLimitAlert] = useState<string | null>(null);
  const [resumePromptHeld, setResumePromptHeld] = useState<HeldOrder | null>(null);

  // Dual Thermal Printing State
  const [dualPrintData, setDualPrintData] = useState<{ billData: any; kotData: any } | null>(null);
  const [lastBillData, setLastBillData] = useState<any | null>(null);

  // Customization Modal for Portion Variations
  const [customizingProduct, setCustomizingProduct] = useState<any | null>(null);
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashTendered, setCashTendered] = useState<string>('');

  // Load Held Orders from API & LocalStorage on mount
  useEffect(() => {
    async function loadHeldOrders() {
      try {
        const saved = localStorage.getItem('AAPNO_POS_HELD_ORDERS_V1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHeldOrders(parsed);
          }
        }
        // Fetch latest synced held orders from database
        const res = await fetch('/api/pos/hold?restaurantId=rest_aapno_khano');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.heldOrders) && data.heldOrders.length > 0) {
            setHeldOrders(data.heldOrders);
            localStorage.setItem('AAPNO_POS_HELD_ORDERS_V1', JSON.stringify(data.heldOrders));
          }
        }
      } catch (err) {
        console.error('Error loading held orders:', err);
      }
    }
    loadHeldOrders();
  }, []);

  // Helper to persist held orders to localStorage & Database
  const updateHeldOrders = (newList: HeldOrder[]) => {
    setHeldOrders(newList);
    try {
      localStorage.setItem('AAPNO_POS_HELD_ORDERS_V1', JSON.stringify(newList));
    } catch (err) {
      console.error('Error saving held orders to localStorage:', err);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [menuRes, settingsRes, ordersRes] = await Promise.all([
          fetch('/api/menu/aapno-khano'),
          fetch('/api/settings'),
          fetch('/api/invoices?limit=1'),
        ]);

        const menuData = await menuRes.json();
        if (menuData.categories && menuData.categories.length > 0) {
          setCategories(menuData.categories);
        }

        const settingsData = await settingsRes.json();
        if (settingsData.restaurant?.settings) {
          setIsStoreOpen(settingsData.restaurant.settings.isRestaurantOpen ?? true);
        }

        const invData = await ordersRes.json();
        if (invData.invoices && invData.invoices.length > 0) {
          const latest = invData.invoices[0];
          setLastBillData({
            restaurant: {
              name: 'आपणो खाणो (Aapno Khaano)',
              address: 'Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053',
              city: 'Fatehabad',
              state: 'Haryana',
              postalCode: '125053',
              phone: '+91 99962 13962',
              gstin: '08AABCU9603R1ZM',
              fssaiNumber: '12224026000189',
              currencySymbol: '₹',
              defaultReceiptFooter: 'Padharo Mhare Desh! Thank you for visiting Aapno Khaano.',
            },
            order: {
              humanOrderId: latest.order?.humanOrderId || latest.humanInvoiceNumber,
              createdAt: latest.createdAt,
              customerName: latest.customerName || 'Direct Guest',
              customerPhone: latest.customerPhone || '9996213962',
              carNumber: latest.carNumber,
              orderType: latest.orderType || 'CAR_SERVICE',
              paymentMethod: latest.paymentMethod || 'UPI',
              paymentStatus: 'PAID',
              transactionId: latest.transactionId,
              subtotal: latest.subtotal,
              cgstAmount: latest.cgstAmount,
              sgstAmount: latest.sgstAmount,
              grandTotal: latest.grandTotal,
            },
            items: latest.order?.items?.map((it: any) => ({
              name: it.productName,
              selectedVariation: it.selectedVariation,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              totalPrice: it.totalPrice,
              isVeg: it.isVeg,
            })) || [{ name: 'Assorted Royal Dishes', quantity: 1, unitPrice: latest.subtotal, totalPrice: latest.subtotal }],
          });
        }
      } catch (err) {
        console.error('Error fetching POS data:', err);
      }
    }
    loadData();
  }, []);

  const handleToggleStoreStatus = async () => {
    try {
      const nextStatus = !isStoreOpen;
      setIsStoreOpen(nextStatus);
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRestaurantOpen: nextStatus }),
      });
    } catch (e) {
      console.error('Toggle status error:', e);
    }
  };

  const allProducts = categories.flatMap((c) => (c.products || []).map((p: any) => ({ ...p, categoryId: p.categoryId || c.id })));
  const filteredProducts = allProducts.filter((p) => {
    if (selectedCategoryId !== 'ALL' && p.categoryId !== selectedCategoryId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchLocal = p.localName?.toLowerCase().includes(q);
      return matchName || matchSku || matchLocal;
    }
    return true;
  });

  const handleAddProduct = (product: any) => {
    if (product.hasVariations) {
      setCustomizingProduct(product);
    } else {
      const unitPrice = product.discountPrice ?? product.basePrice;
      const existingIdx = cartItems.findIndex(
        (it) => it.productId === product.id && !it.selectedVariation
      );

      if (existingIdx > -1) {
        const updated = [...cartItems];
        updated[existingIdx].quantity += 1;
        setCartItems(updated);
      } else {
        setCartItems([
          ...cartItems,
          {
            cartId: `${product.id}_base_${Date.now()}`,
            productId: product.id,
            name: product.name,
            basePrice: unitPrice,
            unitPrice,
            quantity: 1,
            isVeg: product.isVeg,
            imageUrl: product.imageUrl,
            modifiers: [],
            kitchenStationId: product.kitchenStationId,
          },
        ]);
      }
    }
  };

  const handleUpdateQty = (index: number, delta: number) => {
    const updated = [...cartItems];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    setCartItems(updated);
  };

  const rawSubtotal = cartItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);
  const cgstAmount = +(subtotalAfterDiscount * 0.025).toFixed(2);
  const sgstAmount = +(subtotalAfterDiscount * 0.025).toFixed(2);
  const taxAmount = +(cgstAmount + sgstAmount).toFixed(2);
  const grandTotal = +(subtotalAfterDiscount + taxAmount).toFixed(2);

  // Dynamic color zone tier info for current active ticket
  const activeTier = getAmountColorTier(grandTotal);

  // HOLD ORDER FUNCTION (Up to 20 Capacity)
  const handleHoldOrder = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty. Please add dishes to ticket before holding.');
      return;
    }

    if (heldOrders.length >= MAX_HELD_ORDERS) {
      setHoldLimitAlert(
        `Maximum ${MAX_HELD_ORDERS} orders limit reached. Please settle or resume existing held orders before placing a new one on hold.`
      );
      return;
    }

    // Assign next available hold token slot # (1 to 20)
    const usedSlots = new Set(heldOrders.map((h) => h.holdNumber));
    let nextSlot = 1;
    for (let i = 1; i <= MAX_HELD_ORDERS; i++) {
      if (!usedSlots.has(i)) {
        nextSlot = i;
        break;
      }
    }

    const now = new Date();
    const newHeld: HeldOrder = {
      id: `hold_${Date.now()}`,
      holdNumber: nextSlot,
      title: carNumber ? `Car ${carNumber}` : (customerName || 'Direct Guest'),
      createdAt: now.toISOString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cartItems: [...cartItems],
      customerName,
      customerPhone,
      carNumber,
      cookingInstructions,
      orderType,
      paymentMethod,
      discountAmount,
      subtotal: rawSubtotal,
      taxAmount,
      grandTotal,
      itemCount: cartItems.reduce((acc, it) => acc + it.quantity, 0),
    };

    const updated = [newHeld, ...heldOrders];
    updateHeldOrders(updated);

    // Sync to Database in background
    fetch('/api/pos/hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHeld),
    }).catch((e) => console.warn('Failed to sync held order to database:', e));

    // Auto-fire / print KOT for Kitchen immediately so kitchen starts cooking
    const kotData = {
      kot: {
        humanKotNumber: `HOLD #${nextSlot}`,
        orderNumber: newHeld.id,
        createdAt: now,
        stationName: 'Main Kitchen & Tandoor Station',
        carNumber: orderType === 'CAR_SERVICE' ? (carNumber.trim() || 'Car Order') : null,
        customerName: customerName.trim() || (isQuickGuest ? 'Direct Guest' : 'Customer'),
        orderType: orderType === 'CAR_SERVICE' ? '🚗 CAR SERVICE (HOLD ORDER)' : '🛍️ TAKEAWAY (HOLD ORDER)',
        specialInstructions: cookingInstructions.trim() || 'Hold Order - Fired to Kitchen',
      },
      items: cartItems.map((it) => ({
        productName: it.name,
        selectedVariation: it.selectedVariation || null,
        quantity: it.quantity,
        isVeg: it.isVeg,
        itemNotes: it.specialNotes,
      })),
    };

    setDualPrintData({
      billData: null,
      kotData,
    });

    // Reset active cart
    setCartItems([]);
    setCarNumber('');
    setCookingInstructions('');
    setDiscountAmount(0);
    if (!isQuickGuest) {
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  // Print KOT for a Held Order on-demand
  const handlePrintHeldOrderKot = (held: HeldOrder) => {
    const kotData = {
      kot: {
        humanKotNumber: `HOLD #${held.holdNumber}`,
        orderNumber: held.id,
        createdAt: held.createdAt || new Date(),
        stationName: 'Main Kitchen & Tandoor Station',
        carNumber: held.orderType === 'CAR_SERVICE' ? (held.carNumber || 'Car Order') : null,
        customerName: held.customerName || (held.orderType === 'CAR_SERVICE' ? 'Car Guest' : 'Takeaway Guest'),
        orderType: held.orderType === 'CAR_SERVICE' ? '🚗 CAR SERVICE (HOLD ORDER)' : '🛍️ TAKEAWAY (HOLD ORDER)',
        specialInstructions: held.cookingInstructions || 'Hold Order - Fired to Kitchen',
      },
      items: held.cartItems.map((it) => ({
        productName: it.name,
        selectedVariation: it.selectedVariation || null,
        quantity: it.quantity,
        isVeg: it.isVeg,
        itemNotes: it.specialNotes,
      })),
    };

    setDualPrintData({
      billData: null,
      kotData,
    });
  };

  // RESUME ORDER FLOW
  const handleInitiateResume = (held: HeldOrder) => {
    if (cartItems.length > 0) {
      setResumePromptHeld(held);
      return;
    }
    executeResume(held);
  };

  const executeResume = (held: HeldOrder) => {
    setCartItems(held.cartItems);
    setCustomerName(held.customerName || '');
    setCustomerPhone(held.customerPhone || '');
    setCarNumber(held.carNumber || '');
    setCookingInstructions(held.cookingInstructions || '');
    setOrderType(held.orderType);
    setPaymentMethod(held.paymentMethod || 'UPI');
    setDiscountAmount(held.discountAmount || 0);
    setIsQuickGuest(!held.customerName);

    const updated = heldOrders.filter((h) => h.id !== held.id);
    updateHeldOrders(updated);
    setIsHoldDrawerOpen(false);
    setResumePromptHeld(null);

    // Remove from Database in background
    fetch(`/api/pos/hold?id=${held.id}&restaurantId=rest_aapno_khano`, {
      method: 'DELETE',
    }).catch((e) => console.warn('Failed to remove resumed order from database:', e));
  };

  const handleHoldCurrentAndResume = (held: HeldOrder) => {
    handleHoldOrder();
    executeResume(held);
  };

  const handleDeleteHeldOrder = (id: string) => {
    const updated = heldOrders.filter((h) => h.id !== id);
    updateHeldOrders(updated);

    // Delete from Database in background
    fetch(`/api/pos/hold?id=${id}&restaurantId=rest_aapno_khano`, {
      method: 'DELETE',
    }).catch((e) => console.warn('Failed to delete held order from database:', e));
  };

  const handleClearAllHeldOrders = () => {
    if (confirm(`Are you sure you want to clear all ${heldOrders.length} held orders?`)) {
      updateHeldOrders([]);
      fetch('/api/pos/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLEAR_ALL', restaurantId: 'rest_aapno_khano' }),
      }).catch((e) => console.warn('Failed to clear held orders in database:', e));
    }
  };

  // DIRECT SETTLE FROM HELD DRAWER
  const handleDirectSettleHeldOrder = async (held: HeldOrder) => {
    setIsSubmitting(true);
    try {
      const guestDisplayName = held.customerName.trim() || (isQuickGuest ? 'Walk-in Guest' : 'Direct Guest');
      const guestPhone = (held.customerPhone.trim() || '9996213962').replace(/\D/g, '');

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: 'rest_aapno_khano',
          source: 'POS_TERMINAL',
          customerName: guestDisplayName,
          customerPhone: guestPhone,
          carNumber: held.orderType === 'CAR_SERVICE' ? (held.carNumber.trim() || null) : null,
          orderType: held.orderType,
          cookingInstructions: held.cookingInstructions,
          paymentMethod: held.paymentMethod || 'CASH',
          isStaffCashConfirmed: true,
          receivedAmount: held.grandTotal,
          discountAmount: held.discountAmount,
          items: held.cartItems.map((it) => ({
            productId: it.productId,
            name: it.name,
            selectedVariation: it.selectedVariation,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            isVeg: it.isVeg,
            specialNotes: it.specialNotes,
            kitchenStationId: it.kitchenStationId,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.printReceiptData) {
        setLastBillData(data.printReceiptData);
        setDualPrintData({
          billData: data.printReceiptData,
          kotData: data.kot ? {
            kot: data.kot,
            items: data.kot.kotItems || held.cartItems.map(c => ({ productName: c.name, quantity: c.quantity, isVeg: c.isVeg, selectedVariation: c.selectedVariation })),
          } : null,
        });

        // Remove settled order from held list
        handleDeleteHeldOrder(held.id);
        setIsHoldDrawerOpen(false);
      } else {
        alert(data.error || 'Failed to settle held order.');
      }
    } catch (err) {
      console.error('POS order settlement error:', err);
      alert('Error processing order. Please check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reprint Last Bill
  const handleReprintLastBill = () => {
    if (!lastBillData) {
      alert('No previous bill found to reprint.');
      return;
    }
    setDualPrintData({
      billData: lastBillData,
      kotData: null,
    });
  };

  // Print End of Day (Z-Report) Verified from 12:00:00 AM to 11:59:59 PM (Live Database Data)
  const handlePrintEodReport = async () => {
    try {
      setIsSubmitting(true);
      const now = new Date();
      
      const res = await fetch('/api/reports?range=TODAY');
      const data = await res.json();
      
      const summary = data.summary || {};
      const payments = data.paymentMethods || [];
      const bestsellers = data.bestsellers || [];
      
      const upiAmount = payments.find((p: any) => p.name === 'UPI')?.value || 0;
      const cashAmount = payments.find((p: any) => p.name === 'CASH')?.value || 0;
      const cardAmount = payments.find((p: any) => p.name === 'CARD')?.value || 0;
      const splitAmount = payments.find((p: any) => p.name === 'SPLIT')?.value || 0;
      
      const totalSales = Number(summary.totalSales) || 0;
      const totalTax = Number(summary.totalTax) || +(totalSales * 0.05).toFixed(2);
      const cgst = +(totalTax / 2).toFixed(2);
      const sgst = +(totalTax / 2).toFixed(2);
      const totalDiscounts = Number(summary.totalDiscounts) || 0;
      const completedOrders = Number(summary.completedOrders) || Number(summary.totalOrders) || 0;
      
      const dateFormatted = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      
      const eodItems: Array<{ name: string; quantity: number; unitPrice: number; totalPrice: number }> = [
        { name: `Total Orders Completed (12 AM - 11:59 PM)`, quantity: completedOrders, unitPrice: 0, totalPrice: 0 },
        { name: `UPI Collections (9996213962@hdfc)`, quantity: 1, unitPrice: upiAmount, totalPrice: upiAmount },
        { name: `Cash at Counter Collections`, quantity: 1, unitPrice: cashAmount, totalPrice: cashAmount },
        { name: `Card / EDC Terminal Collections`, quantity: 1, unitPrice: cardAmount, totalPrice: cardAmount },
      ];
      
      if (splitAmount > 0) {
        eodItems.push({ name: `Split / Other Collections`, quantity: 1, unitPrice: splitAmount, totalPrice: splitAmount });
      }
      
      bestsellers.slice(0, 5).forEach((b: any) => {
        eodItems.push({
          name: `★ Top Dish: ${b.name}`,
          quantity: b.quantity,
          unitPrice: Math.round(b.revenue / (b.quantity || 1)),
          totalPrice: Math.round(b.revenue),
        });
      });

      const eodBill = {
        restaurant: {
          name: 'आपणो खाणो (Aapno Khaano)',
          address: 'Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053',
          city: 'Fatehabad',
          state: 'Haryana',
          postalCode: '125053',
          phone: '+91 99962 13962',
          gstin: '08AABCU9603R1ZM',
          fssaiNumber: '12224026000189',
          currencySymbol: '₹',
          defaultReceiptFooter: `OFFICIAL DAILY Z-REPORT • AUDIT VERIFIED\nDay Session: 12:00:00 AM - 11:59:59 PM\nDate: ${dateFormatted}\nThank you for auditing with Aapno Khaano POS.`,
        },
        order: {
          humanOrderId: `Z-REPORT-${now.toISOString().slice(0, 10)}`,
          createdAt: now,
          customerName: 'Shift Supervisor / Cashier',
          customerPhone: '9996213962',
          carNumber: `DAILY REGISTER AUDIT (${dateFormatted})`,
          orderType: 'DINE_IN',
          paymentMethod: 'UPI + CASH + CARD',
          paymentStatus: 'SETTLED',
          transactionId: `Z_AUDIT_${now.getTime()}`,
          subtotal: +(totalSales - totalTax).toFixed(2),
          cgstAmount: cgst,
          sgstAmount: sgst,
          grandTotal: totalSales,
          discountAmount: totalDiscounts,
        },
        items: eodItems,
      };

      setDualPrintData({
        billData: eodBill,
        kotData: null,
      });
    } catch (err) {
      console.error('Error generating live Z-Report:', err);
      alert('Failed to generate live Z-Report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct POS Settlement (Cash, UPI QR, Card EDC, Split) & Bill Generation
  const handleSettleAndPrint = async (chosenMethod: 'CASH' | 'UPI' | 'CARD' | 'SPLIT' = paymentMethod) => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const guestDisplayName = customerName.trim() || (isQuickGuest ? "Walk-in Guest" : "Direct Guest");
      const guestPhone = (customerPhone.trim() || "9996213962").replace(/\D/g, "");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: "rest_aapno_khano",
          source: "POS_TERMINAL",
          customerName: guestDisplayName,
          customerPhone: guestPhone,
          carNumber: orderType === 'CAR_SERVICE' ? (carNumber.trim() || null) : null,
          orderType,
          cookingInstructions,
          paymentMethod: chosenMethod,
          isStaffCashConfirmed: true,
          receivedAmount: grandTotal,
          discountAmount,
          items: cartItems.map((it) => ({
            productId: it.productId,
            name: it.name,
            selectedVariation: it.selectedVariation,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            isVeg: it.isVeg,
            specialNotes: it.specialNotes,
            kitchenStationId: it.kitchenStationId,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.printReceiptData) {
        setLastBillData(data.printReceiptData);
        setDualPrintData({
          billData: data.printReceiptData,
          kotData: data.kot ? {
            kot: data.kot,
            items: data.kot.kotItems || cartItems.map(c => ({ productName: c.name, quantity: c.quantity, isVeg: c.isVeg, selectedVariation: c.selectedVariation })),
          } : null,
        });
        setShowCashModal(false);
        setCartItems([]);
        setCookingInstructions("");
        setCarNumber("");
        setDiscountAmount(0);
        if (!isQuickGuest) {
          setCustomerName("");
          setCustomerPhone("");
        }
      } else {
        alert(data.error || `Failed to process ${chosenMethod} order.`);
      }
    } catch (err) {
      console.error("POS order settlement error:", err);
      alert("Error processing order. Please check server connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCashPayment = async () => {
    return handleSettleAndPrint("CASH");
  };

  // Count active tiers among held orders for quick display
  const heldGreenCount = heldOrders.filter((o) => getAmountColorTier(o.grandTotal).tier === 'GREEN').length;
  const heldOrangeCount = heldOrders.filter((o) => getAmountColorTier(o.grandTotal).tier === 'ORANGE').length;
  const heldRedCount = heldOrders.filter((o) => getAmountColorTier(o.grandTotal).tier === 'RED').length;

  return (
    <AdminLayout>
      {/* Top Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8E1D6] shadow-2xs mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Prominent Held Orders Section Button */}
          <button
            type="button"
            onClick={() => setIsHoldDrawerOpen(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 border cursor-pointer shadow-2xs transition-all active:scale-95 ${
              heldOrders.length > 0
                ? 'bg-[#FFF8E7] hover:bg-[#ffefc9] text-[#9A5B00] border-[#E09D3D] ring-2 ring-[#E09D3D]/30'
                : 'bg-[#F7F2EA] hover:bg-slate-200 text-[#745E55] border-[#E8E1D6]'
            }`}
            title="Open Held Orders Section (20 orders capacity)"
          >
            <PauseCircle className={`w-4 h-4 ${heldOrders.length > 0 ? 'text-[#E09D3D] animate-pulse' : 'text-[#745E55]'}`} />
            <span>⏸️ Held Orders ({heldOrders.length}/{MAX_HELD_ORDERS})</span>

            {heldOrders.length > 0 && (
              <div className="flex items-center gap-1 ml-0.5">
                {heldRedCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" title={`${heldRedCount} Red Zone (>₹2000)`} />
                )}
                {heldOrangeCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-orange-500" title={`${heldOrangeCount} Orange Zone (>₹1000)`} />
                )}
                {heldGreenCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title={`${heldGreenCount} Green Zone (<₹100)`} />
                )}
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={handleReprintLastBill}
            className="px-3.5 py-1.5 bg-[#FFF0E8] hover:bg-[#ffe5d9] text-[#AA1B2A] rounded-xl text-xs font-black flex items-center gap-1.5 border border-[#E09D3D]/50 cursor-pointer shadow-2xs transition-transform active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-[#AA1B2A]" />
            <span>🖨️ Reprint Last Bill</span>
          </button>

          <button
            type="button"
            onClick={handlePrintEodReport}
            className="px-3.5 py-1.5 bg-[#F7F2EA] hover:bg-slate-200 text-[#331E17] rounded-xl text-xs font-black flex items-center gap-1.5 border border-[#E8E1D6] cursor-pointer shadow-2xs transition-transform active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5 text-[#E09D3D]" />
            <span>📊 Print Daily EOD (Z-Report)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const clean = (customerPhone || "9996213962").replace(/\D/g, "");
              const target = clean.length === 10 ? "91" + clean : clean;
              const text = encodeURIComponent(`Hello ${customerName || "Guest"}, thank you for visiting Aapno Khaano (आपणो खाणो)! How can we assist you with your order today?`);
              window.open(`https://api.whatsapp.com/send?phone=${target}&text=${text}`, "_blank");
            }}
            className="px-3.5 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] rounded-xl text-xs font-black flex items-center gap-1.5 border border-[#25D366]/40 cursor-pointer shadow-2xs transition-transform active:scale-95"
            title="Chat with current customer on WhatsApp"
          >
            <span>💬 WhatsApp Customer</span>
          </button>
        </div>

        {/* Store Open/Close Switch */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleStoreStatus}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              isStoreOpen
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span>{isStoreOpen ? 'STORE OPEN (Accepting Orders)' : 'STORE PAUSED (Closed)'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-175px)]">
        {/* Left 2/3: Menu Products & Category Navigation */}
        <div className="flex-1 bg-white rounded-3xl border border-[#E8E1D6] shadow-xs flex flex-col overflow-hidden">
          {/* Search Bar & Categories */}
          <div className="p-3.5 border-b border-[#E8E1D6] space-y-2.5 bg-[#FEFBF5]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#745E55] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search 60+ dishes by name, Hindi, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E1D6] rounded-2xl text-xs text-[#331E17] placeholder-[#745E55] focus:outline-none focus:ring-2 focus:ring-[#AA1B2A]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategoryId('ALL')}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryId === 'ALL'
                    ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-xs'
                    : 'bg-white border border-[#E8E1D6] text-[#745E55] hover:bg-[#F7F2EA]'
                }`}
              >
                All Dishes ({allProducts.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategoryId === c.id
                      ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-xs'
                      : 'bg-white border border-[#E8E1D6] text-[#745E55] hover:bg-[#F7F2EA]'
                  }`}
                >
                  {c.name} ({c.products?.length || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Dish Cards Grid */}
          <div className="p-3.5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 bg-[#FEFBF5]/50">
            {filteredProducts.map((product) => {
              const unitPrice = product.discountPrice ?? product.basePrice;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleAddProduct(product)}
                  className="p-2.5 rounded-3xl border border-[#E8E1D6] hover:border-[#E09D3D] bg-white hover:bg-[#FFF0E8] shadow-2xs flex flex-col justify-between text-left transition-all group cursor-pointer"
                >
                  <div>
                    <div className="relative h-24 w-full rounded-2xl overflow-hidden bg-slate-100 mb-2 border border-[#E8E1D6]">
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80'}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80';
                        }}
                      />
                      <span
                        className={`absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center bg-white ${
                          product.isVeg ? 'border-emerald-600' : 'border-red-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            product.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                      </span>
                      {product.sku && (
                        <span className="absolute bottom-1 right-1 bg-black/75 text-[#E09D3D] font-mono text-[9px] px-1 rounded font-bold">
                          {product.sku}
                        </span>
                      )}
                    </div>

                    <h4 className="font-black text-xs text-[#331E17] line-clamp-1 group-hover:text-[#AA1B2A] transition-colors">
                      {product.name}
                    </h4>
                    {product.localName && (
                      <p className="text-[10px] text-[#745E55] line-clamp-1">{product.localName}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <span className="font-black text-xs text-[#AA1B2A]">
                      {product.hasVariations ? `₹${product.priceSmallHalf ?? unitPrice}+` : `₹${unitPrice}`}
                    </span>
                    <span className="w-6 h-6 rounded-xl bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-[#FEFBF5] flex items-center justify-center text-xs font-black shadow-2xs border border-[#E09D3D]">
                      +
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 1/3: Active POS Order Ticket */}
        <div className="w-full lg:w-80 xl:w-96 bg-white rounded-3xl border border-[#E8E1D6] shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-[#E09D3D]/30 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#E09D3D]" />
              <h3 className="font-black text-xs uppercase tracking-wide">
                Live Billing Ticket
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {heldOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsHoldDrawerOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-[#331E17] text-[10px] font-black px-2.5 py-0.5 rounded-full animate-bounce cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <PauseCircle className="w-3 h-3 text-[#331E17]" />
                  <span>Held ({heldOrders.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setCartItems([])}
                className="text-[11px] font-bold text-amber-200 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* QSR Order Type, Car Number & Guest Inputs */}
          <div className="p-3 border-b border-slate-100 bg-[#FEFBF5] space-y-2 text-xs">
            {/* Main Order Types: Car Service & Takeaway */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#F7F2EA] p-1 rounded-2xl font-bold text-xs">
              <button
                type="button"
                onClick={() => setOrderType('CAR_SERVICE')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  orderType === 'CAR_SERVICE'
                    ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-xs font-black'
                    : 'text-[#745E55] hover:text-[#331E17]'
                }`}
              >
                <span>🚗 Car Order</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('TAKEAWAY')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  orderType === 'TAKEAWAY'
                    ? 'bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white shadow-xs font-black'
                    : 'text-[#745E55] hover:text-[#331E17]'
                }`}
              >
                <span>🛍️ Take away</span>
              </button>
            </div>

            {/* Vehicle Number (if Car Order) */}
            {orderType === 'CAR_SERVICE' && (
              <div className="relative">
                <Car className="w-3.5 h-3.5 text-[#AA1B2A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Car Plate (e.g. HR 03 AF 5256 / RJ 14 CA 9999)"
                  value={carNumber}
                  onChange={(e) => setCarNumber(e.target.value.toUpperCase())}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E1D6] rounded-xl text-xs font-mono font-bold text-[#AA1B2A] focus:outline-none focus:ring-1 focus:ring-[#AA1B2A]"
                />
              </div>
            )}

            {/* Guest Selection: Quick Guest vs Named Guest */}
            {isQuickGuest ? (
              <div className="flex items-center justify-between bg-amber-50/90 border border-amber-200/80 px-2.5 py-1.5 rounded-xl">
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>⚡ Guest without Name (Direct Guest)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickGuest(false)}
                  className="text-[10px] text-[#AA1B2A] font-bold underline hover:text-[#80101C] cursor-pointer"
                >
                  + Add Name/Phone
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 bg-white p-2 rounded-xl border border-[#E8E1D6]">
                <div className="flex items-center justify-between text-[10px] text-[#745E55] pb-1 border-b border-slate-100">
                  <span className="font-bold">Customer Details:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickGuest(true);
                      setCustomerName('');
                      setCustomerPhone('');
                    }}
                    className="text-[#AA1B2A] font-bold underline cursor-pointer"
                  >
                    ⚡ Use Guest without Name
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Guest Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1 bg-[#FEFBF5] border border-[#E8E1D6] rounded-xl text-xs text-[#331E17]"
                  />
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-1.5 py-1 bg-slate-100 border border-r-0 border-[#E8E1D6] rounded-l-xl text-[10px] font-bold text-slate-600 font-mono">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Mobile"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-2 py-1 bg-[#FEFBF5] border border-[#E8E1D6] rounded-r-xl text-xs font-mono text-[#331E17]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">Ticket is empty</p>
                <p className="text-[10px] text-slate-400">Tap menu dishes on the left to add items</p>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-[#FEFBF5] rounded-2xl border border-[#E8E1D6] flex items-center justify-between text-xs"
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      <span className="font-bold text-[#331E17] leading-tight line-clamp-1">{item.name}</span>
                    </div>
                    {item.selectedVariation && (
                      <span className="text-[10px] text-[#AA1B2A] font-bold block ml-3.5">
                        {item.selectedVariation}
                      </span>
                    )}
                    <span className="text-[10px] text-[#745E55] block ml-3.5">
                      ₹{item.unitPrice} × {item.quantity} = <b>₹{(item.unitPrice * item.quantity).toFixed(2)}</b>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateQty(idx, -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#E8E1D6] flex items-center justify-center text-[#331E17] hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-black text-xs">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(idx, 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#E8E1D6] flex items-center justify-center text-[#331E17] hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary & Settlement */}
          <div className="p-3 border-t border-[#E8E1D6] bg-[#FEFBF5] space-y-2 text-xs">
            {/* Manual Payment Mode Selector */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-[#745E55] mb-1">
                <span>Payment Mode (Collected Manually):</span>
                <span className="font-mono text-[#AA1B2A] font-black">{paymentMethod}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 bg-[#F7F2EA] p-1 rounded-xl text-[10px] font-bold text-center">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    paymentMethod === 'UPI' ? 'bg-[#AA1B2A] text-white shadow-2xs font-black' : 'text-[#745E55] hover:text-[#331E17]'
                  }`}
                >
                  📱 UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    paymentMethod === 'CASH' ? 'bg-[#AA1B2A] text-white shadow-2xs font-black' : 'text-[#745E55] hover:text-[#331E17]'
                  }`}
                >
                  💵 Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    paymentMethod === 'CARD' ? 'bg-[#AA1B2A] text-white shadow-2xs font-black' : 'text-[#745E55] hover:text-[#331E17]'
                  }`}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('SPLIT')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    paymentMethod === 'SPLIT' ? 'bg-[#AA1B2A] text-white shadow-2xs font-black' : 'text-[#745E55] hover:text-[#331E17]'
                  }`}
                >
                  🔀 Split
                </button>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-[11px] text-[#745E55] border-b border-[#E8E1D6] pb-1.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-[#331E17]">₹{rawSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5% split 2.5% CGST + 2.5% SGST):</span>
                <span className="font-bold text-[#331E17]">₹{taxAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* DYNAMIC COLOR ZONE TOTAL BOX (Green < ₹100, Orange > ₹1000, Red > ₹2000) */}
            <div
              className={`p-2.5 rounded-2xl border transition-all duration-300 ${
                cartItems.length > 0
                  ? activeTier.tier === 'RED'
                    ? 'border-l-4 border-l-red-600 border-red-300 bg-red-50/70 shadow-sm ring-1 ring-red-400'
                    : activeTier.tier === 'ORANGE'
                    ? 'border-l-4 border-l-orange-500 border-orange-300 bg-orange-50/60 shadow-2xs ring-1 ring-orange-300'
                    : activeTier.tier === 'GREEN'
                    ? 'border-l-4 border-l-emerald-500 border-emerald-300 bg-emerald-50/60 shadow-2xs'
                    : 'border-[#E8E1D6] bg-white'
                  : 'border-[#E8E1D6] bg-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#331E17]">
                      Grand Total ({paymentMethod}):
                    </span>
                    {cartItems.length > 0 && (
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${activeTier.badgeClass}`}>
                        {activeTier.label}
                      </span>
                    )}
                  </div>
                  {cartItems.length > 0 && activeTier.subtext && (
                    <span className="text-[10px] text-[#745E55] block font-medium">
                      {activeTier.subtext}
                    </span>
                  )}
                </div>

                <span className={`text-base font-black ${cartItems.length > 0 ? activeTier.textClass : 'text-[#AA1B2A]'}`}>
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleHoldOrder}
                disabled={cartItems.length === 0}
                className={`py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all cursor-pointer disabled:opacity-50 ${
                  heldOrders.length >= MAX_HELD_ORDERS
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : 'bg-white hover:bg-amber-50 border-[#E8E1D6] text-[#331E17] hover:border-[#E09D3D]'
                }`}
                title={`Hold order (Capacity: ${heldOrders.length}/${MAX_HELD_ORDERS})`}
              >
                <PauseCircle className="w-4 h-4 text-amber-600" />
                <span>Hold ({heldOrders.length}/{MAX_HELD_ORDERS})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSettleAndPrint(paymentMethod)}
                disabled={cartItems.length === 0 || isSubmitting}
                className="py-2.5 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md border border-[#E09D3D]/50 cursor-pointer disabled:opacity-50 transition-transform active:scale-98"
              >
                <Printer className="w-3.5 h-3.5 text-[#E09D3D]" />
                <span>{isSubmitting ? 'Firing...' : '🖨️ Settle & Print Bill'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Variation Customizer Modal */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border-2 border-[#E09D3D] max-w-xs w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div>
              <h3 className="font-black text-sm text-[#331E17]">{customizingProduct.name}</h3>
              <p className="text-xs text-[#745E55]">Select portion size variation:</p>
            </div>

            <div className="space-y-2 text-xs">
              {customizingProduct.priceSmallHalf && (
                <button
                  type="button"
                  onClick={() => {
                    const isHalf = customizingProduct.variationType === 'HALF_FULL' || !customizingProduct.variationType;
                    const varLabel = isHalf ? 'Half' : 'Small';
                    setCartItems([
                      ...cartItems,
                      {
                        cartId: `${customizingProduct.id}_half_${Date.now()}`,
                        productId: customizingProduct.id,
                        name: customizingProduct.name,
                        selectedVariation: varLabel,
                        basePrice: customizingProduct.priceSmallHalf,
                        unitPrice: customizingProduct.priceSmallHalf,
                        quantity: 1,
                        isVeg: customizingProduct.isVeg,
                        kitchenStationId: customizingProduct.kitchenStationId,
                      },
                    ]);
                    setCustomizingProduct(null);
                  }}
                  className="w-full p-3 rounded-2xl border border-[#E8E1D6] hover:border-[#E09D3D] bg-[#FEFBF5] hover:bg-[#FFF0E8] flex items-center justify-between font-bold cursor-pointer"
                >
                  <span>{customizingProduct.variationType === 'SMALL_LARGE' ? 'Small Portion' : 'Half Portion'}</span>
                  <span className="font-black text-[#AA1B2A]">₹{customizingProduct.priceSmallHalf}</span>
                </button>
              )}

              {customizingProduct.priceLargeFull && (
                <button
                  type="button"
                  onClick={() => {
                    const isFull = customizingProduct.variationType === 'HALF_FULL' || !customizingProduct.variationType;
                    const varLabel = isFull ? 'Full' : 'Large';
                    setCartItems([
                      ...cartItems,
                      {
                        cartId: `${customizingProduct.id}_full_${Date.now()}`,
                        productId: customizingProduct.id,
                        name: customizingProduct.name,
                        selectedVariation: varLabel,
                        basePrice: customizingProduct.priceLargeFull,
                        unitPrice: customizingProduct.priceLargeFull,
                        quantity: 1,
                        isVeg: customizingProduct.isVeg,
                        kitchenStationId: customizingProduct.kitchenStationId,
                      },
                    ]);
                    setCustomizingProduct(null);
                  }}
                  className="w-full p-3 rounded-2xl border border-[#E8E1D6] hover:border-[#E09D3D] bg-[#FEFBF5] hover:bg-[#FFF0E8] flex items-center justify-between font-bold cursor-pointer"
                >
                  <span>{customizingProduct.variationType === 'SMALL_LARGE' ? 'Large Portion' : 'Full Portion'}</span>
                  <span className="font-black text-[#AA1B2A]">₹{customizingProduct.priceLargeFull}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCustomizingProduct(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#331E17] font-bold rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* HOLD LIMIT ALERT MODAL */}
      {holdLimitAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border-2 border-red-500 max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 text-center">
            <div className="w-14 h-14 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-1">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#331E17]">Hold Order Limit Reached!</h3>
              <p className="text-xs text-[#745E55] mt-1">
                You currently have <b>{MAX_HELD_ORDERS} orders on hold</b>. The maximum limit is {MAX_HELD_ORDERS}.
              </p>
            </div>

            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800 text-left font-medium">
              💡 Please open the <b>Held Orders Section</b> to resume, settle, or clear old held orders before adding new ones.
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setHoldLimitAlert(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#331E17] font-bold rounded-2xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setHoldLimitAlert(null);
                  setIsHoldDrawerOpen(true);
                }}
                className="flex-2 py-2.5 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white font-black rounded-2xl text-xs cursor-pointer shadow-md"
              >
                View Held Orders ({heldOrders.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESUME CONFLICT PROMPT MODAL (When active cart is not empty) */}
      {resumePromptHeld && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border-2 border-[#E09D3D] max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-[#AA1B2A] flex items-center justify-center">
                <PauseCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#331E17]">Active Ticket Has Items</h3>
                <p className="text-xs text-[#745E55]">
                  You are loading <b>Hold #{resumePromptHeld.holdNumber} (₹{resumePromptHeld.grandTotal.toFixed(2)})</b>
                </p>
              </div>
            </div>

            <p className="text-xs text-[#745E55]">
              Your current active ticket has <b>{cartItems.length} items (₹{grandTotal.toFixed(2)})</b>. What would you like to do?
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleHoldCurrentAndResume(resumePromptHeld)}
                disabled={heldOrders.length >= MAX_HELD_ORDERS}
                className="w-full p-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-2xl text-left font-bold text-xs text-amber-900 flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div>
                  <div className="font-black text-amber-950">1. Hold Current Ticket &amp; Load Selected</div>
                  <div className="text-[11px] text-amber-800 font-normal">Saves current {cartItems.length} items to Hold list first</div>
                </div>
                <PauseCircle className="w-4 h-4 text-amber-700 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => executeResume(resumePromptHeld)}
                className="w-full p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl text-left font-bold text-xs text-red-900 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-black text-red-950">2. Discard Current Ticket &amp; Load Selected</div>
                  <div className="text-[11px] text-red-700 font-normal">Replaces current cart without saving</div>
                </div>
                <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setResumePromptHeld(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#331E17] font-bold rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* DEDICATED HELD ORDERS DRAWER SECTION */}
      <PosHoldOrdersDrawer
        isOpen={isHoldDrawerOpen}
        onClose={() => setIsHoldDrawerOpen(false)}
        heldOrders={heldOrders}
        onResumeOrder={handleInitiateResume}
        onDeleteHeldOrder={handleDeleteHeldOrder}
        onClearAllHeldOrders={handleClearAllHeldOrders}
        onDirectSettle={handleDirectSettleHeldOrder}
        onPrintKot={handlePrintHeldOrderKot}
        maxHoldCapacity={MAX_HELD_ORDERS}
      />

      {/* CASH PAYMENT CONFIRMATION MODAL */}
      {showCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border-2 border-[#E09D3D] max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="text-center pb-2 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2 font-black text-lg">
                💵
              </div>
              <h3 className="font-black text-base text-[#331E17]">Confirm Cash Payment</h3>
              <p className="text-xs text-[#745E55]">Receive cash before printing tax bill &amp; KOT</p>
            </div>

            <div className="bg-[#FEFBF5] p-3 rounded-2xl border border-[#E8E1D6] space-y-2 text-xs">
              <div className="flex justify-between items-center text-sm font-black text-[#331E17]">
                <span>Bill Amount Payable:</span>
                <span className="text-base text-[#AA1B2A]">₹{grandTotal.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Cash Received from Customer (₹):
                </label>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E8E1D6] rounded-xl text-base font-black text-[#331E17] text-right font-mono focus:border-emerald-600 outline-none"
                  placeholder="Enter cash amount"
                  autoFocus
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex gap-1.5 pt-1">
                {[grandTotal, 100, 200, 500, 2000].map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashTendered(amt.toString())}
                    className="flex-1 py-1 bg-white hover:bg-slate-100 border border-[#E8E1D6] rounded-lg text-[10px] font-bold text-[#331E17] cursor-pointer"
                  >
                    {idx === 0 ? "Exact" : "₹" + amt}
                  </button>
                ))}
              </div>

              {/* Change to Return */}
              {parseFloat(cashTendered) >= grandTotal && (
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between font-black text-emerald-800">
                  <span>Change to Return:</span>
                  <span>₹{(parseFloat(cashTendered) - grandTotal).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCashModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#331E17] font-bold rounded-2xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCashPayment}
                disabled={isSubmitting || (parseFloat(cashTendered) || 0) < grandTotal}
                className="flex-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl text-xs shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? "Generating Bill..." : "✓ Confirm & Print Bill"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dual Thermal Print Trigger */}
      {dualPrintData && (
        <PrintDualThermal
          billData={dualPrintData.billData}
          kotData={dualPrintData.kotData}
          mode={dualPrintData.kotData ? 'PRINT_BOTH' : 'PRINT_BILL'}
          onClose={() => {
            setDualPrintData(null);
            setCartItems([]);
            setCustomerName('');
            setCustomerPhone('');
            setCarNumber('');
            setCookingInstructions('');
          }}
          autoPrint={true}
        />
      )}
    </AdminLayout>
  );
}
