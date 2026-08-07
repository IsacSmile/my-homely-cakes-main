'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, CheckCircle2, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/pricing';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQty, clearCart, cartSubtotal } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  if (!isCartOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !mobile || cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          mobile,
          address,
          notes,
          items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            weightG: item.weightG,
            calculatedPrice: item.calculatedPrice,
            qty: item.qty,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess(data);
        clearCart();
      } else {
        alert(data.error || 'Order submission failed.');
      }
    } catch (err) {
      alert('Network error placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-5 bg-bakery-chocolate text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="font-serif text-lg font-bold">Your Cake Cart</h2>
              <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-sans font-semibold">
                {cart.reduce((a, b) => a + b.qty, 0)} items
              </span>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setOrderSuccess(null);
              }}
              className="p-1 rounded-lg text-bakery-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {orderSuccess ? (
              /* Success confirmation view */
              <div className="text-center py-8 space-y-5">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-bakery-chocolate">Order Submitted!</h3>
                  <p className="text-xs text-bakery-800 mt-1">
                    Order Ref: <strong className="font-price font-medium text-amber-800 font-mono">{orderSuccess.orderNumber}</strong>
                  </p>
                </div>

                <div className="bg-bakery-50 p-4 rounded-2xl border border-bakery-200 text-xs text-bakery-800 space-y-2 text-left">
                  <p className="font-semibold text-bakery-chocolate">Next Steps:</p>
                  <p>Our Trivandrum baker will call <strong className="text-bakery-900">{mobile}</strong> within 15-30 minutes to confirm your order.</p>
                  <p>No prepayment needed. Pay via GPay, PhonePe, or Cash upon delivery.</p>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setOrderSuccess(null);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-3 px-6 rounded-full shadow-soft transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : cart.length === 0 ? (
              /* Empty Cart View */
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-bakery-100 text-bakery-400 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Your Cart is Empty</h3>
                <p className="text-xs text-bakery-800 max-w-xs mx-auto">
                  Browse our fresh home-baked Trivandrum cakes and add your favorite flavor!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-amber-600 text-white font-semibold text-xs py-2.5 px-5 rounded-full shadow-soft hover:bg-amber-500 transition-colors"
                >
                  Explore Cakes
                </button>
              </div>
            ) : (
              /* Cart Items List */
              <div className="space-y-4">
                <div className="divide-y divide-bakery-100">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.weightG}`} className="py-3 flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-bakery-100 shrink-0 border border-bakery-200">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-bakery-chocolate truncate">{item.name}</h4>
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                          {item.weightG >= 1000 ? `${item.weightG / 1000}kg` : `${item.weightG}g`}
                        </span>
                        <div className="font-price text-xs font-medium text-amber-800 mt-1">
                          {formatINR(item.calculatedPrice * item.qty)}
                        </div>
                      </div>

                      {/* Quantity buttons */}
                      <div className="flex items-center gap-1.5 bg-bakery-50 border border-bakery-200 rounded-lg p-1">
                        <button
                          onClick={() => updateQty(item.productId, item.weightG, item.qty - 1)}
                          className="p-1 text-bakery-600 hover:text-bakery-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.weightG, item.qty + 1)}
                          className="p-1 text-bakery-600 hover:text-bakery-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.productId, item.weightG)}
                        className="p-1 text-bakery-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subtotal preview with Montserrat font-price Medium */}
                <div className="pt-3 border-t border-bakery-200 flex items-center justify-between text-xs font-semibold text-bakery-chocolate">
                  <span>Cart Subtotal</span>
                  <span className="font-price text-base font-medium text-amber-800 tracking-tight">
                    {formatINR(cartSubtotal)}
                  </span>
                </div>

                {/* Single Form Checkout */}
                <form onSubmit={handleCheckout} className="pt-4 border-t border-bakery-200 space-y-3">
                  <span className="text-xs font-bold text-bakery-chocolate flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Complete Order (No Account Needed)
                  </span>

                  <input
                    type="text"
                    placeholder="Your Full Name *"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                  />

                  <input
                    type="tel"
                    placeholder="Mobile Phone Number *"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                  />

                  <input
                    type="text"
                    placeholder="Trivandrum Delivery Location (e.g. Kowdiar)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                  />

                  <input
                    type="text"
                    placeholder="Cake Message / Delivery Date Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-2xl text-xs shadow-soft transition-all active:scale-95 disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? 'Placing Order...' : 'Submit Order & Request Phone Confirmation'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
