const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "mamun",
    version: "1.0.3",
    author: "〲MAMUNツ࿐ T.T　o.O",
    role: 0,
    shortDescription: "Mamun Profile (No Prefix)",
    category: "Information",
    guide: {
      en: "type mamun"
    }
  },

  // 👇 এটা না থাকলে error দিবে
  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const msg = event.body?.toLowerCase();
    if (!msg || msg !== "mamun") return;

    const profileText = 
`╔════════════════════════════════════════╗
║ 🌌✨ 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗖𝗔𝗥𝗗 ✨🌌 ║
╠════════════════════════════════════════╣
║ 🌟 Name       : 〲MAMUNツ࿐ T.T　o.O
║ 🎂 Age        : 20
║ 🆔 FF ID      : 3246615019
║ 💌 Status     : Mingle
║ 📍 Location   : Khulna, Bangladesh
║ 🎮 Hobbies    : Gaming 🎮 | Coding 💻 | Music 🎧
╠════════════════════════════════════════╣
║ 🔗 Social Links:
║ • Facebook  : https://www.facebook.com/profile.php?id=61587384024459
║ • WhatsApp  : 01830981279
║ • TikTok    : tm.mamun35
╠════════════════════════════════════════╣
║ 🎯 Game      : Free Fire 🔫
╚════════════════════════════════════════╝`;

    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, "mamun.jpg");

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    const imgLink = "https://i.imgur.com/P0SDyl9.jpeg";

    const send = () => {
      api.sendMessage(
        {
          body: profileText,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath),
        event.messageID
      );
    };

    request(encodeURI(imgLink))
      .pipe(fs.createWriteStream(imgPath))
      .on("close", send)
      .on("error", () => {
        api.sendMessage("❌ Image load failed!", event.threadID, event.messageID);
      });
  
