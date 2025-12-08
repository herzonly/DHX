let handler = async (m, {conn, command, args, usedPrefix}) => {
let user = global.db.data.users[m.sender]

let jobStatus = {
    ojek: user.ojek,
    pedagang: user.pedagang,
    dokter: user.dokter,
    petani: user.petani,
    montir: user.montir,
    kuli: user.kuli
}

let currentJob = Object.keys(jobStatus).find(job => jobStatus[job] === true)

if (!currentJob) {
    throw `❌ Kamu tidak memiliki pekerjaan!\n\nGunakan *${usedPrefix}selectjob* untuk memilih pekerjaan.`
}

let confirm = args[0]

if (confirm !== 'yes') {
    let confirmMsg = `⚠️ *KONFIRMASI RESIGN*

Kamu saat ini bekerja sebagai: *${currentJob}*

Apakah kamu yakin ingin resign?

Ketik: *${usedPrefix}resign yes* untuk konfirmasi`
    
    return m.reply(confirmMsg)
}

user[currentJob] = false

let resignMsg = `✅ *RESIGN BERHASIL!*

Kamu telah resign dari pekerjaan *${currentJob}*

Sekarang kamu bisa memilih pekerjaan baru dengan:
*${usedPrefix}selectjob*`

m.reply(resignMsg)
}

handler.help = ['resign']
handler.tags = ['rpg']
handler.command = /^(resign|berhenti|keluar)$/i

module.exports = handler