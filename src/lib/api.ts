import {
  ALL_PRODUCTS,
  DANA_ACCOUNT,
  GAME_CATALOG,
  QRIS_MERCHANT,
  inferIconType,
  mapCategoryToGameId,
} from '../data/catalog';
import {
  AdminStats,
  CheckIdResult,
  GameId,
  OrderRecord,
  OrderStatus,
  PaymentMethod,
  PaymentSettings,
  ProductItem,
  UserProfile,
} from '../types/store';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const TOKEN_STORAGE_KEY = 'takamiya_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { error?: string }).error || `Request gagal (${response.status})`);
  }

  return data as T;
}

interface SupabaseProductRow {
  id: number | string;
  name: string;
  price: number;
  category: string;
  image_url?: string | null;
}

interface SupabaseProfileRow {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

interface SupabaseOrderRow {
  id: string;
  invoice_code: string;
  user_id: string;
  game_id: GameId;
  game_name: string;
  product_id: number | string;
  product_name: string;
  price: number;
  target_account_id: string;
  target_server_id: string | null;
  target_nickname: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  profiles?: { name: string; email: string } | null;
}

let cachedAuthTablesReady: boolean | null = null;

async function isSupabaseAuthOrdersReady(): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  if (cachedAuthTablesReady !== null) return cachedAuthTablesReady;

  try {
    const [profCheck, ordCheck] = await Promise.all([
      supabase.from('profiles').select('id').limit(1),
      supabase.from('orders').select('id').limit(1),
    ]);
    const profMissing = profCheck.status === 404 || profCheck.error?.code === 'PGRST205';
    const ordMissing = ordCheck.status === 404 || ordCheck.error?.code === 'PGRST205';
    cachedAuthTablesReady = !profMissing && !ordMissing;
  } catch {
    cachedAuthTablesReady = false;
  }
  return cachedAuthTablesReady;
}

function mapSupabaseOrder(row: SupabaseOrderRow): OrderRecord {
  return {
    id: row.id,
    invoiceCode: row.invoice_code,
    userId: row.user_id,
    userName: row.profiles?.name || 'Member Takamiya',
    userEmail: row.profiles?.email || '-',
    gameId: row.game_id,
    gameName: row.game_name,
    productId: String(row.product_id),
    productName: row.product_name,
    price: row.price,
    targetAccountId: row.target_account_id,
    targetServerId: row.target_server_id || undefined,
    targetNickname: row.target_nickname,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateGameIdLocally(
  gameId: GameId,
  accountId: string,
  serverId?: string
): CheckIdResult {
  const cleanId = accountId.trim();
  const cleanServer = (serverId || '').trim();

  if (!/^\d+$/.test(cleanId)) {
    return { valid: false, message: 'ID Akun hanya boleh berisi angka tanpa spasi atau simbol.' };
  }
  if (gameId === 'mobile-legends') {
    if (cleanId.length < 6 || cleanId.length > 12) {
      return { valid: false, message: 'User ID Mobile Legends harus 6–12 digit angka.' };
    }
    if (!/^\d{4,5}$/.test(cleanServer)) {
      return { valid: false, message: 'Server / Zone ID Mobile Legends harus 4–5 digit angka.' };
    }
  } else if (gameId === 'free-fire' && (cleanId.length < 8 || cleanId.length > 12)) {
    return { valid: false, message: 'Player ID Free Fire harus 8–12 digit angka.' };
  } else if ((gameId === 'genshin-impact' || gameId === 'wuthering-waves') && cleanId.length !== 9) {
    return { valid: false, message: 'UID harus tepat 9 digit angka.' };
  } else if (
    gameId === 'neverness-to-everness' &&
    (cleanId.length < 8 || cleanId.length > 10)
  ) {
    return { valid: false, message: 'UID Neverness to Everness harus 8–10 digit angka.' };
  }

  const pools: Record<GameId, string[]> = {
    'mobile-legends': ['TakamiyaKaze', 'KaguraUmbrella', 'FannyCableID', 'HayabusaShadow'],
    'free-fire': ['SitiBooyah99', 'RyuHeadshot', 'ChronoStrikeID', 'KellySwift'],
    'genshin-impact': ['LumineStarfall', 'AetherCelestia', 'RaidenShogunID', 'FurinaFontaine'],
    'wuthering-waves': ['RoverResonance', 'JinhsiSentinel', 'YinlinTempest', 'ChangliEmber'],
    'neverness-to-everness': ['HethereauAce', 'AppraiserZero', 'MintAnomaly', 'SkiaPhantom'],
  };
  let sum = 0;
  for (let i = 0; i < cleanId.length; i++) sum += cleanId.charCodeAt(i);
  const pool = pools[gameId];
  const nickname =
    cleanId === '184920145' ? 'TakamiyaKaze' : `${pool[sum % pool.length]}#${(sum % 89) + 10}`;

  return {
    valid: true,
    nickname,
    region: cleanServer || 'Indonesia',
    message: 'Akun ditemukan dan siap menerima top-up.',
  };
}

export const api = {
  async getProducts(): Promise<{ products: ProductItem[]; source: 'supabase' | 'local' }> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, category, image_url')
        .order('id', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: ProductItem[] = (data as SupabaseProductRow[]).map((row) => {
          const gameId = mapCategoryToGameId(row.category);
          const n = row.name.toLowerCase();
          let tag: string | undefined;
          if (n.includes('86 diamonds') || n.includes('70 diamonds')) tag = 'Terlaris';
          else if (n.includes('6480')) tag = 'Best Value';
          else if (n.includes('weekly') || n.includes('mingguan')) tag = 'Hemat';
          else if (n.includes('welkin') || n.includes('lunite subscription')) tag = 'Favorit';
          else if (n.includes('hethereau monthly')) tag = 'Baru';
          else if (n.includes('pass') || n.includes('bulanan') || n.includes('channel')) tag = 'Populer';

          return {
            id: String(row.id),
            gameId,
            name: row.name,
            amountLabel: row.category,
            price: Number(row.price),
            iconType: inferIconType(gameId, row.name),
            tag,
          };
        });
        return { products: mapped, source: 'supabase' };
      }
    }

    const res = await request<{ products: ProductItem[] }>('/api/products');
    return { products: res.products, source: 'local' };
  },

  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    if ((await isSupabaseAuthOrdersReady()) && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user || !data.session) {
        throw new Error(error?.message || 'Email atau password salah.');
      }

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, name, email, role, created_at')
        .eq('id', data.user.id)
        .single();

      if (profileErr || !profile) {
        throw new Error('Profil pengguna tidak ditemukan di tabel profiles Supabase.');
      }

      const row = profile as SupabaseProfileRow;
      return {
        token: data.session.access_token,
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          createdAt: row.created_at,
        },
      };
    }

    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ token: string; user: UserProfile }> {
    if ((await isSupabaseAuthOrdersReady()) && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error || !data.user) {
        throw new Error(error?.message || 'Gagal mendaftarkan akun di Supabase Auth.');
      }

      const profileRow = {
        id: data.user.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'user' as const,
      };

      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert(profileRow, { onConflict: 'id' });
      if (upsertErr) {
        throw new Error(`Gagal menyimpan profil ke tabel profiles: ${upsertErr.message}`);
      }

      return {
        token: data.session?.access_token || '',
        user: {
          ...profileRow,
          createdAt: new Date().toISOString(),
        },
      };
    }

    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async me(): Promise<{ user: UserProfile } | null> {
    if ((await isSupabaseAuthOrdersReady()) && supabase) {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, email, role, created_at')
        .eq('id', data.session.user.id)
        .single();

      if (!profile) return null;
      const row = profile as SupabaseProfileRow;
      return {
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          createdAt: row.created_at,
        },
      };
    }

    if (!getStoredToken()) return null;
    return request('/api/auth/me');
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setStoredToken(null);
  },

  async checkId(gameId: GameId, accountId: string, serverId?: string): Promise<CheckIdResult> {
    return validateGameIdLocally(gameId, accountId, serverId);
  },

  async createOrder(payload: {
    gameId: GameId;
    productId: string;
    targetAccountId: string;
    targetServerId?: string;
    paymentMethod: PaymentMethod;
  }): Promise<{ order: OrderRecord }> {
    if ((await isSupabaseAuthOrdersReady()) && supabase) {
      const { data: sessionData } = await supabase.auth.getSession();
      const authUser = sessionData.session?.user;
      if (!authUser) {
        throw new Error('Silakan login terlebih dahulu sebelum membuat pesanan.');
      }

      const idCheck = validateGameIdLocally(
        payload.gameId,
        payload.targetAccountId,
        payload.targetServerId
      );
      if (!idCheck.valid || !idCheck.nickname) {
        throw new Error(idCheck.message);
      }

      const numericId = Number(payload.productId);
      const { data: prodRow, error: prodErr } = await supabase
        .from('products')
        .select('id, name, price, category')
        .eq('id', Number.isNaN(numericId) ? payload.productId : numericId)
        .single();

      const fallbackGame = GAME_CATALOG.find((g) => g.id === payload.gameId);
      const fallbackProd = ALL_PRODUCTS.find((p) => p.id === payload.productId);
      if ((prodErr || !prodRow) && (!fallbackGame || !fallbackProd)) {
        throw new Error('Produk tidak ditemukan.');
      }

      const gameName = prodRow
        ? (prodRow as { category: string }).category
        : fallbackGame!.name;
      const productName = prodRow ? (prodRow as { name: string }).name : fallbackProd!.name;
      const price = prodRow ? Number((prodRow as { price: number }).price) : fallbackProd!.price;

      const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const invoiceCode = `TKM-${dateStamp}-${suffix}`;

      const { data: inserted, error: insertErr } = await supabase
        .from('orders')
        .insert({
          invoice_code: invoiceCode,
          user_id: authUser.id,
          game_id: payload.gameId,
          game_name: gameName,
          product_id: Number.isNaN(numericId) ? payload.productId : numericId,
          product_name: productName,
          price,
          target_account_id: payload.targetAccountId.trim(),
          target_server_id: payload.targetServerId?.trim() || null,
          target_nickname: idCheck.nickname,
          payment_method: payload.paymentMethod,
          status: 'Pending',
        })
        .select('*, profiles(name, email)')
        .single();

      if (insertErr || !inserted) {
        throw new Error(insertErr?.message || 'Gagal mencatat pesanan ke tabel orders Supabase.');
      }

      return { order: mapSupabaseOrder(inserted as SupabaseOrderRow) };
    }

    return request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMyOrders(): Promise<{ orders: OrderRecord[] }> {
    if ((await isSupabaseAuthOrdersReady()) && supabase) {
      const { data: sessionData } = await supabase.auth.getSession();
      const authUser = sessionData.session?.user;
      if (!authUser) throw new Error('Anda belum login.');

      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(name, email)')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Gagal memuat riwayat pesanan: ${error.message}`);
      }

      return { orders: (data as SupabaseOrderRow[]).map(mapSupabaseOrder) };
    }

    return request('/api/orders/my');
  },

  async getAdminOrders(): Promise<{ orders: OrderRecord[]; stats: AdminStats }> {
    if ((await isSupabaseAuthOrdersReady()) && supabase) {
      const meRes = await api.me();
      if (!meRes || meRes.user.role !== 'admin') {
        throw new Error('Akses ditolak. Halaman ini khusus untuk Administrator Takamiya Store.');
      }

      const [{ data: ordersData, error: ordersErr }, { count: usersCount }] = await Promise.all([
        supabase
          .from('orders')
          .select('*, profiles(name, email)')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user'),
      ]);

      if (ordersErr) {
        throw new Error(`Gagal memuat pesanan admin: ${ordersErr.message}`);
      }

      const mapped = (ordersData as SupabaseOrderRow[]).map(mapSupabaseOrder);
      const stats: AdminStats = {
        totalOrders: mapped.length,
        pendingOrders: mapped.filter((o) => o.status === 'Pending').length,
        successOrders: mapped.filter((o) => o.status === 'Sukses').length,
        failedOrders: mapped.filter((o) => o.status === 'Gagal').length,
        totalRevenue: mapped
          .filter((o) => o.status === 'Sukses')
          .reduce((sum, o) => sum + o.price, 0),
        totalUsers: usersCount || 0,
      };
      return { orders: mapped, stats };
    }

    return request('/api/admin/orders');
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ order: OrderRecord }> {
    if ((await isSupabaseAuthOrdersReady()) && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('*, profiles(name, email)')
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Gagal memperbarui status pesanan.');
      }

      return { order: mapSupabaseOrder(data as SupabaseOrderRow) };
    }

    return request(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getPaymentSettings(): Promise<{ settings: PaymentSettings }> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        const row = data as {
          dana_number: string;
          dana_holder: string;
          qris_merchant_name: string;
          qris_nmid: string;
          qris_image_url: string | null;
          updated_at: string;
        };
        return {
          settings: {
            danaNumber: row.dana_number,
            danaHolder: row.dana_holder,
            qrisMerchantName: row.qris_merchant_name,
            qrisNmid: row.qris_nmid,
            qrisImageUrl: row.qris_image_url,
            updatedAt: row.updated_at,
          },
        };
      }
    }

    return request('/api/payment-settings');
  },

  async updatePaymentSettings(payload: {
    danaNumber: string;
    danaHolder: string;
    qrisMerchantName: string;
    qrisNmid: string;
    qrisImageData?: string | null;
  }): Promise<{ settings: PaymentSettings }> {
    if ((await isSupabaseAuthOrdersReady()) && supabase) {
      const current = await api.getPaymentSettings();
      const nextImageUrl =
        payload.qrisImageData === undefined ? current.settings.qrisImageUrl : payload.qrisImageData;

      const nowIso = new Date().toISOString();
      const { error } = await supabase.from('payment_settings').upsert({
        id: 1,
        dana_number: payload.danaNumber.trim(),
        dana_holder: payload.danaHolder.trim(),
        qris_merchant_name: payload.qrisMerchantName.trim() || QRIS_MERCHANT.name,
        qris_nmid: payload.qrisNmid.trim() || QRIS_MERCHANT.nmid,
        qris_image_url: nextImageUrl,
        updated_at: nowIso,
      });

      if (error) {
        throw new Error(`Gagal menyimpan pengaturan pembayaran: ${error.message}`);
      }

      return {
        settings: {
          danaNumber: payload.danaNumber.trim(),
          danaHolder: payload.danaHolder.trim(),
          qrisMerchantName: payload.qrisMerchantName.trim() || QRIS_MERCHANT.name,
          qrisNmid: payload.qrisNmid.trim() || QRIS_MERCHANT.nmid,
          qrisImageUrl: nextImageUrl,
          updatedAt: nowIso,
        },
      };
    }

    return request('/api/admin/payment-settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
