import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Search,
  ShieldAlert,
  Smartphone,
  QrCode,
  X,
} from 'lucide-react';
import { ALL_PRODUCTS, DANA_ACCOUNT, GAME_CATALOG, QRIS_MERCHANT, formatRupiah } from '../data/catalog';
import { GAME_ART } from '../data/gameArt';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { CheckIdResult, GameId, OrderRecord, PaymentMethod, PaymentSettings, ProductItem } from '../types/store';
import { CurrencyIcon } from './CurrencyIcon';
import { QrisGraphic } from './QrisGraphic';
import { StatusText } from './StatusText';

interface TopUpWorkspaceProps {
  onNavigate: (path: string) => void;
}

const DRAFT_STORAGE_KEY = 'takamiya_topup_draft';

const SAMPLE_IDS: Record<GameId, { accountId: string; serverId?: string }> = {
  'mobile-legends': { accountId: '184920145', serverId: '2914' },
  'free-fire': { accountId: '2091847210' },
  'genshin-impact': { accountId: '809412837', serverId: 'Asia' },
  'wuthering-waves': { accountId: '902481920', serverId: 'SEA' },
  'neverness-to-everness': { accountId: '702918345', serverId: 'Asia-Pacific' },
};

export function TopUpWorkspace({ onNavigate }: TopUpWorkspaceProps) {
  const { user } = useAuth();
  const [selectedGameId, setSelectedGameId] = useState<GameId>('mobile-legends');
  const activeGame = GAME_CATALOG.find((g) => g.id === selectedGameId) || GAME_CATALOG[0];

  const [selectedProductId, setSelectedProductId] = useState<string>(activeGame.products[0].id);
  const [accountId, setAccountId] = useState('');
  const [serverId, setServerId] = useState(activeGame.serverOptions?.[0] || '');
  const [checkingId, setCheckingId] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckIdResult | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [copiedDana, setCopiedDana] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    danaNumber: DANA_ACCOUNT.number,
    danaHolder: DANA_ACCOUNT.holder,
    qrisMerchantName: QRIS_MERCHANT.name,
    qrisNmid: QRIS_MERCHANT.nmid,
    qrisImageUrl: null,
    updatedAt: '',
  });

  const [products, setProducts] = useState<ProductItem[]>(ALL_PRODUCTS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);
  const [tableFilterGame, setTableFilterGame] = useState<'all' | GameId>('all');

  const idInputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .getProducts()
      .then((res) => {
        if (res.products.length > 0) {
          setProducts(res.products);
        }
      })
      .catch(() => {
        // Fallback to local catalog if offline
      });
    api
      .getPaymentSettings()
      .then((res) => setPaymentSettings(res.settings))
      .catch(() => {
        // Keep default payment settings if fetch fails
      });
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as {
          gameId?: GameId;
          productId?: string;
          accountId?: string;
          serverId?: string;
          paymentMethod?: PaymentMethod;
        };
        if (draft.gameId && GAME_CATALOG.some((g) => g.id === draft.gameId)) {
          const g = GAME_CATALOG.find((item) => item.id === draft.gameId)!;
          setSelectedGameId(g.id);
          setSelectedProductId(
            draft.productId && g.products.some((p) => p.id === draft.productId)
              ? draft.productId
              : g.products[0].id
          );
          if (draft.accountId) setAccountId(draft.accountId);
          if (draft.serverId) setServerId(draft.serverId);
          if (draft.paymentMethod) setPaymentMethod(draft.paymentMethod);
        }
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch {
      // Ignore draft restore issues
    }
  }, []);

  const activeGameProducts = products.filter((p) => p.gameId === activeGame.id);
  const effectiveGameProducts =
    activeGameProducts.length > 0 ? activeGameProducts : activeGame.products;

  const selectedProduct =
    effectiveGameProducts.find((p) => p.id === selectedProductId) || effectiveGameProducts[0];

  const handleSelectGame = (gameId: GameId) => {
    const nextGame = GAME_CATALOG.find((g) => g.id === gameId) || GAME_CATALOG[0];
    const nextProducts = products.filter((p) => p.gameId === nextGame.id);
    setSelectedGameId(nextGame.id);
    setSelectedProductId((nextProducts[0] || nextGame.products[0]).id);
    setAccountId('');
    setServerId(nextGame.serverOptions?.[0] || '');
    setCheckResult(null);
    setSubmitError(null);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setSubmitError(null);
    if (!checkResult?.valid) {
      idInputRef.current?.focus();
    }
  };

  const handleAccountChange = (val: string) => {
    setAccountId(val.replace(/\s+/g, ''));
    if (checkResult) setCheckResult(null);
    setSubmitError(null);
  };

  const handleServerChange = (val: string) => {
    setServerId(val);
    if (checkResult) setCheckResult(null);
    setSubmitError(null);
  };

  const runCheckId = async (overrideAccount?: string, overrideServer?: string) => {
    const targetAcc = (overrideAccount ?? accountId).trim();
    const targetSrv = (overrideServer ?? serverId).trim();
    if (!targetAcc) {
      setCheckResult({
        valid: false,
        message: `Masukkan ${activeGame.idLabel} terlebih dahulu.`,
      });
      return;
    }

    setCheckingId(true);
    setSubmitError(null);
    try {
      const result = await api.checkId(activeGame.id, targetAcc, targetSrv);
      setCheckResult(result);
    } catch (err) {
      setCheckResult({
        valid: false,
        message: err instanceof Error ? err.message : 'Gagal memeriksa ID akun.',
      });
    } finally {
      setCheckingId(false);
    }
  };

  const handleFillSample = () => {
    const sample = SAMPLE_IDS[activeGame.id];
    setAccountId(sample.accountId);
    setServerId(sample.serverId || '');
    void runCheckId(sample.accountId, sample.serverId || '');
  };

  const handleCopyDana = async () => {
    try {
      const cleanNumber = paymentSettings.danaNumber.replace(/[^0-9+]/g, '');
      await navigator.clipboard.writeText(cleanNumber || paymentSettings.danaNumber);
      setCopiedDana(true);
      setTimeout(() => setCopiedDana(false), 2000);
    } catch {
      setCopiedDana(false);
    }
  };

  const saveDraftAndRedirect = (targetPath: '/login' | '/register') => {
    try {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          gameId: activeGame.id,
          productId: selectedProduct.id,
          accountId,
          serverId,
          paymentMethod,
        })
      );
    } catch {
      // Ignore storage error
    }
    onNavigate(targetPath);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!user) {
      saveDraftAndRedirect('/login');
      return;
    }

    if (!checkResult?.valid) {
      setSubmitError('Silakan cek dan pastikan ID akun tervalidasi terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createOrder({
        gameId: activeGame.id,
        productId: selectedProduct.id,
        targetAccountId: accountId.trim(),
        targetServerId: activeGame.requiresServerInput ? serverId.trim() : undefined,
        paymentMethod,
      });
      setCreatedOrder(res.order);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal membuat pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="katalog" className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      {/* Game Selector Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#262B38] pb-5">
          <div>
            <p className="text-xs font-semibold tracking-wider text-amber-400">
              Katalog Game Resmi
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white">
              Pilih Game Favorit Anda
            </h2>
          </div>
          <p className="text-sm text-zinc-400 max-w-md">
            Harga transparan tanpa biaya tersembunyi. Klik salah satu game untuk memilih nominal dan cek ID akun secara real-time.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {GAME_CATALOG.map((game) => {
            const isSelected = game.id === activeGame.id;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => {
                  handleSelectGame(game.id);
                  workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
                className={`group text-left rounded-xl overflow-hidden border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isSelected
                    ? 'border-amber-500 bg-[#1A1E29] ring-1 ring-amber-500/40'
                    : 'border-[#262B38] bg-[#13161E] hover:border-zinc-600 hover:-translate-y-0.5'
                }`}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#0B0D12]">
                  <img
                    src={GAME_ART[game.id]}
                    alt={game.name}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12]/60 via-transparent to-transparent" />
                </div>
                <div className="p-3.5">
                  <p className="font-display text-sm font-semibold text-white truncate">
                    {game.shortName}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400 truncate">
                    {game.publisher} · {game.category}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contiguous Purchase & Real-time ID Check Workspace */}
      <div
        id="topup-workspace"
        ref={workspaceRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left: Product Nominal Catalog for Selected Game */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center gap-4 rounded-xl border border-[#262B38] bg-[#13161E] p-4">
            <img
              src={GAME_ART[activeGame.id]}
              alt={activeGame.name}
              className="h-16 w-16 shrink-0 rounded-lg object-cover object-center border border-[#262B38]"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-amber-400">
                {activeGame.publisher} · {activeGame.category}
              </p>
              <h3 className="font-display text-xl font-bold text-white truncate">
                {activeGame.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pilih nominal {activeGame.currencyName} yang diinginkan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {effectiveGameProducts.map((product) => {
              const active = product.id === selectedProduct.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectProduct(product.id)}
                  className={`flex items-center gap-3.5 rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    active
                      ? 'border-amber-500 bg-[#1A1E29] ring-1 ring-amber-500/40'
                      : 'border-[#262B38] bg-[#13161E] hover:border-zinc-600 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#0B0D12] border border-[#262B38]">
                    <CurrencyIcon type={product.iconType} imageUrl={product.imageUrl} alt={product.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-sm font-semibold text-white truncate">
                        {product.name}
                      </p>
                      {product.tag && (
                        <span className="text-[11px] font-semibold text-amber-400 whitespace-nowrap shrink-0">
                          {product.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate">{product.amountLabel}</p>
                    <p className="mt-1.5 font-mono text-sm font-semibold text-amber-400 tabular-nums">
                      {formatRupiah(product.price)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Step-by-Step Checkout Panel */}
        <form
          onSubmit={handleSubmitOrder}
          className="lg:col-span-5 lg:sticky lg:top-24 rounded-xl border border-[#262B38] bg-[#13161E] p-5 sm:p-6 space-y-6"
        >
          {/* Step 1: ID Input & Real-Time Check */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-base font-bold text-white">
                01. Masukkan Data Akun
              </h3>
              <button
                type="button"
                onClick={handleFillSample}
                className="text-xs font-medium text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
              >
                Isi ID Contoh
              </button>
            </div>

            <div className={activeGame.requiresServerInput ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
              <div>
                <label
                  htmlFor="target-account-id"
                  className="block text-xs font-medium text-zinc-300 mb-1.5"
                >
                  {activeGame.idLabel}
                </label>
                <input
                  id="target-account-id"
                  ref={idInputRef}
                  type="text"
                  inputMode="numeric"
                  value={accountId}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  placeholder={activeGame.idPlaceholder}
                  className="w-full rounded-lg border border-[#262B38] bg-[#0B0D12] px-3.5 py-2.5 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {activeGame.requiresServerInput && activeGame.serverInputType === 'text' && (
                <div>
                  <label
                    htmlFor="target-server-id"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    {activeGame.serverLabel}
                  </label>
                  <input
                    id="target-server-id"
                    type="text"
                    inputMode="numeric"
                    value={serverId}
                    onChange={(e) => handleServerChange(e.target.value)}
                    placeholder={activeGame.serverPlaceholder}
                    className="w-full rounded-lg border border-[#262B38] bg-[#0B0D12] px-3.5 py-2.5 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              {activeGame.requiresServerInput && activeGame.serverInputType === 'select' && (
                <div>
                  <label
                    htmlFor="target-server-select"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    {activeGame.serverLabel}
                  </label>
                  <select
                    id="target-server-select"
                    value={serverId}
                    onChange={(e) => handleServerChange(e.target.value)}
                    className="w-full rounded-lg border border-[#262B38] bg-[#0B0D12] px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    {activeGame.serverOptions?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">{activeGame.idHint}</p>

            <button
              type="button"
              onClick={() => void runCheckId()}
              disabled={checkingId}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#2E3545] bg-[#1A1E29] px-4 py-2.5 text-sm font-semibold text-white hover:border-amber-500/70 hover:bg-[#222836] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {checkingId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                  <span>Memeriksa Nickname Akun...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 text-amber-400" />
                  <span>Cek Nickname Akun</span>
                </>
              )}
            </button>

            {checkResult && (
              <div
                className={`rounded-lg border p-3.5 text-sm ${
                  checkResult.valid
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                }`}
              >
                {checkResult.valid ? (
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-white">
                        Nickname: <span className="text-emerald-300">{checkResult.nickname}</span>
                      </p>
                      <p className="text-xs text-zinc-300 mt-0.5">
                        Server/Region: {checkResult.region} · {checkResult.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                    <p className="text-xs leading-relaxed">{checkResult.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-[#262B38]" />

          {/* Step 2: Payment Method */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-white">
              02. Pilih Metode Pembayaran
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                  paymentMethod === 'QRIS'
                    ? 'border-amber-500 bg-[#1A1E29] text-white'
                    : 'border-[#262B38] bg-[#0B0D12] text-zinc-300 hover:border-zinc-600'
                }`}
              >
                <QrCode className="h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold">QRIS</p>
                  <p className="text-[11px] text-zinc-400">Semua E-Wallet</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('DANA')}
                className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                  paymentMethod === 'DANA'
                    ? 'border-amber-500 bg-[#1A1E29] text-white'
                    : 'border-[#262B38] bg-[#0B0D12] text-zinc-300 hover:border-zinc-600'
                }`}
              >
                <Smartphone className="h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold">Transfer DANA</p>
                  <p className="text-[11px] text-zinc-400">Verifikasi Manual</p>
                </div>
              </button>
            </div>

            {paymentMethod === 'QRIS' ? (
              <QrisGraphic
                amount={selectedProduct.price}
                merchantName={paymentSettings.qrisMerchantName}
                nmid={paymentSettings.qrisNmid}
                imageUrl={paymentSettings.qrisImageUrl}
              />
            ) : (
              <div className="rounded-xl border border-[#262B38] bg-[#1A1E29] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-zinc-400">Nomor DANA Tujuan</p>
                    <p className="font-mono text-base font-bold text-white tabular-nums mt-0.5">
                      {paymentSettings.danaNumber}
                    </p>
                    <p className="text-xs text-zinc-300 mt-0.5">a.n. {paymentSettings.danaHolder}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCopyDana()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#2E3545] bg-[#13161E] px-3 py-2 text-xs font-semibold text-zinc-100 hover:bg-[#222836] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {copiedDana ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-amber-400" />
                        <span>Salin Nomor</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-400">
                  Transfer tepat sesuai nominal <span className="font-mono text-amber-400 font-semibold">{formatRupiah(selectedProduct.price)}</span>, lalu tekan tombol konfirmasi di bawah.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[#262B38]" />

          {/* Step 3: Order Summary & Confirm */}
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Item Dipilih</span>
                <span className="font-medium text-white text-right">{selectedProduct.name}</span>
              </div>
              {checkResult?.valid && checkResult.nickname && (
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Akun Tujuan</span>
                  <span className="font-medium text-emerald-300">{checkResult.nickname}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-[#262B38]">
                <span className="font-semibold text-white">Total Pembayaran</span>
                <span className="font-mono text-lg font-bold text-amber-400 tabular-nums">
                  {formatRupiah(selectedProduct.price)}
                </span>
              </div>
            </div>

            {submitError && (
              <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
                {submitError}
              </p>
            )}

            {!user ? (
              <div className="rounded-xl border border-[#262B38] bg-[#0B0D12] p-4 space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Silakan login terlebih dahulu agar transaksi tercatat ke riwayat akun Anda di Takamiya Store.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => saveDraftAndRedirect('/login')}
                    className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-[#0B0D12] hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    Masuk & Bayar
                  </button>
                  <button
                    type="button"
                    onClick={() => saveDraftAndRedirect('/register')}
                    className="rounded-lg border border-[#262B38] bg-[#13161E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1A1E29] transition-colors cursor-pointer"
                  >
                    Daftar Akun
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-[#0B0D12] hover:bg-amber-400 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mencatat Transaksi...</span>
                  </>
                ) : (
                  <>
                    <span>Konfirmasi Sudah Bayar</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Master Product Price Table (25 Authentic Products) */}
      <div className="space-y-5 pt-4 border-t border-[#262B38]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-amber-400">
              Daftar Harga Resmi ({products.length} Produk)
            </p>
            <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold text-white">
              Tabel Lengkap Produk Multi-Game
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-[#13161E] p-1 border border-[#262B38] w-fit">
            <button
              type="button"
              onClick={() => setTableFilterGame('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                tableFilterGame === 'all'
                  ? 'bg-amber-500 text-[#0B0D12]'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Semua ({products.length})
            </button>
            {GAME_CATALOG.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setTableFilterGame(g.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  tableFilterGame === g.id
                    ? 'bg-amber-500 text-[#0B0D12]'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {g.shortName}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#262B38] bg-[#13161E]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#262B38] bg-[#0B0D12]/60 text-xs font-semibold text-zinc-400">
              <tr>
                <th className="px-4 py-3.5">Produk</th>
                <th className="px-4 py-3.5">Game</th>
                <th className="px-4 py-3.5">Detail Nominal</th>
                <th className="px-4 py-3.5 text-right">Harga</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262B38]">
              {products
                .filter((p) => tableFilterGame === 'all' || p.gameId === tableFilterGame)
                .map((item) => {
                const isActive = item.gameId === selectedGameId && item.id === selectedProduct.id;
                const gameMeta = GAME_CATALOG.find((g) => g.id === item.gameId);
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isActive ? 'bg-[#1A1E29]' : 'hover:bg-[#1A1E29]/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B0D12] border border-[#262B38]">
                          <CurrencyIcon type={item.iconType} imageUrl={item.imageUrl} alt={item.name} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-white">{item.name}</p>
                          {item.tag && (
                            <p className="text-[11px] font-medium text-amber-400">{item.tag}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-300 whitespace-nowrap">
                      {gameMeta?.name || item.gameId}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{item.amountLabel}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-amber-400 tabular-nums whitespace-nowrap">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.gameId !== selectedGameId) {
                            handleSelectGame(item.gameId);
                          }
                          setSelectedProductId(item.id);
                          workspaceRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          });
                          setTimeout(() => idInputRef.current?.focus(), 250);
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-amber-500 text-[#0B0D12]'
                            : 'border border-[#262B38] bg-[#0B0D12] text-zinc-200 hover:border-amber-500'
                        }`}
                      >
                        {isActive ? 'Dipilih' : 'Pilih'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Confirmation Modal */}
      {createdOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setCreatedOrder(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#262B38] bg-[#13161E] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-amber-400">Takamiya Store Invoice</p>
                <h3 className="mt-1 font-display text-xl font-bold text-white">
                  Pesanan Berhasil Dicatat
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreatedOrder(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1A1E29] hover:text-white cursor-pointer"
                aria-label="Tutup detail pesanan"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-[#262B38] bg-[#0B0D12] p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Nomor Invoice</span>
                <span className="font-mono font-semibold text-white">{createdOrder.invoiceCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Status</span>
                <StatusText status={createdOrder.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Game</span>
                <span className="font-medium text-white">{createdOrder.gameName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Item</span>
                <span className="font-medium text-white">{createdOrder.productName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Akun Tujuan</span>
                <span className="font-medium text-emerald-300">
                  {createdOrder.targetNickname} ({createdOrder.targetAccountId}
                  {createdOrder.targetServerId ? ` / ${createdOrder.targetServerId}` : ''})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Metode Bayar</span>
                <span className="font-medium text-white">{createdOrder.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#262B38] pt-3">
                <span className="font-semibold text-white">Total Tagihan</span>
                <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                  {formatRupiah(createdOrder.price)}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Pesanan Anda berstatus <strong className="text-amber-400">Pending</strong> dan akan segera diverifikasi oleh Admin Takamiya Store. Pantau pembaruan status di halaman Riwayat.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCreatedOrder(null);
                  onNavigate('/riwayat');
                }}
                className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-[#0B0D12] hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Lihat Riwayat
              </button>
              <button
                type="button"
                onClick={() => setCreatedOrder(null)}
                className="rounded-lg border border-[#262B38] bg-[#1A1E29] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#222836] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
