const monsters = {
  'slime': {
    name: 'Slime',
    power: 10,
    health: 100,
  },
  'goblin': {
    name: 'Goblin',
    power: 15,
    health: 150,
  },
  'dragon': {
    name: 'Dragon',
    power: 30,
    health: 300,
  },
  'orc': {
    name: 'Orc',
    power: 25,
    health: 250,
  },
  'skeleton': {
    name: 'Skeleton',
    power: 12,
    health: 120,
  },
  'demon': {
    name: 'Demon',
    power: 40,
    health: 400,
  },
};

let handler = async (m, { command }) => {
  if (command === 'farmmonster') {
    const userId = m.sender;
    global.db.data.users[userId] = global.db.data.users[userId] || { level: 1, exp: 0, health: 100, monster: null, sword: 0, sworddurability: 0 };
    const user = global.db.data.users[userId];

    if (!user.sword || user.sword < 1) {
      await m.reply('Lu gapunya sword! Craft dulu pake *.craft sword*');
      return;
    }

    if (user.sworddurability <= 0) {
      user.sword = 0
      user.sworddurability = 0
      await m.reply('⚠️ Sword lu udah ancur!\nCraft yang baru pake *.craft sword*');
      return;
    }

    const userLevel = user.level;
    const userMonster = user.monster;

    if (userMonster) {
      await m.reply(`Lu lagi battle sama ${monsters[userMonster].name}.`);
      return;
    }

    user.sworddurability -= 2

    const monsterKeys = Object.keys(monsters);
    const randomMonsterKey = monsterKeys[Math.floor(Math.random() * monsterKeys.length)];
    const monster = monsters[randomMonsterKey];

    const userPower = (userLevel * 10) + (user.sword * 5);

    await m.reply(`Lu ketemu ${monster.name} (Power: ${monster.power}, Health: ${monster.health}).`);
    user.monster = randomMonsterKey;

    let battleResult = '';
    let durabilityInfo = '';

    if (userPower > monster.power) {
      const expEarned = Math.floor(monster.power * 1.5);
      user.exp += expEarned;
      user.monster = null;
      battleResult = `Lu berhasil ngalahin ${monster.name} dan dapet ${expEarned} exp.`;
    } else {
      const damageTaken = Math.floor(monster.power / 2);
      user.health -= damageTaken;
      if (user.health <= 0) {
        user.health = 100;
        user.level -= 1;
      }
      user.monster = null;
      battleResult = `${monster.name} ngalahin lu dan lu kehilangan ${damageTaken} health.`;
    }

    if (user.sworddurability <= 0) {
      user.sword = 0
      user.sworddurability = 0
      durabilityInfo = '\n\n⚠️ *SWORD ANCUR!*\nSword lu udah rusak parah!\nCraft lagi pake *.craft sword*'
    } else if (user.sworddurability <= 20) {
      durabilityInfo = `\n\n⚠️ Durability sword lu tinggal: *${user.sworddurability}*\nMending craft yang baru!`
    } else {
      durabilityInfo = `\n\n🗡️ Durability sword: *${user.sworddurability}*`
    }

    await m.reply(battleResult + durabilityInfo);
  }
};

handler.help = ['farmmonster'];
handler.tags = ['game'];
handler.command = /^farmmonster$/i;
handler.register = true;

module.exports = handler;