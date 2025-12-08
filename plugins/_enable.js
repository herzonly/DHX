let handler = async (m, { bot, ctx, args, command, isOwner, chatId, userId, isAdmin }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command);
  let chat = global.db.data.chats[chatId];
  let type = (args[0] || '').toLowerCase();

  const isGroup = m.isGroup;

  switch (type) {
    case 'welcome':
      if (!isGroup) {
        return ctx.reply('Perintah ini hanya dapat digunakan di grup!');
      }
      if (!isAdmin) {
        return ctx.reply('Perintah ini hanya untuk Admin!');
      }
      chat.welcome = isEnable;
      break;

    case 'antichannel':
      if (!isGroup) {
        return ctx.reply('Perintah ini hanya dapat digunakan di grup!');
      }
      if (!isAdmin) {
        return ctx.reply('Perintah ini hanya untuk Admin!');
      }
      chat.antiChannel = isEnable;
      break;

    default:
      if (!/[01]/.test(command)) {
        return m.reply(`
**ENABLE/DISABLE OPTIONS**

- welcome
- antichannel

**Contoh Penggunaan:**
/enable welcome
/disable welcome
/on antichannel
/off antichannel
        `.trim());
      }
      throw false;
  }

  await m.reply(`
*Berhasil!*

Fitur **${type}** telah di**${isEnable ? 'aktifkan' : 'nonaktifkan'}** untuk chat ini
  `.trim());
};

handler.command = ['enable', 'disable', 'on', 'off', '1', '0', 'true', 'false'];
handler.tags = ['group'];
handler.help = ['enable <option>', 'disable <option>'];
handler.group = true;

module.exports = handler;