const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Photo360 = require("abir-photo360-apis");

module.exports = {
  config: {
    name: "photo",
    version: "2.0.0",
    author: "〲MAMUNツ࿐",
    countDown: 5,
    role: 0,
    shortDescription: "Ephoto360 text maker",
    longDescription: "Generate stylish text effects using Ephoto360",
    category: "textmaker",
    guide: {
      en: "{pn} <template id> <text>"
    }
  },

  onStart: async function ({ api, event, args }) {

    if (args.length < 2) {
      return api.sendMessage(
`╭─❍
│ ✨ PHOTO360 STYLE MAKER
├─────────────
│ Usage:
│ photo <id> <text>
│
│ Example:
│ photo 1 Mamun
╰─────────────`,
        event.threadID,
        event.messageID
      );
    }

    const templateID = args[0];
    const text = args.slice(1).join(" ");

    const templates = {
      "1": "https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html",
      "2": "https://en.ephoto360.com/create-realistic-cloud-text-effect-606.html",
      "3": "https://en.ephoto360.com/light-glow-text-effect-369.html",
      "4": "https://en.ephoto360.com/glitch-text-effect-online-345.html",
      "5": "https://en.ephoto360.com/3d-metal-text-effect-600.html",
      "6": "https://en.ephoto360.com/foggy-rainy-text-effect-75.html",
      "7": "https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html",
      "8": "https://en.ephoto360.com/diamond-text-95.html",
      "9": "https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html",
      "10": "https://en.ephoto360.com/create-broken-glass-text-effect-online-698.html",
      "11": "https://en.ephoto360.com/create-multicolored-signature-attachment-arrow-effect-714.html",
      "12": "https://en.ephoto360.com/create-a-graffiti-text-effect-on-the-wall-online-665.html",
      "13": "https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html",
      "14": "https://en.ephoto360.com/creating-text-effects-night-lend-for-word-effect-147.htm",
      "15": "https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html",
      "16": "https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html",
      "17": "https://en.ephoto360.com/dark-green-typography-online-359.html",
      "18": "https://en.ephoto360.com/stars-night-online-1-85.html",
      "19": "https://en.ephoto360.com/realistic-3d-sand-text-effect-online-580.html",
      "20": "https://en.ephoto360.com/create-a-summery-sand-writing-text-effect-577.html",
      "21": "https://en.ephoto360.com/text-firework-effect-356.html",
      "22": "https://en.ephoto360.com/ligatures-effects-from-leaves-146.html",
      "23": "https://en.ephoto360.com/write-letters-on-the-leaves-248.html",
      "24": "https://en.ephoto360.com/graffiti-color-199.html",
      "25": "https://en.ephoto360.com/caper-cut-effect-184.html"
    };

    if (!templates[templateID]) {
      return api.sendMessage(
`❌ Invalid template ID!

✅ Available IDs:
1 - 25

Example:
ephoto 5 Mamun`,
        event.threadID,
        event.messageID
      );
    }

    const cacheFolder = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheFolder)) {
      fs.mkdirSync(cacheFolder, { recursive: true });
    }

    const filePath = path.join(cacheFolder, "photo.png");

    try {

      await api.sendMessage(
        "⏳ | Creating your stylish image...",
        event.threadID
      );

      const photo = new Photo360(templates[templateID]);

      photo.setName(text);

      const data = await photo.execute();

      const img = await axios.get(data.imageUrl, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, img.data);

      return api.sendMessage(
        {
          body: `✨ Successfully created image for: ${text}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        },
        event.messageID
      );

    } catch (error) {

      console.log(error);

      return api.sendMessage(
        `❌ Failed to generate image!\n\n${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
