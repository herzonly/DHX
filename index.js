require("./config");

const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const syntaxError = require('syntax-error');
const lodash = require('lodash');
const { initializeHelper } = require('./lib/simple');
const print = require('./lib/print')

let dbLibrary;
try {
  dbLibrary = require("lowdb");
} catch (error) {
  dbLibrary = require("./lib/lowdb");
}
const { Low, JSONFile } = dbLibrary;

function reloadModule(modulePath) {
  const fullPath = require.resolve(modulePath);
  delete require.cache[fullPath];
  return require(modulePath);
}

(async () => {
  const bot = new Telegraf(global.TOKEN);

  initializeHelper(bot);

  global.db = new Low(new JSONFile('database.json'));

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
              global.commands[cmdStr] = pluginFile;
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
    
  bot.on('callback_query', async (ctx) => {
    try {
      const data = ctx.callbackQuery.data;
      const userId = ctx.callbackQuery.from.id;
      const chatId = ctx.callbackQuery.message.chat.id;
      const messageId = ctx.callbackQuery.message.message_id;
      
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
    dropPendingUpdates: true
  });

  console.log(chalk.green('Bot is running...'));

  process.once('SIGINT', () => {
    bot.stop('SIGINT');
  });
  process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
  });

})();
