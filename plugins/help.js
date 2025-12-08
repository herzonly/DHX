const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

let arrayMenu = [
  'main', 'ai', 'downloader', 'rpg', 'sticker', 'rpgG',
  'advanced', 'xp', 'fun', 'game', 'github', 'group',
  'image', 'nsfw', 'info', 'internet', 'islam', 'kerang',
  'maker', 'news', 'owner', 'voice', 'quotes', 'stalk',
  'store', 'shortlink', 'tools', 'anonymous',
];

const allTags = {
  'main': '🏠 UTAMA',
  'ai': '🤖 AI',
  'downloader': '📥 DOWNLOAD',
  'rpg': '⚔️ RPG',
  'rpgG': '🏰 GUILD',
  'sticker': '🎨 CONVERT',
  'advanced': '⚙️ ADVANCED',
  'xp': '⭐ EXP',
  'fun': '🎉 FUN',
  'game': '🎮 GAME',
  'github': '💻 GITHUB',
  'group': '👥 GROUP',
  'image': '🖼️ IMAGE',
  'nsfw': '🔞 NSFW',
  'info': 'ℹ️ INFO',
  'internet': '🌐 INTERNET',
  'islam': '🕌 ISLAMI',
  'kerang': '🐚 KERANG',
  'maker': '🛠️ MAKER',
  'news': '📰 NEWS',
  'owner': '👑 OWNER',
  'voice': '🎤 VOICE',
  'quotes': '💬 QUOTES',
  'stalk': '🔍 STALK',
  'store': '🛒 STORE',
  'shortlink': '🔗 LINK',
  'tools': '🔧 TOOLS',
  'anonymous': '👤 ANON'
};

const defaultMenu = {
  before: `
╭━━━━━━━━━━━━━━━━
┃ 👤 *Hai, %name!*
┃ 🤖 *Bot Assistant*
┃ ⏱️ *Uptime:* %uptime
┃ 📅 *%date*
┃ 🕐 *%time*
╰━━━━━━━━━━━━━━━━
`.trimStart(),
  header: '\n╭─「 *%category* 」',
  body: '│ • %cmd %islimit %isPremium',
  footer: '╰────────────',
  after: '\n\n💡 *Pilih kategori menu:*'
};

let menuCache = {};
let cacheExpiry = 0;
const CACHE_DURATION = 60000;

function createMenuButtons(selectedCategory = null) {
  let buttons = [];
  
  if (!selectedCategory) {
    let row = [];
    arrayMenu.forEach((tag, index) => {
      row.push({
        text: allTags[tag],
        callback_data: `menu_${tag}`
      });
      
      if (row.length === 2 || index === arrayMenu.length - 1) {
        buttons.push(row);
        row = [];
      }
    });
  } else {
    buttons.push([
      {
        text: '🔙 Kembali',
        callback_data: 'menu_back'
      },
      {
        text: '🏠 Menu Utama',
        callback_data: 'menu_home'
      }
    ]);
  }
  
  return buttons;
}

function truncateText(text, maxLength = 1000) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 50) + '\n\n... (Terlalu panjang, gunakan /menu <kategori>)';
}

async function showMenu(bot, chatId, messageId = null, category = null, user) {
  let userName = user.first_name || 'User';
  
  let d = new Date(new Date() + 3600000);
  let locale = 'id';
  let date = d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let time = d.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  });

  let _uptime = process.uptime() * 1000;
  let uptime = clockString(_uptime);
  
  let usedPrefix = '/';
  
  let cacheKey = category || 'full';
  let now = Date.now();
  
  if (!menuCache[cacheKey] || now > cacheExpiry) {
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit || false,
        premium: plugin.premium || false,
        enabled: !plugin.disabled,
      };
    });

    let menuText = '';

    if (category) {
      if (arrayMenu.includes(category)) {
        menuText += defaultMenu.before;
        menuText += '\n' + defaultMenu.header.replace('%category', allTags[category] || category.toUpperCase()) + '\n';

        let categoryHelp = help.filter(menu => menu.tags && menu.tags.includes(category) && menu.help);

        for (let menu of categoryHelp) {
          for (let helpCmd of menu.help) {
            let cmdName = menu.prefix ? helpCmd : usedPrefix + helpCmd;
            let limitTag = menu.limit ? ' ⭐' : '';
            let premiumTag = menu.premium ? ' 💎' : '';
            menuText += defaultMenu.body
              .replace('%cmd', cmdName)
              .replace('%islimit', limitTag)
              .replace('%isPremium', premiumTag) + '\n';
          }
        }

        menuText += defaultMenu.footer;
      }
    } else {
      menuText += defaultMenu.before;
      menuText += defaultMenu.after;
    }

    menuCache[cacheKey] = menuText;
    cacheExpiry = now + CACHE_DURATION;
  }

  let text = menuCache[cacheKey];
  let replace = {
    '%': '%',
    p: usedPrefix,
    uptime,
    name: userName,
    date,
    time
  };

  text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'),
    (_, name) => '' + replace[name]);

  text = truncateText(text, 1000);

  const buttons = createMenuButtons(category);
  const keyboard = {
    inline_keyboard: buttons
  };

  const localVideoPath = path.join(__dirname, '../assets/menu.mp4');
  
  if (messageId) {
    try {
      await bot.editMessageCaption(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (e) {
      if (e.message && e.message.includes('message is not modified')) {
        return;
      }
      console.error('Error editing message:', e);
      try {
        await bot.telegram.deleteMessage(chatId, messageId);
        await showMenu(bot, chatId, null, category, user);
      } catch (deleteError) {
        console.error('Error deleting message:', deleteError);
      }
    }
  } else {
    try {
      if (!global.menuVideoFileId && fs.existsSync(localVideoPath)) {
        const sent = await bot.telegram.sendVideo(chatId, { source: localVideoPath }, {
          caption: text,
          parse_mode: 'Markdown',
          reply_markup: keyboard,
          supports_streaming: true
        });
        if (sent && sent.video && sent.video.file_id) {
          global.menuVideoFileId = sent.video.file_id;
        }
      } else if (global.menuVideoFileId) {
        await bot.telegram.sendVideo(chatId, global.menuVideoFileId, {
          caption: text,
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      } else {
        await bot.telegram.sendMessage(chatId, text, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      }
    } catch (e) {
      console.error('Error sending menu:', e);
      try {
        await bot.telegram.sendMessage(chatId, text, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      } catch (fallbackError) {
        await bot.telegram.sendMessage(chatId, '❌ Error menampilkan menu. Silakan coba lagi.');
      }
    }
  }
}

let handler = async (m, { bot, chatId, args }) => {
  try {
    let user = global.db.data.users[m.from.id];
    if (!user) {
      user = {
        exp: 0,
        limit: 10,
        premium: false
      };
      global.db.data.users[m.from.id] = user;
    }

    let category = args[0] ? args[0].toLowerCase() : null;
    
    if (category && !arrayMenu.includes(category)) {
      let errorText = '❌ *Kategori tidak ditemukan!*\n\n';
      errorText += '*Kategori yang tersedia:*\n';
      arrayMenu.slice(0, 10).forEach(tag => {
        errorText += `• ${allTags[tag]}\n`;
      });
      errorText += '\n_Gunakan /menu untuk melihat semua kategori_';
      
      await bot.telegram.sendMessage(chatId, errorText, {
        parse_mode: 'Markdown',
        reply_to_message_id: m.message_id
      });
      return;
    }

    await showMenu(bot, chatId, null, category, m.from);

  } catch (e) {
    console.error(e);
    await bot.telegram.sendMessage(chatId, '❌ Maaf, menu sedang error: ' + e.message);
  }
};

function clockString(ms) {
  if (isNaN(ms)) return '--';
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

handler.help = ['menu', 'help'];
handler.tags = ['main'];
handler.command = /^(menu|help|\?)$/i;
handler.exp = 3;

handler.handleCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  
  try {
    await bot.telegram.answerCbQuery(callbackQuery.id);
    
    if (data === 'menu_back' || data === 'menu_home') {
      await showMenu(bot, chatId, messageId, null, callbackQuery.from);
    } else if (data.startsWith('menu_')) {
      const category = data.replace('menu_', '');
      if (arrayMenu.includes(category)) {
        await showMenu(bot, chatId, messageId, category, callbackQuery.from);
      }
    }
  } catch (e) {
    console.error('Error handling callback:', e);
    try {
      await bot.telegram.answerCbQuery(callbackQuery.id, {
        text: '❌ Error: ' + e.message,
        show_alert: true
      });
    } catch (answerError) {
      console.error('Error answering callback:', answerError);
    }
  }
};

module.exports = handler;