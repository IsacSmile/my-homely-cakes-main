'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, CheckCircle2, Sparkles, MessageSquare, Edit3, Cake, FileText, Lock, ShieldCheck, Package, CreditCard, PhoneCall, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/pricing';
import { useSession } from 'next-auth/react';
import { handleGoogleSignIn } from '@/lib/auth-toast';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeCartItemByIndex,
    updateCartItemByIndex,
    clearCart,
    cartSubtotal,
  } = useCart();

  const { data: session, status } = useSession();

  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [redeemPoints, setRedeemPoints] = useState<boolean>(false);

  useEffect(() => {
    if (session?.user?.name && !customerName) {
      setCustomerName(session.user.name);
    }
  }, [session, customerName]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/customer/points')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && typeof data.pointsBalance === 'number') {
            setUserPoints(data.pointsBalance);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  if (!isCartOpen) return null;

  const maxRedeemablePoints = Math.floor(userPoints / 100) * 100;
  const potentialDiscount = Math.floor(maxRedeemablePoints / 100) * 50;
  const pointsDiscountAmount = (redeemPoints && maxRedeemablePoints >= 100)
    ? Math.min(potentialDiscount, Math.floor(cartSubtotal / 50) * 50)
    : 0;
  const finalCartTotal = Math.max(0, cartSubtotal - pointsDiscountAmount);

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
          notes,
          pointsToRedeem: redeemPoints ? maxRedeemablePoints : 0,
          items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            weightG: item.weightG,
            calculatedPrice: item.calculatedPrice,
            qty: item.qty,
            cakeMessage: item.cakeMessage || null,
            specialNotes: item.specialNotes || null,
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
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsCartOpen(false);
          setOrderSuccess(null);
        }
      }}
    >
      <div className="w-full sm:max-w-lg bg-white shadow-2xl flex flex-col justify-between h-full animate-scaleIn">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-bakery-chocolate text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-base sm:text-lg font-bold">Your Cake Cart</h2>
            <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-sans font-semibold">
              {cart.reduce((a, b) => a + b.qty, 0)} items
            </span>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setOrderSuccess(null);
            }}
            className="p-2 rounded-lg text-bakery-300 hover:text-white hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {orderSuccess ? (
            /* Success confirmation view */
            <div className="text-center py-3 space-y-5">
              {/* Success Checkmark Badge */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100/70 text-amber-800 flex items-center justify-center border border-amber-300/60 shadow-2xs mx-auto shrink-0 mt-1">
                <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-amber-700 stroke-[1.75]" />
              </div>

              {/* Typography */}
              <div className="space-y-1">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-bakery-chocolate tracking-tight">Order Confirmed!</h3>
                <p className="text-xs sm:text-sm text-bakery-600 font-medium max-w-xs mx-auto leading-relaxed">
                  Your homemade cake is being prepared with care and love.
                </p>
                <div className="pt-1">
                  <span className="inline-block text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-md border border-amber-200/90">
                    Ref: #{orderSuccess.orderNumber}
                  </span>
                </div>
              </div>

              {/* Loyalty Points Earned Card */}
              {typeof orderSuccess.estimatedPointsEarned === 'number' && orderSuccess.estimatedPointsEarned > 0 && (
                <div className="bg-gradient-to-r from-amber-900 via-amber-900 to-amber-950 text-white p-3.5 sm:p-4 rounded-2xl border border-amber-700/60 text-left space-y-1.5 shadow-soft">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>+{orderSuccess.estimatedPointsEarned} Points Pending Delivery</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    You will earn <strong>{orderSuccess.estimatedPointsEarned} points</strong> on this order. Points will be automatically credited to your balance when marked <strong>Delivered</strong>.
                  </p>
                </div>
              )}

              {/* What Happens Next Box (Minimal Line Icons) */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 text-left space-y-2.5">
                <h4 className="font-bold text-bakery-chocolate text-xs uppercase tracking-wider">What happens next?</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 text-[11px] sm:text-xs text-bakery-800">
                    <PhoneCall className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>Our Trivandrum baker will call <strong className="text-bakery-900">{mobile || 'you'}</strong> within 15–30 mins to confirm details.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-[11px] sm:text-xs text-bakery-800">
                    <CreditCard className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>No prepayment required. Pay via UPI (GPay/PhonePe) or Cash upon delivery.</span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href="/orders"
                  onClick={() => {
                    setIsCartOpen(false);
                    setOrderSuccess(null);
                  }}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-soft transition-all min-h-[44px] flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Track Order & Points</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setOrderSuccess(null);
                  }}
                  className="flex-1 bg-bakery-100 hover:bg-bakery-200 text-bakery-chocolate font-semibold text-xs py-3 px-4 rounded-xl transition-all min-h-[44px] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </button>
              </div>
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
                className="bg-amber-600 text-white font-semibold text-xs py-3 px-6 rounded-full shadow-soft hover:bg-amber-500 transition-colors min-h-[44px] cursor-pointer"
              >
                Explore Cakes
              </button>
            </div>
          ) : (
            /* Cart Items List */
            <div className="space-y-4">
              <div className="space-y-4 divide-y divide-bakery-100">
                {cart.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="pt-3 pb-4 space-y-3">
                    {/* Item Main Header Row */}
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-bakery-100 shrink-0 border border-bakery-200 shadow-xs">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-bakery-chocolate truncate">{item.name}</h4>
                        
                        {/* Weight Selector */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-semibold text-bakery-600">Weight:</span>
                          <select
                            value={item.weightG}
                            onChange={(e) => updateCartItemByIndex(idx, { weightG: Number(e.target.value) })}
                            className="text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 rounded-lg px-2 py-0.5 focus:outline-none focus:border-amber-600 cursor-pointer"
                          >
                            <option value={500}>500g (0.5kg)</option>
                            <option value={1000}>1000g (1kg)</option>
                            <option value={1500}>1500g (1.5kg)</option>
                            <option value={2000}>2000g (2kg)</option>
                            <option value={2500}>2500g (2.5kg)</option>
                            <option value={3000}>3000g (3kg)</option>
                          </select>
                        </div>

                        {/* Calculated Item Total Price */}
                        <div className="font-price text-xs font-bold text-amber-800 mt-1">
                          {formatINR(item.calculatedPrice * item.qty)}
                          {item.qty > 1 && (
                            <span className="text-[10px] font-normal text-bakery-400 ml-1">
                              ({formatINR(item.calculatedPrice)} each)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper & Remove */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center bg-bakery-50 border border-bakery-200 rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartItemByIndex(idx, { qty: item.qty - 1 })}
                            className="p-1 text-bakery-600 hover:text-bakery-900 min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartItemByIndex(idx, { qty: item.qty + 1 })}
                            className="p-1 text-bakery-600 hover:text-bakery-900 min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeCartItemByIndex(idx)}
                          className="p-1 text-bakery-400 hover:text-rose-600 transition-colors flex items-center gap-1 text-[10px] cursor-pointer mt-0.5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Per-Item Customizations: Cake Message & Special Notes */}
                    <div className="bg-bakery-50/80 p-2.5 rounded-xl border border-bakery-200/70 space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-bakery-700 flex items-center gap-1.5 mb-0.5">
                          <Cake className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Message Written on Cake:</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Happy 25th Birthday Rahul!"
                          value={item.cakeMessage || ''}
                          onChange={(e) => updateCartItemByIndex(idx, { cakeMessage: e.target.value })}
                          className="w-full bg-white border border-bakery-200 rounded-lg px-2.5 py-1.5 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-bakery-700 flex items-center gap-1.5 mb-0.5">
                          <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Special Notes / Instructions:</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Eggless, Less sugar, deliver around 6 PM"
                          value={item.specialNotes || ''}
                          onChange={(e) => updateCartItemByIndex(idx, { specialNotes: e.target.value })}
                          className="w-full bg-white border border-bakery-200 rounded-lg px-2.5 py-1.5 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal preview with Montserrat font-price Medium */}
              <div className="pt-3 border-t border-bakery-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-bakery-chocolate">
                  <span>Cart Subtotal</span>
                  <span className="font-price text-base font-medium text-amber-800 tracking-tight">
                    {formatINR(cartSubtotal)}
                  </span>
                </div>

                {redeemPoints && pointsDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
                    <span>Points Discount ({maxRedeemablePoints} pts)</span>
                    <span className="font-price font-medium text-emerald-700">
                      -₹{pointsDiscountAmount}
                    </span>
                  </div>
                )}

                {redeemPoints && pointsDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs font-bold text-bakery-chocolate pt-1 border-t border-bakery-100">
                    <span>Final Amount Payable</span>
                    <span className="font-price text-lg font-bold text-amber-900 tracking-tight">
                      {formatINR(finalCartTotal)}
                    </span>
                  </div>
                )}
              </div>

              {/* Gated Checkout Section */}
              {!session?.user ? (
                <div className="pt-4 border-t border-bakery-200 space-y-3 pb-4">
                  <div className="bg-amber-50/80 border border-amber-200/80 p-4.5 rounded-2xl space-y-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-bakery-chocolate uppercase tracking-wider">Sign In Required to Checkout</h4>
                      <p className="text-xs text-bakery-800 leading-relaxed">
                        Sign in with Google to place your order and track it anytime
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn(window.location.href)}
                      className="w-full inline-flex items-center justify-center gap-2.5 bg-white hover:bg-amber-100/60 text-bakery-chocolate font-bold py-3.5 px-4 rounded-xl border border-amber-300 shadow-xs transition-all hover:scale-[1.01] active:scale-95 cursor-pointer text-xs sm:text-sm min-h-[46px]"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign in with Google to Checkout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCheckout} className="pt-4 border-t border-bakery-200 space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-bakery-chocolate flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Complete Your Order
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Signed in as {session.user.name || session.user.email}
                    </span>
                  </div>

                  {session?.user && (
                    <div className="bg-gradient-to-r from-amber-50 via-amber-50 to-amber-100/70 border border-amber-200/90 p-3.5 rounded-2xl space-y-1.5 text-xs text-bakery-chocolate shadow-2xs">
                      {userPoints >= 100 ? (
                        <>
                          <div className="flex items-center justify-between">
                            <label htmlFor="cart-redeem-points" className="font-bold flex items-center gap-2 cursor-pointer select-none">
                              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Redeem {maxRedeemablePoints} Points (₹{potentialDiscount} Off)</span>
                            </label>
                            <input
                              id="cart-redeem-points"
                              type="checkbox"
                              checked={redeemPoints}
                              onChange={(e) => setRedeemPoints(e.target.checked)}
                              className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer accent-amber-600"
                              aria-label={`Redeem ${maxRedeemablePoints} points for ₹${potentialDiscount} discount`}
                            />
                          </div>
                          <p className="text-[11px] text-bakery-600 leading-snug">
                            You have <strong>{userPoints} points</strong> available. {redeemPoints ? `₹${pointsDiscountAmount} discount applied!` : 'Check the box to apply discount instantly.'}
                          </p>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <p className="font-bold text-xs text-bakery-chocolate">
                                Rewards Points Balance: <span className="text-amber-700 font-extrabold">{userPoints} pts</span>
                              </p>
                              <p className="text-[10px] text-bakery-600 leading-snug">
                                Earn 5 points for every ₹100 spent! Collect 100 points to unlock ₹50 off.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}


                  <input
                    type="text"
                    placeholder="Your Full Name *"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2.5 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                  />

                  <input
                    type="tel"
                    placeholder="Mobile Phone Number *"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2.5 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                  />

                  <input
                    type="text"
                    placeholder="General Delivery Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2.5 text-xs text-bakery-chocolate placeholder-bakery-400 focus:outline-none focus:border-amber-600"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-soft transition-all active:scale-95 disabled:opacity-50 mt-2 min-h-[44px] cursor-pointer"
                  >
                    {isSubmitting ? 'Placing Order...' : `Submit Order (${formatINR(finalCartTotal)})`}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
