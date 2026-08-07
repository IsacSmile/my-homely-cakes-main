'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Download, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subscribers')
      .then(res => res.json())
      .then(data => {
        if (data.subscribers) setSubscribers(data.subscribers);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const downloadCSV = () => {
    if (subscribers.length === 0) return;
    const headers = 'ID,Email,SubscribedAt\n';
    const rows = subscribers.map(s => `"${s.id}","${s.email}","${s.createdAt}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myhomelycakes_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-bakery-chocolate">
            Newsletter Subscribers ({subscribers.length})
          </h1>
          <p className="text-xs text-bakery-600">
            List of customer emails captured via the sweet updates signup block.
          </p>
        </div>

        <button
          onClick={downloadCSV}
          disabled={subscribers.length === 0}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-3 rounded-full shadow-soft transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-bakery-600">Loading subscribers...</div>
      ) : subscribers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-bakery-200 text-center space-y-3">
          <Mail className="w-10 h-10 text-bakery-300 mx-auto" />
          <h3 className="font-serif text-base font-bold text-bakery-chocolate">No Subscribers Captured Yet</h3>
          <p className="text-xs text-bakery-600">Subscribers who sign up on the website footer will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-bakery-200 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-bakery-100 text-bakery-600 uppercase font-bold">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Subscription Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bakery-100 text-bakery-chocolate">
                {subscribers.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-bakery-50">
                    <td className="py-3 px-4 font-bold text-bakery-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-amber-900">{sub.email}</td>
                    <td className="py-3 px-4 text-bakery-400">
                      {new Date(sub.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
