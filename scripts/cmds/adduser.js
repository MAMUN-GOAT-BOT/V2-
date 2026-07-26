const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
	config: {
		name: "adduser",
		version: "2.0",
		author: "〲MAMUNツ࿐",
		countDown: 5,
		role: 1,
		description: {
			vi: "Thêm thành viên vào box chat của bạn",
			en: "Add user to your group chat"
		},
		category: "box chat",
		guide: {
			en: "{pn} [uid | facebook link]"
		}
	},

	langs: {
		vi: {
			alreadyInGroup: "Đã có trong nhóm",
			successAdd: "✅ Đã thêm thành công %1 thành viên vào nhóm",
			failedAdd: "❌ Không thể thêm %1 thành viên",
			approve: "🕒 Đã thêm %1 thành viên vào danh sách chờ duyệt",
			invalidLink: "Link Facebook không hợp lệ",
			cannotGetUid: "Không thể lấy UID",
			linkNotExist: "Link profile không tồn tại",
			cannotAddUser: "Bot bị chặn hoặc người dùng chặn thêm vào nhóm"
		},
		en: {
			alreadyInGroup: "Already in group",
			successAdd: "✅ Successfully added %1 member(s)",
			failedAdd: "❌ Failed to add %1 member(s)",
			approve: "🕒 Added %1 member(s) to approval list",
			invalidLink: "Invalid Facebook link",
			cannotGetUid: "Cannot get UID",
			linkNotExist: "Profile link does not exist",
			cannotAddUser: "Bot is blocked or user blocked group invites"
		}
	},

	onStart: async function ({ message, api, event, args, threadsData, getLang }) {

		if (!args[0]) {
			return message.reply("⚠️ Please enter UID or Facebook profile link");
		}

		const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID);
		const botID = api.getCurrentUserID();

		const success = [
			{
				type: "success",
				uids: []
			},
			{
				type: "waitApproval",
				uids: []
			}
		];

		const failed = [];

		function checkErrorAndPush(messageError, item) {
			item = item.replace(
				/(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i,
				''
			);

			const findType = failed.find(error => error.type == messageError);

			if (findType)
				findType.uids.push(item);
			else
				failed.push({
					type: messageError,
					uids: [item]
				});
		}

		const regExMatchFB =
			/(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;

		for (const item of args) {

			let uid;
			let continueLoop = false;

			if (isNaN(item) && regExMatchFB.test(item)) {

				for (let i = 0; i < 10; i++) {
					try {
						uid = await findUid(item);
						break;
					}
					catch (err) {

						if (err.name == "SlowDown" || err.name == "CannotGetData") {
							await sleep(1000);
							continue;
						}

						else if (
							i == 9 ||
							(err.name != "SlowDown" && err.name != "CannotGetData")
						) {

							checkErrorAndPush(
								err.name == "InvalidLink"
									? getLang("invalidLink")
									: err.name == "CannotGetData"
										? getLang("cannotGetUid")
										: err.name == "LinkNotExist"
											? getLang("linkNotExist")
											: err.message,
								item
							);

							continueLoop = true;
							break;
						}
					}
				}
			}

			else if (!isNaN(item)) {
				uid = item;
			}

			else {
				continue;
			}

			if (continueLoop)
				continue;

			if (members.some(m => m.userID == uid && m.inGroup)) {

				checkErrorAndPush(
					getLang("alreadyInGroup"),
					item
				);

			} else {

				try {

					await api.addUserToGroup(uid, event.threadID);

					if (approvalMode === true && !adminIDs.includes(botID))
						success[1].uids.push(uid);
					else
						success[0].uids.push(uid);

				}
				catch (err) {

					checkErrorAndPush(
						getLang("cannotAddUser"),
						item
					);
				}
			}
		}

		const lengthUserSuccess = success[0].uids.length;
		const lengthUserWaitApproval = success[1].uids.length;
		const lengthUserError = failed.length;

		let msg = "📌 ADD USER RESULT\n━━━━━━━━━━━━━━\n";

		if (lengthUserSuccess)
			msg += `${getLang("successAdd", lengthUserSuccess)}\n`;

		if (lengthUserWaitApproval)
			msg += `${getLang("approve", lengthUserWaitApproval)}\n`;

		if (lengthUserError)
			msg += `${getLang("failedAdd",
				failed.reduce((a, b) => a + b.uids.length, 0)
			)}${failed.reduce(
				(a, b) =>
					a += `\n\n• ${b.uids.join("\n• ")}\n➜ ${b.type}`,
				""
			)}`;

		msg += `\n━━━━━━━━━━━━━━\n👑 Admin: 𝗠𝗔𝗠𝗨𝗡`;

		await message.reply(msg);
	}
};
