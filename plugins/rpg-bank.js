let handler = async (m, { bot }) => {
  let user = global.db.data.users[m.sender]
  
  if (typeof user.bank === 'undefined') user.bank = 0
  if (typeof user.money === 'undefined') user.money = 0
  
  const caption = `
⛊「 *B A N K  U S E R* 」
│ 📛 *Name:* ${user.registered ? user.name : m.pushName}
│ 🏛️ *atm:* ${user.atm} 💲
│ 💹 *Money:* ${user.money} 💲
│ 🌟 *Status:* ${user.premiumTime > 0 ? 'Premium' : 'Free'}
│ 📑 *Registered:* ${user.registered ? 'Yes' : 'No'}
╰──┈┈⭑
• [DashX API](https://api.dashx.dpdns.org)
`.trim()

  await bot.sendMessage(m.chat, {
    image: { url: "https://telegra.ph/file/8172419ad03cd5782f12d.jpg" },
    caption: caption
  }, { quoted: m, noEscape: true })
}

handler.help = ['bank']
handler.tags = ['rpg']
handler.command = ["bank"]
handler.register = false

module.exports = handler