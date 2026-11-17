export type UserRole = 'admin' | 'user';

export type GameId =
  | 'mobile-legends'
  | 'free-fire'
  | 'genshin-impact'
  | 'wuthering-waves'
  | 'neverness-to-everness';

export type OrderStatus = 'Pending' | 'Sukses' | 'Gagal';

export type PaymentMethod = 'DANA' | 'QRIS';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  gameId: GameId;
  name: string;
  amountLabel: string;
  bonusLabel?: string;
  price: number;
  iconType: 'diamond-ml' | 'diamond-ff' | 'crystal-gi' | 'gi-welkin' | 'gi-gnostic' | 'lunite-ww' | 'ww-sub' | 'ww-insider' | 'ww-connoisseur' | 'esper-nte' | 'nte-monthly' | 'nte-pass' | 'wdp' | 'ff-weekly' | 'ff-monthly' | 'pass';
  imageUrl?: string;
  tag?: string;
}

export interface GameConfig {
  id: GameId;
  name: string;
  shortName: string;
  publisher: string;
  category: string;
  currencyName: string;
  idLabel: string;
  idPlaceholder: string;
  idHint: string;
  requiresServerInput: boolean;
  serverInputType?: 'text' | 'select';
  serverLabel?: string;
  serverPlaceholder?: string;
  serverOptions?: string[];
  products: ProductItem[];
}

export interface CheckIdResult {
  valid: boolean;
  nickname?: string;
  region?: string;
  message: string;
}

export interface OrderRecord {
  id: string;
  invoiceCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  gameId: GameId;
  gameName: string;
  productId: string;
  productName: string;
  price: number;
  targetAccountId: string;
  targetServerId?: string;
  targetNickname: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  successOrders: number;
  failedOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

export interface PaymentSettings {
  danaNumber: string;
  danaHolder: string;
  qrisMerchantName: string;
  qrisNmid: string;
  qrisImageUrl: string | null;
  updatedAt: string;
}
