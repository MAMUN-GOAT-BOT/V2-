const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "autoreadd.json");
if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}));

function load() {
  return JSON.parse(fs.readFileSync(file));
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "autoreadd",
		aliases: ["anti"],
    version: "3.0",
    author: "Rasel Mahmud",
    countDown: 5,
    role: 0,
    shortDescription: "Auto Re-Add left users (default ON)",
    longDescription: "Bot online হলে auto re-add সব group-এ ON থাকে। চাইলে off করা যায়।",
    category: "system",
    guide: { en: "{pn} on / off" }
  },

  onStart: async function ({ api, event, args }) {
    const tid = event.threadID;
    const sid = event.senderID;

    // permission check
    const info = await api.getThreadInfo(tid);
    const isGroupAdmin = info.adminIDs.some(a => a.id == sid);
    const isBotAdmin = event.role >= 1;

    if (!isGroupAdmin && !isBotAdmin) {
      return api.sendMessage("❌ Only  Group Admin can use this command!", tid);
    }

    let data = load();
    if (!args[0]) {
      return api.sendMessage("Use: autoreadd on / autoreadd off", tid);
    }

    if (args[0].toLowerCase() === "on") {
      data[tid] = true;
      save(data);
      return api.sendMessage("✅ Auto Re-Add is now ON!", tid);
    }

    if (args[0].toLowerCase() === "off") {
      data[tid] = false;
      save(data);
      return api.sendMessage("❌ Auto Re-Add is now OFF!", tid);
    }
  },

  onEvent: async function ({ api, event }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    const tid = event.threadID;
    const leftUser = event.logMessageData.leftParticipantFbId;

    let data = load();

    // Default ON (যদি ডাটাবেজে কিছু না থাকে)
    const isEnabled = data[tid] !== false;

    if (!isEnabled) return;

    try {
      await api.addUserToGroup(leftUser, tid);
      api.sendMessage("✅ User added back automatically!", tid);
    } catch (e) {
      api.sendMessage("❌ Failed to re-add user (maybe blocked).", tid);
    }
  }
};
