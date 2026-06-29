const itemList = document.getElementById('item-list');
const roundCounter = document.getElementById('round-counter');
const roundTitle = document.getElementById('round-title');
const roundCapacity = document.getElementById('round-capacity');
const roundInstructions = document.getElementById('round-instructions');
const status = document.getElementById('status');
const form = document.getElementById('game-form');
const submitBtn = document.getElementById('submit-btn');
const timerEl = document.getElementById('round-timer');
const scoreEl = document.getElementById('player-score');

const state = {
  menuItems: [],
  defaultCapacity: 0,
  rounds: [],
  currentRoundIndex: 0,
  currentRound: null,
  totalScore: 0,
  roundResults: [],
};

let timeLeft = 30;
let timerInterval = null;

function getItemName(item) {
  return item?.name ?? item?.title ?? item?.id ?? 'Item';
}

function getItemWeight(item) {
  return Number(item?.weight ?? item?.cost ?? item?.size ?? 0);
}

function getItemValue(item) {
  return Number(item?.value ?? item?.points ?? item?.reward ?? 0);
}

function renderTimer() {
  if (timerEl) {
    timerEl.textContent = String(timeLeft);
  }
}

function renderScore() {
  if (scoreEl) {
    scoreEl.textContent = String(state.totalScore);
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function calculateRoundScore(selectedValue, optimalValue) {
  const selected = Number(selectedValue ?? 0);
  const optimal = Number(optimalValue ?? 0);

  if (selected === optimal) return 3;
  if (selected > 0) return 1;
  return 0;
}

function getOptimalCombination(capacity) {
  const safeCapacity = Math.max(0, Math.floor(Number(capacity ?? 0)));
  const items = state.menuItems.map((item) => ({
    name: getItemName(item),
    weight: getItemWeight(item),
    value: getItemValue(item),
  }));

  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => Array(safeCapacity + 1).fill(0));
  const take = Array.from({ length: n + 1 }, () => Array(safeCapacity + 1).fill(false));

  for (let i = 1; i <= n; i += 1) {
    const item = items[i - 1];

    for (let w = 0; w <= safeCapacity; w += 1) {
      const without = dp[i - 1][w];
      const withItem = item.weight <= w ? dp[i - 1][w - item.weight] + item.value : -Infinity;

      if (withItem > without) {
        dp[i][w] = withItem;
        take[i][w] = true;
      } else {
        dp[i][w] = without;
      }
    }
  }

  const selectedItems = [];
  let remainingCapacity = safeCapacity;

  for (let i = n; i > 0; i -= 1) {
    if (take[i][remainingCapacity]) {
      selectedItems.push(items[i - 1]);
      remainingCapacity -= items[i - 1].weight;
    }
  }

  const names = selectedItems.reverse().map((item) => item.name);
  const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);

  return {
    names,
    value: dp[n][safeCapacity],
    totalWeight,
  };
}

function recordRoundResult(selectedValue = 0) {
  if (!state.currentRound) return;

  const optimal = getOptimalCombination(state.currentRound.capacity);
  const customerName = state.currentRound?.customer?.name ?? 'Cliente';

  state.roundResults.push({
    customerName,
    capacity: Number(state.currentRound.capacity ?? state.defaultCapacity),
    optimalNames: optimal.names,
    optimalValue: optimal.value,
    optimalWeight: optimal.totalWeight,
    selectedValue,
  });
}

function startRoundTimer() {
  stopTimer();

  timeLeft = 30;
  renderTimer();

  if (submitBtn) submitBtn.disabled = false;
  if (form) form.classList.remove('is-blocked');

  if (status) {
    status.textContent = 'Faça a melhor escolha antes do tempo acabar.';
  }

  timerInterval = setInterval(() => {
    timeLeft -= 1;
    renderTimer();

    if (timeLeft <= 0) {
      stopTimer();

      state.totalScore = Math.max(0, state.totalScore - 1);
      renderScore();

      if (status) {
        status.textContent = 'Tempo esgotado! Você perdeu 1 ponto.';
      }

      if (submitBtn) submitBtn.disabled = true;
      if (form) form.classList.add('is-blocked');

      recordRoundResult(0);
      advanceToNextRound();
    }
  }, 1000);
}

function renderRound() {
  const round = state.rounds[state.currentRoundIndex];
  if (!round) return;

  const customer = round?.customer ?? {};
  const customerName = customer.name ?? 'Cliente';
  const prompt = customer.prompt ?? 'Chegou um cliente.';

  state.currentRound = round;

  if (form) form.reset();

  if (submitBtn) submitBtn.disabled = false;
  if (form) form.classList.remove('is-blocked');

  if (status) status.innerHTML = '';

  if (roundCounter) {
    roundCounter.textContent = `Cliente ${state.currentRoundIndex + 1} de ${state.rounds.length}`;
  }

  if (roundTitle) roundTitle.textContent = customerName;
  if (roundCapacity) roundCapacity.textContent = `Prato: ${round.capacity ?? state.defaultCapacity}`;
  if (roundInstructions) {
    roundInstructions.textContent = 'Objetivo: maximizar a saciedade sem passar do limite do prato.';
  }

  if (itemList) {
    itemList.innerHTML = '';

    state.menuItems.forEach((item) => {
      const label = document.createElement('label');
      label.className = 'item-card';

      label.innerHTML = `
        <input type="checkbox" name="item" value="${getItemName(item)}" />
        <span>
          <strong>${getItemName(item)}</strong><br />
          Peso: ${getItemWeight(item)} · Valor: ${getItemValue(item)}
        </span>
      `;

      itemList.appendChild(label);
    });
  }
}

function advanceToNextRound() {
  if (state.currentRoundIndex < state.rounds.length - 1) {
    state.currentRoundIndex += 1;
    renderRound();
    startRoundTimer();
    return;
  }

  stopTimer();

  if (submitBtn) submitBtn.disabled = true;
  if (form) form.classList.add('is-blocked');

  const maxPossibleScore = state.rounds.length * 3;

  const summary = state.roundResults
    .map((result, index) => {
      const names = result.optimalNames.length
        ? result.optimalNames.join(', ')
        : 'Nenhum item';

      return `
        <li>
          <strong>${index + 1}. ${result.customerName}</strong><br />
          Combinação ideal: ${names}<br />
          Peso: ${result.optimalWeight} · Valor: ${result.optimalValue}
        </li>
      `;
    })
    .join('');

  if (status) {
    status.innerHTML = `
      <h3>Fim do jogo!</h3>
      <p>Sua pontuação final foi <strong>${state.totalScore}</strong>.</p>
      <p>Pontuação total possível: <strong>${maxPossibleScore}</strong>.</p>
      <h4>Combinações mais corretas por cliente</h4>
      <ul>${summary}</ul>
    `;
  }
}

async function loadMenu() {
  const response = await fetch('/game/menu');
  if (!response.ok) throw new Error('Não foi possível buscar o menu');

  const data = await response.json();
  state.menuItems = Array.isArray(data.menu) ? data.menu : [];
  state.defaultCapacity = Number(data.defaultPlateCapacity ?? 0);
}

async function loadRounds() {
  state.rounds = [];

  for (let i = 0; i < 3; i += 1) {
    const response = await fetch('/game/round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capacity: state.defaultCapacity }),
    });

    if (!response.ok) throw new Error('Não foi possível gerar o round');

    const data = await response.json();

    state.rounds.push({
      capacity: Number(data?.capacity ?? state.defaultCapacity),
      customer: data?.customer ?? {
        name: 'Cliente',
        prompt: 'Chegou um cliente.',
      },
    });
  }

  state.currentRoundIndex = 0;
}

async function initGame() {
  try {
    await loadMenu();
    await loadRounds();
    renderRound();
  } catch (error) {
    if (status) status.innerHTML = '<p>Não foi possível carregar o jogo.</p>';
    console.error(error);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!state.currentRound) return;

  stopTimer();

  if (submitBtn) submitBtn.disabled = true;
  if (form) form.classList.add('is-blocked');

  const selectedNames = Array.from(
    document.querySelectorAll('input[name="item"]:checked')
  ).map((input) => input.value);

  try {
    const response = await fetch('/game/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedNames,
        capacity: state.currentRound.capacity,
      }),
    });

    if (!response.ok) throw new Error('Não foi possível avaliar a escolha');

    const result = await response.json();
    const selectedValue = Number(result.selectedValue ?? 0);
    const optimalValue = Number(result.optimalValue ?? 0);
    const roundScore = calculateRoundScore(selectedValue, optimalValue);

    state.totalScore += roundScore;
    renderScore();

    if (status) {
      if (roundScore === 3) {
        status.innerHTML = `
          <h3>Perfeito!</h3>
          <p>Você alcançou o máximo de saciedade possível.</p>
        `;
      } else if (roundScore === 1) {
        status.innerHTML = `
          <h3>Quase lá!</h3>
          <p>Você saciou algo, mas ainda dava para melhorar.</p>
        `;
      } else {
        status.innerHTML = `
          <h3>Não foi o melhor</h3>
          <p>Você ficou abaixo do máximo possível de saciedade.</p>
        `;
      }
    }

    recordRoundResult(selectedValue);
    advanceToNextRound();
  } catch (error) {
    if (status) status.innerHTML = '<p>Não foi possível enviar a resposta.</p>';
    console.error(error);
  }
});

initGame();

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      startRoundTimer();
    });
  }

  renderTimer();
  renderScore();
});