module.exports = {
  config: {
    name: "fbinfo",
    aliases: ["fb", "userinfo"],
    version: "4.0",
    author: "〲MAMUNツ࿐ T.T　o.O",
    role: 0,
    shortDescription: "Facebook user info",
    longDescription: "Get Facebook user information safely",
    category: "info",
    guide: "{pn} @mention / uid"
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      let uid = event.senderID;

      // Mention user
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      }

      // UID input
      else if (args[0] && !isNaN(args[0])) {
        uid = args[0];
      }

      // Get user info
      const userInfo = await api.getUserInfo(uid);

      if (!userInfo || !userInfo[uid]) {
        return message.reply("❌ | User info not found.");
      }

      const user = userInfo[uid];

      // Username
      let username = user.vanity || "Not set";

      // Gender Fix
      let gender = "Unknown";

      // Female
      if (
        user.gender == 1 ||
        user.gender == "1" ||
        String(user.gender).toLowerCase() == "female"
      ) {
        gender = "Female";
      }

      // Male
      else if (
        user.gender == 2 ||
        user.gender == "2" ||
        String(user.gender).toLowerCase() == "male"
      ) {
        gender = "Male";
      }

      // Final Message
      const msg = `
╭─❍ FACEBOOK INFO ❍─╮

👤 Name: ${user.name || "Unknown"}
🆔 UID: ${uid}
🌐 Username: ${username}
🚻 Gender: ${gender}
🔗 Profile:
https://facebook.com/${uid}

╰─✦ 𝗣𝗢𝗢𝗞𝗜𝗘 𝗖𝗛𝗔𝗧 𝗕𝗢𝗧 ✦─╯
`;

      return message.reply(msg);

    } catch (error) {
      console.log(error);

      return message.reply(
`⚠️ FBINFO ERROR

${error.message || "Unknown error"}`
      );
    }
  }
};
