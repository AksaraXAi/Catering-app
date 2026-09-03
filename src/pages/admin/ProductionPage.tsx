import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { ProductionSummary, ProductionStatus } from '../../types.ts';
import {
  ChefHat,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  ShoppingCart,
  Clock,
  Sparkles,
  Save,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge.tsx';

export const ProductionPage: React.FC = () => {
  const { activeTenant } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [data, setData] = useState<ProductionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ProductionStatus>('PENDING');
  const [kitchenNotes, setKitchenNotes] = useState<string>('');
  const [savingStatus, setSavingStatus] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const fetchProduction = async () => {
    setLoading(true);
    try {
      const res = await api.getProductionSummary(selectedDate);
      if (res.success) {
        setData(res);
        if (res.production) {
          setStatus(res.production.status || 'PENDING');
          setKitchenNotes(res.production.notes || '');
        }
      }
    } catch (err) {
      console.error('Error fetching production summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduction();
  }, [activeTenant?.id, selectedDate]);

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    setSaveSuccess(false);
    try {
      const res = await api.updateProductionStatus({
        date: selectedDate,
        status,
        notes: kitchenNotes,
      });
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchProduction();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan status produksi dapur.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDateQuickSelect = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const totalEstimatedCostToBuy = (data?.ingredientRequirements || []).reduce(
    (sum, ing) => sum + (ing.estimatedCost || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            Rekap Dapur & Kebutuhan Bahan
          </h2>
          <p className="text-xs text-stone-500">
            Kalkulasi otomatis porsi masakan dan bahan belanja berdasarkan resep paket catering
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDateQuickSelect(0)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
              selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => handleDateQuickSelect(1)}
            className="px-3 py-1.5 bg-white text-stone-700 border border-stone-200 text-xs font-bold rounded-xl hover:bg-stone-50 transition"
          >
            Besok
          </button>
          <button
            onClick={() => handleDateQuickSelect(2)}
            className="px-3 py-1.5 bg-white text-stone-700 border border-stone-200 text-xs font-bold rounded-xl hover:bg-stone-50 transition"
          >
            Lusa
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
          Memuat data produksi dapur...
        </div>
      ) : (
        <>
          {/* Summary Box & Kitchen Status Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Box Metric Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
              <span className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                Total Porsi Harus Dimasak
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-stone-900 tracking-tight">
                  {data?.totalBoxes || 0}
                </span>
                <span className="text-sm font-bold text-stone-500">Box / Porsi</span>
              </div>
              <p className="text-xs text-stone-500">
                Dari akumulasi <strong>{data?.totalOrders || 0}</strong> pesanan terkonfirmasi pada tanggal {selectedDate}
              </p>
            </div>

            {/* Menu breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
              <span className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                Rincian Menu Yang Dimasak
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {data?.menuBreakdown && data.menuBreakdown.length > 0 ? (
                  data.menuBreakdown.map((m) => (
                    <div
                      key={m.menuId}
                      className="flex justify-between items-center text-xs bg-stone-50 p-2 rounded-xl border border-stone-100"
                    >
                      <span className="font-semibold text-stone-800">{m.menuName}</span>
                      <span className="font-bold text-emerald-800 px-2 py-0.5 bg-emerald-50 rounded-lg">
                        {m.quantity} box
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 italic py-2">
                    Tidak ada pesanan menu untuk tanggal ini.
                  </p>
                )}
              </div>
            </div>

            {/* Status Dapur Controls */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                    Status Dapur
                  </span>
                  <StatusBadge status={status} type="production" />
                </div>
                <div className="space-y-2 mt-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductionStatus)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="PENDING">Belum Diproduksi</option>
                    <option value="IN_PROGRESS">Sedang Diproses (Dapur Memasak)</option>
                    <option value="COMPLETED">Selesai Masak & Packing</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Catatan koki / chef..."
                    value={kitchenNotes}
                    onChange={(e) => setKitchenNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={handleSaveStatus}
                  disabled={savingStatus}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingStatus ? 'Menyimpan...' : 'Perbarui Status Dapur'}</span>
                </button>
                {saveSuccess && (
                  <span className="text-emerald-600 text-xs font-bold flex items-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Automatic Ingredients Calculation Section */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Boxes className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-stone-900">
                    Kebutuhan Bahan Baku Masak
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Dihitung otomatis dari perkalian jumlah box x takaran resep masing-masing menu
                </p>
              </div>

              {totalEstimatedCostToBuy > 0 && (
                <div className="bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 text-xs">
                  <ShoppingCart className="w-4 h-4 text-rose-600" />
                  <div>
                    <span className="text-rose-700 font-semibold">Estimasi Belanja Bahan:</span>
                    <span className="font-bold text-rose-900 ml-1.5">
                      Rp {totalEstimatedCostToBuy.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-4">Nama Bahan</th>
                    <th className="py-3 px-4 text-center">Satuan</th>
                    <th className="py-3 px-4 text-right">Kebutuhan Masak</th>
                    <th className="py-3 px-4 text-right">Stok Gudang</th>
                    <th className="py-3 px-4 text-right">Kekurangan (Harus Beli)</th>
                    <th className="py-3 px-4 text-right">Harga / Satuan</th>
                    <th className="py-3 px-4 text-right">Estimasi Biaya Beli</th>
                    <th className="py-3 px-4 text-center">Kesiapan Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data?.ingredientRequirements && data.ingredientRequirements.length > 0 ? (
                    data.ingredientRequirements.map((ing) => {
                      const isDeficit = ing.deficit > 0;
                      return (
                        <tr
                          key={ing.ingredientId}
                          className={`hover:bg-stone-50/50 transition ${
                            isDeficit ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            {ing.name}
                          </td>
                          <td className="py-3.5 px-4 text-center text-stone-500 font-medium">
                            {ing.unit}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                            {ing.required.toLocaleString('id-ID')} {ing.unit}
                          </td>
                          <td className="py-3.5 px-4 text-right text-stone-600">
                            {ing.stock.toLocaleString('id-ID')} {ing.unit}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isDeficit ? (
                              <span className="font-extrabold text-rose-600">
                                -{ing.deficit.toLocaleString('id-ID')} {ing.unit}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold">Cukup</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right text-stone-500">
                            Rp {ing.costPerUnit.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                            {isDeficit ? (
                              <span className="text-rose-700">
                                Rp {ing.estimatedCost.toLocaleString('id-ID')}
                              </span>
                            ) : (
                              <span className="text-stone-400">Rp 0</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isDeficit ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                Kurang
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Aman
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-400">
                        Tidak ada kebutuhan bahan baku pada tanggal ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
