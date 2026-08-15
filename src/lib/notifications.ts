import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface SendEmailParams {
  orderNumber: string;
  customerName: string;
  mobile: string;
  notes?: string | null;
  itemsSummary: string;
  totalAmount: number;
  adminEmail?: string | string[];
}

function parseItemsToRows(itemsSummary: string): string {
  if (!itemsSummary) return '<tr><td colspan="3" style="padding: 10px; color: #78350F;">Order items details</td></tr>';

  const lines = itemsSummary.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    // Expected format: "- Chocolate Cake (3kg) x 2 = ₹2000" or similar
    const cleanLine = line.replace(/^[-\s]+/, '');
    return `
      <tr style="border-bottom: 1px solid #FDF6E2;">
        <td style="padding: 12px 14px; color: #451A03; font-weight: 600; font-size: 14px;">${cleanLine}</td>
      </tr>
    `;
  }).join('');
}

export async function sendAdminOrderEmail(params: SendEmailParams) {
  const gmailUser = process.env.GMAIL_USER || 'myhomelycakes@gmail.com';
  const gmailPass = process.env.GMAIL_APP_PASSWORD || 'cmwjotzqkefouhak';
  const defaultTargetEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'myhomelycakes@gmail.com';

  // Parse target emails
  let recipients: string[] = [];
  if (Array.isArray(params.adminEmail)) {
    recipients = params.adminEmail.map(e => e.trim()).filter(e => e.length > 0 && e.includes('@'));
  } else if (typeof params.adminEmail === 'string' && params.adminEmail.trim()) {
    recipients = params.adminEmail.split(',').map(e => e.trim()).filter(e => e.length > 0 && e.includes('@'));
  }

  if (recipients.length === 0 || !recipients.includes(defaultTargetEmail)) {
    recipients.unshift(defaultTargetEmail);
  }

  recipients = Array.from(new Set(recipients));

  const cleanMobileNum = params.mobile.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/91${cleanMobileNum.slice(-10)}`;

  const emailSubject = `🎂 New Order #${params.orderNumber} from ${params.customerName} (₹${params.totalAmount})`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order ${params.orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF5EF; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF5EF; padding: 20px 10px;">
        <tr>
          <td align="center">
            
            <!-- Main Email Container -->
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #EAD8C3; box-shadow: 0 10px 30px rgba(69, 26, 3, 0.08);">
              
              <!-- Header Banner -->
              <tr>
                <td style="background: linear-gradient(135deg, #2A1711 0%, #422016 100%); padding: 32px 28px; text-align: center;">
                  <div style="display: inline-block; background-color: rgba(217, 119, 6, 0.2); color: #FDE68A; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; rounded: 50px; border: 1px solid rgba(253, 230, 138, 0.3); border-radius: 20px; margin-bottom: 12px;">
                    ✨ New Order Notification
                  </div>
                  <h1 style="color: #FFFFFF; font-family: Georgia, serif; font-size: 26px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">
                    MyHomelyCake Trivandrum
                  </h1>
                  <p style="color: #F3E8FF; color: #E5E7EB; font-size: 13px; margin: 6px 0 0 0; opacity: 0.85;">
                    Freshly Handcrafted Home Bakery Orders
                  </p>
                </td>
              </tr>

              <!-- Order Summary Header Card -->
              <tr>
                <td style="padding: 24px 28px 16px 28px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFFDF9; border: 1px solid #F3E8D6; border-radius: 16px; padding: 18px 20px;">
                    <tr>
                      <td>
                        <span style="font-size: 12px; color: #78350F; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Order Reference</span>
                        <div style="font-size: 24px; font-weight: 800; color: #B45309; font-family: Georgia, serif; margin-top: 2px;">
                          ${params.orderNumber}
                        </div>
                      </td>
                      <td align="right" valign="top">
                        <span style="background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 800; padding: 6px 12px; border-radius: 12px; border: 1px solid #FDE68A; display: inline-block;">
                          PENDING BAKER CALL
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Customer Details Card -->
              <tr>
                <td style="padding: 0 28px 20px 28px;">
                  <h3 style="font-size: 14px; text-transform: uppercase; color: #92400E; letter-spacing: 0.8px; margin: 0 0 12px 0; font-weight: 800;">
                    👤 Customer Information
                  </h3>
                  
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF5EF; border-radius: 16px; padding: 16px 20px; border: 1px solid #EAD8C3;">
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #451A03;">
                        <strong>Name:</strong> ${params.customerName}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #451A03;">
                        <strong>Phone:</strong> <a href="tel:${params.mobile}" style="color: #B45309; font-weight: 700; text-decoration: none;">${params.mobile}</a>
                      </td>
                    </tr>
                    ${params.notes ? `
                    <tr>
                      <td style="padding: 8px 0 2px 0; font-size: 13px; color: #78350F; border-top: 1px dashed #EAD8C3; margin-top: 6px;">
                        <strong>Notes / Instructions:</strong><br />
                        <span style="color: #451A03; font-size: 13px; line-height: 1.5; display: block; margin-top: 4px; white-space: pre-wrap;">${params.notes}</span>
                      </td>
                    </tr>
                    ` : ''}
                  </table>
                </td>
              </tr>

              <!-- Order Items Table -->
              <tr>
                <td style="padding: 0 28px 20px 28px;">
                  <h3 style="font-size: 14px; text-transform: uppercase; color: #92400E; letter-spacing: 0.8px; margin: 0 0 12px 0; font-weight: 800;">
                    🍰 Ordered Items
                  </h3>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #EAD8C3;">
                    <thead>
                      <tr style="background-color: #FEF3C7; text-align: left;">
                        <th style="padding: 12px 14px; font-size: 12px; font-weight: 800; color: #78350F; text-transform: uppercase; letter-spacing: 0.5px;">Item Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${parseItemsToRows(params.itemsSummary)}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Total Amount Highlight Card -->
              <tr>
                <td style="padding: 0 28px 24px 28px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 18px; padding: 20px 24px; border: 1px solid #F59E0B;">
                    <tr>
                      <td style="font-size: 15px; font-weight: 700; color: #78350F;">
                        Total Payable Amount:
                      </td>
                      <td align="right" style="font-size: 26px; font-weight: 900; color: #92400E; font-family: Georgia, serif;">
                        ₹${params.totalAmount}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Action Call & WhatsApp Buttons -->
              <tr>
                <td style="padding: 0 28px 32px 28px; text-align: center;">
                  <p style="font-size: 13px; font-weight: 700; color: #78350F; margin: 0 0 14px 0;">
                    ⚡ Quick Baker Action Needed:
                  </p>
                  
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding-right: 6px;">
                        <a href="tel:${params.mobile}" style="display: block; background-color: #B45309; color: #FFFFFF; font-size: 13px; font-weight: 800; text-decoration: none; padding: 14px 20px; border-radius: 14px; text-align: center; box-shadow: 0 4px 12px rgba(180, 83, 9, 0.25);">
                          📞 Call Customer (${params.mobile})
                        </a>
                      </td>
                      <td align="center" style="padding-left: 6px;">
                        <a href="${whatsappUrl}" target="_blank" style="display: block; background-color: #059669; color: #FFFFFF; font-size: 13px; font-weight: 800; text-decoration: none; padding: 14px 20px; border-radius: 14px; text-align: center; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
                          💬 Open WhatsApp
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #FAF5EF; padding: 20px 28px; text-align: center; border-top: 1px solid #EAD8C3;">
                  <p style="font-size: 12px; color: #78350F; margin: 0 0 4px 0; font-weight: 600;">
                    MyHomelyCake Trivandrum — Fresh Handcrafted Cakes
                  </p>
                  <p style="font-size: 11px; color: #A16207; margin: 0; opacity: 0.8;">
                    Kowdiar, Thiruvananthapuram, Kerala | 📞 9947066011
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;

  // 1. Primary Engine: Gmail Direct SMTP (100% Instant Delivery directly to Gmail Inbox)
  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      for (const recipient of recipients) {
        const info = await transporter.sendMail({
          from: `"MyHomelyCake Orders" <${gmailUser}>`,
          to: recipient,
          subject: emailSubject,
          html: emailHtml,
        });

        console.log(`[GMAIL SMTP SUCCESS] Sent order notification to ${recipient} (Message ID: ${info.messageId})`);
      }

      return;
    } catch (smtpErr) {
      console.error('[GMAIL SMTP ERROR] Fallback to Resend API...', smtpErr);
    }
  }

  // 2. Secondary Engine: Resend API Fallback
  const resendApiKey = process.env.RESEND_API_KEY || 're_VXH1kjKU_HzsFXcw7qXkUUMDUnwpjQwP1';
  const resendFrom = process.env.RESEND_FROM_EMAIL || 'MyHomelyCake Orders <onboarding@resend.dev>';

  if (resendApiKey) {
    const resendClient = new Resend(resendApiKey);
    for (const recipient of recipients) {
      try {
        const res = await resendClient.emails.send({
          from: resendFrom,
          to: [recipient],
          subject: emailSubject,
          html: emailHtml,
        });
        console.log(`[RESEND SUCCESS] Sent to ${recipient} (ID: ${res.data?.id})`);
      } catch (err) {
        console.error(`[RESEND ERROR] Failed sending to ${recipient}:`, err);
      }
    }
  }
}
