const util = require('util');
const moment = require('moment-timezone');
const { smsg } = require('./lib/simple');
const fs = require('fs');
const chalk = require('chalk');
const print = require('./lib/print');

const defaultUserData = {
  exp: 0,
  limit: 80,
  lastLimitReset: 0,
  atm: 0,
  lastpractice: 0,
  pickaxe: 0,
  banteng: 0,
  bosbattle: 0,
  lastberburu: 0,
  lastbossbattle: 0,
  lastRestCommand: 0,
  harimau: 0,
  restActive: false,
  lastRest: 0,
  maxStamina: 100,
  fishingrod: 0,
  babihutan: 0,
  sworddurability: 0,
  pickaxedurability: 0,
  fishingroddurability: 0,
  armordurability: 0,
  lasthunt: 0,
  gajah: 0,
  kambing: 0,
  panda: 0,
  buaya: 0,
  kerbau: 0,
  sapi: 0,
  monyet: 0,
  babi: 0,
  ayam: 0,
  anjing: 0,
  gelas: 0,
  plastik: 0,
  lastclaim: 0,
  lastkerja: 0,
  lastjb: 0,
  lastngojek: 0,
  ojekk: 0,
  registered: false,
  name: "User",
  usertag: "user",
  age: -1,
  regTime: -1,
  afk: -1,
  afkReason: '',
  bank: 0,
  berlian: 0,
  banned: false,
  cat: 0,
  coal: 0,
  level: 0,
  lastnambang: 0,
  lastnsmbang: 0,
  lastrob: 0,
  role: 'Beginner',
  autolevelup: true,
  premium: false,
  paus: 0,
  kepiting: 0,
  gurita: 0,
  cumi: 0,
  buntal: 0,
  dory: 0,
  lumba: 0,
  lobster: 0,
  hiu: 0,
  udang: 0,
  ikan: 0,
  orca: 0,
  premiumTime: 0,
  money: 0,
  potion: 0,
  diamond: 0,
  common: 0,
  uncommon: 0,
  mythic: 0,
  legendary: 0,
  sampah: 0,
  armor: 0,
  string: 0,
  iron: 0,
  sword: 0,
  batu: 0,
  botol: 0,
  kaleng: 0,
  kardus: 0,
  kayu: 0,
  emas: 0,
  emasbatang: 0,
  bensin: 0,
  weapon: 0,
  obat: 0,
  pisang: 0,
  anggur: 0,
  mangga: 0,
  jeruk: 0,
  apel: 0,
  bibitpisang: 0,
  bibitanggur: 0,
  bibitmangga: 0,
  bibitjeruk: 0,
  bibitapel: 0,
  gardenboxs: 0,
  makananpet: 0,
  makanannaga: 0,
  makanankyubi: 0,
  makanangriffin: 0,
  makananphonix: 0,
  makanancentaur: 0,
  aqua: 0,
  pancingan: 0,
  umpan: 0,
  pet: 0,
  phonix: 0,
  anakphonix: 0,
  phonixlastclaim: 0,
  griffin: 0,
  anakgriffin: 0,
  griffinlastclaim: 0,
  kyubi: 0,
  anakkyubi: 0,
  kyubilastclaim: 0,
  naga: 0,
  anaknaga: 0,
  nagalastclaim: 0,
  centaur: 0,
  anakcentaur: 0,
  centaurlastclaim: 0,
  kuda: 0,
  anakkuda: 0,
  kudalastclaim: 0,
  rubah: 0,
  anakrubah: 0,
  rubahlastclaim: 0,
  kucing: 0,
  anakkucing: 0,
  kucinglastclaim: 0,
  serigala: 0,
  anakserigala: 0,
  serigalalastclaim: 0,
  hero: 0,
  exphero: 0,
  health: 100,
  monster: null,
  stamina: 100,
  energyCooldown: 0,
  cupon: 0,
  expg: 0,
  healtmonster: 0,
  tiketcoin: 0,
  boxs: 0,
  ramuan: 0,
  lastadventure: 0,
  healt: 100,
  ayambakar: 0,
  ayamgoreng: 0,
  rendang: 0,
  steak: 0,
  babipanggang: 0,
  gulaiayam: 0,
  oporayam: 0,
  vodka: 0,
  sushi: 0,
  bandage: 0,
  ganja: 0,
  soda: 0,
  roti: 0,
  ikanbakar: 0,
  lelebakar: 0,
  nilabakar: 0,
  bawalbakar: 0,
  udangbakar: 0,
  pausbakar: 0,
  kepitingbakar: 0,
  ojek: false,
  pedagang: false,
  dokter: false,
  petani: false,
  montir: false,
  kuli: false
};

const defaultChatData = {
  isBanned: false,
  welcome: true,
  sWelcome: '',
  sLeave: '',
  sPromote: '',
  sDemote: '',
  antiLink: false,
  antiBot: false,
  antiChannel: false,
  antiVideo: false,
  antiToxic: false,
  antiNSFW: false,
  detect: false,
  desc: true,
  delete: true,
  autoDL: false,
  viewonce: false,
  autotr: false,
  ngetik: true,
  expired: 0,
  allakses: true,
  autokick: false,
  participants: []
};

async function handleCallback(bot, ctx) {
  for (let name in global.plugins) {
    let plugin = global.plugins[name];
    if (!plugin) continue;
    if (plugin.disabled) continue;
    
    if (typeof plugin.callback === 'function') {
      try {
        const result = await plugin.callback(ctx, bot);
        if (result === true) {
          return true;
        }
      } catch (e) {
        console.error(`Error in ${name}.callback:`, e);
      }
    }
  }
  return false;
}

async function handleWelcome(bot, ctx) {
  try {
    const chatId = ctx.chat.id;
    
    if (!global.db.data.chats[chatId]) {
      global.db.data.chats[chatId] = { ...defaultChatData };
    }
    
    const chat = global.db.data.chats[chatId];
    
    for (const member of ctx.message.new_chat_members) {
      if (member.id === ctx.botInfo.id) continue;
      
      if (!chat.participants) {
        chat.participants = [];
      }
      
      if (!chat.participants.includes(member.id)) {
        chat.participants.push(member.id);
      }
    }
    
    if (chat && chat.welcome) {
      const newMembers = ctx.message.new_chat_members;
      const groupMetadata = await bot.groupMetadata(chatId);
      
      for (const member of newMembers) {
        if (member.id === ctx.botInfo.id) continue;
        
        const userName = member.first_name + (member.last_name ? ' ' + member.last_name : '');
        const userMention = member.username ? `@${member.username}` : `[${userName}](tg://user?id=${member.id})`;
        const groupName = groupMetadata.subject;
        const groupDesc = groupMetadata.desc || 'Tidak ada deskripsi';
        
        let welcomeMessage;
        if (chat.sWelcome) {
          welcomeMessage = chat.sWelcome
            .replace(/@user/gi, userMention)
            .replace(/@subject/gi, groupName)
            .replace(/@desc/gi, groupDesc);
        } else {
          welcomeMessage = `Selamat Datang!\n\nHalo ${userMention}!\nSelamat datang di ${groupName}\n\nSemoga betah dan jangan lupa baca deskripsi grup ya!`;
        }
        
        try {
          if (groupMetadata.photo) {
            await ctx.replyWithPhoto({ source: groupMetadata.photo }, {
              caption: welcomeMessage,
              reply_to_message_id: ctx.message.message_id,
              parse_mode: 'Markdown'
            });
          } else {
            await ctx.reply(welcomeMessage, {
              reply_to_message_id: ctx.message.message_id,
              parse_mode: 'Markdown'
            });
          }
        } catch (e) {
          await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
        }
      }
    }
  } catch (error) {
    console.error('Error in welcome handler:', error);
  }
}

async function handleGoodbye(bot, ctx) {
  try {
    const chatId = ctx.chat.id;
    
    if (!global.db.data.chats[chatId]) {
      global.db.data.chats[chatId] = { ...defaultChatData };
    }
    
    const chat = global.db.data.chats[chatId];
    const leftMember = ctx.message.left_chat_member;
    
    if (chat.participants) {
      const index = chat.participants.indexOf(leftMember.id);
      if (index > -1) {
        chat.participants.splice(index, 1);
      }
    }
    
    if (chat && chat.welcome) {
      if (leftMember.id !== ctx.botInfo.id) {
        const userName = leftMember.first_name + (leftMember.last_name ? ' ' + leftMember.last_name : '');
        const userMention = leftMember.username ? `@${leftMember.username}` : `[${userName}](tg://user?id=${leftMember.id})`;
        const groupMetadata = await bot.groupMetadata(chatId);
        const groupName = groupMetadata.subject;
        
        let goodbyeMessage;
        if (chat.sLeave) {
          goodbyeMessage = chat.sLeave
            .replace(/@user/gi, userMention)
            .replace(/@subject/gi, groupName);
        } else {
          goodbyeMessage = `Sampai Jumpa!\n\n${userMention} telah meninggalkan grup ${groupName}\n\nSemoga sukses selalu!`;
        }
        
        try {
          await ctx.reply(goodbyeMessage, { parse_mode: 'Markdown' });
        } catch (e) {
          await ctx.reply(goodbyeMessage, { parse_mode: 'Markdown' });
        }
      }
    }
  } catch (error) {
    console.error('Error in goodbye handler:', error);
  }
}

function initializeUserData(userId, m) {
  if (!global.db.data.users) {
    global.db.data.users = {};
  }

  if (!global.db.data.users[userId]) {
    global.db.data.users[userId] = { ...defaultUserData };
    global.db.data.users[userId].name = m.from.first_name || 'User';
    global.db.data.users[userId].usertag = m.from.username ? '@' + m.from.username : 'user';
  }

  let user = global.db.data.users[userId];
  
  for (let key in defaultUserData) {
    if (user[key] === undefined || user[key] === null || (typeof user[key] === 'number' && isNaN(user[key]))) {
      user[key] = defaultUserData[key];
    }
  }

  const now = Date.now();
  const lastReset = user.lastLimitReset || 0;
  const jakartaTime = moment.tz('Asia/Jakarta');
  const lastResetTime = moment(lastReset).tz('Asia/Jakarta');
  
  if (lastReset === 0 || !jakartaTime.isSame(lastResetTime, 'day') || (jakartaTime.hour() === 0 && lastResetTime.hour() !== 0)) {
    user.limit = 80;
    user.lastLimitReset = now;
  }

  if (user.name === 'User' && m.from.first_name) {
    user.name = m.from.first_name + (m.from.last_name ? ' ' + m.from.last_name : '');
  }
    
  if (user.usertag === 'user' && m.from.username) {
    user.usertag = '@' + m.from.username;
  }

  return user;
}

function initializeChatData(chatId, userId, isGroup) {
  if (!global.db.data.chats) {
    global.db.data.chats = {};
  }

  if (!global.db.data.chats[chatId]) {
    global.db.data.chats[chatId] = { ...defaultChatData };
  }

  let chat = global.db.data.chats[chatId];
  
  for (let key in defaultChatData) {
    if (chat[key] === undefined || chat[key] === null) {
      chat[key] = defaultChatData[key];
    }
  }

  if (isGroup) {
    if (!chat.participants) {
      chat.participants = [];
    }
    
    if (!chat.participants.includes(userId)) {
      chat.participants.push(userId);
    }
  }

  return chat;
}

async function checkPermissions(bot, ctx, chatId, userId, isGroup) {
  const ownerNumbers = global.owner.map(v => v.replace(/[^0-9]/g, ''));
  const isOwner = ownerNumbers.includes(String(userId));
  const isMods = global.mods.includes(String(userId));
  
  let user = global.db.data.users[userId];
  const isPrems = global.prems.includes(String(userId)) || user.premium;
  
  let isAdmin = false;
  let isBotAdmin = false;
  
  if (isGroup) {
    try {
      const chatMember = await bot.telegram.getChatMember(chatId, userId);
      isAdmin = ['creator', 'administrator'].includes(chatMember.status);
      
      const botMember = await bot.telegram.getChatMember(chatId, ctx.botInfo.id);
      isBotAdmin = ['administrator'].includes(botMember.status);
    } catch (e) {
      console.error('Error checking admin status:', e);
    }
  }

  return { isOwner, isMods, isPrems, isAdmin, isBotAdmin };
}

async function executePluginBefore(m, extra) {
  for (let name in global.plugins) {
    let plugin = global.plugins[name];
    if (!plugin) continue;
    if (plugin.disabled) continue;
    
    if (typeof plugin.before === 'function') {
      try {
        const result = await plugin.before(m, extra);
        if (result === true) {
          return true;
        }
      } catch (e) {
        console.error(`Error in ${name}.before:`, e);
      }
    }
  }
  return false;
}

async function processCommand(bot, ctx, m, text, chatId, userId, isGroup, user, chat, permissions) {
  for (let name in global.plugins) {
    let plugin = global.plugins[name];
    if (!plugin) continue;
    if (plugin.disabled) continue;

    const _prefix = plugin.customPrefix ? plugin.customPrefix : global.prefix;
    let match = (_prefix instanceof RegExp ? 
      [[_prefix.exec(text), _prefix]] :
      Array.isArray(_prefix) ?
        _prefix.map(p => {
          let re = p instanceof RegExp ? p : new RegExp(p.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'));
          return [re.exec(text), re];
        }) :
        typeof _prefix === 'string' ?
          [[new RegExp(_prefix.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')).exec(text), new RegExp(_prefix.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'))]] :
          [[[], new RegExp]]
    ).find(p => p[1]);

    if (typeof plugin !== 'function') continue;

    let usedPrefix;
    if ((usedPrefix = (match[0] || '')[0])) {
      let noPrefix = text.replace(usedPrefix, '');
      let [command, ...args] = noPrefix.trim().split(/\s+/).filter(v => v);
      args = args || [];
      let _args = noPrefix.trim().split(/\s+/).slice(1);
      let cmdText = _args.join(' ');
      command = (command || '').toLowerCase();

      let fail = plugin.fail || global.dfail;
      let isAccept = plugin.command instanceof RegExp ?
        plugin.command.test(command) :
        Array.isArray(plugin.command) ?
          plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
          typeof plugin.command === 'string' ?
            plugin.command === command :
            false;

      if (!isAccept) continue;

      bot.sendChatAction(chatId, 'typing').catch(() => {});

      if (plugin.owner && !permissions.isOwner) {
        fail('owner', m, ctx);
        continue;
      }

      if (plugin.mods && !permissions.isMods) {
        fail('mods', m, ctx);
        continue;
      }

      if (plugin.premium && !permissions.isPrems) {
        fail('premium', m, ctx);
        continue;
      }

      if (plugin.group && !isGroup) {
        fail('group', m, ctx);
        continue;
      }

      if (plugin.private && isGroup) {
        fail('private', m, ctx);
        continue;
      }
      
      if (plugin.admin && !permissions.isAdmin) {
        fail('admin', m, ctx);
        continue;
      }
      
      if (plugin.botAdmin && !permissions.isBotAdmin) {
        fail('botAdmin', m, ctx);
        continue;
      }

      if (plugin.register && !user.registered) {
        fail('register', m, ctx);
        continue;
      }

      if (plugin.limit) {
        const limitCost = typeof plugin.limit === 'number' ? plugin.limit : 1;
        
        if (!permissions.isOwner) {
          if (user.limit < limitCost) {
            fail('limit', m, ctx, limitCost);
            continue;
          }
        }
      }

      let extra = {
        match,
        usedPrefix,
        noPrefix,
        _args,
        args,
        command,
        text: cmdText,
        bot,
        ctx,
        chatId,
        userId,
        isGroup,
        ...permissions,
        user,
        chat,
        m,
        conn: bot
      };

      plugin.call(ctx, m, extra).then(() => {
        if (plugin.limit && !permissions.isOwner) {
          const limitCost = typeof plugin.limit === 'number' ? plugin.limit : 1;
          user.limit -= limitCost;
        }
        
        user.exp += plugin.exp || 0;

        if (!global.db.data.stats) {
          global.db.data.stats = {};
        }
        
        let stats = global.db.data.stats;
        if (plugin && plugin.command) {
          let cmdName = typeof plugin.command === 'string' ? plugin.command : 'unknown';
          if (!stats[cmdName]) {
            stats[cmdName] = {
              total: 0,
              success: 0,
              last: Date.now(),
              lastSuccess: Date.now()
            };
          }
          stats[cmdName].total += 1;
          stats[cmdName].success += 1;
          stats[cmdName].last = Date.now();
          stats[cmdName].lastSuccess = Date.now();
        }
      }).catch((e) => {
        console.error(e);
        
        if (typeof e === 'string') {
          ctx.reply(e).catch(err => console.error('Reply error:', err));
        } else if (e instanceof Error) {
          ctx.reply(e.message || 'Terjadi kesalahan saat menjalankan perintah').catch(err => console.error('Reply error:', err));
          
          let errorText = util.format(e);
          let errorStack = e.stack || errorText;
          
          let errorReport = `ERROR REPORT\n\n`;
          errorReport += `Plugin: ${name}\n`;
          errorReport += `User: ${m.pushName || m.from.first_name} (${userId})\n`;
          errorReport += `Chat: ${chatId}\n`;
          errorReport += `Command: ${usedPrefix}${command} ${args.join(' ')}\n`;
          errorReport += `Time: ${moment().tz('Asia/Jakarta').format('DD/MM/YY HH:mm:ss')}\n\n`;
          errorReport += `Error Message:\n${e.message}\n\n`;
          errorReport += `Stack Trace:\n${errorStack.substring(0, 500)}`;

          for (let ownerId of global.owner) {
            ctx.telegram.sendMessage(ownerId, errorReport).catch(sendErr => console.error('Failed to send error report to owner:', sendErr));
          }
        }
      });

      break;
    }
  }
}

module.exports = {
  async handler(bot, ctx) {
    if (ctx.callbackQuery) {
      const callbackData = ctx.callbackQuery.data;
      
      if (callbackData && callbackData.startsWith('cmd_')) {
        const command = callbackData.replace('cmd_', '');
        
        const fakeMessage = {
          message_id: ctx.callbackQuery.message.message_id,
          from: ctx.callbackQuery.from,
          chat: ctx.callbackQuery.message.chat,
          text: command,
          date: Math.floor(Date.now() / 1000)
        };
        
        const fakeCtx = {
          message: fakeMessage,
          update: {
            message: fakeMessage
          },
          botInfo: ctx.botInfo,
          telegram: ctx.telegram,
          chat: ctx.callbackQuery.message.chat,
          from: ctx.callbackQuery.from,
          reply: async (text, options = {}) => {
            return await ctx.telegram.sendMessage(ctx.callbackQuery.message.chat.id, text, {
              parse_mode: 'Markdown',
              ...options
            });
          },
          replyWithPhoto: ctx.replyWithPhoto.bind(ctx),
          replyWithVideo: ctx.replyWithVideo.bind(ctx),
          replyWithAudio: ctx.replyWithAudio.bind(ctx),
          replyWithDocument: ctx.replyWithDocument.bind(ctx),
          replyWithSticker: ctx.replyWithSticker.bind(ctx),
          deleteMessage: ctx.deleteMessage.bind(ctx)
        };
        
        await ctx.answerCbQuery().catch(() => {});
        
        return await require('./handler').handler(bot, fakeCtx);
      }
      
      let handled = false;
      for (let name in global.plugins) {
        let plugin = global.plugins[name];
        if (!plugin) continue;
        if (plugin.disabled) continue;
        
        if (typeof plugin.handleCallback === 'function') {
          try {
            const result = await plugin.handleCallback(bot, ctx.callbackQuery);
            if (result === true) {
              handled = true;
              break;
            }
          } catch (e) {
            console.error(`Error in ${name}.handleCallback:`, e);
          }
        }
      }
      
      if (handled) return;
      
      return await handleCallback(bot, ctx);
    }
    
    if (ctx.message?.new_chat_members) {
      await handleWelcome(bot, ctx);
      return;
    }
    
    if (ctx.message?.left_chat_member) {
      await handleGoodbye(bot, ctx);
      return;
    }
    
    let m = await smsg(bot, ctx);
    if (!m.text) return;

    await print(m, ctx, bot);

    const chatId = m.chat;
    const userId = m.from.id;
    let text = m.text;
    const isGroup = m.isGroup;

    if (global.waitingForAnswer && global.waitingForAnswer.has(chatId)) {
      const session = global.waitingForAnswer.get(chatId);
      if (session && session.resolve && !m.fromMe) {
        clearTimeout(session.timeout);
        session.resolve(text);
        return;
      }
    }

    const botUsername = bot.botInfo?.username;
    if (botUsername && text.includes(`@${botUsername}`)) {
      text = text.replace(new RegExp(`@${botUsername}`, 'gi'), '').trim();
      m.text = text;
    }

    const user = initializeUserData(userId, m);
    const chat = initializeChatData(chatId, userId, isGroup);
    const permissions = await checkPermissions(bot, ctx, chatId, userId, isGroup);

    const extra = {
      bot,
      ctx,
      chatId,
      userId,
      isGroup,
      ...permissions,
      user,
      chat,
      conn: bot
    };

    executePluginBefore(m, extra).then(beforeResult => {
      if (beforeResult === true) {
        return;
      }
    }).catch(err => {
      console.error('Error in plugin before:', err);
    });

    await processCommand(bot, ctx, m, text, chatId, userId, isGroup, user, chat, permissions);
  }
};

global.dfail = (type, m, ctx, extra) => {
  let messages = {
    owner: 'This command only available for Developer!',
    mods: 'This command only available for bot mods',
    premium: 'This command only for premium users!',
    group: 'This command only available on group!',
    private: 'This command only available on private chat!',
    admin: 'This command only available for group admins!',
    botAdmin: 'Bot must be admin to use this command!',
    register: 'You are not registered yet!\nPlease register first, example:\n/register nama.umur',
    limit: `Your limit is insufficient to use this command!`,
    restrict: 'This feature is not available right now!'
  }[type];

  if (messages) {
    ctx.reply(messages);
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright("Update 'handler.js'"));
  delete require.cache[file];
  if (global.reloadHandler) global.reloadHandler();
});
