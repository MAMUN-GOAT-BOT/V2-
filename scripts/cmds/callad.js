const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

// <--- এখানে আপনার নির্দিষ্ট থ্রেড ID সেট করা হয়েছে --->
const TARGET_THREAD_ID = "4095426180772827"; 

module.exports = {
	config: {
		name: "call",
		aliases: ["callad","called"],
		version: "1.6",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "gửi tin nhắn về admin bot",
			en: "send message to admin bot"
		},
		longDescription: {
			vi: "gửi báo cáo, góp ý, báo lỗi,... của bạn về admin bot",
			en: "send report, feedback, bug,... to admin bot"
		},
		category: "contacts admin",
		guide: {
			vi: "   {pn} <tin nhắn>",
			en: "   {pn} <message>"
		}
	},

	langs: {
		vi: {
			missingMessage: "Vui lòng nhập tin nhắn bạn muốn gửi về admin",
			sendByGroup: "\n- Được gửi từ nhóm: %1\n- Thread ID: %2",
			sendByUser: "\n- Được gửi từ người dùng",
			content: "\n\nNội dung:\n─────────────────\n%1\n─────────────────\nPhản hồi tin nhắn này để gửi tin nhắn về người dùng",
			success: "Đã gửi tin nhắn của bạn về %1 admin thành công!\n%2",
			failed: "Đã có lỗi xảy ra khi gửi tin nhắn của bạn về %1 admin\n%2\nKiểm tra console để biết thêm chi tiết",
			reply: "📍 Phản hồi từ admin %1:\n─────────────────\n%2\n─────────────────\nPhản hồi tin nhắn này để tiếp tục gửi tin nhắn về admin",
			replySuccess: "Đã gửi phản hồi আপনারไปยัง গন্তব্য থ্রেড ID-তে সফলভাবে পাঠানো হয়েছে!",
			feedback: "📝 Phản hồi từ người dùng %1:\n- User ID: %2%3\n\nNội dung:\n─────────────────\n%4\n─────────────────\nPhản hồi tin nhắn này để gửi tin nhắn về người dùng",
			replyUserSuccess: "Đã gửi phản hồi của bạn về người dùng thành công!",
			noAdmin: "Hiện tại bot chưa có admin nào"
		},
		en: {
			missingMessage: "Please enter the message you want to send to admin",
			sendByGroup: "\n- Sent from Admin",
			sendByUser: "\n- Sent from user",
			content: "\n\nContent:\n─────────────────\n%1\n─────────────────\nReply this message to send message to user",
			success: "Sent your message to %1 admin successfully!\n%2",
			failed: "An error occurred while sending your message to %1 admin\n%2\nCheck console for more details",
			reply: "📍 Reply from admin %1:\n─────────────────\n%2\n─────────────────\nReply this message to continue send message to admin",
			replySuccess: "Sent your reply successfully",
			feedback: "📝 Feedback from user %1:\n- User ID: %2%3\n\nContent:\n─────────────────\n%4\n─────────────────\nReply this message to send message to user",
			replyUserSuccess: "Sent your reply to user successfully!",
			noAdmin: "Bot has no admin at the moment"
		}
	},

	onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
		const { config } = global.GoatBot;
		if (!args[0])
			return message.reply(getLang("missingMessage"));
		const { senderID, threadID, isGroup } = event;
		
		// AdminBot চেক লজিক সরানো হলো, যেহেতু এখন এটি নির্দিষ্ট থ্রেডে যাবে।
		
		const senderName = await usersData.getName(senderID);
		const msg = "==📨️ USER MESSAGE 📨️=="
			+ `\n- User Name: ${senderName}`
			+ `\n- User ID: ${senderID}`
			+ (isGroup ? getLang("sendByGroup", (await threadsData.get(threadID)).threadName, threadID) : getLang("sendByUser"));

		const formMessage = {
			body: msg + getLang("content", args.join(" ")),
			mentions: [{
				id: senderID,
				tag: senderName
			}],
			attachment: await getStreamsFromAttachment(
				[...event.attachments, ...(event.messageReply?.attachments || [])]
					.filter(item => mediaTypes.includes(item.type))
			)
		};

		// <--- মূল পরিবর্তন: লুপের পরিবর্তে সরাসরি টার্গেট থ্রেড ID-তে মেসেজ পাঠানো --->
		try {
			const messageSend = await api.sendMessage(formMessage, TARGET_THREAD_ID);
			
			// রিপ্লাই হ্যান্ডেল করার জন্য সেট করা হলো 
			global.GoatBot.onReply.set(messageSend.messageID, {
				commandName,
				messageID: messageSend.messageID,
				threadID: threadID, // ইউজারের আসল থ্রেড ID সংরক্ষণ করা হচ্ছে
				messageIDSender: event.messageID,
				type: "userCallAdmin" // নামকরণ পরিবর্তন করা হয়নি
			});
			
			// সাফল্য বার্তা
			return message.reply(`✅Your message has been sent to admin`);

		} catch (err) {
			console.error("CALL AD (TARGET THREAD) ERROR:", err);
			return message.reply(`❌ মেসেজটি টার্গেট থ্রেড ID: ${TARGET_THREAD_ID} এ পাঠাতে ব্যর্থ। ত্রুটি দেখুন।`);
		}
	},

	onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
		// onReply ফাংশনটি এখন ধরে নিচ্ছে যে TARGET_THREAD_ID থেকে রিপ্লাই আসছে 
		// (অর্থাৎ, TARGET_THREAD_ID এর ইউজাররা এখন অ্যাডমিনের ভূমিকা পালন করছে)
		
		const { type, threadID, messageIDSender } = Reply;
		const senderName = await usersData.getName(event.senderID);
		const { isGroup } = event;

		switch (type) {
			case "userCallAdmin": {
				// এই কেসটি এখন TARGET_THREAD_ID থেকে ইউজারকে রিপ্লাই পাঠানোর জন্য ব্যবহৃত হবে
				
				const formMessage = {
					body: getLang("reply", senderName, args.join(" ")),
					mentions: [{
						id: event.senderID,
						tag: senderName
					}],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				// রিপ্লাইটি ইউজারের আসল থ্রেড ID-তে পাঠানো হচ্ছে (Reply.threadID)
				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err)
						return message.err(err);
					message.reply(getLang("replyUserSuccess"));
					
					// রিপ্লাই ট্র্যাকিং আবার সেট করা হলো যাতে ইউজার আবার রিপ্লাই দিতে পারে
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID, // এখন এটি TARGET_THREAD_ID
						type: "adminReply" 
					});
				}, messageIDSender);
				break;
			}
			case "adminReply": {
				// এই কেসটি যদি ইউজার রিপ্লাই করে তবে মেসেজটি আবার TARGET_THREAD_ID-তে পাঠানোর জন্য
				
				let sendByGroup = "";
				if (isGroup) {
					const { threadName } = await api.getThreadInfo(event.threadID);
					sendByGroup = getLang("sendByGroup", threadName, event.threadID);
				}
				const formMessage = {
					body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
					mentions: [{
						id: event.senderID,
						tag: senderName
					}],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				// মেসেজটি TARGET_THREAD_ID-তে পাঠানো হচ্ছে 
				api.sendMessage(formMessage, TARGET_THREAD_ID, (err, info) => { 
					if (err)
						return message.err(err);
					message.reply(getLang("replySuccess"));
					
					// রিপ্লাই ট্র্যাকিং আবার সেট করা হলো 
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "userCallAdmin"
					});
				}, messageIDSender);
				break;
			}
			default: {
				break;
			}
		}
	}
};
