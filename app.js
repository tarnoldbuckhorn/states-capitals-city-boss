const APP_VERSION_KEY = "statesQuestVersion";

async function checkForUpdatedBuild() {
  try {
    const response = await fetch("version.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    const deployedVersion = data?.version;
    if (!deployedVersion) return;

    const currentUrl = new URL(window.location.href);
    const currentBuildParam = currentUrl.searchParams.get("build");
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);

    if (storedVersion === deployedVersion) {
      return;
    }

    localStorage.setItem(APP_VERSION_KEY, deployedVersion);

    if (currentBuildParam === deployedVersion) {
      return;
    }

    currentUrl.searchParams.set("build", deployedVersion);
    window.location.replace(currentUrl.toString());
  } catch (error) {
    console.warn("Version check skipped:", error);
  }
}

checkForUpdatedBuild();

const STORAGE_KEY = "statesQuest";
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
const STATE_NAMES = new Set(STATES.map(item => item.state));

let STATE_SHAPES = [];
const STATE_SHAPES_GEOJSON_URL =
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";

function polygonToPath(rings, bounds, width, height, padding) {
  const [minLon, minLat, maxLon, maxLat] = bounds;
  const lonSpan = Math.max(maxLon - minLon, 0.0001);
  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const scaleX = (width - padding * 2) / lonSpan;
  const scaleY = (height - padding * 2) / latSpan;
  const scale = Math.min(scaleX, scaleY);
  const drawWidth = lonSpan * scale;
  const drawHeight = latSpan * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;
  const paths = rings.map(ring => {
    return ring
      .map(([lon, lat], index) => {
        const x = ((lon - minLon) * scale + offsetX).toFixed(2);
        const y = ((maxLat - lat) * scale + offsetY).toFixed(2);
        return `${index === 0 ? "M" : "L"}${x} ${y}`;
      })
      .join(" ");
  });
  return `${paths.map(part => `${part} Z`).join(" ")} `;
}

function geometryToShapePath(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const points = polygons.flat(2);
  const lons = points.map(point => point[0]);
  const lats = points.map(point => point[1]);
  const bounds = [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
  const segments = polygons.map(polygon => polygonToPath(polygon, bounds, 120, 120, 8));
  return { viewBox: "0 0 120 120", path: segments.join(" ") };
}

async function loadStateShapes() {
  try {
    const response = await fetch(STATE_SHAPES_GEOJSON_URL);
    if (!response.ok) throw new Error(`Shape source unavailable (${response.status}).`);
    const data = await response.json();
    STATE_SHAPES = data.features
      .map(feature => {
        const state = feature.properties?.name;
        const geometry = feature.geometry;
        if (!state || !STATE_NAMES.has(state) || !geometry) return null;
        const shape = geometryToShapePath(geometry);
        return { state, ...shape };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn("State shapes unavailable:", error);
    STATE_SHAPES = [];
  }
}

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


const BADGES = [
  { id: "starter", icon: "🌟", name: "Starter Star", test: game => game.totalCorrect >= 5, next: "Answer 5 correct" },
  { id: "streak", icon: "🔥", name: "Streak Spark", test: game => game.streak >= 5, next: "Reach a 5-answer streak" },
  { id: "boss", icon: "🐉", name: "Boss Ready", test: game => game.totalCorrect >= 10, next: "Answer 10 correct" },
  { id: "scholar", icon: "🎓", name: "Capital Scholar", test: game => game.totalCorrect >= 25, next: "Answer 25 correct" }
];

const REGION_ICONS = {
  West: "🏔️",
  Midwest: "🌽",
  South: "🎸",
  Northeast: "🗽"
};

const REGION_FACTS = {
  West: "The West mission covers mountains, deserts, islands, and Pacific coast capitals.",
  Midwest: "The Midwest mission is packed with prairie, Great Lakes, and river capitals.",
  South: "The South mission includes Gulf, Appalachian, Atlantic, and music-city capitals.",
  Northeast: "The Northeast mission is small on the map but huge in early U.S. history."
};

const QUESTION_MODE_LABELS = {
  mixed: "Mixed Mission",
  capitals: "Capital Dash",
  states: "State Match",
  regions: "Region Rally",
  shapes: "Shape Hunt"
};

const RANKS = [
  { min: 0, title: "Rookie Ranger" },
  { min: 5, title: "Map Scout" },
  { min: 15, title: "Capital Captain" },
  { min: 30, title: "State Superstar" },
  { min: 50, title: "Quest Legend" }
];

const els = {
  points: document.getElementById("points"),
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
  bossTitle: document.getElementById("bossTitle"),
  bossFlavor: document.getElementById("bossFlavor"),
  bossAttack: document.getElementById("bossAttack"),
  bossPrompt: document.getElementById("bossPrompt"),
  bossLearningTip: document.getElementById("bossLearningTip"),
  bossActionBtn: document.getElementById("bossActionBtn"),
  floatLayer: document.getElementById("floatLayer"),
  hintBtn: document.getElementById("hintBtn"),
  difficultySelect: document.getElementById("difficultySelect"),
  answerInput: document.getElementById("answerInput"),
  submitAnswer: document.getElementById("submitAnswer"),
  typeAnswer: document.getElementById("typeAnswer"),
  soundToggle: document.getElementById("soundToggle"),
  updateTimestamp: document.getElementById("updateTimestamp"),
  resetGame: document.getElementById("resetGame"),
  stateShape: document.getElementById("stateShape"),
  dailyQuest: document.getElementById("dailyQuest"),
  rankTitle: document.getElementById("rankTitle"),
  nextBadge: document.getElementById("nextBadge"),
  badgeShelf: document.getElementById("badgeShelf"),
  quizModeLabel: document.getElementById("quizModeLabel"),
  quizComboLabel: document.getElementById("quizComboLabel"),
  questionModeSelect: document.getElementById("questionModeSelect"),
  randomStateBtn: document.getElementById("randomStateBtn"),
  passportTitle: document.getElementById("passportTitle"),
  passportFact: document.getElementById("passportFact"),
  regionExplorer: document.getElementById("regionExplorer")
};

let currentQuestion = null;
let audioContext = null;
function formatViewedAt(date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "medium"
    }).format(date);
  } catch (error) {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }
}

function renderUpdateTimestamp() {
  const buildVersion = new URLSearchParams(window.location.search).get("build");
  const viewedAt = new Date();
  const viewedAtText = formatViewedAt(viewedAt);

  els.updateTimestamp.textContent = buildVersion
    ? `Updated: ${viewedAtText} (build ${buildVersion})`
    : `Updated: ${viewedAtText}`;
}

function defaultState() {
  return {
    points: 0,
    streak: 0,
    youHp: 5,
    maxHp: 5,
    boss: { active: false, region: null, name: null, hp: 0, maxHp: 0, attackIndex: 0 },
    difficulty: "easy",
    questionMode: "mixed",
    hintTokens: 0,
    totalCorrect: 0,
    soundOn: true
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw);
    if (parsed.points === undefined && parsed.coins !== undefined) {
      parsed.points = parsed.coins;
    }
    delete parsed.coins;
    return { ...defaultState(), ...parsed };
  } catch (error) {
    console.warn("Save data reset:", error);
    return defaultState();
  }
}

let state = loadState();

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


function getCurrentRank() {
  return [...RANKS].reverse().find(rank => state.totalCorrect >= rank.min) || RANKS[0];
}

function getEarnedBadges() {
  return BADGES.filter(badge => badge.test(state));
}

function getNextBadgeText() {
  const nextBadge = BADGES.find(badge => !badge.test(state));
  return nextBadge ? nextBadge.next : "All badges collected!";
}

function renderProgressBoard() {
  els.rankTitle.textContent = getCurrentRank().title;
  els.nextBadge.textContent = getNextBadgeText();
  const earnedBadges = getEarnedBadges();
  els.badgeShelf.innerHTML = "";

  if (earnedBadges.length === 0) {
    const empty = document.createElement("span");
    empty.className = "empty-badge";
    empty.textContent = "Earn your first badge with 5 correct answers!";
    els.badgeShelf.appendChild(empty);
    return;
  }

  earnedBadges.forEach(badge => {
    const chip = document.createElement("span");
    chip.className = "badge-chip";
    chip.textContent = `${badge.icon} ${badge.name}`;
    els.badgeShelf.appendChild(chip);
  });
}

function getDailyQuestState() {
  const dayIndex = Math.floor(Date.now() / 86400000) % STATES.length;
  return STATES[dayIndex];
}

function renderDailyQuest() {
  const questState = getDailyQuestState();
  els.dailyQuest.textContent = `Quest Stop: ${questState.state} → ${questState.capital}`;
}

function getStateFact(item) {
  return `${item.capital} is the capital of ${item.state}. ${REGION_FACTS[item.region]}`;
}

function showPassportState(item) {
  els.passportTitle.textContent = `${REGION_ICONS[item.region]} ${item.state}: ${item.capital}`;
  els.passportFact.textContent = getStateFact(item);
}

function renderExplorer() {
  els.regionExplorer.innerHTML = "";
  Object.keys(REGION_ICONS).forEach(region => {
    const statesInRegion = STATES.filter(item => item.region === region);
    const regionCard = document.createElement("section");
    regionCard.className = "region-card";

    const heading = document.createElement("h3");
    heading.textContent = `${REGION_ICONS[region]} ${region}`;

    const fact = document.createElement("p");
    fact.className = "panel-description";
    fact.textContent = REGION_FACTS[region];

    const list = document.createElement("div");
    list.className = "state-pill-list";
    statesInRegion.forEach(item => {
      const button = document.createElement("button");
      button.className = "state-pill";
      button.textContent = `${item.state} • ${item.capital}`;
      button.addEventListener("click", () => showPassportState(item));
      list.appendChild(button);
    });

    regionCard.appendChild(heading);
    regionCard.appendChild(fact);
    regionCard.appendChild(list);
    els.regionExplorer.appendChild(regionCard);
  });
}

function surprisePassportState() {
  showPassportState(STATES[randInt(STATES.length)]);
}

function createConfettiBurst(anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const symbols = ["⭐", "✨", "🎉", "🗺️", "🚀"];
  for (let i = 0; i < 14; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.textContent = symbols[randInt(symbols.length)];
    piece.style.left = `${rect.left + rect.width / 2}px`;
    piece.style.top = `${rect.top + rect.height / 2}px`;
    piece.style.setProperty("--x", `${randInt(180) - 90}px`);
    piece.style.setProperty("--y", `${-40 - randInt(100)}px`);
    piece.style.animationDelay = `${i * 20}ms`;
    els.floatLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 1200);
  }
}

function renderHearts(container, current, max) {
  container.innerHTML = "";
  for (let i = 0; i < max; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart" + (i < current ? "" : " empty");
    heart.textContent = "♥";
    container.appendChild(heart);
  }
}

function updateHud() {
  els.points.textContent = state.points;
  els.streak.textContent = state.streak;
  els.hintTokens.textContent = state.hintTokens;
  els.bossName.textContent = state.boss.active ? state.boss.name : "None";
  renderHearts(els.youHearts, state.youHp, state.maxHp);
  renderHearts(els.bossHearts, state.boss.hp, state.boss.maxHp || 5);
  els.soundToggle.textContent = `Sound: ${state.soundOn ? "On" : "Off"}`;
  els.difficultySelect.value = state.difficulty;
  els.questionModeSelect.value = state.questionMode || "mixed";
  els.quizModeLabel.textContent = QUESTION_MODE_LABELS[state.questionMode || "mixed"];
  els.quizComboLabel.textContent = `Combo x${Math.max(1, state.streak || 0)}`;
  renderProgressBoard();
  els.hintBtn.disabled = state.hintTokens === 0 || (currentQuestion && currentQuestion.hintUsed);
  els.bossViewBtn.classList.toggle("hidden", !state.boss.active);
}

function updateBossPanel(message = null) {
  if (!state.boss.active) {
    els.bossTitle.textContent = "No boss yet.";
    els.bossFlavor.textContent = "Keep your streak to summon a regional boss!";
    els.bossAttack.textContent = "Boss attacks will show here.";
    els.bossPrompt.textContent = "Boss quiz prompts will appear when a boss arrives.";
    els.bossActionBtn.textContent = "Call Boss";
    els.bossLearningTip.textContent = "Call a boss, then answer state-and-capital questions to win.";
    return;
  }
  const bossData = BOSSES[state.boss.region];
  els.bossTitle.textContent = `${state.boss.name} (${state.boss.region})`;
  els.bossFlavor.textContent = bossData.flavor;
  els.bossActionBtn.textContent = "Answer Boss Quiz";
  els.bossLearningTip.textContent = `Study ${state.boss.region} states and capitals. Correct quiz answers damage ${state.boss.name}; wrong answers let the boss counter.`;
  if (message) {
    els.bossAttack.textContent = message;
  }
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

function makeQuestion() {
  const pool = state.boss.active
    ? STATES.filter(item => item.region === state.boss.region)
    : STATES;
  const selectedMode = state.boss.active && ["regions", "shapes"].includes(state.questionMode)
    ? "mixed"
    : state.questionMode || "mixed";
  const shapePool = STATE_SHAPES.filter(shape => {
    if (!state.boss.active) return true;
    const shapeState = STATES.find(item => item.state === shape.state);
    return shapeState && shapeState.region === state.boss.region;
  });
  const modeRoll = selectedMode === "mixed" ? Math.random() : 1;
  const shouldAskShape = !state.boss.active && shapePool.length > 0 && (selectedMode === "shapes" || (selectedMode === "mixed" && modeRoll < 0.25));
  const shouldAskRegion = !state.boss.active && (selectedMode === "regions" || (selectedMode === "mixed" && modeRoll >= 0.25 && modeRoll < 0.4));

  if (shouldAskShape) {
    const answer = shapePool[randInt(shapePool.length)];
    const choices = new Set([answer.state]);
    while (choices.size < 4) choices.add(STATES[randInt(STATES.length)].state);
    return {
      question: "Which state matches this shape?",
      correct: answer.state,
      choices: shuffle(Array.from(choices)),
      hintUsed: false,
      mode: "shape-to-state",
      state: answer.state,
      capital: STATES.find(item => item.state === answer.state)?.capital ?? "",
      shape: answer
    };
  }

  const answer = pool[randInt(pool.length)];

  if (shouldAskRegion) {
    const choices = new Set([answer.region]);
    const regionNames = Object.keys(REGION_ICONS);
    while (choices.size < regionNames.length) choices.add(regionNames[randInt(regionNames.length)]);
    return {
      question: `Which region is ${answer.state} in?`,
      correct: answer.region,
      choices: shuffle(Array.from(choices)),
      hintUsed: false,
      mode: "state-to-region",
      state: answer.state,
      capital: answer.capital,
      shape: null
    };
  }

  const askStateToCapital = selectedMode === "capitals"
    ? true
    : selectedMode === "states"
      ? false
      : Math.random() < 0.5;

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
    capital: answer.capital,
    shape: null
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

  const isShapeQuestion = currentQuestion.mode === "shape-to-state";

  if (isShapeQuestion && currentQuestion.shape) {
    const { viewBox, path, state: shapeState } = currentQuestion.shape;
    els.stateShape.innerHTML = `
      <svg viewBox="${viewBox}" role="img" aria-label="${shapeState} shape">
        <path d="${path}"></path>
      </svg>
    `;
    els.stateShape.classList.remove("hidden");
  } else {
    els.stateShape.innerHTML = "";
    els.stateShape.classList.add("hidden");
  }

  if (state.difficulty === "hard" && !isShapeQuestion) {
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

function startBossQuizChallenge() {
  if (!state.boss.active) {
    summonBossNow();
  }

  setActivePanel("quiz");
  renderQuestion();
  updateBossPanel("Answer the quiz question to land a hit!");
  els.result.textContent = `Answer a ${state.boss.region} state-and-capital question to hit ${state.boss.name}.`;
  saveState();
}

function handleCorrectAnswer() {
  state.points += 10;
  state.streak += 1;
  state.totalCorrect += 1;
  applyQuestionFeedback(true);
  showFloatingText("+10", els.points);
  createConfettiBurst(els.quizCard);
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
    els.result.textContent = "Correct! Keep the streak going!";
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

  const isShapeQuestion = currentQuestion.mode === "shape-to-state";

  if (state.difficulty === "hard" && !isShapeQuestion) {
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
  if (!confirm("Reset everything? Your points and progress will be wiped.")) return;
  state = defaultState();
  saveState();
  location.reload();
}

async function init() {
  initNav();
  renderUpdateTimestamp();
  updateHud();
  renderDailyQuest();
  renderExplorer();
  surprisePassportState();
  await loadStateShapes();
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
  els.questionModeSelect.addEventListener("change", event => {
    state.questionMode = event.target.value;
    saveState();
    renderQuestion();
  });
  els.randomStateBtn.addEventListener("click", surprisePassportState);
  els.resetGame.addEventListener("click", resetGame);
  els.bossActionBtn.addEventListener("click", startBossQuizChallenge);
  els.bossViewBtn.addEventListener("click", () => {
    if (!state.boss.active) return;
    setActivePanel("boss");
  });
}

init();
