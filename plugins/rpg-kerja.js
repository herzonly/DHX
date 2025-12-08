let handler = async (m, {conn = bot, command, args, usedPrefix}) => {
let type = (args[0] || '').toLowerCase()
let users = global.db.data.users[m.sender]

let penumpan = ['mas mas','bapak bapak','cewe sma','bocil epep','emak emak']
let penumpang = penumpan[Math.floor(Math.random() * penumpan.length)]
let daganga = ['wortel','sawi','selada','tomat','seledri','cabai','daging','ikan','ayam']
let dagangan = daganga[Math.floor(Math.random() * daganga.length)]
let pasie = ['sakit kepala','cedera','luka bakar','patah tulang']
let pasien = pasie[Math.floor(Math.random() * pasie.length)]
let pane = ['Wortel','Kubis','stowbery','teh','padi','jeruk','pisang','semangka','durian','rambutan']
let panen = pane[Math.floor(Math.random() * pane.length)]
let bengke = ['mobil','motor','becak','bajai','bus','angkot','becak','sepeda']
let bengkel = bengke[Math.floor(Math.random() * bengke.length)]
let ruma = ['Membangun Rumah','Membangun Gedung','Memperbaiki Rumah','Memperbaiki Gedung','Membangun Fasilitas Umum','Memperbaiki Fasilitas Umum']
let rumah = ruma[Math.floor(Math.random() * ruma.length)]

let pppecat = ['Ruko Kebakaran','LO NGOCOK DIDEPAN UMUM','Males Malesan','Ngew istrinya yg punya ruko']
let alasanpecat = pppecat[Math.floor(Math.random() * pppecat.length)]
let ddppecat = ['Bakar Pasien','Jual Organ Dalem ke Lapak ilegal','serinv telat']
let alasanpasien = ddppecat[Math.floor(Math.random() * ddppecat.length)]

let uangm = Math.floor(Math.random() * 50000) + 100000
let duit = Math.floor(Math.random() * 80000) + 120000
let duitm = Math.floor(Math.random() * 200000) + 300000
let duitd = Math.floor(Math.random() * 60000) + 90000
let duitr = Math.floor(Math.random() * 70000) + 130000
let duitk = Math.floor(Math.random() * 80000) + 150000

let _pecat= `${pickRandom(['1', '1', '1', '1'])}`
let pecat = (_pecat * 1)
let ppecat = `KAMU KENA PECAT KARNA KAMU ${alasanpecat}`
let _dpecat = `${pickRandom(['1', '0', '0', '1'])}`
let dpecat = (_dpecat * 1)
let dppecat = `KAMU DI PECAT KARNA ${alasanpasien}`

let kerjaanya = `*List Kerjaan*

• *Ojek* (Rp 100k-150k/hari)
• *Pedagang* (Rp 120k-200k/hari)
• *Dokter* (Rp 300k-500k/hari)
• *Petani* (Rp 90k-150k/hari)
• *Montir* (Rp 130k-200k/hari)
• *Kuli* (Rp 150k-230k/hari)

*Contoh:* ${usedPrefix}kerja ojek

*Note:*
Gunakan *${usedPrefix}selectjob* untuk memilih pekerjaan terlebih dahulu!
`

if (/kerjadulu|kerja|work/i.test(command)) {
switch(type) {
	case 'ojek':
	if (global.db.data.users[m.sender].ojek == false) return m.reply(`❗ Ini Bukan Tugas Kamu Atau Kamu Pengangguran!\n\nGunakan *${usedPrefix}selectjob* untuk memilih pekerjaan terlebih dahulu!`)
	let cooldownOjek = 1800000
	let timeOjek = global.db.data.users[m.sender].lastkerja + cooldownOjek
	if (new Date - global.db.data.users[m.sender].lastkerja < cooldownOjek) return m.reply(`Kamu Sudah Bekerja\nSaatnya Istirahat Selama ${clockString(timeOjek - new Date())}`)

	case 'pedagang':
	if (global.db.data.users[m.sender].pedagang == false) return m.reply(`❗ Ini Bukan Tugas Kamu Atau Kamu Pengangguran!\n\nGunakan *${usedPrefix}selectjob* untuk memilih pekerjaan terlebih dahulu!`)
	let cooldownPedagang = 1200000
	let timePedagang = global.db.data.users[m.sender].lastkerja + cooldownPedagang
	if (new Date - global.db.data.users[m.sender].lastkerja < cooldownPedagang) return m.reply(`Kamu Sudah Bekerja,Saatnya Istirahat Selama\n${clockString(timePedagang - new Date())}`)
	global.db.data.users[m.sender].money += duit
	global.db.data.users[m.sender].lastkerja = new Date * 1
	m.reply(`Ada Pembeli Yang Membeli *${dagangan}*\nDan Mendapatkan Uang Senilai *Rp ${duit.toLocaleString('id-ID')}*`)
	if (pecat > 1) {
		global.db.data.users[m.sender].pedagang -= pecat * 1
		m.reply(ppecat)
	}
	break

	case 'dokter':
	if (global.db.data.users[m.sender].dokter == false) return m.reply(`❗ Ini Bukan Tugas Kamu Atau Kamu Pengangguran!\n\nGunakan *${usedPrefix}selectjob* untuk memilih pekerjaan terlebih dahulu!`)
	let cooldownDokter = 3600000
	let timeDokter = global.db.data.users[m.sender].lastkerja + cooldownDokter
	if (new Date - global.db.data.users[m.sender].lastkerja < cooldownDokter) return m.reply(`Kamu Sudah Bekerja,Saatnya Istirahat Selama\n${clockString(timeDokter - new Date())}`)
	global.db.data.users[m.sender].money += duitm
	global.db.data.users[m.sender].lastkerja = new Date * 1
	m.reply(`Kamu Menyembuhkan Pasien *${pasien}*\nDan Mendapatkan Uang Senilai *Rp ${duitm.toLocaleString('id-ID')}*`)
	break

	case 'petani':
	if (global.db.data.users[m.sender].petani == false) return m.reply(`❗ Ini Bukan Tugas Kamu Atau Kamu Pengangguran!\n\nGunakan *${usedPrefix}selectjob* untuk memilih pekerjaan terlebih dahulu!`)
	let cooldownPetani = 2700000
	let timePetani = global.db.data.users[m.sender].lastkerja + cooldownPetani
	if (new Date - global.db.data.users[m.sender].lastkerja < cooldownPetani) return m.reply(`Kamu Sudah Bekerja,Saatnya Istirahat Selama\n${clockString(timePetani - new Date())}`)
	global.db.data.users[m.sender].money += duitd
	global.db.data.users[m.sender].lastkerja = new Date * 1
	m.reply(`${panen} Sudah Panen Dan Menjualnya\nHasil Menjual Mendapatkan Uang Senilai *Rp ${duitd.toLocaleString('id-ID')}*`)
	break

	case 'montir':
	if (global.db.data.users[m.sender].montir == false) return m.reply(`❗ Ini Bukan Tugas Kamu Atau Kamu Pengangguran!\n\nGunakan *${usedPrefix}selectjob* untuk memilih pekerjaan terlebih dahulu!`)
	let cooldownMontir = 2400000
	let timeMontir = global.db.data.users[m.sender].lastkerja + cooldownMontir
	if (new Date - global.db.data.users[m.sender].lastkerja < cooldownMontir) return m.reply(`Kamu Sudah Bekerja,Saatnya Istirahat Selama\n${clockString(timeMontir - new Date())}`)
	global.db.data.users[m.sender].money += duitr
	global.db.data.users[m.sender].lastkerja = new Date * 1
	m.reply(`Kamu Baru Saja Mendapatkan Pelanggan Dan Memperbaiki *${bengkel}*\nHasil Memperbaiki Mendapatkan Uang Senilai *Rp ${duitr.toLocaleString('id-ID')}*`)
	break

	case 'kuli':
	if (global.db.data.users[m.sender].kuli == false) return m.reply(`❗ Ini Bukan Tugas Kamu Atau Kamu Pengangguran!\n\nGunakan *${usedPrefix}selectjob* untuk memilih pekerjaan terlebih dahulu!`)
	let cooldownKuli = 3000000
	let timeKuli = global.db.data.users[m.sender].lastkerja + cooldownKuli
	if (new Date - global.db.data.users[m.sender].lastkerja < cooldownKuli) return m.reply(`Kamu Sudah Bekerja,Saatnya Istirahat Selama\n${clockString(timeKuli - new Date())}`)
	global.db.data.users[m.sender].money += duitk
	global.db.data.users[m.sender].lastkerja = new Date * 1
	m.reply(`Kamu Baru Saja Selesai ${rumah}\nDan Mendapatkan Uang Senilai *Rp ${duitk.toLocaleString('id-ID')}*`)
	break

	default:
	return conn.reply(m.chat, kerjaanya, m)
	}
	}
}

handler.help = ['kerja','work']
handler.tags = ['rpg']
handler.command = /^kerja|work$/i 

module.exports = handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return ['\n' + d, ' *Hari*\n ', h, ' *Jam*\n ', m, ' *Menit*\n ', s, ' *Detik* '].map(v => v.toString().padStart(2, 0)).join('')
}