import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY || 're_71RFADbb_Crb4GLyTWH8LrPj9XoFCmqx2';
const resend = apiKey ? new Resend(apiKey) : null;

export interface SendEmailParams {
  orderNumber: string;
  customerName: string;
  mobile: string;
  address?: string | null;
  notes?: string | null;
  itemsSummary: string;
  totalAmount: number;
  adminEmail: string;
}

export async function sendAdminOrderEmail(params: SendEmailParams) {
  if (!resend) {
    console.log(`[SIMULATED EMAIL NOTIFICATION] New order ${params.orderNumber} received for ${params.customerName} (${params.mobile}). Total: ₹${params.totalAmount}`);
    return;
  }

  try {
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'MyHomelyCake Orders <onboarding@resend.dev>';
    const recipient = params.adminEmail || 'faizdevandco@gmail.com';
    
    let resendResult = await resend.emails.send({
      from: fromAddress,
      to: [recipient],
      subject: `🚨 NEW ORDER RECEIVED: ${params.orderNumber} - ${params.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #2C1A14;">
          <h2 style="color: #D97706;">🎂 New Order Received at MyHomelyCake!</h2>
          <p><strong>Order Ref:</strong> ${params.orderNumber}</p>
          <p><strong>Customer Name:</strong> ${params.customerName}</p>
          <p><strong>Mobile Phone:</strong> <a href="tel:${params.mobile}">${params.mobile}</a></p>
          <p><strong>Delivery Area/Address:</strong> ${params.address || 'N/A'}</p>
          <p><strong>Cake Message/Notes:</strong> ${params.notes || 'None'}</p>
          
          <hr style="border: 1px solid #EAD1B6; margin: 20px 0;" />
          
          <h3>Ordered Items:</h3>
          <pre style="background: #FAF4EB; padding: 15px; border-radius: 10px; font-size: 14px;">${params.itemsSummary}</pre>
          
          <h3 style="font-size: 18px; color: #8E552D;">Total Amount: ₹${params.totalAmount}</h3>
          
          <p style="font-size: 12px; color: #777; margin-top: 30px;">
            Please phone call the customer at ${params.mobile} to confirm order delivery details.
          </p>
        </div>
      `,
    });

    // If testing on onboarding@resend.dev and recipient was blocked by Resend rule, send to account owner faizdevandco@gmail.com
    if (resendResult.error && resendResult.error.message?.includes('testing emails')) {
      await resend.emails.send({
        from: fromAddress,
        to: ['faizdevandco@gmail.com'],
        subject: `🚨 NEW ORDER RECEIVED: ${params.orderNumber} - ${params.customerName}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #2C1A14;">
            <h2 style="color: #D97706;">🎂 New Order Received at MyHomelyCake!</h2>
            <p><strong>Order Ref:</strong> ${params.orderNumber}</p>
            <p><strong>Customer Name:</strong> ${params.customerName}</p>
            <p><strong>Mobile Phone:</strong> <a href="tel:${params.mobile}">${params.mobile}</a></p>
            <p><strong>Delivery Area/Address:</strong> ${params.address || 'N/A'}</p>
            <p><strong>Cake Message/Notes:</strong> ${params.notes || 'None'}</p>
            
            <hr style="border: 1px solid #EAD1B6; margin: 20px 0;" />
            
            <h3>Ordered Items:</h3>
            <pre style="background: #FAF4EB; padding: 15px; border-radius: 10px; font-size: 14px;">${params.itemsSummary}</pre>
            
            <h3 style="font-size: 18px; color: #8E552D;">Total Amount: ₹${params.totalAmount}</h3>
            
            <p style="font-size: 12px; color: #777; margin-top: 30px;">
              Please phone call the customer at ${params.mobile} to confirm order delivery details.
            </p>
          </div>
        `,
      });
    }
  } catch (error) {
    console.error('Failed to send admin order notification email:', error);
  }
}
