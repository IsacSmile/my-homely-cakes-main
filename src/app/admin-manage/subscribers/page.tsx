'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Download, Trash2, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Deletion & Toast States
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSubscribers = () => {
    fetch('/api/subscribers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.subscribers)) {
          setSubscribers(data.subscribers);
        } else {
          setSubscribers([]);
        }
      })
      .catch(() => setSubscribers([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDeleteSubscriber = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/subscribers?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to delete subscriber');
      }

      // Update state dynamically without page reload
      setSubscribers(prev => prev.filter(s => s.id !== deleteTarget.id));
      triggerToast(`Subscriber ${deleteTarget.email} removed successfully.`);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting subscriber.');
    } finally {
      setIsDeleting(false);
    }
  };

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
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-3 rounded-full shadow-soft transition-colors disabled:opacity-50 cursor-pointer"
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
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Subscription Date</th>
                  <th className="py-3 px-4 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bakery-100 text-bakery-chocolate">
                {subscribers.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-bakery-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-bakery-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-amber-900">{sub.email}</td>
                    <td className="py-3 px-4 text-bakery-400">
                      {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(sub)}
                        className="inline-flex items-center gap-1 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete subscriber email"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Delete Subscriber
                </h3>
                <p className="text-xs text-slate-500">
                  Confirm email removal from newsletter list
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
              <p className="font-medium">
                Are you sure you want to remove <span className="font-bold text-rose-700">{deleteTarget.email}</span> from newsletter subscribers?
              </p>
              <p className="text-[11px] text-slate-500 italic">
                This action cannot be undone. The email address will be permanently removed from your subscriber database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSubscriber}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-soft transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Subscriber</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
