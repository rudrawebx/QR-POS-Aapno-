import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { eventBus, getLiveOrders } from "@/lib/events";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getCurrentSession();
    const restaurantId = searchParams.get("restaurantId") || session?.restaurantId || "rest_aapno_khano";
    const stationId = searchParams.get("stationId");
    const statusFilter = searchParams.get("status");

    let dbKots: any[] = [];
    let stations: any[] = [];

    try {
      if (prisma) {
        let restId = restaurantId;
        const foundRest = await prisma.restaurant.findFirst({
          where: { OR: [{ id: restaurantId }, { slug: restaurantId }, { slug: "aapno-khano" }] },
        });
        if (foundRest) restId = foundRest.id;

        const whereClause: any = {
          restaurantId: restId,
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        };

        if (stationId && stationId !== "ALL") {
          whereClause.kitchenStationId = stationId;
        }

        if (statusFilter && statusFilter !== "ALL") {
          whereClause.status = statusFilter;
        }

        dbKots = await prisma.kot.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          include: {
            kitchenStation: true,
            kotItems: true,
            order: {
              include: { table: true },
            },
          },
          take: 50,
        });

        stations = await prisma.kitchenStation.findMany({
          where: { restaurantId: restId, isActive: true },
          orderBy: { name: "asc" },
        });
      }
    } catch (dbErr) {
      console.warn("DB KOT query warning, using live orders fallback:", dbErr);
    }

    // Merge with Live Memory Orders so KDS NEVER misses any active order!
    const liveOrders = getLiveOrders() || [];
    const kotsMap = new Map();

    dbKots.forEach((k) => kotsMap.set(k.id, k));

    liveOrders.forEach((order) => {
      if ((order.paymentStatus === "PAID" || order.status === "CONFIRMED" || order.status === "PREPARING" || order.status === "READY" || order.status === "SERVED") && order.status !== "COMPLETED" && order.status !== "CANCELLED" && order.status !== "awaiting_payment" && order.paymentStatus !== "pending") {
        const kotId = "kot_" + (order.id || order.humanOrderId);
        if (!kotsMap.has(kotId)) {
          kotsMap.set(kotId, {
            id: kotId,
            humanKotNumber: "KOT-" + (order.humanOrderId ? order.humanOrderId.slice(-4) : "001"),
            restaurantId,
            orderId: order.id,
            carNumber: order.carNumber,
            customerName: order.customerName || "Direct Guest",
            orderType: order.orderType || "CAR_SERVICE",
            status: order.status || "PREPARING",
            specialInstructions: order.cookingInstructions,
            isPrinted: true,
            createdAt: order.createdAt || new Date(),
            kitchenStation: { name: "ALL STATIONS / EXPEDITER" },
            kotItems: (order.items || []).map((it: any, idx: number) => ({
              id: "ki_" + idx,
              productName: it.name || it.productName,
              selectedVariation: it.selectedVariation,
              quantity: it.quantity || 1,
              isVeg: it.isVeg ?? true,
              itemNotes: it.specialNotes || it.itemNotes,
            })),
            order: {
              humanOrderId: order.humanOrderId,
              carNumber: order.carNumber,
              customerName: order.customerName,
              orderType: order.orderType,
              cookingInstructions: order.cookingInstructions,
            },
          });
        }
      }
    });

    const finalKots = Array.from(kotsMap.values());

    return NextResponse.json({ kots: finalKots, stations });
  } catch (error) {
    console.error("KOT fetch error:", error);
    return NextResponse.json({ kots: [], stations: [] });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, isPrinted } = await request.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (isPrinted !== undefined) {
      updateData.isPrinted = isPrinted;
      if (isPrinted) updateData.printedAt = new Date();
    }

    try {
      if (prisma) {
        const kot = await prisma.kot.update({
          where: { id },
          data: updateData,
          include: {
            order: {
              include: { table: true },
            },
          },
        });

        if (status === "PREPARING") {
          await prisma.order.update({
            where: { id: kot.orderId },
            data: { status: "PREPARING" },
          });
        } else if (status === "READY" || status === "COMPLETED") {
          await prisma.order.update({
            where: { id: kot.orderId },
            data: { status },
          });
        }
      }
    } catch (e) {
      console.warn("DB KOT update fallback:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("KOT update error:", error);
    return NextResponse.json({ error: "Failed to update KOT" }, { status: 500 });
  }
}
