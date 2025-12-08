let levelling = require('../lib/levelling')

let handler = async (m, { conn, usedPrefix }) => {
    let health = global.db.data.users[m.sender].health
    let armor = global.db.data.users[m.sender].armor 
    let pet = global.db.data.users[m.sender].pet
    let kucing = global.db.data.users[m.sender].kucing
    let _kucing = global.db.data.users[m.sender].anakkucing
    let rubah = global.db.data.users[m.sender].rubah
    let _rubah = global.db.data.users[m.sender].anakrubah
    let serigala = global.db.data.users[m.sender].serigala
    let _serigala = global.db.data.users[m.sender].anakserigala
    let naga = global.db.data.users[m.sender].naga
    let _naga = global.db.data.users[m.sender].anaknaga
    let kuda = global.db.data.users[m.sender].kuda
    let _kuda = global.db.data.users[m.sender].anakkuda
    let phonix = global.db.data.users[m.sender].phonix
    let _phonix = global.db.data.users[m.sender].anakphonix
    let griffin = global.db.data.users[m.sender].griffin
    let _griffin = global.db.data.users[m.sender].anakgriffin
    let kyubi = global.db.data.users[m.sender].kyubi
    let _kyubi = global.db.data.users[m.sender].anakkyubi
    let centaur = global.db.data.users[m.sender].centaur
    let _centaur = global.db.data.users[m.sender].anakcentaur
    let diamond = global.db.data.users[m.sender].diamond
    let coal = global.db.data.users[m.sender].coal
    
    let potion = global.db.data.users[m.sender].potion
    let ramuan = global.db.data.users[m.sender].ramuan || 0
    let common = global.db.data.users[m.sender].common
    let makananpet = global.db.data.users[m.sender].makananpet
    let makanannaga = global.db.data.users[m.sender].makanannaga || 0
    let makananphonix = global.db.data.users[m.sender].makananphonix || 0
    let makanangriffin = global.db.data.users[m.sender].makanangriffin || 0
    let makanankyubi = global.db.data.users[m.sender].makanankyubi || 0
    let makanancentaur = global.db.data.users[m.sender].makanancentaur || 0
    let uncommon = global.db.data.users[m.sender].uncommon
    let mythic = global.db.data.users[m.sender].mythic
    let legendary = global.db.data.users[m.sender].legendary
    let level = global.db.data.users[m.sender].level
    let money = global.db.data.users[m.sender].money
    let exp = global.db.data.users[m.sender].exp
    let sampah = global.db.data.users[m.sender].sampah
    let anggur = global.db.data.users[m.sender].anggur
    let jeruk = global.db.data.users[m.sender].jeruk
    let apel = global.db.data.users[m.sender].apel
    let mangga = global.db.data.users[m.sender].mangga
    let pisang = global.db.data.users[m.sender].pisang
    let bibitanggur = global.db.data.users[m.sender].bibitanggur
    let bibitjeruk = global.db.data.users[m.sender].bibitjeruk
    let bibitapel = global.db.data.users[m.sender].bibitapel
    let bibitmangga = global.db.data.users[m.sender].bibitmangga
    let bibitpisang = global.db.data.users[m.sender].bibitpisang 
    let gardenboxs = global.db.data.users[m.sender].gardenboxs
    let nabung = global.db.data.users[m.sender].nabung
    let bank = global.db.data.users[m.sender].bank
    let limit = global.db.data.users[m.sender].limit
    let cupon = global.db.data.users[m.sender].cupon || 0
    let tiketcoin = global.db.data.users[m.sender].tiketcoin
    let stamin = global.db.data.users[m.sender].stamina
    let tiketm = global.db.data.users[m.sender].healtmonster
    let aqua = global.db.data.users[m.sender].aqua || 0
    let expg = global.db.data.users[m.sender].expg || 0
    let boxs = global.db.data.users[m.sender].boxs
    let botol = global.db.data.users[m.sender].botol
    let kayu = global.db.data.users[m.sender].kayu 
    let batu = global.db.data.users[m.sender].batu
    let iron = global.db.data.users[m.sender].iron || 0
    let sword = global.db.data.users[m.sender].sword || 0
    let string = global.db.data.users[m.sender].string || 0
    let kaleng = global.db.data.users[m.sender].kaleng
    let kardus = global.db.data.users[m.sender].kardus
    let berlian = global.db.data.users[m.sender].berlian
    let emas = global.db.data.users[m.sender].emas
    let emaspro = global.db.data.users[m.sender].emasbatang
    let hero = global.db.data.users[m.sender].hero
    let exphero = global.db.data.users[m.sender].exphero
    let { max } = levelling.xpRange(level, exp, global.multiplier)
    let name = m.sender
    let sortedmoney = Object.entries(global.db.data.users).sort((a, b) => b[1].money - a[1].money)
    let sortedlevel = Object.entries(global.db.data.users).sort((a, b) => b[1].level - a[1].level)
    let sorteddiamond = Object.entries(global.db.data.users).sort((a, b) => b[1].diamond - a[1].diamond)
    let sortedpotion = Object.entries(global.db.data.users).sort((a, b) => b[1].potion - a[1].potion)
    let sortedsampah = Object.entries(global.db.data.users).sort((a, b) => b[1].sampah - a[1].sampah)
    let sortedcommon = Object.entries(global.db.data.users).sort((a, b) => b[1].common - a[1].common)
    let sorteduncommon = Object.entries(global.db.data.users).sort((a, b) => b[1].uncommon - a[1].uncommon)
    let sortedmythic = Object.entries(global.db.data.users).sort((a, b) => b[1].mythic - a[1].mythic)
    let sortedlegendary = Object.entries(global.db.data.users).sort((a, b) => b[1].legendary - a[1].legendary)
    let usersmoney = sortedmoney.map(v => v[0])
    let usersdiamond = sorteddiamond.map(v => v[0])
    let userspotion = sortedpotion.map(v => v[0])
    let userssampah = sortedsampah.map(v => v[0])
    let userslevel = sortedlevel.map(v => v[0])
    let userscommon = sortedcommon.map(v => v[0])
    let usersuncommon = sorteduncommon.map(v => v[0])
    let usersmythic = sortedmythic.map(v => v[0])
    let userslegendary = sortedlegendary.map(v => v[0])

    const getArmorName = (armor) => {
        const armorNames = ['Tidak Punya', 'Leather Armor', 'Iron Armor', 'Gold Armor', 'Diamond Armor', 'Netherite Armor']
        return armorNames[armor] || 'Unknown'
    }

    const getPetLevel = (level, maxLevel) => {
        if (level === 0) return 'Tidak Punya'
        if (level >= maxLevel) return 'Max Level'
        return `Level ${level}`
    }

    const getHeroLevel = (hero) => {
        if (hero === 0) return 'Tidak Punya'
        if (hero === 40) return 'Level MAX'
        return `Level ${hero}`
    }

    const getPetProgress = (pet, level, exp, maxLevel) => {
        if (level === 0) return 'Tidak Punya'
        if (level >= maxLevel) return 'Max Level'
        const expNeeded = level * (maxLevel === 5 ? 1000 : 10000)
        return `Level ${level} To level ${level + 1}\n│Exp ${exp} -> ${expNeeded}`
    }

    const getHeroProgress = (hero, exphero) => {
        if (hero === 0) return 'Tidak Punya'
        if (hero === 40) return 'Max Level'
        return `Level ${hero} To level ${hero + 1}\n│Exp ${exphero} -> ${hero * 500}`
    }

    let str = `
Inventory *${await conn.getName(name)}*

♥️ Health: *${health}*
🛡️ Armor: *${getArmorName(armor)}*
💰 Money: *${money}*
⚡ Stamina: *${stamin}*
⛔ Limit: *${limit}*
🎮 Level: *${level}*
🟢 Exp: *${exp}*
🏦 Atm: *${bank}*
🎟️ Cupon: *${cupon}*
⭐ Expg: *${expg}*
🎫 Tiketm: *${tiketm}*
🪙 Tiketcoin: *${tiketcoin}*

🧰 *Inventory*
Potion: *${potion}*
Ramuan: *${ramuan}*
Iron: *${iron}*
String: *${string}*
Sword: *${sword}*
Sampah: *${sampah}*
Kayu: *${kayu}*
Batu: *${batu}*
Aqua: *${aqua}*
Makanan Pet: *${makananpet}*
Makanan Phonix: *${makananphonix}*
Makanan Naga: *${makanannaga}*
Makanan Griffin: *${makanangriffin}*
Makanan Kyubi: *${makanankyubi}*
Makanan Centaur: *${makanancentaur}*
Total inv: *${diamond + potion + (ramuan || 0) + sampah + kayu + (sword || 0) + (iron || 0) + (string || 0) + makananpet + (makananphonix || 0) + (makanannaga || 0) + (makanangriffin || 0) + (makanankyubi || 0) + (makanancentaur || 0)}* item

📦 *Crate*
Boxs: *${boxs}*
Common: *${common}*
Uncommon: *${uncommon}*
Mythic: *${mythic}*
Legendary: *${legendary}*
Pet: *${pet}*
Gardenboxs: *${gardenboxs}*

🍍 *Fruits*
Mangga: ${mangga}
Anggur: ${anggur}
Pisang: ${pisang}
Jeruk: ${jeruk}
Apel: ${apel}

🌱 *Seeds*
Bibit Mangga: ${bibitmangga}
Bibit Anggur: ${bibitanggur}
Bibit Pisang: ${bibitpisang}
Bibit Jeruk: ${bibitjeruk}
Bibit Apel: ${bibitapel}

🗑️ *Trash Man*
Kardus: ${kardus}
Kaleng: ${kaleng}
Botol: ${botol}

⛏️ *Mining*
Berlian: ${berlian}
Emas: ${emas}
Diamond: ${diamond}
Coal: ${coal}

🦸‍♂️ *Hero*
My Hero: *${getHeroLevel(hero)}*

🐹 *Pet*
Kucing: *${getPetLevel(kucing, 5)}*
Kuda: *${getPetLevel(kuda, 5)}*
Naga: *${getPetLevel(naga, 20)}*
Kyubi: *${getPetLevel(kyubi, 20)}*
Centaur: *${getPetLevel(centaur, 20)}*
Rubah: *${getPetLevel(rubah, 5)}*
Phonix: *${getPetLevel(phonix, 15)}*
Griffin: *${getPetLevel(griffin, 15)}*
Serigala: *${getPetLevel(serigala, 15)}*

📊 *Progress*
╭────────────────
│Level *${level}* To Level *${level + 1}*
│Exp *${exp}* -> *${max}*
│
│Hero ${getHeroProgress(hero, exphero)}
╰────────────────
╭────────────────
│Rubah ${getPetProgress('rubah', rubah, _rubah, 5)}
╰────────────────
╭────────────────
│Kucing ${getPetProgress('kucing', kucing, _kucing, 5)}
╰────────────────
╭────────────────
│Kuda ${getPetProgress('kuda', kuda, _kuda, 5)}
╰────────────────
╭────────────────
│Naga ${getPetProgress('naga', naga, _naga, 20)}
╰────────────────
╭────────────────
│Phonix ${getPetProgress('phonix', phonix, _phonix, 15)}
╰────────────────
╭────────────────
│Kyubi ${getPetProgress('kyubi', kyubi, _kyubi, 20)}
╰────────────────
╭────────────────
│Centaur ${getPetProgress('centaur', centaur, _centaur, 20)}
╰────────────────
╭────────────────
│Griffin ${getPetProgress('griffin', griffin, _griffin, 15)}
╰────────────────
╭────────────────
│Serigala ${getPetProgress('serigala', serigala, _serigala, 15)}
╰────────────────

🥇 *Achievement*
1.Top level *${userslevel.indexOf(m.sender) + 1}* dari *${userslevel.length}*
2.Top Money *${usersmoney.indexOf(m.sender) + 1}* dari *${usersmoney.length}*
3.Top Diamond *${usersdiamond.indexOf(m.sender) + 1}* dari *${usersdiamond.length}*
4.Top Potion *${userspotion.indexOf(m.sender) + 1}* dari *${userspotion.length}*
5.Top Common *${userscommon.indexOf(m.sender) + 1}* dari *${userscommon.length}*
6.Top Uncommon *${usersuncommon.indexOf(m.sender) + 1}* dari *${usersuncommon.length}*
7.Top Mythic *${usersmythic.indexOf(m.sender) + 1}* dari *${usersmythic.length}*
8.Top Legendary *${userslegendary.indexOf(m.sender) + 1}* dari *${userslegendary.length}*
9.Top Sampah *${userssampah.indexOf(m.sender) + 1}* dari *${userssampah.length}*
`.trim()
    
    bot.reply(m.chat, str, m.id)
}

handler.help = ['inv']
handler.tags = ['rpg']
handler.command = /^(inv|inventory)$/i
handler.limit = true
handler.group = false

module.exports = handler