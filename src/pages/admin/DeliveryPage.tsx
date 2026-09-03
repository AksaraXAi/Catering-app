import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { DeliveryStatus } from '../../types.ts';
import {
  Truck,
  MapPin,
  MessageCircle,
  Clock,
  User,
  Phone,
  Save,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge.tsx';

export const DeliveryPage: React.FC = () => {
  const { activeTenant } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Draft state for drivers and status
  const [drafts, setDrafts] = useState<
    Record<
      string,
      { driverName: string; driverPhone: string; status: DeliveryStatus; notes: string }
    >
  >({});
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.getDeliveries(selectedDate);
      if (res.success) {
        setDeliveries(res.deliveries || []);

        const initialDrafts: Record<string, any> = {};
        (res.deliveries || []).forEach((d: any) => {
          initialDrafts[d.orderId] = {
            driverName: d.driverName || '',
            driverPhone: d.driverPhone || '',
            status: d.deliveryStatus || 'PENDING',
            notes: d.deliveryNotes || '',
          };
        });
        setDrafts(initialDrafts);
      }
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [activeTenant?.id, selectedDate]);

  const handleUpdateDelivery = async (orderId: string) => {
    const draft = drafts[orderId];
    if (!draft) return;

    setSavingOrderId(orderId);
    try {
      const res = await api.updateDelivery(orderId, {
        driverName: draft.driverName,
        driverPhone: draft.driverPhone,
        status: draft.status,
        notes: draft.notes,
      });
      if (res.success) {
        fetchDeliveries();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status pengiriman.');
    } finally {
      setSavingOrderId(null);
    }
  };

  const handleDraftChange = (orderId: string, field: string, val: string) => {
    setDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: val,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            Jadwal Pengiriman & Navigasi Kurir
          </h2>
          <p className="text-xs text-stone-500">
            Daftar pesanan siap antar, direct Google Maps panduan kurir, dan chat konfirmasi WhatsApp
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200'
            }`}
          >
            Hari Ini
          </button>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-stone-200 text-xs font-bold text-stone-800 rounded-xl shadow-2xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-xs text-stone-400">
          Memuat jadwal pengiriman...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-xs text-stone-400">
          Tidak ada pesanan catering yang dijadwalkan kirim pada {selectedDate}.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deliveries.map((item) => {
            const draft = drafts[item.orderId] || {
              driverName: item.driverName || '',
              driverPhone: item.driverPhone || '',
              status: item.deliveryStatus || 'PENDING',
              notes: item.deliveryNotes || '',
            };

            const totalBoxes = (item.items || []).reduce(
              (sum: number, it: any) => sum + it.quantity,
              0
            );

            return (
              <div
                key={item.orderId}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-mono text-stone-400 font-bold block">
                        {item.orderNumber}
                      </span>
                      <h3 className="text-base font-bold text-stone-900 mt-0.5">
                        {item.customerName}
                      </h3>
                    </div>
                    <StatusBadge status={draft.status} type="delivery" />
                  </div>

                  {/* Time & Boxes */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Jam Kirim: {item.deliveryTime} WIB
                    </span>
                    <span className="font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-xl">
                      📦 {totalBoxes} Box / Porsi
                    </span>
                    <span className="text-stone-500 font-medium">
                      Status Bayar: <strong className="text-stone-800">{item.paymentStatus}</strong>
                    </span>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2 text-xs">
                    <div className="flex items-start text-stone-700">
                      <MapPin className="w-4 h-4 text-emerald-700 mr-2 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">
                        {item.deliveryAddress}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-stone-500 italic pl-6">
                        Catatan: "{item.notes}"
                      </p>
                    )}

                    {/* Action Links: Google Maps & WhatsApp */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
                      <a
                        href={item.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition"
                      >
                        <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        Buka di Google Maps
                      </a>

                      <a
                        href={item.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Hubungi WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs space-y-1">
                    <span className="text-stone-400 font-bold uppercase text-[10px] tracking-wider block">
                      Paket yang Dibawa:
                    </span>
                    {item.items?.map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-stone-700 text-xs">
                        <span>• {it.menuName}</span>
                        <span className="font-bold">{it.quantity} box</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Driver Assignment & Status Controls */}
                <div className="pt-3 border-t border-stone-100 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        Nama Driver / Kurir
                      </label>
                      <input
                        type="text"
                        placeholder="Nama driver"
                        value={draft.driverName}
                        onChange={(e) =>
                          handleDraftChange(item.orderId, 'driverName', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        Status Pengiriman
                      </label>
                      <select
                        value={draft.status}
                        onChange={(e) =>
                          handleDraftChange(item.orderId, 'status', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-semibold"
                      >
                        <option value="PENDING">Menunggu Jadwal Kirim</option>
                        <option value="ON_THE_WAY">Dalam Perjalanan (Jalan)</option>
                        <option value="DELIVERED">Sampai / Selesai Kirim</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdateDelivery(item.orderId)}
                    disabled={savingOrderId === item.orderId}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>
                      {savingOrderId === item.orderId
                        ? 'Menyimpan...'
                        : 'Simpan Info Driver & Status Kirim'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
