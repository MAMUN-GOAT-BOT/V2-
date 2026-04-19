const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "4k",
                aliases: ["hd", "upscale"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "AI এর মাধ্যমে ছবির কোয়ালিটি 4K বা HD করুন",
                        en: "Enhance or restore image quality to 4K using AI",
                        vi: "Nâng cao chất lượng hình ảnh lên 4K bằng AI"
                },
                category: "tools",
                guide: {
                        bn: '   {pn} [url]: ছবির লিংকের মাধ্যমে HD করুন\n   অথবা ছবির রিপ্লাইয়ে {pn} লিখুন',
                        en: '   {pn} [url]: Upscale image via URL\n   Or reply to an image with {pn}',
                        vi: '   {pn} [url]: Nâng cấp ảnh qua URL\n   Hoặc phản hồi ảnh bằng {pn}'
                }
        },

        langs: {
                bn: {
                        noImage: "• বেবি, একটি ছবিতে রিপ্লাই দাও অথবা ছবির লিংক দাও! 😘",
                        wait: "𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞...𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲 😘",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noImage: "• Baby, please reply to an image or provide a link! 😘",
                        wait: "𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞...𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲 😘",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        noImage: "• Cưng ơi, hãy phản hồi một bức ảnh hoặc gửi link! 😘",
                        wait: "𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞...𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲 😘",
                        success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝟒𝐤 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
                        error: "× Lỗi: %1. Liên hệ MahMUD để được hỗ trợ."
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                let imgUrl;
                if (event.messageReply?.attachments?.[0]?.type === "photo") {
                        imgUrl = event.messageReply.attachments[0].url;
                } else if (args[0]) {
                        imgUrl = args.join(" ");
                }

                if (!imgUrl) return api.sendMessage(getLang("noImage"), event.threadID, event.messageID);

                const waitMsg = await api.sendMessage(getLang("wait"), event.threadID, event.messageID);
                api.setMessageReaction("😘", event.messageID, () => {}, true);

                try {
                        const baseUrl = await mahmud();
                        const apiUrl = `${baseUrl}/api/hd/mahmud?imgUrl=${encodeURIComponent(imgUrl)}`;
                        
                        const res = await axios.get(apiUrl, { responseType: "stream" });

                        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
                        api.setMessageReaction("🪽", event.messageID, () => {}, true);

                        return api.sendMessage({
                                body: getLang("success"),
                                attachment: res.data
                        }, event.threadID, event.messageID);

                } catch (err) {
                        console.error("Error in 4k command:", err);
                        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return api.sendMessage(getLang("error", err.message), event.threadID, event.messageID);
                }
        }
};
