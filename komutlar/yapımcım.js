const Discord = require('discord.js');
const db = require('quick.db');
//Dcs Ekibi
exports.run = async(client, message, args) => { 
const sahip = '✗𝑯𝒐𝒍𝒎𝒆𝒔#9999'

message.channel.send("<@756097856313622539>`" + sahip + "`")
}
exports.conf = {
  enabled: true,  
  guildOnly: false, 
  aliases: ['yapımcı'], 
  permLevel: 0
};
//Dcs Ekibi
exports.help = {
 name: 'sahip'
};