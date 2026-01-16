// Minimal starter: quiz -> coins -> build city -> boss every 10 correct

const STATES = [
  { state: "Idaho", capital: "Boise", region: "West" },
  { state: "Utah", capital: "Salt Lake City", region: "West" },
  { state: "California", capital: "Sacramento", region: "West" },
  { state: "Texas", capital: "Austin", region: "South" },
  { state: "Florida", capital: "Tallahassee", region: "South" },
  { state: "New York", capital: "Albany", region: "Northeast" },
  { state: "Ohio", capital: "Columbus", region: "Midwest" },
  // Codex can expand to all 50 later
];

const BUILDINGS = [
  { name: "House", icon: "H", cost: 10 },
  { name: "School", icon: "S", cost: 20 },
  { name: "Park", icon: "P", cost: 15 },
  { name: "Library", icon: "L", cost: 25 },
];

let coins = 0;
let streak = 0;
let youHp = 3;

let bossRegion = null;
let bossHp = 0;

const gridSize = 6;
const city = Array(gridSize * gridSize).fill(null);

const elCoins = document.getElementById("coins");
const elStreak = document.getElementById("streak");
const elBoss = document.getElementById("boss");
const elBossHp = document.getElementById("bossHp");
const elYouHp = document.getElementById("youHp");
const elQuestion = document.getElementById("question");
const elChoices = document.getElementById("choices");
const elResult = document.getElementById("result");
const elCity = document.getElementById("city");

function randInt(n) { return Math.floor(Math.random() * n); }

function pickQuestion() {
  const pool = bossRegion ? STATES.filter(x => x.region === bossRegion) : STATES;
  const answer = pool[randInt(pool.length)];
  const askStateToCapital = Math.random() < 0.5;

  let question, correct;
  if (askStateToCapital) {
    question = `What is the capital of ${answer.state}?`;
    correct = answer.capital;
  } else {
    question = `${answer.capital} is the capital of which state?`;
    correct = answer.state;
  }

  const choicePool = askStateToCapital ? STATES.map(x => x.capital) : STATES.map(x => x.state);
  const choices = new Set([correct]);
  while (choices.size < 4) choices.add(choicePool[randInt(choicePool.length)]);
  const choiceList = Array.from(choices).sort(() => Math.random() - 0.5);

  return { question, correct, choices: choiceList };
}

function updateHud() {
  elCoins.textContent = coins;
  elStreak.textContent = streak;
  elBoss.textContent = bossRegion ? bossRegion : "None";
  elBossHp.textContent = bossHp;
  elYouHp.textContent = youHp;
}

function renderCity() {
  elCity.innerHTML = "";
  city.forEach((b, i) => {
    const tile = document.createElement("div");
    tile.className = "tile " + (b ? "" : "empty");
    tile.textContent = b ? b.icon : "·";
    tile.title = b ? b.name : "Empty";
    tile.onclick = () => tryPlaceBuilding(i);
    elCity.appendChild(tile);
  });
}

function tryPlaceBuilding(index) {
  if (city[index]) return;

  const affordable = BUILDINGS.filter(b => b.cost <= coins).sort((a,b)=>a.cost-b.cost);
  if (affordable.length === 0) {
    elResult.textContent = "Not enough coins to build. Answer questions to earn coins.";
    return;
  }
  const b = affordable[0];
  coins -= b.cost;
  city[index] = b;
  elResult.textContent = `Built a ${b.name}! (-${b.cost} coins)`;
  updateHud();
  renderCity();
}

function startBossIfReady() {
  if (bossRegion) return;
  if (streak > 0 && streak % 10 === 0) {
    const regions = ["West", "Midwest", "South", "Northeast"];
    bossRegion = regions[randInt(regions.length)];
    bossHp = 3;
    youHp = 3;
    elResult.textContent = `BOSS BATTLE! Region: ${bossRegion}`;
  }
}

let current = null;

function askNext() {
  current = pickQuestion();
  elQuestion.textContent = current.question;
  elChoices.innerHTML = "";
  elResult.textContent = "";

  current.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.onclick = () => answer(choice);
    elChoices.appendChild(btn);
  });

  updateHud();
  renderCity();
}

function answer(choice) {
  const correct = choice === current.correct;

  if (correct) {
    coins += 10;
    streak += 1;

    if (bossRegion) {
      bossHp -= 1;
      elResult.textContent = `Correct! You hit the boss. (+10 coins)`;
      if (bossHp <= 0) {
        elResult.textContent = `Boss defeated!`;
        bossRegion = null;
        bossHp = 0;
      }
    } else {
      elResult.textContent = `Correct! (+10 coins) Click a city tile to build.`;
      startBossIfReady();
    }
  } else {
    elResult.textContent = `Nope. Correct answer was: ${current.correct}`;
    if (bossRegion) {
      youHp -= 1;
      if (youHp <= 0) {
        elResult.textContent = `You lost the boss battle. Try again.`;
        bossRegion = null;
        bossHp = 0;
        youHp = 3;
      }
    } else {
      streak = 0;
    }
  }

  updateHud();
  setTimeout(askNext, 700);
}

updateHud();
renderCity();
askNext();
