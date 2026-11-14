import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ImagePlus, Loader2, RotateCcw, Save } from 'lucide-react';
import { api } from '../lib/api';
import { PaymentSettings } from '../types/store';
import { QrisGraphic } from './QrisGraphic';

export function PaymentSettingsPanel() {
  const [danaNumber, setDanaNumber] = useState('');
  const [danaHolder, setDanaHolder] = useState('');
  const [qrisMerchantName, setQrisMerchantName] = useState('');
  const [qrisNmid, setQrisNmid] = useState('');
  const [savedQrisUrl, setSavedQrisUrl] = useState<string | null>(null);
  const [pendingQrisData, setPendingQrisData] = useState<string | null | undefined>(undefined);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applySettings = (s: PaymentSettings) => {
    setDanaNumber(s.danaNumber);
    setDanaHolder(s.danaHolder);
    setQrisMerchantName(s.qrisMerchantName);
    setQrisNmid(s.qrisNmid);
    setSavedQrisUrl(s.qrisImageUrl);
    setPendingQrisData(undefined);
  };

  useEffect(() => {
    api
      .getPaymentSettings()
      .then((res) => applySettings(res.settings))
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat pengaturan.'))
      .finally(() => setLoading(false));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setError('Format gambar harus PNG, JPG, atau WebP.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Ukuran gambar QRIS maksimal 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPendingQrisData(reader.result);
      }
    };
    reader.onerror = () => {
      setError('Gagal membaca file gambar QRIS.');
    };
    reader.readAsDataURL(file);
  };

  const handleResetQris = () => {
    setPendingQrisData(null);
    setSuccessMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSaving(true);
    try {
      const res = await api.updatePaymentSettings({
        danaNumber,
        danaHolder,
        qrisMerchantName,
        qrisNmid,
        qrisImageData: pendingQrisData,
      });
      applySettings(res.settings);
      setSuccessMsg('Nomor DANA dan gambar QRIS berhasil diperbarui untuk seluruh halaman checkout.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-12 text-center text-zinc-400">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-400" />
        <p className="mt-3 text-sm">Memuat pengaturan pembayaran...</p>
      </div>
    );
  }

  const previewUrl =
    pendingQrisData === null
      ? null
      : typeof pendingQrisData === 'string'
        ? pendingQrisData
        : savedQrisUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <form
        onSubmit={handleSave}
        className="lg:col-span-7 rounded-xl border border-[#262B38] bg-[#13161E] p-6 space-y-5"
      >
        <div>
          <h2 className="font-display text-lg font-bold text-white">
            Pengaturan Rekening DANA & QRIS
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Perubahan di sini langsung tampil di formulir checkout dan invoice pelanggan Takamiya Store.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
            {error}
          </p>
        )}

        {successMsg && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="admin-dana-number" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Nomor DANA Tujuan
            </label>
            <input
              id="admin-dana-number"
              type="text"
              required
              value={danaNumber}
              onChange={(e) => setDanaNumber(e.target.value)}
              placeholder="Contoh: 0812-3456-7890"
              className="w-full rounded-lg border border-[#262B38] bg-[#0B0D12] px-3.5 py-2.5 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admin-dana-holder" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Atas Nama DANA
            </label>
            <input
              id="admin-dana-holder"
              type="text"
              required
              value={danaHolder}
              onChange={(e) => setDanaHolder(e.target.value)}
              placeholder="Contoh: Takamiya Store"
              className="w-full rounded-lg border border-[#262B38] bg-[#0B0D12] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="admin-qris-merchant" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Nama Merchant QRIS
            </label>
            <input
              id="admin-qris-merchant"
              type="text"
              required
              value={qrisMerchantName}
              onChange={(e) => setQrisMerchantName(e.target.value)}
              placeholder="TAKAMIYA STORE"
              className="w-full rounded-lg border border-[#262B38] bg-[#0B0D12] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admin-qris-nmid" className="block text-xs font-medium text-zinc-300 mb-1.5">
              NMID QRIS (Opsional)
            </label>
            <input
              id="admin-qris-nmid"
              type="text"
              value={qrisNmid}
              onChange={(e) => setQrisNmid(e.target.value)}
              placeholder="ID1020261113880"
              className="w-full rounded-lg border border-[#262B38] bg-[#0B0D12] px-3.5 py-2.5 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="block text-xs font-medium text-zinc-300">
            Unggah Gambar QRIS Anda Sendiri (PNG / JPG / WebP, maks. 4 MB)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2E3545] bg-[#1A1E29] px-4 py-2 text-xs font-semibold text-white hover:border-amber-500/70 hover:bg-[#222836] cursor-pointer"
            >
              <ImagePlus className="h-4 w-4 text-amber-400" />
              <span>Pilih Gambar QRIS</span>
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={handleResetQris}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#262B38] bg-[#0B0D12] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Gunakan QRIS Bawaan</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-[#262B38]">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-[#0B0D12] hover:bg-amber-400 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Pengaturan Pembayaran</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="lg:col-span-5 space-y-4">
        <div className="rounded-xl border border-[#262B38] bg-[#13161E] p-5 space-y-4">
          <p className="text-xs font-semibold tracking-wider text-amber-400">
            Pratinjau Tampilan Pembeli
          </p>

          <div className="rounded-xl border border-[#262B38] bg-[#1A1E29] p-4 space-y-1">
            <p className="text-xs text-zinc-400">Nomor DANA Tujuan</p>
            <p className="font-mono text-base font-bold text-white tabular-nums">
              {danaNumber || '-'}
            </p>
            <p className="text-xs text-zinc-300">a.n. {danaHolder || '-'}</p>
          </div>

          <QrisGraphic
            amount={25000}
            merchantName={qrisMerchantName}
            nmid={qrisNmid}
            imageUrl={previewUrl}
          />
        </div>
      </div>
    </div>
  );
}
