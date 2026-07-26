module.exports = {
config: {
name: "cr",
version: "2.0",
author: "〲MAMUNツ࿐ T.T　o.O",
countDown: 5,
role: 2,
shortDescription: "Create group with mention",
longDescription: "Create messenger group using mention",
category: "group",
guide: "{pn} <group name> @mention"
},

onStart: async function ({ api, event, args }) {

const mentions = Object.keys(event.mentions);

if (mentions.length == 0) {
return api.sendMessage("⚠️ Please mention users\nExample:\n-cr Pookie Group @user", event.threadID);
}

const groupName = args.join(" ").replace(/@\S+/g, "").trim();

if (!groupName) {
return api.sendMessage("⚠️ Give group name", event.threadID);
}

const members = [...mentions, event.senderID];

api.createNewGroup(members, groupName, (err, info) => {

if (err) return api.sendMessage("❌ Group create failed!", event.threadID);

api.sendMessage(
`🎉 GROUP CREATED

👑 Owner: ${event.senderID}
👥 Members: ${members.length}
📌 Name: ${groupName}

♡┋ 𝙋𝙊𝙊𝙆𝙄𝙀 ᥫ᭡🎀🙂`,
info.threadID
);

});

}
};
