// Real-Time Event Broadcaster & In-Memory Live Order Registry for Aapno Khaano POS

type EventListener = (data: any) => void;

class RealtimeEventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();

  subscribe(channel: string, listener: EventListener) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(listener);

    return () => {
      this.listeners.get(channel)?.delete(listener);
      if (this.listeners.get(channel)?.size === 0) {
        this.listeners.delete(channel);
      }
    };
  }

  emit(channel: string, data: any) {
    if (this.listeners.has(channel)) {
      this.listeners.get(channel)!.forEach((listener) => {
        try {
          listener(data);
        } catch (err) {
          console.error(`Error notifying listener on channel ${channel}:`, err);
        }
      });
    }

    if (channel !== 'global' && this.listeners.has('global')) {
      this.listeners.get('global')!.forEach((listener) => {
        try {
          listener({ channel, ...data });
        } catch (err) {
          console.error(`Error notifying global listener:`, err);
        }
      });
    }
  }
}

// Global persistence store across hot-reloads and serverless invocations
const globalForEvents = globalThis as unknown as {
  eventBus: RealtimeEventBus | undefined;
  globalOrders: any[] | undefined;
  globalInvoices: any[] | undefined;
};

export const eventBus = globalForEvents.eventBus ?? new RealtimeEventBus();
export const globalOrders = globalForEvents.globalOrders ?? [];
export const globalInvoices = globalForEvents.globalInvoices ?? [];

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.eventBus = eventBus;
  globalForEvents.globalOrders = globalOrders;
  globalForEvents.globalInvoices = globalInvoices;
}

export function broadcastEvent(channel: string, data: any) {
  eventBus.emit(channel, data);
}

export function recordLiveOrder(order: any) {
  const existingIdx = globalOrders.findIndex((o) => o.id === order.id || o.humanOrderId === order.humanOrderId);
  if (existingIdx > -1) {
    globalOrders[existingIdx] = { ...globalOrders[existingIdx], ...order };
  } else {
    globalOrders.unshift(order);
  }
  broadcastEvent('pos_rest_aapno_khano', { type: 'NEW_ORDER', order });
  broadcastEvent('kds_rest_aapno_khano', { type: 'NEW_KOT', order });
}

export function getLiveOrders() {
  return globalOrders;
}

export function recordLiveInvoice(invoice: any) {
  const existingIdx = globalInvoices.findIndex((inv) => inv.id === invoice.id || inv.humanInvoiceNumber === invoice.humanInvoiceNumber);
  if (existingIdx > -1) {
    globalInvoices[existingIdx] = { ...globalInvoices[existingIdx], ...invoice };
  } else {
    globalInvoices.unshift(invoice);
  }
  broadcastEvent('pos_rest_aapno_khano', { type: 'BILL_PAID', invoice });
}

export function getLiveInvoices() {
  return globalInvoices;
}
