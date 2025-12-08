require("./config");

const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const syntaxError = require('syntax-error');
const lodash = require('lodash');
const { initializeHelper } = require('./lib/simple');

let dbLibrary;
try {
  dbLibrary = require("lowdb");
} catch (error) {
  dbLibrary = require("./lib/lowdb");
}
const { Low, JSONFile } = dbLibrary;

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

  console.log(chalk.green('🤖 Bot Telegram Started!'));

  let pluginsDir = path.join(__dirname, "plugins");
  let isJavaScriptFile = (fileName) => /\.js$/.test(fileName);
  global.plugins = {};
  global.commands = {};
  global.bot = bot;

  for (let pluginFile of fs.readdirSync(pluginsDir).filter(isJavaScriptFile)) {
    try {
      const plugin = require(path.join(pluginsDir, pluginFile));
      global.plugins[pluginFile] = plugin;

      if (plugin.command) {
        const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
        commands.forEach(cmd => {
          const cmdStr = cmd instanceof RegExp ? cmd.toString() : cmd;
          global.commands[cmdStr] = pluginFile;
          console.log(chalk.blue(`📝 Registered: ${cmdStr}`));
        });
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error loading ${pluginFile}:`), error);
      delete global.plugins[pluginFile];
    }
  }

  console.log(chalk.yellow(`✅ Loaded ${Object.keys(global.plugins).length} plugins`));

  global.reload = (event, filePath) => {
    if (/\.js$/.test(filePath)) {
      let fullFilePath = path.join(pluginsDir, filePath);
      if (fullFilePath in require.cache) {
        delete require.cache[fullFilePath];
        if (fs.existsSync(fullFilePath)) {
          console.log(chalk.cyan(`♻️ Reloading: ${filePath}`));
        } else {
          console.log(chalk.red(`🗑️ Deleted: ${filePath}`));
          return delete global.plugins[filePath];
        }
      } else {
        console.log(chalk.green(`🔁 Loading: ${filePath}`));
      }

      let errorCheck = syntaxError(fs.readFileSync(fullFilePath), filePath);
      if (errorCheck) {
        console.error(chalk.red(`❌ Syntax error: ${errorCheck}`));
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
          console.error(chalk.red(`❌ Error: ${error}`));
        } finally {
          global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
        }
      }
    }
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
    setImmediate(async () => {
      try {
        if (global.db.data == null) await loadDatabase();
        await require('./handler').handler(bot, ctx);
      } catch (error) {
        console.error(chalk.red('Handler Error:'), error);
      }
    });
    return next();
  });

  bot.on('callback_query', async (ctx) => {
    setImmediate(async () => {
      try {
        const callbackData = ctx.callbackQuery.data;
        
        if (callbackData.startsWith('menu_')) {
          const menuPlugin = Object.values(global.plugins).find(p => p.handleCallback);
          if (menuPlugin && menuPlugin.handleCallback) {
            await menuPlugin.handleCallback(bot, ctx.callbackQuery);
          }
        }
        
        for (let pluginFile in global.plugins) {
          let plugin = global.plugins[pluginFile];
          if (plugin.handleCallback && !callbackData.startsWith('menu_')) {
            try {
              await plugin.handleCallback(bot, ctx.callbackQuery);
            } catch (e) {
              console.error(chalk.red(`Error in ${pluginFile} callback:`), e);
            }
          }
        }
      } catch (error) {
        console.error(chalk.red('Callback Query Error:'), error);
      }
    });
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

  console.log(chalk.green('✅ Bot is running...'));

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

})();