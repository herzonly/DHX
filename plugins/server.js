const os = require('os')
const axios = require('axios')

let handler = async (m, { bot }) => {
  try {
    let response = await axios.get('https://freeipapi.com/api/json')
    let json = response.data
    
    let caption = `乂  *S E R V E R*\n\n`
    caption += `┌  ◦  OS: ${os.type()} (${os.arch()} / ${os.release()})\n`
    caption += `│  ◦  RAM: ${formatSize(os.totalmem() - os.freemem())} / ${formatSize(os.totalmem())}\n`
    
    if (json.timeZones && json.timeZones.length > 0) {
      caption += `│  ◦  Timezone: ${json.timeZones[0]}\n`
    }
    
    if (json.currencies && json.currencies.length > 0) {
      caption += `│  ◦  Currency: ${json.currencies[0]}\n`
    }
    
    if (json.countryName) caption += `│  ◦  Country: ${json.countryName}\n`
    if (json.cityName) caption += `│  ◦  City: ${json.cityName}\n`
    if (json.regionName) caption += `│  ◦  Region: ${json.regionName}\n`
    if (json.ipAddress) caption += `│  ◦  IP Address: ${json.ipAddress}\n`
    if (json.continent) caption += `│  ◦  Continent: ${json.continent}\n`
    
    caption += `│  ◦  Uptime: ${toTime(os.uptime() * 1000)}\n`
    caption += `└  ◦  Processor: ${os.cpus()[0].model}\n\n`
    caption += `🕐 *Server Time:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`
    
    await bot.sendPhoto(m.chat, 'https://telegra.ph/file/cf4f28ed3b9ebdfb30adc.png', {
      caption: caption,
      reply_to_message_id: m.message_id
    })
    
  } catch (error) {
    console.log(error)
    await m.reply(`❌ Terjadi kesalahan: ${error.message}`)
  }
}

handler.command = handler.help = ['server']
handler.tags = ['info']
handler.owner = true

module.exports = handler

function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
  return (Math.round(bytes / Math.pow(1024, i) * 100) / 100) + ' ' + sizes[i]
}

function toTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  return `${days} hari, ${hours % 24} jam, ${minutes % 60} menit, ${seconds % 60} detik`
}