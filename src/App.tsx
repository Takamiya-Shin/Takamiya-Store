import { useCallback, useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AdminPage } from './pages/AdminPage';
import { HistoryPage } from './pages/HistoryPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname || '/';
}

function AppShell() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    const next = normalizePath(path);
    if (next !== normalizePath(window.location.pathname)) {
      window.history.pushState({}, '', next);
    }
    setCurrentPath(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const renderPage = () => {
    if (currentPath === '/') {
      return <HomePage onNavigate={navigate} />;
    }
    if (currentPath === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <RegisterPage onNavigate={navigate} />;
    }
    if (currentPath === '/riwayat') {
      return <HistoryPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin') {
      return <AdminPage onNavigate={navigate} />;
    }

    return (
      <section className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <p className="font-mono text-xs font-semibold text-amber-400">404</p>
        <h1 className="font-display text-2xl font-bold text-white">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-zinc-400">
          Alamat yang Anda buka tidak tersedia di Takamiya Store.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-[#0B0D12] hover:bg-amber-400 cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </section>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D12] text-[#F3F4F6]">
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      <main className="flex-1">{renderPage()}</main>

      <footer className="border-t border-[#262B38] bg-[#0B0D12]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-white">Takamiya Store</span>
            <span aria-hidden="true">·</span>
            <span>Platform Top-Up Game Digital Resmi</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Katalog
            </button>
            <button
              type="button"
              onClick={() => navigate('/riwayat')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Riwayat
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Masuk
            </button>
            <span>© 2026 Takamiya Store</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
