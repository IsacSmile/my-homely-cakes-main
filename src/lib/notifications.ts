import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface OrderNotificationInput {
  orderNumber: string;
  customerName: string;
  mobile: string;
  address?: string;
  notes?: string;
  itemsSummary: string;
  totalAmount: number;
  adminEmail?: string;
  adminWhatsApp?: string;
}

export async function sendAdminOrderEmail(data: OrderNotificationInput) {
  const adminEmail = data.adminEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'orders@myhomelycakes.com';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F2; color: #2C1A14;">
      <h2 style="color: #D97706;">🎂 New Order Received - ${data.orderNumber}</h2>
      <p><strong>Customer Name:</strong> ${data.customerName}</p>
      <p><strong>Mobile Number:</strong> <a href="tel:${data.mobile}">${data.mobile}</a></p>
      ${data.address ? `<p><strong>Delivery Address:</strong> ${data.address}</p>` : ''}
      ${data.notes ? `<p><strong>Special Notes:</strong> ${data.notes}</p>` : ''}
      <hr style="border-color: #EAD1B6;" />
      <h3>Order Items:</h3>
      <p style="white-space: pre-line;">${data.itemsSummary}</p>
      <h3 style="color: #2C1A14;">Total Amount: ₹${data.totalAmount}</h3>
      <p style="font-size: 12px; color: #777;">Please contact the customer promptly to confirm the order details and delivery window.</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: 'MyHomelyCake <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `🎂 New Cake Order ${data.orderNumber} from ${data.customerName}`,
        html: htmlContent,
      });
      console.log(`[Email Sent] Order notification sent to ${adminEmail}`);
    } catch (err) {
      console.error('[Email Error] Failed to send via Resend:', err);
    }
  } else {
    console.log(`[Email Log Fallback] Resend API key unconfigured. New Order: ${data.orderNumber} for ${data.customerName} (₹${data.totalAmount})`);
  }
}

export function generateWhatsAppOrderUrl(whatsappNumber: string, data: { orderNumber: string; customerName: string; mobile: string; itemsSummary: string; totalAmount: number }) {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const message = `🎂 *NEW ORDER ALERT - MyHomelyCake*\n\n` +
    `*Order Number:* ${data.orderNumber}\n` +
    `*Customer:* ${data.customerName}\n` +
    `*Phone:* ${data.mobile}\n\n` +
    `*Items:* \n${data.itemsSummary}\n\n` +
    `*Total:* ₹${data.totalAmount}\n\n` +
    `_Please tap to confirm with customer._`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateCustomerWhatsAppUrl(customerMobile: string, orderNumber: string, customerName: string) {
  const cleanPhone = customerMobile.replace(/[^0-9]/g, '');
  // Format with country code 91 if length is 10
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const message = `Hello ${customerName}! 👋\n\nThank you for ordering with *MyHomelyCake Trivandrum*! 🎂\n\nWe received your order *${orderNumber}*. We are calling you shortly to confirm the delivery time and payment preference.`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
