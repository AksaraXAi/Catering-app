import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Ingredient } from '../../types.ts';
import { Plus, Edit2, Trash2, AlertTriangle, Boxes, X } from 'lucide-react';

export const IngredientsPage: React.FC = () => {
  const { activeTenant } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState<number>(10);
  const [minimumStock, setMinimumStock] = useState<number>(5);
  const [costPerUnit, setCostPerUnit] = useState<number>(15000);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const res = await api.getIngredients();
      if (res.success) {
        setIngredients(res.ingredients || []);
      }
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [activeTenant?.id]);

  const handleOpenAdd = () => {
    setEditingIngredient(null);
    setName('');
    setUnit('kg');
    setStock(10);
    setMinimumStock(5);
    setCostPerUnit(15000);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setName(ing.name);
    setUnit(ing.unit);
    setStock(ing.stock);
    setMinimumStock(ing.minimumStock);
    setCostPerUnit(ing.costPerUnit);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unit) {
      alert('Nama dan satuan bahan baku wajib diisi.');
      return;
    }

    try {
      if (editingIngredient) {
        await api.updateIngredient(editingIngredient.id, {
          name,
          unit,
          stock,
          minimumStock,
          costPerUnit,
        });
      } else {
        await api.createIngredient({
          name,
          unit,
          stock,
          minimumStock,
          costPerUnit,
        });
      }
      setIsModalOpen(false);
      fetchIngredients();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan bahan baku');
    }
  };

  const handleDelete = async (id: string, ingName: string) => {
    if (!window.confirm(`Hapus bahan baku "${ingName}"?`)) return;
    try {
      await api.deleteIngredient(id);
      fetchIngredients();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus bahan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            Inventori Bahan Baku & Stok Dapur
          </h2>
          <p className="text-xs text-stone-500">
            Kelola stok beras, daging, kemasan box, dan bahan masakan untuk kalkulasi belanja otomatis
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Bahan Baku</span>
        </button>
      </div>

      {/* Table of Ingredients */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Nama Bahan</th>
                <th className="py-3 px-4 text-center">Satuan</th>
                <th className="py-3 px-4 text-right">Stok Saat Ini</th>
                <th className="py-3 px-4 text-right">Batas Minimum Stok</th>
                <th className="py-3 px-4 text-right">Harga Beli / Satuan</th>
                <th className="py-3 px-4 text-center">Status Stok</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    Memuat inventori bahan...
                  </td>
                </tr>
              ) : ingredients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    Belum ada data bahan baku.
                  </td>
                </tr>
              ) : (
                ingredients.map((ing) => {
                  const isLow = ing.stock <= ing.minimumStock;
                  return (
                    <tr
                      key={ing.id}
                      className={`hover:bg-stone-50/50 transition ${
                        isLow ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-stone-900">{ing.name}</td>
                      <td className="py-3.5 px-4 text-center text-stone-600 font-medium">
                        {ing.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-stone-900 text-sm">
                        {ing.stock.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-stone-500">
                        {ing.minimumStock.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-stone-700 font-semibold">
                        Rp {ing.costPerUnit.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                            Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleOpenEdit(ing)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            title="Edit Bahan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ing.id, ing.name)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Bahan"
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

      {/* Add / Edit Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingIngredient ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nama Bahan Baku <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beras Ramos, Daging Ayam Fillet, Box Bento..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Satuan Takar</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="gram">gram</option>
                    <option value="liter">liter</option>
                    <option value="butir">butir</option>
                    <option value="potong">potong</option>
                    <option value="pcs">pcs / box</option>
                    <option value="ikat">ikat</option>
                    <option value="bungkus">bungkus</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Stok Saat Ini
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Batas Minimum Stok
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Harga Beli / Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition text-xs mt-2"
              >
                {editingIngredient ? 'Simpan Perubahan' : 'Tambah Bahan Baku'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
