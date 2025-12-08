const potion = 20000
const Spotion = 100 
const Bdiamond = 100000
const Sdiamond = 1000
const Bcommon = 100000
const Scommon = 1000
const Suncommon = 100
const Buncommon = 100000
const Bmythic = 100000
const Smythic = 1000
const Blegendary = 200000
const Slegendary = 5000
const Bsampah = 120
const Ssampah = 5
const Bkayu = 1000
const Skayu = 400
const Bbotol = 300
const Sbotol = 50
const Bkaleng = 400
const Skaleng = 100
const Bkardus = 400
const Skardus = 50
const Bpisang = 5500
const Spisang = 100
const Bmangga = 4600
const Smangga = 150
const Bjeruk = 6000
const Sjeruk = 300
const Banggur = 5500
const Sanggur = 150
const Bapel = 5500
const Sapel = 400
const Bbibitpisang = 550
const Sbibitpisang = 50
const Bbibitmangga = 550
const Sbibitmangga = 50
const Bbibitjeruk = 550
const Sbibitjeruk = 50
const Bbibitanggur = 550
const Sbibitanggur = 50
const Bbibitapel = 550
const Sbibitapel = 50
const Bgardenboxs = 65000
const Sgardenboc = 350000
const Bberlian = 150000
const Sberlian = 10000
const Bemasbatang = 250000
const Semasbatang = 10000
const Bemasbiasa = 150000
const Semasbiasa = 15000
const Bphonix = 1000000000
const Sphonix = 1000000
const Bgriffin = 100000000
const Sgriffin = 100000
const Bkyubi = 100000000
const Skyubi = 100000
const Bnaga = 100000000
const Snaga = 100000
const Bcentaur = 100000000
const Scentaur = 100000
const Bkuda = 50000000
const Skuda = 100000
const Brubah = 100000000
const Srubah = 100000
const Bkucing = 5000000
const Skucing = 50000
const Bserigala = 50000000
const Sserigala = 500000
const Bmakananpet = 50000
const Smakananpet = 500
const Bmakananphonix = 80000
const Smakananphonix = 5000
const Bmakanangriffin = 80000
const Smakanangriffin = 5000
const Bmakanannaga = 150000
const Smakanannaga = 10000
const Bmakanankyubi = 150000
const Smakanankyubi = 10000
const Bmakanancentaur = 150000
const Smakanancentaur = 10000
const Bhealtmonster = 20000
const Bpet = 150000
const Spet = 1000
const Blimit = 25000
const Slimit = 20000
const Bexp = 550
const Baqua = 5000
const Saqua = 1000
const Biron = 20000
const Siron = 5000
const Bstring = 50000
const Sstring = 5000
const Bsword = 150000
const Ssword = 15000
const Bumpan = 1500
const Sumpan = 100
const Bpancingan = 5000000
const Spancingan = 500000
const BBensin = 20000
const BWeap = 150000
const SWeap = 15000
const SBensin = 10000
const Bbatu = 500
const Sbatu = 100
const Bketake = 15
const Btiketcoin = 500
const Bkoinexpg = 500000
const BObat = 15000
const ObatStock = 500
const Beleksirb = 500
const BnStock = 9999
const WeapStock = 50
const Bpickaxe = 150000
const Spickaxe = 15000
const Barmor = 200000
const Sarmor = 20000

let handler = async (m, { conn, command, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    const _armor = user.armor
    const armor = (_armor == 0 ? 20000 : '' || _armor == 1 ? 49999 : '' || _armor == 2 ? 99999 : '' || _armor == 3 ? 149999 : '' || _armor == 4 ? 299999 : '')
    let type = (args[0] || '').toLowerCase()
    let _type = (args[1] || '').toLowerCase()
    let jualbeli = (args[0] || '').toLowerCase()
    
    const Kchat = `Penggunaan ${usedPrefix}shop <Buy|sell> <item> <jumlah>
Contoh penggunaan: *${usedPrefix}shop buy potion 1*

============================
*Equipment (Gak bisa beli kalo udah punya)*
Pickaxe: ${Bpickaxe} (Dura: 80) | Jual: ${Spickaxe}
Sword: ${Bsword} (Dura: 100) | Jual: ${Ssword}
Armor: ${Barmor} (Dura: 100) | Jual: ${Sarmor}
Pancingan: ${Bpancingan} (Dura: 60) | Jual: ${Spancingan}

============================
*Kebutuhan   |  Harga Beli*
Limit: ${Blimit}
TiketM: ${Bhealtmonster}
Cupon: ${Btiketcoin}
KoinExpg: ${Bkoinexpg}

*Kebutuhan   |  Harga Jual*
Limit: ${Slimit}
============================
*Bibit Buah   |  Harga Beli*
BibitPisang: ${Bbibitpisang}
BibitAnggur: ${Bbibitanggur}
BibitMangga: ${Bbibitmangga}
BibitJeruk: ${Bbibitjeruk}
BibitApel: ${Bbibitapel}
Gardenboxs: ${Bgardenboxs}
============================
*Barang   |  Harga Beli*
Potion: ${potion}
Diamond: ${Bdiamond}
Common: ${Bcommon}
Uncommon: ${Buncommon}
Mythic: ${Bmythic}
Legendary: ${Blegendary}
Sampah: ${Bsampah}
String: ${Bstring}
Iron: ${Biron}
Batu: ${Bbatu}
Botol: ${Bbotol}
Kaleng: ${Bkaleng}
Kardus: ${Bkardus}
Kayu: ${Bkayu}
Berlian: ${Bberlian}
Emas: ${Bemasbiasa}
Bensin: ${BBensin} | Stock: ${BnStock}
Weapon: ${BWeap} | Stock: ${WeapStock}
Obat: ${BObat} | Stock: ${ObatStock}

*Barang   | Harga Jual*
Potion: ${Spotion}
Diamond: ${Sdiamond}
Common: ${Scommon}
Uncommon: ${Suncommon}
Mythic: ${Smythic}
Legendary: ${Slegendary}
Sampah: ${Ssampah}
String: ${Sstring}
Iron: ${Siron}
Batu: ${Sbatu}
Botol: ${Sbotol}
Kaleng: ${Skaleng}
Kardus: ${Skardus}
Kayu: ${Skayu}
Berlian: ${Sberlian}
Emas: ${Semasbiasa}
Bensin: ${SBensin} | Stock: ${BnStock}
Weapon: ${SWeap} | Stock: ${WeapStock}
============================
*List Makanan:*

*Makanan | Harga Beli*
Pisang: ${Bpisang}
Anggur: ${Banggur}
Mangga: ${Bmangga}
Jeruk: ${Bjeruk}
Apel: ${Bapel}
MakananPet: ${Bmakananpet}
MakananNaga: ${Bmakanannaga}
MakananKyubi: ${Bmakanankyubi}
MakananGriffin: ${Bmakanangriffin}
MakananPhonix: ${Bmakananphonix}
MakananCentaur: ${Bmakanancentaur}

*Makanan | Harga Jual*
Pisang: ${Spisang}
Anggur: ${Sanggur}
Mangga: ${Smangga}
Jeruk: ${Sjeruk}
Apel: ${Sapel}
MakananPet: ${Smakananpet}
MakananNaga: ${Smakanannaga}
MakananKyubi: ${Smakanankyubi}
MakananGriffin: ${Smakanangriffin}
MakananPhonix: ${Smakananphonix}
MakananCentaur: ${Smakanancentaur}
============================
*Minuman | Harga Beli*
Aqua: ${Baqua}

*Minuman | Harga Jual*
Aqua: ${Saqua}
============================
*Fishing | Harga Beli*
Umpan: ${Bumpan}`

    try {
        if (/shop|toko/i.test(command)) {
            const count = args[2] && args[2].length > 0 ? Math.min(999999999999999, Math.max(parseInt(args[2]), 1)) : !args[2] || args.length < 4 ? 1 : Math.min(1, count)
            
            switch (jualbeli) {
                case 'buy':
                    switch (_type) {
                        case 'pickaxe':
                            if (user.pickaxe > 0) return conn.reply(m.chat, 'Lu udah punya pickaxe! Gak bisa beli lagi.', m)
                            if (user.money >= Bpickaxe) {
                                user.money -= Bpickaxe
                                user.pickaxe = 1
                                user.pickaxedurability = 80
                                conn.reply(m.chat, `Sukses beli Pickaxe seharga ${Bpickaxe} money\nDurability: 80`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup buat beli Pickaxe seharga ${Bpickaxe} money`, m)
                            break
                        case 'sword':
                            if (user.sword > 0) return conn.reply(m.chat, 'Lu udah punya sword! Gak bisa beli lagi.', m)
                            if (user.money >= Bsword) {
                                user.money -= Bsword
                                user.sword = 1
                                user.sworddurability = 100
                                conn.reply(m.chat, `Sukses beli Sword seharga ${Bsword} money\nDurability: 100`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup buat beli Sword seharga ${Bsword} money`, m)
                            break
                        case 'armor':
                            if (user.armor > 0) return conn.reply(m.chat, 'Lu udah punya armor! Gak bisa beli lagi.', m)
                            if (user.money >= Barmor) {
                                user.money -= Barmor
                                user.armor = 1
                                user.armordurability = 100
                                conn.reply(m.chat, `Sukses beli Armor seharga ${Barmor} money\nDurability: 100`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup buat beli Armor seharga ${Barmor} money`, m)
                            break
                        case 'pancingan':
                            if (user.fishingrod > 0) return conn.reply(m.chat, 'Lu udah punya pancingan! Gak bisa beli lagi.', m)
                            if (user.money >= Bpancingan) {
                                user.money -= Bpancingan
                                user.fishingrod = 1
                                user.fishingroddurability = 60
                                conn.reply(m.chat, `Sukses beli Pancingan seharga ${Bpancingan} money\nDurability: 60`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup buat beli Pancingan seharga ${Bpancingan} money`, m)
                            break
                        case 'potion':
                            if (user.money >= potion * count) {
                                user.money -= potion * count
                                user.potion += count * 1
                                conn.reply(m.chat, `Sukses beli ${count} Potion seharga ${potion * count} money\n\nPake potion: *${usedPrefix}use potion <jumlah>*`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup buat beli ${count} Potion seharga ${potion * count} money`, m)
                            break
                        case 'diamond':
                            if (user.money >= Bdiamond * count) {
                                user.diamond += count * 1
                                user.money -= Bdiamond * count
                                conn.reply(m.chat, `Sukses beli ${count} Diamond seharga ${Bdiamond * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'common':
                            if (user.money >= Bcommon * count) {
                                user.common += count * 1
                                user.money -= Bcommon * count
                                conn.reply(m.chat, `Sukses beli ${count} Common seharga ${Bcommon * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'uncommon':
                            if (user.money >= Buncommon * count) {
                                user.uncommon += count * 1
                                user.money -= Buncommon * count
                                conn.reply(m.chat, `Sukses beli ${count} Uncommon seharga ${Buncommon * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'mythic':
                            if (user.money >= Bmythic * count) {
                                user.mythic += count * 1
                                user.money -= Bmythic * count
                                conn.reply(m.chat, `Sukses beli ${count} Mythic seharga ${Bmythic * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'legendary':
                            if (user.money >= Blegendary * count) {
                                user.legendary += count * 1
                                user.money -= Blegendary * count
                                conn.reply(m.chat, `Sukses beli ${count} Legendary seharga ${Blegendary * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'sampah':
                            if (user.money >= Bsampah * count) {
                                user.sampah += count * 1
                                user.money -= Bsampah * count
                                conn.reply(m.chat, `Sukses beli ${count} Sampah seharga ${Bsampah * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'string':
                            if (user.money >= Bstring * count) {
                                user.string += count * 1
                                user.money -= Bstring * count
                                conn.reply(m.chat, `Sukses beli ${count} String seharga ${Bstring * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'iron':
                            if (user.money >= Biron * count) {
                                user.iron += count * 1
                                user.money -= Biron * count
                                conn.reply(m.chat, `Sukses beli ${count} Iron seharga ${Biron * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'batu':
                            if (user.money >= Bbatu * count) {
                                user.batu += count * 1
                                user.money -= Bbatu * count
                                conn.reply(m.chat, `Sukses beli ${count} Batu seharga ${Bbatu * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'botol':
                            if (user.money >= Bbotol * count) {
                                user.botol += count * 1
                                user.money -= Bbotol * count
                                conn.reply(m.chat, `Sukses beli ${count} Botol seharga ${Bbotol * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'kaleng':
                            if (user.money >= Bkaleng * count) {
                                user.kaleng += count * 1
                                user.money -= Bkaleng * count
                                conn.reply(m.chat, `Sukses beli ${count} Kaleng seharga ${Bkaleng * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'kardus':
                            if (user.money >= Bkardus * count) {
                                user.kardus += count * 1
                                user.money -= Bkardus * count
                                conn.reply(m.chat, `Sukses beli ${count} Kardus seharga ${Bkardus * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'kayu':
                            if (user.money >= Bkayu * count) {
                                user.kayu += count * 1
                                user.money -= Bkayu * count
                                conn.reply(m.chat, `Sukses beli ${count} Kayu seharga ${Bkayu * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'berlian':
                            if (user.money >= Bberlian * count) {
                                user.berlian += count * 1
                                user.money -= Bberlian * count
                                conn.reply(m.chat, `Sukses beli ${count} Berlian seharga ${Bberlian * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'emas':
                            if (user.money >= Bemasbiasa * count) {
                                user.emas += count * 1
                                user.money -= Bemasbiasa * count
                                conn.reply(m.chat, `Sukses beli ${count} Emas seharga ${Bemasbiasa * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'bensin':
                            if (user.money >= BBensin * count) {
                                user.bensin += count * 1
                                user.money -= BBensin * count
                                conn.reply(m.chat, `Sukses beli ${count} Bensin seharga ${BBensin * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'weapon':
                            if (user.money >= BWeap * count) {
                                user.weapon += count * 1
                                user.money -= BWeap * count
                                conn.reply(m.chat, `Sukses beli ${count} Weapon seharga ${BWeap * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'obat':
                            if (user.money >= BObat * count) {
                                user.obat += count * 1
                                user.money -= BObat * count
                                conn.reply(m.chat, `Sukses beli ${count} Obat seharga ${BObat * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'bibitpisang':
                            if (user.money >= Bbibitpisang * count) {
                                user.bibitpisang += count * 1
                                user.money -= Bbibitpisang * count
                                conn.reply(m.chat, `Sukses beli ${count} BibitPisang seharga ${Bbibitpisang * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'bibitanggur':
                            if (user.money >= Bbibitanggur * count) {
                                user.bibitanggur += count * 1
                                user.money -= Bbibitanggur * count
                                conn.reply(m.chat, `Sukses beli ${count} BibitAnggur seharga ${Bbibitanggur * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'bibitmangga':
                            if (user.money >= Bbibitmangga * count) {
                                user.bibitmangga += count * 1
                                user.money -= Bbibitmangga * count
                                conn.reply(m.chat, `Sukses beli ${count} BibitMangga seharga ${Bbibitmangga * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'bibitjeruk':
                            if (user.money >= Bbibitjeruk * count) {
                                user.bibitjeruk += count * 1
                                user.money -= Bbibitjeruk * count
                                conn.reply(m.chat, `Sukses beli ${count} BibitJeruk seharga ${Bbibitjeruk * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'bibitapel':
                            if (user.money >= Bbibitapel * count) {
                                user.bibitapel += count * 1
                                user.money -= Bbibitapel * count
                                conn.reply(m.chat, `Sukses beli ${count} BibitApel seharga ${Bbibitapel * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'gardenboxs':
                            if (user.money >= Bgardenboxs * count) {
                                user.gardenboxs += count * 1
                                user.money -= Bgardenboxs * count
                                conn.reply(m.chat, `Sukses beli ${count} Gardenboxs seharga ${Bgardenboxs * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'pisang':
                            if (user.money >= Bpisang * count) {
                                user.pisang += count * 1
                                user.money -= Bpisang * count
                                conn.reply(m.chat, `Sukses beli ${count} Pisang seharga ${Bpisang * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'anggur':
                            if (user.money >= Banggur * count) {
                                user.anggur += count * 1
                                user.money -= Banggur * count
                                conn.reply(m.chat, `Sukses beli ${count} Anggur seharga ${Banggur * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'mangga':
                            if (user.money >= Bmangga * count) {
                                user.mangga += count * 1
                                user.money -= Bmangga * count
                                conn.reply(m.chat, `Sukses beli ${count} Mangga seharga ${Bmangga * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'jeruk':
                            if (user.money >= Bjeruk * count) {
                                user.jeruk += count * 1
                                user.money -= Bjeruk * count
                                conn.reply(m.chat, `Sukses beli ${count} Jeruk seharga ${Bjeruk * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'apel':
                            if (user.money >= Bapel * count) {
                                user.apel += count * 1
                                user.money -= Bapel * count
                                conn.reply(m.chat, `Sukses beli ${count} Apel seharga ${Bapel * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'makananpet':
                            if (user.money >= Bmakananpet * count) {
                                user.makananpet += count * 1
                                user.money -= Bmakananpet * count
                                conn.reply(m.chat, `Sukses beli ${count} MakananPet seharga ${Bmakananpet * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'makanannaga':
                            if (user.money >= Bmakanannaga * count) {
                                user.makanannaga += count * 1
                                user.money -= Bmakanannaga * count
                                conn.reply(m.chat, `Sukses beli ${count} MakananNaga seharga ${Bmakanannaga * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'makanankyubi':
                            if (user.money >= Bmakanankyubi * count) {
                                user.makanankyubi += count * 1
                                user.money -= Bmakanankyubi * count
                                conn.reply(m.chat, `Sukses beli ${count} MakananKyubi seharga ${Bmakanankyubi * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'makanangriffin':
                            if (user.money >= Bmakanangriffin * count) {
                                user.makanangriffin += count * 1
                                user.money -= Bmakanangriffin * count
                                conn.reply(m.chat, `Sukses beli ${count} MakananGriffin seharga ${Bmakanangriffin * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'makananphonix':
                            if (user.money >= Bmakananphonix * count) {
                                user.makananphonix += count * 1
                                user.money -= Bmakananphonix * count
                                conn.reply(m.chat, `Sukses beli ${count} MakananPhonix seharga ${Bmakananphonix * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'makanancentaur':
                            if (user.money >= Bmakanancentaur * count) {
                                user.makanancentaur += count * 1
                                user.money -= Bmakanancentaur * count
                                conn.reply(m.chat, `Sukses beli ${count} MakananCentaur seharga ${Bmakanancentaur * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'aqua':
                            if (user.money >= Baqua * count) {
                                user.aqua += count * 1
                                user.money -= Baqua * count
                                conn.reply(m.chat, `Sukses beli ${count} Aqua seharga ${Baqua * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        case 'umpan':
                            if (user.money >= Bumpan * count) {
                                user.umpan += count * 1
                                user.money -= Bumpan * count
                                conn.reply(m.chat, `Sukses beli ${count} Umpan seharga ${Bumpan * count} money`, m)
                            } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                            break
                        default:
                            return conn.reply(m.chat, Kchat, m)
                    }
                    break
                case 'sell':
                    switch (_type) {
                        case 'pickaxe':
                            if (user.pickaxe >= 1) {
                                user.pickaxe = 0
                                user.pickaxedurability = 0
                                user.money += Spickaxe
                                conn.reply(m.chat, `Sukses jual Pickaxe, lu dapet ${Spickaxe} money`, m)
                            } else conn.reply(m.chat, `Pickaxe lu gak ada`, m)
                            break
                        case 'sword':
                            if (user.sword >= 1) {
                                user.sword = 0
                                user.sworddurability = 0
                                user.money += Ssword
                                conn.reply(m.chat, `Sukses jual Sword, lu dapet ${Ssword} money`, m)
                            } else conn.reply(m.chat, `Sword lu gak ada`, m)
                            break
                        case 'armor':
                            if (user.armor >= 1) {
                                user.armor = 0
                                user.armordurability = 0
                                user.money += Sarmor
                                conn.reply(m.chat, `Sukses jual Armor, lu dapet ${Sarmor} money`, m)
                            } else conn.reply(m.chat, `Armor lu gak ada`, m)
                            break
                        case 'pancingan':
                            if (user.fishingrod >= 1) {
                                user.fishingrod = 0
                                user.fishingroddurability = 0
                                user.money += Spancingan
                                conn.reply(m.chat, `Sukses jual Pancingan, lu dapet ${Spancingan} money`, m)
                            } else conn.reply(m.chat, `Pancingan lu gak ada`, m)
                            break
                        case 'potion':
                            if (user.potion >= count * 1) {
                                user.money += Spotion * count
                                user.potion -= count * 1
                                conn.reply(m.chat, `Sukses jual ${count} Potion seharga ${Spotion * count} money`, m)
                            } else conn.reply(m.chat, `Potion lu gak cukup`, m)
                            break
                        case 'diamond':
                            if (user.diamond >= count * 1) {
                                user.diamond -= count * 1
                                user.money += Sdiamond * count
                                conn.reply(m.chat, `Sukses jual ${count} Diamond, lu dapet ${Sdiamond * count} money`, m)
                            } else conn.reply(m.chat, `Diamond lu gak cukup`, m)
                            break
                        case 'common':
                            if (user.common >= count * 1) {
                                user.common -= count * 1
                                user.money += Scommon * count
                                conn.reply(m.chat, `Sukses jual ${count} Common, lu dapet ${Scommon * count} money`, m)
                            } else conn.reply(m.chat, `Common lu gak cukup`, m)
                            break
                        case 'uncommon':
                            if (user.uncommon >= count * 1) {
                                user.uncommon -= count * 1
                                user.money += Suncommon * count
                                conn.reply(m.chat, `Sukses jual ${count} Uncommon, lu dapet ${Suncommon * count} money`, m)
                            } else conn.reply(m.chat, `Uncommon lu gak cukup`, m)
                            break
                        case 'mythic':
                            if (user.mythic >= count * 1) {
                                user.mythic -= count * 1
                                user.money += Smythic * count
                                conn.reply(m.chat, `Sukses jual ${count} Mythic, lu dapet ${Smythic * count} money`, m)
                            } else conn.reply(m.chat, `Mythic lu gak cukup`, m)
                            break
                        case 'legendary':
                            if (user.legendary >= count * 1) {
                                user.legendary -= count * 1
                                user.money += Slegendary * count
                                conn.reply(m.chat, `Sukses jual ${count} Legendary, lu dapet ${Slegendary * count} money`, m)
                            } else conn.reply(m.chat, `Legendary lu gak cukup`, m)
                            break
                        case 'sampah':
                            if (user.sampah >= count * 1) {
                                user.sampah -= count * 1
                                user.money += Ssampah * count
                                conn.reply(m.chat, `Sukses jual ${count} Sampah, lu dapet ${Ssampah * count} money`, m)
                            } else conn.reply(m.chat, `Sampah lu gak cukup`, m)
                            break
                        case 'string':
                            if (user.string >= count * 1) {
                                user.string -= count * 1
                                user.money += Sstring * count
                                conn.reply(m.chat, `Sukses jual ${count} String, lu dapet ${Sstring * count} money`, m)
                            } else conn.reply(m.chat, `String lu gak cukup`, m)
                            break
                        case 'iron':
                            if (user.iron >= count * 1) {
                                user.iron -= count * 1
                                user.money += Siron * count
                                conn.reply(m.chat, `Sukses jual ${count} Iron, lu dapet ${Siron * count} money`, m)
                            } else conn.reply(m.chat, `Iron lu gak cukup`, m)
                            break
                        case 'batu':
                            if (user.batu >= count * 1) {
                                user.batu -= count * 1
                                user.money += Sbatu * count
                                conn.reply(m.chat, `Sukses jual ${count} Batu, lu dapet ${Sbatu * count} money`, m)
                            } else conn.reply(m.chat, `Batu lu gak cukup`, m)
                            break
                        case 'botol':
                            if (user.botol >= count * 1) {
                                user.botol -= count * 1
                                user.money += Sbotol * count
                                conn.reply(m.chat, `Sukses jual ${count} Botol, lu dapet ${Sbotol * count} money`, m)
                            } else conn.reply(m.chat, `Botol lu gak cukup`, m)
                            break
                        case 'kaleng':
                            if (user.kaleng >= count * 1) {
                                user.kaleng -= count * 1
                                user.money += Skaleng * count
                                conn.reply(m.chat, `Sukses jual ${count} Kaleng, lu dapet ${Skaleng * count} money`, m)
                            } else conn.reply(m.chat, `Kaleng lu gak cukup`, m)
                            break
                        case 'kardus':
                            if (user.kardus >= count * 1) {
                                user.kardus -= count * 1
                                user.money += Skardus * count
                                conn.reply(m.chat, `Sukses jual ${count} Kardus, lu dapet ${Skardus * count} money`, m)
                            } else conn.reply(m.chat, `Kardus lu gak cukup`, m)
                            break
                        case 'kayu':
                            if (user.kayu >= count * 1) {
                                user.kayu -= count * 1
                                user.money += Skayu * count
                                conn.reply(m.chat, `Sukses jual ${count} Kayu, lu dapet ${Skayu * count} money`, m)
                            } else conn.reply(m.chat, `Kayu lu gak cukup`, m)
                            break
                        case 'berlian':
                            if (user.berlian >= count * 1) {
                                user.berlian -= count * 1
                                user.money += Sberlian * count
                                conn.reply(m.chat, `Sukses jual ${count} Berlian, lu dapet ${Sberlian * count} money`, m)
                            } else conn.reply(m.chat, `Berlian lu gak cukup`, m)
                            break
                        case 'emas':
                            if (user.emas >= count * 1) {
                                user.emas -= count * 1
                                user.money += Semasbiasa * count
                                conn.reply(m.chat, `Sukses jual ${count} Emas, lu dapet ${Semasbiasa * count} money`, m)
                            } else conn.reply(m.chat, `Emas lu gak cukup`, m)
                            break
                        case 'bensin':
                            if (user.bensin >= count * 1) {
                                user.bensin -= count * 1
                                user.money += SBensin * count
                                conn.reply(m.chat, `Sukses jual ${count} Bensin, lu dapet ${SBensin * count} money`, m)
                            } else conn.reply(m.chat, `Bensin lu gak cukup`, m)
                            break
                        case 'weapon':
                            if (user.weapon >= count * 1) {
                                user.weapon -= count * 1
                                user.money += SWeap * count
                                conn.reply(m.chat, `Sukses jual ${count} Weapon, lu dapet ${SWeap * count} money`, m)
                            } else conn.reply(m.chat, `Weapon lu gak cukup`, m)
                            break
                        case 'pisang':
                            if (user.pisang >= count * 1) {
                                user.pisang -= count * 1
                                user.money += Spisang * count
                                conn.reply(m.chat, `Sukses jual ${count} Pisang, lu dapet ${Spisang * count} money`, m)
                            } else conn.reply(m.chat, `Pisang lu gak cukup`, m)
                            break
                        case 'anggur':
                            if (user.anggur >= count * 1) {
                                user.anggur -= count * 1
                                user.money += Sanggur * count
                                conn.reply(m.chat, `Sukses jual ${count} Anggur, lu dapet ${Sanggur * count} money`, m)
                            } else conn.reply(m.chat, `Anggur lu gak cukup`, m)
                            break
                        case 'mangga':
                            if (user.mangga >= count * 1) {
                                user.mangga -= count * 1
                                user.money += Smangga * count
                                conn.reply(m.chat, `Sukses jual ${count} Mangga, lu dapet ${Smangga * count} money`, m)
                            } else conn.reply(m.chat, `Mangga lu gak cukup`, m)
                            break
                        case 'jeruk':
                            if (user.jeruk >= count * 1) {
                                user.jeruk -= count * 1
                                user.money += Sjeruk * count
                                conn.reply(m.chat, `Sukses jual ${count} Jeruk, lu dapet ${Sjeruk * count} money`, m)
                            } else conn.reply(m.chat, `Jeruk lu gak cukup`, m)
                            break
                        case 'apel':
                            if (user.apel >= count * 1) {
                                user.apel -= count * 1
                                user.money += Sapel * count
                                conn.reply(m.chat, `Sukses jual ${count} Apel, lu dapet ${Sapel * count} money`, m)
                            } else conn.reply(m.chat, `Apel lu gak cukup`, m)
                            break
                        case 'makananpet':
                            if (user.makananpet >= count * 1) {
                                user.makananpet -= count * 1
                                user.money += Smakananpet * count
                                conn.reply(m.chat, `Sukses jual ${count} MakananPet, lu dapet ${Smakananpet * count} money`, m)
                            } else conn.reply(m.chat, `MakananPet lu gak cukup`, m)
                            break
                        case 'makanannaga':
                            if (user.makanannaga >= count * 1) {
                                user.makanannaga -= count * 1
                                user.money += Smakanannaga * count
                                conn.reply(m.chat, `Sukses jual ${count} MakananNaga, lu dapet ${Smakanannaga * count} money`, m)
                            } else conn.reply(m.chat, `MakananNaga lu gak cukup`, m)
                            break
                        case 'makanankyubi':
                            if (user.makanankyubi >= count * 1) {
                                user.makanankyubi -= count * 1
                                user.money += Smakanankyubi * count
                                conn.reply(m.chat, `Sukses jual ${count} MakananKyubi, lu dapet ${Smakanankyubi * count} money`, m)
                            } else conn.reply(m.chat, `MakananKyubi lu gak cukup`, m)
                            break
                        case 'makanangriffin':
                            if (user.makanangriffin >= count * 1) {
                                user.makanangriffin -= count * 1
                                user.money += Smakanangriffin * count
                                conn.reply(m.chat, `Sukses jual ${count} MakananGriffin, lu dapet ${Smakanangriffin * count} money`, m)
                            } else conn.reply(m.chat, `MakananGriffin lu gak cukup`, m)
                            break
                        case 'makananphonix':
                            if (user.makananphonix >= count * 1) {
                                user.makananphonix -= count * 1
                                user.money += Smakananphonix * count
                                conn.reply(m.chat, `Sukses jual ${count} MakananPhonix, lu dapet ${Smakananphonix * count} money`, m)
                            } else conn.reply(m.chat, `MakananPhonix lu gak cukup`, m)
                            break
                        case 'makanancentaur':
                            if (user.makanancentaur >= count * 1) {
                                user.makanancentaur -= count * 1
                                user.money += Smakanancentaur * count
                                conn.reply(m.chat, `Sukses jual ${count} MakananCentaur, lu dapet ${Smakanancentaur * count} money`, m)
                            } else conn.reply(m.chat, `MakananCentaur lu gak cukup`, m)
                            break
                        case 'aqua':
                            if (user.aqua >= count * 1) {
                                user.aqua -= count * 1
                                user.money += Saqua * count
                                conn.reply(m.chat, `Sukses jual ${count} Aqua, lu dapet ${Saqua * count} money`, m)
                            } else conn.reply(m.chat, `Aqua lu gak cukup`, m)
                            break
                        default:
                            return conn.reply(m.chat, Kchat, m)
                    }
                    break
                default:
                    return conn.reply(m.chat, Kchat, m)
            }
        } else if (/beli|buy/i.test(command)) {
            const count = args[1] && args[1].length > 0 ? Math.min(999999999999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count)
            switch (type) {
                case 'pickaxe':
                    if (user.pickaxe > 0) return conn.reply(m.chat, 'Lu udah punya pickaxe! Gak bisa beli lagi.', m)
                    if (user.money >= Bpickaxe) {
                        user.money -= Bpickaxe
                        user.pickaxe = 1
                        user.pickaxedurability = 80
                        conn.reply(m.chat, `Sukses beli Pickaxe seharga ${Bpickaxe} money\nDurability: 80`, m)
                    } else conn.reply(m.chat, `Duit lu gak cukup buat beli Pickaxe seharga ${Bpickaxe} money`, m)
                    break
                case 'sword':
                    if (user.sword > 0) return conn.reply(m.chat, 'Lu udah punya sword! Gak bisa beli lagi.', m)
                    if (user.money >= Bsword) {
                        user.money -= Bsword
                        user.sword = 1
                        user.sworddurability = 100
                        conn.reply(m.chat, `Sukses beli Sword seharga ${Bsword} money\nDurability: 100`, m)
                    } else conn.reply(m.chat, `Duit lu gak cukup buat beli Sword seharga ${Bsword} money`, m)
                    break
                case 'armor':
                    if (user.armor > 0) return conn.reply(m.chat, 'Lu udah punya armor! Gak bisa beli lagi.', m)
                    if (user.money >= Barmor) {
                        user.money -= Barmor
                        user.armor = 1
                        user.armordurability = 100
                        conn.reply(m.chat, `Sukses beli Armor seharga ${Barmor} money\nDurability: 100`, m)
                    } else conn.reply(m.chat, `Duit lu gak cukup buat beli Armor seharga ${Barmor} money`, m)
                    break
                case 'pancingan':
                    if (user.fishingrod > 0) return conn.reply(m.chat, 'Lu udah punya pancingan! Gak bisa beli lagi.', m)
                    if (user.money >= Bpancingan) {
                        user.money -= Bpancingan
                        user.fishingrod = 1
                        user.fishingroddurability = 60
                        conn.reply(m.chat, `Sukses beli Pancingan seharga ${Bpancingan} money\nDurability: 60`, m)
                    } else conn.reply(m.chat, `Duit lu gak cukup buat beli Pancingan seharga ${Bpancingan} money`, m)
                    break
                case 'potion':
                    if (user.money >= potion * count) {
                        user.money -= potion * count
                        user.potion += count * 1
                        conn.reply(m.chat, `Sukses beli ${count} Potion seharga ${potion * count} money\n\nPake potion: *${usedPrefix}use potion <jumlah>*`, m)
                    } else conn.reply(m.chat, `Duit lu gak cukup buat beli ${count} Potion seharga ${potion * count} money`, m)
                    break
                case 'sampah':
                    if (user.money >= Bsampah * count) {
                        user.sampah += count * 1
                        user.money -= Bsampah * count
                        conn.reply(m.chat, `Sukses beli ${count} Sampah seharga ${Bsampah * count} money`, m)
                    } else conn.reply(m.chat, `Duit lu gak cukup`, m)
                    break
                default:
                    return conn.reply(m.chat, Kchat, m)
            }
        } else if (/sell|jual/i.test(command)) {
            const count = args[1] && args[1].length > 0 ? Math.min(999999999999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count)
            switch (type) {
                case 'pickaxe':
                    if (user.pickaxe >= 1) {
                        user.pickaxe = 0
                        user.pickaxedurability = 0
                        user.money += Spickaxe
                        conn.reply(m.chat, `Sukses jual Pickaxe, lu dapet ${Spickaxe} money`, m)
                    } else conn.reply(m.chat, `Pickaxe lu gak ada`, m)
                    break
                case 'sword':
                    if (user.sword >= 1) {
                        user.sword = 0
                        user.sworddurability = 0
                        user.money += Ssword
                        conn.reply(m.chat, `Sukses jual Sword, lu dapet ${Ssword} money`, m)
                    } else conn.reply(m.chat, `Sword lu gak ada`, m)
                    break
                case 'armor':
                    if (user.armor >= 1) {
                        user.armor = 0
                        user.armordurability = 0
                        user.money += Sarmor
                        conn.reply(m.chat, `Sukses jual Armor, lu dapet ${Sarmor} money`, m)
                    } else conn.reply(m.chat, `Armor lu gak ada`, m)
                    break
                case 'pancingan':
                    if (user.fishingrod >= 1) {
                        user.fishingrod = 0
                        user.fishingroddurability = 0
                        user.money += Spancingan
                        conn.reply(m.chat, `Sukses jual Pancingan, lu dapet ${Spancingan} money`, m)
                    } else conn.reply(m.chat, `Pancingan lu gak ada`, m)
                    break
                case 'potion':
                    if (user.potion >= count * 1) {
                        user.money += Spotion * count
                        user.potion -= count * 1
                        conn.reply(m.chat, `Sukses jual ${count} Potion seharga ${Spotion * count} money`, m)
                    } else conn.reply(m.chat, `Potion lu gak cukup`, m)
                    break
                case 'sampah':
                    if (user.sampah >= count * 1) {
                        user.sampah -= count * 1
                        user.money += Ssampah * count
                        conn.reply(m.chat, `Sukses jual ${count} Sampah, lu dapet ${Ssampah * count} money`, m)
                    } else conn.reply(m.chat, `Sampah lu gak cukup`, m)
                    break
                default:
                    return conn.reply(m.chat, Kchat, m)
            }
        }
    } catch (e) {
        conn.reply(m.chat, Kchat, m)
        console.log(e)
    }
}

handler.help = ['shop <sell|buy> <args>']
handler.tags = ['rpg']
handler.command = /^(shop|toko|buy|beli|sell|jual)$/i
handler.limit = true
handler.group = true

module.exports = handler