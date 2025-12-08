
  let handler = async(m, { bot, ctx }) => {
    try {
      if (!global.db || !global.db.data || !global.db.data.users) {
        return m.reply('❌ Database belum tersedia');
      }

      let fixed = 0;
      let total = Object.keys(global.db.data.users).length;
      
      for (let userId in global.db.data.users) {
        let user = global.db.data.users[userId];
        
        if (user.usertag && user.usertag !== 'user' && !user.usertag.startsWith('@')) {
          user.usertag = '@' + user.usertag;
          fixed++;
        }
      }
      
      await m.reply(`✅ Fixed ${fixed} users out of ${total} total users\n\nUser data will be updated on their next message`);
    } catch (error) {
      console.error('Error fixing user data:', error);
      await m.reply('❌ Error: ' + error.message);
    }
  }
  
handler.help = ["fixdb"]
handler.command = ["fixdb"]
handler.owner = true

module.exports = handler