'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { formatINR } from '@/lib/pricing';

interface ThermalReceiptModalProps {
  order?: any | null;
  orders?: any[] | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ThermalReceiptModal({ order, orders, isOpen, onClose }: ThermalReceiptModalProps) {
  if (!isOpen) return null;

  const ordersList: any[] = orders && orders.length > 0 ? orders : (order ? [order] : []);

  if (ordersList.length === 0) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar (Screen Only) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-bakery-chocolate text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif text-sm font-bold tracking-wide">
              {ordersList.length > 1
                ? `Batch Thermal Receipt Preview (${ordersList.length} Orders)`
                : 'Thermal Receipt Preview'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print {ordersList.length > 1 ? `All (${ordersList.length})` : 'Now'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Preview (Screen Only) */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex flex-col items-center gap-6 print:hidden">
          {ordersList.map((ord: any, orderIndex: number) => {
            let itemsList: any[] = [];
            try {
              itemsList = typeof ord.items === 'string' ? JSON.parse(ord.items) : (ord.items || []);
            } catch (e) {
              itemsList = [];
            }
            const totalQty = itemsList.reduce((acc, item) => acc + Number(item.qty || 1), 0);
            const orderDate = ord.createdAt
              ? new Date(ord.createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : new Date().toLocaleDateString('en-IN');

            return (
              <div key={ord.id || orderIndex} className="w-full flex flex-col items-center">
                {ordersList.length > 1 && (
                  <div className="w-[80mm] mb-1 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Receipt #{orderIndex + 1}</span>
                    <span>{ord.orderNumber}</span>
                  </div>
                )}
                {/* 80mm Simulated Paper Card */}
                <div className="bg-white text-black p-4 rounded shadow-md w-[80mm] font-mono text-[11px] leading-tight border border-slate-200">
                  {/* Logo */}
                  <div className="text-center mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo.png"
                      alt="My Homely Cakes Logo"
                      className="h-10 w-auto mx-auto object-contain mb-1"
                    />
                    <div className="font-bold text-xs uppercase tracking-tight">My Homely Cakes</div>
                    <div className="text-[10px]">State: 32-Kerala</div>
                  </div>

                  {/* Separator Line */}
                  <div className="border-b border-dashed border-black my-2"></div>

                  {/* Title */}
                  <div className="font-bold text-center text-xs uppercase tracking-wider mb-2">Tax Invoice</div>

                  {/* Key-Value Metadata block */}
                  <div className="space-y-0.5 text-[10.5px]">
                    <div className="flex justify-between">
                      <span>Cash Sale</span>
                      <span>Place of Supply: Kerala</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{orderDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Invoice No.:</span>
                      <span className="font-bold">{ord.orderNumber}</span>
                    </div>
                    {ord.customerName && (
                      <div className="flex justify-between truncate">
                        <span>Customer:</span>
                        <span className="font-semibold truncate max-w-[140px]">{ord.customerName}</span>
                      </div>
                    )}
                    {ord.mobile && (
                      <div className="flex justify-between">
                        <span>Mobile:</span>
                        <span>{ord.mobile}</span>
                      </div>
                    )}
                  </div>

                  {/* Separator Line */}
                  <div className="border-b border-dashed border-black my-2"></div>

                  {/* Itemized Table */}
                  <table className="w-full text-left font-mono text-[10.5px] border-collapse">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="py-1 w-[8%]">#</th>
                        <th className="py-1 w-[44%]">Name</th>
                        <th className="py-1 w-[12%] text-center">Qty</th>
                        <th className="py-1 w-[18%] text-right">Price</th>
                        <th className="py-1 w-[18%] text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-gray-300">
                      {itemsList.map((item: any, idx: number) => {
                        const weightStr = item.weightG
                          ? item.weightG >= 1000
                            ? `${item.weightG / 1000}kg`
                            : `${item.weightG}g`
                          : '';
                        const displayName = `${item.name || 'Cake'}${weightStr ? ` (${weightStr})` : ''}`;
                        const unitPrice = item.calculatedPrice || (item.lineTotal ? Math.round(item.lineTotal / item.qty) : 0);
                        const amount = item.lineTotal || unitPrice * (item.qty || 1);

                        return (
                          <tr key={idx} className="align-top">
                            <td className="py-1">{idx + 1}</td>
                            <td className="py-1 break-words pr-1">{displayName}</td>
                            <td className="py-1 text-center">{item.qty || 1}</td>
                            <td className="py-1 text-right">{unitPrice}</td>
                            <td className="py-1 text-right font-semibold">{amount}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Separator Line */}
                  <div className="border-b border-dashed border-black my-2"></div>

                  {/* Totals Block */}
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>Total Quantity:</span>
                      <span className="font-bold">{totalQty} Pcs</span>
                    </div>
                    {Boolean(ord.discountAmount && ord.discountAmount > 0) && (
                      <div className="flex justify-between text-[10px]">
                        <span>Offer Discount:</span>
                        <span>-₹{ord.discountAmount}</span>
                      </div>
                    )}
                    {Boolean(ord.pointsDiscountAmount && ord.pointsDiscountAmount > 0) && (
                      <div className="flex justify-between text-[10px]">
                        <span>Points Discount:</span>
                        <span>-₹{ord.pointsDiscountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-extrabold border-t border-black pt-1">
                      <span>GRAND TOTAL:</span>
                      <span>{formatINR(ord.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Separator Line */}
                  <div className="border-b border-dashed border-black my-2"></div>

                  {/* Footer */}
                  <div className="text-center space-y-1 text-[10px] pt-1">
                    <div className="font-bold uppercase tracking-wider">Terms & Conditions</div>
                    <div className="text-[9.5px]">Thank you for doing business with us.</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── DEDICATED THERMAL PRINTABLE CONTAINER (Active during window.print()) ─── */}
      <div id="printable-receipt" className="hidden print:block text-[11px] leading-tight text-black bg-white">
        <style jsx global>{`
          @media print {
            /* Force print preview to auto-detect 80mm thermal receipt width */
            @page {
              size: 80mm auto;
              margin: 0mm;
            }

            /* Hide admin dashboard layout elements */
            body * {
              visibility: hidden;
            }

            /* Render only the printable receipt container */
            #printable-receipt, #printable-receipt * {
              visibility: visible;
            }

            #printable-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm;
              max-width: 100%;
              padding: 4mm;
              box-sizing: border-box;
              font-family: 'Courier New', monospace;
              color: #000;
              background: #fff;
            }

            .receipt-page-item {
              page-break-after: always;
              break-after: page;
            }
            .receipt-page-item:last-child {
              page-break-after: auto;
              break-after: auto;
            }
          }
        `}</style>

        {ordersList.map((ord: any, orderIndex: number) => {
          let itemsList: any[] = [];
          try {
            itemsList = typeof ord.items === 'string' ? JSON.parse(ord.items) : (ord.items || []);
          } catch (e) {
            itemsList = [];
          }
          const totalQty = itemsList.reduce((acc, item) => acc + Number(item.qty || 1), 0);
          const orderDate = ord.createdAt
            ? new Date(ord.createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
            : new Date().toLocaleDateString('en-IN');

          return (
            <div key={ord.id || orderIndex} className="receipt-page-item">
              {/* Logo */}
              <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="My Homely Cakes Logo"
                  style={{ height: '40px', width: 'auto', margin: '0 auto 4px auto', display: 'block' }}
                />
                <div style={{ fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '-0.2px' }}>
                  My Homely Cakes
                </div>
                <div style={{ fontSize: '10px' }}>State: 32-Kerala</div>
              </div>

              {/* Separator Line */}
              <div style={{ borderBottom: '1px dashed #000000', margin: '6px 0' }}></div>

              {/* Title */}
              <div style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Tax Invoice
              </div>

              {/* Key-Value Metadata block */}
              <div style={{ fontSize: '10.5px', lineHeight: '1.3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cash Sale</span>
                  <span>Place of Supply: Kerala</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Date:</span>
                  <span>{orderDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Invoice No.:</span>
                  <span style={{ fontWeight: 'bold' }}>{ord.orderNumber}</span>
                </div>
                {ord.customerName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Customer:</span>
                    <span style={{ fontWeight: '600' }}>{ord.customerName}</span>
                  </div>
                )}
                {ord.mobile && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Mobile:</span>
                    <span>{ord.mobile}</span>
                  </div>
                )}
              </div>

              {/* Separator Line */}
              <div style={{ borderBottom: '1px dashed #000000', margin: '6px 0' }}></div>

              {/* Itemized Table */}
              <table style={{ width: '100%', textAlign: 'left', fontFamily: "'Courier New', monospace", fontSize: '10.5px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000000' }}>
                    <th style={{ padding: '2px 0', width: '8%' }}>#</th>
                    <th style={{ padding: '2px 0', width: '44%' }}>Name</th>
                    <th style={{ padding: '2px 0', width: '12%', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '2px 0', width: '18%', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '2px 0', width: '18%', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsList.map((item: any, idx: number) => {
                    const weightStr = item.weightG
                      ? item.weightG >= 1000
                        ? `${item.weightG / 1000}kg`
                        : `${item.weightG}g`
                      : '';
                    const displayName = `${item.name || 'Cake'}${weightStr ? ` (${weightStr})` : ''}`;
                    const unitPrice = item.calculatedPrice || (item.lineTotal ? Math.round(item.lineTotal / item.qty) : 0);
                    const amount = item.lineTotal || unitPrice * (item.qty || 1);

                    return (
                      <tr key={idx} style={{ verticalAlign: 'top', borderBottom: '1px dashed #cccccc' }}>
                        <td style={{ padding: '3px 0' }}>{idx + 1}</td>
                        <td style={{ padding: '3px 4px 3px 0', wordBreak: 'break-word' }}>{displayName}</td>
                        <td style={{ padding: '3px 0', textAlign: 'center' }}>{item.qty || 1}</td>
                        <td style={{ padding: '3px 0', textAlign: 'right' }}>{unitPrice}</td>
                        <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: 'bold' }}>{amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Separator Line */}
              <div style={{ borderBottom: '1px dashed #000000', margin: '6px 0' }}></div>

              {/* Totals Block */}
              <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Quantity:</span>
                  <span style={{ fontWeight: 'bold' }}>{totalQty} Pcs</span>
                </div>
                {Boolean(ord.discountAmount && ord.discountAmount > 0) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span>Offer Discount:</span>
                    <span>-₹{ord.discountAmount}</span>
                  </div>
                )}
                {Boolean(ord.pointsDiscountAmount && ord.pointsDiscountAmount > 0) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span>Points Discount:</span>
                    <span>-₹{ord.pointsDiscountAmount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', borderTop: '1px solid #000000', paddingTop: '4px', marginTop: '2px' }}>
                  <span>GRAND TOTAL:</span>
                  <span>{formatINR(ord.totalAmount)}</span>
                </div>
              </div>

              {/* Separator Line */}
              <div style={{ borderBottom: '1px dashed #000000', margin: '6px 0' }}></div>

              {/* Footer */}
              <div style={{ textAlign: 'center', fontSize: '10px', paddingTop: '2px', paddingBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                  Terms & Conditions
                </div>
                <div style={{ fontSize: '9.5px' }}>Thank you for doing business with us.</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
