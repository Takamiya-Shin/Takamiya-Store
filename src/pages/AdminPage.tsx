import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { formatRupiah } from '../data/catalog';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { AdminStats, OrderRecord, OrderStatus } from '../types/store';
import { PaymentSettingsPanel } from '../components/PaymentSettingsPanel';
import { StatusText } from '../components/StatusText';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

type StatusFilter = 'Semua' | OrderStatus;
type AdminTab = 'orders' | 'payment';

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  const fetchAdminData = async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminOrders();
      setOrders(res.orders);
      setStats(res.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      void fetchAdminData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      await fetchAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui status pesanan.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-zinc-400">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-400" />
        <p className="mt-3 text-sm">Memverifikasi hak akses administrator...</p>
      </div>
    );
  }

  // Strict RBAC Guard 1: Guest -> Redirect / Prompt to Login
  if (!user) {
    return (
      <section className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border border-[#262B38] bg-[#13161E] p-8 space-y-4">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-400" />
          <h1 className="font-display text-2xl font-bold text-white">Autentikasi Diperlukan</h1>
          <p className="text-sm text-zinc-400">
            Halaman Panel Admin Takamiya Store hanya dapat diakses oleh Administrator terverifikasi.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-[#0B0D12] hover:bg-amber-400 cursor-pointer"
          >
            Masuk sebagai Admin
          </button>
        </div>
      </section>
    );
  }

  // Strict RBAC Guard 2: Non-Admin User -> 403 Forbidden
  if (user.role !== 'admin') {
    return (
      <section className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border border-rose-500/40 bg-[#13161E] p-8 space-y-4">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-400" />
          <p className="font-mono text-xs font-semibold text-rose-400">HTTP 403 · AKSES DITOLAK</p>
          <h1 className="font-display text-2xl font-bold text-white">
            Halaman Khusus Administrator
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Akun Anda (<span className="text-zinc-200">{user.email}</span>) terdaftar dengan hak akses{' '}
            <strong className="text-white">User Biasa</strong> dan dilarang keras mengakses halaman{' '}
            <code className="font-mono text-rose-300">/admin</code>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-[#0B0D12] hover:bg-amber-400 cursor-pointer"
            >
              Kembali ke Katalog
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/riwayat')}
              className="rounded-lg border border-[#262B38] bg-[#1A1E29] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#222836] cursor-pointer"
            >
              Riwayat Transaksi Saya
            </button>
          </div>
        </div>
      </section>
    );
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'Semua' || order.status === statusFilter;
    const matchesQuery =
      !normalizedQuery ||
      order.invoiceCode.toLowerCase().includes(normalizedQuery) ||
      order.userName.toLowerCase().includes(normalizedQuery) ||
      order.userEmail.toLowerCase().includes(normalizedQuery) ||
      order.gameName.toLowerCase().includes(normalizedQuery) ||
      order.targetNickname.toLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesQuery;
  });

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#262B38] pb-5">
        <div>
          <p className="text-xs font-semibold tracking-wider text-amber-400">
            Takamiya Store · Panel Administrator
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white">
            Manajemen Pesanan Masuk
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void fetchAdminData()}
          className="inline-flex items-center gap-2 rounded-lg border border-[#262B38] bg-[#13161E] px-4 py-2 text-xs font-semibold text-zinc-100 hover:bg-[#1A1E29] cursor-pointer w-fit whitespace-nowrap shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Admin Section Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-[#13161E] p-1 border border-[#262B38] w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-[#0B0D12]'
              : 'text-zinc-300 hover:text-white'
          }`}
        >
          Pesanan Masuk
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'payment'
              ? 'bg-amber-500 text-[#0B0D12]'
              : 'text-zinc-300 hover:text-white'
          }`}
        >
          Pengaturan DANA & QRIS
        </button>
      </div>

      {activeTab === 'payment' ? (
        <PaymentSettingsPanel />
      ) : (
        <>

      {/* 4-Column KPI Strip */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-5">
            <p className="text-xs text-zinc-400">Total Pesanan</p>
            <p className="mt-2 font-display text-2xl font-bold text-white tabular-nums">
              {stats.totalOrders}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{stats.totalUsers} member terdaftar</p>
          </div>
          <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-5">
            <p className="text-xs text-zinc-400">Menunggu Verifikasi</p>
            <p className="mt-2 font-display text-2xl font-bold text-amber-400 tabular-nums">
              {stats.pendingOrders}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Perlu konfirmasi pembayaran</p>
          </div>
          <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-5">
            <p className="text-xs text-zinc-400">Transaksi Sukses</p>
            <p className="mt-2 font-display text-2xl font-bold text-emerald-400 tabular-nums">
              {stats.successOrders}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{stats.failedOrders} ditolak / gagal</p>
          </div>
          <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-5">
            <p className="text-xs text-zinc-400">Omzet Terverifikasi</p>
            <p className="mt-2 font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
              {formatRupiah(stats.totalRevenue)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Akumulasi status Sukses</p>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-[#13161E] p-1 border border-[#262B38] w-fit">
          {(['Semua', 'Pending', 'Sukses', 'Gagal'] as StatusFilter[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === tab
                  ? 'bg-amber-500 text-[#0B0D12]'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari invoice, email, game, nickname..."
            className="w-full rounded-lg border border-[#262B38] bg-[#13161E] pl-10 pr-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-12 text-center text-zinc-400">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-400" />
          <p className="mt-3 text-sm">Memuat seluruh pesanan masuk...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-12 text-center text-zinc-400">
          Tidak ada pesanan yang sesuai filter saat ini.
        </div>
      ) : (
        <>
          {/* Desktop Admin Table */}
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-[#262B38] bg-[#13161E]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#262B38] bg-[#0B0D12]/60 text-xs font-semibold text-zinc-400">
                <tr>
                  <th className="px-4 py-3.5">Invoice & Waktu</th>
                  <th className="px-4 py-3.5">Pembeli</th>
                  <th className="px-4 py-3.5">Game & Produk</th>
                  <th className="px-4 py-3.5">Akun Tujuan</th>
                  <th className="px-4 py-3.5">Bayar</th>
                  <th className="px-4 py-3.5 text-right">Total</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262B38]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#1A1E29]/60 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-mono text-xs font-semibold text-white">
                        {order.invoiceCode}
                      </p>
                      <p className="text-[11px] text-zinc-400 tabular-nums mt-0.5">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white">{order.userName}</p>
                      <p className="text-xs text-zinc-400">{order.userEmail}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white">{order.gameName}</p>
                      <p className="text-xs text-zinc-400">{order.productName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-emerald-300">{order.targetNickname}</p>
                      <p className="font-mono text-xs text-zinc-400">
                        {order.targetAccountId}
                        {order.targetServerId ? ` (${order.targetServerId})` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-zinc-300">
                      {order.paymentMethod}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-amber-400 tabular-nums whitespace-nowrap">
                      {formatRupiah(order.price)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusText status={order.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={updatingId === order.id || order.status === 'Sukses'}
                          onClick={() => void handleStatusChange(order.id, 'Sukses')}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Sukses</span>
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === order.id || order.status === 'Gagal'}
                          onClick={() => void handleStatusChange(order.id, 'Gagal')}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 border border-rose-500/40 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 disabled:opacity-40 cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Gagal</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Admin Cards */}
          <div className="lg:hidden space-y-3.5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-[#262B38] bg-[#13161E] p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs font-semibold text-white">{order.invoiceCode}</p>
                    <p className="text-[11px] text-zinc-400">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <StatusText status={order.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-zinc-500">Pembeli</p>
                    <p className="font-medium text-white truncate">{order.userName}</p>
                    <p className="text-zinc-400 truncate">{order.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Akun Tujuan</p>
                    <p className="font-medium text-emerald-300 truncate">{order.targetNickname}</p>
                    <p className="font-mono text-zinc-400 truncate">{order.targetAccountId}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#262B38] pt-3">
                  <div>
                    <p className="text-xs font-semibold text-white">{order.gameName}</p>
                    <p className="text-xs text-zinc-400">
                      {order.productName} · {order.paymentMethod}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                    {formatRupiah(order.price)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={updatingId === order.id || order.status === 'Sukses'}
                    onClick={() => void handleStatusChange(order.id, 'Sukses')}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 disabled:opacity-40"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verifikasi Sukses</span>
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === order.id || order.status === 'Gagal'}
                    onClick={() => void handleStatusChange(order.id, 'Gagal')}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-500/15 border border-rose-500/40 px-3 py-2 text-xs font-semibold text-rose-300 disabled:opacity-40"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Tolak / Gagal</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
        </>
      )}
    </section>
  );
}
