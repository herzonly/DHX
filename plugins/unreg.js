let handler = async (m, { ctx, args, user, userId }) => {
  if (!user.registered) {
    return ctx.reply('❌ Kamu belum terdaftar!\n\nDaftar dulu dengan: /register nama.umur');
  }

  if (!args[0]) {
    const serialNumber = userId.toString().slice(-4);
    return ctx.reply(`⚠️ Konfirmasi diperlukan!\n\n🆔 Serial Number kamu: ${serialNumber}\n\nKetik: /unreg ${serialNumber}\n\n⚠️ Peringatan: Semua data kamu akan dihapus!`);
  }

  const serialNumber = userId.toString().slice(-4);
  const inputSN = args[0];

  if (inputSN !== serialNumber) {
    return ctx.reply('❌ Serial Number salah!\n\nCek SN kamu dengan: /unreg');
  }

  user.registered = false;
  user.name = 'User';
  user.age = -1;
  user.regTime = -1;

  await ctx.reply('Unregister Successfully');
};

handler.command = ['unreg', 'unregister'];
handler.tags = ['main'];
handler.help = ['unreg <serial number>'];
handler.register = true;

module.exports = handler;