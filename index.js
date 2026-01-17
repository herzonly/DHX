require("./config");
//push  filebb

const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const syntaxError = require('syntax-error');
const lodash = require('lodash');
const axios = require('axios');
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

function restartServer() {
  console.log(chalk.yellow('Restarting server...'));
  process.exit(0);
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
    
    const handlerPath = path.join(__dirname, 'handler.js');
    if (require.cache[handlerPath]) {
      delete require.cache[handlerPath];
    }
    
    const handlerModule = require('./handler');
    
    console.log(chalk.green('Handler reloaded successfully'));
    return true;
  };

  global.reloadConfig = function() {
    console.log(chalk.cyan('Reloading config...'));
    
    const configPath = path.join(__dirname, 'config.js');
    if (require.cache[configPath]) {
      delete require.cache[configPath];
    }
    
    require('./config');
    
    console.log(chalk.green('Config reloaded successfully'));
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

  if (global.autoupdate) {
    const API_URL = 'https://dhx-srv.vercel.app/data';
    const CHECK_INTERVAL = 6000;
    const processedUpdates = new Set();
    global.pendingUpdates = new Map();
    global.updateQueue = [];
    global.isProcessingUpdate = false;
    global.updateHistory = [];
    let lastCheck = Date.now();

    async function sendUpdateNotification(update) {
      const fileName = update.changed_file.name;
      const fileContent = update.changed_file.isinya;
      const filePath = path.join(__dirname, fileName);
      
      const localExists = fs.existsSync(filePath);
      let needsUpdate = true;

      if (localExists) {
        const localContent = fs.readFileSync(filePath, 'utf-8');
        needsUpdate = localContent !== fileContent;
      }

      if (needsUpdate) {
        const queuePosition = global.updateQueue.length + 1;
        const totalUpdates = global.updateQueue.length + 1;
        
        const message = `Changed File: ${fileName}\n\nFile ${fileName} has an update on our server, do you want to update this bot through our server?\n\nQueue: ${queuePosition}/${totalUpdates}`;

        const keyboard = Markup.inlineKeyboard([
          [
            Markup.button.callback('YES', `update_yes_${update.id}`),
            Markup.button.callback('PREVIOUS', `update_prev_${update.id}`),
            Markup.button.callback('NO', `update_no_${update.id}`)
          ]
        ]);

        global.pendingUpdates.set(update.id, {
          fileName: fileName,
          filePath: filePath,
          content: fileContent,
          update: update
        });

        const sentMessage = await bot.telegram.sendMessage(
          global.owner[0],
          message,
          keyboard
        );

        return {
          messageId: sentMessage.message_id,
          updateId: update.id
        };
      }
      return null;
    }

    async function processUpdateQueue() {
      if (global.isProcessingUpdate || global.updateQueue.length === 0) {
        return;
      }

      global.isProcessingUpdate = true;
      const update = global.updateQueue[0];

      try {
        const result = await sendUpdateNotification(update);
        if (result) {
          update.messageId = result.messageId;
          update.sentAt = Date.now();
        } else {
          global.updateQueue.shift();
          global.isProcessingUpdate = false;
          processUpdateQueue();
        }
      } catch (error) {
        console.error(chalk.red('Error sending update notification:'), error);
        global.updateQueue.shift();
        global.isProcessingUpdate = false;
        processUpdateQueue();
      }
    }

    async function checkForUpdates() {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 10000,
          validateStatus: function (status) {
            return status === 200;
          }
        });
        
        if (!response.data || typeof response.data !== 'object') {
          console.error(chalk.yellow('Invalid response format'));
          return;
        }
        
        if (!response.data.success) {
          return;
        }

        if (!response.data.data || !Array.isArray(response.data.data)) {
          return;
        }

        if (response.data.count === 0 || response.data.data.length === 0) {
          return;
        }

        const updates = response.data.data.filter(item => {
          if (!item || !item.id || !item.changed_file || !item.created_at) {
            return false;
          }

          const itemTime = new Date(item.created_at).getTime();
          const updateKey = `${item.id}-${item.changed_file.name}`;
          
          if (itemTime > lastCheck && !processedUpdates.has(updateKey)) {
            processedUpdates.add(updateKey);
            return true;
          }
          return false;
        });

        if (updates.length === 0) return;

        for (const update of updates) {
          global.updateQueue.push(update);
        }

        processUpdateQueue();

        lastCheck = Date.now();

        if (processedUpdates.size > 1000) {
          const arr = Array.from(processedUpdates);
          processedUpdates.clear();
          arr.slice(-500).forEach(item => processedUpdates.add(item));
        }

      } catch (error) {
        if (error.response) {
          console.error(chalk.red(`API Error ${error.response.status}:`), error.response.statusText);
        } else if (error.request) {
          console.error(chalk.red('Network Error: Cannot reach API server'));
        } else if (error.code === 'ECONNABORTED') {
          console.error(chalk.red('Request timeout'));
        } else if (error.code === 'ENOTFOUND') {
          console.error(chalk.red('DNS Error: Cannot resolve API hostname'));
        } else {
          console.error(chalk.red('API Error:'), error.message || 'Unknown error');
        }
      }
    }

    setInterval(checkForUpdates, CHECK_INTERVAL);
    
    setTimeout(() => {
      console.log(chalk.cyan('Starting initial update check...'));
      checkForUpdates();
    }, 5000);

    bot.action(/^update_(yes|no|prev)_(.+)$/, async (ctx) => {
      try {
        const action = ctx.match[1];
        const updateId = ctx.match[2];

        await ctx.answerCbQuery();

        const pendingUpdate = global.pendingUpdates.get(updateId);

        if (!pendingUpdate) {
          await ctx.editMessageText('Update data not found or expired!');
          return;
        }

        if (action === 'prev') {
          if (global.updateHistory.length === 0) {
            await ctx.answerCbQuery('No previous update!', { show_alert: true });
            return;
          }

          const previousUpdate = global.updateHistory[global.updateHistory.length - 1];
          const prevData = global.pendingUpdates.get(previousUpdate.updateId);

          if (prevData) {
            const message = `Changed File: ${prevData.fileName}\n\nFile ${prevData.fileName} has an update on our server, do you want to update this bot through our server?\n\n[PREVIOUS UPDATE]`;

            const keyboard = Markup.inlineKeyboard([
              [
                Markup.button.callback('YES', `update_yes_${previousUpdate.updateId}`),
                Markup.button.callback('PREVIOUS', `update_prev_${previousUpdate.updateId}`),
                Markup.button.callback('NO', `update_no_${previousUpdate.updateId}`)
              ]
            ]);

            await ctx.editMessageText(message, keyboard);
          }
          return;
        }

        if (action === 'yes') {
          try {
            const dir = path.dirname(pendingUpdate.filePath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(pendingUpdate.filePath, pendingUpdate.content, 'utf-8');

            const fileName = pendingUpdate.fileName;
            const isPluginFile = fileName.startsWith('plugins/') || pendingUpdate.filePath.includes('/plugins/');
            const isHandlerFile = fileName === 'handler.js' || fileName.endsWith('/handler.js');
            const isConfigFile = fileName === 'config.js' || fileName.endsWith('/config.js');
            
            let actionType = 'updated';
            
            if (isPluginFile) {
              actionType = 'auto-reloaded';
              setTimeout(() => {
                const pluginFileName = path.basename(pendingUpdate.fileName);
                if (global.reload) {
                  global.reload('change', pluginFileName);
                }
              }, 1000);
            } else if (isHandlerFile) {
              actionType = 'auto-reloaded';
              setTimeout(() => {
                if (global.reloadHandler) {
                  global.reloadHandler();
                }
              }, 1000);
            } else if (isConfigFile) {
              actionType = 'auto-reloaded';
              setTimeout(() => {
                if (global.reloadConfig) {
                  global.reloadConfig();
                }
              }, 1000);
            } else {
              actionType = 'updated (server will restart)';
              setTimeout(() => {
                restartServer();
              }, 2000);
            }

            const successMessage = `File ${pendingUpdate.fileName} has been ${actionType} successfully!`;

            await ctx.editMessageText(successMessage);

            global.updateHistory.push({
              updateId: updateId,
              fileName: pendingUpdate.fileName,
              action: 'yes',
              timestamp: Date.now()
            });

            global.pendingUpdates.delete(updateId);
            global.updateQueue.shift();
            global.isProcessingUpdate = false;

            setTimeout(() => {
              processUpdateQueue();
            }, 1000);

          } catch (error) {
            await ctx.editMessageText(`Update Failed!\n\nError: ${error.message}`);
            global.updateQueue.shift();
            global.isProcessingUpdate = false;
            setTimeout(() => {
              processUpdateQueue();
            }, 1000);
          }
        } else if (action === 'no') {
          await ctx.editMessageText(`Update Cancelled\n\nFile: ${pendingUpdate.fileName}\n\nUpdate has been skipped.`);
          
          global.updateHistory.push({
            updateId: updateId,
            fileName: pendingUpdate.fileName,
            action: 'no',
            timestamp: Date.now()
          });

          global.pendingUpdates.delete(updateId);
          global.updateQueue.shift();
          global.isProcessingUpdate = false;

          setTimeout(() => {
            processUpdateQueue();
          }, 1000);
        }

        if (global.updateHistory.length > 50) {
          global.updateHistory = global.updateHistory.slice(-25);
        }

      } catch (error) {
        console.error(chalk.red('Error handling update action:'), error);
        try {
          await ctx.answerCbQuery('Error processing update!');
        } catch (e) {}
      }
    });

    console.log(chalk.green('Auto-updater enabled!'));
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
      
      if (!data.startsWith('update_')) {
        await ctx.answerCbQuery();
      }
      
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
      
      if (!data.startsWith('update_')) {
        await require('./handler').handler(bot, fakeCtx);
      }
      
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
