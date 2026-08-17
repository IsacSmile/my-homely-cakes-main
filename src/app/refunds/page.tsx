export const metadata = {
  title: 'Refund Policy',
};

export default function RefundsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-bakery-chocolate">
      <h1 className="font-serif text-3xl font-bold">Return & Refund Policy — MyHomelyCake</h1>
      <p className="text-xs text-bakery-600">Last updated: August 2026</p>

      <div className="space-y-4 text-sm leading-relaxed text-bakery-800">
        <h3 className="font-bold text-base text-bakery-900">1. Fresh Food & Perishable Goods</h3>
        <p>
          Because our cakes are fresh, perishable food products baked specially for your order, we do not accept returns once a cake has been delivered intact and accepted by the customer.
        </p>

        <h3 className="font-bold text-base text-bakery-900">2. Cancellation Policy</h3>
        <p>
          You may cancel your cake order free of charge at any point during our phone confirmation call. Once baking has commenced, cancellations may incur a partial ingredient fee.
        </p>

        <h3 className="font-bold text-base text-bakery-900">3. Damaged or Incorrect Cakes</h3>
        <p>
          In the rare event that your cake arrives damaged or with an incorrect flavor/inscription, please inspect the cake upon arrival and inform our delivery personnel or call us immediately at +91 99470 66011 for an instant replacement or full refund.
        </p>
      </div>
    </div>
  );
}
