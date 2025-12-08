const fs = require('fs').promises;
const path = require('path');
const timeout = 900000;

let ampasPath = path.join(__dirname, '..', 'media', 'ampas.jpg');
let hokiPath = path.join(__dirname, '..', 'media', 'hoki.jpg');

let handler = async (m, { bot, usedPrefix, text }) => {
    let conn = bot
    // Pengecekan apakah status premium telah berakhir
    let now = new Date().getTime();
    if (global.db.data.users[m.sender].premium && global.db.data.users[m.sender].premiumDate < now) {
        global.db.data.users[m.sender].premium = false;
    }

    let timeLootbox = global.db.data.users[m.sender].lastlootbox + 900000;

    if (now - global.db.data.users[m.sender].lastlootbox < 900000) {
        return m.reply(`Anda sudah terlalu sering membuka lootbox\nTunggu selama ${msToTime(timeLootbox - now)} lagi`);
    }

    // 75% chance to get zonk, 35% chance to get prize
    let isZonk = Math.random() < 0.75;

    if (isZonk) {
        let botolnye = `${Math.floor(Math.random() * 1000)}`.trim();
        let kalengnye = `${Math.floor(Math.random() * 1000)}`.trim();
        let kardusnye = `${Math.floor(Math.random() * 1000)}`.trim();
        global.db.data.users[m.sender].botol += parseInt(botolnye);
        global.db.data.users[m.sender].kaleng += parseInt(kalengnye);
        global.db.data.users[m.sender].kardus += parseInt(kardusnye);
        global.db.data.users[m.sender].lastlootbox = now;

        let ampas = 'https://telegra.ph/file/8312799981573e4f55962.jpg';

        let ampass = `Sayang sekali, kamu hanya mendapatkan:\n+${botolnye} Botol 🍶\n+${kardusnye} Kardus 📦\n+${kalengnye} Kaleng 🥫`;

        // Read ampas image as buffer
        let ampasBuffer = await fs.readFile(ampasPath);
        conn.sendFile(m.chat, './media/ampas.jpg', 'ampas.jpg', ampass, m);
    } else {
        let isLegendary = Math.random() < 0.20;  // 20% chance for legendary prize
        if (isLegendary) {
            global.db.data.users[m.sender].premium = true;
            global.db.data.users[m.sender].premiumDate = now + 604800000; // 7 days in milliseconds
            global.db.data.users[m.sender].apel += 45;
            global.db.data.users[m.sender].diamond += 30;
            global.db.data.users[m.sender].limit += 30;
            global.db.data.users[m.sender].tiketcoin += 50;

            let legend = 'https://telegra.ph/file/8471eb95e7f72dd22050e.jpg'

            let legendaryMessage = `Selamat! Kamu mendapatkan hadiah Legendary:\nPremium selama 7 hari! 🎉\n+45 Apel 🍎\n+30 Diamond 💎\n+30 Limit 🪙\n+50 Tiket Koin 🎫`;
            conn.sendFile(m.chat, legend, 'legend.jpg', legendaryMessage, m);
        } else {
            let money = `${Math.floor(Math.random() * 500)}`.trim();
            let diamond = `${Math.floor(Math.random() * 30)}`.trim();
            let apel = `${Math.floor(Math.random() * 45)}`.trim();
            let limit = `${Math.floor(Math.random() * 30)}`.trim();
            let tiketcoin = `${Math.floor(Math.random() * 50)}`.trim();
            global.db.data.users[m.sender].money += parseInt(money);
            global.db.data.users[m.sender].diamond += parseInt(diamond);
            global.db.data.users[m.sender].apel += parseInt(apel);
            global.db.data.users[m.sender].limit += parseInt(limit);
            global.db.data.users[m.sender].tiketcoin += parseInt(tiketcoin);
            global.db.data.users[m.sender].lastlootbox = now;

            let hoki = 'https://telegra.ph/file/6e872893ea3fffd8c7c0e.jpg';

            let hokis = `Selamat kamu mendapatkan:\n+${money} Uang 💵\n+${diamond} Diamond 💎\n+${apel} Apel 🍎\n+${limit} Limit 🪙\n+${tiketcoin} Tiket Koin 🎫`;

            // Read hoki image as buffer
            let hokiBuffer = await fs.readFile(hokiPath);
            conn.sendFile(m.chat, './media/hoki.jpg', 'hoki.jpg', hokis, m);
        }
    }

    setTimeout(() => {
        conn.reply(m.chat, `Yuk waktunya buka lootbox lagi 😅`, m);
    }, timeout);
};

handler.help = ['lootbox'];
handler.tags = ['rpg'];
handler.command = /^(lootbox)$/i;
handler.owner = false;
handler.mods = false;
handler.premium = false;
handler.group = true;
handler.private = false;

handler.admin = false;
handler.botAdmin = false;

handler.fail = null;
handler.limit =10;
handler.exp = 0;
handler.money = 0;

module.exports = handler;

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + " jam " + minutes + " menit " + seconds + " detik";
}