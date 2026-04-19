const { createCanvas, registerFont, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const fontPath = path.join(__dirname, "fonts", "Kalpurush.ttf");
if (fs.existsSync(fontPath)) {
  registerFont(fontPath, { family: "Kalpurush" });
}

module.exports = {
  config: {
    name: "top",
    version: "3.5",
    author: "xalman",
    role: 0,
    shortDescription: { en: "Top Richest with Profile Pictures" },
    longDescription: { en: "Top 15 richest users with high-contrast text and profile pictures." },
    category: "group",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, usersData, message }) {
    const allUsers = await usersData.getAll();
    const topUsers = allUsers
      .sort((a, b) => (b.money || 0) - (a.money || 0))
      .slice(0, 15);

    const width = 900;
    const height = 1350;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
   
    function drawRoundedRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }

    function formatNumber(num) {
      if (num >= 1e15) return "Infinity";
      if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
      if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
      if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
      if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
      return num.toString();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#010014");
    gradient.addColorStop(0.5, "#0d0d5c");
    gradient.addColorStop(1, "#0081a7");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.shadowColor = "rgba(251, 197, 49, 0.5)";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#fbc531";
    ctx.font = 'bold 65px "Kalpurush", "Arial"';
    ctx.textAlign = "center";
    ctx.fillText("🏆 TOP RICHEST USERS 🏆", width / 2, 100);
    ctx.shadowBlur = 0; 

    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const yPos = 200 + i * 75;
     
      if (i === 0) ctx.fillStyle = "rgba(255, 215, 0, 0.2)"; 
      else if (i === 1) ctx.fillStyle = "rgba(192, 192, 192, 0.2)"; 
      else if (i === 2) ctx.fillStyle = "rgba(205, 127, 50, 0.2)"; 
      else ctx.fillStyle = "rgba(255, 255, 255, 0.1)";

      drawRoundedRect(50, yPos - 50, width - 100, 65, 12);

      let textXStart = 100;
      let nameXStart = 150;

      if (i < 3) {
        try {
          const avatarUrl = `https://graph.facebook.com/${user.userID}/picture?height=100&width=100&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
          const avatar = await loadImage(avatarUrl);
          
          ctx.save();
          ctx.beginPath();
          ctx.arc(130, yPos - 18, 27, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();    
          ctx.beginPath();
          ctx.arc(130, yPos - 18, 25, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(avatar, 105, yPos - 43, 50, 50);
          ctx.restore();
          
          nameXStart = 205;
          textXStart = 65;
        } catch (e) {}
      }

      const icon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 30px "Arial"';
      ctx.fillText(icon, textXStart, yPos - 10);
      ctx.shadowColor = "black";
      ctx.shadowBlur = 4;
      ctx.font = 'bold 32px "Kalpurush", "Arial"';
      ctx.fillStyle = "#ffffff";
      ctx.fillText((user.name || "Unknown").substring(0, 20), nameXStart, yPos - 10);
      ctx.shadowBlur = 2;
      ctx.textAlign = "right";
      ctx.fillStyle = "#00ff00"; 
      ctx.font = 'bold 30px "Arial"';
      ctx.fillText(`${formatNumber(user.money || 0)} ৳`, width - 85, yPos - 10);
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = '22px "Arial"';
    ctx.textAlign = "center";
    ctx.fillText("Powered by xalman •", width / 2, height - 40);

    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
    const imagePath = path.join(cachePath, `top_${event.senderID}.png`);
    fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));

    return message.reply({
      body: "🌟 TOP 15 BALANCE LIST🌟",
      attachment: fs.createReadStream(imagePath)
    }, () => { if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath); });
  }
};
