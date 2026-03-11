const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    version: "3.0",
    author: "〲MAMUNツ࿐ T.T　o.O",
    countDown: 5,
    role: 0,
    shortDescription: "Pro uptime status",
    longDescription: "Show advanced bot uptime",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {

    const uptime = process.uptime();
    const d = Math.floor(uptime / (3600 * 24));
    const h = Math.floor((uptime % (3600 * 24)) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const start = Date.now();

    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);

    const ping = Date.now() - start;

    const msg = `
╔══❀𝙋𝙊𝙊𝙆𝙄𝙀 ᥫ❀══╗

🤖 Bot:  ♡┋ 𝙋𝙊𝙊𝙆𝙄𝙀 ᥫ᭡🎀🙂
👑 Owner: 〲MAMUNツ࿐ T.T　o.O

⏰ Uptime: ${d}d ${h}h ${m}m ${s}s
⚡ Ping: ${ping} ms

💻 CPU: ${os.cpus()[0].model}
💾 RAM: ${freeMem}GB / ${totalMem}GB
📡 Platform: ${os.platform()}

🟢 Status: Running 24/7

╚══❀🌼❀══╝
`;

    message.reply(msg);
  },

  onChat: async function ({ event, message }) {
    if (event.body && event.body.toLowerCase() === "uptime") {
      const uptime = process.uptime();
      const h = Math.floor(uptime / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);

      message.reply(`⏰ Bot Uptime: ${h}h ${m}m ${s}s`);
    }
  }
};
