'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { handleGoogleSignIn } from '@/lib/auth-toast';
import {
  Package,
  Clock,
  CheckCircle2,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  ArrowRight,
  User,
  Truck,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  Cake,
  Gift,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '@/lib/pricing';
import { useCart } from '@/context/CartContext';
import { OrderCardSkeleton } from '@/components/ui/Skeletons';
import { formatDisplay12 } from '@/components/ui/TimePicker';

export default function CustomerOrdersPage() {
  const { data: session, status } = useSession();
  const { openProductModal } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [pointsData, setPointsData] = useState<{ pointsBalance: number; transactions: any[] }>({
    pointsBalance: 0,
    transactions: [],
  });

  useEffect(() => {
    document.title = 'My Homely Cakes | My Orders';
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/customer/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
            if (data.orders.length > 0) {
              setExpandedOrders({ [data.orders[0].id]: true });
            }
          }
        })
        .catch(() => setOrders([]))
        .finally(() => setIsLoading(false));

      fetch('/api/customer/points')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPointsData({
              pointsBalance: data.pointsBalance || 0,
              transactions: data.transactions || [],
            });
          }
        })
        .catch(() => {});
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    const confirmCancel = confirm(`Are you sure you want to cancel Order #${orderNumber}?\n\nOur Trivandrum bakery will be notified immediately.`);
    if (!confirmCancel) return;

    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, consumerStatus: 'cancelled', status: 'cancelled' } : o
          )
        );
        alert(`Order #${orderNumber} has been successfully cancelled.`);
      } else {
        alert(data.error || 'Failed to cancel order.');
      }
    } catch (err) {
      alert('Network error while cancelling order.');
    } finally {
      setCancellingId(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleOpenProduct = async (productId?: string) => {
    if (!productId) {
      window.location.href = '/shop';
      return;
    }
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (data.product) {
        openProductModal(data.product);
      } else {
        window.location.href = `/shop`;
      }
    } catch (e) {
      window.location.href = `/shop`;
    }
  };

  // Helper for Consumer Status Badges
  const getConsumerStatusBadge = (consumerStatusStr?: string, fallbackStatusStr?: string) => {
    const s = (consumerStatusStr || fallbackStatusStr || 'received').toLowerCase();
    switch (s) {
      case 'received':
      case 'new':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Order Received</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-900 border border-sky-300 shadow-xs">
            <Package className="w-3.5 h-3.5 text-sky-700" />
            <span>Processing</span>
          </span>
        );
      case 'baking':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-900 border border-orange-300 shadow-xs">
            <Package className="w-3.5 h-3.5 text-orange-700" />
            <span>Baking Cake</span>
          </span>
        );
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-300 shadow-xs">
            <Package className="w-3.5 h-3.5 text-purple-700" />
            <span>Packed & Ready</span>
          </span>
        );
      case 'dispatched':
      case 'out for delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-300 shadow-xs">
            <Truck className="w-3.5 h-3.5 text-indigo-700" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'delivered':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-900 border border-rose-300 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>{s.toUpperCase()}</span>
          </span>
        );
    }
  };

  // Helper for rendering step tracker bar
  const renderOrderTracker = (consumerStatusStr?: string) => {
    const current = (consumerStatusStr || 'received').toLowerCase();

    if (current === 'cancelled') {
      return (
        <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-900 shadow-xs">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold">This order has been cancelled</p>
            <p className="text-[11px] text-rose-700">If you have questions regarding this order, please contact our bakery support.</p>
          </div>
        </div>
      );
    }

    const steps = [
      { key: 'received', label: 'Received' },
      { key: 'baking', label: 'Baking' },
      { key: 'packed', label: 'Packed' },
      { key: 'dispatched', label: 'Dispatched' },
      { key: 'delivered', label: 'Delivered' },
    ];

    let currentStepIdx = 0;
    if (current === 'processing' || current === 'baking') currentStepIdx = 1;
    else if (current === 'packed') currentStepIdx = 2;
    else if (current === 'dispatched') currentStepIdx = 3;
    else if (current === 'delivered' || current === 'completed') currentStepIdx = 4;

    return (
      <div className="bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 p-4 sm:p-6 rounded-2xl border border-amber-200/60 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Live Order Progress</span>
          </span>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300/60">
            Step {currentStepIdx + 1} of 5
          </span>
        </div>

        {/* Stepper Progress Bar */}
        <div className="relative pt-1 pb-1">
          {/* Background track line - Perfectly passing through circle centers */}
          <div className="absolute top-[14px] sm:top-[16px] left-[10%] right-[10%] h-[2px] bg-amber-200/90 -translate-y-1/2 z-0" />
          
          {/* Active track line */}
          <div
            className="absolute top-[14px] sm:top-[16px] left-[10%] h-[2px] bg-amber-600 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 80}%` }}
          />

          <div className="flex items-start justify-between w-full relative z-10">
            {steps.map((step, idx) => {
              const isDone = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="w-1/5 flex flex-col items-center group">
                  {/* Step Node Circle */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isCurrent
                        ? 'bg-amber-600 text-white ring-4 ring-amber-500/25 scale-110 shadow-sm'
                        : isDone
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white text-amber-400 border-2 border-amber-200'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-[11px] font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-[10px] sm:text-xs font-bold mt-2 text-center transition-colors leading-tight ${
                      isCurrent
                        ? 'text-amber-950 font-extrabold scale-105'
                        : isDone
                        ? 'text-amber-900 font-semibold'
                        : 'text-bakery-400 font-medium'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Unauthenticated Guard View
  if (status === 'unauthenticated') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-bakery-200/80 shadow-soft text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center border border-amber-200/60">
            <Package className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate">
              Customer Order History
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 leading-relaxed">
              Please sign in with Google to view and track all your MyHomelyCake cake orders.
            </p>
          </div>

          <button
            onClick={() => handleGoogleSignIn()}
            className="inline-flex items-center gap-2.5 bg-white hover:bg-bakery-50 text-bakery-chocolate border border-bakery-300 font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-soft transition-all active:scale-95 cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-bakery-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User Profile'}
              width={52}
              height={52}
              className="rounded-full border border-amber-300 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
              {(session?.user?.name || session?.user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-bakery-chocolate">
              My Orders
            </h1>
            <p className="text-xs text-bakery-600 mt-0.5">
              Welcome back, <strong className="text-bakery-900">{session?.user?.name}</strong> ({session?.user?.email})
            </p>
          </div>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-soft transition-colors self-start sm:self-auto min-h-[42px]"
        >
          <ShoppingBag className="w-4 h-4 text-amber-200" />
          <span>Explore Cakes</span>
        </Link>
      </div>

      {/* Loyalty Points Card */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-950 to-amber-900 text-white rounded-3xl p-6 sm:p-7 shadow-soft border border-amber-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cake Shop Points</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-amber-200">
                  {pointsData.pointsBalance}
                </span>
                <span className="text-sm text-amber-300/80 font-medium">Points Balance</span>
              </div>
              <p className="text-xs text-amber-200/70 mt-1 max-w-lg leading-relaxed">
                Earn 5 points for every ₹100 spent when your order is delivered. Redeem 100 points for ₹50 off on future orders at checkout!
              </p>
            </div>
          </div>

          <div className="bg-amber-900/50 backdrop-blur-xs border border-amber-700/50 rounded-2xl p-4 sm:w-64 text-xs space-y-1.5 shrink-0 w-full sm:w-auto">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Points Rate & Discount</span>
            </div>
            <div className="text-[11px] text-amber-200/80 space-y-1">
              <div className="flex justify-between"><span>Earn Rate</span><span className="font-bold text-white">5 pts / ₹100</span></div>
              <div className="flex justify-between"><span>100 Points</span><span className="font-bold text-emerald-400">₹50 OFF</span></div>
              <div className="flex justify-between"><span>200 Points</span><span className="font-bold text-emerald-400">₹100 OFF</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List / Loading / Empty State */}
      {isLoading ? (
        <div className="space-y-4">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="bg-white p-12 rounded-3xl border border-bakery-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-bakery-100 text-bakery-400 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-bakery-chocolate">
              You haven&apos;t placed any orders yet
            </h3>
            <p className="text-xs text-bakery-600 max-w-sm mx-auto">
              Browse our fresh home-baked Trivandrum cakes and place your first order today.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-amber-600 text-white font-bold text-xs py-3 px-6 rounded-full shadow-soft hover:bg-amber-500 transition-colors min-h-[44px]"
          >
            <span>Explore Cakes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {orders.map((order) => {
            let itemsList = [];
            try {
              itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            } catch (e) {
              itemsList = [];
            }

            const isExpanded = !!expandedOrders[order.id];

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-bakery-200/80 shadow-soft overflow-hidden transition-all"
              >
                {/* Order Summary Header Row */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-bakery-50/50 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="font-mono font-bold text-amber-900 text-base">
                        #{order.orderNumber}
                      </span>
                      {getConsumerStatusBadge(order.consumerStatus, order.status)}

                      {/* Loyalty Points Status Badge */}
                      {(() => {
                        const isCancelled = order.status === 'cancelled' || order.consumerStatus === 'cancelled';
                        const isDelivered = order.status === 'completed' || order.consumerStatus === 'delivered';
                        const estPoints = Math.floor(order.totalAmount / 100) * 5;

                        if (isDelivered) {
                          return (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/90 shadow-2xs">
                              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>+{order.pointsEarned || estPoints} Pts Credited</span>
                            </span>
                          );
                        }
                        if (isCancelled) {
                          return (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-rose-200/80">
                              <span>Points Reversed</span>
                            </span>
                          );
                        }
                        return (
                          <span
                            className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300/80 shadow-2xs"
                            title="Points will be credited automatically when baker delivers your order"
                          >
                            <Sparkles className="w-3 h-3 text-amber-600 shrink-0 animate-pulse" />
                            <span>+{estPoints} Pts Pending Delivery</span>
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-bakery-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-bakery-500 uppercase tracking-wider block font-medium">Total Amount</span>
                      <span className="font-price text-base sm:text-lg font-bold text-amber-800 tracking-tight">
                        {formatINR(order.totalAmount)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-2 rounded-full text-bakery-400 hover:text-bakery-800 hover:bg-bakery-100 transition-colors shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Order Details View */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-bakery-100 space-y-4">
                    
                    {/* Visual Live Order Progress Tracker */}
                    {renderOrderTracker(order.consumerStatus)}

                    {/* Delivery & Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-bakery-50/70 p-4 rounded-2xl border border-bakery-200/60">
                      <div>
                        <span className="font-bold text-bakery-chocolate block mb-1">Delivery Details:</span>
                        {order.deliveryCity && <p className="text-bakery-700"><strong>City:</strong> {order.deliveryCity}</p>}
                        {(order.deliveryDate || order.deliveryTime) && (
                          <p className="text-bakery-700">
                            <strong>Date/Time:</strong> {order.deliveryDate || ''} {order.deliveryTime ? formatDisplay12(order.deliveryTime) : ''}
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="font-bold text-bakery-chocolate block mb-1">Contact Info:</span>
                        <p className="text-bakery-700"><strong>Recipient:</strong> {order.customerName}</p>
                        <p className="text-bakery-700"><strong>Phone:</strong> {order.mobile}</p>
                        {order.notes && <p className="text-bakery-700"><strong>General Notes:</strong> {order.notes}</p>}
                      </div>
                    </div>

                    {/* Ordered Items Breakdown */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-bakery-chocolate uppercase tracking-wider block">
                        Items Ordered ({itemsList.length}):
                      </span>

                      <div className="space-y-2.5">
                        {itemsList.map((it: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-bakery-200/80 space-y-2.5 shadow-xs transition-all hover:border-amber-300"
                          >
                            <div className="flex items-center justify-between gap-3">
                              {/* Clickable Product Image + Info */}
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Thumbnail */}
                                <div
                                  onClick={() => handleOpenProduct(it.productId)}
                                  className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-amber-50 shrink-0 border border-amber-200/80 cursor-pointer group flex items-center justify-center"
                                  title="Click to view cake details"
                                >
                                  {it.imageUrl ? (
                                    <Image
                                      src={it.imageUrl}
                                      alt={it.name}
                                      fill
                                      sizes="56px"
                                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  ) : (
                                    <Cake className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
                                  )}
                                </div>

                                {/* Details */}
                                <div className="min-w-0 flex-1">
                                  <h4
                                    onClick={() => handleOpenProduct(it.productId)}
                                    className="font-bold text-bakery-chocolate text-xs sm:text-sm hover:text-amber-800 transition-colors cursor-pointer flex items-center gap-1.5 group truncate"
                                    title="Click to view cake details"
                                  >
                                    <span className="truncate">{it.name}</span>
                                    <ExternalLink className="w-3 h-3 text-amber-600 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                                  </h4>
                                  <p className="text-[11px] text-bakery-600 font-medium mt-0.5">
                                    Weight: <span className="font-semibold text-bakery-800">{it.weightG >= 1000 ? `${it.weightG / 1000}kg` : `${it.weightG}g`}</span> • Qty: <span className="font-semibold text-bakery-800">{it.qty}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Line Price */}
                              <div className="text-right shrink-0">
                                <span className="font-price font-bold text-amber-900 text-sm sm:text-base">
                                  {formatINR(it.lineTotal || (it.calculatedPrice * it.qty))}
                                </span>
                              </div>
                            </div>

                            {/* Per-Item Cake Message */}
                            {it.cakeMessage && (
                              <div className="bg-amber-50/90 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200/80 text-xs font-medium">
                                <span className="font-extrabold text-amber-800">Message on Cake:</span> &ldquo;{it.cakeMessage}&rdquo;
                              </div>
                            )}

                            {/* Per-Item Special Notes */}
                            {it.specialNotes && (
                              <div className="bg-blue-50/80 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-200/70 text-xs font-medium">
                                <span className="font-extrabold text-blue-800">Special Notes:</span> &ldquo;{it.specialNotes}&rdquo;
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Summary Footer */}
                    <div className="pt-2 border-t border-bakery-100 space-y-1 text-xs text-bakery-chocolate">
                      {order.pointsRedeemed && order.pointsRedeemed > 0 ? (
                        <div className="flex justify-between items-center text-amber-800">
                          <span className="font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            Cake Shop Points Discount ({order.pointsRedeemed} pts):
                          </span>
                          <span className="font-price font-bold text-amber-700">-{formatINR(order.pointsDiscountAmount || 0)}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="font-semibold">Total Paid / Payable on Delivery:</span>
                        <span className="font-price text-base font-bold text-amber-800">{formatINR(order.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Order Assistance & Cancellation Options */}
                    {order.consumerStatus !== 'cancelled' && order.status !== 'cancelled' && order.consumerStatus !== 'delivered' && order.consumerStatus !== 'completed' && (
                      <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 space-y-3 pt-3 mt-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-bakery-chocolate flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>Need to Modify or Cancel Order?</span>
                            </h4>
                            <p className="text-[11px] text-bakery-600 mt-0.5">
                              Call our Trivandrum baker hotline directly or cancel online before baking starts.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          {/* Direct Phone Call Button */}
                          <a
                            href="tel:919947066011"
                            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                            <span>Call Baker Direct: +91 99470 66011</span>
                          </a>

                          {/* Online Cancellation Button */}
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                            disabled={cancellingId === order.id}
                            className="inline-flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200/90 font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer min-h-[38px]"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{cancellingId === order.id ? 'Cancelling...' : 'Cancel Order Online'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
