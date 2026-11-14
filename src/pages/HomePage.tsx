import { ArrowDownRight, ShieldCheck, Wallet, Zap } from 'lucide-react';
import { HERO_ART } from '../data/gameArt';
import { TopUpWorkspace } from '../components/TopUpWorkspace';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const scrollToCatalog = () => {
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Section 1: Storefront Hero */}
      <section className="border-b border-[#262B38] bg-[#0B0D12]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-wider text-amber-400">
                  Takamiya Store · Digital Gaming Top-Up
                </p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1] [text-wrap:balance]">
                  Top-Up Game Resmi, Validasi ID Akurat & Instan
                </h1>
                <p className="text-base text-zinc-400 leading-relaxed max-w-xl">
                  Isi ulang Diamonds, Genesis Crystals, Lunites, hingga Esper Crystals untuk lima game populer dengan cek nickname real-time dan pembayaran DANA maupun QRIS.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToCatalog}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-[#0B0D12] hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Mulai Top-Up Sekarang</span>
                  <ArrowDownRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/riwayat')}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#262B38] bg-[#13161E] px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-[#1A1E29] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Cek Riwayat Transaksi
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-64 sm:h-80 lg:h-full min-h-[280px] overflow-hidden rounded-2xl border border-[#262B38] bg-[#13161E]">
                <img
                  src={HERO_ART}
                  alt="Studio Gaming Takamiya Store"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-zinc-200">
                  <span className="font-medium">5 Game Resmi Tersedia</span>
                  <span className="font-mono text-amber-400">DANA & QRIS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Multi-Game Catalog & Interactive Top-Up Workspace */}
      <TopUpWorkspace onNavigate={onNavigate} />

      {/* Section 3: Concise 3-Step Flow */}
      <section className="border-t border-[#262B38] bg-[#13161E]/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-6 space-y-2.5">
              <Zap className="h-5 w-5 text-amber-400" aria-hidden="true" />
              <h3 className="font-display text-base font-bold text-white">01. Cek ID Real-Time</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Sistem langsung memvalidasi User ID, Server, dan menampilkan nickname akun sebelum pembayaran dilakukan.
              </p>
            </div>
            <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-6 space-y-2.5">
              <Wallet className="h-5 w-5 text-amber-400" aria-hidden="true" />
              <h3 className="font-display text-base font-bold text-white">02. DANA & QRIS Praktis</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Bayar cepat menggunakan transfer DANA atau scan kode QRIS dari seluruh e-wallet dan m-banking Indonesia.
              </p>
            </div>
            <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-6 space-y-2.5">
              <ShieldCheck className="h-5 w-5 text-amber-400" aria-hidden="true" />
              <h3 className="font-display text-base font-bold text-white">03. Transaksi Terpantau</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Setiap pesanan tercatat dengan kode invoice unik yang diverifikasi langsung oleh tim admin Takamiya Store.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
