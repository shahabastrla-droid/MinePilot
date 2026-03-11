function startRandomMovement(bot, options = {}) {
  const moveInterval = options.moveInterval || 30000;
  let movementTimer = null;

  function performRandomAction() {
    // Do nothing if the bot is not fully connected to the world yet.
    if (!bot.entity) {
      return;
    }

    const directions = ["forward", "back", "left", "right"];
    const randomDirection =
      directions[Math.floor(Math.random() * directions.length)];
    const shouldJump = Math.random() < 0.35;

    console.log(`[Movement] Walking ${randomDirection}${shouldJump ? " and jumping" : ""}.`);

    bot.setControlState(randomDirection, true);

    if (shouldJump) {
      bot.setControlState("jump", true);
    }

    // Move for a short time, then stop so the bot looks naturally AFK-active.
    setTimeout(() => {
      bot.setControlState(randomDirection, false);

      if (shouldJump) {
        bot.setControlState("jump", false);
      }
    }, 2000 + Math.floor(Math.random() * 2000));
  }

  movementTimer = setInterval(performRandomAction, moveInterval);

  return function stopRandomMovement() {
    if (movementTimer) {
      clearInterval(movementTimer);
      movementTimer = null;
    }

    // Clear all movement states to prevent stuck inputs after disconnects.
    bot.clearControlStates();
  };
}

module.exports = {
  startRandomMovement
};
