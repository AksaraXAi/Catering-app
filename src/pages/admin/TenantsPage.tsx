import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Tenant } from '../../types.ts';
import { Building2, Plus, ExternalLink, Check, X, ShieldCheck } from 'lucide-react';

export const TenantsPage: React.FC = () => {
  const { user, activeTenant, switchTenant } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await api.getTenants();
      if (res.success) {
        setTenants(res.tenants || []);
      }
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      alert('Nama dan slug wajib diisi');
      return;
    }

    setCreating(true);
    try {
      const res = await api.createTenant({
        name,
        slug,
        ownerEmail: email,
        ownerPassword: password,
        phone,
        address,
      });

      if (res.success) {
        setIsModalOpen(false);
        setName('');
        setSlug('');
        setEmail('');
        setPassword('');
        setPhone('');
        setAddress('');
        fetchTenants();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan usaha catering baru');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Manajemen Usaha Catering (Multi-Tenant)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Daftar seluruh usaha catering yang terdaftar di platform white-label CateringApp
          </p>
        </div>

        {user?.role === 'SUPER_ADMIN' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Catering Baru</span>
          </button>
        )}
      </div>

      {/* Grid of Tenants */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-xs text-stone-400">
          Memuat data tenant...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((t) => {
            const isActive = activeTenant?.id === t.id;
            return (
              <div
                key={t.id}
                className={`bg-white rounded-3xl border ${
                  isActive ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-stone-200'
                } p-6 shadow-2xs space-y-4 flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                      /catering/{t.slug}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Check className="w-3 h-3 mr-1" />
                        Aktif
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-stone-900 leading-snug">
                    {t.name}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2">
                    {t.description || 'Tidak ada deskripsi usaha.'}
                  </p>

                  <div className="text-xs text-stone-600 space-y-1 pt-1">
                    <p>📞 WA: <strong>{t.phone || '-'}</strong></p>
                    <p className="truncate">📍 {t.address || '-'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => switchTenant(t.id)}
                    disabled={isActive}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-stone-100 text-stone-400 cursor-default'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    {isActive ? 'Sedang Dipilih' : 'Beralih ke Usaha Ini'}
                  </button>

                  <a
                    href={`/catering/${t.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-stone-500 hover:text-stone-900 border border-stone-200 rounded-xl hover:bg-stone-50"
                    title="Buka Website Pemesanan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h3 className="font-bold text-stone-900 text-sm">
                Daftarkan Usaha Catering Baru (Tenant)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Nama Catering <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Catering Bu Siti"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, '')
                            .replace(/[^a-z0-9]/g, '')
                        );
                      }
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Slug URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="busiti"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Email Pemilik / Akun</label>
                  <input
                    type="email"
                    placeholder="owner@busiti.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Password Awal</label>
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Alamat Usaha</label>
                <input
                  type="text"
                  placeholder="Kota / Alamat lengkap"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition text-xs disabled:opacity-50"
              >
                {creating ? 'Mendaftarkan...' : 'Daftarkan Usaha Catering'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
