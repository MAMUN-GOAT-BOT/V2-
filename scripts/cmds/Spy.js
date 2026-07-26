module.exports = {
  config: {
    name: "spy",
    version: "1.5",
    author: "xalman",
    role: 0,
    countDown: 5,
    shortDescription: "Deep dive into user stats",
    longDescription: "Fetch complete profile details including UID, balance, level, rank, location, with reactions.",
    category: "utility",
  },

  onStart: async function ({ event, message, api, usersData, args }) {
    const requesterID = event.senderID;
    const mentionIDs = Object.keys(event.mentions || {});
    let targetID = mentionIDs[0];

    api.setMessageReaction(event.messageID, "🕜", () => {}, true);

    if (args[0]) {
      const numeric = /^\d+$/.test(args[0]) ? args[0] : null;
      const linkMatch = args[0].match(/profile\.php\?id=(\d+)/);
      targetID = numeric || (linkMatch ? linkMatch[1] : targetID);
    }

    if (!targetID) targetID = event.type === "message_reply" ? event.messageReply.senderID : requesterID;

    try {
      const fbData = await new Promise((resolve, reject) => {
        api.getUserInfo(targetID, (err, result) => (err ? reject(err) : resolve(result)));
      });

      const avatarLink = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

      const userRecord = await usersData.get(targetID);
      const requesterRecord = await usersData.get(requesterID);
      const requesterName = requesterRecord.name || "Friend";

      const fullName = fbData[targetID].name || "N/A";
      const genderStr = fbData[targetID].gender === 1 ? "Female" : fbData[targetID].gender === 2 ? "Male" : "Unknown";
      const isFriend = fbData[targetID].isFriend ? "✅ Yes" : "❌ No";
      const birthday = fbData[targetID].isBirthday ? "🎉 Today!" : "🔒 Hidden";
      const balance = userRecord.money || 0;
      const xp = userRecord.exp || 0;
      const lvl = Math.floor(Math.sqrt(xp) * 0.1);

      const threadInfo = event.threadID ? await api.getThreadInfo(event.threadID) : {};
      const nickname = threadInfo.nicknames?.[targetID] || "—";

      const location = fbData[targetID].hometown_name || "Unknown";

      const allUsers = await usersData.getAll();
      const rankIdx = allUsers
        .filter(u => typeof u.money === "number")
        .sort((a, b) => b.money - a.money)
        .findIndex(u => u.userID === targetID);
      const rank = rankIdx !== -1 ? `#${rankIdx + 1}` : "—";

      const cardMessage = `
╔════════════════════╗
║ 🚀 PROFILE CARD ♦️ 
╚════════════════════╝

👤 Name       : ${fullName}
💬 Nickname   : ${nickname}
🆔 UID        : ${targetID}

💸 Balance    : $${balance}
⚡ XP         : ${xp}
🎚 Level      : ${lvl}
🏅 Rank       : ${rank}

⚧ Gender     : ${genderStr}
🎂 Birthday  : ${birthday}
📍 Location  : ${location}
🤝 Friend     : ${isFriend}
💌 Relation  : Single

🔗 Profile   : https://www.facebook.com/${targetID}

✨ Requested by: ${requesterName}
────────────────────────────
`;

      await message.reply({
        body: cardMessage,
        attachment: await global.utils.getStreamFromURL(avatarLink),
      });

      api.setMessageReaction(event.messageID, "✅", () => {}, true);

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ Could not retrieve profile info. Try again later!");
    }
  },
};
