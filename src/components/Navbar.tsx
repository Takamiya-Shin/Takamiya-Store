import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLink = (path: string) => {
    setMobileOpen(false);
    if (path.startsWith('/#')) {
      const targetId = path.slice(2);
      if (currentPath !== '/') {
        onNavigate('/');
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      } else {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    onNavigate(path);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    onNavigate('/');
  };

  const navLinkClass = (active: boolean) =>
    `text-sm font-medium transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
      active
        ? 'text-amber-400 border-amber-400'
        : 'text-zinc-300 border-transparent hover:text-white hover:border-zinc-700'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#262B38] bg-[#0B0D12]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLink('/');
          }}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
        >
          Takamiya Store
        </a>

        <nav className="hidden md:flex items-center gap-6" aria-label="Navigasi utama">
          <button
            type="button"
            onClick={() => handleLink('/')}
            className={navLinkClass(currentPath === '/')}
          >
            Katalog
          </button>
          <button
            type="button"
            onClick={() => handleLink('/#topup-workspace')}
            className={navLinkClass(false)}
          >
            Top-Up
          </button>
          <button
            type="button"
            onClick={() => handleLink('/riwayat')}
            className={navLinkClass(currentPath === '/riwayat')}
          >
            Riwayat
          </button>
          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={() => handleLink('/admin')}
              className={navLinkClass(currentPath === '/admin')}
            >
              Admin Panel
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-2 rounded-lg border border-[#262B38] bg-[#13161E] px-4 py-2 text-xs font-semibold text-zinc-100 hover:border-zinc-600 hover:bg-[#1A1E29] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title={`Login sebagai ${user.name} (${user.role})`}
            >
              <span className="max-w-[140px] truncate">{user.name}</span>
              <span aria-hidden="true" className="text-zinc-500">·</span>
              <LogOut className="h-3.5 w-3.5 text-amber-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleLink('/login')}
              className="hidden md:inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-[#0B0D12] hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Masuk
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#262B38] bg-[#13161E] text-zinc-200 hover:bg-[#1A1E29] cursor-pointer"
            aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#262B38] bg-[#0B0D12] px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleLink('/')}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-100 hover:bg-[#13161E]"
          >
            Katalog Game
          </button>
          <button
            type="button"
            onClick={() => handleLink('/#topup-workspace')}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-100 hover:bg-[#13161E]"
          >
            Mulai Top-Up
          </button>
          <button
            type="button"
            onClick={() => handleLink('/riwayat')}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-100 hover:bg-[#13161E]"
          >
            Riwayat Transaksi
          </button>
          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={() => handleLink('/admin')}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-amber-400 hover:bg-[#13161E]"
            >
              Panel Admin
            </button>
          )}

          <div className="pt-2 border-t border-[#262B38]">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                  <p className="truncate text-xs text-zinc-400">
                    {user.role === 'admin' ? 'Administrator' : 'Member'} · {user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-3 rounded-lg border border-[#262B38] bg-[#13161E] px-3 py-2 text-xs font-semibold text-zinc-100 hover:bg-[#1A1E29] whitespace-nowrap shrink-0"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleLink('/login')}
                  className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-[#0B0D12]"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => handleLink('/register')}
                  className="rounded-lg border border-[#262B38] bg-[#13161E] px-4 py-2.5 text-sm font-semibold text-zinc-100"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
