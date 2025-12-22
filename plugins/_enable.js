let handler = async (m, { bot, ctx, args, command, isOwner, chatId, userId, isAdmin }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command);
  let chat = global.db.data.chats[chatId];
  let user = global.db.data.users[userId];
  let type = (args[0] || '').toLowerCase();

  const isGroup = m.isGroup;

  switch (type) {
    case 'welcome':
      if (!isGroup) {
        return ctx.reply('This command can only be used in groups!');
      }
      if (!isAdmin) {
        return ctx.reply('This command is only for Admin!');
      }
      chat.welcome = isEnable;
      break;

    case 'antichannel':
      if (!isGroup) {
        return ctx.reply('This command can only be used in groups!');
      }
      if (!isAdmin) {
        return ctx.reply('This command is only for Admin!');
      }
      chat.antiChannel = isEnable;
      break;

    case 'autodl':
      if (isGroup) {
        if (!isAdmin) {
          return ctx.reply('This command is only for Admin!');
        }
        chat.autoDL = isEnable;
      } else {
        if (!user.autoDL) {
          user.autoDL = false;
        }
        user.autoDL = isEnable;
      }
      break;

    default:
      if (!/[01]/.test(command)) {
        return m.reply(`
**ENABLE/DISABLE OPTIONS**

${isGroup ? '**Group Features:**' : '**Private Features:**'}
${isGroup ? '- welcome' : ''}
${isGroup ? '- antichannel' : ''}
- autodl

**Usage Example:**
/enable autodl
/disable autodl
/on welcome
/off antichannel
        `.trim());
      }
      throw false;
  }

  await m.reply(`
*Success!*

Feature **${type}** has been **${isEnable ? 'enabled' : 'disabled'}** for this ${isGroup ? 'group' : 'chat'}
  `.trim());
};

handler.command = ['enable', 'disable', 'on', 'off', '1', '0', 'true', 'false'];
handler.tags = ['group'];
handler.help = ['enable <option>', 'disable <option>'];

module.exports = handler;
