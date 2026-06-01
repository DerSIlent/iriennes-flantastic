const catchStage = document.querySelector("[data-catch-stage]");
const catchCatcher = document.querySelector("[data-catch-catcher]");
const catchScore = document.querySelector("[data-catch-score]");
const catchStreak = document.querySelector("[data-catch-streak]");
const catchStatus = document.querySelector("[data-catch-status]");
const catchStartButton = document.querySelector("[data-catch-start]");
const catchPauseButton = document.querySelector("[data-catch-pause]");
const catchResetButton = document.querySelector("[data-catch-reset]");
const gameHomeLink = document.querySelector("[data-catch-home]");

const gameState = {
  running: false,
  started: false,
  score: 0,
  bestScore: 0,
  streak: 0,
  maxStreak: 0,
  plateX: 0.5,
  drops: [],
  lastFrame: 0,
  spawnClock: 0,
  spawnInterval: 940,
  nextDropId: 0,
  runId: 0,
  runStartedAt: null,
  reportedRunId: null,
  keys: {
    left: false,
    right: false
  }
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateHud() {
  if (catchScore) {
    catchScore.textContent = String(gameState.score);
  }

  if (catchStreak) {
    catchStreak.textContent = String(gameState.streak);
  }
}

function setCatchStatus(message) {
  if (catchStatus) {
    catchStatus.textContent = message;
  }
}

function startScoreRun() {
  if (gameState.runStartedAt) {
    return;
  }

  gameState.runId += 1;
  gameState.runStartedAt = Date.now();
  gameState.reportedRunId = null;
  gameState.bestScore = gameState.score;
  gameState.maxStreak = gameState.streak;
}

function updateRunStats() {
  gameState.bestScore = Math.max(gameState.bestScore, gameState.score);
  gameState.maxStreak = Math.max(gameState.maxStreak, gameState.streak);
}

function trackGameScore(finishReason) {
  if (!gameState.started || !gameState.runStartedAt || gameState.reportedRunId === gameState.runId) {
    return;
  }

  const durationSeconds = Math.max(0, Math.round((Date.now() - gameState.runStartedAt) / 1000));

  window.iriennesTrackEvent?.("post_score", {
    duration_seconds: durationSeconds,
    finish_reason: finishReason,
    game_name: "caramel_catch",
    high_score: gameState.bestScore,
    max_streak: gameState.maxStreak,
    score: gameState.score,
    transport_type: "beacon"
  });

  gameState.reportedRunId = gameState.runId;
}

function resetRunTracking(keepPlaying) {
  gameState.bestScore = gameState.score;
  gameState.maxStreak = gameState.streak;
  gameState.runStartedAt = keepPlaying ? Date.now() : null;
  gameState.started = keepPlaying;

  if (keepPlaying) {
    gameState.runId += 1;
    gameState.reportedRunId = null;
  }
}

function updateCatcherPosition() {
  if (catchCatcher) {
    catchCatcher.style.setProperty("--catcher-left", `${gameState.plateX * 100}%`);
  }
}

function makeDrop() {
  if (!catchStage) {
    return;
  }

  const roll = Math.random();
  const isBad = gameState.score > 6 && roll < 0.16;
  const isBonus = !isBad && roll > 0.82;
  const drop = document.createElement("div");
  const x = Math.random() * 0.86 + 0.07;
  const speed = (isBonus ? 190 : isBad ? 175 : 148) + Math.min(gameState.score * 2.5, 180) + Math.random() * 48;

  drop.className = isBonus ? "falling-caramel bonus-caramel" : isBad ? "falling-caramel bad-caramel" : "falling-caramel";
  drop.style.setProperty("--drop-x", `${x * 100}%`);
  drop.style.transform = `translate(-50%, -80px)`;
  drop.setAttribute("aria-hidden", "true");

  const model = {
    id: gameState.nextDropId,
    element: drop,
    x,
    y: -80,
    speed,
    value: isBonus ? 5 : isBad ? -3 : 1,
    type: isBonus ? "bonus" : isBad ? "bad" : "caramel",
    caught: false
  };

  gameState.nextDropId += 1;
  gameState.drops.push(model);
  catchStage.appendChild(drop);
}

function removeDrop(drop, className) {
  drop.caught = true;
  drop.element.classList.add(className);
  window.setTimeout(() => drop.element.remove(), 260);
}

function overlaps(rectA, rectB) {
  return rectA.left < rectB.right
    && rectA.right > rectB.left
    && rectA.top < rectB.bottom
    && rectA.bottom > rectB.top;
}

function catchDrop(drop) {
  if (drop.type === "bad") {
    gameState.score = Math.max(0, gameState.score + drop.value);
    gameState.streak = 0;
    updateRunStats();
    updateHud();
    setCatchStatus("Too toasty! Dodge the dark caramel.");
    removeDrop(drop, "is-missed");
    return;
  }

  gameState.streak += 1;
  const streakBonus = gameState.streak > 0 && gameState.streak % 8 === 0 ? 3 : 0;
  gameState.score += drop.value + streakBonus;
  updateRunStats();
  updateHud();
  setCatchStatus(streakBonus ? "Combo scoop! Streak bonus!" : drop.type === "bonus" ? "Golden caramel! Bonus points!" : gameState.streak >= 5 ? "Sweet streak going!" : "Caught!");
  removeDrop(drop, "is-caught");
}

function missDrop(drop) {
  if (drop.type === "bad") {
    setCatchStatus("Nice dodge. Keep the plate clean!");
    removeDrop(drop, "is-missed");
    return;
  }

  gameState.streak = 0;
  updateRunStats();
  updateHud();
  setCatchStatus("A caramel escaped. Keep going!");
  removeDrop(drop, "is-missed");
}

function updateDrops(deltaSeconds) {
  if (!catchStage || !catchCatcher) {
    return;
  }

  const stageRect = catchStage.getBoundingClientRect();
  const catcherRect = catchCatcher.getBoundingClientRect();

  gameState.drops.forEach((drop) => {
    if (drop.caught) {
      return;
    }

    drop.y += drop.speed * deltaSeconds;
    drop.element.style.transform = `translate(-50%, ${drop.y}px)`;

    const dropRect = drop.element.getBoundingClientRect();

    if (overlaps(dropRect, catcherRect)) {
      catchDrop(drop);
      return;
    }

    if (dropRect.top > stageRect.bottom + 16) {
      missDrop(drop);
    }
  });

  gameState.drops = gameState.drops.filter((drop) => !drop.caught);
}

function updateGameSpeed() {
  gameState.spawnInterval = Math.max(430, 940 - Math.min(gameState.score, 120) * 4);
}

function gameLoop(timestamp) {
  if (!gameState.running) {
    gameState.lastFrame = 0;
    return;
  }

  if (!gameState.lastFrame) {
    gameState.lastFrame = timestamp;
  }

  const delta = Math.min((timestamp - gameState.lastFrame) / 1000, 0.04);
  gameState.lastFrame = timestamp;

  if (gameState.keys.left || gameState.keys.right) {
    const direction = (gameState.keys.right ? 1 : 0) - (gameState.keys.left ? 1 : 0);
    gameState.plateX = clamp(gameState.plateX + direction * delta * 0.86, 0.08, 0.92);
    updateCatcherPosition();
  }

  gameState.spawnClock += delta * 1000;
  updateGameSpeed();

  if (gameState.spawnClock >= gameState.spawnInterval) {
    gameState.spawnClock = 0;
    makeDrop();
  }

  updateDrops(delta);
  window.requestAnimationFrame(gameLoop);
}

function startCatchGame() {
  if (!catchStage || gameState.running) {
    return;
  }

  gameState.running = true;
  gameState.started = true;
  startScoreRun();
  gameState.spawnClock = gameState.spawnInterval;
  catchStage.classList.add("is-running");
  setCatchStatus("Move the plate. Catch everything sweet.");
  catchStartButton.textContent = "Playing";
  catchPauseButton.textContent = "Pause (Esc)";
  catchStage.focus();
  window.requestAnimationFrame(gameLoop);
}

function pauseCatchGame() {
  if (!gameState.running) {
    if (gameState.started) {
      startCatchGame();
    }

    return;
  }

  gameState.running = false;
  catchStage.classList.remove("is-running");
  catchPauseButton.textContent = "Resume (Esc)";
  catchStartButton.textContent = "Start game";
  setCatchStatus("Paused. Resume when the caramel calls.");
}

function resetCatchGame() {
  trackGameScore("reset_score");
  gameState.score = 0;
  gameState.streak = 0;
  gameState.spawnClock = 0;
  gameState.nextDropId = 0;
  gameState.drops.forEach((drop) => drop.element.remove());
  gameState.drops = [];
  resetRunTracking(gameState.running);
  updateHud();
  setCatchStatus(gameState.running ? "Fresh score. Catch the next drop!" : "Score reset. Press start when ready.");
}

function handlePointerMove(event) {
  if (!catchStage) {
    return;
  }

  const rect = catchStage.getBoundingClientRect();
  const pointX = event.clientX ?? event.touches?.[0]?.clientX;

  if (typeof pointX !== "number") {
    return;
  }

  gameState.plateX = clamp((pointX - rect.left) / rect.width, 0.08, 0.92);
  updateCatcherPosition();
}

function releaseMovementKeys() {
  gameState.keys.left = false;
  gameState.keys.right = false;
}

if (catchStartButton) {
  catchStartButton.addEventListener("click", startCatchGame);
}

if (catchPauseButton) {
  catchPauseButton.addEventListener("click", pauseCatchGame);
}

if (catchResetButton) {
  catchResetButton.addEventListener("click", resetCatchGame);
}

if (gameHomeLink) {
  gameHomeLink.addEventListener("click", () => {
    trackGameScore("home_click");
  });
}

if (catchStage) {
  catchStage.addEventListener("pointermove", handlePointerMove);
  catchStage.addEventListener("pointerdown", (event) => {
    handlePointerMove(event);

    if (!gameState.running) {
      startCatchGame();
    }
  });

  catchStage.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      pauseCatchGame();
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
      gameState.keys.left = true;
      event.preventDefault();
    }

    if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
      gameState.keys.right = true;
      event.preventDefault();
    }

    if (event.key === " " || event.key === "Enter") {
      startCatchGame();
      event.preventDefault();
    }
  });

  catchStage.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
      gameState.keys.left = false;
    }

    if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
      gameState.keys.right = false;
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      pauseCatchGame();
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
      gameState.keys.left = false;
    }

    if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
      gameState.keys.right = false;
    }
  });

  window.addEventListener("blur", releaseMovementKeys);
  window.addEventListener("pagehide", () => {
    trackGameScore("page_exit");
  });
}

updateHud();
updateCatcherPosition();
