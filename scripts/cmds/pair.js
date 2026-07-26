const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "pair",
    author: "Azadx69x",
    version: "0.0.7",
    role: 0,
    category: "love",
    shortDescription: {
      en: "💘 Find your perfect match"
    },
    longDescription: {
      en: "Discover your love compatibility with group members"
    },
    guide: {
      en: "{p}pair"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const participants = threadInfo.participantIDs;
      
      const filteredParticipants = participants.filter(id => 
        id !== event.senderID && id !== api.getCurrentUserID()
      );
      
      if (filteredParticipants.length === 0) {
        return api.sendMessage("❌ No other members found to pair with!", event.threadID);
      }
      
      const randomIndex = Math.floor(Math.random() * filteredParticipants.length);
      const matchID = filteredParticipants[randomIndex];
      
      const senderInfo = await api.getUserInfo(event.senderID);
      const matchInfo = await api.getUserInfo(matchID);
      
      const senderName = senderInfo[event.senderID].name;
      const matchName = matchInfo[matchID].name;
      
      const lovePercent = Math.floor(Math.random() * 31) + 70;
      
      const [senderAvatar, matchAvatar] = await Promise.all([
        loadAvatar(event.senderID),
        loadAvatar(matchID)
      ]);
      
      const width = 1200;
      const height = 675;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      
      const mainGradient = ctx.createLinearGradient(0, 0, width, height);
      mainGradient.addColorStop(0, "#1a0b2e");
      mainGradient.addColorStop(0.3, "#451a6f");
      mainGradient.addColorStop(0.6, "#9c27b0");
      mainGradient.addColorStop(1, "#e91e63");
      
      ctx.fillStyle = mainGradient;
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 0.5;
        const opacity = Math.random() * 0.8 + 0.2;
        
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      
      const nebulaColors = [
        "rgba(156, 39, 176, 0.3)",
        "rgba(233, 30, 99, 0.25)",
        "rgba(103, 58, 183, 0.2)",
        "rgba(255, 64, 129, 0.15)"
      ];
      
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 200 + 100;
        const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
        
        const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        nebulaGradient.addColorStop(0, color);
        nebulaGradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = nebulaGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      const shapes = [];
      for (let i = 0; i < 8; i++) {
        const shape = {
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 60 + 20,
          rotation: Math.random() * Math.PI * 2,
          type: Math.floor(Math.random() * 3)
        };
        shapes.push(shape);
      }
      
      shapes.forEach(shape => {
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 2;
        
        if (shape.type === 0) {
          ctx.beginPath();
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(shape.size * 0.866, shape.size * 0.5);
          ctx.lineTo(-shape.size * 0.866, shape.size * 0.5);
          ctx.closePath();
        } else if (shape.type === 1) {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * shape.size;
            const y = Math.sin(angle) * shape.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(shape.size, 0);
          ctx.lineTo(0, shape.size);
          ctx.lineTo(-shape.size, 0);
          ctx.closePath();
        }
        
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
      
      
      const cardWidth = 1000;
      const cardHeight = 450;
      const cardX = (width - cardWidth) / 2;
      const cardY = (height - cardHeight) / 2;
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      
      ctx.filter = "blur(10px)";
      ctx.fillRect(cardX - 10, cardY - 10, cardWidth + 20, cardHeight + 20);
      ctx.filter = "none";
      
      roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 30);
      ctx.fill();
      ctx.stroke();
      
      ctx.strokeStyle = "rgba(233, 30, 99, 0.3)";
      ctx.lineWidth = 4;
      roundRect(ctx, cardX + 2, cardY + 2, cardWidth - 4, cardHeight - 4, 28);
      ctx.stroke();
      
      
      const leftX = cardX + 100;
      const leftY = cardY + 100;
      const profileSize = 180;
      
      const profileGradient = ctx.createLinearGradient(leftX, leftY, leftX + profileSize, leftY + profileSize);
      profileGradient.addColorStop(0, "#e91e63");
      profileGradient.addColorStop(1, "#9c27b0");
      
      ctx.strokeStyle = profileGradient;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(leftX + profileSize/2, leftY + profileSize/2, profileSize/2 + 3, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(leftX + profileSize/2, leftY + profileSize/2, profileSize/2, 0, Math.PI * 2);
      ctx.clip();
      
      if (senderAvatar) {
        ctx.drawImage(senderAvatar, leftX, leftY, profileSize, profileSize);
      } else {
        ctx.fillStyle = "#e91e63";
        ctx.fillRect(leftX, leftY, profileSize, profileSize);
        ctx.fillStyle = "white";
        ctx.font = "bold 70px 'Arial'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(senderName.charAt(0).toUpperCase(), leftX + profileSize/2, leftY + profileSize/2);
      }
      ctx.restore();
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(truncateText(senderName, 20), leftX + profileSize/2, leftY + profileSize + 50);
      
      const rightX = cardX + cardWidth - 100 - profileSize;
      const rightY = cardY + 100;
      
      const profileGradient2 = ctx.createLinearGradient(rightX, rightY, rightX + profileSize, rightY + profileSize);
      profileGradient2.addColorStop(0, "#9c27b0");
      profileGradient2.addColorStop(1, "#673ab7");
      
      ctx.strokeStyle = profileGradient2;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(rightX + profileSize/2, rightY + profileSize/2, profileSize/2 + 3, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(rightX + profileSize/2, rightY + profileSize/2, profileSize/2, 0, Math.PI * 2);
      ctx.clip();
      
      if (matchAvatar) {
        ctx.drawImage(matchAvatar, rightX, rightY, profileSize, profileSize);
      } else {
        ctx.fillStyle = "#9c27b0";
        ctx.fillRect(rightX, rightY, profileSize, profileSize);
        ctx.fillStyle = "white";
        ctx.font = "bold 70px 'Arial'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(matchName.charAt(0).toUpperCase(), rightX + profileSize/2, rightY + profileSize/2);
      }
      ctx.restore();
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(truncateText(matchName, 20), rightX + profileSize/2, rightY + profileSize + 50);
      
      
      const centerX = width / 2;
      const centerY = cardY + 190;
      
      ctx.strokeStyle = "#e91e63";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#e91e63";
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.moveTo(leftX + profileSize + 30, centerY);
      ctx.bezierCurveTo(
        leftX + profileSize + 100, centerY - 50,
        rightX - 100, centerY - 50,
        rightX - 30, centerY
      );
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      
      for (let i = 0; i < 5; i++) {
        const t = i / 4;
        const x = bezierPoint(leftX + profileSize + 30, leftX + profileSize + 100, rightX - 100, rightX - 30, t);
        const y = bezierPoint(centerY, centerY - 50, centerY - 50, centerY, t);
        
        ctx.fillStyle = i % 2 === 0 ? "#e91e63" : "#9c27b0";
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowColor = i % 2 === 0 ? "#e91e63" : "#9c27b0";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      
      const percentX = centerX;
      const percentY = cardY + cardHeight - 120;
      const percentSize = 120;
      
      const percentGradient = ctx.createLinearGradient(
        percentX - percentSize/2, percentY - percentSize/2,
        percentX + percentSize/2, percentY + percentSize/2
      );
      percentGradient.addColorStop(0, "#e91e63");
      percentGradient.addColorStop(1, "#673ab7");
      
      ctx.strokeStyle = percentGradient;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(percentX, percentY, percentSize/2 + 5, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.arc(percentX, percentY, percentSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${lovePercent}%`, percentX, percentY);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("MATCH", percentX, percentY + 100);
      
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px 'Montserrat', 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PERFECT MATCH", centerX, cardY + 50);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "22px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("Two hearts, one connection", centerX, cardY + 85);
      
      const imagePath = path.join(__dirname, "pair_match.png");
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imagePath, buffer);
      
      const message = `🌸 𝗠𝗮𝘁𝗰𝗵𝗺𝗮𝗸𝗶𝗻𝗴 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 🌸\n\n` +
                     `💝 ${senderName}\n` +
                     `💙 ${matchName}\n\n` +
                     `😘 ${lovePercent}%`;
      
      await api.sendMessage({
        body: message,
        attachment: fs.createReadStream(imagePath)
      }, event.threadID);
      
      fs.unlinkSync(imagePath);
      
    } catch (error) {
      console.error("Pair command error:", error);
      api.sendMessage("❌ An error occurred.", event.threadID);
    }
  }
};

async function loadAvatar(uid) {
    try {
        let imageBuffer;
        const fbUrls = [
            `https://graph.facebook.com/${uid}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            `https://graph.facebook.com/${uid}/picture?width=500&height=500`,
            `https://graph.facebook.com/${uid}/picture?type=large`,
            `https://graph.facebook.com/${uid}/picture`
        ];

        for (const url of fbUrls) {
            try {
                const response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'image/*',
                        'Referer': 'https://www.facebook.com/'
                    }
                });
                if (response.status === 200 && response.data) {
                    imageBuffer = Buffer.from(response.data);
                    break;
                }
            } catch (err) { 
                continue; 
            }
        }

        if (imageBuffer) {
            return await loadImage(imageBuffer);
        }
    } catch (err) {
        console.log("Avatar load failed for UID:", uid, err.message);
    }

    return null;
}

function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
}

function bezierPoint(p0, p1, p2, p3, t) {
    const c = 1 - t;
    return c*c*c*p0 + 3*c*c*t*p1 + 3*c*t*t*p2 + t*t*t*p3;
    }
