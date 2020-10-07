const Discord = require("discord.js");
const client = new Discord.Client();
const ayarlar = require("./ayarlar.json");
const chalk = require("chalk");
const moment = require("moment");
var Jimp = require("jimp");
const { Client, Util } = require("discord.js");
const weather = require("weather-js");
const fs = require("fs");
const db = require("quick.db");
const http = require("http");
const express = require("express");
require("./util/eventLoader")(client);
const path = require("path");
const request = require("request");
const snekfetch = require("snekfetch");
const queue = new Map();
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");

const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping tamamdır.");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

var prefix = ayarlar.prefix;

const log = message => {
  console.log(`${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on("warn", e => {
  console.log(chalk.bgYellow(e.replace(regToken, "that was redacted")));
});

client.on("error", e => {
  console.log(chalk.bgRed(e.replace(regToken, "that was redacted")));
});

client.login(ayarlar.token);
//afk sistemi 
client.on("message", async message => {
  const ms = require("parse-ms");

  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.content.includes(`${prefix}afk`)) return;

  if (await db.fetch(`afk_${message.author.id}`)) {
    let süre = await db.fetch(`afk_süre_${message.author.id}`);
    let zaman = ms(Date.now() - süre);
    db.delete(`afk_${message.author.id}`);
    db.delete(`afk_süre_${message.author.id}`);
    message.member.setNickname(db.fetch(`afktag_${message.author.id}`))
    if(db.fetch(`dil_${message.guild.id}`) != "EN") {
    const afk_cikis = new Discord.RichEmbed()
      .setColor("ff0000")
      .setDescription(`<@${message.author.id}>\`${zaman.hours}\` **saat**  \`${zaman.minutes}\` **dakika** \`${zaman.seconds}\` **saniye** , **AFK Modundaydın!**`)
    message.channel.send(afk_cikis)}
  if(db.fetch(`dil_${message.guild.id}`) === "EN") {
    const afk_cikis = new Discord.RichEmbed()
      .setColor("ff0000")
      .setDescription(`<@${message.author.id}>\`${zaman.hours}\` **hours**  \`${zaman.minutes}\` **minutes** \`${zaman.seconds}\` **second(s)** , **You were in AFK Mode!**`)
    message.channel.send(afk_cikis)}
  }

  var kullanıcı = message.mentions.users.first();
  if (!kullanıcı) return;
  var sebep = await db.fetch(`afk_${kullanıcı.id}`);

  if (sebep) {
    let süre = await db.fetch(`afk_süre_${kullanıcı.id}`);
    let zaman = ms(Date.now() - süre);
    if(db.fetch(`dil_${message.guild.id}`) != "EN") {
    const afk_uyarı = new Discord.RichEmbed()
      .setColor("ff0000")
      .setDescription(`<@${kullanıcı.id}> adlı kullanıcı \`${sebep}\` sebebiyle; \`${zaman.hours}\` **saat**  \`${zaman.minutes}\` **dakika** \`${zaman.seconds}\` **saniyedir AFK!**`)
    message.reply(afk_uyarı)}
        if(db.fetch(`dil_${message.guild.id}`) === "EN") {
    const afk_uyarı = new Discord.RichEmbed()
      .setColor("ff0000")
      .setDescription(`<@${kullanıcı.id}> user \`${sebep}\` because; \`${zaman.hours}\` **hours**  \`${zaman.minutes}\` **minutes** \`${zaman.seconds}\` **second(s) AFK!**`)
    message.reply(afk_uyarı)}
  }
});
client.on('ready', ()=>{
client.channels.get('763357423468806144').join()
})