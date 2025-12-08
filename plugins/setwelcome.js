let handler = async (m, { bot, ctx, args, chatId, userId, isOwner }) => {
  const quotedText = m.quoted?.text || m.quoted?.caption || '';
  const argsText = args.join(' ');
  const text = quotedText || argsText;
  const isGroup = m.isGroup;
  const isAdmin = m.isAdmin || isOwner;

  if (!isGroup) {
    return ctx.reply('Perintah ini hanya dapat digunakan di grup!');
  }

  if (!isAdmin) {
    return ctx.reply('Perintah ini hanya untuk Admin!');
  }

  if (!text) {
    return ctx.reply('📝 Cara penggunaan:\n\n1️⃣ Kirim pesan dengan format welcome yang diinginkan (bisa multi-line)\n2️⃣ Reply pesan tersebut dengan /setwelcome\n\nAtau ketik langsung:\n/setwelcome Teks welcome\n\n🔖 Variable:\n@user - mention user\n@subject - nama grup\n@desc - deskripsi grup');
  }

  global.db.data.chats[chatId].sWelcome = text;
  
  const preview = text.length > 150 ? text.substring(0, 150) + '...' : text;
  await ctx.reply(`✅ Welcome berhasil diatur!\n\n🔖 Variable yang tersedia:\n@user - mention user\n@subject - nama grup\n@desc - deskripsi grup\n\n📄 Preview:\n${preview}`);
};

handler.command = ['setwelcome'];
handler.tags = ['group'];
handler.help = ['setwelcome <teks>'];

module.exports = handler;