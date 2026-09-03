import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { MenuItem, Ingredient, Recipe } from '../../types.ts';
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Image as ImageIcon,
  Check,
  X,
  Upload,
} from 'lucide-react';

export const MenusPage: React.FC = () => {
  const { activeTenant } = useAuth();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Nasi Box');
  const [formPrice, setFormPrice] = useState<number>(25000);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Recipe Modal states
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [activeMenuForRecipe, setActiveMenuForRecipe] = useState<MenuItem | null>(null);
  const [recipeItems, setRecipeItems] = useState<{ ingredientId: string; quantityNeeded: number }[]>([]);
  const [savingRecipe, setSavingRecipe] = useState(false);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await api.getMenus();
      if (res.success) {
        setMenus(res.menus || []);
      }
      const ingRes = await api.getIngredients();
      if (ingRes.success) {
        setIngredients(ingRes.ingredients || []);
      }
    } catch (err) {
      console.error('Failed to load menus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [activeTenant?.id]);

  const handleOpenAdd = () => {
    setEditingMenu(null);
    setFormName('');
    setFormCategory('Nasi Box');
    setFormPrice(25000);
    setFormDescription('');
    setFormImageUrl('');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    setFormName(menu.name);
    setFormCategory(menu.category);
    setFormPrice(menu.price);
    setFormDescription(menu.description || '');
    setFormImageUrl(menu.imageUrl || '');
    setFormActive(menu.active);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedUrl = await api.uploadImage(file);
      setFormImageUrl(uploadedUrl);
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah foto menu.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formPrice <= 0) {
      alert('Nama menu dan harga harus diisi!');
      return;
    }

    try {
      if (editingMenu) {
        await api.updateMenu(editingMenu.id, {
          name: formName,
          category: formCategory,
          price: formPrice,
          description: formDescription,
          imageUrl: formImageUrl,
          active: formActive,
        });
      } else {
        await api.createMenu({
          name: formName,
          category: formCategory,
          price: formPrice,
          description: formDescription,
          imageUrl: formImageUrl,
          active: formActive,
        });
      }
      setIsModalOpen(false);
      fetchMenus();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan menu');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus paket menu "${name}"?`)) return;
    try {
      await api.deleteMenu(id);
      fetchMenus();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus menu');
    }
  };

  // Recipe handlers
  const handleOpenRecipe = async (menu: MenuItem) => {
    setActiveMenuForRecipe(menu);
    setIsRecipeModalOpen(true);
    try {
      const res = await api.getRecipes(menu.id);
      if (res.success && res.recipes) {
        setRecipeItems(
          res.recipes.map((r: Recipe) => ({
            ingredientId: r.ingredientId,
            quantityNeeded: r.quantityNeeded,
          }))
        );
      } else {
        setRecipeItems([]);
      }
    } catch (err) {
      setRecipeItems([]);
    }
  };

  const handleAddRecipeRow = () => {
    if (ingredients.length === 0) {
      alert('Tambahkan daftar bahan baku di menu "Bahan & Resep" terlebih dahulu.');
      return;
    }
    setRecipeItems((prev) => [
      ...prev,
      {
        ingredientId: ingredients[0].id,
        quantityNeeded: 1,
      },
    ]);
  };

  const handleSaveRecipe = async () => {
    if (!activeMenuForRecipe) return;
    setSavingRecipe(true);
    try {
      await api.saveRecipes(activeMenuForRecipe.id, recipeItems);
      setIsRecipeModalOpen(false);
      alert('Resep takaran bahan berhasil disimpan!');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan resep');
    } finally {
      setSavingRecipe(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            Katalog Menu & Paket Catering
          </h2>
          <p className="text-xs text-stone-500">
            Kelola pilihan paket yang tampil di website pemesanan pelanggan dan tentukan resep bahannya
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Menu</span>
        </button>
      </div>

      {/* Grid of Menus */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-xs text-stone-400">
          Memuat menu...
        </div>
      ) : menus.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
          <p className="text-xs text-stone-500">Belum ada paket menu yang ditambahkan.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
          >
            Tambah Paket Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className={`bg-white rounded-3xl border ${
                menu.active ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50'
              } overflow-hidden shadow-2xs flex flex-col justify-between`}
            >
              <div>
                {/* Photo */}
                <div className="h-44 w-full bg-stone-100 relative overflow-hidden">
                  {menu.imageUrl ? (
                    <img
                      src={menu.imageUrl}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 font-semibold text-xs">
                      <ImageIcon className="w-8 h-8 opacity-40 mr-2" />
                      Belum Ada Foto
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-stone-900/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {menu.category}
                  </span>
                  {!menu.active && (
                    <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Nonaktif
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-stone-900 text-base leading-snug">
                      {menu.name}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {menu.description || 'Tidak ada deskripsi'}
                  </p>
                  <p className="text-base font-black text-emerald-700 pt-1">
                    Rp {menu.price.toLocaleString('id-ID')}{' '}
                    <span className="text-xs font-normal text-stone-500">/ porsi</span>
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenRecipe(menu)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-stone-700 hover:text-emerald-700 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs transition"
                  title="Atur Kebutuhan Bahan Resep"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Resep Bahan</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(menu)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition"
                    title="Edit Menu"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id, menu.name)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus Menu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Menu Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingMenu ? 'Edit Paket Menu' : 'Tambah Paket Menu Baru'}
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
                  Nama Paket Menu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nasi Box Ayam Bakar Madu"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Nasi Box">Nasi Box</option>
                    <option value="Snack Box">Snack Box</option>
                    <option value="Prasmanan">Prasmanan</option>
                    <option value="Hajatan">Hajatan / Syukuran</option>
                    <option value="Tumpeng">Tumpeng</option>
                    <option value="Minuman">Minuman & Dessert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Harga / Porsi (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Deskripsi Lauk & Isi Paket
                </label>
                <textarea
                  rows={3}
                  placeholder="Nasi putih, Ayam Bakar, Lalapan, Sambal Bajak, Tahu Tempe, Kerupuk..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900"
                />
              </div>

              {/* Image Upload & URL */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Foto Menu</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL Foto atau upload dari komputer"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                  <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer flex items-center shrink-0">
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    <span>{uploadingImage ? 'Mengunggah...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {formImageUrl && (
                  <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-stone-200">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="menuActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
                <label htmlFor="menuActive" className="text-stone-700 font-semibold cursor-pointer">
                  Tampilkan menu ini di halaman pemesanan pelanggan
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition text-xs mt-2"
              >
                {editingMenu ? 'Simpan Perubahan' : 'Buat Paket Menu'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Recipe Configuration Modal */}
      {isRecipeModalOpen && activeMenuForRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  Atur Resep Takaran Bahan per 1 Porsi
                </h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  {activeMenuForRecipe.name}
                </p>
              </div>
              <button
                onClick={() => setIsRecipeModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-stone-500 leading-relaxed text-[11px]">
                Masukkan takaran bahan baku yang dibutuhkan untuk membuat <strong>1 porsi / box</strong> menu ini. Sistem akan mengalikan takaran ini secara otomatis pada jadwal produksi harian.
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto bg-stone-50 p-3 rounded-2xl border border-stone-200">
                {recipeItems.map((row, idx) => {
                  const ing = ingredients.find((i) => i.id === row.ingredientId);
                  return (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-stone-200"
                    >
                      <select
                        value={row.ingredientId}
                        onChange={(e) => {
                          const copy = [...recipeItems];
                          copy[idx].ingredientId = e.target.value;
                          setRecipeItems(copy);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 text-xs"
                      >
                        {ingredients.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.unit})
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          step="any"
                          min="0.001"
                          value={row.quantityNeeded}
                          onChange={(e) => {
                            const copy = [...recipeItems];
                            copy[idx].quantityNeeded = parseFloat(e.target.value) || 0;
                            setRecipeItems(copy);
                          }}
                          className="w-20 px-2 py-1.5 border border-stone-300 rounded-lg text-center font-bold text-xs"
                        />
                        <span className="text-stone-500 text-[11px] w-12">{ing?.unit || ''}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setRecipeItems(recipeItems.filter((_, i) => i !== idx))}
                        className="p-1 text-stone-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {recipeItems.length === 0 && (
                  <p className="text-center py-4 text-stone-400 text-xs">
                    Belum ada takaran bahan. Klik "Tambah Bahan" di bawah.
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-1">
                <button
                  type="button"
                  onClick={handleAddRecipeRow}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Bahan</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveRecipe}
                  disabled={savingRecipe}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-5 rounded-xl text-xs shadow-xs transition disabled:opacity-50"
                >
                  {savingRecipe ? 'Menyimpan...' : 'Simpan Resep'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
