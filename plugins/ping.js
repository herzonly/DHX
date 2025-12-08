const { totalmem, freemem } = require('os')
const os = require('os')
const { performance } = require('perf_hooks')
const { sizeFormatter } = require('human-readable')

const format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { bot }) => {
  const start = performance.now()
  
  const sent = await m.reply('_Testing speed..._')
  
  const ping = performance.now() - start
  
  const used = process.memoryUsage()
  const cpus = os.cpus().map(cpu => {
    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
    return cpu
  })
  
  const cpu = cpus.reduce(
    (last, cpu, _, { length }) => {
      last.total += cpu.total
      last.speed += cpu.speed / length
      last.times.user += cpu.times.user
      last.times.nice += cpu.times.nice
      last.times.sys += cpu.times.sys
      last.times.idle += cpu.times.idle
      last.times.irq += cpu.times.irq
      return last
    },
    {
      speed: 0,
      total: 0,
      times: {
        user: 0,
        nice: 0,
        sys: 0,
        idle: 0,
        irq: 0,
      },
    }
  )
  
  const uptimeMs = process.uptime() * 1000
  const muptime = clockString(uptimeMs)
  
  const d = new Date()
  const locale = 'id'
  const times = d.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
  
  let txt = `*ᴘ ɪ ɴ ɢ*\n`
  txt += `${ping.toFixed(2)} ms\n\n`
  
  txt += `*ʀ ᴜ ɴ ᴛ ɪ ᴍ ᴇ*\n`
  txt += `${muptime}\n\n`
  
  txt += `*s ᴇ ʀ ᴠ ᴇ ʀ*\n`
  txt += `🛑 ʀᴀᴍ: ${format(totalmem() - freemem())} / ${format(totalmem())}\n`
  txt += `🔵 ғʀᴇᴇRAM: ${format(freemem())}\n`
  txt += `🔴 ᴍᴇᴍᴏʀy: ${(used.heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(totalmem() / 1024 / 1024)}MB\n`
  txt += `🔭 ᴘʟᴀᴛғᴏʀᴍ: ${os.platform()}\n`
  txt += `🧿 sᴇʀᴠᴇʀ: ${os.hostname()}\n`
  txt += `⏰ ᴛɪᴍᴇ sᴇʀᴠᴇʀ: ${times}\n\n`
  
  txt += `_NodeJS Memory Usage_\n\`\`\`\n`
  txt += Object.keys(used)
    .map(key => `${key.padEnd(15)}: ${format(used[key])}`)
    .join('\n')
  txt += `\n\`\`\`\n\n`
  
  if (cpus[0]) {
    txt += `_Total CPU Usage_\n`
    txt += `${cpus[0].model.trim()} (${cpu.speed.toFixed(0)} MHZ)\n`
    txt += Object.keys(cpu.times)
      .map(type => `- *${type}*: ${((100 * cpu.times[type]) / cpu.total).toFixed(2)}%`)
      .join('\n')
    txt += `\n\n`
    
    txt += `_CPU Core(s) Usage (${cpus.length} Core CPU)_\n`
    txt += cpus.map((cpu, i) => {
      let core = `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n`
      core += Object.keys(cpu.times)
        .map(type => `- *${type}*: ${((100 * cpu.times[type]) / cpu.total).toFixed(2)}%`)
        .join('\n')
      return core
    }).join('\n\n')
  }
  
  await bot.editMessageText(txt, {
    chat_id: m.chat,
    message_id: sent.message_id,
    parse_mode: 'Markdown'
  })
}

handler.help = ['ping', 'speed']
handler.tags = ['info']
handler.command = /^(ping|speed|pong)$/i

module.exports = handler

function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [d, 'D ', h, 'H ', m, 'M ', s, 'S '].map(v => v.toString().padStart(2, 0)).join('')
}