module.exports = {
  config: {
    name: "mamun",
    version: "1.0.4",
    author: "〲MAMUNツ࿐ T.T　o.O",
    role: 0,
    shortDescription: "Mamun Profile (No Image)",
    category: "Information",
    guide: {
      en: "type mamun"
    }
  },

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
║ 💌 Status     : single
║ 📍 Location   : Khulna, Bangladesh
║ 🎮 Hobbies    : Gaming 🎮 | Coding 💻 | Music 🎧
╠════════════════════════════════════════╣
║ 🔗 Social Links:
║ • Facebook  : https://www.facebook.com/profile.php?id=61589546816594
║ • WhatsApp  : 01830981279
║ • TikTok    : ma.m.un97
╠════════════════════════════════════════╣
║ 🎯 Game      : Free Fire 🔫
╚════════════════════════════════════════╝`;

    api.sendMessage(profileText, event.threadID, event.messageID);
  }
};
