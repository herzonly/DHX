let handler = async(m, { bot }) => {
  await bot.sendButton(m.chat, {
  text: `Hi ${m.userTag}, Saya adalah ${botName}, saya menggunakan script dari [DHX ZY](https://github.com/herzonly/DHX) dari github!, mau coba? silahkan pencet tombol dibawah`,
  buttons: [
    [{ text: 'Lihat script', type: 'url', url: 'https://github.com/herzonly/DHX' }]
  ]
});
}

handler.help = ["sc", "script"]
handler.command = ["sc", "script"]
handler.tags = ["main", "info"]

module.exports = handler
