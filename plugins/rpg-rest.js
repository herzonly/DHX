function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor(((ms % 3600000) % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}

const activeIntervals = new Map();

const restRPG = async (m, { conn }) => {
    const user = global.db.data.users[m.sender];
    
    const now = Date.now();
    const commandCooldown = 60000;
    const timeSinceLastCommand = now - user.lastRestCommand;
    
    /*if (timeSinceLastCommand < commandCooldown) {
        const remaining = commandCooldown - timeSinceLastCommand;
        return conn.reply(m.chat, `⏳ Please wait before using /rest again!\n\n⏰ Cooldown: ${formatTime(remaining)}`, m);
    }*/
    
    if (user.stamina >= user.maxStamina) {
        user.lastRestCommand = now;
        user.lastRest = 0;
        if (activeIntervals.has(m.sender)) {
            clearInterval(activeIntervals.get(m.sender));
            activeIntervals.delete(m.sender);
        }
        return conn.reply(m.chat, `✨ Your stamina is already full!\n\n💪 Stamina: ${user.stamina}/${user.maxStamina}\n\nYou're ready for the next adventure!`, m);
    }
    
    if (activeIntervals.has(m.sender)) {
        const timePassed = now - user.lastRest;
        const nextRegen = 300000 - (timePassed % 300000);
        const staminaToFull = user.maxStamina - user.stamina;
        const cyclesNeeded = Math.ceil(staminaToFull / 15);
        const timeToFull = (cyclesNeeded * 300000) - (timePassed % 300000);
        
        user.lastRestCommand = now;
        return conn.reply(m.chat, `😴 You are currently resting...\n\n💪 Current stamina: ${user.stamina}/${user.maxStamina}\n⏰ Next regeneration: ${formatTime(nextRegen)}\n⏳ Time until full: ${formatTime(timeToFull)}`, m);
    }
    
    user.lastRest = now;
    user.lastRestCommand = now;
    
    conn.reply(m.chat, `😴 You start resting...\n\n💪 Current stamina: ${user.stamina}/${user.maxStamina}\n⏰ Stamina will regenerate +15 every 5 minutes\n\nThe bot will notify you when your stamina is full!`, m);
    
    const regenInterval = setInterval(async () => {
        const currentUser = global.db.data.users[m.sender];
        
        if (!currentUser) {
            clearInterval(regenInterval);
            activeIntervals.delete(m.sender);
            return;
        }
        
        currentUser.stamina += 15;
        
        if (currentUser.stamina >= currentUser.maxStamina) {
            currentUser.stamina = currentUser.maxStamina;
            currentUser.lastRest = 0;
            clearInterval(regenInterval);
            activeIntervals.delete(m.sender);
            
            await conn.reply(m.sender, `✨ STAMINA FULL! ✨\n\n💪 Your stamina has been fully restored!\n📊 Stamina: ${currentUser.stamina}/${currentUser.maxStamina}\n\n🎮 You're ready for the next adventure!\n⚔️ Use /dungeon to start your adventure`, null);
        }
    }, 300000);
    
    activeIntervals.set(m.sender, regenInterval);
};

restRPG.help = ['rest'];
restRPG.tags = ['rpg'];
restRPG.command = /^rest$/i;
restRPG.register = true;

module.exports = restRPG;