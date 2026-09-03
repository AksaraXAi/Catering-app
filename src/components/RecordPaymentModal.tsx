import React, { useState } from 'react';
import { api } from '../api/client.ts';
import { Order } from '../types.ts';
import { X, CreditCard, DollarSign } from 'lucide-react';

interface RecordPaymentModalProps {
  order: Order | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  order,
  onClose,
  onPaymentSuccess,
}) => {
  if (!order) return null;

  const [amount, setAmount] = useState<number>(order.remainingAmount || order.dpAmount || 0);
  const [paymentType, setPaymentType] = useState<string>(
    order.paymentStatus === 'UNPAID' ? 'DP' : 'Pelunasan'
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('Transfer Bank');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Nominal pembayaran harus lebih dari 0.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.createPayment({
        orderId: order.id,
        amount,
        paymentType,
        paymentMethod,
        notes,
      });

      if (res.success) {
        onPaymentSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mencatat pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-stone-900 text-sm">Catat Pembayaran Order</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-500">Nomor Order:</span>
              <span className="font-bold text-stone-900">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Pelanggan:</span>
              <span className="font-semibold text-stone-800">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Total Tagihan:</span>
              <span className="font-bold text-stone-900">
                Rp {order.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-stone-200 text-rose-700 font-bold">
              <span>Sisa Tagihan:</span>
              <span>Rp {order.remainingAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Nominal Pembayaran (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="number"
                required
                min="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900 font-bold text-sm"
              />
            </div>
            <div className="flex gap-2 mt-1.5">
              {order.dpAmount > 0 && order.paymentStatus === 'UNPAID' && (
                <button
                  type="button"
                  onClick={() => setAmount(order.dpAmount)}
                  className="px-2 py-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                >
                  Set DP (Rp {order.dpAmount.toLocaleString('id-ID')})
                </button>
              )}
              {order.remainingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(order.remainingAmount)}
                  className="px-2 py-1 text-[11px] bg-stone-100 text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-200"
                >
                  Set Lunas (Rp {order.remainingAmount.toLocaleString('id-ID')})
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Jenis Pembayaran</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-800"
              >
                <option value="DP">Uang Muka (DP)</option>
                <option value="Pelunasan">Pelunasan</option>
                <option value="Angsuran">Angsuran Bertahap</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Metode Bayar</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-800"
              >
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="QRIS">QRIS</option>
                <option value="Tunai / Cash">Tunai / Cash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Catatan / Bukti Transfer</label>
            <input
              type="text"
              placeholder="Contoh: Transfer BCA an Bpk Ahmad, rek 1234..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition disabled:opacity-50 text-xs"
          >
            {loading ? 'Menyimpan...' : 'Simpan Pembayaran'}
          </button>
        </form>
      </div>
    </div>
  );
};
