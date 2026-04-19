const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "removebg",
                aliases: ["rmbg", "rbg"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                category: "tools",
                guide: {
                        en: "{pn} [Reply to an image]",
                        bn: "{pn} [ছবির উপরে রিপ্লাই দিন]",
                        vi: "{pn} [Phản hồi một hình ảnh]"
                }
        },

        langs: {
                bn: {
                        noReply: "• বেবি, ব্যাকগ্রাউন্ড রিমুভ করার জন্য একটি ছবিতে রিপ্লাই দাও.",
                        error: "❌ An error occurred: contact MahMUD %1",
                        success: "✅ Background Removed Successfully!"
                },
                en: {
                        noReply: "• Baby, please reply to an image to remove background.",
                        error: "❌ An error occurred: contact MahMUD %1",
                        success: "✅ Background Removed Successfully!"
                },
                vi: {
                        noReply: "• Cưng ơi, vui lòng phản hồi một hình ảnh để xóa nền.",
                        error: "❌ An error occurred: contact MahMUD %1",
                        success: "✅ Xóa nền thành công!"
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { threadID, messageID, type, messageReply } = event;

                if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
                        return message.reply(getLang("noReply"));
                }

                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                const outputPath = path.join(cacheDir, `rmbg_${Date.now()}.png`);

                try {
                        api.setMessageReaction("⏳", messageID, () => { }, true);

                        const imageUrl = messageReply.attachments[0].url;
                        const apiUrlBase = await mahmud();

                        const response = await axios.post(
                                `${apiUrlBase}/api/rmbg`,
                                { imageUrl },
                                { responseType: "stream" }
                        );

                        const writer = fs.createWriteStream(outputPath);
                        response.data.pipe(writer);

                        writer.on("finish", () => {
                                api.sendMessage({
                                        body: getLang("success"),
                                        attachment: fs.createReadStream(outputPath)
                                }, threadID, (err) => {
                                        if (!err) {
                                                api.setMessageReaction("🪽", messageID, () => { }, true);
                                        }
                                        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                                }, messageID);
                        });

                        writer.on("error", (err) => {
                                throw err;
                        });

                } catch (error) {
                        api.setMessageReaction("❌", messageID, () => { }, true);
                        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                        api.sendMessage(getLang("error", error.message || "API Error"), threadID, messageID);
                }
        }
};
