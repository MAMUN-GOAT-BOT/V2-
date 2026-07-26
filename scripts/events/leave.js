const { getTime, drive } = global.utils;
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports = {
	config: {
		name: "leave",
		version: "2.0",
		author: "Rasin",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			leaveType1: "tự rời",
			leaveType2: "bị kick",
			defaultLeaveMessage: "{userName} đã {type} khỏi nhóm"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			leaveType1: "left",
			leaveType2: "was kicked from",
			defaultLeaveMessage: "💔 {userName} {type} the group.\n\n🌸 We'll miss you! Take care and stay safe ✨"
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
		if (event.logMessageType == "log:unsubscribe")
			return async function () {
				const { threadID } = event;
				const threadData = await threadsData.get(threadID);
				if (!threadData.settings.sendLeaveMessage)
					return;
				const { leftParticipantFbId } = event.logMessageData;
				if (leftParticipantFbId == api.getCurrentUserID())
					return;

				const hours = getTime("HH");
				const threadName = threadData.threadName;
				const userName = await usersData.getName(leftParticipantFbId);
				const isKicked = leftParticipantFbId != event.author;

				let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;
				const session = hours <= 10 ? getLang("session1") :
					hours <= 12 ? getLang("session2") :
						hours <= 18 ? getLang("session3") : getLang("session4");

				leaveMessage = leaveMessage
					.replace(/\{userName\}/g, userName)
					.replace(/\{type\}/g, isKicked ? getLang("leaveType2") : getLang("leaveType1"))
					.replace(/\{time\}/g, hours)
					.replace(/\{session\}/g, session)
					.replace(/\{threadName\}/g, threadName);

				try {
					const cacheDir = path.join(__dirname, "cache");
					await fs.ensureDir(cacheDir);

					// Register fonts with Unicode support
					try {
						const fontPaths = [
							{ path: 'C:\\Windows\\Fonts\\seguisb.ttf', family: 'Segoe' },
							{ path: 'C:\\Windows\\Fonts\\segoeui.ttf', family: 'Segoe' },
							{ path: 'C:\\Windows\\Fonts\\arialuni.ttf', family: 'ArialUni' },
							{ path: 'C:\\Windows\\Fonts\\msyh.ttc', family: 'MSYahei' },
							{ path: '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf', family: 'Noto' },
							{ path: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', family: 'DejaVu' }
						];

						let fontRegistered = false;
						for (const font of fontPaths) {
							try {
								if (fs.existsSync(font.path)) {
									registerFont(font.path, { family: font.family });
									fontRegistered = true;
									break;
								}
							} catch (e) {
								continue;
							}
						}
					} catch (fontErr) {
						console.log("Font registration error:", fontErr.message);
					}

					const threadInfo = await api.getThreadInfo(threadID);
					const memberCount = threadInfo.participantIDs.length;

					const canvas = createCanvas(1000, 600);
					const ctx = canvas.getContext('2d');

					// Background gradient (darker/sadder tones)
					const bgGradient = ctx.createRadialGradient(500, 300, 100, 500, 300, 600);
					bgGradient.addColorStop(0, '#4a4a6a');
					bgGradient.addColorStop(0.5, '#3a3a52');
					bgGradient.addColorStop(1, '#2a2a3a');
					ctx.fillStyle = bgGradient;
					ctx.fillRect(0, 0, 1000, 600);

					// Bubbles with darker tones
					ctx.globalAlpha = 0.1;
					const bubbles = [
						{ x: 150, y: 100, r: 80 },
						{ x: 850, y: 150, r: 120 },
						{ x: 200, y: 450, r: 60 },
						{ x: 800, y: 500, r: 90 },
						{ x: 500, y: 100, r: 70 }
					];
					bubbles.forEach(b => {
						const bubbleGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
						bubbleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
						bubbleGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
						ctx.fillStyle = bubbleGrad;
						ctx.beginPath();
						ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
						ctx.fill();
					});
					ctx.globalAlpha = 1;

					// Wave patterns
					ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
					ctx.lineWidth = 3;
					for (let i = 0; i < 5; i++) {
						ctx.beginPath();
						for (let x = 0; x < 1000; x += 20) {
							const y = 100 + i * 100 + Math.sin(x / 50 + i) * 30;
							if (x === 0) ctx.moveTo(x, y);
							else ctx.lineTo(x, y);
						}
						ctx.stroke();
					}

					// Main card background
					ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
					ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
					ctx.lineWidth = 3;
					ctx.beginPath();
					ctx.moveTo(100, 120);
					ctx.lineTo(900, 80);
					ctx.quadraticCurveTo(950, 80, 950, 130);
					ctx.lineTo(950, 500);
					ctx.quadraticCurveTo(950, 550, 900, 550);
					ctx.lineTo(100, 520);
					ctx.quadraticCurveTo(50, 520, 50, 470);
					ctx.lineTo(50, 170);
					ctx.quadraticCurveTo(50, 120, 100, 120);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();

					// Top strip (gray/sad colors)
					const stripGradient = ctx.createLinearGradient(0, 0, 1000, 600);
					stripGradient.addColorStop(0, '#708090');
					stripGradient.addColorStop(0.5, '#556B2F');
					stripGradient.addColorStop(1, '#483D8B');
					ctx.fillStyle = stripGradient;
					ctx.beginPath();
					ctx.moveTo(50, 120);
					ctx.lineTo(950, 80);
					ctx.lineTo(950, 100);
					ctx.lineTo(50, 140);
					ctx.closePath();
					ctx.fill();

					try {
						const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${leftParticipantFbId}`;
						const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
						const avatar = await loadImage(Buffer.from(avatarResponse.data));

						const hexSize = 110;
						const hexX = 250;
						const hexY = 300;

						ctx.save();
						ctx.beginPath();
						for (let i = 0; i < 6; i++) {
							const angle = (Math.PI / 3) * i;
							const x = hexX + hexSize * Math.cos(angle);
							const y = hexY + hexSize * Math.sin(angle);
							if (i === 0) ctx.moveTo(x, y);
							else ctx.lineTo(x, y);
						}
						ctx.closePath();
						ctx.clip();
						ctx.drawImage(avatar, hexX - hexSize, hexY - hexSize, hexSize * 2, hexSize * 2);
						ctx.restore();

						// Hexagon border (gray)
						ctx.shadowColor = '#708090';
						ctx.shadowBlur = 20;
						ctx.strokeStyle = '#708090';
						ctx.lineWidth = 5;
						ctx.beginPath();
						for (let i = 0; i < 6; i++) {
							const angle = (Math.PI / 3) * i;
							const x = hexX + hexSize * Math.cos(angle);
							const y = hexY + hexSize * Math.sin(angle);
							if (i === 0) ctx.moveTo(x, y);
							else ctx.lineTo(x, y);
						}
						ctx.closePath();
						ctx.stroke();
						ctx.shadowBlur = 0;

						// Outer hexagon ring
						ctx.strokeStyle = 'rgba(112, 128, 144, 0.6)';
						ctx.lineWidth = 3;
						ctx.beginPath();
						for (let i = 0; i < 6; i++) {
							const angle = (Math.PI / 3) * i;
							const x = hexX + (hexSize + 15) * Math.cos(angle);
							const y = hexY + (hexSize + 15) * Math.sin(angle);
							if (i === 0) ctx.moveTo(x, y);
							else ctx.lineTo(x, y);
						}
						ctx.closePath();
						ctx.stroke();

					} catch (err) {
						const hexSize = 110;
						const hexX = 250;
						const hexY = 300;
						ctx.fillStyle = '#2a2a3e';
						ctx.beginPath();
						for (let i = 0; i < 6; i++) {
							const angle = (Math.PI / 3) * i;
							const x = hexX + hexSize * Math.cos(angle);
							const y = hexY + hexSize * Math.sin(angle);
							if (i === 0) ctx.moveTo(x, y);
							else ctx.lineTo(x, y);
						}
						ctx.closePath();
						ctx.fill();
					}

					// "GOODBYE" text
					ctx.fillStyle = 'rgba(112, 128, 144, 0.2)';
					ctx.fillRect(450, 150, 480, 80);

					ctx.shadowColor = '#708090';
					ctx.shadowBlur = 15;
					ctx.font = 'bold 56px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
					const goodbyeGrad = ctx.createLinearGradient(450, 180, 900, 180);
					goodbyeGrad.addColorStop(0, '#ffffff');
					goodbyeGrad.addColorStop(1, '#708090');
					ctx.fillStyle = goodbyeGrad;
					ctx.textAlign = 'left';
					ctx.fillText('GOODBYE', 480, 210);
					ctx.shadowBlur = 0;

					// User name section
					ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
					ctx.fillRect(450, 250, 480, 90);

					ctx.font = 'bold 42px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
					const nameGrad = ctx.createLinearGradient(450, 280, 900, 280);
					nameGrad.addColorStop(0, '#9370DB');
					nameGrad.addColorStop(0.5, '#708090');
					nameGrad.addColorStop(1, '#556B2F');
					ctx.fillStyle = nameGrad;

					let displayName = userName;
					ctx.font = 'bold 38px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
					if (ctx.measureText(displayName).width > 440) {
						while (ctx.measureText(displayName + '...').width > 440) {
							displayName = displayName.slice(0, -1);
						}
						displayName += '...';
					}
					ctx.fillText(displayName, 480, 295);

					ctx.font = 'italic 22px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
					ctx.fillStyle = '#ffffff';
					ctx.fillText(isKicked ? 'Was Kicked From Group' : 'Left The Group', 480, 325);

					// Total Members box
					ctx.fillStyle = 'rgba(112, 128, 144, 0.15)';
					ctx.fillRect(450, 360, 200, 60);
					ctx.strokeStyle = 'rgba(112, 128, 144, 0.4)';
					ctx.lineWidth = 2;
					ctx.strokeRect(450, 360, 200, 60);

					ctx.font = 'bold 12px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
					ctx.fillStyle = '#708090';
					ctx.fillText('REMAINING MEMBERS', 470, 380);

					ctx.font = 'bold 20px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
					ctx.fillStyle = '#ffffff';
					ctx.fillText(`👥 ${memberCount}`, 470, 405);

					ctx.strokeStyle = 'rgba(112, 128, 144, 0.5)';
					ctx.lineWidth = 3;
					ctx.beginPath();
					ctx.moveTo(450, 450);
					ctx.lineTo(930, 450);
					ctx.stroke();

					const emojis = [
						{ x: 460, y: 480, emoji: '💔', size: 20 },
						{ x: 700, y: 490, emoji: '🫶🏻', size: 16 },
						{ x: 900, y: 475, emoji: '⭐', size: 18 }
					];

					emojis.forEach(item => {
						ctx.font = `${item.size}px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif`;
						ctx.fillStyle = '#ffffff';
						ctx.fillText(item.emoji, item.x, item.y);
					});

					ctx.font = 'bold 22px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
					const footerGrad = ctx.createLinearGradient(450, 515, 800, 515);
					footerGrad.addColorStop(0, '#9370DB');
					footerGrad.addColorStop(1, '#708090');
					ctx.fillStyle = footerGrad;
					ctx.fillText("We'll Miss You! Take Care 💔", 450, 515);

					const cachePath = path.join(cacheDir, `leave_${leftParticipantFbId}_${Date.now()}.png`);
					const buffer = canvas.toBuffer('image/png');
					await fs.writeFile(cachePath, buffer);

					message.reply({
						body: leaveMessage,
						attachment: fs.createReadStream(cachePath)
					}, () => {
						try {
							if (fs.existsSync(cachePath)) {
								fs.unlinkSync(cachePath);
							}
						} catch (err) {
							console.error("Error cleaning cache:", err);
						}
					});

				} catch (error) {
					console.error("Error generating leave card:", error);
					message.reply(leaveMessage);
				}
			};
	}
};
