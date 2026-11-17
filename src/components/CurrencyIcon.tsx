import { ProductItem } from '../types/store';

export function CurrencyIcon({
  type,
  imageUrl,
  alt,
}: {
  type: ProductItem['iconType'];
  imageUrl?: string;
  alt?: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt || 'Ikon Produk'}
        className={`h-full w-full object-contain ${type === 'diamond-ff' ? 'p-0.5 rounded-md' : 'p-1'}`}
      />
    );
  }

  if (type === 'diamond-ml') {
    return (
      <img
        src="/assets/aistudio/images__1_-removebg-preview_fa37cd2b.png"
        alt="Diamonds Mobile Legends"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'diamond-ff') {
    return (
      <img
        src="/assets/aistudio/ffdmes__6_-removebg-preview_4286f3e8.png"
        alt="Diamonds Free Fire"
        className="h-full w-full object-contain p-0.5 rounded-md"
      />
    );
  }

  if (type === 'wdp') {
    return (
      <img
        src="/assets/aistudio/images__1_-removebg-preview__1__13711dd6.png"
        alt="Weekly Diamond Pass"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'ff-weekly') {
    return (
      <img
        src="/assets/aistudio/images_ff__6_-removebg-preview_5bb89f0a.png"
        alt="Membership Mingguan Free Fire"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'ff-monthly') {
    return (
      <img
        src="/assets/aistudio/images_ff__-removebg-preview_bfa92b71.png"
        alt="Membership Bulanan Free Fire"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'crystal-gi') {
    return (
      <img
        src="/assets/aistudio/images__5_-removebg-preview_ec961ba0.png"
        alt="Genesis Crystals"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'gi-welkin') {
    return (
      <img
        src="/assets/aistudio/images__5_-removebg-preview_e2a0427e.png"
        alt="Blessing of the Welkin Moon"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'gi-gnostic') {
    return (
      <img
        src="/assets/aistudio/bpes__6_-removebg-preview_be62d274.png"
        alt="Gnostic Hymn"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'lunite-ww') {
    return (
      <img
        src="/assets/aistudio/images__6_-removebg-preview_415dfba0.png"
        alt="Lunites Wuthering Waves"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'ww-sub') {
    return (
      <img
        src="/assets/aistudio/lunite-removebg-preview_463d1f27.png"
        alt="Lunite Subscription"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'ww-insider') {
    return (
      <img
        src="/assets/aistudio/bp_wuwa__6_-removebg-preview_89ec385e.png"
        alt="Insider Channel"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'ww-connoisseur') {
    return (
      <img
        src="/assets/aistudio/bp_pulus__6_-removebg-preview_6f8008ea.png"
        alt="Connoisseur Channel"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'esper-nte') {
    return (
      <img
        src="/assets/aistudio/download-removebg-preview_3aff9a33.png"
        alt="Ether Crystals NTE"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'nte-monthly') {
    return (
      <img
        src="/assets/aistudio/nte-removebg-preview_1d7152db.png"
        alt="Hethereau Monthly Pass"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  if (type === 'nte-pass') {
    return (
      <img
        src="/assets/aistudio/ntees__6_-removebg-preview_5c486822.png"
        alt="NTE Pass & Bundle"
        className="h-full w-full object-contain p-1"
      />
    );
  }

  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
      <rect x="4" y="8" width="28" height="20" rx="4" fill="#1F2430" stroke="#F59E0B" strokeWidth="1.4" />
      <path d="M10 14 H26 M10 19 H20" stroke="#FCD34D" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="25" cy="21" r="2.5" fill="#F59E0B" />
    </svg>
  );
}
