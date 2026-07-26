const axios = require("axios");
const fs = require('fs');
const path = require('path');

const baseApiUrl = async () => {
        const base = await axios.get(`https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json`);
        return base.data.mahmud; 
};

module.exports = {
        config: {
                name: "video",
                aliases: ["ভিডিও"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "ইউটিউব থেকে ভিডিও ডাউনলোড করুন (নাম বা লিঙ্ক দিয়ে)",
                        en: "Download video from YouTube (by name or link)",
                        vi: "Tải video từ YouTube (theo tên hoặc liên kết)"
                },
                category: "media",
                guide: {
                        bn: '   {pn} <নাম বা লিঙ্ক>: ভিডিও ডাউনলোড করতে নাম বা লিঙ্ক দিন',
                        en: '   {pn} <name or link>: Provide video name or link',
                        vi: '   {pn} <tên hoặc liên kết>: Cung cấp tên hoặc liên kết video'
                }
        },

        langs: {
                bn: {
                        noInput: "× বেবি, ভিডিওর নাম বা লিঙ্ক তো দাও! 📺",
                        noResult: "× কোনো রেজাল্ট পাওয়া যায়নি।",
                        success: "✅ 𝙃𝙚𝙧𝙚'𝙨 𝙮𝙤𝙪𝙧 𝙫𝙞𝙙𝙚𝙤 𝙗𝙖𝙗𝙮\n\n• 𝐓𝐢𝐭𝐥𝐞: %1",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noInput: "× Baby, please provide a video name or link! 📺",
                        noResult: "× No results found.",
                        success: "✅ 𝙃𝙚𝙧𝙚'𝙨 𝙮𝙤𝙪𝙧 𝙫𝙞𝙙𝙚𝙤 𝙗𝙖𝙗𝙮\n\n• 𝐓𝐢𝐭𝐥𝐞: %1",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        noInput: "× Cưng ơi, vui lòng cung cấp tên hoặc liên kết video! 📺",
                        noResult: "× Không tìm thấy kết quả.",
                        success: "✅ Video của cưng đây <😘\n\n• 𝐓𝐢êu đề: %1",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!args[0]) return message.reply(getLang("noInput"));

                try {
                        api.setMessageReaction("🐤", event.messageID, () => {}, true);
                        
                        const apiUrl = await baseApiUrl();
                        const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
                        let videoID;

                        if (checkurl.test(args[0])) {
                                videoID = args[0].match(checkurl)[1];
                        } else {
                                const keyWord = args.join(" ");
                                const searchRes = await axios.get(`${apiUrl}/api/video/search?songName=${encodeURIComponent(keyWord)}`);
                                if (!searchRes.data || searchRes.data.length === 0) {
                                        api.setMessageReaction("🥹", event.messageID, () => {}, true);
                                        return message.reply(getLang("noResult"));
                                }
                                videoID = searchRes.data[0].id;
                        }

                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
                        const filePath = path.join(cacheDir, `video_${videoID}.mp4`);

                        const res = await axios.get(`${apiUrl}/api/video/download?link=${videoID}&format=mp4`);
                        const { title, downloadLink } = res.data;

                        const videoBuffer = (await axios.get(downloadLink, { responseType: "arraybuffer" })).data;
                        fs.writeFileSync(filePath, Buffer.from(videoBuffer));

                        return message.reply({
                                body: getLang("success", title),
                                attachment: fs.createReadStream(filePath)
                        }, () => {
                                api.setMessageReaction("🪽", event.messageID, () => {}, true);
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        });

                } catch (err) {
                        console.error("Video Download Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        }
};
