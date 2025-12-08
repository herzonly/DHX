let handler = async (m, { conn, bot, ctx, isGroup, chatId, userId }) => {

  conn.fightnaga = conn.fightnaga || {};

  if (typeof conn.fightnaga[userId] != "undefined" && conn.fightnaga[userId] == true) {
    return m.reply(`*Tidak bisa melakukan battle ⚔️ karena Arena yang kamu miliki dipakai untuk fight pet mu yang lain.*`);
  }

  let participants = [];
  let isBotAdmin = false;

  try {
    const chatAdmins = await bot.telegram.getChatAdministrators(chatId);
    const botId = bot.botInfo.id;
    
    isBotAdmin = chatAdmins.some(admin => admin.user.id === botId);
  } catch (error) {
    isBotAdmin = false;
  }

  if (isBotAdmin) {
    participants = Object.keys(global.db.data.users)
      .filter(uid => {
        const user = global.db.data.users[uid];
        return user && user.centaur && user.centaur > 0 && uid !== userId.toString();
      });
  } else {
    const chat = global.db.data.chats[chatId];
    
    if (!chat || !chat.participants || chat.participants.length < 2) {
      return m.reply('❌ Minimal harus ada 2 member aktif dengan Centaur di grup untuk battle!\n\n💡 Tip: Jadikan bot sebagai admin untuk battle dengan semua member grup.');
    }

    participants = chat.participants.filter(uid => 
      uid !== userId.toString() &&
      global.db.data.users[uid] && 
      global.db.data.users[uid].centaur && 
      global.db.data.users[uid].centaur > 0
    );
  }

  if (participants.length < 1) {
    return m.reply('❌ Tidak ada member lain dengan Centaur di grup untuk battle!');
  }

  let lawan = participants[Math.floor(Math.random() * participants.length)];

  if (!global.db.data.users[lawan] || !global.db.data.users[lawan].centaur) {
    return m.reply('❌ Lawan yang terpilih tidak memiliki Centaur!');
  }

  let lamaPertarungan = 5;

  const userName = m.pushName || m.name || 'User';
  const lawanName = global.db.data.users[lawan].name || `User ${lawan}`;

  m.reply(`*Pet Kamu* (🐴centaur ${global.db.data.users[userId].centaur}) ⚔️ menantang 🐴centaurnya *${lawanName}* (🐴centaur ${global.db.data.users[lawan].centaur}) sedang berkelahi.\n\nTunggu ${lamaPertarungan} menit lagi dan lihat siapa yang menang 🎮.`);

  conn.fightnaga[userId] = true;

  setTimeout(() => {
    let alasanKalah = ['Naikin lagi levelnya😐', 'Cupu', 'Kurang hebat', 'Ampas Petnya', 'Pet gembel'];
    let alasanMenang = ['Hebat', 'Pro', 'Ganas Pet', 'Legenda Pet', 'Sangat Pro', 'Rajin Ngasi Makan Pet'];

    let kesempatan = [];
    for (i = 0; i < global.db.data.users[userId].centaur; i++) kesempatan.push(userId);
    for (i = 0; i < global.db.data.users[lawan].centaur; i++) kesempatan.push(lawan);

    let pointPemain = 0;
    let pointLawan = 0;
    for (i = 0; i < 10; i++) {
      unggul = acak(0, kesempatan.length - 1);
      if (kesempatan[unggul] == userId) pointPemain += 1;
      else pointLawan += 1;
    }

    if (pointPemain > pointLawan) {
      let hadiah = (pointPemain - pointLawan) * 20000;
      global.db.data.users[userId].money += hadiah;
      global.db.data.users[userId].tiketcoin += 1;
      m.reply(`*${userName}* [${pointPemain * 10}] - [${pointLawan * 10}] *${lawanName}*\n\n*Pet🐴Kamu* (centaur ${global.db.data.users[userId].centaur}) MENANG melawan 🐴centaurnya *${lawanName}* (centaur ${global.db.data.users[lawan].centaur}) karena centaur🐴kamu ${alasanMenang[acak(0, alasanMenang.length - 1)]}\n\nHadiah Rp. ${hadiah.toLocaleString()}\n+1 Tiketcoin`);
    } else if (pointPemain < pointLawan) {
      let denda = (pointLawan - pointPemain) * 100000;
      
      if (global.db.data.users[userId].money < denda) {
        denda = global.db.data.users[userId].money;
      }
      
      if (denda > 0) {
        global.db.data.users[userId].money -= denda;
      }
      
      global.db.data.users[userId].tiketcoin += 1;
      
      if (denda === 0) {
        m.reply(`*${userName}* [${pointPemain * 10}] - [${pointLawan * 10}] *${lawanName}*\n\n*Pet🐴Kamu* (centaur ${global.db.data.users[userId].centaur}) KALAH melawan 🐴centaurnya *${lawanName}* (centaur ${global.db.data.users[lawan].centaur}) karena pet kamu ${alasanKalah[acak(0, alasanKalah.length - 1)]}\n\nUang kamu tidak berkurang karena sudah habis 😅\n+1 Tiketcoin`);
      } else {
        m.reply(`*${userName}* [${pointPemain * 10}] - [${pointLawan * 10}] *${lawanName}*\n\n*Pet🐴Kamu* (centaur ${global.db.data.users[userId].centaur}) KALAH melawan 🐴centaurnya *${lawanName}* (centaur ${global.db.data.users[lawan].centaur}) karena pet kamu ${alasanKalah[acak(0, alasanKalah.length - 1)]}\n\nUang kamu berkurang Rp. ${denda.toLocaleString()}\n+1 Tiketcoin`);
      }
    } else {
      m.reply(`*${userName}* [${pointPemain * 10}] - [${pointLawan * 10}] *${lawanName}*\n\nHasil imbang kak, ga dapet apa apa 😂`);
    }

    delete conn.fightnaga[userId];
  }, 1000 * 60 * lamaPertarungan);
}

handler.help = ['fightcentaur'];
handler.tags = ['game'];
handler.command = /^(fightcentaur)$/i;
handler.group = true;

module.exports = handler;

function acak(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}