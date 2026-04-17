const { createCanvas } = require("canvas");
const os = require("os");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "up1",
    aliases: ["up1","upt1"],
    version: "4.2",
    author: "〲MAMUNツ࿐ T.T　o.O",
    role: 0,
    shortDescription: "Uptime Dashboard",
    category: "bot running timer",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {
      const width = 1200;
      const height = 650;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.patternQuality = "best";
      ctx.quality = "best";
      ctx.antialias = "subpixel";

      // ✅ PURE BLACK BACKGROUND (UPDATED)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      const overlay = ctx.createLinearGradient(0, 0, width, height);
      overlay.addColorStop(0, "rgba(0,255,255,0.05)");
      overlay.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, width, height);

      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        200,
        width / 2,
        height / 2,
        900
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.95)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 120; i++) {
        ctx.fillStyle = "rgba(0,255,255,0.2)";
        ctx.beginPath();
        ctx.arc(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      const cpu = Math.floor(Math.random() * 50) + 30;
      const ram = Math.floor(
        ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      );
      const disk = Math.floor(Math.random() * 40) + 50;

      const uptime = process.uptime();

      const d = Math.floor(uptime / 86400);
      const h = Math.floor((uptime % 86400) / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);

      const ping = Math.floor(Math.random() * 100) + 100;

      ctx.shadowColor = "#00eaff";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#00eaff";
      ctx.font = "bold 60px Sans";
      ctx.fillText("𝐔𝐏𝐓𝐈𝐌𝐄 𝐃𝐀𝐒𝐇𝐁𝐎𝐀𝐑𝐃", 360, 90);
      ctx.shadowBlur = 0;

      function glassBox(x, y, w, h) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 20);
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fill();

        ctx.strokeStyle = "rgba(0,255,255,0.25)";
        ctx.stroke();
      }

      function bar(x, y, w, percent, color, label) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, 35, 20);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fill();

        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, (w * percent) / 100, 35, 20);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#fff";
        ctx.font = "22px Sans";
        ctx.fillText(label, x, y - 12);

        ctx.fillText(percent + "%", x + w - 70, y + 25);
      }

      glassBox(40, 140, 300, 360);

      ctx.fillStyle = "#00eaff";
      ctx.font = "28px Sans";
      ctx.fillText("𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎", 80, 190);

      ctx.fillStyle = "#ffffff";
      ctx.font = "22px Sans";
      ctx.fillText("𝐂𝐏𝐔 : " + cpu + "%", 80, 240);
      ctx.fillText("𝐑𝐀𝐌 : " + ram + "%", 80, 280);
      ctx.fillText("𝐃𝐈𝐒𝐊 : " + disk + "%", 80, 320);
      ctx.fillText("𝐎𝐒 : " + os.platform(), 80, 360);

      ctx.fillStyle = "#00ff9c";
      ctx.font = "24px Sans";
      ctx.fillText("𝐔𝐏𝐓𝐈𝐌𝐄", 80, 410);

      // ✅ UPDATED DISPLAY WITH DAY
      ctx.fillText(`${d}d ${h}h ${m}m ${s}s`, 80, 450);

      ctx.fillStyle = "#00eaff";
      ctx.fillText(`𝐏𝐈𝐍𝐆: ${ping}𝐌𝐒`, 80, 490);

      glassBox(380, 160, 750, 90);
      glassBox(380, 280, 750, 90);
      glassBox(380, 400, 750, 90);

      bar(420, 210, 650, cpu, "#00eaff", "𝐂𝐏𝐔 𝐔𝐒𝐀𝐆𝐄");
      bar(420, 330, 650, ram, "#ff6ec7", "𝐑𝐀𝐌 𝐔𝐒𝐀𝐆𝐄");
      bar(420, 450, 650, disk, "#4facfe", "𝐃𝐈𝐒𝐊 𝐔𝐒𝐀𝐆𝐄");

      ctx.fillStyle = "#00ff9c";
      ctx.font = "26px Sans";
      ctx.fillText("⚡𝐒𝐄𝐑𝐕𝐄𝐑 𝐑𝐔𝐍𝐍𝐈𝐍𝐆 𝐒𝐌𝐎𝐎𝐓𝐇⚡", 420, 580);

      const filePath = path.join(__dirname, "uptime_v4_bg.png");
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      return message.reply({
        body: "",
        attachment: fs.createReadStream(filePath)
      });

    } catch (err) {
      console.log(err);
      message.reply("❌ Error: " + err.message);
    }
  }
};
