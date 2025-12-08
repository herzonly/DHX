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