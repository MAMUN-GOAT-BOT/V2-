const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const cache = new Map();

// ensure cache folder
fs.ensureDirSync(path.join(__dirname, "cache"));

module.exports = {
  config: {
    name: "resend",
    version: "4.1",
    author: "〲MAMUNツ࿐ T.T　o.O",
    role: 0,
    category: "events"
  },

  // 🔧 REQUIRED (empty হলেও থাকতে হবে)
  onStart: async () => {},

  onChat: async ({ api, event, usersData }) => {

    // Save message
    if (event.type === "message" || event.type === "message_reply") {
      cache.set(event.messageID, {
        body: event.body,
        senderID: event.senderID,
        attachments: event.attachments
      });
    }

    // Detect unsend
    if (event.type === "message_unsend") {
      const msg = cache.get(event.messageID);
      if (!msg) return;

      let name = "Unknown User";
      try {
        const user = await usersData.get(msg.senderID);
        name = user.name;
      } catch (e) {}

      let text = `😏 ভাবছস ডিলিট দিলে বাঁচবি?

আমি থাকতে তোর msg গায়েব হবে না! ${name}


 ${msg.body || "No text"}`;

      // Attachment handle
      if (msg.attachments && msg.attachments.length > 0) {
        const streams = [];

        for (let file of msg.attachments) {
          try {
            const filePath = path.join(__dirname, "cache", file.filename || Date.now());

            const res = await axios.get(file.url, { responseType: "arraybuffer" });
            fs.writeFileSync(filePath, Buffer.from(res.data));

            streams.push(fs.createReadStream(filePath));
          } catch (e) {}
        }

        return api.sendMessage(
          { body: text, attachment: streams },
          event.threadID,
          () => {
            streams.forEach(s => {
              try { fs.unlinkSync(s.path); } catch {}
            });
          }
        );
      }

      api.sendMessage(text, event.threadID);
    }
  }
};
