require("./config");

const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const syntaxError = require('syntax-error');
const lodash = require('lodash');
const axios = require('axios');
const { initializeHelper } = require('./lib/simple');
const print = require('./lib/print');

let dbLibrary;
try {
  dbLibrary = require("lowdb");
} catch (error) {
  dbLibrary = require("./lib/lowdb");
}
const { Low, JSONFile } = dbLibrary;

const MongoDB = require('./lib/mongoDB');

function reloadModule(modulePath) {
  const fullPath = require.resolve(modulePath);
  delete require.cache[fullPath];
  return require(modulePath);
}

async function initializeDatabase() {
  const mongodbUrl = global.mongodb || "";
  
  if (mongodbUrl && mongodbUrl.trim() !== "") {
    if (!mongodbUrl.startsWith("mongodb://") && !mongodbUrl.startsWith("mongodb+srv://")) {
      console.log(chalk.red('This is not a valid mongodb URL, please connect to the real one'));
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(chalk.yellow('Changing to localdb'));
      return new Low(new JSONFile('database.json'));
    }
    
    try {
      console.log(chalk.cyan('Attempting to connect to MongoDB...'));
      const mongoDb = new MongoDB(mongodbUrl);
      await mongoDb.read();
      console.log(chalk.green('Successfully connected to MongoDB'));
      return mongoDb;
    } catch (error) {
      console.log(chalk.red('Failed to connect to MongoDB:', error.message));
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(chalk.yellow('Changing to localdb'));
      return new Low(new JSONFile('database.json'));
    }
  } else {
    console.log(chalk.cyan('Using local database'));
    return new Low(new JSONFile('database.json'));
  }
}

(async () => {
  const bot = new Telegraf(global.TOKEN);

  initializeHelper(bot);

  global.db = await initializeDatabase();

  global.loadDatabase = async function () {
    if (global.db.READ) {
      return new Promise((resolve) => setInterval(() => {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 1000));
    }

    if (global.db.data !== null) return;

    global.db.READ = true;
    await global.db.read();
    global.db.READ = false;
    global.db.data = {
      users: {},
      chats: {},
      stats: {},
      settings: {},
      giveaways: {},
      ...(global.db.data || {})
    };
    global.db.chain = lodash.chain(global.db.data);
  };

  await loadDatabase();

  console.log(chalk.green('Bot Telegram Started!'));

  let pluginsDir = path.join(__dirname, "plugins");
  let isJavaScriptFile = (fileName) => /\.js$/.test(fileName);
  global.plugins = {};
  global.commands = {};
  global.bot = bot;

  const pluginFiles = fs.readdirSync(pluginsDir).filter(isJavaScriptFile);
  const pluginList = [];

  for (let pluginFile of pluginFiles) {
    try {
      const plugin = require(path.join(pluginsDir, pluginFile));
      global.plugins[pluginFile] = plugin;

      if (plugin.command) {
        const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
        commands.forEach(cmd => {
          const cmdStr = cmd instanceof RegExp ? cmd.toString() : cmd;
          global.commands[cmdStr] = pluginFile;
        });
      }
      pluginList.push(`'_${pluginFile}'`);
    } catch (error) {
      console.error(chalk.red(`Error loading ${pluginFile}:`), error);
      delete global.plugins[pluginFile];
    }
  }

  console.log(chalk.green('['));
  const displayLimit = 50;
  const filesToShow = pluginList.slice(0, displayLimit);
  const remainingFiles = pluginList.length - displayLimit;

  filesToShow.forEach(plugin => {
    console.log(chalk.green(`  ${plugin},`));
  });

  if (remainingFiles > 0) {
    console.log(chalk.green(`  ... ${remainingFiles} more items`));
  }

  console.log(chalk.green(']'));

  global.reload = (event, filePath) => {
    if (/\.js$/.test(filePath)) {
      let fullFilePath = path.join(pluginsDir, filePath);
      if (fullFilePath in require.cache) {
        delete require.cache[fullFilePath];
        if (fs.existsSync(fullFilePath)) {
          console.log(chalk.cyan(`Reloading: ${filePath}`));
        } else {
          console.log(chalk.red(`Deleted: ${filePath}`));
          return delete global.plugins[filePath];
        }
      } else {
        console.log(chalk.green(`Loading: ${filePath}`));
      }

      let errorCheck = syntaxError(fs.readFileSync(fullFilePath), filePath);
      if (errorCheck) {
        console.error(chalk.red(`Syntax error: ${errorCheck}`));
      } else {
        try {
          const plugin = require(fullFilePath);
          global.plugins[filePath] = plugin;

          if (plugin.command) {
            const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
            commands.forEach(cmd => {
              const cmdStr = cmd instanceof RegExp ? cmd.toString() : cmd;
              global.commands[cmdStr] = filePath;
            });
          }
        } catch (error) {
          console.error(chalk.red(`Error: ${error}`));
        } finally {
          global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
        }
      }
    }
  };

  global.reloadHandler = function() {
    console.log(chalk.cyan('Reloading handler...'));
    
    const handlerModule = reloadModule('./handler');
    
    bot.handler = handlerModule.handler.bind(bot);
    
    console.log(chalk.green('Handler reloaded successfully'));
    return true;
  };

  Object.freeze(global.reload);
  fs.watch(path.join(__dirname, 'plugins'), global.reload);

  if (!global.opts.test) {
    setInterval(async () => {
      if (global.db.data) {
        await global.db.write();
      }
    }, 30000);
  }

  startUpdateChecker(bot);

  bot.use(async (ctx, next) => {
    try {
      if (global.db.data == null) await loadDatabase();
      
      await require('./handler').handler(bot, ctx);
      
      if (ctx.message) {
        const { smsg } = require('./lib/simple');
        let m = await smsg(bot, ctx);
        if (m) {
          await print(m, ctx, bot);
        }
      }
    } catch (error) {
      console.error(chalk.red('Handler Error:'), error);
    }
    return next();
  });

  bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const session = global.waitingForAnswer.get(chatId);

    if (session && session.resolve) {
      clearTimeout(session.timeout);
      const userAnswer = ctx.message.text;
      session.resolve(userAnswer);
    }
  });

  bot.on('message_reaction', async (ctx) => {
    try {
      await require('./handler').handler(bot, ctx);
    } catch (error) {
      console.error(chalk.red('Reaction Handler Error:'), error);
    }
  });
    
  bot.on('callback_query', async (ctx) => {
    try {
      const data = ctx.callbackQuery.data;
      const userId = ctx.callbackQuery.from.id;
      const chatId = ctx.callbackQuery.message.chat.id;
      const messageId = ctx.callbackQuery.message.message_id;
      
      if (data.startsWith('update_accept_') || data.startsWith('update_reject_')) {
        const action = data.startsWith('update_accept_') ? 'accept' : 'reject';
        const updateId = data.replace('update_accept_', '').replace('update_reject_', '');
        
        await handleUpdateResponse(bot, ctx, action, updateId);
        return;
      }
      
      await ctx.answerCbQuery();
      
      const fakeMessage = {
        message_id: messageId,
        from: ctx.callbackQuery.from,
        chat: ctx.callbackQuery.message.chat,
        text: data,
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
          return await ctx.telegram.sendMessage(chatId, text, {
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
      
      await require('./handler').handler(bot, fakeCtx);
      
    } catch (error) {
      console.error('Error handling callback query:', error);
      try {
        await ctx.answerCbQuery('Terjadi kesalahan!');
      } catch (e) {
        console.error('Error answering callback query:', e);
      }
    }
  });

  bot.catch((err, ctx) => {
    console.error(chalk.red('Bot Error:'), err);
  });

  process.on('uncaughtException', (error) => {
    console.error(chalk.red('Uncaught Exception:'), error);
  });

  process.on('unhandledRejection', (error) => {
    console.error(chalk.red('Unhandled Rejection:'), error);
  });

  bot.launch({
    dropPendingUpdates: true,
    allowedUpdates: ['message', 'callback_query', 'message_reaction', 'message_reaction_count']
  });

  console.log(chalk.green('Bot is running...'));

  process.once('SIGINT', () => {
    bot.stop('SIGINT');
  });
  process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
  });

})();

const pendingFile = path.join(__dirname, 'data/pending-updates.json');
const pendingDir = path.dirname(pendingFile);
if (!fs.existsSync(pendingDir)) {
  fs.mkdirSync(pendingDir, { recursive: true });
}

let pendingUpdates = new Map();
let processedIds = new Set();
let lastCheckedTimestamp = null;

function loadPendingUpdates() {
  try {
    if (fs.existsSync(pendingFile)) {
      const data = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
      pendingUpdates = new Map(Object.entries(data.updates || {}));
      processedIds = new Set(data.processedIds || []);
      lastCheckedTimestamp = data.lastChecked || null;
    }
  } catch (error) {
    console.error(chalk.red('Error loading pending updates:'), error);
  }
}

function savePendingUpdates() {
  try {
    const data = {
      updates: Object.fromEntries(pendingUpdates),
      processedIds: Array.from(processedIds),
      lastChecked: lastCheckedTimestamp
    };
    fs.writeFileSync(pendingFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(chalk.red('Error saving pending updates:'), error);
  }
}

function formatUpdateMessage(update) {
  const { changed_file, commit } = update;
  
  let message = `UPDATE AVAILABLE\n\n`;
  message += `File: ${changed_file.name}\n`;
  message += `Status: ${changed_file.status}\n`;
  message += `Additions: ${changed_file.additions} lines\n`;
  message += `Deletions: ${changed_file.deletions} lines\n\n`;
  message += `Commit Message:\n${commit.message}\n\n`;
  message += `Author: ${commit.author}\n`;
  message += `Date: ${new Date(commit.date).toLocaleString()}\n\n`;
  message += `Do you want to accept this update?`;
  
  return message;
}

async function applyUpdate(update) {
  try {
    const { changed_file } = update;
    const filePath = path.join(__dirname, changed_file.name);
    
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, changed_file.isinya, 'utf8');
    
    console.log(chalk.green(`Updated: ${changed_file.name}`));
    return true;
  } catch (error) {
    console.error(chalk.red(`Error applying update:`), error);
    return false;
  }
}

async function checkForUpdates(bot) {
  if (!global.autoupdate) {
    return;
  }

  try {
    const response = await axios.get('https://dhx-srv.vercel.app/data');
    const { success, data, timestamp } = response.data;
    
    if (!success || !data || data.length === 0) {
      return;
    }
    
    lastCheckedTimestamp = timestamp;
    
    for (const update of data) {
      if (processedIds.has(update.id)) {
        continue;
      }
      
      if (pendingUpdates.has(update.id)) {
        continue;
      }
      
      pendingUpdates.set(update.id, {
        update: update,
        messageId: null,
        chatId: Array.isArray(global.owner) ? global.owner[0] : global.owner
      });
      
      await sendUpdateNotification(bot, update);
    }
    
    savePendingUpdates();
    
  } catch (error) {
    console.error(chalk.red('Error checking for updates:'), error);
  }
}

async function sendUpdateNotification(bot, update) {
  try {
    const message = formatUpdateMessage(update);
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: 'YES', callback_data: `update_accept_${update.id}` },
          { text: 'NO', callback_data: `update_reject_${update.id}` }
        ]
      ]
    };
    
    const ownerId = Array.isArray(global.owner) ? global.owner[0] : global.owner;
    
    const sentMessage = await bot.telegram.sendMessage(
      ownerId,
      message,
      {
        reply_markup: keyboard
      }
    );
    
    const pending = pendingUpdates.get(update.id);
    if (pending) {
      pending.messageId = sentMessage.message_id;
      pending.chatId = sentMessage.chat.id;
      savePendingUpdates();
    }
    
  } catch (error) {
    console.error(chalk.red('Error sending update notification:'), error);
  }
}

async function handleUpdateResponse(bot, ctx, action, updateId) {
  try {
    const pending = pendingUpdates.get(updateId);
    
    if (!pending) {
      await ctx.answerCbQuery('Update not found!');
      return;
    }
    
    const update = pending.update;
    
    if (action === 'accept') {
      const success = await applyUpdate(update);
      
      if (success) {
        await ctx.editMessageText(
          `Update accepted and applied successfully!\n\nFile: ${update.changed_file.name}\nStatus: ${update.changed_file.status}`,
          {
            chat_id: pending.chatId,
            message_id: pending.messageId
          }
        );
        
        await ctx.answerCbQuery('Update applied successfully!');
      } else {
        await ctx.answerCbQuery('Failed to apply update!');
      }
    } else {
      await ctx.editMessageText(
        `Update rejected!\n\nFile: ${update.changed_file.name}\nStatus: ${update.changed_file.status}`,
        {
          chat_id: pending.chatId,
          message_id: pending.messageId
        }
      );
      
      await ctx.answerCbQuery('Update rejected!');
    }
    
    processedIds.add(updateId);
    pendingUpdates.delete(updateId);
    savePendingUpdates();
    
    await checkAndSendNextUpdate(bot);
    
  } catch (error) {
    console.error(chalk.red('Error handling update response:'), error);
    await ctx.answerCbQuery('An error occurred!');
  }
}

async function checkAndSendNextUpdate(bot) {
  if (!global.autoupdate) {
    return;
  }

  try {
    const response = await axios.get('https://dhx-srv.vercel.app/data');
    const { success, data } = response.data;
    
    if (!success || !data || data.length === 0) {
      return;
    }
    
    for (const update of data) {
      if (processedIds.has(update.id)) {
        continue;
      }
      
      if (pendingUpdates.has(update.id)) {
        const pending = pendingUpdates.get(update.id);
        if (pending.messageId) {
          await updateExistingMessage(bot, update, pending);
        }
      } else {
        pendingUpdates.set(update.id, {
          update: update,
          messageId: null,
          chatId: Array.isArray(global.owner) ? global.owner[0] : global.owner
        });
        
        await sendUpdateNotification(bot, update);
        break;
      }
    }
    
    savePendingUpdates();
    
  } catch (error) {
    console.error(chalk.red('Error checking next update:'), error);
  }
}

async function updateExistingMessage(bot, update, pending) {
  try {
    const message = formatUpdateMessage(update);
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: 'YES', callback_data: `update_accept_${update.id}` },
          { text: 'NO', callback_data: `update_reject_${update.id}` }
        ]
      ]
    };
    
    await bot.telegram.editMessageText(
      pending.chatId,
      pending.messageId,
      null,
      message,
      {
        reply_markup: keyboard
      }
    );
    
  } catch (error) {
    console.error(chalk.red('Error updating existing message:'), error);
  }
}

function startUpdateChecker(bot) {
  if (!global.autoupdate) {
    console.log(chalk.yellow('Auto-update is disabled'));
    return;
  }

  loadPendingUpdates();
  
  console.log(chalk.cyan('Server update checker started'));
  
  setInterval(() => {
    checkForUpdates(bot);
  }, 60000);
  
  checkForUpdates(bot);
}
