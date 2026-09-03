import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { ReportsData } from '../../types.ts';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Award,
  CreditCard,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { activeTenant } = useAuth();
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.getReports();
      if (res.success && res.reports) {
        setData(res.reports);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTenant?.id]);

  const handleDownloadCsv = () => {
    // Download using link
    window.location.href = api.exportReportsCsvUrl();
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            Laporan Keuangan & Statistik Penjualan
          </h2>
          <p className="text-xs text-stone-500">
            Rekap omzet harian, mingguan, bulanan, menu terlaris, dan unduh data ke Excel/CSV
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Unduh Laporan CSV / Excel</span>
        </button>
      </div>

      {loading || !data ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-xs text-stone-400">
          Memuat laporan keuangan...
        </div>
      ) : (
        <>
          {/* Omzet Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Omzet Hari Ini
              </span>
              <p className="text-2xl font-black text-stone-900 tracking-tight">
                Rp {data.omzetHariIni.toLocaleString('id-ID')}
              </p>
              <span className="text-[11px] text-stone-500 block">Pesanan jadwal hari ini</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Omzet Minggu Ini
              </span>
              <p className="text-2xl font-black text-emerald-700 tracking-tight">
                Rp {data.omzetMingguIni.toLocaleString('id-ID')}
              </p>
              <span className="text-[11px] text-stone-500 block">7 hari terakhir</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Omzet Bulan Ini
              </span>
              <p className="text-2xl font-black text-stone-900 tracking-tight">
                Rp {data.omzetBulanIni.toLocaleString('id-ID')}
              </p>
              <span className="text-[11px] text-stone-500 block">Bulan berjalan</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Total Piutang Belum Lunas
              </span>
              <p className="text-2xl font-black text-rose-600 tracking-tight">
                Rp {data.totalPiutang.toLocaleString('id-ID')}
              </p>
              <span className="text-[11px] text-stone-500 block">Sisa tagihan pelanggan</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Best Sellers */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-stone-100">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-stone-900 text-sm">
                  Paket Menu Paling Banyak Dipesan (Best Sellers)
                </h3>
              </div>

              <div className="space-y-3">
                {data.popularMenus && data.popularMenus.length > 0 ? (
                  data.popularMenus.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-100"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-stone-900 text-xs block">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {item.portions} box terjual
                          </span>
                        </div>
                      </div>

                      <span className="font-black text-stone-900 text-xs">
                        Rp {item.totalSales.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 py-4 text-center">
                    Belum ada data penjualan menu.
                  </p>
                )}
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-stone-100">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-stone-900 text-sm">Distribusi Status Order</h3>
              </div>

              <div className="space-y-2 text-xs">
                {Object.entries(data.statusCounts || {}).map(([st, cnt]) => (
                  <div
                    key={st}
                    className="flex justify-between items-center p-2 rounded-xl bg-stone-50"
                  >
                    <span className="text-stone-600 font-medium">{st}</span>
                    <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded-lg border border-stone-200">
                      {cnt}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-100 text-xs space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Total Transaksi:</span>
                  <span className="font-bold text-stone-900">{data.totalOrders} order</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Dana Diterima Kas:</span>
                  <span className="font-bold text-emerald-700">
                    Rp {data.paymentSummary.totalReceived.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
