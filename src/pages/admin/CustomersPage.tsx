import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Customer } from '../../types.ts';
import { Users, Phone, MapPin, MessageCircle, ShoppingBag, Eye, X } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge.tsx';

export const CustomersPage: React.FC = () => {
  const { activeTenant } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers();
      if (res.success) {
        setCustomers(res.customers || []);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [activeTenant?.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 tracking-tight">
          Buku Pelanggan & Riwayat Pemesanan
        </h2>
        <p className="text-xs text-stone-500">
          Database kontak pelanggan setia, total frekuensi order, dan akumulasi nilai belanja
        </p>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Nomor WhatsApp</th>
                <th className="py-3 px-4">Alamat Terakhir</th>
                <th className="py-3 px-4 text-center">Jumlah Order</th>
                <th className="py-3 px-4 text-right">Total Belanja (LTV)</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    Belum ada data pelanggan yang tercatat.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const cleanWA = c.whatsapp.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanWA}?text=${encodeURIComponent(
                    `Halo ${c.name}, kami dari ${activeTenant?.name || 'Catering'}...`
                  )}`;

                  return (
                    <tr key={c.id} className="hover:bg-stone-50/50 transition">
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-700">
                        {c.whatsapp}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                        {c.address}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {c.totalOrders || 0} order
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-stone-900">
                        Rp {(c.totalSpent || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="inline-flex items-center px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg text-[11px]"
                            title="Lihat Riwayat Pesanan"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Riwayat
                          </button>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Chat WhatsApp"
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

      {/* Customer Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  Riwayat Pesanan Pelanggan
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {selectedCustomer.name} ({selectedCustomer.whatsapp})
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-stone-600 space-y-1">
                <p>📍 Alamat: <strong>{selectedCustomer.address}</strong></p>
                <p>💰 Akumulasi Belanja: <strong className="text-stone-900">Rp {(selectedCustomer.totalSpent || 0).toLocaleString('id-ID')}</strong></p>
              </div>

              <span className="font-bold text-stone-800 block pt-1">
                Daftar Transaksi Pesanan:
              </span>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  selectedCustomer.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200"
                    >
                      <div>
                        <span className="font-bold text-stone-900 block font-mono">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Tanggal Acara: {ord.eventDate}
                        </span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="font-black text-stone-900 block">
                          Rp {ord.totalAmount.toLocaleString('id-ID')}
                        </span>
                        <div className="flex items-center space-x-1 justify-end">
                          <StatusBadge status={ord.paymentStatus} type="payment" />
                          <StatusBadge status={ord.orderStatus} type="order" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-400 italic py-2">Belum ada pesanan terhubung.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
