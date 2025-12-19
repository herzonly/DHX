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
  'main': 'UTAMA',
  'ai': 'AI',
  'downloader': 'DOWNLOAD',
  'rpg': 'RPG',
  'rpgG': 'GUILD',
  'sticker': 'CONVERT',
  'advanced': 'ADVANCED',
  'xp': 'EXP',
  'fun': 'FUN',
  'game': 'GAME',
  'github': 'GITHUB',
  'group': 'GROUP',
  'image': 'IMAGE',
  'nsfw': 'NSFW',
  'info': 'INFO',
  'internet': 'INTERNET',
  'islam': 'ISLAMI',
  'kerang': 'KERANG',
  'maker': 'MAKER',
  'news': 'NEWS',
  'owner': 'OWNER',
  'voice': 'VOICE',
  'quotes': 'QUOTES',
  'stalk': 'STALK',
  'store': 'STORE',
  'shortlink': 'LINK',
  'tools': 'TOOLS',
  'anonymous': 'ANON'
};

const defaultMenu = {
  before: `
━━━━━━━━━━━━━━━━
Hi, %name!
I am an automated system (Telegram Bot) that can help to do something, search and get data / information only through Telegram.

◦ *Library:* Telegraf
◦ *Function:* Assistant
┌  ◦ Uptime : %uptime
│  ◦ Tanggal : %date
│  ◦ Waktu : %time
└  ◦ Prefix Used : *[ %p ]*

Note 
🌟 : Premium feature
⭐ : Limit feature
━━━━━━━━━━━━━━━━
`.trimStart(),
  header: '\n「 %category 」',
  body: '• %cmd %islimit %isPremium',
  footer: '────────────',
  after: '\n\nSelect menu categories:'
};

let menuCache = {};
let cacheExpiry = 0;
const CACHE_DURATION = 60000;
const MAX_MESSAGE_LENGTH = 1000;

function createReplyKeyboard() {
  let buttons = [];
  let row = [];
  
  arrayMenu.forEach((tag, index) => {
    row.push(allTags[tag]);
    
    if (row.length === 2 || index === arrayMenu.length - 1) {
      buttons.push(row);
      row = [];
    }
  });
  
  return {
    keyboard: buttons,
    resize_keyboard: true,
    one_time_keyboard: false
  };
}

function splitMenuText(text, maxLength = MAX_MESSAGE_LENGTH) {
  const lines = text.split('\n');
  const pages = [];
  let currentPage = '';
  let headerText = '';
  let footerText = '';
  let inContent = false;
  
  for (let line of lines) {
    if (line.includes('━━━━━━━━━━━━━━━━') && !inContent) {
      headerText += line + '\n';
      continue;
    }
    
    if (line.includes('「') && line.includes('」')) {
      headerText += line + '\n';
      inContent = true;
      continue;
    }
    
    if (line.includes('────────────')) {
      footerText = line + '\n';
      break;
    }
    
    if (!inContent) {
      headerText += line + '\n';
      continue;
    }
    
    const testPage = currentPage + line + '\n';
    if ((headerText + testPage + footerText).length > maxLength) {
      if (currentPage) {
        pages.push(headerText + currentPage + footerText);
        currentPage = '';
      }
    }
    currentPage += line + '\n';
  }
  
  if (currentPage) {
    pages.push(headerText + currentPage + footerText);
  }
  
  return pages.length > 0 ? pages : [text];
}

function createPaginationButtons(currentPage, totalPages, category) {
  const buttons = [];
  
  if (totalPages > 1) {
    const row = [];
    
    if (currentPage > 0) {
      row.push({
        text: '◀️ Previous',
        callback_data: `menu_page:${category}:${currentPage - 1}`
      });
    }
    
    row.push({
      text: `${currentPage + 1}/${totalPages}`,
      callback_data: `menu_page:${category}:${currentPage}`
    });
    
    if (currentPage < totalPages - 1) {
      row.push({
        text: 'Next ▶️',
        callback_data: `menu_page:${category}:${currentPage + 1}`
      });
    }
    
    buttons.push(row);
  }
  
  return {
    inline_keyboard: buttons
  };
}

function findCategoryKey(input) {
  if (!input) return null;
  
  const inputLower = input.toLowerCase();
  
  const exactMatch = arrayMenu.find(key => key.toLowerCase() === inputLower);
  if (exactMatch) return exactMatch;
  
  const tagMatch = Object.keys(allTags).find(key => allTags[key].toLowerCase() === inputLower);
  if (tagMatch) return tagMatch;
  
  return null;
}

async function showMenu(bot, chatId, category = null, user, replyToMessageId = null, page = 0) {
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
      const categoryKey = findCategoryKey(category);
      
      if (categoryKey && arrayMenu.includes(categoryKey)) {
        menuText += defaultMenu.before;
        menuText += '\n' + defaultMenu.header.replace('%category', allTags[categoryKey] || categoryKey.toUpperCase()) + '\n';

        let categoryHelp = help.filter(menu => menu.tags && menu.tags.includes(categoryKey) && menu.help);

        for (let menu of categoryHelp) {
          for (let helpCmd of menu.help) {
            let cmdName = menu.prefix ? helpCmd : usedPrefix + helpCmd;
            let limitTag = menu.limit ? ' ⭐' : '';
            let premiumTag = menu.premium ? ' 🌟' : '';
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

  const pages = splitMenuText(text, MAX_MESSAGE_LENGTH);
  const totalPages = pages.length;
  
  if (page >= totalPages) page = totalPages - 1;
  if (page < 0) page = 0;
  
  const currentPageText = pages[page];
  const keyboard = createReplyKeyboard();
  const inlineKeyboard = totalPages > 1 ? createPaginationButtons(page, totalPages, category || 'main') : null;
  
  const localVideoPath = path.join(__dirname, '../assets/menu.mp4');
  
  try {
    if (category && totalPages > 1) {
      await bot.telegram.sendMessage(chatId, currentPageText, {
        reply_markup: inlineKeyboard,
        reply_to_message_id: replyToMessageId,
        parse_mode: "Markdown"
      });
    } else {
      if (!global.menuVideoFileId && fs.existsSync(localVideoPath)) {
        const sent = await bot.telegram.sendVideo(chatId, { source: localVideoPath }, {
          caption: currentPageText,
          reply_markup: keyboard,
          reply_to_message_id: replyToMessageId,
          parse_mode: "Markdown",
          supports_streaming: true
        });
        if (sent && sent.video && sent.video.file_id) {
          global.menuVideoFileId = sent.video.file_id;
        }
      } else if (global.menuVideoFileId) {
        await bot.telegram.sendVideo(chatId, global.menuVideoFileId, {
          caption: currentPageText,
          reply_markup: keyboard,
          reply_to_message_id: replyToMessageId,
          parse_mode: "Markdown"
        });
      } else {
        await bot.telegram.sendMessage(chatId, currentPageText, {
          reply_markup: keyboard,
          reply_to_message_id: replyToMessageId,
          parse_mode: "Markdown"
        });
      }
    }
  } catch (e) {
    console.error('Error sending menu:', e);
    try {
      await bot.telegram.sendMessage(chatId, currentPageText, {
        reply_markup: inlineKeyboard || keyboard,
        reply_to_message_id: replyToMessageId,
        parse_mode: "Markdown"
      });
    } catch (fallbackError) {
      await bot.telegram.sendMessage(chatId, 'Error menampilkan menu. Silakan coba lagi.');
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

    let category = args[0] ? args[0] : null;
    
    if (category) {
      const categoryKey = findCategoryKey(category);
      
      if (!categoryKey) {
        await bot.telegram.sendMessage(chatId, 'Menu with this tags is not available', {
          reply_to_message_id: m.message_id
        });
        return;
      }
      
      category = allTags[categoryKey];
    }

    await showMenu(bot, chatId, category, m.from, m.message_id, 0);

  } catch (e) {
    console.error(e);
    await bot.telegram.sendMessage(chatId, 'Maaf, menu sedang error: ' + e.message);
  }
};

handler.before = async (m, { bot, chatId, user }) => {
  const text = m.text;
  
  if (text) {
    const categoryKey = findCategoryKey(text);
    if (categoryKey) {
      await showMenu(bot, chatId, allTags[categoryKey], m.from, m.message_id, 0);
      return true;
    }
  }
  
  return false;
};

bot.action(/menu_page:(.+):(\d+)/, async (ctx) => {
  try {
    const category = ctx.match[1];
    const page = parseInt(ctx.match[2]);
    
    await ctx.answerCbQuery();
    
    await ctx.deleteMessage();
    
    await showMenu(bot, ctx.chat.id, category, ctx.from, null, page);
  } catch (e) {
    console.error('Error handling pagination:', e);
    await ctx.answerCbQuery('Error loading page');
  }
});

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

module.exports = handler;
