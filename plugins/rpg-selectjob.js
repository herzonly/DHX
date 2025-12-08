let handler = async (m, {conn = bot, command, args, usedPrefix}) => {
let type = (args[0] || '').toLowerCase()
let user = global.db.data.users[m.sender]

let jobList = `*Pilih Pekerjaan Kamu*

╭━━━━「 *LIST PEKERJAAN* 」
┃
┃ • *Ojek*
┃ • *Pedagang*
┃ • *Dokter*
┃ • *Petani*
┃ • *Montir*
┃ • *Kuli*
┃
╰━━━━━━━━━━━━━━

*Cara Pilih:*
\`${usedPrefix}selectjob <nama pekerjaan>\`

*Contoh:*
\`${usedPrefix}selectjob ojek\`

*Note:*
• Setiap pekerjaan punya penghasilan berbeda
• Kamu hanya bisa pilih 1 pekerjaan
• Untuk ganti pekerjaan gunakan ${usedPrefix}resign
`

if (!type) return m.reply(jobList)

let jobStatus = {
    ojek: user.ojek,
    pedagang: user.pedagang,
    dokter: user.dokter,
    petani: user.petani,
    montir: user.montir,
    kuli: user.kuli
}

let hasJob = Object.values(jobStatus).some(job => job === true)

if (hasJob) {
    let currentJob = Object.keys(jobStatus).find(job => jobStatus[job] === true)
    return m.reply(`❌ Kamu sudah bekerja sebagai *${currentJob}*!\n\nGunakan *${usedPrefix}resign* untuk mengundurkan diri terlebih dahulu.`)
}

switch(type) {
    case 'ojek':
        user.ojek = true
        m.reply(`✅ *SELAMAT!*

Kamu sekarang bekerja sebagai *Ojek*

*Penghasilan:* $4.000 - $4.010 per kerja
*Cooldown:* 5 menit

Gunakan *${usedPrefix}kerja ojek* untuk mulai bekerja!`)
        break
        
    case 'pedagang':
        user.pedagang = true
        m.reply(`✅ *SELAMAT!*

Kamu sekarang bekerja sebagai *Pedagang*

*Penghasilan:* $2.500 - $2.520 per kerja
*Cooldown:* 5 menit
*Resiko:* Ada kemungkinan dipecat

Gunakan *${usedPrefix}kerja pedagang* untuk mulai bekerja!`)
        break
        
    case 'dokter':
        user.dokter = true
        m.reply(`✅ *SELAMAT!*

Kamu sekarang bekerja sebagai *Dokter*

*Penghasilan:* $9.500 - $9.550 per kerja
*Cooldown:* 5 menit

Gunakan *${usedPrefix}kerja dokter* untuk mulai bekerja!`)
        break
        
    case 'petani':
        user.petani = true
        m.reply(`✅ *SELAMAT!*

Kamu sekarang bekerja sebagai *Petani*

*Penghasilan:* $5.200 - $5.262 per kerja
*Cooldown:* 5 menit

Gunakan *${usedPrefix}kerja petani* untuk mulai bekerja!`)
        break
        
    case 'montir':
        user.montir = true
        m.reply(`✅ *SELAMAT!*

Kamu sekarang bekerja sebagai *Montir*

*Penghasilan:* $4.200 - $4.220 per kerja
*Cooldown:* 5 menit

Gunakan *${usedPrefix}kerja montir* untuk mulai bekerja!`)
        break
        
    case 'kuli':
        user.kuli = true
        m.reply(`✅ *SELAMAT!*

Kamu sekarang bekerja sebagai *Kuli*

*Penghasilan:* $7.800 - $7.870 per kerja
*Cooldown:* 5 menit

Gunakan *${usedPrefix}kerja kuli* untuk mulai bekerja!`)
        break
        
    default:
        m.reply(jobList)
}
}

handler.help = ['selectjob']
handler.tags = ['rpg']
handler.command = /^(selectjob|pilihjob|pilihkerja)$/i

module.exports = handler