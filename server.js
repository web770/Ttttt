// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // для JSON-body
app.use(express.static('public')); // віддаємо фронтенд з папки public

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!TOKEN || !CHAT_ID) {
  console.error('Будь ласка, встановіть TELEGRAM_TOKEN і CHAT_ID в .env');
  process.exit(1);
}

app.post('/send', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ ok: false, error: 'Порожнє повідомлення' });
    }

    // Обмеження довжини (Telegram дозволяє досить багато, але надійно)
    const safeText = text.trim().slice(0, 4000);

    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    const resp = await axios.post(url, {
      chat_id: CHAT_ID,
      text: safeText,
      parse_mode: 'HTML' // або 'MarkdownV2' якщо треба
    });

    if (resp.data && resp.data.ok) {
      return res.json({ ok: true, result: resp.data.result });
    } else {
      return res.status(500).json({ ok: false, error: 'Telegram error', details: resp.data });
    }
  } catch (err) {
    console.error('Error sending to Telegram:', err?.response?.data || err.message || err);
    return res.status(500).json({ ok: false, error: 'Server error', details: err?.response?.data || err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
