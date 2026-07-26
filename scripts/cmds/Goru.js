const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "goru",
    version: "2.3",
    author: "ARIJIT × Ere'rious", // Don't change author name
    countDown: 5,
    role: 0,
    usePrefix: true,
    shortDescription: "Expose someone as a Goru!",
    longDescription: "Puts the tagged/replied user's face on a cow's body (fun meme)",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone to make them a cow 😂",
    },
  },

  onStart: async function ({ event, message, api, usersData }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("❗ Tag or reply to someone to turn them into a goru!");
    }

    if (targetID === event.senderID) {
      return message.reply("❗ Bro, why would you cow yourself?");
    }

    try {
      const waitMsg = await message.reply("⌛️ Wait kor...");

      const fetchAvatar = async (uid) => {
        try {
          const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
          const finalUrl = avatarUrl.includes("?")
            ? `${avatarUrl}&t=${Date.now()}`
            : `${avatarUrl}?t=${Date.now()}`;

          const response = await axios.get(finalUrl, {
            responseType: "arraybuffer",
            timeout: 15000,
            headers: { "User-Agent": "Mozilla/5.0" },
          });

          if (!response.data || response.data.length < 1024) {
            throw new Error("Invalid image data");
          }

          return Buffer.from(response.data);
        } catch (error) {
          console.error("Avatar fetch error:", error.message);
          try {
            const fallbackUrl = await usersData.getAvatarUrl(uid);
            if (fallbackUrl) {
              const fallbackRes = await axios.get(fallbackUrl, {
                responseType: "arraybuffer",
              });
              return Buffer.from(fallbackRes.data);
            }
          } catch {}
          throw new Error("Could not fetch profile picture");
        }
      };

      const cacheDir = path.join(__dirname, "goru_cache");
      await fs.ensureDir(cacheDir);
      const bgPath = path.join(cacheDir, "cow_bg.jpg");

      let bgImage;
      if (fs.existsSync(bgPath)) {
        const bgBuffer = await fs.readFile(bgPath);
        bgImage = await loadImage(bgBuffer);
      } else {
        const cowImgUrl = "https://files.catbox.moe/ecebko.jpg";
        const bgResponse = await axios.get(cowImgUrl, {
          responseType: "arraybuffer",
          timeout: 20000,
        });
        await fs.writeFile(bgPath, Buffer.from(bgResponse.data));
        bgImage = await loadImage(Buffer.from(bgResponse.data));
      }

      const avatarBuffer = await fetchAvatar(targetID);
      const avatarImage = await loadImage(avatarBuffer);

      const canvas = createCanvas(bgImage.width, bgImage.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bgImage, 0, 0);

      const avatarSize = 135;
      const headCenterX = 80 + avatarSize / 2;
      const headCenterY = 60 + avatarSize / 2;

      const avatarX = headCenterX - avatarSize / 2;
      const avatarY = headCenterY - avatarSize / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY, avatarSize / 2 + 1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "left";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 5;
      ctx.fillText("Kire chdna", 40, 50);

      const outputPath = path.join(
        cacheDir,
        `goru_${targetID}_${Date.now()}.png`
      );
      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(outputPath, buffer);

      const userInfo = await api.getUserInfo(targetID);
      const tagName = userInfo[targetID]?.name || "Someone";

      await message.reply({
        body: `🤣😹\n@${tagName} একদম আসল গরু হয়েছে বিদেশী গরু! 🐮✨`,
        mentions: [{ tag: tagName, id: targetID }],
        attachment: fs.createReadStream(outputPath),
      });

      if (waitMsg && waitMsg.messageID) {
        api.unsendMessage(waitMsg.messageID);
      }

      setTimeout(() => fs.unlink(outputPath).catch(() => {}), 5000);
    } catch (err) {
      console.error("❌ Goru Command Error:", err);
      return message.reply("⚠️ something wrong, trying again 🙂");
    }
  },
};
