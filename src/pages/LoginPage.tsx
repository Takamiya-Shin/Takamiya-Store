import React, { useState } from 'react';
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (path: string) => void;
  notice?: string;
}

export function LoginPage({ onNavigate, notice }: LoginPageProps) {
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
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'admin') {
        onNavigate('/admin');
      } else {
        onNavigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk ke akun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 sm:px-6 py-12 sm:py-20">
      <div className="rounded-2xl border border-[#262B38] bg-[#13161E] p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-wider text-amber-400">Takamiya Store</p>
          <h1 className="font-display text-2xl font-bold text-white">Masuk ke Akun Anda</h1>
          <p className="text-sm text-zinc-400">
            Kelola pesanan top-up dan pantau status transaksi secara langsung.
          </p>
        </div>

        {notice && (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200">
            {notice}
          </p>
        )}

        {error && (
          <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-lg border border-[#262B38] bg-[#0B0D12] pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-lg border border-[#262B38] bg-[#0B0D12] pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-[#0B0D12] hover:bg-amber-400 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="border-t border-[#262B38] pt-5 text-center text-sm text-zinc-400">
          Belum punya akun?{' '}
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
          >
            Daftar di sini
          </button>
        </p>
      </div>
    </section>
  );
}
