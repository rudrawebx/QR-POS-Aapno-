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
  Car,
  Lock,
  Smartphone,
  Coins,
  QrCode,
  Copy,
  ChevronRight,
  Check,
  Receipt,
  Store,
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

export default function RazorpayModal({
  restaurant,
  orderDetails,
  cart,
  onClose,
  onPaymentSuccess,
}: RazorpayModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"RAZORPAY_GATEWAY" | "PAY_AT_COUNTER" | "UPI_QR">("RAZORPAY_GATEWAY");
  const [paymentState, setPaymentState] = useState<"WAITING" | "VERIFYING" | "SUCCESS" | "FAILED">("WAITING");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Dual Print Data state for auto-printing
  const [dualPrintData, setDualPrintData] = useState<{ billData: any; kotData: any } | null>(null);

  // Razorpay Order ID & Key ID
  const [rzpOrderId, setRzpOrderId] = useState<string>("");
  const [keyId, setKeyId] = useState<string>("rzp_test_TWIx6ekD7pnyCY");
  const amount = orderDetails.grandTotal;
  const upiId = restaurant?.settings?.upiId || "9996213962@hdfc";
  const upiName = "Aapno Khaano";

  // Universal NPCI UPI Deep Links
  const upiGenericUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent("Aapno Khaano Bill " + (orderDetails.carNumber || orderDetails.customerName))}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiGenericUrl)}&margin=10`;

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

  // Backend Verification & Order Creation (Strict Signature Validation)
  const handleVerifyPayment = async (paymentData: {
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
        setErrorMessage(result.error || "Payment verification failed. Your card/account was not charged. Please try again or choose 'Pay at Counter'.");
        return;
      }

      setPaymentState("SUCCESS");

      // Auto-trigger WhatsApp GST Bill to customer phone
      try {
        const phone = (orderDetails.customerPhone || "9996213962").replace(/\D/g, "");
        const cleanPhone = phone.length === 10 ? "91" + phone : phone;
        const itemsText = cart.map(c => `• ${c.quantity}x ${c.name}${c.selectedVariation ? ` [${c.selectedVariation}]` : ""} - ₹${(c.unitPrice * c.quantity).toFixed(2)}`).join("\n");
        const waBillMsg = `👑 *आपणो खाणो (Aapno Khaano)* 👑\n📍 Shop No. 50, HUDA Sector 3, Fatehabad\n📞 +91 99962 13962\nGSTIN: 08AABCU9603R1ZM | FSSAI: 12224026000189\n----------------------------------------\n🧾 *GST TAX INVOICE:* ${result.humanOrderId || "AK-2026-ORDER"}\n${orderDetails.carNumber ? `🚗 *CAR / TABLE:* ${orderDetails.carNumber}\n` : ""}👤 *Customer:* ${orderDetails.customerName}\n📅 *Date:* ${new Date().toLocaleDateString("en-IN")} | *Time:* ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}\n----------------------------------------\n*ITEMS ORDERED:*\n${itemsText}\n----------------------------------------\n💵 Subtotal: ₹${orderDetails.subtotal.toFixed(2)}\n🏛️ GST (5%): ₹${orderDetails.taxAmount.toFixed(2)}\n💰 *GRAND TOTAL: ₹${orderDetails.grandTotal.toFixed(2)}*\n✅ *Payment:* PAID ✓ (Verified Online)\n----------------------------------------\n🙏 _Padharo Mhare Desh! Thank you for ordering with Aapno Khaano._`;
        const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waBillMsg)}`;
        window.open(waUrl, "_blank");
      } catch (waErr) {
        console.warn("WhatsApp popup warning:", waErr);
      }

      if (onPaymentSuccess) {
        onPaymentSuccess(result);
      }

      setTimeout(() => {
        router.push(`/order/${result.order.id}`);
      }, 1500);
    } catch (err) {
      console.error("Payment verification API error:", err);
      setPaymentState("FAILED");
      setErrorMessage("Network error during payment verification. Please try again or pay at counter.");
    }
  };

  // Launch Razorpay Checkout Modal (Strict - No fake signature bypass)
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
        handleVerifyPayment({
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

  // Place Order as "Pay at Counter" (Unpaid / Pay at Counter)
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

      setTimeout(() => {
        router.push(`/order/${result.order.id}`);
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
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-md flex-shrink-0"
              />
              <div>
                <h3 className="font-black text-xs sm:text-sm text-white">Choose Payment Method</h3>
                <p className="text-[10px] text-[#E09D3D] font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> 100% Verified &amp; Secure
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={paymentState === "VERIFYING"}
              className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
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
          <div className="flex items-center border-b border-slate-200 bg-white p-1 text-xs font-bold">
            <button
              onClick={() => { setActiveTab("RAZORPAY_GATEWAY"); setErrorMessage(""); }}
              className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === "RAZORPAY_GATEWAY"
                  ? "bg-[#AA1B2A] text-white shadow-xs font-black"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              💳 Pay Online
            </button>
            <button
              onClick={() => { setActiveTab("PAY_AT_COUNTER"); setErrorMessage(""); }}
              className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === "PAY_AT_COUNTER"
                  ? "bg-[#AA1B2A] text-white shadow-xs font-black"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              💵 Pay at Counter
            </button>
            <button
              onClick={() => { setActiveTab("UPI_QR"); setErrorMessage(""); }}
              className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === "UPI_QR"
                  ? "bg-[#AA1B2A] text-white shadow-xs font-black"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              📷 Static QR
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-4">
            {paymentState === "VERIFYING" ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-[#AA1B2A] border-t-transparent animate-spin mx-auto" />
                <p className="font-black text-sm text-[#331E17]">
                  {activeTab === "PAY_AT_COUNTER" ? "Placing Order & Firing KOT..." : "Verifying Bank Payment & Generating Bill..."}
                </p>
                <p className="text-xs text-slate-500">
                  {activeTab === "PAY_AT_COUNTER"
                    ? "Dispatching order to Kitchen Display System"
                    : "Validating cryptographic signature with banking gateway"}
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
                          onClick={() => { setPaymentState("WAITING"); setErrorMessage(""); }}
                          className="px-2.5 py-1 bg-red-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => { setActiveTab("PAY_AT_COUNTER"); setPaymentState("WAITING"); setErrorMessage(""); }}
                          className="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Choose Pay at Counter
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 1: RAZORPAY GATEWAY (UPI Apps, Cards, Netbanking, CRED) */}
                {activeTab === "RAZORPAY_GATEWAY" && (
                  <div className="space-y-3.5">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span>Instant Automated Verification:</span>
                        <span className="text-emerald-700 font-black">✓ Auto-Confirm</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Pay via Google Pay, PhonePe, Paytm, CRED, Cards, or Netbanking. Order is verified instantly upon payment success.
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
                          <p className="font-black text-sm">Pay ₹{amount.toFixed(2)} Online Now</p>
                          <p className="text-[10px] text-amber-200 font-bold">UPI / Cards / Netbanking</p>
                        </div>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-[#E09D3D]" />
                    </button>

                    <p className="text-[10px] text-center text-slate-500 font-medium">
                      🔒 Secured with 256-bit encryption • Strictly verifies payment before marking as paid
                    </p>
                  </div>
                )}

                {/* TAB 2: PAY AT COUNTER (Cash / UPI to Cashier) */}
                {activeTab === "PAY_AT_COUNTER" && (
                  <div className="space-y-3.5">
                    <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
                      <div className="flex items-center gap-2 font-black text-sm text-[#AA1B2A]">
                        <Store className="w-4 h-4" />
                        <span>Pay at Counter (काउंटर पर भुगतान)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900">
                        भोजन तुरंत किचन में बनना शुरू हो जाएगा। आप बिलिंग काउंटर पर <b>Cash (नकद)</b> या <b>UPI</b> से <b>₹{amount.toFixed(2)}</b> का भुगतान कर सकते हैं।
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

                {/* TAB 3: STATIC UPI QR CODE */}
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

                    <p className="text-[10px] text-slate-500">
                      ⚠️ सीधे QR से भुगतान करने के बाद कृपया काउंटर पर रसीद/UTR दिखाएं।
                    </p>

                    <button
                      type="button"
                      onClick={handlePayAtCounter}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Order Placed (I will show payment at counter)</span>
                    </button>
                  </div>
                )}

                <div className="pt-2 text-center text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1.5 border-t border-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>5% GST Tax Compliant • Verified Payment Security</span>
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

