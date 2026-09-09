import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { getLiveOrders } from "@/lib/events";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getCurrentSession();
    const restaurantId = searchParams.get("restaurantId") || session?.restaurantId || "rest_aapno_khano";
    const phoneFilter = searchParams.get("phone");

    let customers: any[] = [];
    let dbOrders: any[] = [];

    try {
      if (prisma) {
        customers = await prisma.customer.findMany({
          where: { restaurantId },
          include: {
            orders: {
              include: { items: true },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { totalSpend: "desc" },
        });

        dbOrders = await prisma.order.findMany({
          where: { restaurantId },
          include: { items: true },
          orderBy: { createdAt: "desc" },
          take: 200,
        });
      }
    } catch (e) {
      console.warn("Customer DB query error, merging with live orders:", e);
    }

    const liveMemOrders = getLiveOrders() || [];
    const allOrdersMap = new Map();
    liveMemOrders.forEach((o) => allOrdersMap.set(o.id || o.humanOrderId, o));
    dbOrders.forEach((o) => allOrdersMap.set(o.id || o.humanOrderId, o));
    const allOrders = Array.from(allOrdersMap.values());

    // Aggregate customer profiles from all orders
    const aggregatedCustomerMap = new Map<string, any>();

    allOrders.forEach((order) => {
      const phone = (order.customerPhone || "9996213962").replace(/\D/g, "");
      if (!phone) return;

      if (!aggregatedCustomerMap.has(phone)) {
        aggregatedCustomerMap.set(phone, {
          id: "cust_" + phone,
          name: order.customerName || "Direct Guest",
          phone: "+91 " + (phone.length === 10 ? phone : phone.slice(-10)),
          email: null,
          totalVisits: 0,
          totalSpend: 0,
          avgOrderValue: 0,
          lastVisit: order.createdAt,
          carNumbers: new Set<string>(),
          orders: [],
        });
      }

      const cust = aggregatedCustomerMap.get(phone)!;
      cust.totalVisits += 1;
      cust.totalSpend += (order.grandTotal || 0);
      if (order.carNumber) cust.carNumbers.add(order.carNumber);
      cust.orders.push({
        id: order.id || order.humanOrderId,
        humanOrderId: order.humanOrderId,
        createdAt: order.createdAt,
        grandTotal: order.grandTotal,
        status: order.status,
        paymentMethod: order.paymentMethod,
        orderType: order.orderType,
        carNumber: order.carNumber,
        itemsCount: (order.items || []).length,
        itemsSummary: (order.items || []).map((it: any) => `${it.quantity}x ${it.productName || it.name}`).join(", "),
      });
    });

    // Merge with DB customers
    customers.forEach((c) => {
      const cleanPhone = (c.phone || "").replace(/\D/g, "");
      if (!aggregatedCustomerMap.has(cleanPhone)) {
        aggregatedCustomerMap.set(cleanPhone, {
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          totalVisits: c.totalVisits || (c.orders || []).length || 1,
          totalSpend: c.totalSpend || 0,
          avgOrderValue: c.avgOrderValue || 0,
          lastVisit: c.lastVisit || c.createdAt,
          carNumbers: new Set<string>(),
          orders: (c.orders || []).map((o: any) => ({
            id: o.id,
            humanOrderId: o.humanOrderId,
            createdAt: o.createdAt,
            grandTotal: o.grandTotal,
            status: o.status,
            paymentMethod: o.paymentMethod,
            orderType: o.orderType,
            carNumber: o.carNumber,
            itemsCount: (o.items || []).length,
            itemsSummary: (o.items || []).map((it: any) => `${it.quantity}x ${it.productName || it.name}`).join(", "),
          })),
        });
      }
    });

    const finalCustomers = Array.from(aggregatedCustomerMap.values()).map((c) => ({
      ...c,
      totalSpend: Math.round(c.totalSpend),
      avgOrderValue: c.totalVisits > 0 ? Math.round(c.totalSpend / c.totalVisits) : 0,
      carNumbers: Array.from(c.carNumbers),
    }));

    if (phoneFilter) {
      const match = finalCustomers.filter((c) => c.phone.includes(phoneFilter.replace(/\D/g, "")));
      return NextResponse.json({ customers: match });
    }

    return NextResponse.json({ customers: finalCustomers });
  } catch (error) {
    console.error("Customers fetch error:", error);
    return NextResponse.json({ customers: [] });
  }
}
