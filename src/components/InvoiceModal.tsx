import React from 'react';
import { Order, Tenant } from '../types.ts';
import { Printer, X, MessageCircle, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge.tsx';

interface InvoiceModalProps {
  order: Order | null;
  tenant: Tenant | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, tenant, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const cleanWA = order.customerWhatsapp.replace(/[^0-9]/g, '');
  const invoiceText = encodeURIComponent(
    `Halo *${order.customerName}*, berikut adalah nota digital pesanan catering Anda:\n` +
      `No. Order: *${order.orderNumber}*\n` +
      `Tanggal Acara: *${order.eventDate}* (${order.deliveryTime} WIB)\n` +
      `Total: Rp ${order.totalAmount.toLocaleString('id-ID')}\n` +
      `DP: Rp ${order.dpAmount.toLocaleString('id-ID')}\n` +
      `Sisa: Rp ${order.remainingAmount.toLocaleString('id-ID')}\n` +
      `Status Pembayaran: *${order.paymentStatus === 'PAID' ? 'LUNAS' : order.paymentStatus === 'DP' ? 'DP' : 'BELUM BAYAR'}*\n\n` +
      `Info Rekening: ${tenant?.bankInfo || '-'}\n` +
      `Terima kasih telah mempercayakan ${tenant?.name || 'Catering Kami'}!`
  );
  const waUrl = `https://wa.me/${cleanWA}?text=${invoiceText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden print:border-none print:shadow-none my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-stone-800">Nota & Invoice Digital</span>
            <StatusBadge status={order.orderStatus} type="order" />
            <StatusBadge status={order.paymentStatus} type="payment" />
          </div>
          <div className="flex items-center space-x-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1" />
              Kirim ke WA
            </a>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg shadow-2xs transition"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Cetak Nota
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 print:p-0 text-stone-800 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-stone-200 pb-6">
            <div className="space-y-1 max-w-md">
              <h2 className="text-2xl font-bold tracking-tight text-emerald-700">
                {tenant?.name || 'CateringApp'}
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                {tenant?.description || 'Layanan Catering Profesional, Higienis & Halal'}
              </p>
              <p className="text-xs text-stone-600 mt-1">
                📍 {tenant?.address || 'Yogyakarta, Indonesia'}
              </p>
              <p className="text-xs text-stone-600">
                📱 WhatsApp: {tenant?.whatsapp || '-'}
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="inline-block px-3 py-1 bg-stone-100 rounded-md text-xs font-semibold text-stone-700 tracking-wider">
                INVOICE PESANAN
              </div>
              <p className="text-sm font-bold text-stone-900 mt-2">{order.orderNumber}</p>
              <p className="text-xs text-stone-500">
                Tanggal Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>

          {/* Customer & Event Details */}
          <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl text-xs border border-stone-100 print:bg-transparent print:border">
            <div>
              <span className="text-stone-400 uppercase tracking-wider font-semibold block mb-1">
                Penerima / Pemesan
              </span>
              <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
              <p className="text-stone-600">📱 {order.customerWhatsapp}</p>
              <p className="text-stone-600 mt-1">
                🏠 <span className="font-medium">{order.deliveryAddress}</span>
              </p>
            </div>
            <div>
              <span className="text-stone-400 uppercase tracking-wider font-semibold block mb-1">
                Jadwal Pengiriman
              </span>
              <p className="font-bold text-emerald-800 text-sm">
                📅 {new Date(order.eventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-stone-700 font-medium mt-0.5">
                ⏰ Jam Kirim: {order.deliveryTime} WIB
              </p>
              {order.notes && (
                <p className="text-stone-600 mt-1.5 italic bg-white p-1.5 rounded border border-stone-200">
                  Catatan: "{order.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-200 text-stone-500">
                  <th className="py-2.5 px-2">Paket Menu</th>
                  <th className="py-2.5 px-2 text-center">Jumlah</th>
                  <th className="py-2.5 px-2 text-right">Harga Porsi</th>
                  <th className="py-2.5 px-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, i) => (
                    <tr key={i} className="hover:bg-stone-50/50">
                      <td className="py-3 px-2 font-medium text-stone-900">
                        {item.menuName}
                        {item.notes && <span className="block text-[11px] text-stone-500 font-normal">{item.notes}</span>}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-stone-700">{item.quantity} box</td>
                      <td className="py-3 px-2 text-right text-stone-600">
                        Rp {item.unitPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-stone-900">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-3 px-2 text-stone-400 text-center">
                      Detail menu paket catering
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & Payments Summary */}
          <div className="border-t border-stone-200 pt-4 flex justify-between items-start">
            <div className="text-xs space-y-2 max-w-sm">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="font-semibold text-emerald-900 block mb-1">
                  Rekening Pembayaran:
                </span>
                <p className="text-emerald-800 text-[11px] leading-relaxed whitespace-pre-line">
                  {tenant?.bankInfo || 'Silakan hubungi admin catering untuk informasi rekening.'}
                </p>
              </div>
              <p className="text-[11px] text-stone-400">
                * Bukti pembayaran dapat dikirimkan langsung melalui WhatsApp catering.
              </p>
            </div>

            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between py-1 border-b border-stone-100 text-stone-600">
                <span>Total Pesanan:</span>
                <span className="font-semibold text-stone-900">
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 text-stone-600">
                <span>Uang Muka (DP):</span>
                <span className="font-semibold text-emerald-700">
                  Rp {order.dpAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold text-stone-900 pt-1">
                <span>Sisa Tagihan:</span>
                <span className={order.remainingAmount === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {order.remainingAmount === 0 ? 'LUNAS' : `Rp ${order.remainingAmount.toLocaleString('id-ID')}`}
                </span>
              </div>
              {order.paymentStatus === 'PAID' && (
                <div className="inline-flex items-center text-emerald-600 text-xs font-semibold mt-1">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Pembayaran Telah Lunas
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-stone-100 pt-4 text-center text-[11px] text-stone-400">
            Terima kasih telah menggunakan layanan {tenant?.name || 'Catering Kami'}. Kami berkomitmen menyajikan masakan terbaik untuk acara istimewa Anda.
          </div>
        </div>
      </div>
    </div>
  );
};
