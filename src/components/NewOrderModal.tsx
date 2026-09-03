import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { MenuItem } from '../types.ts';
import { X, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface NewOrderModalProps {
  onClose: () => void;
  onOrderCreated: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ onClose, onOrderCreated }) => {
  const { activeTenant } = useAuth();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [eventDate, setEventDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [deliveryTime, setDeliveryTime] = useState<string>('11:00');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Selected order items
  const [items, setItems] = useState<{ menuId: string; menuName: string; unitPrice: number; quantity: number }[]>([]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await api.getMenus();
        if (res.success && res.menus) {
          setMenus(res.menus);
          if (res.menus.length > 0) {
            setItems([
              {
                menuId: res.menus[0].id,
                menuName: res.menus[0].name,
                unitPrice: res.menus[0].price,
                quantity: 50,
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch menus:', err);
      }
    };
    fetchMenus();
  }, []);

  const handleAddItem = () => {
    if (menus.length === 0) return;
    setItems((prev) => [
      ...prev,
      {
        menuId: menus[0].id,
        menuName: menus[0].name,
        unitPrice: menus[0].price,
        quantity: 25,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMenuChange = (index: number, menuId: string) => {
    const selected = menus.find((m) => m.id === menuId);
    if (!selected) return;
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        menuId: selected.id,
        menuName: selected.name,
        unitPrice: selected.price,
      };
      return copy;
    });
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: Math.max(1, quantity) };
      return copy;
    });
  };

  const totalAmount = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenant) return;
    if (!customerName || !customerWhatsapp || !deliveryAddress || !eventDate) {
      setError('Lengkapi semua data wajib!');
      return;
    }
    if (items.length === 0) {
      setError('Pilih minimal satu paket menu!');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.placeOrder({
        tenantSlug: activeTenant.slug,
        eventDate,
        deliveryTime,
        deliveryAddress,
        customerName,
        customerWhatsapp,
        notes,
        items,
      });

      if (res.success) {
        onOrderCreated();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-stone-900 text-sm">Input Pesanan Catering Manual</h3>
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

          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Nama Pemesan / Instansi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nama Bpk/Ibu atau Instansi"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="081234567890"
                value={customerWhatsapp}
                onChange={(e) => setCustomerWhatsapp(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Tanggal Acara <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Jam Pengiriman <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Alamat Lengkap Pengiriman <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Alamat acara / gedung / rumah penerima"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900"
            />
          </div>

          {/* Menu Items Picker */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-stone-800">Daftar Paket Menu & Porsi:</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah Paket
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-stone-200">
                  <select
                    value={item.menuId}
                    onChange={(e) => handleMenuChange(index, e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                  >
                    {menus.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} - Rp {m.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2 py-1.5 border border-stone-300 rounded-lg text-center font-bold text-xs"
                    />
                    <span className="text-stone-400 text-[11px]">porsi</span>
                  </div>

                  <span className="text-xs font-bold text-stone-900 w-24 text-right">
                    Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="p-1 text-stone-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Catatan Pesanan</label>
            <input
              type="text"
              placeholder="Catatan bumbu, lauk khusus, waktu drop, dll."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-900"
            />
          </div>

          {/* Total display */}
          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 flex justify-between items-center font-bold">
            <span className="text-stone-700">Total Tagihan:</span>
            <span className="text-base text-emerald-800">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition disabled:opacity-50 text-xs"
          >
            {loading ? 'Menyimpan...' : 'Simpan Pesanan'}
          </button>
        </form>
      </div>
    </div>
  );
};
