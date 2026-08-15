import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, products, offers, settings, users, pointsTransactions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { sendAdminOrderEmail } from '@/lib/notifications';
import { getAdminFromCookies } from '@/lib/auth';
import { parseProductVariants } from '@/lib/pricing';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const allOrders = (await db.select().from(orders).orderBy(desc(orders.createdAt)).all()) || [];
    return NextResponse.json({ orders: allOrders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Please sign in with Google to place your order and track it anytime.' },
        { status: 401 }
      );
    }

    let userId: string | null = (session.user as any)?.id || null;
    if (!userId && session.user.email) {
      const userList = await db.select().from(users).where(eq(users.email, session.user.email));
      if (userList.length > 0) {
        userId = userList[0].id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Valid user session required. Please sign in with Google to continue.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      customerName,
      mobile,
      notes,
      items,
      deliveryCity,
      deliveryDate,
      deliveryTime,
      cakeMessage,
    } = body;
    const rawPointsToRedeem = body.pointsToRedeem ?? body.pointsRedeemed ?? 0;

    // Validation
    if (!customerName || !mobile || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name, mobile number, and at least 1 item are required.' },
        { status: 400 }
      );
    }

    // Validate phone number (Indian: 10 digits, optionally +91 prefix)
    const cleanPhone = mobile.replace(/[\s\-\+]/g, '');
    const phoneDigits = cleanPhone.replace(/^91/, '');
    if (!/^\d{10}$/.test(phoneDigits)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    // Validate delivery date/time: must not be in the past
    if (deliveryDate && deliveryTime) {
      const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const deliveryDT = new Date(`${deliveryDate}T${deliveryTime}:00`);
      if (deliveryDT < nowIST) {
        return NextResponse.json(
          { error: 'Delivery date and time cannot be in the past.' },
          { status: 400 }
        );
      }
    }

    // Generate unique order number
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `#MHC-${randomCode}`;
    const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Calculate totals
    let subtotal = 0;
    const formattedItems = [];
    let itemsSummaryText = '';

    for (const item of items) {
      const prodList = await db.select().from(products).where(eq(products.id, item.productId));
      const prod = prodList[0] || null;
      const name = prod ? prod.name : item.name || 'Delicious Cake';
      const qty = Math.max(1, item.qty || 1);
      const weightG = item.weightG || (prod ? prod.baseWeightG : 500);

      // Look up exact admin-set variant price
      let calculatedPrice = item.calculatedPrice;
      if (prod) {
        const variantsList = parseProductVariants(prod);
        const exactVar = variantsList.find(v => v.weightG === weightG);
        calculatedPrice = exactVar ? exactVar.price : (item.calculatedPrice || prod.basePrice);
      } else {
        calculatedPrice = item.calculatedPrice || 500;
      }

      const lineTotal = calculatedPrice * qty;
      subtotal += lineTotal;

      const imageUrl = prod ? prod.imageUrl : (item.imageUrl || null);

      formattedItems.push({
        productId: item.productId,
        name,
        imageUrl,
        weightG,
        qty,
        calculatedPrice,
        lineTotal,
        cakeMessage: item.cakeMessage || null,
        specialNotes: item.specialNotes || null,
      });

      let itemLine = `- ${name} (${weightG >= 1000 ? (weightG / 1000) + 'kg' : weightG + 'g'}) x ${qty} = ₹${lineTotal}`;
      if (item.cakeMessage) itemLine += ` [Cake Msg: "${item.cakeMessage}"]`;
      if (item.specialNotes) itemLine += ` [Notes: "${item.specialNotes}"]`;
      itemsSummaryText += itemLine + '\n';

      // Update product order count
      if (prod) {
        await db.update(products)
          .set({ orderCount: prod.orderCount + qty })
          .where(eq(products.id, prod.id));
      }
    }

    // Check active offers for discount
    const activeOffers = (await db.select().from(offers).where(eq(offers.isActive, true))) || [];
    let maxDiscountPercent = 0;
    for (const off of activeOffers) {
      if (off.discountPercent > maxDiscountPercent) {
        maxDiscountPercent = off.discountPercent;
      }
    }

    const discountAmount = Math.round((subtotal * maxDiscountPercent) / 100);

    // Validate points redemption
    const pointsToRedeem = Math.max(0, parseInt(rawPointsToRedeem, 10) || 0);
    let pointsDiscountAmount = 0;
    let validatedPointsRedeemed = 0;

    if (pointsToRedeem >= 100 && userId) {
      const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userList && userList.length > 0) {
        const dbUser = userList[0];
        const currentPoints = dbUser.pointsBalance || 0;

        if (pointsToRedeem <= currentPoints && pointsToRedeem % 100 === 0) {
          const calculatedPointsDiscount = Math.floor(pointsToRedeem / 100) * 50;
          const subtotalAfterOffer = Math.max(0, subtotal - discountAmount);

          if (calculatedPointsDiscount <= subtotalAfterOffer) {
            validatedPointsRedeemed = pointsToRedeem;
            pointsDiscountAmount = calculatedPointsDiscount;

            // Deduct points from user's balance immediately
            const newBalance = currentPoints - validatedPointsRedeemed;
            await db.update(users)
              .set({ pointsBalance: newBalance })
              .where(eq(users.id, userId));

            // Log points transaction
            const txId = `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            await db.insert(pointsTransactions).values({
              id: txId,
              userId,
              orderId,
              pointsChange: -validatedPointsRedeemed,
              type: 'redeemed',
              description: `Redeemed ${validatedPointsRedeemed} points on Order ${orderNumber}`,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount - pointsDiscountAmount);

    const now = new Date().toISOString();

    await db.insert(orders).values({
      id: orderId,
      userId,
      orderNumber,
      customerName: customerName.trim(),
      mobile: mobile.trim(),
      address: null,
      deliveryCity: deliveryCity ? deliveryCity.trim() : 'Trivandrum',
      deliveryDate: deliveryDate || null,
      deliveryTime: deliveryTime || null,
      cakeMessage: cakeMessage ? cakeMessage.trim() : null,
      notes: notes ? notes.trim() : null,
      items: JSON.stringify(formattedItems),
      subtotal,
      discountAmount,
      pointsRedeemed: validatedPointsRedeemed,
      pointsDiscountAmount,
      pointsEarned: 0,
      pointsCredited: false,
      totalAmount,
      status: 'new',
      consumerStatus: 'received',
      createdAt: now,
    });

    revalidatePath('/admin-manage/orders');
    revalidatePath('/admin-manage/overview');
    revalidatePath('/orders');

    // Dispatch Email Notification to Admin (Awaited to ensure completion on Vercel Serverless)
    try {
      const adminEmailSetting = await db.select().from(settings).where(eq(settings.key, 'admin_email')).get();
      const adminEmail = adminEmailSetting?.value || process.env.ADMIN_NOTIFICATION_EMAIL || 'myhomelycakes@gmail.com';

      const deliveryDisplay = deliveryDate && deliveryTime
        ? `${deliveryDate} at ${deliveryTime}`
        : 'ASAP (30 mins)';

      await sendAdminOrderEmail({
        orderNumber,
        customerName,
        mobile,
        notes: [
          deliveryCity ? `City: ${deliveryCity}` : '',
          `Delivery: ${deliveryDisplay}`,
          cakeMessage ? `Cake Message: "${cakeMessage}"` : '',
          notes ? `Notes: ${notes}` : '',
        ].filter(Boolean).join('\n'),
        itemsSummary: itemsSummaryText,
        totalAmount,
        adminEmail,
      });
    } catch (err) {
      console.error('Order email notification error:', err);
    }


    const estimatedPointsEarned = Math.floor(totalAmount / 100) * 5;

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      totalAmount,
      deliveryCity: deliveryCity || 'Trivandrum',
      deliveryDate,
      deliveryTime,
      estimatedPointsEarned,
      pointsRedeemed: validatedPointsRedeemed,
      pointsDiscountAmount,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { orderIds } = await request.json();
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'No order IDs provided' }, { status: 400 });
    }

    for (const id of orderIds) {
      await db.delete(orders).where(eq(orders.id, id)).run();
    }

    return NextResponse.json({ success: true, count: orderIds.length });
  } catch (error) {
    console.error('Bulk order delete error:', error);
    return NextResponse.json({ error: 'Failed to delete orders' }, { status: 500 });
  }
}
