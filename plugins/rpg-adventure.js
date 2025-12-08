let handler = async (m, { bot, usedPrefix, userId }) => { 
    try { 
        let user = global.db.data.users[userId]
        
        if (!user.lastadventure) user.lastadventure = 0
        if (!user.health) user.health = 100
        if (!user.exp) user.exp = 0
        if (!user.money) user.money = 0
        if (!user.tiketcoin) user.tiketcoin = 0
        if (!user.potion) user.potion = 0
        if (!user.diamond) user.diamond = 0
        if (!user.common) user.common = 0
        if (!user.uncommon) user.uncommon = 0
        if (!user.sampah) user.sampah = 0
        if (!user.mythic) user.mythic = 0
        if (!user.legendary) user.legendary = 0
        
        if (user.health > 7) {
            let _health = Math.floor(Math.random() * 101)
            let health = Math.min(_health, user.health)
            let exp = Math.floor(Math.random() * 10000)
            let uang = Math.floor(Math.random() * 100000)
            let _potion = ['1','2','3']
            let potion = parseInt(_potion[Math.floor(Math.random() * _potion.length)])
            let _sampah = Array.from({length: 50}, (_, i) => String(i + 1))
            let sampah = parseInt(_sampah[Math.floor(Math.random() * _sampah.length)])
            let _diamond = Array.from({length: 10}, (_, i) => String(i + 1))
            let diamond = parseInt(_diamond[Math.floor(Math.random() * _diamond.length)])
            let _common = ['1','2','3']
            let common = parseInt(_common[Math.floor(Math.random() * _common.length)])
            let _uncommon = ['1','2','1','2']
            let uncommon = parseInt(_uncommon[Math.floor(Math.random() * _uncommon.length)])
            let mythic = parseInt(pickRandom(['1','3','1','1','2']))
            let legendary = parseInt(pickRandom(['1','3','1','1','2']))
            
            let locations = [
                'Jepang', 'Korea', 'Bali', 'Amerika', 'Iraq', 'Arab', 
                'Pakistan', 'German', 'Finlandia', 'Ke bawa dunia mimpi', 
                'Ujung dunia', 'Mars', 'Zimbabwe', 'Bulan', 'Pluto', 
                'Matahari', 'Hatinya dia', '...'
            ]
            
            let str = `🗺️ *ADVENTURE RESULT*

Nyawa mu berkurang *-${health}* karena Kamu telah berpetualang sampai *${pickRandom(locations)}* dan mendapatkan:

💫 *Exp:* ${exp.toLocaleString()}
💰 *Uang:* ${uang.toLocaleString()}
🎟️ *Tiketcoin:* 1
🗑️ *Sampah:* ${sampah}
🧪 *Potion:* ${potion}
💎 *Diamond:* ${diamond}
📦 *Common crate:* ${common}
🎁 *Uncommon crate:* ${uncommon}`

            let itemrand = [
                `✨ *BONUS ITEM!*\n\n🔮 Mythic Crate: ${mythic}`,
                `✨ *BONUS ITEM!*\n\n👑 Legendary Crate: ${legendary}`
            ]
            let rendem = itemrand[Math.floor(Math.random() * itemrand.length)]
            
            await bot.sendMessage(m.chat, str, {
                reply_to_message_id: m.message_id
            })
            
            setTimeout(async () => {
                await bot.sendMessage(m.chat, rendem, {
                    reply_to_message_id: m.message_id
                })
            }, 1000)
            
            user.health = Math.max(0, user.health - health)
            user.exp += exp
            user.tiketcoin += 1
            user.money += uang
            user.potion += potion
            user.diamond += diamond
            user.common += common
            user.uncommon += uncommon
            user.sampah += sampah
            user.mythic += mythic
            user.legendary += legendary
            user.lastadventure = new Date * 1
            
        } else {
            await bot.sendMessage(m.chat, 
                `❤️ Health kamu terlalu rendah!\n\nMinimal 8 health untuk berpetualang\n\n💡 Gunakan: *${usedPrefix}shop* untuk membeli potion atau heal menggunakan potion yang kamu punyai *${usedPrefix}heal* ${user.potion}`, 
                {
                    reply_to_message_id: m.message_id
                }
            )
        }
    } catch (e) {
        console.log(e)
        await bot.sendMessage(m.chat, '❌ Terjadi kesalahan saat berpetualang', {
            reply_to_message_id: m.message_id
        })
    }
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

handler.help = ['adventure', 'berpetualang']
handler.tags = ['rpg']
handler.command = /^(adventure|berpetualang|petualang)$/i
handler.limit = true

module.exports = handler