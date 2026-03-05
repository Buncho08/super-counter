/**
 * カウンター API サーバー
 * - GET  /api/counter       → 現在の値を返す
 * - POST /api/counter/inc   → +1
 * - POST /api/counter/dec   → -1
 * - WebSocket ws://host:3001 → 値の変更をリアルタイム配信
 */
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

const { Pool } = pg;

const pool = new Pool({
  host: 'db',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
});

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// --- WebSocket ---
function broadcast(value) {
  const msg = JSON.stringify({ value });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

wss.on('connection', async (ws) => {
  // 接続時に現在の値を送信
  try {
    const { rows } = await pool.query(
      "SELECT value FROM counters WHERE name = 'default' LIMIT 1"
    );
    if (rows.length > 0) {
      ws.send(JSON.stringify({ value: rows[0].value }));
    }
  } catch (err) {
    console.error('ws init error:', err);
  }
});

// --- REST API ---
app.get('/api/counter', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT value FROM counters WHERE name = 'default' LIMIT 1"
    );
    res.json({ value: rows[0]?.value ?? 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

app.post('/api/counter/inc', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE counters SET value = value + 1, updated_at = now() WHERE name = 'default' RETURNING value"
    );
    const value = rows[0].value;
    broadcast(value);
    res.json({ value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

app.post('/api/counter/dec', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE counters SET value = GREATEST(value - 1, 0), updated_at = now() WHERE name = 'default' RETURNING value"
    );
    const value = rows[0].value;
    broadcast(value);
    res.json({ value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Counter API server running on http://0.0.0.0:${PORT}`);
});
