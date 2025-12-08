
function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const animeIsekaiBossNames = [
  'Demon Lord Vermudol',
  'Giant Spider Queen',
  'White Whale',
  'Shadow of the Colossus',
  'Dragon King Veldora',
  'Witch of Envy Satella',
  'Demon King Darios',
  'Majin Boo',
  'Beast of Calamity Rimuru',
  'Darkness Knight Gulzak',
  'Beast King Gazel',
  'Dragon of Destruction Carrion',
  'Overlord Ainz Ooal Gown',
  'Royal Knight Alice',
  'Beelzebub Lord of the Flies',
  'Beast of Wrath Gaia',
  'Winged Serpent Quetzalcoatl',
  'Ice Wolf Lest',
  'Demon King Leon Cromwell',
  'Storm Dragon Velgrynd'
];

const bossData = {
  health: 10000,
  maxHealth: 10000,
  attack: 500,
};

let handler = async (m, { conn, text }) => {
  try {
    let user = global.db.data.users[m.sender];

    if (user.health <= 0) {
      conn.reply(m.chat, '😓 Nyawa Anda habis. Anda perlu memulihkan nyawa Anda terlebih dahulu.', m);
      return;
    }

    if (new Date() - user.lastbossbattle < 3600000) {
      conn.reply(m.chat, '⏰ Anda hanya dapat bertarung dengan bos sekali dalam 1 jam.', m);
      return;
    }

    user.lastbossbattle = new Date();

    let sword = user.sword || 0;
    let userAttack = Math.floor(Math.random() * (1000 - sword)) + 1;

    let bossAttack = Math.floor(Math.random() * (87 - 60 + 1)) + 60;

    bossData.health -= userAttack;
    if (bossData.health < 0) {
      bossData.health = 0;
    }

    let armor = user.armor || 0;

    let damageToUser = bossAttack - armor;
    if (damageToUser < 0) {
      damageToUser = 0;
    }
    
    user.health -= damageToUser;
    if (user.health < 0) {
      user.health = 0;
    }

    let message = `🗡️ Hasil pertarungan dengan bos ${pickRandom(animeIsekaiBossNames)} 🐉:\n\n`;
    message += `❤️ Nyawa pengguna: ${user.health}/${user.maxHealth}\n`;
    message += `❤️ Nyawa bos: ${bossData.health}/${bossData.maxHealth}\n`;

    if (bossData.health <= 0) {
      let expReward = Math.floor(Math.random() * 100) + 50;
      let moneyReward = Math.floor(Math.random() * 1000) + 500;

      user.exp += expReward;
      user.money += moneyReward;

      message += `\n🎉 Anda menang dalam pertarungan! Bos telah dikalahkan.\n`;
      message += `💰 Anda mendapatkan +${moneyReward} Money\n`;
      message += `🌟 Anda mendapatkan +${expReward} Exp\n`;
    } else {
      message += `\n⚔️ Serangan pengguna: ${userAttack}\n`;
      message += `⚔️ Serangan bos: ${bossAttack}\n\n`;
      message += `🔄 Pertarungan berlanjut...`;
    }

    let cooldown = 3600000;
    user.bosbattle = new Date() * 1 + cooldown;

    conn.reply(m.chat, message, m);
  } catch (e) {
    console.log(e);
    conn.reply(m.chat, 'Error', m);
  }
}

handler.help = ['bosbattle'];
handler.tags = ['rpg'];
handler.command = /^bosbattle$/i;
handler.group = true;

module.exports = handler;