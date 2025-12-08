function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

let handler = async (m, { conn, text }) => {
  try {
    let user = global.db.data.users[m.sender];

    if (new Date() - user.lastpractice < 3600000) {
      conn.reply(m.chat, '⏰ Lu baru bisa latihan lagi 1 jam kemudian.', m);
      return;
    }

    user.lastpractice = new Date();

    let healthIncrease = Math.floor(Math.random() * 30) + 10;

    user.health += healthIncrease;

    let message = `🏋️ Lu lagi latihan dan dapet peningkatan kesehatan:\n\n`;
    message += `❤️ health lu sekarang: ${user.health}\n`;
    message += `⚔️ Serangan yang dihasilkan: ${userAttack}\n`;
    message += `🔄 Lu bisa latihan lagi dalam 1 jam.\n`;

    conn.reply(m.chat, message, m);
  } catch (e) {
    console.log(e);
    conn.reply(m.chat, 'Error', m);
  }
}

handler.help = ['berlatih'];
handler.tags = ['rpg'];
handler.command = /^berlatih$/i;
handler.limit = true;
handler.group = true;
handler.fail = null;

module.exports = handler;