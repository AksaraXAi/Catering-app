import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

interface LoginPageProps {
  onBackToCustomerView?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToCustomerView }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-14 h-14 bg-emerald-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md font-bold text-2xl">
          C
        </div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">
          CateringApp Manager
        </h2>
        <p className="text-xs text-stone-500">
          Masuk ke Dashboard Manajemen Usaha Catering Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-stone-200 rounded-3xl space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Email Akun</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@catering.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-800 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center space-x-2 text-xs"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Credentials */}
          <div className="border-t border-stone-100 pt-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block text-center">
              Akun Demo Siap Pakai:
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('busiti@catering.com')}
                className="flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition"
              >
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Ibu Siti (Pemilik Catering)</p>
                    <p className="text-[10px] text-emerald-800">busiti@catering.com / password123</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  Gunakan
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@cateringapp.com')}
                className="flex items-center justify-between p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-left transition"
              >
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-stone-700" />
                  <div>
                    <p className="text-xs font-bold text-stone-900">Super Administrator</p>
                    <p className="text-[10px] text-stone-600">admin@cateringapp.com / password123</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-stone-700 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                  Gunakan
                </span>
              </button>
            </div>
          </div>

          {onBackToCustomerView && (
            <div className="text-center pt-2">
              <button
                onClick={onBackToCustomerView}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
              >
                &larr; Kembali ke Halaman Pemesanan Pelanggan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
