import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { ALL_PRODUCTS, DANA_ACCOUNT, GAME_CATALOG, QRIS_MERCHANT } from './src/data/catalog.ts';
import {
  AdminStats,
  CheckIdResult,
  GameId,
  OrderRecord,
  OrderStatus,
  PaymentMethod,
  PaymentSettings,
  UserProfile,
  UserRole,
} from './src/types/store.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const STORE_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(STORE_DIR, 'uploads');
const STORE_PATH = path.join(STORE_DIR, 'store.json');
const TOKEN_SECRET = process.env.SESSION_SECRET || 'takamiya-store-hmac-secret-key-2026';

interface StoredUser extends UserProfile {
  passwordHash: string;
}

interface StoreData {
  users: StoredUser[];
  orders: OrderRecord[];
  paymentSettings: PaymentSettings;
}

function createDefaultPaymentSettings(): PaymentSettings {
  return {
    danaNumber: DANA_ACCOUNT.number,
    danaHolder: DANA_ACCOUNT.holder,
    qrisMerchantName: QRIS_MERCHANT.name,
    qrisNmid: QRIS_MERCHANT.nmid,
    qrisImageUrl: null,
    updatedAt: new Date().toISOString(),
  };
}

function hashPassword(password: string, salt?: string): string {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return `${usedSalt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
}

function signToken(user: StoredUser): string {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as TokenPayload;
    if (!parsed.sub || !parsed.role || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function createInitialData(): StoreData {
  const now = Date.now();
  const adminId = 'usr-admin-001';
  const budiId = 'usr-budi-002';
  const sitiId = 'usr-siti-003';

  const users: StoredUser[] = [
    {
      id: adminId,
      name: 'Takamiya Admin',
      email: 'admin@takamiya.id',
      role: 'admin',
      createdAt: new Date(now - 86400000 * 14).toISOString(),
      passwordHash: hashPassword('admin123'),
    },
    {
      id: budiId,
      name: 'Budi Santoso',
      email: 'budi@takamiya.id',
      role: 'user',
      createdAt: new Date(now - 86400000 * 7).toISOString(),
      passwordHash: hashPassword('user123'),
    },
    {
      id: sitiId,
      name: 'Siti Rahma',
      email: 'siti@takamiya.id',
      role: 'user',
      createdAt: new Date(now - 86400000 * 3).toISOString(),
      passwordHash: hashPassword('user123'),
    },
  ];

  const orders: OrderRecord[] = [
    {
      id: 'ord-1001',
      invoiceCode: 'TKM-20261113-1001',
      userId: budiId,
      userName: 'Budi Santoso',
      userEmail: 'budi@takamiya.id',
      gameId: 'mobile-legends',
      gameName: 'Mobile Legends: Bang Bang',
      productId: '5',
      productName: '86 Diamonds (78 + 8 Bonus)',
      price: 25000,
      targetAccountId: '184920145',
      targetServerId: '2914',
      targetNickname: 'TakamiyaKaze',
      paymentMethod: 'QRIS',
      status: 'Sukses',
      createdAt: new Date(now - 3600000 * 18).toISOString(),
      updatedAt: new Date(now - 3600000 * 17.5).toISOString(),
    },
    {
      id: 'ord-1002',
      invoiceCode: 'TKM-20261113-1002',
      userId: budiId,
      userName: 'Budi Santoso',
      userEmail: 'budi@takamiya.id',
      gameId: 'genshin-impact',
      gameName: 'Genshin Impact',
      productId: '27',
      productName: 'Blessing of the Welkin Moon',
      price: 73000,
      targetAccountId: '809412837',
      targetServerId: 'Asia',
      targetNickname: 'LumineStarfall',
      paymentMethod: 'DANA',
      status: 'Pending',
      createdAt: new Date(now - 3600000 * 2).toISOString(),
      updatedAt: new Date(now - 3600000 * 2).toISOString(),
    },
    {
      id: 'ord-1003',
      invoiceCode: 'TKM-20261113-1003',
      userId: sitiId,
      userName: 'Siti Rahma',
      userEmail: 'siti@takamiya.id',
      gameId: 'wuthering-waves',
      gameName: 'Wuthering Waves',
      productId: '37',
      productName: 'Lunite Subscription (30 Hari)',
      price: 73000,
      targetAccountId: '902481920',
      targetServerId: 'SEA',
      targetNickname: 'RoverResonance',
      paymentMethod: 'QRIS',
      status: 'Pending',
      createdAt: new Date(now - 3600000 * 1).toISOString(),
      updatedAt: new Date(now - 3600000 * 1).toISOString(),
    },
    {
      id: 'ord-1004',
      invoiceCode: 'TKM-20261113-1004',
      userId: sitiId,
      userName: 'Siti Rahma',
      userEmail: 'siti@takamiya.id',
      gameId: 'free-fire',
      gameName: 'Free Fire',
      productId: '15',
      productName: '140 Diamonds',
      price: 20000,
      targetAccountId: '2091847210',
      targetNickname: 'SitiBooyah99',
      paymentMethod: 'DANA',
      status: 'Sukses',
      createdAt: new Date(now - 3600000 * 28).toISOString(),
      updatedAt: new Date(now - 3600000 * 27).toISOString(),
    },
  ];

  return { users, orders, paymentSettings: createDefaultPaymentSettings() };
}

function loadStore(): StoreData {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const initial = createInitialData();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as StoreData;
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.orders)) {
      throw new Error('Corrupt store format');
    }
    if (!parsed.paymentSettings) {
      parsed.paymentSettings = createDefaultPaymentSettings();
    }
    return parsed;
  } catch {
    const initial = createInitialData();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveStore(data: StoreData): void {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function sanitizeUser(user: StoredUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

const NICKNAME_POOLS: Record<GameId, string[]> = {
  'mobile-legends': [
    'TakamiyaKaze',
    'AlucardMidnight',
    'KaguraUmbrella',
    'FannyCableID',
    'GusionBlade77',
    'LingSkywalker',
    'SelenaAbyss',
    'HayabusaShadow',
  ],
  'free-fire': [
    'SitiBooyah99',
    'RyuHeadshot',
    'ChronoStrikeID',
    'AlokSquad',
    'KellySwift',
    'TatsuyaRush',
    'KentaVanguard',
    'WukongStealth',
  ],
  'genshin-impact': [
    'LumineStarfall',
    'AetherCelestia',
    'RaidenShogunID',
    'FurinaFontaine',
    'NahidaSumeru',
    'ZhongliLiyue',
    'ArlecchinoCrimson',
    'KazuhaAnemo',
  ],
  'wuthering-waves': [
    'RoverResonance',
    'JinhsiSentinel',
    'YinlinTempest',
    'ChangliEmber',
    'CamellyaBloom',
    'ShorekeeperZero',
    'CalcharoGhost',
    'JiyanVerdant',
  ],
  'neverness-to-everness': [
    'HethereauAce',
    'AppraiserZero',
    'MintAnomaly',
    'SkiaPhantom',
    'LacrimosaNight',
    'AdlerChronicle',
    'EonDriverID',
    'SakuraPulse',
  ],
};

function resolveSimulatedPlayer(
  gameId: GameId,
  accountId: string,
  serverId?: string
): CheckIdResult {
  const cleanId = accountId.trim();
  const cleanServer = (serverId || '').trim();

  if (!/^\d+$/.test(cleanId)) {
    return {
      valid: false,
      message: 'ID Akun hanya boleh berisi angka tanpa spasi atau simbol.',
    };
  }

  if (gameId === 'mobile-legends') {
    if (cleanId.length < 6 || cleanId.length > 12) {
      return {
        valid: false,
        message: 'User ID Mobile Legends harus terdiri dari 6–12 digit angka.',
      };
    }
    if (!/^\d{4,5}$/.test(cleanServer)) {
      return {
        valid: false,
        message: 'Server / Zone ID Mobile Legends harus 4–5 digit angka (contoh: 2145).',
      };
    }
  } else if (gameId === 'free-fire') {
    if (cleanId.length < 8 || cleanId.length > 12) {
      return {
        valid: false,
        message: 'Player ID Free Fire harus terdiri dari 8–12 digit angka.',
      };
    }
  } else if (gameId === 'genshin-impact' || gameId === 'wuthering-waves') {
    if (cleanId.length !== 9) {
      return {
        valid: false,
        message: 'UID harus tepat 9 digit angka sesuai yang tampil di pojok layar game.',
      };
    }
    if (!cleanServer) {
      return {
        valid: false,
        message: 'Silakan pilih Server Region akun Anda terlebih dahulu.',
      };
    }
  } else if (gameId === 'neverness-to-everness') {
    if (cleanId.length < 8 || cleanId.length > 10) {
      return {
        valid: false,
        message: 'UID Neverness to Everness harus terdiri dari 8–10 digit angka.',
      };
    }
    if (!cleanServer) {
      return {
        valid: false,
        message: 'Silakan pilih Server Region akun Anda terlebih dahulu.',
      };
    }
  }

  const hash = crypto
    .createHash('sha256')
    .update(`${gameId}:${cleanId}:${cleanServer}`)
    .digest();
  const pool = NICKNAME_POOLS[gameId];
  const baseName = pool[hash[0] % pool.length];
  const suffix = (hash[1] % 90) + 10;
  const nickname = cleanId === '184920145' ? 'TakamiyaKaze' : `${baseName}#${suffix}`;

  return {
    valid: true,
    nickname,
    region: cleanServer || 'Indonesia',
    message: 'Akun ditemukan dan siap menerima top-up.',
  };
}

interface AuthenticatedRequest extends Request {
  user?: StoredUser;
}

function attachAuth(store: StoreData) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const payload = verifyToken(token);
      if (payload) {
        const found = store.users.find((u) => u.id === payload.sub);
        if (found) {
          req.user = found;
        }
      }
    }
    next();
  };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Sesi tidak valid atau Anda belum login.' });
    return;
  }
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Silakan login terlebih dahulu.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Akses ditolak. Halaman ini khusus untuk Administrator Takamiya Store.',
    });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  const store = loadStore();

  app.use(express.json({ limit: '5mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));
  app.use(attachAuth(store));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, brand: 'Takamiya Store' });
  });

  app.get('/api/catalog', (_req, res) => {
    res.json({ games: GAME_CATALOG });
  });

  app.get('/api/products', (_req, res) => {
    res.json({ products: ALL_PRODUCTS });
  });

  app.get('/api/payment-settings', (_req, res) => {
    res.json({ settings: store.paymentSettings });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    if (cleanName.length < 2) {
      res.status(400).json({ error: 'Nama lengkap minimal 2 karakter.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Format email tidak valid.' });
      return;
    }
    if (cleanPassword.length < 6) {
      res.status(400).json({ error: 'Password minimal 6 karakter.' });
      return;
    }
    if (store.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      res.status(409).json({ error: 'Email sudah terdaftar. Silakan login.' });
      return;
    }

    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      name: cleanName,
      email: cleanEmail,
      role: 'user',
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(cleanPassword),
    };

    store.users.push(newUser);
    saveStore(store);

    const token = signToken(newUser);
    res.status(201).json({ token, user: sanitizeUser(newUser) });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    const user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user || !verifyPassword(cleanPassword, user.passwordHash)) {
      res.status(401).json({ error: 'Email atau password salah.' });
      return;
    }

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({ user: sanitizeUser(req.user!) });
  });

  app.post('/api/check-id', (req, res) => {
    const { gameId, accountId, serverId } = req.body as {
      gameId?: GameId;
      accountId?: string;
      serverId?: string;
    };

    const game = GAME_CATALOG.find((g) => g.id === gameId);
    if (!game) {
      res.status(400).json({ valid: false, message: 'Game tidak ditemukan di katalog.' });
      return;
    }

    const result = resolveSimulatedPlayer(game.id, accountId || '', serverId);
    res.json(result);
  });

  app.post('/api/orders', requireAuth, (req: AuthenticatedRequest, res) => {
    const { gameId, productId, targetAccountId, targetServerId, paymentMethod } = req.body as {
      gameId?: GameId;
      productId?: string;
      targetAccountId?: string;
      targetServerId?: string;
      paymentMethod?: PaymentMethod;
    };

    const game = GAME_CATALOG.find((g) => g.id === gameId);
    if (!game) {
      res.status(400).json({ error: 'Game yang dipilih tidak valid.' });
      return;
    }

    const product = game.products.find((p) => p.id === productId);
    if (!product) {
      res.status(400).json({ error: 'Produk nominal yang dipilih tidak valid.' });
      return;
    }

    if (paymentMethod !== 'DANA' && paymentMethod !== 'QRIS') {
      res.status(400).json({ error: 'Metode pembayaran harus DANA atau QRIS.' });
      return;
    }

    const idCheck = resolveSimulatedPlayer(game.id, targetAccountId || '', targetServerId);
    if (!idCheck.valid || !idCheck.nickname) {
      res.status(400).json({ error: idCheck.message });
      return;
    }

    const user = req.user!;
    const nowIso = new Date().toISOString();
    const dateStamp = nowIso.slice(0, 10).replace(/-/g, '');
    const suffix = Math.floor(1000 + Math.random() * 9000);

    const newOrder: OrderRecord = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      invoiceCode: `TKM-${dateStamp}-${suffix}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      gameId: game.id,
      gameName: game.name,
      productId: product.id,
      productName: product.name,
      price: product.price,
      targetAccountId: (targetAccountId || '').trim(),
      targetServerId: targetServerId ? targetServerId.trim() : undefined,
      targetNickname: idCheck.nickname,
      paymentMethod,
      status: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.orders.unshift(newOrder);
    saveStore(store);

    res.status(201).json({ order: newOrder });
  });

  app.get('/api/orders/my', requireAuth, (req: AuthenticatedRequest, res) => {
    const myOrders = store.orders
      .filter((o) => o.userId === req.user!.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ orders: myOrders });
  });

  app.get('/api/admin/orders', requireAdmin, (_req, res) => {
    const sorted = [...store.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const stats: AdminStats = {
      totalOrders: sorted.length,
      pendingOrders: sorted.filter((o) => o.status === 'Pending').length,
      successOrders: sorted.filter((o) => o.status === 'Sukses').length,
      failedOrders: sorted.filter((o) => o.status === 'Gagal').length,
      totalRevenue: sorted
        .filter((o) => o.status === 'Sukses')
        .reduce((sum, o) => sum + o.price, 0),
      totalUsers: store.users.filter((u) => u.role === 'user').length,
    };
    res.json({ orders: sorted, stats });
  });

  app.patch('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status?: OrderStatus };
    if (status !== 'Pending' && status !== 'Sukses' && status !== 'Gagal') {
      res.status(400).json({ error: 'Status pesanan tidak valid.' });
      return;
    }

    const order = store.orders.find((o) => o.id === id);
    if (!order) {
      res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
      return;
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    saveStore(store);

    res.json({ order });
  });

  app.put('/api/admin/payment-settings', requireAdmin, (req, res) => {
    const { danaNumber, danaHolder, qrisMerchantName, qrisNmid, qrisImageData } = req.body as {
      danaNumber?: string;
      danaHolder?: string;
      qrisMerchantName?: string;
      qrisNmid?: string;
      qrisImageData?: string | null;
    };

    const cleanDana = (danaNumber || '').trim();
    const cleanHolder = (danaHolder || '').trim();
    const cleanMerchant = (qrisMerchantName || '').trim();
    const cleanNmid = (qrisNmid || '').trim();

    if (cleanDana.length < 8) {
      res.status(400).json({ error: 'Nomor DANA minimal 8 digit/karakter.' });
      return;
    }
    if (cleanHolder.length < 2) {
      res.status(400).json({ error: 'Nama pemilik rekening DANA wajib diisi.' });
      return;
    }

    let nextImageUrl = store.paymentSettings.qrisImageUrl;

    if (qrisImageData === null) {
      nextImageUrl = null;
    } else if (typeof qrisImageData === 'string' && qrisImageData.length > 0) {
      const match = qrisImageData.match(/^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/);
      if (!match) {
        res.status(400).json({ error: 'Format gambar QRIS harus PNG, JPG, atau WebP.' });
        return;
      }
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > 4 * 1024 * 1024) {
        res.status(400).json({ error: 'Ukuran gambar QRIS maksimal 4 MB.' });
        return;
      }
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      const filename = `qris-store.${ext}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
      nextImageUrl = `/uploads/${filename}?v=${Date.now()}`;
    }

    store.paymentSettings = {
      danaNumber: cleanDana,
      danaHolder: cleanHolder,
      qrisMerchantName: cleanMerchant || 'TAKAMIYA STORE',
      qrisNmid: cleanNmid || 'ID1020261113880',
      qrisImageUrl: nextImageUrl,
      updatedAt: new Date().toISOString(),
    };
    saveStore(store);

    res.json({ settings: store.paymentSettings });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Takamiya Store server listening on http://localhost:${PORT}`);
  });
}

startServer();
