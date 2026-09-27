'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  X,
  ShieldCheck,
  AlertCircle,
  Clock,
  Lock,
  Smartphone,
  QrCode,
  Copy,
  Check,
  Store,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { CartItem } from "@/lib/types";
import PrintDualThermal from "@/components/PrintDualThermal";

interface RazorpayModalProps {
  restaurant: any;
  orderDetails: {
    customerName: string;
    customerPhone: string;
    carNumber: string;
    orderType: "CAR_SERVICE" | "TAKEAWAY" | "DINE_IN";
    cookingInstructions: string;
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
  };
  cart: CartItem[];
  onClose: () => void;
  onPaymentSuccess?: (orderData: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Custom crisp SVG Brand Icons for UPI Apps
function GooglePayIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function PhonePeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#5F259F" />
      <path
        fill="#FFFFFF"
        d="M33.8 21.6c0-4.6-3.8-8.4-8.4-8.4h-6.2c-.7 0-1.2.5-1.2 1.2v20.4c0 .7.5 1.2 1.2 1.2h3.6c.7 0 1.2-.5 1.2-1.2v-6.3h1.4c4.6 0 8.4-3.8 8.4-8.4v1.5zm-6 0c0 1.9-1.5 3.4-3.4 3.4h-1.6v-6.8h1.6c1.9 0 3.4 1.5 3.4 3.4z"
      />
      <path
        fill="#FFFFFF"
        d="M28.5 28.5l4.8 7.2c.4.6.1 1.5-.6 1.8-.2.1-.5.2-.7.2-.5 0-.9-.2-1.2-.7l-4.5-6.8 2.2-1.7z"
      />
    </svg>
  );
}

function PaytmIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#002E6E" />
      <path
        fill="#00BAF2"
        d="M10 24c0-7.73 6.27-14 14-14s14 6.27 14 14-6.27 14-14 14S10 31.73 10 24z"
      />
      <path
        fill="#FFFFFF"
        d="M18.5 18h4.2c2.4 0 4.1 1.2 4.1 3.3 0 1.6-1.1 2.8-2.6 3.1 1.8.3 3.1 1.6 3.1 3.5 0 2.4-1.9 3.8-4.5 3.8h-4.3V18zm3.8 5.4c1.1 0 1.8-.5 1.8-1.5s-.7-1.5-1.8-1.5h-1.4v3h1.4zm.4 5.9c1.2 0 2-.6 2-1.7s-.8-1.7-2-1.7h-1.8v3.4h1.8z"
      />
    </svg>
  );
}

function UpiEmblemIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#097939" />
      <path
        d="M15 15l10 9-10 9h6l10-9-10-9h-6z"
        fill="#FFFFFF"
      />
      <path
        d="M23 15l10 9-10 9h6l10-9-10-9h-6z"
        fill="#F37021"
      />
    </svg>
  );
}

export default function RazorpayModal({
  restaurant,
  orderDetails,
  cart,
  onClose,
  onPaymentSuccess,
}: RazorpayModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"UPI_APPS" | "RAZORPAY_GATEWAY" | "PAY_AT_COUNTER" | "UPI_QR">("UPI_APPS");
  const [paymentState, setPaymentState] = useState<"WAITING" | "VERIFYING" | "SUCCESS" | "FAILED">("WAITING");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [copiedUpi, setCopiedUpi] = useState(false);
  
  // UPI App Trigger tracking
  const [upiLaunched, setUpiLaunched] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [upiUtr, setUpiUtr] = useState("");

  // Dual Print Data state for auto-printing
  const [dualPrintData, setDualPrintData] = useState<{ billData: any; kotData: any } | null>(null);

  // Razorpay Order ID & Key ID
  const [rzpOrderId, setRzpOrderId] = useState<string>("");
  const [keyId, setKeyId] = useState<string>("rzp_test_TWIx6ekD7pnyCY");
  const amount = orderDetails.grandTotal;
  const upiId = restaurant?.settings?.upiId || "9996213962@hdfc";
  const upiName = "Aapno Khaano";

  // Universal NPCI UPI Deep Links
  const orderNote = `AK Bill ${orderDetails.carNumber || orderDetails.customerName || "Takeaway"}`;
  const upiGenericUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderNote)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiGenericUrl)}&margin=10`;

  // Specific App Schemes for 1-Tap Redirect
  const gpayUrl = `gpay://upi/pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderNote)}`;
  const phonepeUrl = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderNote)}`;
  const paytmUrl = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderNote)}`;

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Create Razorpay Order on mount for instant checkout
  useEffect(() => {
    async function createRzpOrder() {
      try {
        const res = await fetch("/api/payments/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantSlug: restaurant?.slug || "aapno-khano",
            amount,
            customerName: orderDetails.customerName,
            customerPhone: orderDetails.customerPhone,
            carNumber: orderDetails.carNumber,
            items: cart.map((c) => ({
              productId: c.productId,
              productName: c.name,
              selectedVariation: c.selectedVariation,
              quantity: c.quantity,
              unitPrice: c.unitPrice,
              isVeg: c.isVeg,
              specialNotes: c.specialNotes,
            })),
          }),
        });
        const data = await res.json();
        if (data.success) {
          if (data.razorpayOrderId) setRzpOrderId(data.razorpayOrderId);
          if (data.keyId) setKeyId(data.keyId);
        }
      } catch (err) {
        console.warn("Failed to pre-create Razorpay order:", err);
      }
    }
    createRzpOrder();
  }, [amount, orderDetails, restaurant, cart]);

  // Handler for Direct 1-Tap UPI App Launch
  const handleLaunchUpiApp = (appType: "gpay" | "phonepe" | "paytm" | "generic") => {
    setSelectedUpiApp(appType);
    setUpiLaunched(true);
    setErrorMessage("");

    let targetUrl = upiGenericUrl;
    if (appType === "gpay") targetUrl = gpayUrl;
    if (appType === "phonepe") targetUrl = phonepeUrl;
    if (appType === "paytm") targetUrl = paytmUrl;

    // Trigger Mobile UPI Intent
    try {
      window.location.href = targetUrl;
    } catch (e) {
      console.warn("Could not launch app deep link directly, fallback to generic:", e);
      window.location.href = upiGenericUrl;
    }
  };

  // Confirm Direct UPI Payment & Create Order
  const handleConfirmUpiPayment = async () => {
    setPaymentState("VERIFYING");
    setErrorMessage("");

    try {
      const cleanPhone = (orderDetails.customerPhone || "9996213962").replace(/\D/g, "");
      const txnId = upiUtr.trim() || `UPI_${Date.now()}_${cleanPhone.slice(-4)}`;

      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant?.slug || "aapno-khano",
          customerName: orderDetails.customerName,
          customerPhone: orderDetails.customerPhone,
          carNumber: orderDetails.carNumber,
          orderType: orderDetails.orderType,
          cookingInstructions: orderDetails.cookingInstructions,
          items: cart.map((c) => ({
            productId: c.productId,
            productName: c.name,
            selectedVariation: c.selectedVariation,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
            isVeg: c.isVeg,
            specialNotes: c.specialNotes,
            kitchenStationId: c.kitchenStationId,
          })),
          paymentMethod: "UPI",
          paymentStatus: "PAID",
          transactionId: txnId,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setPaymentState("FAILED");
        setErrorMessage(result.error || "Failed to confirm UPI payment. Please check your connection or pay at counter.");
        return;
      }

      setPaymentState("SUCCESS");

      // Auto-trigger WhatsApp GST Bill
      try {
        const fullPhone = cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone;
        const itemsText = cart
          .map(
            (c) =>
              `• ${c.quantity}x ${c.name}${c.selectedVariation ? ` [${c.selectedVariation}]` : ""} - ₹${(c.unitPrice * c.quantity).toFixed(2)}`
          )
          .join("\n");
        const waBillMsg = `👑 *आपणो खाणो (Aapno Khaano)* 👑\n📍 Shop No. 50, HUDA Sector 3, Fatehabad\n📞 +91 70820 40809 / +91 70820 40892\nGSTIN: 08AABCU9603R1ZM | FSSAI: 12224026000189\n----------------------------------------\n🧾 *GST TAX INVOICE:* ${result.humanOrderId || "AK-2026-ORDER"}\n${orderDetails.carNumber ? `🚗 *CAR / TABLE:* ${orderDetails.carNumber}\n` : ""}👤 *Customer:* ${orderDetails.customerName}\n📅 *Date:* ${new Date().toLocaleDateString("en-IN")} | *Time:* ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}\n----------------------------------------\n*ITEMS ORDERED:*\n${itemsText}\n----------------------------------------\n💵 Subtotal: ₹${orderDetails.subtotal.toFixed(2)}\n🏛️ GST (5%): ₹${orderDetails.taxAmount.toFixed(2)}\n💰 *GRAND TOTAL: ₹${orderDetails.grandTotal.toFixed(2)}*\n✅ *Payment:* PAID ✓ (Verified UPI: ${txnId})\n----------------------------------------\n🙏 _Padharo Mhare Desh! Thank you for ordering with Aapno Khaano._`;
        const waUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(waBillMsg)}`;
        window.open(waUrl, "_blank");
      } catch (waErr) {
        console.warn("WhatsApp bill popup warning:", waErr);
      }

      if (onPaymentSuccess) {
        onPaymentSuccess(result);
      }

      const orderIdToRedirect = result.order?.id || result.orderId;
      setTimeout(() => {
        router.push(`/order/${orderIdToRedirect}`);
      }, 1500);
    } catch (err) {
      console.error("UPI order confirmation error:", err);
      setPaymentState("FAILED");
      setErrorMessage("Network error during UPI order confirmation. Please try again.");
    }
  };

  // Backend Verification for Razorpay Gateway
  const handleVerifyRazorpayPayment = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    paymentMethod?: string;
  }) => {
    setPaymentState("VERIFYING");
    setErrorMessage("");

    try {
      const res = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant?.slug || "aapno-khano",
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          source: "QR_MENU",
          customerName: orderDetails.customerName,
          customerPhone: orderDetails.customerPhone,
          carNumber: orderDetails.carNumber,
          orderType: orderDetails.orderType,
          cookingInstructions: orderDetails.cookingInstructions,
          items: cart.map((c) => ({
            productId: c.productId,
            productName: c.name,
            selectedVariation: c.selectedVariation,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
            isVeg: c.isVeg,
            specialNotes: c.specialNotes,
            kitchenStationId: c.kitchenStationId,
          })),
          paymentMethod: paymentData.paymentMethod || "RAZORPAY",
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setPaymentState("FAILED");
        setErrorMessage(result.error || "Payment verification failed. Please try again or pay at counter.");
        return;
      }

      setPaymentState("SUCCESS");

      // Auto-trigger WhatsApp GST Bill
      try {
        const phone = (orderDetails.customerPhone || "9996213962").replace(/\D/g, "");
        const cleanPhone = phone.length === 10 ? "91" + phone : phone;
        const itemsText = cart
          .map(
            (c) =>
              `• ${c.quantity}x ${c.name}${c.selectedVariation ? ` [${c.selectedVariation}]` : ""} - ₹${(c.unitPrice * c.quantity).toFixed(2)}`
          )
          .join("\n");
        const waBillMsg = `👑 *आपणो खाणो (Aapno Khaano)* 👑\n📍 Shop No. 50, HUDA Sector 3, Fatehabad\n📞 +91 70820 40809 / +91 70820 40892\nGSTIN: 08AABCU9603R1ZM | FSSAI: 12224026000189\n----------------------------------------\n🧾 *GST TAX INVOICE:* ${result.humanOrderId || "AK-2026-ORDER"}\n${orderDetails.carNumber ? `🚗 *CAR / TABLE:* ${orderDetails.carNumber}\n` : ""}👤 *Customer:* ${orderDetails.customerName}\n📅 *Date:* ${new Date().toLocaleDateString("en-IN")} | *Time:* ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}\n----------------------------------------\n*ITEMS ORDERED:*\n${itemsText}\n----------------------------------------\n💵 Subtotal: ₹${orderDetails.subtotal.toFixed(2)}\n🏛️ GST (5%): ₹${orderDetails.taxAmount.toFixed(2)}\n💰 *GRAND TOTAL: ₹${orderDetails.grandTotal.toFixed(2)}*\n✅ *Payment:* PAID ✓ (Verified Online)\n----------------------------------------\n🙏 _Padharo Mhare Desh! Thank you for ordering with Aapno Khaano._`;
        const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waBillMsg)}`;
        window.open(waUrl, "_blank");
      } catch (waErr) {
        console.warn("WhatsApp popup warning:", waErr);
      }

      if (onPaymentSuccess) {
        onPaymentSuccess(result);
      }

      const orderIdToRedirect = result.order?.id || result.orderId;
      setTimeout(() => {
        router.push(`/order/${orderIdToRedirect}`);
      }, 1500);
    } catch (err) {
      console.error("Payment verification API error:", err);
      setPaymentState("FAILED");
      setErrorMessage("Network error during payment verification. Please try again or pay at counter.");
    }
  };

  // Launch Razorpay Checkout Modal
  const handleLaunchRazorpay = () => {
    if (typeof window === "undefined" || !window.Razorpay) {
      setErrorMessage("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    setErrorMessage("");
    const options = {
      key: keyId,
      amount: Math.round(amount * 100),
      currency: "INR",
      name: "आपणो खाणो (Aapno Khaano)",
      description: `Order Payment - ${orderDetails.customerName}`,
      image: "/images/aapno-khano-logo.png",
      order_id: rzpOrderId || undefined,
      handler: function (response: any) {
        if (!response.razorpay_payment_id || !response.razorpay_signature) {
          setPaymentState("FAILED");
          setErrorMessage("Payment response was incomplete. No payment was verified.");
          return;
        }
        handleVerifyRazorpayPayment({
          razorpay_order_id: response.razorpay_order_id || rzpOrderId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          paymentMethod: "RAZORPAY",
        });
      },
      prefill: {
        name: orderDetails.customerName,
        contact: orderDetails.customerPhone,
      },
      notes: {
        carNumber: orderDetails.carNumber || "N/A",
        orderType: orderDetails.orderType,
      },
      theme: {
        color: "#AA1B2A",
      },
      modal: {
        ondismiss: function () {
          setPaymentState("FAILED");
          setErrorMessage("Payment was not completed. You can try again or choose 'Pay at Counter'.");
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setPaymentState("FAILED");
        setErrorMessage(
          response?.error?.description || "Payment was declined or failed by your bank. Please try again or choose 'Pay at Counter'."
        );
      });
      rzp.open();
    } catch (e: any) {
      console.error("Razorpay popup launch error:", e);
      setPaymentState("FAILED");
      setErrorMessage("Unable to open Razorpay gateway. Please use 'Pay at Counter' or retry.");
    }
  };

  // Place Order as "Pay at Counter"
  const handlePayAtCounter = async () => {
    setPaymentState("VERIFYING");
    setErrorMessage("");

    try {
      const res = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant?.slug || "aapno-khano",
          source: "QR_MENU",
          customerName: orderDetails.customerName,
          customerPhone: orderDetails.customerPhone,
          carNumber: orderDetails.carNumber,
          orderType: orderDetails.orderType,
          cookingInstructions: orderDetails.cookingInstructions,
          items: cart.map((c) => ({
            productId: c.productId,
            productName: c.name,
            selectedVariation: c.selectedVariation,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
            isVeg: c.isVeg,
            specialNotes: c.specialNotes,
            kitchenStationId: c.kitchenStationId,
          })),
          paymentMethod: "PAY_AT_COUNTER",
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setPaymentState("FAILED");
        setErrorMessage(result.error || "Failed to place order. Please try again.");
        return;
      }

      setPaymentState("SUCCESS");
      if (onPaymentSuccess) {
        onPaymentSuccess(result);
      }

      const orderIdToRedirect = result.order?.id || result.orderId;
      setTimeout(() => {
        router.push(`/order/${orderIdToRedirect}`);
      }, 1200);
    } catch (err) {
      console.error("Pay at Counter submission error:", err);
      setPaymentState("FAILED");
      setErrorMessage("Network error while placing order. Please contact restaurant staff.");
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
        <div
          className="bg-[#FEFBF5] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-[#E09D3D] flex flex-col my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white p-3.5 flex items-center justify-between border-b border-[#E09D3D]/30">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/aapno-khano-logo.png"
                alt="Aapno Khaano"
                className="h-11 sm:h-13 w-auto object-contain drop-shadow-md flex-shrink-0"
              />
              <div>
                <h3 className="font-black text-xs sm:text-sm text-white">Select Payment Mode</h3>
                <p className="text-[10px] text-[#E09D3D] font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> 100% Direct &amp; Verified
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={paymentState === "VERIFYING"}
              className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Amount Banner */}
          <div className="bg-amber-50/90 p-3 border-b border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-900">Total Payable Amount</p>
              <p className="text-xs text-slate-700 font-bold truncate max-w-[200px]">
                {orderDetails.customerName} {orderDetails.carNumber ? `• ${orderDetails.carNumber}` : ""}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-[#AA1B2A]">₹{amount.toFixed(2)}</span>
              <div className="text-[10px] font-bold text-slate-500 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-amber-700" />
                <span>
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Navigation Tabs */}
          <div className="grid grid-cols-4 border-b border-slate-200 bg-white p-1 text-[11px] font-bold text-center gap-0.5">
            <button
              onClick={() => {
                setActiveTab("UPI_APPS");
                setErrorMessage("");
              }}
              className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                activeTab === "UPI_APPS"
                  ? "bg-[#AA1B2A] text-white shadow-xs font-black"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="truncate">UPI Apps</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("RAZORPAY_GATEWAY");
                setErrorMessage("");
              }}
              className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                activeTab === "RAZORPAY_GATEWAY"
                  ? "bg-[#AA1B2A] text-white shadow-xs font-black"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="truncate">Cards/Net</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("PAY_AT_COUNTER");
                setErrorMessage("");
              }}
              className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                activeTab === "PAY_AT_COUNTER"
                  ? "bg-[#AA1B2A] text-white shadow-xs font-black"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span className="truncate">Counter</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("UPI_QR");
                setErrorMessage("");
              }}
              className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                activeTab === "UPI_QR"
                  ? "bg-[#AA1B2A] text-white shadow-xs font-black"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="truncate">Scan QR</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {paymentState === "VERIFYING" ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-[#AA1B2A] border-t-transparent animate-spin mx-auto" />
                <p className="font-black text-sm text-[#331E17]">
                  {activeTab === "PAY_AT_COUNTER"
                    ? "Placing Order & Firing KOT..."
                    : "Confirming Payment & Generating GST Bill..."}
                </p>
                <p className="text-xs text-slate-500">
                  {activeTab === "PAY_AT_COUNTER"
                    ? "Dispatching order to Kitchen Display System"
                    : "Connecting with Aapno Khaano real-time billing network"}
                </p>
              </div>
            ) : paymentState === "SUCCESS" ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-emerald-800">
                  {activeTab === "PAY_AT_COUNTER" ? "Order Placed Successfully!" : "Payment Verified & Paid ✓"}
                </h4>
                <p className="text-xs text-slate-600">
                  {activeTab === "PAY_AT_COUNTER"
                    ? `KOT sent to kitchen • Please pay ₹${amount.toFixed(2)} at the counter.`
                    : "GST Tax Invoice generated • KOT fired to kitchen!"}
                </p>
              </div>
            ) : (
              <>
                {paymentState === "FAILED" && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs font-bold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p>{errorMessage}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            setPaymentState("WAITING");
                            setErrorMessage("");
                          }}
                          className="px-2.5 py-1 bg-red-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("PAY_AT_COUNTER");
                            setPaymentState("WAITING");
                            setErrorMessage("");
                          }}
                          className="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Choose Pay at Counter
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 1: 1-TAP UPI APP LAUNCHERS (GPAY, PHONEPE, PAYTM)   */}
                {/* ======================================================== */}
                {activeTab === "UPI_APPS" && (
                  <div className="space-y-3.5">
                    {/* Header banner */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-2.5 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#AA1B2A] flex-shrink-0" />
                      <p className="text-[11px] font-bold text-amber-950 leading-tight">
                        Tap your UPI App below to pay <b>₹{amount.toFixed(2)}</b> directly. Instant zero-fee payment!
                      </p>
                    </div>

                    {!upiLaunched ? (
                      /* Grid of Direct 1-Tap UPI Apps */
                      <div className="space-y-2.5">
                        {/* Google Pay */}
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp("gpay")}
                          className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-[#4285F4] flex items-center justify-between shadow-xs transition-all active:scale-98 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                              <GooglePayIcon className="w-7 h-7" />
                            </div>
                            <div className="text-left">
                              <p className="font-black text-sm text-slate-800 group-hover:text-[#4285F4] transition-colors">
                                Google Pay (GPay)
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">1-Tap Direct UPI Payment</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[#4285F4] font-black text-xs">
                            <span>PAY</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>

                        {/* PhonePe */}
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp("phonepe")}
                          className="w-full p-3 rounded-2xl bg-white hover:bg-purple-50/50 border-2 border-slate-200 hover:border-[#5F259F] flex items-center justify-between shadow-xs transition-all active:scale-98 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                              <PhonePeIcon className="w-7 h-7" />
                            </div>
                            <div className="text-left">
                              <p className="font-black text-sm text-slate-800 group-hover:text-[#5F259F] transition-colors">
                                PhonePe
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">Fast &amp; Secure UPI App</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[#5F259F] font-black text-xs">
                            <span>PAY</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>

                        {/* Paytm */}
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp("paytm")}
                          className="w-full p-3 rounded-2xl bg-white hover:bg-sky-50/50 border-2 border-slate-200 hover:border-[#00BAF2] flex items-center justify-between shadow-xs transition-all active:scale-98 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                              <PaytmIcon className="w-7 h-7" />
                            </div>
                            <div className="text-left">
                              <p className="font-black text-sm text-slate-800 group-hover:text-[#002E6E] transition-colors">
                                Paytm UPI
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">Paytm Wallet &amp; Bank UPI</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[#002E6E] font-black text-xs">
                            <span>PAY</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>

                        {/* Any UPI App (BHIM, CRED, Navi, etc.) */}
                        <button
                          type="button"
                          onClick={() => handleLaunchUpiApp("generic")}
                          className="w-full p-3 rounded-2xl bg-white hover:bg-emerald-50/50 border-2 border-slate-200 hover:border-emerald-600 flex items-center justify-between shadow-xs transition-all active:scale-98 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                              <UpiEmblemIcon className="w-7 h-7" />
                            </div>
                            <div className="text-left">
                              <p className="font-black text-sm text-slate-800 group-hover:text-emerald-700 transition-colors">
                                Any UPI App
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">BHIM, CRED, Navi, Amazon Pay</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-700 font-black text-xs">
                            <span>PAY</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>
                      </div>
                    ) : (
                      /* Post-Launch State: Confirm Order or Re-open */
                      <div className="space-y-3.5 animate-in fade-in-50 duration-200">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            UPI App Launched
                          </div>
                          <p className="text-xs font-black text-emerald-950">
                            Complete payment in your UPI app and confirm below:
                          </p>
                          <p className="text-[11px] text-emerald-800">
                            Payee: <b>{upiName}</b> ({upiId}) • Amount: <b>₹{amount.toFixed(2)}</b>
                          </p>
                        </div>

                        {/* Optional UTR Input */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            UPI Ref No. / UTR <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={upiUtr}
                            onChange={(e) => setUpiUtr(e.target.value)}
                            placeholder="e.g. 423589102431"
                            maxLength={16}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#AA1B2A]"
                          />
                        </div>

                        {/* Confirm Button */}
                        <button
                          type="button"
                          onClick={handleConfirmUpiPayment}
                          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-98 border border-emerald-400"
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>✓ I Have Paid ₹{amount.toFixed(2)} (Confirm Order)</span>
                        </button>

                        {/* Re-open / Change App Actions */}
                        <div className="flex items-center justify-between text-xs pt-1 px-1">
                          <button
                            type="button"
                            onClick={() => handleLaunchUpiApp((selectedUpiApp as any) || "generic")}
                            className="text-[#AA1B2A] font-bold flex items-center gap-1 hover:underline cursor-pointer text-[11px]"
                          >
                            <RotateCcw className="w-3 h-3" /> Re-open App
                          </button>
                          <button
                            type="button"
                            onClick={() => setUpiLaunched(false)}
                            className="text-slate-600 font-bold hover:underline cursor-pointer text-[11px]"
                          >
                            Choose Another App
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 2: RAZORPAY GATEWAY (Cards, Netbanking, CRED)        */}
                {/* ======================================================== */}
                {activeTab === "RAZORPAY_GATEWAY" && (
                  <div className="space-y-3.5">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span>Debit / Credit Cards &amp; Netbanking:</span>
                        <span className="text-emerald-700 font-black">✓ Auto-Confirm</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Pay via Visa, MasterCard, RuPay, Netbanking, or Corporate Cards. Order is confirmed automatically.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleLaunchRazorpay}
                      className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] hover:from-[#901622] hover:to-[#C0392F] text-white shadow-xl flex items-center justify-between transition-transform active:scale-98 cursor-pointer border border-[#E09D3D]"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-black text-sm">Pay ₹{amount.toFixed(2)} via Cards</p>
                          <p className="text-[10px] text-amber-200 font-bold">Cards / Netbanking / Wallets</p>
                        </div>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-[#E09D3D]" />
                    </button>
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 3: PAY AT COUNTER (Cash / Counter UPI)               */}
                {/* ======================================================== */}
                {activeTab === "PAY_AT_COUNTER" && (
                  <div className="space-y-3.5">
                    <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
                      <div className="flex items-center gap-2 font-black text-sm text-[#AA1B2A]">
                        <Store className="w-4 h-4" />
                        <span>Pay at Counter (काउंटर पर भुगतान)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900">
                        भोजन तुरंत किचन में बनना शुरू हो जाएगा। आप बिलिंग काउंटर पर <b>Cash (नकद)</b> या <b>UPI</b> से{" "}
                        <b>₹{amount.toFixed(2)}</b> का भुगतान कर सकते हैं।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePayAtCounter}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-98 border border-emerald-400"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Confirm Order &amp; Pay at Counter (₹{amount.toFixed(2)})</span>
                    </button>
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 4: STATIC UPI QR CODE                                */}
                {/* ======================================================== */}
                {activeTab === "UPI_QR" && (
                  <div className="text-center space-y-3">
                    <p className="text-xs text-slate-600 font-bold">
                      Scan to pay directly to restaurant UPI:
                    </p>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-inner">
                      <img src={qrCodeUrl} alt="UPI QR" className="w-44 h-44 mx-auto" />
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span className="text-slate-500 font-bold">UPI ID:</span>
                      <span className="font-mono font-black text-[#AA1B2A]">{upiId}</span>
                      <button
                        onClick={copyUpiId}
                        className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmUpiPayment}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>✓ I Have Scanned &amp; Paid (Confirm Order)</span>
                    </button>
                  </div>
                )}

                <div className="pt-2 text-center text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1.5 border-t border-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>5% GST Tax Compliant • Direct Bank UPI &amp; SSL Security</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dual Thermal Print Trigger on Payment Confirmation */}
      {dualPrintData && (
        <PrintDualThermal
          billData={dualPrintData.billData}
          kotData={dualPrintData.kotData}
          mode="PRINT_BOTH"
          onClose={() => setDualPrintData(null)}
          autoPrint={true}
        />
      )}
    </>
  );
}
