const STORAGE_KEY = "blockyStatesQuest";
const gridSize = 6;

const STATES = [
  { state: "Alabama", capital: "Montgomery", region: "South" },
  { state: "Alaska", capital: "Juneau", region: "West" },
  { state: "Arizona", capital: "Phoenix", region: "West" },
  { state: "Arkansas", capital: "Little Rock", region: "South" },
  { state: "California", capital: "Sacramento", region: "West" },
  { state: "Colorado", capital: "Denver", region: "West" },
  { state: "Connecticut", capital: "Hartford", region: "Northeast" },
  { state: "Delaware", capital: "Dover", region: "South" },
  { state: "Florida", capital: "Tallahassee", region: "South" },
  { state: "Georgia", capital: "Atlanta", region: "South" },
  { state: "Hawaii", capital: "Honolulu", region: "West" },
  { state: "Idaho", capital: "Boise", region: "West" },
  { state: "Illinois", capital: "Springfield", region: "Midwest" },
  { state: "Indiana", capital: "Indianapolis", region: "Midwest" },
  { state: "Iowa", capital: "Des Moines", region: "Midwest" },
  { state: "Kansas", capital: "Topeka", region: "Midwest" },
  { state: "Kentucky", capital: "Frankfort", region: "South" },
  { state: "Louisiana", capital: "Baton Rouge", region: "South" },
  { state: "Maine", capital: "Augusta", region: "Northeast" },
  { state: "Maryland", capital: "Annapolis", region: "South" },
  { state: "Massachusetts", capital: "Boston", region: "Northeast" },
  { state: "Michigan", capital: "Lansing", region: "Midwest" },
  { state: "Minnesota", capital: "Saint Paul", region: "Midwest" },
  { state: "Mississippi", capital: "Jackson", region: "South" },
  { state: "Missouri", capital: "Jefferson City", region: "Midwest" },
  { state: "Montana", capital: "Helena", region: "West" },
  { state: "Nebraska", capital: "Lincoln", region: "Midwest" },
  { state: "Nevada", capital: "Carson City", region: "West" },
  { state: "New Hampshire", capital: "Concord", region: "Northeast" },
  { state: "New Jersey", capital: "Trenton", region: "Northeast" },
  { state: "New Mexico", capital: "Santa Fe", region: "West" },
  { state: "New York", capital: "Albany", region: "Northeast" },
  { state: "North Carolina", capital: "Raleigh", region: "South" },
  { state: "North Dakota", capital: "Bismarck", region: "Midwest" },
  { state: "Ohio", capital: "Columbus", region: "Midwest" },
  { state: "Oklahoma", capital: "Oklahoma City", region: "South" },
  { state: "Oregon", capital: "Salem", region: "West" },
  { state: "Pennsylvania", capital: "Harrisburg", region: "Northeast" },
  { state: "Rhode Island", capital: "Providence", region: "Northeast" },
  { state: "South Carolina", capital: "Columbia", region: "South" },
  { state: "South Dakota", capital: "Pierre", region: "Midwest" },
  { state: "Tennessee", capital: "Nashville", region: "South" },
  { state: "Texas", capital: "Austin", region: "South" },
  { state: "Utah", capital: "Salt Lake City", region: "West" },
  { state: "Vermont", capital: "Montpelier", region: "Northeast" },
  { state: "Virginia", capital: "Richmond", region: "South" },
  { state: "Washington", capital: "Olympia", region: "West" },
  { state: "West Virginia", capital: "Charleston", region: "South" },
  { state: "Wisconsin", capital: "Madison", region: "Midwest" },
  { state: "Wyoming", capital: "Cheyenne", region: "West" }
];

const BOSSES = {
  West: {
    name: "Quartz Colossus",
    flavor: "A crystal giant rises from the mesas.",
    attacks: ["Quartz shards rain down!", "The ground trembles!", "A blinding flash stuns you!"]
  },
  Midwest: {
    name: "Iron Prairie Warden",
    flavor: "Steel horns and prairie winds fill the arena.",
    attacks: ["Stampede shockwave!", "Gears grind in the wind!", "A hammering stomp cracks the earth!"]
  },
  South: {
    name: "Mossback Sentinel",
    flavor: "Vines whip as the bayou guardian awakens.",
    attacks: ["Swamp mist engulfs you!", "Roots lash out!", "A roar echoes from the wetlands!"]
  },
  Northeast: {
    name: "Stormbrick Regent",
    flavor: "Charged bricks hover with a rumbling hum.",
    attacks: ["Thunder crash!", "Electric bricks surge!", "A gale of sparks sweeps in!"]
  }
};

const BUILDINGS = [
  { id: "house", name: "House", icon: "H", cost: 10, bonus: "Adds cozy vibes. Helps your streak feel safe." },
  { id: "school", name: "School", icon: "S", cost: 20, bonus: "Boosts study power. Perfect for quiz focus." },
  { id: "park", name: "Park", icon: "P", cost: 15, bonus: "Grows green blocks. Calms boss battles." },
  { id: "library", name: "Librarium", icon: "L", cost: 25, bonus: "Stacks knowledge. Hint vibe intensifies." },
  { id: "forge", name: "Forge", icon: "F", cost: 30, bonus: "Forges coins. Hot sparks of progress." }
];

const els = {
  coins: document.getElementById("coins"),
  streak: document.getElementById("streak"),
  hintTokens: document.getElementById("hintTokens"),
  bossName: document.getElementById("bossName"),
  youHearts: document.getElementById("youHearts"),
  bossHearts: document.getElementById("bossHearts"),
  bossViewBtn: document.getElementById("bossViewBtn"),
  question: document.getElementById("question"),
  choices: document.getElementById("choices"),
  result: document.getElementById("result"),
  quizCard: document.getElementById("quizCard"),
  hintMessage: document.getElementById("hintMessage"),
  city: document.getElementById("city"),
  shop: document.getElementById("shop"),
  selectedBuilding: document.getElementById("selectedBuilding"),
  bossTitle: document.getElementById("bossTitle"),
  bossFlavor: document.getElementById("bossFlavor"),
  bossAttack: document.getElementById("bossAttack"),
  bossPrompt: document.getElementById("bossPrompt"),
  bossMiniGame: document.getElementById("bossMiniGame"),
  miniIndicator: document.getElementById("miniIndicator"),
  miniTarget: document.getElementById("miniTarget"),
  miniStatus: document.getElementById("miniStatus"),
  miniStrikeBtn: document.getElementById("miniStrikeBtn"),
  bossActionBtn: document.getElementById("bossActionBtn"),
  floatLayer: document.getElementById("floatLayer"),
  hintBtn: document.getElementById("hintBtn"),
  difficultySelect: document.getElementById("difficultySelect"),
  answerInput: document.getElementById("answerInput"),
  submitAnswer: document.getElementById("submitAnswer"),
  typeAnswer: document.getElementById("typeAnswer"),
  soundToggle: document.getElementById("soundToggle"),
  resetGame: document.getElementById("resetGame"),
  removeModeBtn: document.getElementById("removeModeBtn")
};

let currentQuestion = null;
let audioContext = null;
const miniGame = {
  active: false,
  intervalId: null,
  position: 0,
  direction: 1,
  speed: 1.8,
  targetStart: 30,
  targetEnd: 65,
  locked: false
};

function defaultState() {
  return {
    coins: 0,
    streak: 0,
    youHp: 5,
    maxHp: 5,
    boss: { active: false, region: null, name: null, hp: 0, maxHp: 0, attackIndex: 0 },
    difficulty: "easy",
    hintTokens: 0,
    totalCorrect: 0,
    selectedBuilding: null,
    removeMode: false,
    soundOn: true,
    city: Array(gridSize * gridSize).fill(null)
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch (error) {
    console.warn("Save data reset:", error);
    return defaultState();
  }
}

let state = loadState();
if (!Array.isArray(state.city) || state.city.length !== gridSize * gridSize) {
  state.city = Array(gridSize * gridSize).fill(null);
}
if (state.selectedBuilding && !BUILDINGS.some(item => item.id === state.selectedBuilding)) {
  state.selectedBuilding = null;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(list) {
  return list.sort(() => Math.random() - 0.5);
}

function playTone(freq, duration = 0.15) {
  if (!state.soundOn) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  if (!audioContext) audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = freq;
  gain.gain.value = 0.08;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function renderHearts(container, current, max) {
  container.innerHTML = "";
  for (let i = 0; i < max; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart" + (i < current ? "" : " empty");
    container.appendChild(heart);
  }
}

function updateHud() {
  els.coins.textContent = state.coins;
  els.streak.textContent = state.streak;
  els.hintTokens.textContent = state.hintTokens;
  els.bossName.textContent = state.boss.active ? state.boss.name : "None";
  renderHearts(els.youHearts, state.youHp, state.maxHp);
  renderHearts(els.bossHearts, state.boss.hp, state.boss.maxHp || 5);
  els.soundToggle.textContent = `Sound: ${state.soundOn ? "On" : "Off"}`;
  els.difficultySelect.value = state.difficulty;
  els.hintBtn.disabled = state.hintTokens === 0 || (currentQuestion && currentQuestion.hintUsed);
  els.bossViewBtn.classList.toggle("hidden", !state.boss.active);
  els.removeModeBtn.textContent = `Remove Mode: ${state.removeMode ? "On" : "Off"}`;
  els.removeModeBtn.classList.toggle("active", state.removeMode);
}

function updateBossPanel(message = null) {
  if (!state.boss.active) {
    els.bossTitle.textContent = "No boss yet.";
    els.bossFlavor.textContent = "Keep your streak to summon a regional boss!";
    els.bossAttack.textContent = "Boss attacks will show here.";
    els.bossPrompt.textContent = "Boss quiz prompts will appear when a boss arrives.";
    els.bossActionBtn.textContent = "Call Boss";
    els.bossMiniGame.classList.add("hidden");
    setMiniGameStatus("Wait for a boss to appear!");
    stopMiniGame();
    return;
  }
  const bossData = BOSSES[state.boss.region];
  els.bossTitle.textContent = `${state.boss.name} (${state.boss.region})`;
  els.bossFlavor.textContent = bossData.flavor;
  els.bossActionBtn.textContent = "Boss Strike";
  if (message) {
    els.bossAttack.textContent = message;
  }
  els.bossMiniGame.classList.remove("hidden");
  startMiniGame();
}

function updateBossPrompt() {
  if (!currentQuestion) return;
  if (!state.boss.active) {
    els.bossPrompt.textContent = "Boss quiz prompts will appear when a boss arrives.";
    return;
  }
  if (currentQuestion.mode === "state-to-capital") {
    els.bossPrompt.textContent = `Boss Challenge: State: ${currentQuestion.state} — What's the capital?`;
  } else {
    els.bossPrompt.textContent = `Boss Challenge: Capital: ${currentQuestion.capital} — Which state is it?`;
  }
}

function renderCity() {
  els.city.innerHTML = "";
  els.city.classList.toggle("remove-mode", state.removeMode);
  state.city.forEach((buildingId, index) => {
    const tile = document.createElement("div");
    tile.className = "tile " + (buildingId ? "" : "empty");
    const building = BUILDINGS.find(item => item.id === buildingId);
    tile.textContent = building ? building.icon : "·";
    tile.title = building ? `${building.name} (${building.cost} coins)` : "Empty";
    if (buildingId && state.removeMode) {
      tile.classList.add("removable");
      tile.title = `Remove ${building.name}`;
    }
    if (!buildingId && state.selectedBuilding) {
      tile.classList.add("selected");
    }
    tile.addEventListener("click", () => {
      if (state.removeMode) {
        tryRemoveBuilding(index);
      } else {
        tryPlaceBuilding(index);
      }
    });
    els.city.appendChild(tile);
  });
}

function renderShop() {
  els.shop.innerHTML = "";
  BUILDINGS.forEach(building => {
    const card = document.createElement("div");
    card.className = "shop-card tooltip";
    card.dataset.tooltip = building.bonus;

    const title = document.createElement("div");
    title.textContent = `${building.icon} ${building.name}`;
    title.className = "value";

    const cost = document.createElement("div");
    cost.textContent = `${building.cost} coins`;
    cost.className = "panel-description";

    const button = document.createElement("button");
    button.textContent = state.selectedBuilding === building.id ? "Selected" : "Select";
    button.disabled = state.selectedBuilding === building.id;
    button.addEventListener("click", () => selectBuilding(building.id));

    card.appendChild(title);
    card.appendChild(cost);
    card.appendChild(button);
    els.shop.appendChild(card);
  });
}

function updateSelectedBuildingStatus() {
  if (state.removeMode) {
    els.selectedBuilding.textContent = "Remove mode active: click a placed block to delete it.";
    return;
  }
  const building = BUILDINGS.find(item => item.id === state.selectedBuilding);
  els.selectedBuilding.textContent = building
    ? `Selected: ${building.name} (${building.cost} coins)`
    : "Select a building in the Shop.";
}

function selectBuilding(buildingId) {
  state.selectedBuilding = buildingId;
  state.removeMode = false;
  updateSelectedBuildingStatus();
  renderShop();
  renderCity();
  saveState();
}

function toggleRemoveMode() {
  state.removeMode = !state.removeMode;
  updateSelectedBuildingStatus();
  renderCity();
  saveState();
}

function tryPlaceBuilding(index) {
  if (state.city[index]) return;
  if (!state.selectedBuilding) {
    els.result.textContent = "Pick a building in the Shop before placing blocks.";
    return;
  }
  const building = BUILDINGS.find(item => item.id === state.selectedBuilding);
  if (!building) return;
  if (state.coins < building.cost) {
    els.result.textContent = "Not enough coins. Answer questions to earn more.";
    return;
  }
  state.coins -= building.cost;
  state.city[index] = building.id;
  els.result.textContent = `Built ${building.name}! (-${building.cost} coins)`;
  updateHud();
  renderCity();
  saveState();
}

function tryRemoveBuilding(index) {
  if (!state.city[index]) {
    els.result.textContent = "Nothing here yet. Click a placed block to remove it.";
    return;
  }
  const building = BUILDINGS.find(item => item.id === state.city[index]);
  state.city[index] = null;
  els.result.textContent = building
    ? `Removed ${building.name}.`
    : "Removed a building.";
  updateHud();
  renderCity();
  saveState();
}

function makeQuestion() {
  const pool = state.boss.active
    ? STATES.filter(item => item.region === state.boss.region)
    : STATES;
  const answer = pool[randInt(pool.length)];
  const askStateToCapital = Math.random() < 0.5;

  let question;
  let correct;
  if (askStateToCapital) {
    question = `What is the capital of ${answer.state}?`;
    correct = answer.capital;
  } else {
    question = `${answer.capital} is the capital of which state?`;
    correct = answer.state;
  }

  const choicePool = askStateToCapital ? STATES.map(item => item.capital) : STATES.map(item => item.state);
  const choices = new Set([correct]);
  while (choices.size < 4) choices.add(choicePool[randInt(choicePool.length)]);
  return {
    question,
    correct,
    choices: shuffle(Array.from(choices)),
    hintUsed: false,
    mode: askStateToCapital ? "state-to-capital" : "capital-to-state",
    state: answer.state,
    capital: answer.capital
  };
}

function renderQuestion() {
  currentQuestion = makeQuestion();
  els.question.textContent = currentQuestion.question;
  els.result.textContent = "";
  els.hintMessage.textContent = "";
  els.choices.innerHTML = "";
  els.answerInput.value = "";
  els.hintBtn.disabled = state.hintTokens === 0;

  if (state.difficulty === "hard") {
    els.typeAnswer.classList.remove("hidden");
    els.choices.classList.add("hidden");
  } else {
    els.typeAnswer.classList.add("hidden");
    els.choices.classList.remove("hidden");
    currentQuestion.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.textContent = choice;
      btn.addEventListener("click", () => handleAnswer(choice));
      els.choices.appendChild(btn);
    });
  }

  updateHud();
  renderCity();
  updateBossPanel();
  updateBossPrompt();
}

function applyQuestionFeedback(correct) {
  els.quizCard.classList.remove("pop", "shake");
  void els.quizCard.offsetWidth;
  els.quizCard.classList.add(correct ? "pop" : "shake");
}

function showFloatingText(text, anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const float = document.createElement("div");
  float.className = "float-text";
  float.textContent = text;
  float.style.left = `${rect.left + rect.width / 2}px`;
  float.style.top = `${rect.top}px`;
  els.floatLayer.appendChild(float);
  setTimeout(() => float.remove(), 1100);
}

function setMiniGameStatus(message) {
  els.miniStatus.textContent = message;
}

function resetMiniGameTarget() {
  const width = 18 + randInt(14);
  const start = randInt(100 - width);
  miniGame.targetStart = start;
  miniGame.targetEnd = start + width;
  els.miniTarget.style.left = `${start}%`;
  els.miniTarget.style.width = `${width}%`;
}

function updateMiniGameIndicator() {
  if (!miniGame.active) return;
  miniGame.position += miniGame.direction * miniGame.speed;
  if (miniGame.position <= 0 || miniGame.position >= 100) {
    miniGame.direction *= -1;
    miniGame.position = Math.max(0, Math.min(100, miniGame.position));
  }
  els.miniIndicator.style.left = `calc(${miniGame.position}% - 6px)`;
}

function startMiniGame() {
  if (!state.boss.active || miniGame.intervalId) return;
  miniGame.active = true;
  resetMiniGameTarget();
  miniGame.position = randInt(100);
  miniGame.direction = Math.random() < 0.5 ? -1 : 1;
  els.miniStrikeBtn.disabled = false;
  setMiniGameStatus("Time your strike for bonus damage!");
  miniGame.intervalId = setInterval(updateMiniGameIndicator, 30);
}

function stopMiniGame() {
  miniGame.active = false;
  if (miniGame.intervalId) {
    clearInterval(miniGame.intervalId);
    miniGame.intervalId = null;
  }
  miniGame.locked = false;
  els.miniStrikeBtn.disabled = true;
}

function clearBossBattle() {
  state.boss = { active: false, region: null, name: null, hp: 0, maxHp: 0, attackIndex: 0 };
  stopMiniGame();
  updateBossPanel();
}

function handleMiniStrike() {
  if (!state.boss.active || miniGame.locked) return;
  miniGame.locked = true;
  els.miniStrikeBtn.disabled = true;

  const success = miniGame.position >= miniGame.targetStart && miniGame.position <= miniGame.targetEnd;
  if (success) {
    state.boss.hp -= 2;
    playTone(880, 0.18);
    setMiniGameStatus("Critical hit! The boss takes 2 damage.");
    els.result.textContent = "Mini-game success! Bonus damage dealt.";
    if (state.boss.hp <= 0) {
      els.result.textContent = `${state.boss.name} shatters after your perfect strike!`;
      clearBossBattle();
      updateHud();
      saveState();
      return;
    }
    updateBossPanel("The boss reels from the perfect strike!");
  } else {
    state.youHp -= 1;
    playTone(180, 0.2);
    setMiniGameStatus("Missed! The boss counters for 1 damage.");
    els.result.textContent = `${state.boss.name} counters your mistimed strike.`;
    if (state.youHp <= 0) {
      els.result.textContent = `${state.boss.name} wins this round. Regroup and try again!`;
      state.youHp = state.maxHp;
      state.streak = 0;
      clearBossBattle();
      updateHud();
      saveState();
      return;
    }
    updateBossPanel("The boss swats away your strike!");
  }

  updateHud();
  saveState();
  setTimeout(() => {
    if (!state.boss.active) return;
    miniGame.locked = false;
    els.miniStrikeBtn.disabled = false;
    resetMiniGameTarget();
    setMiniGameStatus("Keep the spark in the zone!");
  }, 700);
}

function startBossBattle() {
  if (state.boss.active) return;
  if (state.streak > 0 && state.streak % 10 === 0) {
    const regions = Object.keys(BOSSES);
    const region = regions[randInt(regions.length)];
    const bossData = BOSSES[region];
    state.boss = {
      active: true,
      region,
      name: bossData.name,
      hp: 5,
      maxHp: 5,
      attackIndex: 0
    };
    state.youHp = state.maxHp;
    els.result.textContent = `Boss battle begins! ${bossData.name} approaches.`;
    updateBossPanel("The boss roars as the battle begins!");
    startMiniGame();
  }
}

function summonBossNow() {
  if (state.boss.active) return;
  const regions = Object.keys(BOSSES);
  const region = regions[randInt(regions.length)];
  const bossData = BOSSES[region];
  state.boss = {
    active: true,
    region,
    name: bossData.name,
    hp: 5,
    maxHp: 5,
    attackIndex: 0
  };
  state.youHp = state.maxHp;
  els.result.textContent = `You called ${bossData.name} into the arena!`;
  updateBossPanel("The boss emerges and sizes you up.");
  updateBossPrompt();
  updateHud();
  saveState();
}

function triggerBossStrike() {
  if (!state.boss.active) {
    summonBossNow();
    return;
  }
  const bossData = BOSSES[state.boss.region];
  const attackText = bossData.attacks[state.boss.attackIndex % bossData.attacks.length];
  state.boss.attackIndex += 1;
  state.youHp -= 1;
  els.result.textContent = `${state.boss.name} lashes out at you!`;
  updateBossPanel(attackText);
  if (state.youHp <= 0) {
    els.result.textContent = `${state.boss.name} wins this round. Regroup and try again!`;
    state.youHp = state.maxHp;
    state.streak = 0;
    clearBossBattle();
  }
  updateHud();
  saveState();
}

function handleCorrectAnswer() {
  state.coins += 10;
  state.streak += 1;
  state.totalCorrect += 1;
  applyQuestionFeedback(true);
  showFloatingText("+10", els.coins);
  playTone(660);

  if (state.totalCorrect % 5 === 0) {
    state.hintTokens += 1;
    els.hintMessage.textContent = "Hint token earned!";
  }

  if (state.boss.active) {
    state.boss.hp -= 1;
    els.result.textContent = `Direct hit! ${state.boss.name} loses 1 HP.`;
    if (state.boss.hp <= 0) {
      els.result.textContent = `${state.boss.name} crumbles into blocks. Victory!`;
      clearBossBattle();
      return;
    }
    updateBossPanel("The boss staggers from your strike!");
  } else {
    els.result.textContent = "Correct! Build in your city to celebrate.";
    startBossBattle();
  }
}

function handleWrongAnswer() {
  applyQuestionFeedback(false);
  playTone(220);
  if (state.boss.active) {
    state.youHp -= 1;
    const bossData = BOSSES[state.boss.region];
    const attackText = bossData.attacks[state.boss.attackIndex % bossData.attacks.length];
    state.boss.attackIndex += 1;
    els.result.textContent = `Ouch! ${state.boss.name} strikes back.`;
    updateBossPanel(attackText);
    if (state.youHp <= 0) {
      els.result.textContent = `${state.boss.name} wins this round. Regroup and try again!`;
      state.youHp = state.maxHp;
      state.streak = 0;
      clearBossBattle();
    }
  } else {
    els.result.textContent = `Not quite. The correct answer was ${currentQuestion.correct}.`;
    state.streak = 0;
  }
}

function handleAnswer(choice) {
  const correct = choice === currentQuestion.correct;
  if (state.difficulty !== "hard") {
    [...els.choices.children].forEach(button => {
      const isCorrect = button.textContent === currentQuestion.correct;
      button.classList.add(isCorrect ? "correct" : "wrong");
      button.disabled = true;
    });
  }

  if (correct) {
    handleCorrectAnswer();
  } else {
    handleWrongAnswer();
  }
  updateHud();
  saveState();
  setTimeout(renderQuestion, 900);
}

function handleTypedAnswer() {
  const value = els.answerInput.value.trim();
  if (!value) return;
  const correctNormalized = currentQuestion.correct.toLowerCase();
  const userNormalized = value.toLowerCase();
  const correct = userNormalized === correctNormalized;
  if (correct) {
    handleCorrectAnswer();
  } else {
    handleWrongAnswer();
  }
  updateHud();
  saveState();
  setTimeout(renderQuestion, 900);
}

function useHint() {
  if (state.hintTokens <= 0 || currentQuestion.hintUsed) return;
  currentQuestion.hintUsed = true;
  state.hintTokens -= 1;
  els.hintBtn.disabled = true;

  if (state.difficulty === "hard") {
    els.hintMessage.textContent = `Hint: starts with "${currentQuestion.correct.charAt(0)}".`;
  } else {
    const buttons = [...els.choices.querySelectorAll("button")];
    const wrongButtons = buttons.filter(btn => btn.textContent !== currentQuestion.correct);
    const removeCount = state.difficulty === "easy" ? 2 : 1;
    shuffle(wrongButtons).slice(0, removeCount).forEach(btn => {
      btn.classList.add("disabled");
      btn.disabled = true;
    });
    els.hintMessage.textContent = "Hint used!";
  }
  updateHud();
  saveState();
}

function initNav() {
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      setActivePanel(button.dataset.panel);
    });
  });
}

function setActivePanel(panelKey) {
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.panel === panelKey));
  document.querySelectorAll(".panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `panel-${panelKey}`);
  });
}

function resetGame() {
  if (!confirm("Reset everything? Your city and coins will be wiped.")) return;
  state = defaultState();
  saveState();
  location.reload();
}

function init() {
  initNav();
  updateHud();
  renderShop();
  renderCity();
  updateSelectedBuildingStatus();
  renderQuestion();

  els.hintBtn.addEventListener("click", useHint);
  els.submitAnswer.addEventListener("click", handleTypedAnswer);
  els.answerInput.addEventListener("keydown", event => {
    if (event.key === "Enter") handleTypedAnswer();
  });
  els.soundToggle.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    updateHud();
    saveState();
  });
  els.difficultySelect.addEventListener("change", event => {
    state.difficulty = event.target.value;
    saveState();
    renderQuestion();
  });
  els.resetGame.addEventListener("click", resetGame);
  els.miniStrikeBtn.addEventListener("click", handleMiniStrike);
  els.bossActionBtn.addEventListener("click", triggerBossStrike);
  els.removeModeBtn.addEventListener("click", toggleRemoveMode);
  els.bossViewBtn.addEventListener("click", () => {
    if (!state.boss.active) return;
    setActivePanel("boss");
    triggerBossStrike();
  });
}

init();
