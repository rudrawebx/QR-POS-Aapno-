// Shared TypeScript Types for Aapno Khaano QSR & SaaS Platform

export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'MANAGER'
  | 'CASHIER'
  | 'KITCHEN'
  | 'WAITER'
  | 'ACCOUNTANT';

export interface CartItemModifier {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  basePrice: number;
  selectedVariation?: 'Small' | 'Large' | 'Half' | 'Full' | null;
  unitPrice: number;
  quantity: number;
  isVeg: boolean;
  imageUrl?: string;
  modifiers: CartItemModifier[];
  specialNotes?: string;
  kitchenStationId?: string;
}

export interface PrintReceiptData {
  restaurant: {
    name: string;
    address: string;
    city: string;
    phone: string;
    gstin?: string;
    fssaiNumber?: string;
    currencySymbol: string;
    logoUrl?: string;
    defaultReceiptFooter?: string;
  };
  order: {
    humanOrderId: string;
    createdAt: string | Date;
    customerName: string;
    customerPhone: string;
    carNumber?: string | null;
    orderType: string;
    cookingInstructions?: string | null;
    paymentMethod: string;
    paymentStatus: string;
    transactionId?: string | null;
    subtotal: number;
    cgstAmount: number;
    sgstAmount: number;
    grandTotal: number;
    discountAmount?: number;
  };
  items: Array<{
    name: string;
    selectedVariation?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isVeg?: boolean;
    modifiersSummary?: string;
  }>;
}

export interface PrintKotData {
  kot: {
    humanKotNumber: string;
    orderNumber: string;
    createdAt: string | Date;
    stationName?: string;
    carNumber?: string | null;
    customerName?: string | null;
    orderType: string;
    specialInstructions?: string | null;
  };
  items: Array<{
    productName: string;
    selectedVariation?: string | null;
    quantity: number;
    isVeg: boolean;
    modifierSummary?: string;
    itemNotes?: string;
  }>;
}
