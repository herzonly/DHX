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

if (!global.userMenuMessages) {
  global.userMenuMessages = {};
}

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

function createPaginationButtons(currentPage, totalPages) {
  const buttons = [];
  
  if (totalPages > 1) {
    const row = [];
    
    if (currentPage > 0) {
      row.push({
        text: '◀️ Previous',
        callback_data: `mnupg:${currentPage - 1}`
      });
    }
    
    row.push({
      text: `📄 ${currentPage + 1}/${totalPages}`,
      callback_data: `mnuinfo:page`
    });
    
    if (currentPage < totalPages - 1) {
      row.push({
        text: 'Next ▶️',
        callback_data: `mnupg:${currentPage + 1}`
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

function generateMenuText(category, user, page = 0) {
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
  
  return {
    text: pages[page] || pages[0],
    pages: pages,
    totalPages: pages.length
  };
}

async function showMenu(bot, chatId, category = null, user, replyToMessageId = null, page = 0, messageId = null, isEdit = false) {
  try {
    const menuData = generateMenuText(category, user, page);
    const currentPageText = menuData.text;
    const totalPages = menuData.totalPages;
    
    const keyboard = createReplyKeyboard();
    const inlineKeyboard = totalPages > 1 ? createPaginationButtons(page, totalPages) : null;
    
    if (!global.userMenuMessages[user.id]) {
      global.userMenuMessages[user.id] = {};
    }
    
    global.userMenuMessages[user.id].category = category;
    global.userMenuMessages[user.id].pages = menuData.pages;
    
    const localVideoPath = path.join(__dirname, '../assets/menu.mp4');
    
    if (isEdit && messageId) {
      try {
        await bot.telegram.editMessageCaption(
          chatId,
          messageId,
          null,
          currentPageText,
          {
            reply_markup: inlineKeyboard,
            parse_mode: "Markdown"
          }
        );
      } catch (editError) {
        if (editError.message && editError.message.includes('message is not modified')) {
          return;
        }
        
        if (global.userMenuMessages[user.id].messageId) {
          try {
            await bot.telegram.deleteMessage(chatId, global.userMenuMessages[user.id].messageId);
          } catch (e) {}
        }
        
        let sent;
        if (global.menuVideoFileId) {
          sent = await bot.telegram.sendVideo(chatId, global.menuVideoFileId, {
            caption: currentPageText,
            reply_markup: inlineKeyboard || keyboard,
            parse_mode: "Markdown"
          });
        } else {
          sent = await bot.telegram.sendMessage(chatId, currentPageText, {
            reply_markup: inlineKeyboard || keyboard,
            parse_mode: "Markdown"
          });
        }
        
        if (sent) {
          global.userMenuMessages[user.id].messageId = sent.message_id;
        }
      }
    } else {
      const userId = user.id;
      
      if (global.userMenuMessages[userId]?.messageId) {
        try {
          await bot.telegram.deleteMessage(chatId, global.userMenuMessages[userId].messageId);
        } catch (e) {}
      }
      
      let sent;
      if (!global.menuVideoFileId && fs.existsSync(localVideoPath)) {
        sent = await bot.telegram.sendVideo(chatId, { source: localVideoPath }, {
          caption: currentPageText,
          reply_markup: inlineKeyboard || keyboard,
          reply_to_message_id: replyToMessageId,
          parse_mode: "Markdown",
          supports_streaming: true
        });
        if (sent && sent.video && sent.video.file_id) {
          global.menuVideoFileId = sent.video.file_id;
        }
      } else if (global.menuVideoFileId) {
        sent = await bot.telegram.sendVideo(chatId, global.menuVideoFileId, {
          caption: currentPageText,
          reply_markup: inlineKeyboard || keyboard,
          reply_to_message_id: replyToMessageId,
          parse_mode: "Markdown"
        });
      } else {
        sent = await bot.telegram.sendMessage(chatId, currentPageText, {
          reply_markup: inlineKeyboard || keyboard,
          reply_to_message_id: replyToMessageId,
          parse_mode: "Markdown"
        });
      }
      
      if (sent) {
        global.userMenuMessages[userId].messageId = sent.message_id;
      }
    }
  } catch (e) {
    await bot.telegram.sendMessage(chatId, 'Error menampilkan menu. Silakan coba lagi.');
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
      
      category = categoryKey;
    }

    await showMenu(bot, chatId, category, m.from, m.message_id, 0);

  } catch (e) {
    await bot.telegram.sendMessage(chatId, 'Maaf, menu sedang error: ' + e.message);
  }
};

handler.before = async (m, { bot, chatId, user, ctx }) => {
  const text = m.text;
  
  if (text) {
    const categoryKey = findCategoryKey(text);
    if (categoryKey) {
      const userId = m.from.id;
      
      if (global.userMenuMessages[userId]?.messageId) {
        await showMenu(bot, chatId, categoryKey, m.from, null, 0, global.userMenuMessages[userId].messageId, true);
      } else {
        await showMenu(bot, chatId, categoryKey, m.from, m.message_id, 0);
      }
      return true;
    }
  }
  
  return false;
};

handler.callback = async (ctx, bot) => {
  try {
    const data = ctx.callbackQuery?.data;
    
    if (!data) return false;
    
    if (data.startsWith('mnupg:')) {
      const page = parseInt(data.replace('mnupg:', ''));
      const user = ctx.from;
      const chatId = ctx.chat.id;
      const messageId = ctx.callbackQuery.message.message_id;
      
      const userMenuData = global.userMenuMessages[user.id];
      
      if (userMenuData) {
        await ctx.answerCbQuery();
        await showMenu(bot, chatId, userMenuData.category, user, null, page, messageId, true);
        return true;
      }
      
      await ctx.answerCbQuery('Session expired, silakan request menu lagi');
      return true;
    }
    
    if (data.startsWith('mnuinfo:')) {
      await ctx.answerCbQuery('📄 Menu Pagination');
      return true;
    }
    
    return false;
  } catch (e) {
    try {
      await ctx.answerCbQuery('Error loading page');
    } catch (err) {}
    return false;
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

module.exports = handler;
