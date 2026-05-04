const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "chipay",
    aliases: ["corner", "muri"],
    version: "2.4.9",
    author: "Milon",
    countDown: 5,
    role: 0,
    shortDescription: "Fun command with image and stylish caption",
    category: "fun",
    guide: { en: "{pn} @mention or reply" }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      // User not mentioned warning (Bangla)
      return api.sendMessage("🤦‍♂️ | আরে ভাই, কাকে চিপায় নিবেন তারে তো মেনশন দেন নাই!", threadID, messageID);
    }

/* --- [ 🔐 INTERNAL_SECURE_METADATA ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN
 * 🔗 FACEBOOK: https://www.facebook.com/share/17uGq8qVZ9/
 * 📞 WHATSAPP: +880 1912603270
 * 📍 LOCATION: NARAYANGANJ, BD
 * --------------------------------------- */

    const imgPath = path.join(cacheDir, `chipay_${Date.now()}.png`);

    try {
      const userInfo = await api.getUserInfo(targetID);
      const targetName = userInfo[targetID]?.name || "User";

      // Preparation Message (Bangla)
      api.sendMessage("⏳ | একটু দাঁড়ান, চিপায় ঝালমুড়ি খাওয়ার ব্যাবস্থা করতেছি... 😋", threadID, messageID);

      const backgroundUrl = "https://i.imgur.com/PlmZXfJ.jpeg";
      const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662"; 
      const avtMentionUrl = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=${accessToken}`;
      const avtSenderUrl = `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=${accessToken}`;

      const [bgImg, avtLeft, avtRight] = await Promise.all([
        loadImage(backgroundUrl),
        loadImage(avtMentionUrl),
        loadImage(avtSenderUrl)
      ]);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // --- Draw Box and Name inside Image ---
      ctx.font = "bold 18px Arial"; 
      const textWidth = ctx.measureText(targetName).width;
      const textX = canvas.width - 100;
      const textY = canvas.height - 103;

      const padding = 10;
      const boxWidth = textWidth + padding * 2;
      const boxHeight = 28;
      const boxX = textX - boxWidth; 
      const boxY = textY - 20;

      // Draw Background Box
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; 
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      
      // Draw Box Border
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      // Draw Mention Name
      ctx.fillStyle = "#FFFFFF"; 
      ctx.textAlign = "right"; 
      const drawTextX = textX - padding;
      
      ctx.fillText(targetName, drawTextX, textY);

      const avatarSizeLeft = 110; 
      const avatarSizeUser = 95; 

      // --- Left Side (Target) ---
      const xLeft = 85, yLeft = 85; 
      ctx.save();
      ctx.beginPath();
      ctx.arc(xLeft + avatarSizeLeft / 2, yLeft + avatarSizeLeft / 2, avatarSizeLeft / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avtLeft, xLeft, yLeft, avatarSizeLeft, avatarSizeLeft);
      ctx.restore();

      // --- Right Side (Sender) ---
      const xRight = 350, yRight = 100; 
      ctx.save();
      ctx.beginPath();
      ctx.arc(xRight + avatarSizeUser / 2, yRight + avatarSizeUser / 2, avatarSizeUser / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avtRight, xRight, yRight, avatarSizeUser, avatarSizeUser);
      ctx.restore();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imgPath, buffer);

      // Final Output Caption (Bangla Style)
      const caption = `😾⎯͢⎯⃝⋆⃝চিঁপাঁয়ঁ আঁয়ঁ ঝাঁলঁমুঁড়িঁ বাঁনাঁয়ঁছিঁ🙈 ⋆⃝⋆⃝😹😒⋆🐰🍒\n\n${targetName} এ্ঁদি্ঁকে্ঁ আ্ঁসো্ঁ 💋💋`;

      return api.sendMessage({
        body: caption,
        mentions: [{ tag: targetName, id: targetID }],
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, messageID);

    } catch (error) {
      console.log("CHIPAY ERROR:", error);
      return api.sendMessage("❌ | Error! Failed to process image. Please try again.", threadID, messageID);
    }
  }
};
