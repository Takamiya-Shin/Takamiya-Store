import { ProductItem } from '../types/store';

export function CurrencyIcon({ type }: { type: ProductItem['iconType'] }) {
  if (type === 'diamond-ml') {
    return (
      <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="mlGem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="55%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <polygon points="18,4 31,13 18,32 5,13" fill="url(#mlGem)" stroke="#93C5FD" strokeWidth="1.2" />
        <polygon points="18,4 24,13 18,32 12,13" fill="#BFDBFE" fillOpacity="0.28" />
        <line x1="5" y1="13" x2="31" y2="13" stroke="#DBEAFE" strokeWidth="1" strokeOpacity="0.7" />
      </svg>
    );
  }

  if (type === 'diamond-ff') {
    return (
      <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="ffGem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="55%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>
        <polygon points="18,3 32,14 26,32 10,32 4,14" fill="url(#ffGem)" stroke="#FDE68A" strokeWidth="1.2" />
        <polygon points="18,8 25,15 18,28 11,15" fill="#FEF3C7" fillOpacity="0.26" />
      </svg>
    );
  }

  if (type === 'crystal-gi') {
    return (
      <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="giGem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>
        <path
          d="M18 3 L23 13 L33 18 L23 23 L18 33 L13 23 L3 18 L13 13 Z"
          fill="url(#giGem)"
          stroke="#E0F2FE"
          strokeWidth="1.2"
        />
        <circle cx="18" cy="18" r="3.5" fill="#FEF08A" fillOpacity="0.9" />
      </svg>
    );
  }

  if (type === 'lunite-ww') {
    return (
      <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="wwGem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
        <polygon points="18,4 28,11 28,25 18,32 8,25 8,11" fill="#13161E" stroke="#FCD34D" strokeWidth="1.4" />
        <polygon points="18,8 24,18 18,28 12,18" fill="url(#wwGem)" />
      </svg>
    );
  }

  if (type === 'esper-nte') {
    return (
      <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="nteGem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A5B4FC" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#312E81" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="20" height="20" rx="4" transform="rotate(45 18 18)" fill="url(#nteGem)" stroke="#C7D2FE" strokeWidth="1.2" />
        <rect x="13" y="13" width="10" height="10" rx="2" transform="rotate(45 18 18)" fill="#FDE68A" fillOpacity="0.8" />
      </svg>
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
