import { GameConfig, GameId, ProductItem } from '../types/store';

export const DANA_ACCOUNT = {
  number: '0857-9912-4480',
  rawNumber: '085799124480',
  holder: 'Takamiya Store ID',
};

export const QRIS_MERCHANT = {
  name: 'TAKAMIYA STORE',
  nmid: 'ID1020261113880',
  city: 'JAKARTA SELATAN',
};

export const GAME_CATALOG: GameConfig[] = [
  {
    id: 'mobile-legends',
    name: 'Mobile Legends: Bang Bang',
    shortName: 'Mobile Legends',
    publisher: 'Moonton',
    category: 'MOBA 5v5',
    currencyName: 'Diamonds',
    idLabel: 'User ID',
    idPlaceholder: 'Contoh: 123456789',
    idHint: 'Masukkan 6–12 digit User ID beserta 4–5 digit Zone ID di dalam kurung profil game.',
    requiresServerInput: true,
    serverInputType: 'text',
    serverLabel: 'Server / Zone ID',
    serverPlaceholder: 'Contoh: 2145',
    products: [
      { id: '1', gameId: 'mobile-legends', name: '3 Diamonds (Bonus 3)', amountLabel: 'Mobile Legends', price: 1500, iconType: 'diamond-ml' },
      { id: '2', gameId: 'mobile-legends', name: '19 Diamonds', amountLabel: 'Mobile Legends', price: 6000, iconType: 'diamond-ml' },
      { id: '3', gameId: 'mobile-legends', name: '36 Diamonds', amountLabel: 'Mobile Legends', price: 11000, iconType: 'diamond-ml' },
      { id: '4', gameId: 'mobile-legends', name: '53 Diamonds', amountLabel: 'Mobile Legends', price: 16000, iconType: 'diamond-ml' },
      { id: '5', gameId: 'mobile-legends', name: '86 Diamonds (78 + 8 Bonus)', amountLabel: 'Mobile Legends', price: 25000, iconType: 'diamond-ml', tag: 'Terlaris' },
      { id: '6', gameId: 'mobile-legends', name: '172 Diamonds (156 + 16 Bonus)', amountLabel: 'Mobile Legends', price: 48000, iconType: 'diamond-ml' },
      { id: '7', gameId: 'mobile-legends', name: '257 Diamonds (234 + 23 Bonus)', amountLabel: 'Mobile Legends', price: 72000, iconType: 'diamond-ml' },
      { id: '8', gameId: 'mobile-legends', name: '344 Diamonds (312 + 32 Bonus)', amountLabel: 'Mobile Legends', price: 96000, iconType: 'diamond-ml' },
      { id: '9', gameId: 'mobile-legends', name: '514 Diamonds (468 + 46 Bonus)', amountLabel: 'Mobile Legends', price: 142000, iconType: 'diamond-ml' },
      { id: '10', gameId: 'mobile-legends', name: 'Weekly Diamond Pass', amountLabel: 'Mobile Legends', price: 29500, iconType: 'pass', tag: 'Hemat' },
    ],
  },
  {
    id: 'free-fire',
    name: 'Free Fire',
    shortName: 'Free Fire',
    publisher: 'Garena',
    category: 'Battle Royale',
    currencyName: 'Diamonds',
    idLabel: 'Player ID',
    idPlaceholder: 'Contoh: 1849203412',
    idHint: 'Masukkan 8–12 digit angka Player ID yang tertera di profil lobi Free Fire.',
    requiresServerInput: false,
    products: [
      { id: '11', gameId: 'free-fire', name: '5 Diamonds', amountLabel: 'Free Fire', price: 1000, iconType: 'diamond-ff' },
      { id: '12', gameId: 'free-fire', name: '12 Diamonds', amountLabel: 'Free Fire', price: 2500, iconType: 'diamond-ff' },
      { id: '13', gameId: 'free-fire', name: '50 Diamonds', amountLabel: 'Free Fire', price: 8000, iconType: 'diamond-ff' },
      { id: '14', gameId: 'free-fire', name: '70 Diamonds', amountLabel: 'Free Fire', price: 10000, iconType: 'diamond-ff', tag: 'Terlaris' },
      { id: '15', gameId: 'free-fire', name: '140 Diamonds', amountLabel: 'Free Fire', price: 20000, iconType: 'diamond-ff' },
      { id: '16', gameId: 'free-fire', name: '355 Diamonds', amountLabel: 'Free Fire', price: 48000, iconType: 'diamond-ff' },
      { id: '17', gameId: 'free-fire', name: '720 Diamonds', amountLabel: 'Free Fire', price: 95000, iconType: 'diamond-ff' },
      { id: '18', gameId: 'free-fire', name: '1450 Diamonds', amountLabel: 'Free Fire', price: 190000, iconType: 'diamond-ff' },
      { id: '19', gameId: 'free-fire', name: 'Membership Mingguan', amountLabel: 'Free Fire', price: 30000, iconType: 'pass', tag: 'Hemat' },
      { id: '20', gameId: 'free-fire', name: 'Membership Bulanan', amountLabel: 'Free Fire', price: 85000, iconType: 'pass', tag: 'Populer' },
    ],
  },
  {
    id: 'genshin-impact',
    name: 'Genshin Impact',
    shortName: 'Genshin Impact',
    publisher: 'HoYoverse',
    category: 'Open-World RPG',
    currencyName: 'Genesis Crystals',
    idLabel: 'UID',
    idPlaceholder: 'Contoh: 801234567',
    idHint: 'Masukkan 9 digit UID (umumnya diawali angka 8 untuk server Asia).',
    requiresServerInput: true,
    serverInputType: 'select',
    serverLabel: 'Server Region',
    serverOptions: ['Asia', 'America', 'Europe', 'TW, HK, MO'],
    products: [
      { id: '21', gameId: 'genshin-impact', name: '60 Genesis Crystals', amountLabel: 'Genshin Impact', price: 15000, iconType: 'crystal-gi' },
      { id: '22', gameId: 'genshin-impact', name: '300 + 30 Genesis Crystals', amountLabel: 'Genshin Impact', price: 73000, iconType: 'crystal-gi' },
      { id: '23', gameId: 'genshin-impact', name: '980 + 110 Genesis Crystals', amountLabel: 'Genshin Impact', price: 230000, iconType: 'crystal-gi' },
      { id: '24', gameId: 'genshin-impact', name: '1980 + 260 Genesis Crystals', amountLabel: 'Genshin Impact', price: 450000, iconType: 'crystal-gi' },
      { id: '25', gameId: 'genshin-impact', name: '3280 + 600 Genesis Crystals', amountLabel: 'Genshin Impact', price: 740000, iconType: 'crystal-gi' },
      { id: '26', gameId: 'genshin-impact', name: '6480 + 1600 Genesis Crystals', amountLabel: 'Genshin Impact', price: 1480000, iconType: 'crystal-gi', tag: 'Best Value' },
      { id: '27', gameId: 'genshin-impact', name: 'Blessing of the Welkin Moon', amountLabel: 'Genshin Impact', price: 73000, iconType: 'pass', tag: 'Favorit' },
      { id: '28', gameId: 'genshin-impact', name: '2x Blessing of the Welkin Moon', amountLabel: 'Genshin Impact', price: 146000, iconType: 'pass' },
      { id: '29', gameId: 'genshin-impact', name: '3x Blessing of the Welkin Moon', amountLabel: 'Genshin Impact', price: 219000, iconType: 'pass' },
      { id: '30', gameId: 'genshin-impact', name: 'Gnostic Hymn (Battle Pass)', amountLabel: 'Genshin Impact', price: 155000, iconType: 'pass', tag: 'Populer' },
    ],
  },
  {
    id: 'wuthering-waves',
    name: 'Wuthering Waves',
    shortName: 'Wuthering Waves',
    publisher: 'Kuro Games',
    category: 'Action RPG',
    currencyName: 'Lunites',
    idLabel: 'UID',
    idPlaceholder: 'Contoh: 901482910',
    idHint: 'Masukkan 9 digit UID dari pojok kanan bawah layar atau menu terminal.',
    requiresServerInput: true,
    serverInputType: 'select',
    serverLabel: 'Server Region',
    serverOptions: ['SEA', 'Asia', 'America', 'Europe', 'HMT'],
    products: [
      { id: '31', gameId: 'wuthering-waves', name: '60 Lunites', amountLabel: 'Wuthering Waves', price: 15000, iconType: 'lunite-ww' },
      { id: '32', gameId: 'wuthering-waves', name: '300 + 30 Lunites', amountLabel: 'Wuthering Waves', price: 73000, iconType: 'lunite-ww' },
      { id: '33', gameId: 'wuthering-waves', name: '980 + 110 Lunites', amountLabel: 'Wuthering Waves', price: 230000, iconType: 'lunite-ww' },
      { id: '34', gameId: 'wuthering-waves', name: '1980 + 260 Lunites', amountLabel: 'Wuthering Waves', price: 450000, iconType: 'lunite-ww' },
      { id: '35', gameId: 'wuthering-waves', name: '3280 + 600 Lunites', amountLabel: 'Wuthering Waves', price: 740000, iconType: 'lunite-ww' },
      { id: '36', gameId: 'wuthering-waves', name: '6480 + 1600 Lunites', amountLabel: 'Wuthering Waves', price: 1480000, iconType: 'lunite-ww', tag: 'Best Value' },
      { id: '37', gameId: 'wuthering-waves', name: 'Lunite Subscription (30 Hari)', amountLabel: 'Wuthering Waves', price: 73000, iconType: 'pass', tag: 'Favorit' },
      { id: '38', gameId: 'wuthering-waves', name: '2x Lunite Subscription', amountLabel: 'Wuthering Waves', price: 146000, iconType: 'pass' },
      { id: '39', gameId: 'wuthering-waves', name: 'Insider Channel (Battle Pass)', amountLabel: 'Wuthering Waves', price: 155000, iconType: 'pass', tag: 'Populer' },
      { id: '40', gameId: 'wuthering-waves', name: 'Connoisseur Channel (BP Plus)', amountLabel: 'Wuthering Waves', price: 310000, iconType: 'pass' },
    ],
  },
  {
    id: 'neverness-to-everness',
    name: 'Neverness to Everness',
    shortName: 'NTE',
    publisher: 'Hotta Studio',
    category: 'Urban Supernatural RPG',
    currencyName: 'Ether Crystals',
    idLabel: 'UID',
    idPlaceholder: 'Contoh: 702918345',
    idHint: 'Masukkan 8–10 digit UID akun Appraiser dari menu profil Hethereau.',
    requiresServerInput: true,
    serverInputType: 'select',
    serverLabel: 'Server Region',
    serverOptions: ['Asia-Pacific', 'Global', 'Japan', 'Europe'],
    products: [
      { id: '41', gameId: 'neverness-to-everness', name: '60 Ether Crystals', amountLabel: 'Neverness to Everness', price: 15000, iconType: 'esper-nte' },
      { id: '42', gameId: 'neverness-to-everness', name: '300 + 30 Ether Crystals', amountLabel: 'Neverness to Everness', price: 73000, iconType: 'esper-nte' },
      { id: '43', gameId: 'neverness-to-everness', name: '980 + 110 Ether Crystals', amountLabel: 'Neverness to Everness', price: 230000, iconType: 'esper-nte' },
      { id: '44', gameId: 'neverness-to-everness', name: '1980 + 260 Ether Crystals', amountLabel: 'Neverness to Everness', price: 450000, iconType: 'esper-nte' },
      { id: '45', gameId: 'neverness-to-everness', name: '3280 + 600 Ether Crystals', amountLabel: 'Neverness to Everness', price: 740000, iconType: 'esper-nte' },
      { id: '46', gameId: 'neverness-to-everness', name: '6480 + 1600 Ether Crystals', amountLabel: 'Neverness to Everness', price: 1480000, iconType: 'esper-nte', tag: 'Best Value' },
      { id: '47', gameId: 'neverness-to-everness', name: 'Hethereau Monthly Pass', amountLabel: 'Neverness to Everness', price: 73000, iconType: 'pass', tag: 'Baru' },
      { id: '48', gameId: 'neverness-to-everness', name: '2x Hethereau Monthly Pass', amountLabel: 'Neverness to Everness', price: 146000, iconType: 'pass' },
      { id: '49', gameId: 'neverness-to-everness', name: 'Anomaly Hunter Pass (BP)', amountLabel: 'Neverness to Everness', price: 155000, iconType: 'pass', tag: 'Populer' },
      { id: '50', gameId: 'neverness-to-everness', name: 'Collector Vehicle Skin Bundle', amountLabel: 'Neverness to Everness', price: 250000, iconType: 'pass' },
    ],
  },
];

export const ALL_PRODUCTS = GAME_CATALOG.flatMap((game) =>
  game.products.map((product) => ({
    ...product,
    gameName: game.name,
    gameShortName: game.shortName,
    publisher: game.publisher,
  }))
);

export function mapCategoryToGameId(category: string): GameId {
  const c = category.trim().toLowerCase();
  if (c.includes('mobile legends')) return 'mobile-legends';
  if (c.includes('free fire')) return 'free-fire';
  if (c.includes('genshin')) return 'genshin-impact';
  if (c.includes('wuthering')) return 'wuthering-waves';
  return 'neverness-to-everness';
}

export function inferIconType(gameId: GameId, productName: string): ProductItem['iconType'] {
  const n = productName.toLowerCase();
  if (
    n.includes('pass') ||
    n.includes('membership') ||
    n.includes('welkin') ||
    n.includes('subscription') ||
    n.includes('hymn') ||
    n.includes('channel') ||
    n.includes('bundle')
  ) {
    return 'pass';
  }
  if (gameId === 'mobile-legends') return 'diamond-ml';
  if (gameId === 'free-fire') return 'diamond-ff';
  if (gameId === 'genshin-impact') return 'crystal-gi';
  if (gameId === 'wuthering-waves') return 'lunite-ww';
  return 'esper-nte';
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}
