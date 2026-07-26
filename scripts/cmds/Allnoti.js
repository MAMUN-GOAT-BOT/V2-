const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "allnoti",
    version: "3.0",
    author: "〲MAMUNツ࿐ T.T o.O",
    role: 2,
    shortDescription: "Owner Broadcast",
    longDescription: "Send notification with owner name",
    category: "admin",
    guide: "{pn} <message>"
  },

  onStart: async function ({ api, event, args }) {
    const msg = args.join(" ");
    if (!msg) return api.sendMessage("⚠️ Message dao!", event.threadID);

    let attachment = null;

    // Reply image support
    if (event.messageReply && event.messageReply.attachments.length > 0) {
      const url = event.messageReply.attachments[0].url;
      const filePath = path.join(__dirname, "cache", "owner.jpg");

      const res = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, res.data);

      attachment = fs.createReadStream(filePath);
    }

    const threads = await api.getThreadList(100, null, ["INBOX"]);

    let success = 0;
    let failed = 0;

    for (const thread of threads) {
      if (thread.isGroup) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));

          await api.sendMessage(
            {
              body: `🔔 𝙉𝙊𝙏𝙄𝙁𝙄𝘾𝘼𝙏𝙄𝙊𝙉\n━━━━━━━━━━━━━━━\n📢 From Owner: 〲MAMUNツ࿐ T.T o.O\n\n${msg}\n━━━━━━━━━━━━━━━`,
              attachment: attachment
            },
            thread.threadID
          );

          success++;
        } catch (e) {
          failed++;
        }
      }
    }

    api.sendMessage(
      `✅ Done Owner Broadcast\n✔️ Success: ${success}\n❌ Failed: ${failed}`,
      event.threadID
    );
  }
};
