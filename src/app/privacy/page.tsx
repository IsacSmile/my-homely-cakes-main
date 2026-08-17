export const metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-bakery-chocolate">
      <h1 className="font-serif text-3xl font-bold">Privacy Policy — MyHomelyCake Trivandrum</h1>
      <p className="text-xs text-bakery-600">Last updated: August 2026</p>

      <div className="space-y-4 text-sm leading-relaxed text-bakery-800">
        <h3 className="font-bold text-base text-bakery-900">1. Information We Collect</h3>
        <p>
          MyHomelyCake collects personal information solely for the purpose of order processing and local cake delivery within Trivandrum. When placing an order, we ask for your <strong>Name</strong> and <strong>Mobile Number</strong>.
        </p>

        <h3 className="font-bold text-base text-bakery-900">2. No Customer Account Creation</h3>
        <p>
          We do not require or force customer registration, passwords, or personal login accounts. Your order details are used exclusively to contact you by phone or WhatsApp for order confirmation.
        </p>

        <h3 className="font-bold text-base text-bakery-900">3. Payment Information</h3>
        <p>
          MyHomelyCake does not collect or store credit card, debit card, or banking credentials online. All payments are settled directly via phone consultation or cash/UPI upon delivery.
        </p>

        <h3 className="font-bold text-base text-bakery-900">4. Contact Us</h3>
        <p>
          If you have questions regarding your privacy or wish to request deletion of your order records, please email <a href="mailto:myhomelycakes@gmail.com" className="text-amber-800 underline font-semibold">myhomelycakes@gmail.com</a> or call +91 99470 66011.
        </p>
      </div>
    </div>
  );
}
