const activeDuels = new Map();
const duelRequests = new Map();
const attackTimeouts = new Map();

let handler = async (m, { conn, bot, ctx, isGroup, chatId, userId, args, text }) => {
  try {
    if (!isGroup) {
      return m.reply('❌ Command ini hanya bisa digunakan di grup!');
    }

    let user = global.db.data.users[userId];
    
    if (!user) {
      return m.reply('❌ Lu belum terdaftar di database!');
    }
    
    if (user.health <= 0) {
      return m.reply('😓 Nyawa lu habis. Pulihkan nyawa dulu.');
    }

    if (!ctx.message.reply_to_message && !args[0]) {
      return m.reply('Gunakan: /duel @username atau reply pesan user yang mau ditantang');
    }

    let opponentId;
    let opponentUsername;

    if (ctx.message.reply_to_message) {
      opponentId = ctx.message.reply_to_message.from.id.toString();
      opponentUsername = ctx.message.reply_to_message.from.username || ctx.message.reply_to_message.from.first_name;
    } else if (args[0]) {
      opponentUsername = args[0].replace('@', '');
      
      const allUsers = Object.keys(global.db.data.users);
      for (let uid of allUsers) {
        const userData = global.db.data.users[uid];
        if (userData && (userData.usertag === '@' + opponentUsername || userData.name.toLowerCase() === opponentUsername.toLowerCase())) {
          opponentId = uid;
          break;
        }
      }
      
      if (!opponentId && isGroup) {
        try {
          const chatMembers = await bot.telegram.getChatAdministrators(chatId).catch(() => []);
          for (let member of chatMembers) {
            if (member.user.username === opponentUsername || member.user.first_name.toLowerCase() === opponentUsername.toLowerCase()) {
              opponentId = member.user.id.toString();
              break;
            }
          }
        } catch (e) {
          console.log('Error getting chat members:', e);
        }
      }
    }

    if (!opponentId) {
      return m.reply('❌ User gak ketemu. Pastikan user ada di grup atau database.');
    }

    let opponentUser = global.db.data.users[opponentId];

    if (!opponentUser) {
      return m.reply('❌ Lawan belum terdaftar di database.');
    }

    if (opponentUser.health <= 0) {
      return m.reply('❌ Lawan gak punya nyawa buat duel.');
    }

    if (opponentId === userId.toString()) {
      return m.reply('❌ Gak bisa duel sama diri sendiri!');
    }

    if (activeDuels.has(userId.toString()) || activeDuels.has(opponentId)) {
      return m.reply('⚔️ Salah satu pemain lagi duel');
    }

    const duelId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const challengerName = ctx.from.first_name || ctx.from.username;
    
    duelRequests.set(opponentId, {
      challenger: userId.toString(),
      challengerName: challengerName,
      duelId: duelId,
      timestamp: Date.now(),
      chatId: chatId
    });

    await ctx.reply(`⚔️ Tantangan duel udah dikirim ke ${opponentUsername}!`);

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ SETUJU', callback_data: `accept_duel_${duelId}` },
          { text: '❌ TOLAK', callback_data: `reject_duel_${duelId}` }
        ]
      ]
    };

    const userWeapon = user.sword > 0 && user.sworddurability > 0 ? '⚔️ Sword' : '✊ Tangan Kosong';
    const userArmor = user.armor > 0 && user.armordurability > 0 ? '🛡️ Armor' : '👕 Tanpa Armor';
    const opponentWeapon = opponentUser.sword > 0 && opponentUser.sworddurability > 0 ? '⚔️ Sword' : '✊ Tangan Kosong';
    const opponentArmor = opponentUser.armor > 0 && opponentUser.armordurability > 0 ? '🛡️ Armor' : '👕 Tanpa Armor';

    const userName = ctx.from.first_name || ctx.from.username;
    const message = `⚔️ *TANTANGAN DUEL* ⚔️\n\n${userName} ngajak lu duel!\n\n*STATUS LU:*\n❤️ Nyawa: ${opponentUser.health}\n${opponentWeapon}\n${opponentArmor}\n\n*STATUS LAWAN:*\n❤️ Nyawa: ${user.health}\n${userWeapon}\n${userArmor}\n\n⚠️ *PERHATIAN:*\n💰 Kalo kalah, uang lu kepotong *350,000 Rupiah*\n👑 Kalo menang, dapet hadiah random + exp!\n⚠️ Equipment durability bakal berkurang tiap serang!\n\nMau terima tantangan?`;

    await bot.telegram.sendMessage(opponentId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });

    setTimeout(() => {
      if (duelRequests.has(opponentId)) {
        duelRequests.delete(opponentId);
        bot.telegram.sendMessage(opponentId, '⏰ Tantangan duel udah kedaluwarsa').catch(() => {});
        bot.telegram.sendMessage(chatId, '⏰ Lawan gak respon tantangan').catch(() => {});
      }
    }, 60000);

  } catch (e) {
    console.log(e);
    m.reply('❌ Terjadi kesalahan');
  }
}

handler.before = async function(m, { conn, bot, ctx, isGroup, chatId, userId }) {
  try {
    if (!ctx || !ctx.callbackQuery) return false;

    const callbackData = ctx.callbackQuery.data;
    const callbackUserId = ctx.callbackQuery.from.id.toString();

    if (callbackData.startsWith('accept_duel_')) {
      try {
        const duelId = callbackData.replace('accept_duel_', '');
        const request = duelRequests.get(callbackUserId);

        if (!request || request.duelId !== duelId) {
          await ctx.answerCbQuery('❌ Tantangan gak valid atau udah kedaluwarsa');
          return true;
        }

        const challenger = request.challenger;
        const challengerUser = global.db.data.users[challenger];
        const opponentUser = global.db.data.users[callbackUserId];

        if (!opponentUser) {
          await ctx.answerCbQuery('❌ Data lu gak ketemu');
          return true;
        }

        duelRequests.delete(callbackUserId);

        if (!challengerUser || challengerUser.health <= 0) {
          await ctx.answerCbQuery('❌ Penantang udah gak punya nyawa');
          await ctx.editMessageText('❌ Penantang udah gak punya nyawa');
          return true;
        }

        const firstAttacker = Math.random() >= 0.5 ? challenger : callbackUserId;

        activeDuels.set(challenger, {
          opponent: callbackUserId,
          health: challengerUser.health,
          opponentHealth: opponentUser.health,
          currentTurn: firstAttacker,
          duelId: duelId,
          chatId: request.chatId,
          lastAttackTime: Date.now(),
          isProcessing: false
        });

        activeDuels.set(callbackUserId, {
          opponent: challenger,
          health: opponentUser.health,
          opponentHealth: challengerUser.health,
          currentTurn: firstAttacker,
          duelId: duelId,
          chatId: request.chatId,
          lastAttackTime: Date.now(),
          isProcessing: false
        });

        await ctx.answerCbQuery('✅ Tantangan diterima!');
        await ctx.editMessageText('✅ Lu nerima tantangan duel!');
        await bot.telegram.sendMessage(challenger, '✅ Lawan nerima tantangan duel!');

        setTimeout(async () => {
          await startDuel(bot, challenger, callbackUserId, duelId, firstAttacker, request.chatId);
        }, 1000);

        return true;
      } catch (e) {
        console.log('Error accept_duel:', e);
        await ctx.answerCbQuery('❌ Terjadi kesalahan').catch(() => {});
        return true;
      }
    }

    if (callbackData.startsWith('reject_duel_')) {
      const duelId = callbackData.replace('reject_duel_', '');
      const request = duelRequests.get(callbackUserId);

      if (!request || request.duelId !== duelId) {
        await ctx.answerCbQuery('❌ Tantangan gak valid');
        return true;
      }

      const challenger = request.challenger;
      duelRequests.delete(callbackUserId);

      await ctx.answerCbQuery('❌ Tantangan ditolak');
      await ctx.editMessageText('❌ Lu nolak tantangan duel');
      await bot.telegram.sendMessage(challenger, '❌ Lawan nolak tantangan duel lu');
      return true;
    }

    if (callbackData.startsWith('attack_duel_')) {
      const duelId = callbackData.replace('attack_duel_', '');
      const duelData = activeDuels.get(callbackUserId);

      if (!duelData || duelData.duelId !== duelId) {
        await ctx.answerCbQuery('❌ Duel gak valid');
        return true;
      }

      if (duelData.currentTurn !== callbackUserId) {
        await ctx.answerCbQuery('❌ Bukan giliran lu buat nyerang!');
        return true;
      }

      if (duelData.isProcessing) {
        await ctx.answerCbQuery('⏳ Lagi proses serangan...');
        return true;
      }

      const attacker = callbackUserId;
      const defender = duelData.opponent;
      const defenderData = activeDuels.get(defender);

      if (!defenderData) {
        await ctx.answerCbQuery('❌ Data lawan gak ketemu');
        return true;
      }

      duelData.isProcessing = true;
      defenderData.isProcessing = true;
      activeDuels.set(attacker, duelData);
      activeDuels.set(defender, defenderData);

      clearAttackTimeout(attacker);

      const attackerUser = global.db.data.users[attacker];
      const defenderUser = global.db.data.users[defender];

      let baseDamage = Math.floor(Math.random() * 20) + 15;
      let damageBonus = 0;
      let damageReduction = 0;
      let equipmentInfo = '';

      if (attackerUser.sword > 0 && attackerUser.sworddurability > 0) {
        damageBonus = Math.floor(Math.random() * 15) + 10;
        attackerUser.sworddurability -= 25;
        
        if (attackerUser.sworddurability <= 0) {
          attackerUser.sword = 0;
          attackerUser.sworddurability = 0;
          equipmentInfo += '\n\n⚠️ *SWORD LU ANCUR!* Craft yang baru!';
        } else if (attackerUser.sworddurability <= 30) {
          equipmentInfo += `\n\n⚠️ Durability sword lu tinggal: *${attackerUser.sworddurability}*`;
        }
      }

      if (defenderUser.armor > 0 && defenderUser.armordurability > 0) {
        damageReduction = Math.floor(Math.random() * 10) + 5;
        defenderUser.armordurability -= 15;
        
        if (defenderUser.armordurability <= 0) {
          defenderUser.armor = 0;
          defenderUser.armordurability = 0;
          equipmentInfo += '\n⚠️ *ARMOR LAWAN ANCUR!*';
        }
      }

      const finalDamage = Math.max(5, baseDamage + damageBonus - damageReduction);
      
      await ctx.answerCbQuery('⚔️ Nyerang...');
      await bot.telegram.sendMessage(attacker, `⚔️ Lu nyerang lawan...`);

      await new Promise(resolve => setTimeout(resolve, 3000));

      duelData.opponentHealth -= finalDamage;
      defenderData.health -= finalDamage;
      
      defenderUser.health = Math.max(0, defenderUser.health - finalDamage);

      let damageInfo = `💥 Lawan terkena damage sebesar ${finalDamage}!`;
      if (damageBonus > 0) damageInfo += `\n⚔️ Bonus Sword: +${damageBonus}`;
      if (damageReduction > 0) damageInfo += `\n🛡️ Dikurangi Armor: -${damageReduction}`;
      damageInfo += `\n\n❤️ Sisa nyawa lawan: ${Math.max(0, duelData.opponentHealth)}`;

      await bot.telegram.sendMessage(attacker, damageInfo + equipmentInfo);

      if (duelData.opponentHealth <= 0) {
        defenderUser.health = 0;
        await endDuel(bot, attacker, defender, duelId, attacker);
        return true;
      }

      duelData.currentTurn = defender;
      defenderData.currentTurn = defender;
      duelData.lastAttackTime = Date.now();
      defenderData.lastAttackTime = Date.now();
      duelData.isProcessing = false;
      defenderData.isProcessing = false;
      activeDuels.set(attacker, duelData);
      activeDuels.set(defender, defenderData);

      const attackButton = {
        inline_keyboard: [
          [{ text: '⚔️ SERANG BALIK', callback_data: `attack_duel_${duelId}` }]
        ]
      };

      let defenderEquipInfo = '';
      if (defenderUser.armor === 0 || defenderUser.armordurability <= 0) {
        defenderEquipInfo = '\n⚠️ Armor lu udah ancur! Damage bakal gede!';
      }

      const defenderMessage = `⚔️ Lawan nyerang lu!\n\n💥 Darah lu berkurang ${finalDamage}!\n❤️ Sisa nyawa: ${Math.max(0, defenderData.health)}\n\n⏱️ Serang balik dalam 5 detik atau giliran ilang!${defenderEquipInfo}`;

      await bot.telegram.sendMessage(defender, defenderMessage, { reply_markup: attackButton });
      
      startAttackTimeout(bot, defender, duelId);
      
      return true;
    }

    return false;
  } catch (e) {
    console.log('Error handler.before:', e);
    return false;
  }
}

async function startDuel(bot, challenger, opponent, duelId, firstAttacker, chatId) {
  try {
    const challengerUser = global.db.data.users[challenger];
    const opponentUser = global.db.data.users[opponent];
    
    const challengerName = challengerUser.name || 'User';
    const opponentName = opponentUser.name || 'User';
    const firstAttackerName = firstAttacker === challenger ? challengerName : opponentName;

    const challengerWeapon = challengerUser.sword > 0 && challengerUser.sworddurability > 0 ? '⚔️ Sword' : '✊ Tangan Kosong';
    const challengerArmor = challengerUser.armor > 0 && challengerUser.armordurability > 0 ? '🛡️ Armor' : '👕 Tanpa Armor';
    const opponentWeapon = opponentUser.sword > 0 && opponentUser.sworddurability > 0 ? '⚔️ Sword' : '✊ Tangan Kosong';
    const opponentArmor = opponentUser.armor > 0 && opponentUser.armordurability > 0 ? '🛡️ Armor' : '👕 Tanpa Armor';

    const startMessage = `🎮 *DUEL MULAI!* 🎮\n\n⚔️ ${challengerName} (${challengerWeapon}, ${challengerArmor})\nVS\n${opponentName} (${opponentWeapon}, ${opponentArmor})\n\n🎯 ${firstAttackerName} duluan nyerang!`;

    await bot.telegram.sendMessage(chatId, startMessage, { parse_mode: 'Markdown' });
    await bot.telegram.sendMessage(challenger, startMessage, { parse_mode: 'Markdown' });
    await bot.telegram.sendMessage(opponent, startMessage, { parse_mode: 'Markdown' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const attackButton = {
      inline_keyboard: [
        [{ text: '⚔️ SERANG', callback_data: `attack_duel_${duelId}` }]
      ]
    };

    await bot.telegram.sendMessage(firstAttacker, `⚔️ *Giliran lu nyerang!*\n\nPencet tombol buat nyerang!\n⏱️ Waktu cuma 5 detik!`, { 
      parse_mode: 'Markdown',
      reply_markup: attackButton 
    });

    startAttackTimeout(bot, firstAttacker, duelId);
  } catch (e) {
    console.log('Error startDuel:', e);
  }
}

function clearAttackTimeout(userId) {
  if (attackTimeouts.has(userId)) {
    clearTimeout(attackTimeouts.get(userId));
    attackTimeouts.delete(userId);
  }
}

async function startAttackTimeout(bot, attackerId, duelId) {
  clearAttackTimeout(attackerId);
  
  const timeoutId = setTimeout(async () => {
    const duelData = activeDuels.get(attackerId);
    
    if (!duelData || duelData.duelId !== duelId) return;
    
    if (duelData.currentTurn !== attackerId) return;
    
    if (duelData.isProcessing) return;
    
    const timeSinceLastAttack = Date.now() - duelData.lastAttackTime;
    if (timeSinceLastAttack < 5000) return;
    
    const defender = duelData.opponent;
    const defenderData = activeDuels.get(defender);
    
    if (!defenderData) return;
    
    await bot.telegram.sendMessage(attackerId, '⏰ Waktu abis! Giliran pindah ke lawan.');
    
    duelData.currentTurn = defender;
    defenderData.currentTurn = defender;
    duelData.lastAttackTime = Date.now();
    defenderData.lastAttackTime = Date.now();
    activeDuels.set(attackerId, duelData);
    activeDuels.set(defender, defenderData);
    
    const attackButton = {
      inline_keyboard: [
        [{ text: '⚔️ SERANG', callback_data: `attack_duel_${duelId}` }]
      ]
    };
    
    await bot.telegram.sendMessage(defender, `⚔️ *Giliran lu nyerang!*\n\nLawan telat nyerang, sekarang giliran lu!\n⏱️ Waktu cuma 5 detik!`, { 
      parse_mode: 'Markdown',
      reply_markup: attackButton 
    });
    
    startAttackTimeout(bot, defender, duelId);
  }, 5000);
  
  attackTimeouts.set(attackerId, timeoutId);
}

async function endDuel(bot, winner, loser, duelId, attacker) {
  const winnerData = activeDuels.get(winner);
  const loserData = activeDuels.get(loser);

  if (!winnerData || !loserData) return;

  clearAttackTimeout(winner);
  clearAttackTimeout(loser);

  const winnerUser = global.db.data.users[winner];
  const loserUser = global.db.data.users[loser];

  const transferAmount = 350000;
  const expReward = Math.floor(Math.random() * 100) + 50;

  winnerUser.money = (winnerUser.money || 0) + transferAmount;
  winnerUser.exp = (winnerUser.exp || 0) + expReward;
  
  loserUser.money = (loserUser.money || 0) - transferAmount;
  loserUser.health = 0;

  const winnerName = winnerUser.name || 'Pemenang';
  const loserName = loserUser.name || 'Yang Kalah';

  const winnerMessage = `🏆 *LU MENANG!* 🏆\n\n` +
    `👑 Pemenang: ${winnerName}\n` +
    `😔 Yang Kalah: ${loserName}\n\n` +
    `💰 Dapet Uang: +${transferAmount.toLocaleString()} Rupiah\n` +
    `🌟 Exp: +${expReward}`;

  const loserMessage = `😔 *LU KALAH!* 😔\n\n` +
    `👑 Pemenang: ${winnerName}\n` +
    `😔 Yang Kalah: ${loserName}\n\n` +
    `💸 Uang Berkurang: -${transferAmount.toLocaleString()} Rupiah\n` +
    `❤️ Nyawa Habis: 0`;

  const groupMessage = `🏆 *DUEL SELESAI!* 🏆\n\n` +
    `👑 Pemenang: ${winnerName}\n` +
    `😔 Yang Kalah: ${loserName}\n\n` +
    `💰 Transfer Uang: ${transferAmount.toLocaleString()} Rupiah\n` +
    `🌟 Exp: +${expReward}`;

  await bot.telegram.sendMessage(winner, winnerMessage, { parse_mode: 'Markdown' });
  await bot.telegram.sendMessage(loser, loserMessage, { parse_mode: 'Markdown' });
  
  if (winnerData.chatId) {
    await bot.telegram.sendMessage(winnerData.chatId, groupMessage, { parse_mode: 'Markdown' });
  }

  activeDuels.delete(winner);
  activeDuels.delete(loser);
}

handler.help = ['duel'];
handler.tags = ['game'];
handler.command = /^(duel)$/i;
handler.group = true;

module.exports = handler;