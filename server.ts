import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import webpush from 'web-push';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('database.sqlite');
db.pragma('journal_mode = WAL');

const INSTANCE_ID = Math.random().toString(36).substring(7);
console.log(`Server Instance ID: ${INSTANCE_ID}`);

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS checkins (
    id TEXT PRIMARY KEY,
    data TEXT
  );
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    data TEXT
  );
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    data TEXT
  );
  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    data TEXT
  );
  CREATE TABLE IF NOT EXISTS company_settings (
    id TEXT PRIMARY KEY,
    name TEXT,
    address TEXT,
    phone TEXT,
    logo TEXT,
    email TEXT,
    website TEXT
  );
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id TEXT PRIMARY KEY,
    endpoint TEXT UNIQUE,
    keys TEXT,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS vapid_keys (
    id TEXT PRIMARY KEY,
    public_key TEXT,
    private_key TEXT
  );
`);

// Setup persistent VAPID keys for background push notifications
let vapidKeys = db.prepare('SELECT * FROM vapid_keys WHERE id = ?').get('default') as any;
if (!vapidKeys) {
  const generated = webpush.generateVAPIDKeys();
  db.prepare('INSERT INTO vapid_keys (id, public_key, private_key) VALUES (?, ?, ?)').run(
    'default', generated.publicKey, generated.privateKey
  );
  vapidKeys = { public_key: generated.publicKey, private_key: generated.privateKey };
  console.log('Generated new persistent VAPID keys for Web Push');
}

webpush.setVapidDetails(
  'mailto:admin@printfix.com',
  vapidKeys.public_key,
  vapidKeys.private_key
);

async function broadcastPushNotification(payload: { title: string; body: string; data?: any; tag?: string }) {
  try {
    const subscriptions = db.prepare('SELECT * FROM push_subscriptions').all() as any[];
    console.log(`Broadcasting push notification to ${subscriptions.length} registered devices`);
    
    const payloadStr = JSON.stringify(payload);
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: JSON.parse(sub.keys)
          };
          await webpush.sendNotification(pushSubscription, payloadStr);
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Subscription has expired or user unsubscribed
            db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(sub.endpoint);
          }
        }
      })
    );
  } catch (err) {
    console.error('Error in broadcastPushNotification:', err);
  }
}

try {
  db.exec(`ALTER TABLE users ADD COLUMN photo_url TEXT;`);
} catch (e) {
  // Column already exists or table freshly created
}

import { initialProducts } from './src/data/initialProducts.ts';
import { moreProducts } from './src/data/moreProducts.ts';
import { productsPart3 } from './src/data/productsPart3.ts';

// Seed default admin users if empty or missing
const seedAdmins = [
  { id: 'admin-id-1', name: 'Administrador PrintFix', email: 'admin@printfix.com', password: 'PrintLogic2026*' },
  { id: 'admin-id-2', name: 'Administrador Principal', email: 'jordasx00x@gmail.com', password: 'PrintLogic2026*' }
];

seedAdmins.forEach(admin => {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(admin.email);
  if (!existing) {
    db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run(
      admin.id, admin.name, admin.email, admin.password
    );
    console.log(`Seeded admin user: ${admin.email}`);
  } else {
    // Ensure password is updated
    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(admin.password, admin.email);
  }
});

// Clear products on initial setup as requested
try {
  db.prepare('DELETE FROM products').run();
  console.log('Cleared all products from SQLite database');
} catch (e) {
  console.log('Error clearing products table:', e);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Increase payload limit to 50mb for image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes

  // Auth
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Faltan datos' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      console.log(`Login attempt for: '${cleanEmail}'`);
      
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;
      
      if (!user) {
        console.log(`User not found: '${cleanEmail}'`);
        return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
      }

      if (user.password !== cleanPassword) {
        console.log(`Invalid password for: '${cleanEmail}'`);
        return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
      }

      console.log(`Login successful for: '${cleanEmail}'`);
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  });

  // Registration of new admin accounts
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ success: false, error: 'Por favor completa todos los campos (Nombre, Email, Contraseña).' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      const cleanName = name.trim();

      if (cleanPassword.length < 4) {
        return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 4 caracteres.' });
      }

      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;
      if (existingUser) {
        // If user exists, update password and name
        db.prepare('UPDATE users SET name = ?, password = ? WHERE email = ?').run(cleanName, cleanPassword, cleanEmail);
        console.log(`Updated existing user password for: ${cleanEmail}`);
        return res.json({
          success: true,
          user: { id: existingUser.id, name: cleanName, email: cleanEmail }
        });
      }

      const newUserId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run(
        newUserId, cleanName, cleanEmail, cleanPassword
      );

      console.log(`Registered new admin user: ${cleanEmail}`);
      res.json({
        success: true,
        user: { id: newUserId, name: cleanName, email: cleanEmail }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: error.message || 'Error al registrar usuario' });
    }
  });

  // Google Login Endpoint
  app.post('/api/auth/google', (req, res) => {
    try {
      const { id, name, email, photoURL } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, error: 'Falta email de Google' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const userName = name || cleanEmail.split('@')[0];
      const userId = id || `google_${cleanEmail}`;
      const userPhoto = photoURL || '';

      // Check if user exists by email
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

      if (existingUser) {
        // Update photo_url and name if provided
        db.prepare('UPDATE users SET name = ?, photo_url = ? WHERE email = ?').run(userName, userPhoto, cleanEmail);
        console.log(`Google login for existing user: ${cleanEmail}`);
        res.json({ 
          success: true, 
          user: { 
            id: existingUser.id, 
            name: userName, 
            email: cleanEmail,
            photoURL: userPhoto
          } 
        });
      } else {
        // Create new user record
        db.prepare('INSERT INTO users (id, name, email, password, photo_url) VALUES (?, ?, ?, ?, ?)').run(
          userId, userName, cleanEmail, '', userPhoto
        );
        console.log(`New Google user registered: ${cleanEmail}`);
        res.json({ 
          success: true, 
          user: { 
            id: userId, 
            name: userName, 
            email: cleanEmail,
            photoURL: userPhoto
          } 
        });
      }
    } catch (error) {
      console.error('Google auth error in server:', error);
      res.status(500).json({ success: false, error: 'Error al procesar inicio de sesión con Google' });
    }
  });

  // Update User Profile (Password/Name)
  app.put('/api/auth/profile', (req, res) => {
    try {
      const { id, name, email, password } = req.body;
      
      if (!id || !name || !email) {
        return res.status(400).json({ success: false, error: 'Faltan datos' });
      }

      const cleanEmail = email.trim().toLowerCase();
      
      if (password && password.trim() !== '') {
        db.prepare('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?').run(name, cleanEmail, password, id);
      } else {
        db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, cleanEmail, id);
      }
      
      res.json({ success: true, user: { id, name, email: cleanEmail } });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar perfil' });
    }
  });

  // CheckIns
  app.get('/api/checkins', (req, res) => {
    try {
      const rows = db.prepare('SELECT data FROM checkins').all() as { data: string }[];
      const checkins = rows.map(row => JSON.parse(row.data));
      checkins.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(checkins);
    } catch (error) {
      console.error('Error getting checkins:', error);
      res.status(500).json({ error: 'Error retrieving checkins' });
    }
  });

  app.post('/api/checkins', (req, res) => {
    try {
      const checkIn = req.body;
      console.log('Saving new checkin:', checkIn.id);
      db.prepare('INSERT INTO checkins (id, data) VALUES (?, ?)').run(checkIn.id, JSON.stringify(checkIn));
      console.log('Checkin saved successfully');
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving checkin:', error);
      res.status(500).json({ error: 'Error saving checkin' });
    }
  });

  app.put('/api/checkins/:id', (req, res) => {
    try {
      const { id } = req.params;
      const checkIn = req.body;
      console.log('Updating checkin:', id);
      db.prepare('UPDATE checkins SET data = ? WHERE id = ?').run(JSON.stringify(checkIn), id);
      
      // If status is Aceptado, broadcast push notification to all subscribed mobile devices
      if (checkIn.printer?.status === 'Aceptado') {
        const brandModel = `${checkIn.printer?.brand || ''} ${checkIn.printer?.model || ''}`.trim() || 'Equipo';
        const clientName = checkIn.client?.name || 'Cliente';
        const idShort = checkIn.id ? `(#${checkIn.id.slice(-5)})` : '';
        broadcastPushNotification({
          title: '¡Equipo Aceptado! 🎉',
          body: `El equipo ${brandModel} ${idShort} de ${clientName} ha sido marcado como ACEPTADO.`,
          tag: `checkin-accepted-${id}`,
          data: { checkInId: id }
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating checkin:', error);
      res.status(500).json({ error: 'Error updating checkin' });
    }
  });

  app.delete('/api/checkins/:id', (req, res) => {
    try {
      const { id } = req.params;
      console.log('Deleting checkin:', id);
      db.prepare('DELETE FROM checkins WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting checkin:', error);
      res.status(500).json({ error: 'Error deleting checkin' });
    }
  });

  // Products
  app.get('/api/products', (req, res) => {
    const rows = db.prepare('SELECT data FROM products').all() as { data: string }[];
    const products = rows.map(row => JSON.parse(row.data));
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    const product = req.body;
    db.prepare('INSERT INTO products (id, data) VALUES (?, ?)').run(product.id, JSON.stringify(product));
    res.json({ success: true });
  });

  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const product = req.body;
    db.prepare('UPDATE products SET data = ? WHERE id = ?').run(JSON.stringify(product), id);
    res.json({ success: true });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true });
  });

  app.delete('/api/products', (req, res) => {
    try {
      db.prepare('DELETE FROM products').run();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Error clearing products' });
    }
  });

  // Clients
  app.get('/api/clients', (req, res) => {
    try {
      const rows = db.prepare('SELECT data FROM clients').all() as { data: string }[];
      const clients = rows.map(row => JSON.parse(row.data));
      res.json(clients);
    } catch (error) {
      console.error('Error getting clients:', error);
      res.status(500).json({ error: 'Error retrieving clients' });
    }
  });

  app.post('/api/clients', (req, res) => {
    try {
      const client = req.body;
      console.log('Saving new client:', client.id);
      db.prepare('INSERT INTO clients (id, data) VALUES (?, ?)').run(client.id, JSON.stringify(client));
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving client:', error);
      res.status(500).json({ error: 'Error saving client' });
    }
  });

  app.put('/api/clients/:id', (req, res) => {
    try {
      const { id } = req.params;
      const client = req.body;
      console.log('Updating client:', id);
      db.prepare('UPDATE clients SET data = ? WHERE id = ?').run(JSON.stringify(client), id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({ error: 'Error updating client' });
    }
  });

  app.delete('/api/clients/:id', (req, res) => {
    try {
      const { id } = req.params;
      console.log('Deleting client:', id);
      db.prepare('DELETE FROM clients WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({ error: 'Error deleting client' });
    }
  });

  // Sales
  app.get('/api/sales', (req, res) => {
    try {
      const rows = db.prepare('SELECT data FROM sales').all() as { data: string }[];
      const sales = rows.map(row => JSON.parse(row.data));
      sales.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(sales);
    } catch (error) {
      console.error('Error getting sales:', error);
      res.status(500).json({ error: 'Error retrieving sales' });
    }
  });

  app.post('/api/sales', (req, res) => {
    try {
      const sale = req.body;
      console.log('Saving new sale:', sale.id);
      db.prepare('INSERT INTO sales (id, data) VALUES (?, ?)').run(sale.id, JSON.stringify(sale));
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving sale:', error);
      res.status(500).json({ error: 'Error saving sale' });
    }
  });

  app.put('/api/sales/:id', (req, res) => {
    try {
      const { id } = req.params;
      const sale = req.body;
      console.log('Updating sale:', id);
      db.prepare('UPDATE sales SET data = ? WHERE id = ?').run(JSON.stringify(sale), id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating sale:', error);
      res.status(500).json({ error: 'Error updating sale' });
    }
  });

  app.delete('/api/sales/:id', (req, res) => {
    try {
      const { id } = req.params;
      console.log('Deleting sale:', id);
      db.prepare('DELETE FROM sales WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting sale:', error);
      res.status(500).json({ error: 'Error deleting sale' });
    }
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    try {
      const settings = db.prepare('SELECT * FROM company_settings WHERE id = ?').get('default');
      res.json(settings || { name: 'PrintLogicMx', address: '', phone: '', logo: '', email: '', website: '' });
    } catch (error) {
      console.error('Error getting settings:', error);
      res.status(500).json({ error: 'Error retrieving settings' });
    }
  });

  app.post('/api/settings', (req, res) => {
    try {
      console.log('Received settings update request');
      const { name, address, phone, logo, email, website } = req.body;
      
      // Ensure values are not undefined for SQLite
      const safeName = name || '';
      const safeAddress = address || '';
      const safePhone = phone || '';
      const safeLogo = logo || '';
      const safeEmail = email || '';
      const safeWebsite = website || '';

      const existing = db.prepare('SELECT id FROM company_settings WHERE id = ?').get('default');
      
      if (existing) {
        console.log('Updating existing settings');
        db.prepare(`
          UPDATE company_settings 
          SET name = ?, address = ?, phone = ?, logo = ?, email = ?, website = ? 
          WHERE id = 'default'
        `).run(safeName, safeAddress, safePhone, safeLogo, safeEmail, safeWebsite);
      } else {
        console.log('Creating new settings');
        db.prepare(`
          INSERT INTO company_settings (id, name, address, phone, logo, email, website) 
          VALUES ('default', ?, ?, ?, ?, ?, ?)
        `).run(safeName, safeAddress, safePhone, safeLogo, safeEmail, safeWebsite);
      }
      
      console.log('Settings saved successfully');
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ error: 'Error saving settings' });
    }
  });

  // Notification Push Endpoints (For Mobile Lock Screen & Background)
  app.get('/api/notifications/vapid-public-key', (req, res) => {
    res.json({ publicKey: vapidKeys.public_key });
  });

  app.post('/api/notifications/subscribe', (req, res) => {
    try {
      const { endpoint, keys } = req.body;
      if (!endpoint || !keys) {
        return res.status(400).json({ error: 'Missing endpoint or keys' });
      }
      const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      db.prepare(`
        INSERT INTO push_subscriptions (id, endpoint, keys, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(endpoint) DO UPDATE SET keys = excluded.keys
      `).run(id, endpoint, JSON.stringify(keys), new Date().toISOString());
      
      console.log('Push subscription registered for device');
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving push subscription:', error);
      res.status(500).json({ error: 'Error saving subscription' });
    }
  });

  app.post('/api/notifications/broadcast', async (req, res) => {
    try {
      const { title, body, data, tag } = req.body;
      await broadcastPushNotification({ title, body, data, tag });
      res.json({ success: true });
    } catch (error) {
      console.error('Error broadcasting push notification:', error);
      res.status(500).json({ error: 'Error sending push broadcast' });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
