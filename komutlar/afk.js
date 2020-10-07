const Discord = require("discord.js");
const db = require("quick.db")
const bot = new Discord.Client();
const a = require("../ayarlar.json");

module.exports.run = async (client, message, args) => {
var kullanıcı = message.author;
  var sebep = args.slice(0).join("  ");
if(!sebep) return message.channel.send(new Discord.RichEmbed()
.setTitle(`Uyarı | Warning!`)
.setDescription(`**[\`TR\`]**\nAFK Moduna Geçmek İçin Bir Sebep Belirtmelisin!\n**[\`EN\`]**\nYou must provide a reason to switch to AFK Mode!`))
  let dcs15 = new Discord.RichEmbed()
    .setTitle(`⚠ Uyarı! / Warning!`)
    .setTimestamp()
    .setFooter(client.user.username)
    .setThumbnail(message.author.avatarURL)
   .setDescription(`**[\`TR\`]**\nAFK Moduna Girmek İçin Onay Veriyor musun?\n**[\`EN\`]**\nDo you confirm entering AFK Mode?`)
    .setColor("RED");
  message.channel.send(dcs15).then(sunucu => {
    sunucu.react("✅").then(() => sunucu.react("❌"));

    let yesFilter = (reaction, user) =>
      reaction.emoji.name === "✅" && user.id === message.author.id;
    let noFilter = (reaction, user) =>
      reaction.emoji.name === "❌" && user.id === message.author.id;

    let yes = sunucu.createReactionCollector(yesFilter, { time: 0 });
    let no = sunucu.createReactionCollector(noFilter, { time: 0 });

    yes.on("collect", r => {
      message.member.setNickname(`[AFK] ${message.member.displayName}`)
      db.set(`afktag_${message.author.id}`, message.member.displayName)
      let dcs16 = new Discord.RichEmbed()
        .setTitle(`✅ İşlem Başarılı! / ✅ Successful!`)
        .setDescription(`**[\`TR\`]**\nAFK Moduna Girdiniz!\n**[\`EN\`]**\nYou Entered AFK Mode!`)
        .setColor("GREEN")
        .setThumbnail(client.user.avatarURL)
        .setTimestamp()
        .setThumbnail(message.guild.iconURL)
        .setFooter(message.guild.name);
      message.channel.send(dcs16).then(x => {
        x.delete(5000);
      });
      
    });
    db.set(`afk_${kullanıcı.id}`, sebep);
    db.set(`afk_süre_${kullanıcı.id}`, Date.now());
    no.on("collect", r => {
    db.delete(`afk_${kullanıcı.id}`, sebep);
    db.delete(`afk_süre_${kullanıcı.id}`, Date.now());
      message.channel.send(`İptal Edildi!`)
    });
  });
    };
module.exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

module.exports.help = {
  name: "afk"
};