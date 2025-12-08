let handler = async (m, { conn = bot, command, args, usedPrefix }) => {
  let user = global.db.data.users[m.sender]
  
  if (!user) {
    return m.reply('❌ Data user tidak ditemukan!')
  }

  const today = new Date().getDay()
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const dayName = days[today]
  
  const discountDay = Math.floor(Math.random() * 7)
  const isDiscount = today === discountDay
  const discountPercent = isDiscount ? acak(30, 50) : 0

  let pets = {
    griffin: {
      name: 'Griffin',
      emoji: '🦚',
      basePrice: acak(80000000, 100000000),
      description: 'Makhluk legendaris setengah elang setengah singa'
    },
    centaur: {
      name: 'Centaur',
      emoji: '🐴',
      basePrice: acak(80000000, 100000000),
      description: 'Makhluk mitologi setengah manusia setengah kuda'
    }
  }

  Object.keys(pets).forEach(key => {
    pets[key].price = isDiscount 
      ? Math.floor(pets[key].basePrice * (1 - discountPercent / 100))
      : pets[key].basePrice
  })

  if (!args[0]) {
    let message = `*🏪 PET SHOP*\n📅 Hari: ${dayName}\n\n`
    
    if (isDiscount) {
      message += `🎉 *DISKON ${discountPercent}% HARI INI!* 🎉\n\n`
    }
    
    message += `Pilih pet yang ingin kamu beli:\n\n`
    message += `1. ${pets.griffin.emoji} *Griffin*\n   ${pets.griffin.description}\n`
    
    if (isDiscount) {
      message += `   ~~Rp. ${pets.griffin.basePrice.toLocaleString()}~~\n`
      message += `   Harga: Rp. ${pets.griffin.price.toLocaleString()} 💥\n\n`
    } else {
      message += `   Harga: Rp. ${pets.griffin.price.toLocaleString()}\n\n`
    }
    
    message += `2. ${pets.centaur.emoji} *Centaur*\n   ${pets.centaur.description}\n`
    
    if (isDiscount) {
      message += `   ~~Rp. ${pets.centaur.basePrice.toLocaleString()}~~\n`
      message += `   Harga: Rp. ${pets.centaur.price.toLocaleString()} 💥\n\n`
    } else {
      message += `   Harga: Rp. ${pets.centaur.price.toLocaleString()}\n\n`
    }
    
    message += `💰 Uang kamu: Rp. ${user.money.toLocaleString()}\n\n`
    message += `Cara beli: ${usedPrefix + command} <griffin/centaur>\nContoh: ${usedPrefix + command} griffin`
    
    return m.reply(message)
  }

  let petType = args[0].toLowerCase()

  if (!pets[petType]) {
    return m.reply('❌ Pet tidak ditemukan! Pilih: griffin atau centaur')
  }

  let pet = pets[petType]

  if (user.money < pet.price) {
    return m.reply(`❌ Uang kamu tidak cukup!\n\nHarga ${pet.emoji} ${pet.name}: Rp. ${pet.price.toLocaleString()}\nUang kamu: Rp. ${user.money.toLocaleString()}\nKurang: Rp. ${(pet.price - user.money).toLocaleString()}`)
  }

  user[petType] = user[petType] || 0
  user[petType] += 1
  user.money -= pet.price

  let successMessage = `✅ *PEMBELIAN BERHASIL!*\n\n`
  successMessage += `Kamu berhasil membeli ${pet.emoji} *${pet.name}*!\n\n`
  
  if (isDiscount) {
    successMessage += `🎉 Kamu hemat Rp. ${(pet.basePrice - pet.price).toLocaleString()} dengan diskon ${discountPercent}%!\n\n`
  }
  
  successMessage += `${pet.emoji} ${pet.name} kamu sekarang: ${user[petType]}\n`
  successMessage += `💰 Sisa uang: Rp. ${user.money.toLocaleString()}\n\n`
  successMessage += `Gunakan ${usedPrefix}fight${petType} untuk bertarung!`

  m.reply(successMessage)
}

handler.help = ['buypet']
handler.tags = ['game']
handler.command = /^(buypet|belipet)$/i

module.exports = handler

function acak(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}