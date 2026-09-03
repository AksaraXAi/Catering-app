import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Payment } from '../../types.ts';
import { CreditCard, DollarSign, ArrowDownLeft, FileText, CheckCircle2 } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { activeTenant } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.getPayments();
      if (res.success) {
        setPayments(res.payments || []);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [activeTenant?.id]);

  const totalReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            Buku Kas Masuk & Riwayat Pembayaran
          </h2>
          <p className="text-xs text-stone-500">
            Catatan penerimaan uang muka (DP) dan pelunasan dari seluruh pelanggan catering
          </p>
        </div>

        <div className="bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
            Total Dana Masuk Diterima
          </span>
          <span className="text-base font-black text-emerald-700">
            Rp {totalReceived.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Table of Payments */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Waktu Pembayaran</th>
                <th className="py-3 px-4">No. Order Terkait</th>
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Jenis Pembayaran</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-right">Nominal Masuk</th>
                <th className="py-3 px-4">Catatan / Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    Memuat data kas masuk...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    Belum ada riwayat pembayaran yang tercatat.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition">
                    <td className="py-3.5 px-4 text-stone-600 font-medium">
                      {new Date(p.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {p.orderNumber || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-800">
                      {p.customerName || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                      +Rp {p.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 text-[11px] max-w-xs truncate">
                      {p.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
