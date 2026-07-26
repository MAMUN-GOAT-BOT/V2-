const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "hijla",
    version: "1.1.7",
    author: "Milon Pro",
    countDown: 5,
    role: 0,
    category: "fun",
    description: "Create a funny hijla image with an oval/face-shaped pfp.",
    guide: "{pn} @mention or reply"
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN
 * 🔗 FACEBOOK: https://www.facebook.com/share/17uGq8qVZ9/
 * 📞 WHATSAPP: +880 1912603270
 * 📍 LOCATION: NARAYANGANJ, BANGLADESH
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onStart: async function ({ api, event, message }) {
    const { threadID, messageID, mentions, messageReply } = event;

    const cacheDir = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      return message.reply("আরে মামা, কারে হিজলা সাজাবি তারে তো মেনশন দিলি না! 💃");
    }

    try {
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "User";

      const imgLink = "https://i.imgur.com/taT6Gb7.jpeg"; 
      const filePath = path.join(cacheDir, `hijla_milon_${Date.now()}.png`);

      message.reply(`দাঁড়া মামা, ওরে হিজলা সাজাইয়া দিচ্ছি... ⏳💄`);

      const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const targetPfpUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${accessToken}`;

      const [baseImage, targetPfp] = await Promise.all([
        loadImage(imgLink),
        loadImage(targetPfpUrl)
      ]);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // --- PFP Position & Face Shape (Oval) ---
      const pfpWidth = 90;  
      const pfpHeight = 110; 
      const x = 148; 
      const y = 82; 

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x + pfpWidth / 2, y + pfpHeight / 2, pfpWidth / 2, pfpHeight / 2, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(targetPfp, x, y, pfpWidth, pfpHeight); 
      ctx.restore();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      const finalCaption = `ঐ দেখ মামা, আমাদের নতুন হিজলা! 💃\n\nনাম: ${userName} 😂\nমামা হাততালি দে সবাই! 👏`;

      return api.sendMessage({
        body: finalCaption,
        mentions: [{ tag: userName, id: targetID }],
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);

    } catch (e) {
      console.error("HIJLA ERROR:", e);
      return message.reply("মামা হিজলাটা পালাইছে! আবার ট্রাই কর। ❌");
    }
  }
};
