async function handler(m, { command, usedPrefix, args, bot, ctx }) {
let conn = bot
  let user = global.db.data.users[m.from.id];
  let type = (args[0] || '').toLowerCase();
  
  const list = `「 <b> E A T I N G  S Y S T E M <b> 」
╭──『 FOOD MENU 』
│⬡ Cara pakai:
│   ${usedPrefix}${command} <nama makanan> [jumlah]
│
│⬡ Contoh:
│   ${usedPrefix}${command} rendang 2
│   ${usedPrefix}${command} ayamgoreng
│
├──『 MAKANAN (+20 Stamina) 』
│⬡ 🍖 ayambakar
│⬡ 🍗 ayamgoreng
│⬡ 🥘 rendang
│⬡ 🥩 steak
│⬡ 🥠 babipanggang
│⬡ 🍲 gulaiayam
│⬡ 🍜 oporayam
│⬡ 🍣 sushi
│⬡ 🍞 roti
│⬡ 🍖 ikanbakar
│⬡ 🍖 lelebakar
│⬡ 🍖 nilabakar
│⬡ 🍖 bawalbakar
│⬡ 🍖 udangbakar
│⬡ 🍖 pausbakar
│⬡ 🍖 kepitingbakar
│
├──『 MINUMAN 』
│⬡ 🍷 vodka (+25 Stamina)
│⬡ 🍺 soda (+20 Stamina)
│
├──『 MEDIS 』
│⬡ 💉 bandage (+25 Health)
│⬡ ☘️ ganja (+90 Health)
│
╰───────────────

💡 *Tips:* Gunakan spasi untuk memisahkan nama dan jumlah!`;

  if (!type) {
    return await conn.sendMessage(m.chat, { text: list }, { quoted: m });
  }

  const count = args[1] && args[1].length > 0 ? Math.min(99999999, Math.max(parseInt(args[1]), 1)) : 1;

  switch (type) {
    case 'ayamgoreng':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.ayamgoreng < count) return await conn.sendMessage(m.chat, { text: '❌ Ayam goreng kamu kurang!' }, { quoted: m });
      user.ayamgoreng -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍗\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'ayambakar':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.ayambakar < count) return await conn.sendMessage(m.chat, { text: '❌ Ayam bakar kamu kurang!' }, { quoted: m });
      user.ayambakar -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍖\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'oporayam':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.oporayam < count) return await conn.sendMessage(m.chat, { text: '❌ Opor ayam kamu kurang!' }, { quoted: m });
      user.oporayam -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍜\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'rendang':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.rendang < count) return await conn.sendMessage(m.chat, { text: '❌ Rendang kamu kurang!' }, { quoted: m });
      user.rendang -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🥘\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'steak':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.steak < count) return await conn.sendMessage(m.chat, { text: '❌ Steak kamu kurang!' }, { quoted: m });
      user.steak -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🥩\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'gulaiayam':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.gulaiayam < count) return await conn.sendMessage(m.chat, { text: '❌ Gulai ayam kamu kurang!' }, { quoted: m });
      user.gulaiayam -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍲\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'babipanggang':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.babipanggang < count) return await conn.sendMessage(m.chat, { text: '❌ Babi panggang kamu kurang!' }, { quoted: m });
      user.babipanggang -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🥠\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'soda':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.soda < count) return await conn.sendMessage(m.chat, { text: '❌ Soda kamu kurang!' }, { quoted: m });
      user.soda -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Glek glek glek... 🍺\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'vodka':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.vodka < count) return await conn.sendMessage(m.chat, { text: '❌ Vodka kamu kurang!' }, { quoted: m });
      user.vodka -= count;
      user.stamina = Math.min(100, user.stamina + (25 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Glek glek glek... 🍷\n\n+${25 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'ganja':
      if (user.healt >= 100) return await conn.sendMessage(m.chat, { text: '❌ Health kamu sudah penuh!' }, { quoted: m });
      if (user.ganja < count) return await conn.sendMessage(m.chat, { text: '❌ Ganja kamu kurang!' }, { quoted: m });
      user.ganja -= count;
      user.healt = Math.min(100, user.healt + (90 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Ngefly... ☘️\n\n+${90 * count} Health\nHealth sekarang: ${user.healt}/100` }, { quoted: m });

    case 'bandage':
      if (user.healt >= 100) return await conn.sendMessage(m.chat, { text: '❌ Health kamu sudah penuh!' }, { quoted: m });
      if (user.bandage < count) return await conn.sendMessage(m.chat, { text: '❌ Bandage kamu kurang!' }, { quoted: m });
      user.bandage -= count;
      user.healt = Math.min(100, user.healt + (25 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Sretset... 💉\n\n+${25 * count} Health\nHealth sekarang: ${user.healt}/100` }, { quoted: m });

    case 'sushi':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.sushi < count) return await conn.sendMessage(m.chat, { text: '❌ Sushi kamu kurang!' }, { quoted: m });
      user.sushi -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍣\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'roti':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.roti < count) return await conn.sendMessage(m.chat, { text: '❌ Roti kamu kurang!' }, { quoted: m });
      user.roti -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍞\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'ikanbakar':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.ikanbakar < count) return await conn.sendMessage(m.chat, { text: '❌ Ikan bakar kamu kurang!' }, { quoted: m });
      user.ikanbakar -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍖\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'lelebakar':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.lelebakar < count) return await conn.sendMessage(m.chat, { text: '❌ Lele bakar kamu kurang!' }, { quoted: m });
      user.lelebakar -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍖\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'nilabakar':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.nilabakar < count) return await conn.sendMessage(m.chat, { text: '❌ Nila bakar kamu kurang!' }, { quoted: m });
      user.nilabakar -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍖\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'bawalbakar':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.bawalbakar < count) return await conn.sendMessage(m.chat, { text: '❌ Bawal bakar kamu kurang!' }, { quoted: m });
      user.bawalbakar -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍖\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'udangbakar':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.udangbakar < count) return await conn.sendMessage(m.chat, { text: '❌ Udang bakar kamu kurang!' }, { quoted: m });
      user.udangbakar -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍖\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'pausbakar':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.pausbakar < count) return await conn.sendMessage(m.chat, { text: '❌ Paus bakar kamu kurang!' }, { quoted: m });
      user.pausbakar -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍖\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    case 'kepitingbakar':
      if (user.stamina >= 100) return await conn.sendMessage(m.chat, { text: '❌ Stamina kamu sudah penuh!' }, { quoted: m });
      if (user.kepitingbakar < count) return await conn.sendMessage(m.chat, { text: '❌ Kepiting bakar kamu kurang!' }, { quoted: m });
      user.kepitingbakar -= count;
      user.stamina = Math.min(100, user.stamina + (20 * count));
      return await conn.sendMessage(m.chat, { text: `✅ Nyam nyam... 🍖\n\n+${20 * count} Stamina\nStamina sekarang: ${user.stamina}/100` }, { quoted: m });

    default:
      return await conn.sendMessage(m.chat, { text: list }, { quoted: m });
  }
}

handler.help = ['eat', 'makan'];
handler.tags = ['rpg'];
handler.command = /^(eat|makan)$/i;
handler.register = false;
handler.exp = 5;

module.exports = handler;