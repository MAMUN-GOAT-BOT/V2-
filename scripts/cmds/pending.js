const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "pending",
    version: "2.3",
    author: "xalman",
    countDown: 5,
    role: 2,
    shortDescription: { en: "Manage pending group requests" },
    longDescription: { en: "Approve or refuse groups waiting for bot permission" },
    category: "owner"
  },

  langs: {
    en: {
      invalid: "❌ Invalid selection: %1",
      refused: "🚫 %1 group request refused\n⏰ Time: %2",
      approved: "✅ %1 group successfully approved\n⏰ Time: %2",
      fetchFail: "❌ Unable to load pending groups",
      list: "🔔 PENDING GROUPS (%1)\n\n%2\n\n👉 Reply with number(s) to approve\n👉 Reply `c <number>` to cancel",
      empty: "✅ No pending groups found"
    }
  },

  onReply: async ({ api, event, Reply, getLang }) => {
    if (event.senderID != Reply.author) return;

    const input = event.body.trim();
    const { threadID, messageID } = event;
    const prefix = global.GoatBot?.config?.prefix || "-";
    const botNickname = "𝐘𝐎𝐔𝐑 ♲︎︎︎ 𝐁𝐁𝐙 ♡︎♥︎";
    let done = 0;

    const dateTime = moment()
      .tz("Asia/Dhaka")
      .format("ddd, YYYY-MMM-DD, HH:mm:ss");

    if (/^(c|cancel)/i.test(input)) {
      const nums = input.replace(/^(c|cancel)/i, "").trim().split(/\s+/);

      for (const n of nums) {
        if (!Number(n) || n < 1 || n > Reply.queue.length)
          return api.sendMessage(getLang("invalid", n), threadID, messageID);

        const targetThreadID = Reply.queue[n - 1].threadID;

        api.sendMessage(
`╭─🚫 ACCESS DENIED 🚫─╮
│ 🤖 Bot : Refused
│ 🔗 Prefix : ${prefix}
│ ⚡ Owner : 𝐌𝐀𝐌𝐔𝐍
│ ⏰ Date/Time : ${dateTime}
╰──────────────────╯`,
          targetThreadID
        );

        await api.removeUserFromGroup(api.getCurrentUserID(), targetThreadID);
        done++;
      }

      return api.sendMessage(
        getLang("refused", done, dateTime),
        threadID,
        messageID
      );
    }

    const nums = input.split(/\s+/);
    for (const n of nums) {
      if (!Number(n) || n < 1 || n > Reply.queue.length)
        return api.sendMessage(getLang("invalid", n), threadID, messageID);

      const targetThreadID = Reply.queue[n - 1].threadID;
      const botID = api.getCurrentUserID();

      api.sendMessage(
`╭─✨ SYSTEM GOAT ✨─╮
│ 🤖 Bot : Activated
│ 🔗 Prefix : ${prefix}
│ ⚡ Owner : 𝐌𝐀𝐌𝐔𝐍
│ ⏰ Date/Time : ${dateTime} 
╰─✅ Access Granted─╯`,
        targetThreadID
      );

      try {
        await api.changeNickname(botNickname, targetThreadID, botID);
      } catch (e) {
        console.log(`Nickname set error for ${targetThreadID}: `, e);
      }

      done++;
    }

    return api.sendMessage(
      getLang("approved", done, dateTime),
      threadID,
      messageID
    );
  },

  onStart: async ({ api, event, getLang, commandName }) => {
    const { threadID, messageID, senderID } = event;
    let text = "";
    let i = 1;

    try {
      const other = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];

      const groups = [...other, ...pending].filter(
        t => t.isGroup && t.isSubscribed
      );

      if (!groups.length)
        return api.sendMessage(getLang("empty"), threadID, messageID);

      for (const g of groups)
        text += `${i++}. ${g.name || "Unnamed Group"} → ${g.threadID}\n`;

      api.sendMessage(
        getLang("list", groups.length, text),
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            author: senderID,
            queue: groups
          });
        },
        messageID
      );

    } catch (err) {
      return api.sendMessage(getLang("fetchFail"), threadID, messageID);
    }
  }
};
