import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Order, OrderStatus } from '../../types.ts';
import {
  TrendingUp,
  ShoppingBag,
  Calendar,
  AlertCircle,
  Clock,
  Printer,
  CreditCard,
  MessageCircle,
  Plus,
  ArrowRight,
  Truck,
  ChefHat,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge.tsx';
import { InvoiceModal } from '../../components/InvoiceModal.tsx';
import { RecordPaymentModal } from '../../components/RecordPaymentModal.tsx';

interface OverviewDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenNewOrderModal: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  onOpenNewOrderModal,
}) => {
  const { activeTenant } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTenant?.id]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await api.updateOrder(orderId, { orderStatus: newStatus });
      if (res.success) {
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status');
    }
  };

  // Metrics
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.eventDate === today);
  const inProgressOrders = orders.filter(
    (o) => o.orderStatus === 'IN_PROGRESS' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'NEW'
  );
  const totalOmzet = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPiutang = orders.reduce((sum, o) => sum + (o.remainingAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Today's Alert if orders exist today */}
      {todayOrders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Ada {todayOrders.length} Pesanan Catering Untuk Hari Ini ({today})!
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Pastikan jadwal produksi dapur dan armada pengiriman siap tepat waktu.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('production')}
              className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 text-xs font-bold rounded-xl hover:bg-amber-100 transition shadow-2xs"
            >
              Lihat Dapur Produksi
            </button>
            <button
              onClick={() => onNavigate('delivery')}
              className="px-3 py-1.5 bg-amber-700 text-white text-xs font-bold rounded-xl hover:bg-amber-800 transition shadow-2xs"
            >
              Jadwal Driver
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Omzet</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Rp {totalOmzet.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-stone-500 block">
            Dari {orders.length} transaksi pesanan
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Piutang Belum Lunas</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
            Rp {totalPiutang.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-stone-500 block">
            Sisa tagihan yang harus ditagihkan
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Order Hari Ini</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {todayOrders.length} Pesanan
          </p>
          <span className="text-[11px] text-stone-500 block">
            {todayOrders.reduce((sum, o) => sum + (o.items?.reduce((s, it) => s + it.quantity, 0) || 0), 0)} total box hari ini
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Perlu Diproses</span>
            <ChefHat className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
            {inProgressOrders.length} Order
          </p>
          <span className="text-[11px] text-stone-500 block">
            Status Baru, Konfirmasi, & Diproses
          </span>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenNewOrderModal}
          className="p-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Order Manual</span>
        </button>

        <button
          onClick={() => onNavigate('production')}
          className="p-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-2xs"
        >
          <ChefHat className="w-4 h-4 text-amber-600" />
          <span>Rekap Masak Dapur</span>
        </button>

        <button
          onClick={() => onNavigate('calendar')}
          className="p-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-2xs"
        >
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Kalender Beban Order</span>
        </button>

        <button
          onClick={() => onNavigate('delivery')}
          className="p-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-2xs"
        >
          <Truck className="w-4 h-4 text-teal-600" />
          <span>Jadwal Pengiriman</span>
        </button>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Pesanan Catering Terbaru</h3>
            <p className="text-[11px] text-stone-400">
              Daftar transaksi pesanan yang masuk ke sistem
            </p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>Semua Pesanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">No. Order</th>
                <th className="py-3 px-4">Tanggal & Jam Kirim</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Paket Menu</th>
                <th className="py-3 px-4">Total & DP</th>
                <th className="py-3 px-4">Status Bayar</th>
                <th className="py-3 px-4">Status Pesanan</th>
                <th className="py-3 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Memuat pesanan...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Belum ada pesanan yang tercatat.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 7).map((order) => {
                  const cleanWA = order.customerWhatsapp.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanWA}?text=${encodeURIComponent(
                    `Halo ${order.customerName}, kami dari ${activeTenant?.name || 'Catering'} terkait pesanan No. ${order.orderNumber}`
                  )}`;

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition">
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900">{order.eventDate}</div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          {order.deliveryTime} WIB
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">{order.customerName}</div>
                        <div className="text-[11px] text-stone-500 truncate max-w-xs">
                          {order.deliveryAddress}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {order.items?.map((it, idx) => (
                            <span key={idx} className="block text-stone-700 font-medium">
                              {it.menuName} ({it.quantity}x)
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-black text-stone-900">
                          Rp {order.totalAmount.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Sisa: Rp {(order.remainingAmount || 0).toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={order.paymentStatus} type="payment" />
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className="text-[11px] font-semibold bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 text-stone-800 focus:outline-hidden"
                        >
                          <option value="NEW">Baru</option>
                          <option value="CONFIRMED">Dikonfirmasi</option>
                          <option value="IN_PROGRESS">Diproses</option>
                          <option value="READY">Siap</option>
                          <option value="DELIVERED">Dikirim</option>
                          <option value="COMPLETED">Selesai</option>
                          <option value="CANCELLED">Dibatalkan</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            title="Cetak Nota / Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedOrderForPayment(order)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                            title="Catat Pembayaran"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                            title="Chat WhatsApp Pelanggan"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          tenant={activeTenant}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}

      {/* Record Payment Modal */}
      {selectedOrderForPayment && (
        <RecordPaymentModal
          order={selectedOrderForPayment}
          onClose={() => setSelectedOrderForPayment(null)}
          onPaymentSuccess={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};
