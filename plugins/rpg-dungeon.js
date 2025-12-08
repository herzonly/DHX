function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor(((ms % 3600000) % 60000) / 1000);
    return `${hours}:${minutes}:${seconds}`;
}

const dungeonLevels = [
    {
        level: 1,
        monsters: ['Goblin', 'Slime'],
        obstacles: ['Pit Trap', 'Poison Gas']
    },
    {
        level: 2,
        monsters: ['Orc', 'Skeleton'],
        obstacles: ['Giant Boulder', 'Dark Magic']
    },
    {
        level: 3,
        monsters: ['Dragon', 'Wyvern'],
        obstacles: ['Lava Pit', 'Ice Barrier']
    },
    {
        level: 4,
        monsters: ['Vampire', 'Mummy'],
        obstacles: ['Fire Trap', 'Rolling Stones']
    },
    {
        level: 5,
        monsters: ['Dragon', 'Minotaur'],
        obstacles: ['Deep Abyss', 'Destruction Magic']
    },
    {
        level: 6,
        monsters: ['Phoenix', 'Kraken'],
        obstacles: ['Poison Stone', 'Time Reversal']
    },
    {
        level: 7,
        monsters: ['Demon Lord', 'Archangel'],
        obstacles: ['Ancient Tomb', 'Sea of Flames']
    },
    {
        level: 8,
        monsters: ['God of Chaos', 'Titan'],
        obstacles: ['Dimension Gate', 'Final Battle']
    },
    {
        level: 9,
        monsters: ['Elder Dragon', 'Celestial Being'],
        obstacles: ['Black Nebula', 'Eternal Death']
    },
    {
        level: 10,
        monsters: ['Demon King', 'God'],
        obstacles: ['Resurrection Gate', 'End of Everything']
    }
];

const successText = `Selamat! Lu berhasil nyelesaiin level dungeon ini. Lu ngalahin monster kuat dan lewatin rintangan berbahaya. Exp lu terus nambah, dan lu makin deket jadi Demon King terkuat di dunia Isekai ini. Lanjutin perjalanan lu dan hadapin tantangan berikutnya!`;

const lastDungeonData = {};

const dungeonRPG = async (m, { conn }) => {
    const user = global.db.data.users[m.sender];

    if (!user.sword || user.sword < 1) {
        return conn.reply(m.chat, "Lu gapunya sword! Craft dulu pake *.craft sword*", m);
    }

    if (user.sworddurability <= 0) {
        user.sword = 0;
        user.sworddurability = 0;
        return conn.reply(m.chat, "⚠️ Sword lu udah ancur!\nCraft yang baru pake *.craft sword*", m);
    }

    if (user.restActive === true) {
        return conn.reply(m.chat, "Lu lagi istirahat, tunggu sampe stamina full", m);
    }

    if (user.stamina < 30) {
        return conn.reply(m.chat, "Stamina lu abis! Istirahat dulu. Pake command */rest*", m);
    }

    user.stamina -= 30;
    user.sworddurability -= 2;

    const levelIndex = getRandomInt(0, dungeonLevels.length - 1);
    const selectedLevel = dungeonLevels[levelIndex];

    const monsterIndex = getRandomInt(0, selectedLevel.monsters.length - 1);
    const selectedMonster = selectedLevel.monsters[monsterIndex];

    const obstacleIndex = getRandomInt(0, selectedLevel.obstacles.length - 1);
    const selectedObstacle = selectedLevel.obstacles[obstacleIndex];

    let message = "";
    let durabilityInfo = "";

    if (getRandomInt(1, 100) <= 70) {
        let exp = getRandomInt(50, 200);

        if (levelIndex === dungeonLevels.length - 1) {
            exp *= 20;
        }

        user.exp += exp;

        message = `Selamat! Lu berhasil eksplorasi dungeon level ${selectedLevel.level} dan ngalahin ${selectedMonster}. Lu juga lewatin rintangan ${selectedObstacle}.\nLu dapet ${exp} exp sebagai hadiah.\n\n${successText}`;

        lastDungeonData[m.sender] = {
            level: selectedLevel.level,
            monster: selectedMonster,
            obstacle: selectedObstacle,
            exp: exp
        };
    } else {
        const penalty = getRandomInt(20, 100);
        user.exp -= penalty;

        message = `Sayang banget, lu nyasar di dungeon level ${selectedLevel.level} dan harus bayar ${penalty} exp buat kabur.\n\n${successText}`;
    }

    if (user.sworddurability <= 0) {
        user.sword = 0;
        user.sworddurability = 0;
        durabilityInfo = '\n\n⚠️ *SWORD ANCUR!*\nSword lu udah rusak parah!\nCraft lagi pake *.craft sword*';
    } else if (user.sworddurability <= 20) {
        durabilityInfo = `\n\n⚠️ Durability sword lu tinggal: *${user.sworddurability}*\nMending craft yang baru!`;
    } else {
        durabilityInfo = `\n\n🗡️ Durability sword: *${user.sworddurability}*`;
    }

    const remainingEnergy = formatTime(user.energyCooldown);

    conn.reply(m.chat, message + `\nStamina lu sekarang: ${user.stamina}\nEnergy Cooldown: ${remainingEnergy}${durabilityInfo}`, m);
};

dungeonRPG.getLastDungeonData = (userId) => {
    return lastDungeonData[userId];
};

dungeonRPG.help = ['dungeon'];
dungeonRPG.tags = ['rpg'];
dungeonRPG.command = /^dungeon$/i;
dungeonRPG.register = true;

module.exports = dungeonRPG;