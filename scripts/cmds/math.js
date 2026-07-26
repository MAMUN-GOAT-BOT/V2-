const axios = require("axios");

// SAME API as slot.js
const API_URL = "https://balance-bot-api.onrender.com";

// Get balance
async function getBalance(userID) {
  try {
    const res = await axios.get(`${API_URL}/api/balance/${userID}`);
    return typeof res.data.balance === "number" ? res.data.balance : 100;
  } catch {
    return 100;
  }
}

// Win
async function winGame(userID, amount) {
  try {
    const res = await axios.post(`${API_URL}/api/balance/win`, { userID, amount });
    return res.data.success ? res.data.balance : null;
  } catch {
    return null;
  }
}

// Lose
async function loseGame(userID, amount) {
  try {
    const res = await axios.post(`${API_URL}/api/balance/lose`, { userID, amount });
    return res.data.success ? res.data.balance : null;
  } catch {
    return null;
  }
}

// ✅ Format balance (SAFE)
function formatBalance(num) {
  const n = typeof num === "number" && !isNaN(num) ? num : 0;
  return n.toLocaleString("en-US") + " $";
}

// Generate math
function generateMath() {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let answer;
  if (op === "+") answer = a + b;
  if (op === "-") answer = a - b;
  if (op === "×") answer = a * b;

  return { question: `${a} ${op} ${b}`, answer };
}

module.exports = {
  config: {
    name: "math",
    version: "1.1",
    author: "MOHAMMAD AKASH (Fixed by S AY EM)",
    role: 0,
    category: "economy",
    shortDescription: "Math Game (Reply Based)"
  },

  onStart: async function ({ api, event }) {
    const { threadID, senderID, messageID } = event;

    const balance = await getBalance(senderID);
    if (balance < 30) {
      return api.sendMessage(
        `❌ Insufficient Balance\n💳 Balance: ${formatBalance(balance)}`,
        threadID,
        messageID
      );
    }

    const math = generateMath();

    api.sendMessage(
`✦ Mᴀᴛʜ Gᴀᴍᴇ ✦

Solve this:

${math.question} = ?

✍️ Reply with the answer`,
      threadID,
      (err, info) => {
        if (err) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "math",
          author: senderID,
          answer: math.answer,
          messageID: info.messageID
        });

        // Auto timeout (20s)
        setTimeout(() => {
          global.GoatBot.onReply.delete(info.messageID);
          api.unsendMessage(info.messageID).catch(() => {});
        }, 20000);
      },
      messageID
    );
  },

  onReply: async function ({ api, event, Reply }) {
    const { senderID, body, threadID } = event;
    if (senderID !== Reply.author) return;

    const userAns = Number(body.trim());
    if (isNaN(userAns)) return;

    await api.unsendMessage(Reply.messageID);
    global.GoatBot.onReply.delete(Reply.messageID);

    // ✅ current balance fallback
    const currentBalance = await getBalance(senderID);

    if (userAns === Reply.answer) {
      let newBal = await winGame(senderID, 200);

      // ✅ if API fails, show old balance
      if (newBal === null) newBal = currentBalance;

      return api.sendMessage(
        `✅ Correct Answer!\n🎉 +200 $\n💳 Balance: ${formatBalance(newBal)}`,
        threadID
      );
    } else {
      let newBal = await loseGame(senderID, 50);

      // ✅ if API fails, show old balance
      if (newBal === null) newBal = currentBalance;

      return api.sendMessage(
        `❌ Wrong Answer!\nCorrect: ${Reply.answer}\n−50 $\n💳 Balance: ${formatBalance(newBal)}`,
        threadID
      );
    }
  }
};
