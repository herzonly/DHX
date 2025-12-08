let handler = async (m, { conn, command, args }) => {
  let type = (args[0] || '').toLowerCase()
  let user = global.db.data.users[m.sender]
  
  user.pickaxe = user.pickaxe || 0
  user.sword = user.sword || 0
  user.fishingrod = user.fishingrod || 0
  user.armor = user.armor || 0
  user.atm = user.atm || 0
  user.pickaxedurability = user.pickaxedurability || 0
  user.sworddurability = user.sworddurability || 0
  user.fishingroddurability = user.fishingroddurability || 0
  user.armordurability = user.armordurability || 0

  let caption = `
█▀▀▀▀█▀▀▀▀█▀▀▀▀█
█────█────█────█
█▄▄▄▄█▄▄▄▄█▄▄▄▄█
█▀▀▀▀█▀▀▀▀█▀▀▀▀█
█────█────█────█
█▄▄▄▄█▄▄▄▄█▄▄▄▄█
█▀▀▀▀█▀▀▀▀█▀▀▀▀█
█────█────█────█
█▄▄▄▄█▄▄▄▄█▄▄▄▄█

Penggunaan: .craft <item>
Contoh: *.craft sword*
              
*Pickaxe* ⛏️
10 Kayu
5 Batu
5 Iron
20 String

*Sword* ⚔️
10 Kayu
15 Iron

*Pancingan* 🎣
10 Kayu
2 Iron
20 String

*Armor* 🥼
30 Iron
10 String
5 Berlian
`

  try {
    switch (type) {
      case 'pickaxe':
        if (user.pickaxe > 0) return m.reply('Kamu sudah memilik ini')
        if (user.batu < 5 || user.kayu < 10 || user.iron < 5 || user.string < 20) {
          return m.reply(`Barang tidak cukup!\nUntuk membuat pickaxe. Kamu memerlukan:\n10 kayu 🪵\n5 iron ⛓\n20 String 🕸️\n5 Batu 🪨`)
        }
        user.kayu -= 10
        user.iron -= 5
        user.batu -= 5
        user.string -= 20
        user.pickaxe += 1
        user.pickaxedurability = 80
        m.reply("Sukses membuat 1 pickaxe 🔨")
        break

      case 'sword':
        if (user.sword > 0) return m.reply('Kamu sudah memilik ini')
        if (user.kayu < 10 || user.iron < 15) {
          return m.reply(`Barang tidak cukup!\nUntuk membuat sword. Kamu memerlukan:\n10 kayu 🪵\n15 iron ⛓️`)
        }
        user.kayu -= 10
        user.iron -= 15
        user.sword += 1
        user.sworddurability = 100
        m.reply("Sukses membuat 1 sword 🗡️")
        break

      case 'pancingan':
        if (user.fishingrod > 0) return m.reply('Kamu sudah memilik ini')
        if (user.kayu < 10 || user.iron < 2 || user.string < 20) {
          return m.reply(`Barang tidak cukup!\nUntuk membuat pancingan. Kamu memerlukan:\n10 kayu 🪵\n2 iron ⛓\n20 String 🕸️`)
        }
        user.kayu -= 10
        user.iron -= 2
        user.string -= 20
        user.fishingrod += 1
        user.fishingroddurability = 60
        m.reply("Sukses membuat 1 Pancingan 🎣")
        break

      case 'armor':
        if (user.armor > 0) return m.reply('Kamu sudah memilik ini')
        if (user.iron < 30 || user.string < 10 || user.diamond < 5) {
          return m.reply(`Barang tidak cukup!\nUntuk membuat armor. Kamu memerlukan:\n30 Iron ⛓️\n10 String 🕸️\n5 Diamond 💎`)
        }
        user.string -= 10
        user.iron -= 30
        user.diamond -= 5
        user.armor += 1
        user.armordurability = 100
        m.reply("Sukses membuat 1 Armor 🥼")
        break

      case 'atm':
        if (user.atm > 0) return m.reply('Kamu sudah memilik ini')
        if (user.emerald < 3 || user.balance < 10000 || user.diamond < 6) {
          return m.reply(`Barang tidak cukup!\nUntuk membuat atm. Kamu memerlukan:\n10k Balance 💹\n3 Emerald ❇️\n6 Diamond 💎`)
        }
        user.emerald -= 3
        user.balance -= 10000
        user.diamond -= 6
        user.atm += 1
        user.fullatm = 5000000
        m.reply("Sukses membuat 1 Atm 💳")
        break

      default:
        return m.reply(caption)
    }
  } catch (err) {
    m.reply("Error\n\n\n" + err.stack)
  }
}

handler.help = ['craft']
handler.tags = ['rpg']
handler.command = /^(craft|crafting)$/i

module.exports = handler