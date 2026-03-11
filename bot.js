const mineflayer = require("mineflayer");
const config = require("./config.json");
const { startRandomMovement } = require("./movement");

let bot = null;
let stopMovement = null;
let chatTimer = null;
let reconnectTimer = null;

function clearTimers() {
  if (stopMovement) {
    stopMovement();
    stopMovement = null;
  }

  if (chatTimer) {
    clearInterval(chatTimer);
    chatTimer = null;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (reconnectTimer) {
    return;
  }

  console.log(
    `[Reconnect] Trying again in ${config.reconnectDelay / 1000} seconds...`
  );

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createBot();
  }, config.reconnectDelay);
}

function startChatLoop() {
  if (chatTimer) {
    clearInterval(chatTimer);
  }

  chatTimer = setInterval(() => {
    if (!bot || !bot.player) {
      return;
    }

    bot.chat(config.chatMessage);
    console.log(`[Chat] Sent message: ${config.chatMessage}`);
  }, config.chatInterval);
}

function createBot() {
  clearTimers();

  console.log("[Bot] Connecting to server...");

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version
  });

  bot.once("spawn", () => {
    console.log("[Bot] Connected and spawned successfully.");

    stopMovement = startRandomMovement(bot, {
      moveInterval: config.moveInterval
    });

    startChatLoop();
  });

  bot.on("login", () => {
    console.log("[Bot] Logged in.");
  });

  bot.on("end", () => {
    console.log("[Bot] Disconnected from the server.");
    clearTimers();
    scheduleReconnect();
  });

  bot.on('kicked', (reason) => {
  console.log('[Bot] Kicked from server:', JSON.stringify(reason, null, 2))
})

  bot.on("error", (error) => {
    console.log(`[Bot] Error: ${error.message}`);
  });
}

createBot();

