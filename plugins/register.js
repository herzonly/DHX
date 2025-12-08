let handler = async (m, { ctx, args, user, userId }) => {
  if (user.registered) {
    return ctx.reply('✅ Kamu sudah terdaftar!\n\nData kamu:\n👤 Nama: ' + user.name + '\n🎂 Umur: ' + user.age + ' tahun\n📅 Terdaftar: ' + new Date(user.regTime).toLocaleDateString('id-ID'));
  }

  if (!args[0]) {
    return ctx.reply('📝 Format salah!\n\nContoh:\n/register Herza.18\n\nGunakan titik (.) untuk memisahkan nama dan umur.');
  }

  const text = args.join(' ');
  const split = text.split('.');

  if (split.length < 2) {
    return ctx.reply('📝 Format salah!\n\nContoh:\n/register Herza.18\n\nGunakan titik (.) untuk memisahkan nama dan umur.');
  }

  const name = split[0].trim();
  const age = parseInt(split[1].trim());

  if (!name || name.length < 2) {
    return ctx.reply('❌ Nama terlalu pendek!\nNama minimal 2 karakter.');
  }

  if (name.length > 30) {
    return ctx.reply('❌ Nama terlalu panjang!\nNama maksimal 30 karakter.');
  }

  if (!age || isNaN(age)) {
    return ctx.reply('❌ Umur harus berupa angka!\n\nContoh: /register Herza.18');
  }

  if (age < 5 || age > 100) {
    return ctx.reply('❌ Umur tidak valid!\nUmur harus antara 5-100 tahun.');
  }

  user.name = name;
  user.age = age;
  user.registered = true;
  user.regTime = Date.now();

  user.money += 1000;
  user.limit += 5;
  user.exp += 50;

  await ctx.reply('Register Successfully');
};

handler.command = ['register', 'daftar', 'reg'];
handler.tags = ['main'];
handler.help = ['register <nama.umur>'];

module.exports = handler;