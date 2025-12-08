let handler = async (m, { bot, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return await m.reply(`*Usage:* ${usedPrefix + command} <amount>\n\nExample: ${usedPrefix + command} 100,000`)
        }

        let amount = parseInt(text)
        
        if (isNaN(amount) || amount < 100000) {
            return await m.reply(`Minimum bet is 100,000!\n\nExample: ${usedPrefix + command} 100,000`)
        }

        if (!global.db.data.users[m.sender]) {
            global.db.data.users[m.sender] = { money: 0 }
        }

        let userMoney = global.db.data.users[m.sender].money || 0

        if (userMoney < amount) {
            return await m.reply(`You don't have enough money!\n\n💰 Your money: ${userMoney}\n💸 Bet amount: ${amount}`)
        }

        global.db.data.users[m.sender].money -= amount

        let _spin1 = pickRandom(['1', '2', '3', '4', '5'])
        let _spin2 = pickRandom(['1', '2', '3', '4', '5'])
        let _spin3 = pickRandom(['1', '2', '3', '4', '5'])
        let _spin4 = pickRandom(['1', '2', '3', '4', '5'])
        let _spin5 = pickRandom(['1', '2', '3', '4', '5'])
        let _spin6 = pickRandom(['1', '2', '3', '4', '5'])
        let _spin7 = pickRandom(['1', '2', '3', '4', '5'])
        let _spin8 = pickRandom(['1', '2', '3', '4', '5'])
        let _spin9 = pickRandom(['1', '2', '3', '4', '5'])

        let spin1 = (_spin1 * 1)
        let spin2 = (_spin2 * 1)
        let spin3 = (_spin3 * 1)
        let spin4 = (_spin4 * 1)
        let spin5 = (_spin5 * 1)
        let spin6 = (_spin6 * 1)
        let spin7 = (_spin7 * 1)
        let spin8 = (_spin8 * 1)
        let spin9 = (_spin9 * 1)

        let spins1 = (spin1 == 1 ? '🍊' : spin1 == 2 ? '🍇' : spin1 == 3 ? '🍉' : spin1 == 4 ? '🍌' : spin1 == 5 ? '🍍' : '')
        let spins2 = (spin2 == 1 ? '🍊' : spin2 == 2 ? '🍇' : spin2 == 3 ? '🍉' : spin2 == 4 ? '🍌' : spin2 == 5 ? '🍍' : '')
        let spins3 = (spin3 == 1 ? '🍊' : spin3 == 2 ? '🍇' : spin3 == 3 ? '🍉' : spin3 == 4 ? '🍌' : spin3 == 5 ? '🍍' : '')
        let spins4 = (spin4 == 1 ? '🍊' : spin4 == 2 ? '🍇' : spin4 == 3 ? '🍉' : spin4 == 4 ? '🍌' : spin4 == 5 ? '🍍' : '')
        let spins5 = (spin5 == 1 ? '🍊' : spin5 == 2 ? '🍇' : spin5 == 3 ? '🍉' : spin5 == 4 ? '🍌' : spin5 == 5 ? '🍍' : '')
        let spins6 = (spin6 == 1 ? '🍊' : spin6 == 2 ? '🍇' : spin6 == 3 ? '🍉' : spin6 == 4 ? '🍌' : spin6 == 5 ? '🍍' : '')
        let spins7 = (spin7 == 1 ? '🍊' : spin7 == 2 ? '🍇' : spin7 == 3 ? '🍉' : spin7 == 4 ? '🍌' : spin7 == 5 ? '🍍' : '')
        let spins8 = (spin8 == 1 ? '🍊' : spin8 == 2 ? '🍇' : spin8 == 3 ? '🍉' : spin8 == 4 ? '🍌' : spin8 == 5 ? '🍍' : '')
        let spins9 = (spin9 == 1 ? '🍊' : spin9 == 2 ? '🍇' : spin9 == 3 ? '🍉' : spin9 == 4 ? '🍌' : spin9 == 5 ? '🍍' : '')

        let msg = await m.reply(`
*VIRTUAL SLOTS*

${spins1}|${spins2}|${spins3}
${spins4}|${spins5}|${spins6} <<==
${spins7}|${spins8}|${spins9}

💰 Bet: ${amount}
Spinning...
`.trim())

        for (let i = 0; i < 10; i++) {
            let animSpin1 = pickRandom(['1', '2', '3', '4', '5']) * 1
            let animSpin2 = pickRandom(['1', '2', '3', '4', '5']) * 1
            let animSpin3 = pickRandom(['1', '2', '3', '4', '5']) * 1
            let animSpin4 = pickRandom(['1', '2', '3', '4', '5']) * 1
            let animSpin5 = pickRandom(['1', '2', '3', '4', '5']) * 1
            let animSpin6 = pickRandom(['1', '2', '3', '4', '5']) * 1
            let animSpin7 = pickRandom(['1', '2', '3', '4', '5']) * 1
            let animSpin8 = pickRandom(['1', '2', '3', '4', '5']) * 1
            let animSpin9 = pickRandom(['1', '2', '3', '4', '5']) * 1

            let animSpins1 = (animSpin1 == 1 ? '🍊' : animSpin1 == 2 ? '🍇' : animSpin1 == 3 ? '🍉' : animSpin1 == 4 ? '🍌' : animSpin1 == 5 ? '🍍' : '')
            let animSpins2 = (animSpin2 == 1 ? '🍊' : animSpin2 == 2 ? '🍇' : animSpin2 == 3 ? '🍉' : animSpin2 == 4 ? '🍌' : animSpin2 == 5 ? '🍍' : '')
            let animSpins3 = (animSpin3 == 1 ? '🍊' : animSpin3 == 2 ? '🍇' : animSpin3 == 3 ? '🍉' : animSpin3 == 4 ? '🍌' : animSpin3 == 5 ? '🍍' : '')
            let animSpins4 = (animSpin4 == 1 ? '🍊' : animSpin4 == 2 ? '🍇' : animSpin4 == 3 ? '🍉' : animSpin4 == 4 ? '🍌' : animSpin4 == 5 ? '🍍' : '')
            let animSpins5 = (animSpin5 == 1 ? '🍊' : animSpin5 == 2 ? '🍇' : animSpin5 == 3 ? '🍉' : animSpin5 == 4 ? '🍌' : animSpin5 == 5 ? '🍍' : '')
            let animSpins6 = (animSpin6 == 1 ? '🍊' : animSpin6 == 2 ? '🍇' : animSpin6 == 3 ? '🍉' : animSpin6 == 4 ? '🍌' : animSpin6 == 5 ? '🍍' : '')
            let animSpins7 = (animSpin7 == 1 ? '🍊' : animSpin7 == 2 ? '🍇' : animSpin7 == 3 ? '🍉' : animSpin7 == 4 ? '🍌' : animSpin7 == 5 ? '🍍' : '')
            let animSpins8 = (animSpin8 == 1 ? '🍊' : animSpin8 == 2 ? '🍇' : animSpin8 == 3 ? '🍉' : animSpin8 == 4 ? '🍌' : animSpin8 == 5 ? '🍍' : '')
            let animSpins9 = (animSpin9 == 1 ? '🍊' : animSpin9 == 2 ? '🍇' : animSpin9 == 3 ? '🍉' : animSpin9 == 4 ? '🍌' : animSpin9 == 5 ? '🍍' : '')

            await bot.delay(300)

            try {
                await m.ctx.telegram.editMessageText(
                    m.chat,
                    msg.message_id,
                    undefined,
                    `
*VIRTUAL SLOTS*

${animSpins1}|${animSpins2}|${animSpins3}
${animSpins4}|${animSpins5}|${animSpins6} <<==
${animSpins7}|${animSpins8}|${animSpins9}

💰 Bet: ${amount}
`.trim(),
                    { parse_mode: 'Markdown' }
                )
            } catch (e) {
                null
            }
        }

        let WinOrLose, winAmount = 0
        
        // Check for Mega Jackpot (all 9 slots match)
        if (spin1 == 1 && spin2 == 1 && spin3 == 1 && spin4 == 1 && spin5 == 1 && spin6 == 1 && spin7 == 1 && spin8 == 1 && spin9 == 1 || 
            spin1 == 2 && spin2 == 2 && spin3 == 2 && spin4 == 2 && spin5 == 2 && spin6 == 2 && spin7 == 2 && spin8 == 2 && spin9 == 2 || 
            spin1 == 3 && spin2 == 3 && spin3 == 3 && spin4 == 3 && spin5 == 3 && spin6 == 3 && spin7 == 3 && spin8 == 3 && spin9 == 3 || 
            spin1 == 4 && spin2 == 4 && spin3 == 4 && spin4 == 4 && spin5 == 4 && spin6 == 4 && spin7 == 4 && spin8 == 4 && spin9 == 4 || 
            spin1 == 5 && spin2 == 5 && spin3 == 5 && spin4 == 5 && spin5 == 5 && spin6 == 5 && spin7 == 5 && spin8 == 5 && spin9 == 5) {
            WinOrLose = 'You won the Mega Jackpot! 🎉'
            winAmount = amount * 10
        } 
        // Check for Jackpot (middle row matches)
        else if (spin4 == 1 && spin5 == 1 && spin6 == 1 || 
                 spin4 == 2 && spin5 == 2 && spin6 == 2 || 
                 spin4 == 3 && spin5 == 3 && spin6 == 3 || 
                 spin4 == 4 && spin5 == 4 && spin6 == 4 || 
                 spin4 == 5 && spin5 == 5 && spin6 == 5) {
            WinOrLose = 'You won the Jackpot! 🎊'
            winAmount = amount * 5
        } 
        // Check for regular win (top row matches)
        else if (spin1 == 1 && spin2 == 1 && spin3 == 1 || 
                 spin1 == 2 && spin2 == 2 && spin3 == 2 || 
                 spin1 == 3 && spin2 == 3 && spin3 == 3 || 
                 spin1 == 4 && spin2 == 4 && spin3 == 4 || 
                 spin1 == 5 && spin2 == 5 && spin3 == 5) {
            WinOrLose = 'You won this round! 🎁'
            winAmount = amount * 2
        } 
        // Check for bottom row win
        else if (spin7 == 1 && spin8 == 1 && spin9 == 1 || 
                 spin7 == 2 && spin8 == 2 && spin9 == 2 || 
                 spin7 == 3 && spin8 == 3 && spin9 == 3 || 
                 spin7 == 4 && spin8 == 4 && spin9 == 4 || 
                 spin7 == 5 && spin8 == 5 && spin9 == 5) {
            WinOrLose = 'You won this round! 🎁'
            winAmount = amount * 2
        } 
        else {
            WinOrLose = 'You lost this round! 😢'
            winAmount = 0
        }

        if (winAmount > 0) {
            global.db.data.users[m.sender].money += winAmount
        }

        let finalMoney = global.db.data.users[m.sender].money

        await m.ctx.telegram.editMessageText(
            m.chat,
            msg.message_id,
            undefined,
            `
*VIRTUAL SLOTS*

${spins1}|${spins2}|${spins3}
${spins4}|${spins5}|${spins6} <<==
${spins7}|${spins8}|${spins9}

💰 Bet: ${amount}
💵 Win: ${winAmount}
💳 Balance: ${finalMoney}

*${WinOrLose}*
`.trim(),
            { parse_mode: 'Markdown' }
        )

    } catch (e) {
        console.log(e)
        await m.reply('Error occurred while processing your bet.')
    }
}

handler.help = ['casino']
handler.tags = ['game']
handler.command = /^casino|bet$/i

module.exports = handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}