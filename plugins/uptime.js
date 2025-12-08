const os = require('os')

let handler = async (m, { bot }) => {
  try {
    const uptimeSeconds = process.uptime()
    const osUptimeSeconds = os.uptime()
    
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400)
      const hours = Math.floor((seconds % 86400) / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)
      
      let result = []
      if (days > 0) result.push(`${days} hari`)
      if (hours > 0) result.push(`${hours} jam`)
      if (minutes > 0) result.push(`${minutes} menit`)
      if (secs > 0 || result.length === 0) result.push(`${secs} detik`)
      
      return result.join(', ')
    }
    
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    
    const formatBytes = (bytes) => {
      const gb = (bytes / 1024 / 1024 / 1024).toFixed(2)
      return `${gb} GB`
    }
    
    const memUsage = process.memoryUsage()
    
    const cpus = os.cpus()
    const cpuModel = cpus[0].model
    const cpuCount = cpus.length
    
    let message = `🤖 *STATUS BOT*\n\n`
    message += `⏱️ *Bot Uptime:*\n${formatUptime(uptimeSeconds)}\n\n`
    message += `🖥️ *Server Uptime:*\n${formatUptime(osUptimeSeconds)}\n\n`
    message += `💾 *Memory Usage:*\n`
    message += `├ Total: ${formatBytes(totalMem)}\n`
    message += `├ Used: ${formatBytes(usedMem)} (${((usedMem / totalMem) * 100).toFixed(1)}%)\n`
    message += `└ Free: ${formatBytes(freeMem)}\n\n`
    message += `🔧 *Process Memory:*\n`
    message += `├ RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB\n`
    message += `├ Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\n`
    message += `└ Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB\n\n`
    message += `⚙️ *CPU Info:*\n`
    message += `├ Model: ${cpuModel}\n`
    message += `└ Cores: ${cpuCount}\n\n`
    message += `📱 *Platform:* ${os.platform()}\n`
    message += `🏗️ *Architecture:* ${os.arch()}\n`
    message += `📍 *Hostname:* ${os.hostname()}\n\n`
    message += `🕐 *Server Time:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`
    
    await m.reply(message)
    
  } catch (e) {
    console.error(e)
    return m.reply(`❌ Terjadi kesalahan: ${e.message}`)
  }
}

handler.help = ['uptime', 'runtime', 'status']
handler.tags = ['info']
handler.command = /^(uptime|runtime|status)$/i

module.exports = handler