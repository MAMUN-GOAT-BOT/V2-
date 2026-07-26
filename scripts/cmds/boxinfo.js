const fs = require("fs");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "boxinfo",
    aliases: ["groupinfo"],
    version: "2.2.0",
    author: "Mᴏʜᴀᴍᴍᴀᴅ Aᴋᴀsʜ",
    role: 1,
    shortDescription: "Group info",
    category: "box chat",
    guide: {
      en: "groupinfo"
    }
  },

  onStart: async function ({ api, event }) {
    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, "groupinfo.png");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const info = await api.getThreadInfo(event.threadID);

    let male = 0, female = 0;
    for (const u of info.userInfo) {
      if (u.gender === "MALE") male++;
      else if (u.gender === "FEMALE") female++;
    }

    const text =
`── Gʀᴏᴜᴘ Iɴғᴏ ──
Nᴀᴍᴇ      : ${info.threadName || "No Name"}
Iᴅ        : ${info.threadID}
Eᴍᴏᴊɪ     : ${info.emoji || "N/A"}
Aᴘᴘʀᴏᴠᴀʟ  : ${info.approvalMode ? "ON" : "OFF"}

Mᴇᴍʙᴇʀs   : ${info.participantIDs.length}
Mᴀʟᴇ      : ${male}
Fᴇᴍᴀʟᴇ    : ${female}
Aᴅᴍɪɴs    : ${info.adminIDs.length}
Mᴇssᴀɢᴇs  : ${info.messageCount}

— ᰔᩚ𝙈𝘼...𝙈...𝙐𝙉✿`;

    const send = () =>
      api.sendMessage(
        {
          body: text,
          attachment: fs.existsSync(imgPath)
            ? fs.createReadStream(imgPath)
            : null
        },
        event.threadID,
        () => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        },
        event.messageID
      );

    if (!info.imageSrc) return api.sendMessage(text, event.threadID, event.messageID);

    request(encodeURI(info.imageSrc))
      .pipe(fs.createWriteStream(imgPath))
      .on("close", send);
  }
};
