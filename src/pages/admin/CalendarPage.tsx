import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Order } from '../../types.ts';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar as CalendarIcon,
  Clock,
  Printer,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge.tsx';
import { InvoiceModal } from '../../components/InvoiceModal.tsx';

export const CalendarPage: React.FC = () => {
  const { activeTenant } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.getOrders();
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders for calendar:', err);
      }
    };
    fetchOrders();
  }, [activeTenant?.id]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map orders by eventDate: YYYY-MM-DD
  const ordersByDate = orders.reduce<Record<string, Order[]>>((acc, order) => {
    if (!acc[order.eventDate]) {
      acc[order.eventDate] = [];
    }
    acc[order.eventDate].push(order);
    return acc;
  }, {});

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const selectedDateOrders = ordersByDate[selectedDateStr] || [];
  const selectedDateTotalBoxes = selectedDateOrders.reduce(
    (sum, o) => sum + (o.items?.reduce((s, it) => s + it.quantity, 0) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            Kalender Acara & Kapasitas Dapur
          </h2>
          <p className="text-xs text-stone-500">
            Pantau sebaran tanggal pesanan dan deteksi beban produksi tinggi (overload)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-white border border-stone-200 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-50 transition shadow-2xs"
          >
            Hari Ini
          </button>
          <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={prevMonth}
              className="p-1 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-stone-900 min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50/70 text-center text-xs font-bold text-stone-500 py-2.5">
          <span>Min</span>
          <span>Sen</span>
          <span>Sel</span>
          <span>Rab</span>
          <span>Kam</span>
          <span>Jum</span>
          <span>Sab</span>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-100">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[110px] bg-stone-50/40 p-2" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNumber = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
            const dayOrders = ordersByDate[dateStr] || [];
            const isSelected = selectedDateStr === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            const totalBoxes = dayOrders.reduce(
              (sum, o) => sum + (o.items?.reduce((s, it) => s + it.quantity, 0) || 0),
              0
            );

            // Overload criteria: >= 150 boxes or >= 2 orders on same day
            const isOverload = totalBoxes >= 150 || dayOrders.length >= 2;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`min-h-[90px] sm:min-h-[110px] p-2 transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/60 ring-2 ring-emerald-600 ring-inset'
                    : isToday
                    ? 'bg-stone-50'
                    : 'hover:bg-stone-50/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-emerald-700 text-white'
                        : isSelected
                        ? 'text-emerald-900 font-black'
                        : 'text-stone-700'
                    }`}
                  >
                    {dayNumber}
                  </span>

                  {/* Overload Alert Badge */}
                  {isOverload && (
                    <span
                      title="Beban pesanan tinggi! Periksa kapasitas masak dapur Anda."
                      className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                    >
                      <AlertTriangle className="w-2.5 h-2.5 mr-0.5 text-amber-700" />
                      Padat
                    </span>
                  )}
                </div>

                {/* Day content indicators */}
                <div className="space-y-1 my-1">
                  {dayOrders.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-stone-900 bg-white p-1 rounded-lg border border-stone-200/80 shadow-2xs">
                        <span className="text-emerald-700">{dayOrders.length} Order</span>
                        <span className="text-stone-500 font-medium block">
                          {totalBoxes} box
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="h-1" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Pane of Selected Date */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
          <div>
            <span className="text-xs uppercase font-bold text-stone-400 tracking-wider">
              Detail Pesanan Tanggal Terpilih:
            </span>
            <h3 className="text-lg font-black text-stone-900 flex items-center mt-0.5">
              <CalendarIcon className="w-5 h-5 mr-2 text-emerald-700" />
              {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold text-stone-600">
              Total: <strong>{selectedDateOrders.length}</strong> pesanan
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-200">
              {selectedDateTotalBoxes} Box Makanan
            </span>
            {selectedDateTotalBoxes >= 150 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-300 flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-700" />
                Peringatan Kapasitas Dapur
              </span>
            )}
          </div>
        </div>

        {selectedDateOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            Tidak ada jadwal pesanan catering pada tanggal ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDateOrders.map((order) => (
              <div
                key={order.id}
                className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-stone-900 text-sm block">
                      {order.customerName}
                    </span>
                    <span className="text-stone-500 font-mono text-[11px]">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StatusBadge status={order.orderStatus} type="order" />
                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="p-1 text-stone-500 hover:text-stone-900 bg-white border border-stone-200 rounded-lg shadow-2xs"
                      title="Cetak Nota"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center text-stone-600 space-x-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-medium">Jam Kirim: {order.deliveryTime} WIB</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block text-[11px]">Menu:</span>
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-stone-700">
                      <span>• {it.menuName}</span>
                      <span className="font-bold text-emerald-800">{it.quantity} box</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1 text-stone-600">
                  <span>Alamat: {order.deliveryAddress}</span>
                  <span className="font-bold text-stone-900">
                    Rp {order.totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          tenant={activeTenant}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}
    </div>
  );
};
