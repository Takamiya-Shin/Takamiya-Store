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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-10 sm:pt-8 sm:pb-12 space-y-8">
          <div className="overflow-hidden rounded-2xl border border-[#262B38] bg-[#080A0F] shadow-2xl shadow-black/40">
            <img
              src={HERO_ART}
              alt="Banner Takamiya Store"
              className="block w-full h-auto"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs font-semibold tracking-wider text-amber-400">
                Takamiya Store · Digital Gaming Top-Up
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.15] [text-wrap:balance]">
                Top-Up Game Resmi, Validasi ID Akurat & Instan
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Isi ulang Diamonds, Genesis Crystals, Lunites, hingga Esper Crystals untuk lima game populer dengan cek nickname akurat dan pembayaran DANA maupun QRIS.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
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
