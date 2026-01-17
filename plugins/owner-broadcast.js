let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Masukkan pesan broadcast!\n\nContoh:\n${usedPrefix + command} Halo semua, ini adalah pengumuman penting!`);
  //test push
  await m.reply('Broadcasting to all users...');
  
  try {
    let users = global.db.data.users;
    let userIds = Object.keys(users);
    let validUsers = userIds.filter(id => id.length === 10);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let userId of validUsers) {
      try {
        await conn.sendButton(userId + '@s.whatsapp.net', {
          caption: `📢 *BROADCAST MESSAGE*\n\n${text}\n\n_Sended by ${m.usertag}_`,
          image: "./assets/broadcast.jpeg",
          buttons: [
            { type: "url", name: "RestAPI Channel", value: "https://t.me/dhx_zy" },
            { type: "url", name: "RestAPI Group", value: "https://t.me/dashxapi" },
             { type: "url", name: "RestAPI Website", value: "https://api.dashx.dpdns.org" },
            { type: "url", name: "Bot Group", value: "https://t.me/dhxxzy" }
          ]
        });
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        failCount++;
        console.log(`Gagal mengirim ke ${userId}:`, e);
      }
    }
    
    await m.reply(`✅ *Broadcast Selesai!*\n\n📊 *Statistik:*\n• Total User: ${validUsers.length}\n• Berhasil: ${successCount}\n• Gagal: ${failCount}`);
    
  } catch (e) {
    await m.reply('❌ Terjadi kesalahan saat melakukan broadcast!');
    console.error(e);
  }
};

handler.help = handler.command = ["bc", "broadcast"];
handler.tags = ["owner"];
handler.owner = true;

module.exports = handler;
