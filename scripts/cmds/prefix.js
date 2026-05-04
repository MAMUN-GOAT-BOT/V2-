const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "prefix",
    version: "2.4",
    author: "MAMUN",
    countDown: 5,
    role: 0,
    description: "Change & show bot prefix",
    category: "config"
  },

  langs: {
    en: {
      usage: "❌ Usage: prefix <newPrefix> | prefix reset | prefix <newPrefix> -g",
      reset: "✅ Prefix reset successful!\n🔰 System prefix: %1",
      onlyAdmin: "⛔ Only bot admin can change global prefix.",
      confirmGlobal: "⚙️ Global prefix change requested.\n👉 React to confirm.",
      confirmThisThread: "🛠️ Group prefix change requested.\n👉 React to confirm.",
      successGlobal: "✅ Global prefix changed!\n🆕 New prefix: %1",
      successThisThread: "✅ Group prefix changed!\n🆕 New prefix: %1"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0])
      return message.reply(getLang("usage"));

    // RESET
    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const setGlobal = args[1] === "-g";

    if (setGlobal && role < 2)
      return message.reply(getLang("onlyAdmin"));

    const confirmMsg = setGlobal
      ? getLang("confirmGlobal")
      : getLang("confirmThisThread");

    message.reply(confirmMsg, (err, info) => {
      if (err) return;

      global.GoatBot.onReaction.set(info.messageID, {
        commandName,
        author: event.senderID,
        newPrefix,
        setGlobal
      });
    });
  },

  onReaction: async function ({ event, message, threadsData, Reaction, getLang }) {
    if (event.userID !== Reaction.author) return;

    global.GoatBot.onReaction.delete(event.messageID);

    if (Reaction.setGlobal) {
      global.GoatBot.config.prefix = Reaction.newPrefix;

      fs.writeFileSync(
        global.client.dirConfig,
        JSON.stringify(global.GoatBot.config, null, 2)
      );

      return message.reply(getLang("successGlobal", Reaction.newPrefix));
    }

    await threadsData.set(
      event.threadID,
      Reaction.newPrefix,
      "data.prefix"
    );

    return message.reply(getLang("successThisThread", Reaction.newPrefix));
  },

  onChat: async function ({ event, message, threadsData }) {
    if (!event.body || event.body.toLowerCase() !== "prefix") return;

    const systemPrefix = global.GoatBot.config.prefix;
    const groupPrefix = global.utils.getPrefix(event.threadID);

    const threadInfo = await threadsData.get(event.threadID);
    const groupName = threadInfo?.threadName || "Unknown Group";

    const time = moment().tz("Asia/Dhaka").format("hh:mm A");
    const date = moment().tz("Asia/Dhaka").format("DD MMM YYYY");

    const owner = global.GoatBot.config.adminName || "MAMUN";

    return message.reply(
`╭━━━〔 PREFIX 〕━━━╮
┃ 🎀 GROUP : ${groupName}
┃ ☠️ SYSTEM : 『 ${systemPrefix} 』
┃ ☯️ GROUP  : 『 ${groupPrefix} 』
┃ 💠 TIME   : ${time}
┃ ⚠️ DATE   : ${date}
┃ Ⓜ️ OWNER  : ${owner}
╰━━━〔 ✨ ×͜× 〕━━━╯`
    );
  }
};
