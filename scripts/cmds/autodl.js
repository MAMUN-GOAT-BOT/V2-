const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "autodl",
                version: "1.7",
                author: "MahMUD",
                countDown: 0,
                role: 0,
                category: "media",
                description: {
                        en: "Automatically download videos from supported links",
                        bn: "সাপোর্টেড লিঙ্ক থেকে স্বয়ংক্রিয়ভাবে ভিডিও ডাউনলোড করুন",
                        vi: "Tự động tải video từ các liên kết được hỗ trợ"
                },
                guide: {
                        en: "[just send the video link]",
                        bn: "[শুধুমাত্র ভিডিও লিঙ্কটি পাঠান]",
                        vi: "[chỉ cần gửi liên kết video]"
                }
        },

        langs: {
                bn: {
                        error: "❌ An error occurred: contact MahMUD %1",
                        success: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 %1 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 <😘\n\n•𝐀𝐃𝐌𝐈𝐍: 𝐌𝐀𝐌𝐔𝐍"
                },
                en: {
                        error: "❌ An error occurred: contact MahMUD %1",
                        success: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 %1 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 <😘\n\n•𝐀𝐃𝐌𝐈𝐍: 𝐌𝐀𝐌𝐔𝐍"
                },
                vi: {
                        error: "❌ An error occurred: contact MahMUD %1",
                        success: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 %1 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 <😘\n\n•𝐀𝐃𝐌𝐈𝐍: 𝐌𝐀𝐌𝐔𝐍"
                }
        },

        onStart: async function () {},
        onChat: async function ({ api, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!event.body) return;
                const supportedSites = /https?:\/\/(www\.)?(vt\.tiktok\.com|tiktok\.com|facebook\.com|fb\.watch|instagram\.com|youtu\.be|youtube\.com|x\.com|twitter\.com|vm\.tiktok\.com)/gi;
                
                if (supportedSites.test(event.body)) {
                        const links = event.body.match(/https?:\/\/\S+/gi);
                        if (!links) return;
                        const link = links[0];

                        let platform = "𝚄𝚗𝚔𝚗𝚘𝚠𝚗";
                        if (link.includes("facebook.com") || link.includes("fb.watch")) platform = "𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤";
                        else if (link.includes("instagram.com")) platform = "𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦";
                        else if (link.includes("tiktok.com")) platform = "𝐓𝐢𝐤𝐓𝐨𝐤";
                        else if (link.includes("youtube.com") || link.includes("youtu.be")) platform = "𝐘𝐨𝐮𝐓𝐮𝐛𝐞";
                        else if (link.includes("x.com") || link.includes("twitter.com")) platform = "𝐗 (𝐓𝐰𝐢𝐭𝐭𝐞𝐫)";

                        const cacheDir = path.join(__dirname, "cache");
                        const filePath = path.join(cacheDir, `autodl_${Date.now()}.mp4`);

                        try {
                                api.setMessageReaction("⏳", event.messageID, () => { }, true);
                                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

                                const base = await mahmud();
                                const apiUrl = `${base}/api/download/video?link=${encodeURIComponent(link)}`;
                                
                                const response = await axios({
                                        method: 'get',
                                        url: apiUrl,
                                        responseType: 'arraybuffer',
                                        headers: {
                                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
                                        }
                                });

                                fs.writeFileSync(filePath, Buffer.from(response.data));
                                if (fs.statSync(filePath).size < 1000) throw new Error("Invalid video data.");
                                api.setMessageReaction("🪽", event.messageID, () => { }, true);
                                 
                                return api.sendMessage({
                                        body: getLang("success", platform),
                                        attachment: fs.createReadStream(filePath)
                                }, event.threadID, () => {
                                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                                }, event.messageID);

                        } catch (err) {
                                console.error("autodl error:", err.message);
                                api.setMessageReaction("❌", event.messageID, () => { }, true);
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        }
                }
        }
};
