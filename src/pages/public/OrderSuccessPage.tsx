import React from 'react';
import { Order, Tenant } from '../../types.ts';
import { CheckCircle2, MessageCircle, ArrowLeft, Building2, Clock, Calendar, MapPin } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge.tsx';

interface OrderSuccessPageProps {
  order: Order;
  tenant: Tenant | null;
  onBackToMenu: () => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  order,
  tenant,
  onBackToMenu,
}) => {
  const cleanWA = tenant?.whatsapp.replace(/[^0-9]/g, '') || '';
  const itemsText = (order.items || [])
    .map((it) => `- ${it.menuName} (${it.quantity} porsi x Rp ${it.unitPrice.toLocaleString('id-ID')})`)
    .join('%0A');

  const waMessage =
    `Halo *${encodeURIComponent(tenant?.name || 'Catering')}*, saya telah membuat pesanan baru:%0A%0A` +
    `*Nomor Order:* ${order.orderNumber}%0A` +
    `*Nama:* ${encodeURIComponent(order.customerName)}%0A` +
    `*Tanggal Acara:* ${order.eventDate}%0A` +
    `*Jam Kirim:* ${order.deliveryTime} WIB%0A` +
    `*Alamat:* ${encodeURIComponent(order.deliveryAddress)}%0A` +
    (order.notes ? `*Catatan:* ${encodeURIComponent(order.notes)}%0A` : '') +
    `%0A*Daftar Pesanan:*%0A${itemsText}%0A%0A` +
    `*Total:* Rp ${order.totalAmount.toLocaleString('id-ID')}%0A` +
    `*Uang Muka (DP 50%):* Rp ${order.dpAmount.toLocaleString('id-ID')}%0A` +
    `*Sisa Pembayaran:* Rp ${order.remainingAmount.toLocaleString('id-ID')}%0A%0A` +
    `Mohon konfirmasi dan informasi tata cara transfer. Terima kasih!`;

  const whatsappUrl = `https://wa.me/${cleanWA}?text=${waMessage}`;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
              Pesanan Berhasil Terkirim!
            </span>
            <h1 className="text-2xl font-black text-stone-900 mt-1">
              Terima Kasih, {order.customerName}!
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Pesanan Anda telah dicatat dalam sistem {tenant?.name || 'Catering'}.
            </p>
          </div>

          <div className="inline-block bg-stone-100 rounded-xl px-4 py-2 border border-stone-200">
            <span className="text-[11px] text-stone-400 block uppercase tracking-wider font-semibold">
              Nomor Order Anda
            </span>
            <span className="text-lg font-mono font-bold text-stone-900 tracking-wider">
              {order.orderNumber}
            </span>
          </div>

          {/* Primary Action: Chat via WhatsApp */}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Konfirmasi via WhatsApp Catering</span>
            </a>
            <p className="text-[11px] text-stone-400 mt-2">
              Klik tombol di atas untuk mengirim rincian pesanan langsung ke WhatsApp pemilik catering.
            </p>
          </div>
        </div>

        {/* Order Details Breakdown Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <span className="font-bold text-stone-800 text-sm">Rincian Acara & Pengiriman</span>
            <StatusBadge status={order.orderStatus} type="order" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-stone-600">
            <div className="space-y-1">
              <span className="text-stone-400 block">Jadwal Acara</span>
              <p className="font-semibold text-stone-900 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {order.eventDate}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 block">Jam Pengiriman</span>
              <p className="font-semibold text-stone-900 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {order.deliveryTime} WIB
              </p>
            </div>
            <div className="col-span-2 space-y-1 pt-1 border-t border-stone-100">
              <span className="text-stone-400 block">Alamat Pengiriman</span>
              <p className="font-medium text-stone-800 flex items-start">
                <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0 mt-0.5" />
                {order.deliveryAddress}
              </p>
            </div>
          </div>

          {/* Items list */}
          <div className="border-t border-stone-100 pt-3">
            <span className="font-bold text-stone-800 block mb-2">Paket Menu Dipesan:</span>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl">
                  <div>
                    <span className="font-semibold text-stone-900 block">{item.menuName}</span>
                    <span className="text-[11px] text-stone-500">
                      {item.quantity} porsi x Rp {item.unitPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="border-t border-stone-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Total Pesanan:</span>
              <span className="font-bold text-stone-900 text-sm">
                Rp {order.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-emerald-700 bg-emerald-50/70 p-2 rounded-lg">
              <span className="font-medium">Uang Muka (DP 50%):</span>
              <span className="font-bold">
                Rp {order.dpAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Sisa Pelunasan:</span>
              <span className="font-semibold text-stone-800">
                Rp {order.remainingAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Bank transfer info */}
          {tenant?.bankInfo && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 mt-2">
              <span className="font-bold text-amber-900 block mb-1">
                Informasi Rekening Pembayaran DP:
              </span>
              <p className="text-amber-950 font-mono text-[11px] leading-relaxed whitespace-pre-line">
                {tenant.bankInfo}
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={onBackToMenu}
            className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Kembali ke Halaman Menu
          </button>
        </div>
      </div>
    </div>
  );
};
