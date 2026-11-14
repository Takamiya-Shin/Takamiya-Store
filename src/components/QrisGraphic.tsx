import { useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { QRIS_MERCHANT, formatRupiah } from '../data/catalog';

interface QrisGraphicProps {
  amount?: number;
  merchantName?: string;
  nmid?: string;
  imageUrl?: string | null;
}

const MATRIX_ROWS = [
  '111111101011010111111',
  '100000100110100100001',
  '101110101101010101101',
  '101110100011100101101',
  '101110101010010101101',
  '100000101100110100001',
  '111111101010101111111',
  '000000001101000000000',
  '101101110010111010110',
  '011010011101001101001',
  '110101101011010011101',
  '001011010100111010010',
  '101110111010101101101',
  '000000001011010010110',
  '111111100101101101001',
  '100000101110010011100',
  '101110101001110100111',
  '101110100110101110010',
  '101110101101001001101',
  '100000100010110110010',
  '111111101101011011101',
];

function QrisSvgMatrix() {
  return (
    <svg
      viewBox="0 0 21 21"
      className="h-full w-full"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Kode QRIS Takamiya Store"
    >
      <rect width="21" height="21" fill="#FFFFFF" />
      {MATRIX_ROWS.map((row, y) =>
        row.split('').map((cell, x) =>
          cell === '1' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0B0D12" />
          ) : null
        )
      )}
    </svg>
  );
}

export function QrisGraphic({ amount, merchantName, nmid, imageUrl }: QrisGraphicProps) {
  const [zoomed, setZoomed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const activeMerchant = merchantName || QRIS_MERCHANT.name;
  const activeNmid = nmid || QRIS_MERCHANT.nmid;
  const showCustomImage = Boolean(imageUrl) && !imgFailed;

  return (
    <>
      <div className="rounded-xl border border-[#262B38] bg-[#1A1E29] p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-36 shrink-0 rounded-lg bg-white p-2.5 text-[#0B0D12]">
            {showCustomImage ? (
              <div className="aspect-square w-full overflow-hidden rounded">
                <img
                  src={imageUrl!}
                  alt={`QRIS ${activeMerchant}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <>
                <div className="mb-1.5 flex items-center justify-between border-b border-zinc-200 pb-1">
                  <span className="font-display text-[11px] font-bold tracking-wider">QRIS</span>
                  <span className="text-[9px] font-semibold text-zinc-600">GPN</span>
                </div>
                <div className="aspect-square w-full">
                  <QrisSvgMatrix />
                </div>
                <p className="mt-1.5 text-center font-mono text-[8px] font-semibold tracking-tight text-zinc-700 truncate">
                  {activeNmid}
                </p>
              </>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <p className="text-xs font-medium text-zinc-400">Merchant Resmi</p>
            <p className="font-display text-base font-bold text-white">{activeMerchant}</p>
            <p className="text-xs text-zinc-400">
              Mendukung DANA, GoPay, OVO, ShopeePay, BCA, Mandiri, BRI, dan semua aplikasi berlogo QRIS.
            </p>
            {typeof amount === 'number' && (
              <p className="pt-1 font-mono text-sm font-semibold text-amber-400 tabular-nums">
                Nominal: {formatRupiah(amount)}
              </p>
            )}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setZoomed(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#2E3545] bg-[#13161E] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-[#222836] transition-colors cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5 text-amber-400" />
                Perbesar QRIS
              </button>
            </div>
          </div>
        </div>
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-6 text-[#0B0D12] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <p className="font-display text-sm font-bold tracking-wide">{activeMerchant}</p>
                <p className="font-mono text-[11px] text-zinc-500">NMID: {activeNmid}</p>
              </div>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                aria-label="Tutup pratinjau QRIS"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="my-4 aspect-square w-full overflow-hidden rounded-lg">
              {showCustomImage ? (
                <img
                  src={imageUrl!}
                  alt={`QRIS ${activeMerchant}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain"
                />
              ) : (
                <QrisSvgMatrix />
              )}
            </div>
            {typeof amount === 'number' && (
              <p className="text-center font-mono text-base font-bold text-[#0B0D12] tabular-nums">
                Total: {formatRupiah(amount)}
              </p>
            )}
            <p className="mt-1 text-center text-xs text-zinc-500">
              Scan menggunakan aplikasi e-wallet atau mobile banking Anda
            </p>
          </div>
        </div>
      )}
    </>
  );
}
