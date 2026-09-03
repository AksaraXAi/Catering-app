import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Order, OrderStatus } from '../../types.ts';
import {
  Search,
  Plus,
  Printer,
  CreditCard,
  MessageCircle,
  Trash2,
  Filter,
  Calendar,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge.tsx';
import { InvoiceModal } from '../../components/InvoiceModal.tsx';
import { RecordPaymentModal } from '../../components/RecordPaymentModal.tsx';
import { NewOrderModal } from '../../components/NewOrderModal.tsx';

export const OrdersPage: React.FC = () => {
  const { activeTenant } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        date: dateFilter || undefined,
        search: search || undefined,
      });
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
  }, [activeTenant?.id, statusFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await api.updateOrder(orderId, { orderStatus: newStatus });
      if (res.success) {
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status pesanan');
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Yakin ingin menghapus pesanan ${orderNumber}?`)) return;
    try {
      const res = await api.deleteOrder(orderId);
      if (res.success) {
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus order');
    }
  };

  const statusTabs = [
    { id: 'ALL', label: 'Semua Status' },
    { id: 'NEW', label: 'Baru' },
    { id: 'CONFIRMED', label: 'Dikonfirmasi' },
    { id: 'IN_PROGRESS', label: 'Diproses' },
    { id: 'READY', label: 'Siap' },
    { id: 'DELIVERED', label: 'Dikirim' },
    { id: 'COMPLETED', label: 'Selesai' },
    { id: 'CANCELLED', label: 'Batal' },
  ];

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            Kelola Pesanan Catering
          </h2>
          <p className="text-xs text-stone-500">
            Daftar lengkap seluruh pesanan catering masuk dan statusnya
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pesanan Manual</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Date Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nomor order, nama pelanggan, atau alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-20 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-stone-800 text-white text-[11px] font-semibold rounded-lg hover:bg-stone-900"
            >
              Cari
            </button>
          </form>

          <div className="relative">
            <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 text-xs font-bold"
                title="Hapus Filter Tanggal"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">No. Order</th>
                <th className="py-3 px-4">Jadwal Acara & Kirim</th>
                <th className="py-3 px-4">Pelanggan & Alamat</th>
                <th className="py-3 px-4">Rincian Paket Menu</th>
                <th className="py-3 px-4">Total & Sisa</th>
                <th className="py-3 px-4">Status Bayar</th>
                <th className="py-3 px-4">Status Pesanan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    Memuat pesanan...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    Tidak ada pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const cleanWA = order.customerWhatsapp.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanWA}?text=${encodeURIComponent(
                    `Halo Bpk/Ibu ${order.customerName}, kami dari ${activeTenant?.name || 'Catering'} terkait pesanan No. ${order.orderNumber}`
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
                        <div className="text-[11px] text-stone-600">{order.customerWhatsapp}</div>
                        <div className="text-[11px] text-stone-400 truncate max-w-xs mt-0.5">
                          {order.deliveryAddress}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {order.items?.map((it, idx) => (
                            <span key={idx} className="block text-stone-800 font-medium">
                              • {it.menuName} <strong className="text-emerald-700">({it.quantity} box)</strong>
                            </span>
                          ))}
                        </div>
                        {order.notes && (
                          <span className="block text-[10px] text-stone-500 italic mt-1 bg-stone-50 p-1 rounded">
                            Catatan: {order.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-black text-stone-900">
                          Rp {order.totalAmount.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          DP: Rp {order.dpAmount.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] font-semibold text-rose-600">
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
                          <button
                            onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Pesanan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
          onPaymentSuccess={() => fetchOrders()}
        />
      )}

      {/* New Order Modal */}
      {isNewOrderModalOpen && (
        <NewOrderModal
          onClose={() => setIsNewOrderModalOpen(false)}
          onOrderCreated={() => fetchOrders()}
        />
      )}
    </div>
  );
};
