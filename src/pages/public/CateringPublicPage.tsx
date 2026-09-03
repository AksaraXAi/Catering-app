import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { Tenant, MenuItem, Order } from '../../types.ts';
import {
  ShoppingBag,
  Plus,
  Minus,
  MessageCircle,
  MapPin,
  Clock,
  Calendar,
  User,
  Phone,
  FileText,
  X,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { OrderSuccessPage } from './OrderSuccessPage.tsx';

interface CateringPublicPageProps {
  slug: string;
  onNavigateToLogin: () => void;
}

export const CateringPublicPage: React.FC<CateringPublicPageProps> = ({
  slug,
  onNavigateToLogin,
}) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cart: Map of menuId -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Form fields
  const [eventDate, setEventDate] = useState<string>('');
  const [deliveryTime, setDeliveryTime] = useState<string>('11:00');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [lookupNotice, setLookupNotice] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tenantRes = await api.getPublicTenant(slug);
        if (tenantRes.success && tenantRes.tenant) {
          setTenant(tenantRes.tenant);
        } else {
          setError('Catering tidak ditemukan.');
          setLoading(false);
          return;
        }

        const menusRes = await api.getPublicMenus(slug);
        if (menusRes.success) {
          setMenus(menusRes.menus || []);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat katalog menu catering.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // WhatsApp auto-lookup
  const handleWhatsappBlur = async () => {
    const clean = customerWhatsapp.replace(/[^0-9]/g, '');
    if (clean.length >= 10 && slug) {
      try {
        const res = await api.lookupCustomer(slug, clean);
        if (res.success && res.customer) {
          if (!customerName && res.customer.name) {
            setCustomerName(res.customer.name);
          }
          if (!deliveryAddress && res.customer.address) {
            setDeliveryAddress(res.customer.address);
          }
          setLookupNotice('Data nama & alamat Anda ditemukan dari pesanan sebelumnya!');
          setTimeout(() => setLookupNotice(null), 5000);
        }
      } catch (e) {
        // silent fail
      }
    }
  };

  const updateQuantity = (menuId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[menuId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[menuId];
        return copy;
      }
      return { ...prev, [menuId]: next };
    });
  };

  const setExactQuantity = (menuId: string, val: number) => {
    const next = Math.max(0, val);
    setCart((prev) => {
      if (next === 0) {
        const copy = { ...prev };
        delete copy[menuId];
        return copy;
      }
      return { ...prev, [menuId]: next };
    });
  };

  // Cart summary
  const selectedItems = Object.entries(cart).map(([menuId, quantity]) => {
    const qty = Number(quantity) || 0;
    const menu = menus.find((m) => m.id === menuId);
    return {
      menuId,
      menuName: menu?.name || 'Paket Menu',
      unitPrice: menu?.price || 0,
      quantity: qty,
      subtotal: (menu?.price || 0) * qty,
    };
  });

  const totalBoxes = selectedItems.reduce((acc: number, item) => acc + item.quantity, 0);
  const totalAmount = selectedItems.reduce((acc: number, item) => acc + item.subtotal, 0);
  const dpAmount = Math.round(totalAmount * 0.5);

  const categories = ['Semua', ...Array.from(new Set(menus.map((m) => m.category)))];
  const filteredMenus =
    selectedCategory === 'Semua'
      ? menus
      : menus.filter((m) => m.category === selectedCategory);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerWhatsapp || !deliveryAddress || !eventDate || !deliveryTime) {
      alert('Mohon lengkapi semua kolom wajib (Nama, WhatsApp, Tanggal Acara, Jam Kirim, Alamat).');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Pilih minimal satu paket menu.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await api.placeOrder({
        tenantSlug: slug,
        eventDate,
        deliveryTime,
        deliveryAddress,
        customerName,
        customerWhatsapp,
        notes,
        items: selectedItems,
      });

      if (res.success && res.order) {
        setCompletedOrder(res.order);
        setIsCheckoutOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim pesanan. Silakan coba lagi.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (completedOrder) {
    return (
      <OrderSuccessPage
        order={completedOrder}
        tenant={tenant}
        onBackToMenu={() => {
          setCompletedOrder(null);
          setCart({});
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">Memuat katalog menu catering...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <X className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Catering Tidak Ditemukan</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Halaman catering dengan alamat <strong>/catering/{slug}</strong> tidak tersedia atau belum diaktifkan.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition block mx-auto"
          >
            Masuk ke Panel Pemilik Catering &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 pb-28">
      {/* Top Bar with Owner Login */}
      <div className="bg-stone-900 text-stone-300 text-xs py-2 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="text-stone-400 font-medium">
            Layanan Pemesanan Online Resmi - {tenant.name}
          </span>
          <button
            onClick={onNavigateToLogin}
            className="inline-flex items-center text-stone-300 hover:text-white transition font-medium space-x-1"
          >
            <Lock className="w-3 h-3 text-stone-400" />
            <span>Login Pemilik / Staff</span>
          </button>
        </div>
      </div>

      {/* Hero / Header Usaha Catering */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Logo */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              {tenant.logo ? (
                <img
                  src={tenant.logo}
                  alt={tenant.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-3xl font-black text-emerald-700">
                  {tenant.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3 h-3 mr-1" /> Siap Melayani Pesanan Nasi Box & Hajatan
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                {tenant.name}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                {tenant.description || 'Penyedia masakan catering lezat, higienis, halal, dan tepat waktu.'}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs text-stone-600">
                {tenant.address && (
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    {tenant.address}
                  </span>
                )}
                {tenant.whatsapp && (
                  <a
                    href={`https://wa.me/${tenant.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-emerald-700 font-semibold hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    {tenant.whatsapp}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Categories Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {filteredMenus.map((menu) => {
            const qtyInCart = cart[menu.id] || 0;

            return (
              <div
                key={menu.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Photo */}
                  <div className="h-48 w-full bg-stone-100 relative overflow-hidden">
                    {menu.imageUrl ? (
                      <img
                        src={menu.imageUrl}
                        alt={menu.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 font-semibold text-xs">
                        Foto Menu Belum Ada
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                      {menu.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-stone-900 leading-snug">
                      {menu.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                      {menu.description || 'Pilihan paket lezat dengan racikan bumbu khas.'}
                    </p>
                  </div>
                </div>

                {/* Footer with Price and Quantity Controls */}
                <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between mt-3">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                      Harga / Porsi
                    </span>
                    <span className="text-base font-extrabold text-stone-900">
                      Rp {menu.price.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {qtyInCart > 0 ? (
                    <div className="flex items-center space-x-2 bg-stone-50 border border-stone-200 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(menu.id, -10)}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 transition shadow-2xs text-xs font-bold"
                        title="-10 porsi"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => updateQuantity(menu.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 transition shadow-2xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={qtyInCart}
                        onChange={(e) => setExactQuantity(menu.id, parseInt(e.target.value, 10) || 0)}
                        className="w-12 text-center text-xs font-bold text-stone-900 focus:outline-hidden bg-transparent"
                      />

                      <button
                        onClick={() => updateQuantity(menu.id, 1)}
                        className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateQuantity(menu.id, 10)}
                        className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition shadow-2xs text-xs font-bold"
                        title="+10 porsi"
                      >
                        +10
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => updateQuantity(menu.id, 25)} // Default minimum catering 25 box
                      className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pesan (25 box)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalBoxes > 0 && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-96 z-40">
          <div className="bg-stone-900 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between border border-stone-700">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-400">
                  {totalBoxes} Porsi Terpilih
                </span>
              </div>
              <span className="text-base font-black tracking-tight block text-white">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md"
            >
              <span>Lanjut Pesan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-sm">Formulir Pemesanan Catering</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitOrder} className="p-6 space-y-5 text-xs">
              {/* Selected items summary */}
              <div>
                <span className="font-bold text-stone-800 block mb-2">Paket Menu Terpilih:</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  {selectedItems.map((it) => (
                    <div key={it.menuId} className="flex justify-between items-center">
                      <span className="text-stone-700 font-medium">
                        {it.menuName} ({it.quantity} porsi)
                      </span>
                      <span className="font-bold text-stone-900">
                        Rp {it.subtotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Tanggal Acara <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={eventDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-800 font-medium"
                    />
                  </div>
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
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-800 font-medium"
                  />
                </div>
              </div>

              {/* WhatsApp (with auto-lookup) & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Nomor WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    onBlur={handleWhatsappBlur}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-800 font-medium"
                  />
                  {lookupNotice && (
                    <p className="text-[10px] text-emerald-600 mt-1 font-semibold">{lookupNotice}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Nama Pemesan / Instansi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap atau Perusahaan"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-800 font-medium"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Alamat Lengkap Pengiriman <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Alamat gedung, nama jalan, patokan, nomor rumah/kantor..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-800 font-medium"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Catatan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sambal dipisah, box warna putih, atau request lauk khusus..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-800 font-medium"
                />
              </div>

              {/* Price & DP Calculation */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-1.5">
                <div className="flex justify-between text-stone-700">
                  <span>Total Tagihan Pesanan:</span>
                  <span className="font-bold text-stone-900 text-sm">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Uang Muka (DP 50%):</span>
                  <span>Rp {dpAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-stone-600 text-[11px]">
                  <span>Sisa Pelunasan:</span>
                  <span>Rp {(totalAmount - dpAmount).toLocaleString('id-ID')}</span>
                </div>
                <p className="text-[10px] text-stone-500 pt-1 border-t border-emerald-200/60">
                  * Setelah mengirim pesanan, Anda akan diarahkan untuk konfirmasi langsung via WhatsApp dengan rincian pesanan dan nomor rekening.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
                >
                  {submittingOrder ? (
                    <span>Mengirim Pesanan...</span>
                  ) : (
                    <>
                      <span>Kirim Pesanan Sekarang</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
