import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, products, offers, settings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { sendAdminOrderEmail, generateWhatsAppOrderUrl } from '@/lib/notifications';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const allOrders = db.select().from(orders).orderBy(desc(orders.createdAt)).all();
    return NextResponse.json({ orders: allOrders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, mobile, address, notes, items } = body;

    if (!customerName || !mobile || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Customer name, mobile number, and at least 1 item are required.' }, { status: 400 });
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
      const prod = db.select().from(products).where(eq(products.id, item.productId)).get();
      const name = prod ? prod.name : item.name || 'Delicious Cake';
      const qty = item.qty || 1;
      const weightG = item.weightG || (prod ? prod.baseWeightG : 500);
      const calculatedPrice = item.calculatedPrice || (prod ? prod.basePrice : 500);
      const lineTotal = calculatedPrice * qty;
      
      subtotal += lineTotal;
      formattedItems.push({
        productId: item.productId,
        name,
        weightG,
        qty,
        calculatedPrice,
        lineTotal,
      });

      itemsSummaryText += `- ${name} (${weightG >= 1000 ? (weightG / 1000) + 'kg' : weightG + 'g'}) x ${qty} = ₹${lineTotal}\n`;

      // Update product order count
      if (prod) {
        db.update(products)
          .set({ orderCount: prod.orderCount + qty })
          .where(eq(products.id, prod.id))
          .run();
      }
    }

    // Check active offers for discount
    const activeOffers = db.select().from(offers).where(eq(offers.isActive, true)).all();
    let maxDiscountPercent = 0;
    for (const off of activeOffers) {
      if (off.discountPercent > maxDiscountPercent) {
        maxDiscountPercent = off.discountPercent;
      }
    }

    const discountAmount = Math.round((subtotal * maxDiscountPercent) / 100);
    const totalAmount = Math.max(0, subtotal - discountAmount);

    const now = new Date().toISOString();

    db.insert(orders).values({
      id: orderId,
      orderNumber,
      customerName: customerName.trim(),
      mobile: mobile.trim(),
      address: address ? address.trim() : null,
      notes: notes ? notes.trim() : null,
      items: JSON.stringify(formattedItems),
      subtotal,
      discountAmount,
      totalAmount,
      status: 'new',
      createdAt: now,
    }).run();

    // Notification handling
    const adminWhatsappSetting = db.select().from(settings).where(eq(settings.key, 'admin_whatsapp')).get();
    const adminEmailSetting = db.select().from(settings).where(eq(settings.key, 'admin_email')).get();

    const adminWhatsApp = adminWhatsappSetting?.value || process.env.ADMIN_WHATSAPP_NUMBER || '919876543210';
    const adminEmail = adminEmailSetting?.value || process.env.ADMIN_NOTIFICATION_EMAIL || 'orders@myhomelycakes.com';

    // Async trigger email (doesn't block order placement)
    sendAdminOrderEmail({
      orderNumber,
      customerName,
      mobile,
      address,
      notes,
      itemsSummary: itemsSummaryText,
      totalAmount,
      adminEmail,
    }).catch(err => console.error('Error sending order email:', err));

    const whatsappUrl = generateWhatsAppOrderUrl(adminWhatsApp, {
      orderNumber,
      customerName,
      mobile,
      itemsSummary: itemsSummaryText,
      totalAmount,
    });

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      totalAmount,
      whatsappUrl,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
