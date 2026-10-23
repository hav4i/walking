import { createServer } from 'node:http';
import { parse } from 'node:url';

const PORT = process.env.PORT || 3001;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const { pathname } = parse(req.url);

  if (pathname === '/api/send-telegram' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Telegram credentials not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.'
          }));
          return;
        }

        const message = formatTelegramMessage(data);

        // Split message if too long (Telegram limit is 4096 chars)
        const messages = splitMessage(message);

        let allSuccess = true;
        for (const msg of messages) {
          const telegramRes = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: msg,
                parse_mode: 'HTML'
              })
            }
          );
          if (!telegramRes.ok) allSuccess = false;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: allSuccess }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
      }
    });
    return;
  }

  // НОВЫЙ ЭНДПОИНТ: Отправка событий в реальном времени
  if (pathname === '/api/send-event' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Telegram not configured' }));
          return;
        }

        const message = formatEventMessage(data);

        const telegramRes = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: message,
              parse_mode: 'HTML'
            })
          }
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: telegramRes.ok }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

function formatTelegramMessage(data) {
  const lines = [
    '💌 <b>НОВОЕ ПРИГЛАШЕНИЕ!</b>',
    '━━━━━━━━━━━━━━━━━━━━',
    `📍 <b>Место встречи:</b> ${data.location || '-'}`,
    `📅 <b>Дата:</b> ${data.date || '-'}`,
    `🕒 <b>Время:</b> ${data.time || '-'}`,
    '━━━━━━━━━━━━━━━━━━━━',
  ];

  // Напитки
  if (data.drinks && data.drinks.length > 0) {
    lines.push('<b>☕ Напитки:</b>');
    lines.push(data.drinks.join(', '));
  } else {
    lines.push('<b>☕ Напитки:</b> Не выбрано');
  }

  // Формат прогулки
  if (data.walks && data.walks.length > 0) {
    lines.push('<b>🚶 Формат прогулки:</b>');
    lines.push(data.walks.join(', '));
  } else {
    lines.push('<b>🚶 Формат прогулки:</b> Не выбрано');
  }

  // Что берём с собой
  if (data.inventory && data.inventory.length > 0) {
    lines.push('<b>🎒 Что берём с собой:</b>');
    lines.push(data.inventory.join(', '));
  } else {
    lines.push('<b>🎒 Что берём с собой:</b> Не выбрано');
  }

  // Чем займёмся
  if (data.activity && data.activity.length > 0) {
    lines.push('<b>🎯 Чем займёмся:</b>');
    lines.push(data.activity.join(', '));
  } else {
    lines.push('<b>🎯 Чем займёмся:</b> Не выбрано');
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('<b>❤️ Приглашение сформировано на сайте.</b>');
  lines.push(`<b>Игра:</b> YOU VS HER`);

  return lines.join('\n');
}

// Форматирование событий (реальное время)
function formatEventMessage(data) {
  const now = new Date().toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const eventType = data.eventType;
  const lines = [];

  if (eventType === 'heart_loss') {
    lines.push('💔 <b>Потеря сердечка!</b>');
    lines.push('━━━━━━━━━━━━━━━━━━━━');
    lines.push(`<b>Раунд:</b> ${data.round || '?'}`);
    lines.push(`<b>Причина:</b> ${data.reason || '-'}`);
    lines.push(`<b>Сердечек было:</b> ${data.prevHealth} из ${data.maxHealth}`);
    lines.push(`<b>Сердечек осталось:</b> ${data.newHealth} из ${data.maxHealth}`);
    lines.push(`<b>Время:</b> ${now}`);
  } else if (eventType === 'game_over') {
    lines.push('💀 <b>ИГРА ЗАВЕРШЕНА</b>');
    lines.push('━━━━━━━━━━━━━━━━━━━━');
    lines.push(`<b>Раунд:</b> ${data.round || '?'}`);
    lines.push(`<b>Причина:</b> ${data.reason || '-'}`);
    lines.push(`<b>Итог:</b> Все сердечки потеряны`);
    lines.push(`<b>Время:</b> ${now}`);
  } else if (eventType === 'quit') {
    lines.push('🚫 <b>ОТКАЗ ОТ УЧАСТИЯ</b>');
    lines.push('━━━━━━━━━━━━━━━━━━━━');
    lines.push(`<b>Раунд:</b> ${data.round || '?'}`);
    lines.push(`<b>Выбор:</b> ${data.reason || '-'}`);
    lines.push(`<b>Сердечек было:</b> ${data.prevHealth} из ${data.maxHealth}`);
    lines.push(`<b>Сердечек осталось:</b> ${data.newHealth} из ${data.maxHealth}`);
    lines.push(`<b>Время:</b> ${now}`);
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('<b>🎮 YOU VS HER</b>');

  return lines.join('\n');
}

function splitMessage(msg, limit = 4096) {
  if (msg.length <= limit) return [msg];
  const parts = [];
  const lines = msg.split('\n');
  let current = '';
  for (const line of lines) {
    if ((current + '\n' + line).length > limit - 10) {
      if (current) parts.push(current);
      current = line;
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes} мин ${secs} сек`;
}

server.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('⚠️ Telegram not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to enable.');
  }
});
