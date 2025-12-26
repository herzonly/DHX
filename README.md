# DHX - Telegram Bot Base

A simple and lightweight Telegram bot base built with Telegraf library. Easy to use with minimal resource consumption.

## ✨ Features

- 🚀 Simple and clean code structure
- 💾 Low resource usage
- 🔧 Easy to customize and extend
- ⚡ Fast and responsive
- 📦 Built with Telegraf library

## Bot Function Docs
### under construction ☹️ please wait

## 📋 Prerequisites

- Node.js v18 or newer
- npm or yarn
- Telegram Bot Token from [@BotFather](https://t.me/botfather)

### Minimum Server Requirements
- CPU: 50% (1 core)
- RAM: 1GB
- Disk Space: 1GB

## 🛠️ Installation

1. Clone the repository
```bash
git clone https://github.com/herzonly/DHX.git
cd DHX
```

2. Install dependencies
```bash
npm install
```

3. Configure the bot
```bash
# Edit config.js and fill in your bot configuration
nano config.js
```

4. Fill in the configuration in `config.js`
```javascript
global.TOKEN = "YOUR_BOT_TOKEN_HERE"

global.wm = "• Dash X API"
global.wait = "__**Wait a minute...**__"
// Required, register at https://api.dashx.dpdns.org
global.dhx = "YOUR_DHX_API_KEY"

global.owner = ["YOUR_TELEGRAM_ID"]
global.mods = []
global.prems = []

global.prefix = /^[.,!/#]/
global.botName = "DashX Bot"
global.ownerName = "Owner"
global.wm = "DHX"
global.sig = "https://instagram.com/notme_botz"
global.thumb = "https://telegra.ph/file/a8e9f9edf366707fbadf1.jpg"

global.multiplier = 69

global.APIs = {
  api1: 'https://api.example.com'
}

global.APIKeys = {
  'https://api.example.com': 'your-api-key'
}

global.opts = {
  self: false,
  restrict: false,
  test: false,
  tmp: false
}

global.myfile = Buffer.from("aGVsbG8=", "base64")
global.minety = "application/pdf"
```

## 🚀 Usage

Start the bot:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 📁 Project Structure

```
DHX/
├── plugins/          # Bot command handlers
├── handler.js          # Event handlers
├── lib/              # Utility functions
├── config.js         # Configuration file
├── index.js          # Main entry point
└── package.json
```

## 📝 Adding New Commands

Create a new file in the `plugins/` directory:

```javascript
let handler = async (m, { bot }) => {
  const username = m.from.first_name || 'User'
  const botname = bot.botInfo?.first_name || 'Bot'
  
  let txt = `👋 Hi *${username}*! My name is *${botname}*\n\n`
  
  txt += `Welcome to my service! I'm here to assist you with various features and commands. `
  txt += `I'm designed to make your experience smooth and enjoyable while providing you with useful tools and information.\n\n`
  
  txt += `🤖 *About Me*\n`
  txt += `I am an advanced automated assistant built to help you with multiple tasks. `
  txt += `Whether you need information, entertainment, or just someone to chat with, I'm always ready to serve you 24/7.\n\n`
  
  txt += `✨ *What I Can Do*\n`
  txt += `• Provide quick responses to your queries\n`
  txt += `• Execute various commands and features\n`
  txt += `• Deliver accurate information\n`
  txt += `• Assist you with daily tasks\n`
  txt += `• And much more!\n\n`
  
  txt += `📚 *Getting Started*\n`
  txt += `To see all available commands and features, simply type /help or /menu. `
  txt += `You can explore different categories and discover what I can do for you. `
  txt += `Don't hesitate to try out different commands!\n\n`
  
  txt += `💡 *Tips*\n`
  txt += `• All commands start with / (slash)\n`
  txt += `• Type /ping to check my response speed\n`
  txt += `• Use /info to learn more about me\n`
  txt += `• Feel free to ask questions anytime\n\n`
  
  txt += `🌟 Thank you for using my service! I hope you have a great experience. `
  txt += `If you encounter any issues or have suggestions, please don't hesitate to reach out to my developer.\n\n`
  
  txt += `Let's get started on this amazing journey together! 🚀`
  
  await m.reply(txt, { parse_mode: 'Markdown' })
}

handler.help = ['start']
handler.tags = ['main']
handler.command = /^(start)$/i

module.exports = handler
```

### Command Properties

- `handler.help` - Array of command names shown in help menu
- `handler.tags` - Command category
- `handler.command` - Regex pattern for command trigger

## 🔧 Configuration Options

- `TOKEN` - Your Telegram bot token from BotFather
- `dhx` - DashX API key (register at https://api.dashx.dpdns.org)
- `owner` - Array of owner Telegram IDs
- `mods` - Array of moderator Telegram IDs
- `prems` - Array of premium user Telegram IDs
- `prefix` - Command prefix regex pattern
- `botName` - Your bot's display name
- `APIs` - External API endpoints
- `APIKeys` - API authentication keys

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is licensed under the MIT License.

## 👤 Developer

Created by **herzonly**

## 🔗 Links
- [Feedback](https://t.me/herzaitz)
- [APIs](https://api.dashx.dpdns.org)
- [APIs](https://api.dashx.biz.id)
- [Developer](https://t.me/herzaitz)
- [Partner](https://claude.ai)
- [Telegraf Documentation](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [DashX API](https://api.dashx.dpdns.org)

## ⭐ Support

If you find this project helpful, please give it a star!

### 💖 Donate

If you'd like to support the development of this project, you can donate through:

- [Saweria](https://saweria.co/herza)
- [Teer.id](https://teer.id/herzja)
- DANA: 085656036548
- GoPay: 085656036548

Your support is greatly appreciated! 🙏

---

<div align="center">

_Made with ♥️ and lot of 🍵_

**Herza NGT**

</div>
