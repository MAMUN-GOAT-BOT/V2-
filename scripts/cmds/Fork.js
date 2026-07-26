module.exports = {
 config: {
 name: "fork",
 version: "1.6",
 author: "〲MAMUNツ࿐",
 countDown: 2,
 role: 0,
 shortDescription: "Official GitHub Fork",
 category: "utils",
 guide: {
 en: "{pn} | fork"
 }
 },

 langs: {
 en: {
 current: `
 ✦━━━━━━━━━✦
👑 𝗢𝗙𝗙𝗜𝗖𝗜𝗔𝗟 𝗙𝗢𝗥𝗞 👑
✦━━━━━━━━━✦
👑 𝗢𝗪𝗡𝗘𝗥 ➜ 𝗠𝗔𝗠𝗨𝗡
🤖 𝗕𝗢𝗧 ➜ 𝗚𝗢𝗔𝗧 𝗕𝗢𝗧 𝗩𝟮
━━━━━━━━━━━
🌐 𝗢𝗙𝗙𝗜𝗖𝗜𝗔𝗟 𝗚𝗜𝗧𝗛𝗨𝗕
🔗 https://github.com/MAMUN-GOAT-BOT/V2-.git
━━━━━━━━━━━
🎥 𝗩𝗜𝗗𝗘𝗢 𝗧𝗨𝗧𝗢𝗥𝗜𝗔𝗟 📺 https://youtu.be/_Qb7Pq0Xavs?si=-MaOtPPnBPVSbIFX
━━━━━━━━━━
𝗠𝗔𝗠𝗨𝗡 𝗚𝗢𝗔𝗧 𝗕𝗢𝗧 𝗩𝟮
✦━━━━━━━━━✦
`
 }
 },

 onStart: async function ({ message, getLang }) {
 const link = "https://github.com/MAMUN-GOAT-BOT/V2-.git";
 return message.reply(getLang("current", link));
 },

 onChat: async function ({ message, event, getLang }) {
 const body = event.body?.trim().toLowerCase();

 if (body === "fork") {
 const link = "https://github.com/MAMUN-GOAT-BOT/V2-.git";
 return message.reply(getLang("current", link));
 }
 }
};
