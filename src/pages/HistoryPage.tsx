import { useEffect, useState } from 'react';
import { Loader2, Receipt, RefreshCw, X } from 'lucide-react';
import { DANA_ACCOUNT, QRIS_MERCHANT, formatRupiah } from '../data/catalog';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { OrderRecord, OrderStatus, PaymentSettings } from '../types/store';
import { QrisGraphic } from '../components/QrisGraphic';
import { StatusText } from '../components/StatusText';

interface HistoryPageProps {
  onNavigate: (path: string) => void;
}

type StatusFilter = 'Semua' | OrderStatus;

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function HistoryPage({ onNavigate }: HistoryPageProps) {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('Semua');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    danaNumber: DANA_ACCOUNT.number,
    danaHolder: DANA_ACCOUNT.holder,
    qrisMerchantName: QRIS_MERCHANT.name,
    qrisNmid: QRIS_MERCHANT.nmid,
    qrisImageUrl: null,
    updatedAt: '',
  });

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat riwayat transaksi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .getPaymentSettings()
      .then((res) => setPaymentSettings(res.settings))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      void fetchOrders();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-zinc-400">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-400" />
        <p className="mt-3 text-sm">Memuat sesi akun...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-lg px-4 py-16 text-center space-y-5">
        <div className="rounded-2xl border border-[#262B38] bg-[#13161E] p-8 space-y-4">
          <Receipt className="mx-auto h-10 w-10 text-amber-400" />
          <h1 className="font-display text-2xl font-bold text-white">Riwayat Transaksi Saya</h1>
          <p className="text-sm text-zinc-400">
            Silakan login terlebih dahulu untuk melihat daftar pesanan dan status top-up akun Anda.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-[#0B0D12] hover:bg-amber-400 cursor-pointer"
          >
            Masuk ke Akun
          </button>
        </div>
      </section>
    );
  }

  const filtered = filter === 'Semua' ? orders : orders.filter((o) => o.status === filter);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#262B38] pb-5">
        <div>
          <p className="text-xs font-semibold tracking-wider text-amber-400">
            Akun Member · {user.email}
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white">
            Riwayat Transaksi {user.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void fetchOrders()}
            className="inline-flex items-center gap-2 rounded-lg border border-[#262B38] bg-[#13161E] px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-[#1A1E29] cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
            <span>Muat Ulang</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-[#0B0D12] hover:bg-amber-400 cursor-pointer whitespace-nowrap shrink-0"
          >
            Top-Up Baru
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-[#13161E] p-1 border border-[#262B38] w-fit">
        {(['Semua', 'Pending', 'Sukses', 'Gagal'] as StatusFilter[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              filter === tab
                ? 'bg-amber-500 text-[#0B0D12]'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-12 text-center text-zinc-400">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-400" />
          <p className="mt-3 text-sm">Mengambil data transaksi...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-12 text-center space-y-3">
          <p className="font-display text-lg font-semibold text-white">
            Belum ada transaksi {filter !== 'Semua' ? `berstatus ${filter}` : ''}
          </p>
          <p className="text-sm text-zinc-400">
            Pilih game di katalog Takamiya Store untuk melakukan top-up pertama Anda.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-[#262B38] bg-[#13161E]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#262B38] bg-[#0B0D12]/60 text-xs font-semibold text-zinc-400">
                <tr>
                  <th className="px-4 py-3.5">Invoice</th>
                  <th className="px-4 py-3.5">Waktu</th>
                  <th className="px-4 py-3.5">Game & Produk</th>
                  <th className="px-4 py-3.5">Target Akun</th>
                  <th className="px-4 py-3.5">Metode</th>
                  <th className="px-4 py-3.5 text-right">Total</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262B38]">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#1A1E29]/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-white whitespace-nowrap">
                      {order.invoiceCode}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-zinc-400 whitespace-nowrap tabular-nums">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white">{order.gameName}</p>
                      <p className="text-xs text-zinc-400">{order.productName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-zinc-200">{order.targetNickname}</p>
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
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg border border-[#262B38] bg-[#0B0D12] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-amber-500 cursor-pointer whitespace-nowrap"
                      >
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrder(order)}
                className="w-full text-left rounded-xl border border-[#262B38] bg-[#13161E] p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-zinc-300">
                    {order.invoiceCode}
                  </span>
                  <StatusText status={order.status} />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-white">{order.gameName}</p>
                  <p className="text-xs text-zinc-400">
                    {order.productName} · {order.targetNickname}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-[#262B38] pt-2.5 text-xs">
                  <span className="text-zinc-400">{order.paymentMethod} · {formatDateTime(order.createdAt)}</span>
                  <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                    {formatRupiah(order.price)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Invoice Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-[#262B38] bg-[#13161E] p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-400">Detail Transaksi</p>
                <h2 className="font-mono text-lg font-bold text-white mt-0.5">
                  {selectedOrder.invoiceCode}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1A1E29] cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-[#262B38] bg-[#0B0D12] p-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Status</span>
                <StatusText status={selectedOrder.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Game</span>
                <span className="font-medium text-white">{selectedOrder.gameName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Produk</span>
                <span className="font-medium text-white">{selectedOrder.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Akun Game</span>
                <span className="font-medium text-emerald-300">
                  {selectedOrder.targetNickname} ({selectedOrder.targetAccountId})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Metode</span>
                <span className="font-medium text-white">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-[#262B38] pt-2.5">
                <span className="font-semibold text-white">Total</span>
                <span className="font-mono font-bold text-amber-400 tabular-nums">
                  {formatRupiah(selectedOrder.price)}
                </span>
              </div>
            </div>

            {selectedOrder.status === 'Pending' && selectedOrder.paymentMethod === 'QRIS' && (
              <QrisGraphic
                amount={selectedOrder.price}
                merchantName={paymentSettings.qrisMerchantName}
                nmid={paymentSettings.qrisNmid}
                imageUrl={paymentSettings.qrisImageUrl}
              />
            )}

            {selectedOrder.status === 'Pending' && selectedOrder.paymentMethod === 'DANA' && (
              <div className="rounded-xl border border-[#262B38] bg-[#1A1E29] p-4 text-xs space-y-1">
                <p className="text-zinc-400">Instruksi Transfer DANA:</p>
                <p className="font-mono text-sm font-bold text-white">{paymentSettings.danaNumber}</p>
                <p className="text-zinc-300">a.n. {paymentSettings.danaHolder}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
