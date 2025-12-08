let handler = async (m, { conn = bot }) => {
    let user = global.db.data.users[m.sender];
    let __timers = new Date() - user.lastngojek;
    let _timers = 300000 - __timers;  // 300000 ms = 5 menit
    let timers = clockString(_timers); 
    let name = conn.getName(m.sender);
    
    if (_timers > 0) {
        conn.reply(m.chat, `Sepertinya Anda sudah kecapekan. Silahkan istirahat dulu sekitar\n🕔 *${timers}*`, m.id);
        return;
    }

    let randomaku1 = Math.floor(Math.random() * 10);
    let randomaku2 = Math.floor(Math.random() * 10);
    let randomaku4 = Math.floor(Math.random() * 5);
    let randomaku3 = Math.floor(Math.random() * 10);
    let randomaku5 = Math.floor(Math.random() * 10);

    let rbrb1 = randomaku1 * 2;
    let rbrb2 = randomaku2 * 10;
    let rbrb3 = randomaku3 * 1;
    let rbrb4 = randomaku4 * 15729;
    let rbrb5 = randomaku5 * 120;

    let zero1 = `${rbrb1}`;
    let zero2 = `${rbrb2}`;
    let zero3 = `${rbrb3}`;
    let zero4 = `${rbrb4}`;
    let zero5 = `${rbrb5}`;

    let dimas = `
🚶⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🏘️🏘️🏘️🏘️🌳  🌳 🏘️       🚕

✔️ Mendapatkan orderan....
`;

    let dimas2 = `
🚶⬛⬛⬛⬛⬛🚐⬛⬛⬛🚓🚚
🚖⬜⬜⬜⬛⬜⬜⬜🚓⬛🚑
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🚙
🏘️🏘️🏢️🌳  🌳 🏘️  🏘️🏡     

🚖 Mengantar Ke tujuan.....
`;

    let dimas3 = `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🚓
⬛⬜🚗⬜⬜⬛⬜🚐⬜⬜⬛🚙🚚🚑
⬛⬛⬛⬛🚒⬛⬛⬛⬛⬛⬛🚚
🏘️🏘️🏘️🏘️🌳  🌳 🏘️       

🚖 Selesai Mengantar Pelanggan....
`;

    let dimas4 = `
➕ 💹Menerima gaji....
`;

    let hsl = `
*—[ Hasil Taxi ${m.usertag} ]—*
➕ 💹 Uang = [ ${zero4} ]
➕ ✨ Exp = [ ${zero5} ] 		 
➕ 😍 Order Selesai = +1
➕  📥Total Order Sebelumnya : ${user.ojekk}
${wm}
`;

    let dimas5 = `
*👋HALLO, Waktunya misi taxi lagi kak.....*
`;

    user.money += rbrb4;
    user.exp += rbrb5;
    user.ojekk += 1;
    user.lastngojek = new Date().getTime();

    setTimeout(() => {
        m.reply('🔍Mencari pelanggan.....');
    }, 0);

    setTimeout(() => {
        m.reply(`${dimas}`);
    }, 10000);

    setTimeout(() => {
        m.reply(`${dimas2}`);
    }, 15000);

    setTimeout(() => {
        m.reply(`${dimas3}`);
    }, 20000);

    setTimeout(() => {
        m.reply(`${dimas4}`);
    }, 25000);

    setTimeout(() => {
        m.reply(`${hsl}`);
    }, 27000);

    setTimeout(() => {
        m.reply(`${dimas5}`);
    }, 79200000); // 22 jam
}

handler.tags = ['rpg'];
handler.command = /^(grab)$/i;
handler.register = true;

module.exports = handler;

function clockString(ms) {
    if (ms <= 0) return '00:00:00';
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}