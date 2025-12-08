let handler = async (m, { bot, usedPrefix }) => {
        let user = global.db.data.users[m.sender]
        
        let cap = `*━━━ ❨ Kandang Buruan ❩ ━━┄┈*

Kandang ${m.usertag}

*🐂 = [ ${user.banteng} ] banteng*
*🐅 = [ ${user.harimau} ] harimau*
*🐘 = [ ${user.gajah} ] gajah*
*🐐 = [ ${user.kambing} ] kambing*
*🐼 = [ ${user.panda} ] panda*
*🐊 = [ ${user.buaya} ] buaya*
*🐃 = [ ${user.kerbau} ] kerbau*
*🐮 = [ ${user.sapi} ] sapi*
*🐒 = [ ${user.monyet} ] monyet*
*🐗 = [ ${user.babihutan} ] babihutan*
*🐖 = [ ${user.babi} ] babi*
*🐓 = [ ${user.ayam} ] ayam*

Gunakan *${usedPrefix}sell* untuk dijual atau *${usedPrefix}cook* untuk dijadikan bahan masakan.`

        bot.reply(m.chat, cap, m.id, {
            parse_mode: "Markdown"
            })
}
    
handler.help = ["kandang"]
handler.command = ["kandang"]
handler.tags = ["rpg"]

module.exports = handler 