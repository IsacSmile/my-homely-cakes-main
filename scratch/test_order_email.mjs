import { Resend } from 'resend';

const resend = new Resend('re_71RFADbb_Crb4GLyTWH8LrPj9XoFCmqx2');

async function testOrderEmail() {
  console.log('Sending test order notification email via Resend...');
  const result = await resend.emails.send({
    from: 'MyHomelyCake Orders <onboarding@resend.dev>',
    to: 'myhomelycakes@gmail.com',
    subject: '🚨 TEST ORDER NOTIFICATION - #MHC-8899',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #2C1A14;">
        <h2 style="color: #D97706;">🎂 New Order Received at MyHomelyCake!</h2>
        <p><strong>Order Ref:</strong> #MHC-8899</p>
        <p><strong>Customer Name:</strong> Faiz Test Customer</p>
        <p><strong>Mobile Phone:</strong> +91 99470 66011</p>
        <p><strong>Delivery Area:</strong> Trivandrum City</p>
        <p><strong>Notes:</strong> Please deliver at 5:00 PM</p>
        <hr style="border: 1px solid #EAD1B6; margin: 20px 0;" />
        <h3>Ordered Items:</h3>
        <pre style="background: #FAF4EB; padding: 15px; border-radius: 10px;">- Tender Coconut Dream Cake (1kg) x 1 = ₹1200</pre>
        <h3 style="color: #8E552D;">Total Amount: ₹1200</h3>
      </div>
    `,
  });

  console.log('Resend Result:', JSON.stringify(result));
}

testOrderEmail().catch(err => console.error('Error sending email:', err));
