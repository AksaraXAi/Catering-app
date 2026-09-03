import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Settings,
  Share2,
  Copy,
  ExternalLink,
  Check,
  Building,
  Phone,
  MapPin,
  CreditCard,
  Upload,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { activeTenant, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeTenant) {
      setName(activeTenant.name || '');
      setSlug(activeTenant.slug || '');
      setDescription(activeTenant.description || '');
      setPhone(activeTenant.phone || '');
      setAddress(activeTenant.address || '');
      setBankInfo(activeTenant.bankInfo || '');
      setLogoUrl(activeTenant.logoUrl || '');
    }
  }, [activeTenant]);

  const publicUrl = `${window.location.origin}/catering/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenant) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.updateTenant(activeTenant.id, {
        name,
        slug,
        description,
        phone,
        address,
        bankInfo,
        logoUrl,
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        await refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengaturan profil catering');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 tracking-tight">
          Pengaturan Usaha Catering & Tautan Publik
        </h2>
        <p className="text-xs text-stone-500">
          Sesuaikan profil usaha, alamat, rekening bank untuk pembayaran DP, dan bagikan tautan website pemesanan
        </p>
      </div>

      {/* Shareable Public URL Card */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Share2 className="w-4 h-4" />
            <span>Tautan Halaman Pemesanan Pelanggan</span>
          </div>

          <h3 className="text-xl font-black tracking-tight">
            Bagikan link ini ke Instagram, WhatsApp, atau Brosur Anda
          </h3>

          <p className="text-xs text-emerald-100/80 leading-relaxed max-w-xl">
            Pelanggan cukup membuka tautan berikut untuk melihat paket menu, memilih porsi dan tanggal acara, serta langsung memesan secara online.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
            <div className="flex-1 bg-emerald-950/60 border border-emerald-700/50 px-4 py-2.5 rounded-xl font-mono text-xs text-emerald-200 select-all truncate">
              {publicUrl}
            </div>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center space-x-1.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Link</span>
                </>
              )}
            </button>

            <a
              href={`/catering/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition border border-emerald-600/50"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka Halaman</span>
            </a>
          </div>
        </div>
      </div>

      {/* Form Settings */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Nama Usaha Catering <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Slug URL Website <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="bg-stone-100 border border-r-0 border-stone-300 px-3 py-2.5 rounded-l-xl text-stone-500 font-mono text-xs">
                  /catering/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-r-xl text-stone-900 font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Slogan / Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Spesialis Nasi Box & Prasmanan Bersertifikat Halal..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Nomor WhatsApp Admin / CS <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">URL Logo Catering</label>
              <input
                type="text"
                placeholder="https://... atau biarkan kosong"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Alamat Dapur / Usaha Catering
            </label>
            <input
              type="text"
              placeholder="Jl. Mawar No. 12, Kelurahan, Kota..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Informasi Rekening Bank Pembayaran DP
            </label>
            <input
              type="text"
              placeholder="Contoh: BCA 1234567890 a.n Ibu Siti / Mandiri 987654321"
              value={bankInfo}
              onChange={(e) => setBankInfo(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Data ini otomatis tercetak pada invoice dan halaman sukses pemesanan pelanggan.
            </p>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-6 rounded-xl text-xs shadow-xs transition disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan Usaha'}
            </button>
            {saveSuccess && (
              <span className="text-emerald-700 font-bold text-xs flex items-center">
                <Check className="w-4 h-4 mr-1" />
                Pengaturan berhasil diperbarui!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
