const itemList = document.getElementById('item-list');
const roundCounter = document.getElementById('round-counter');
const roundTitle = document.getElementById('round-title');
const roundCapacity = document.getElementById('round-capacity');
const roundInstructions = document.getElementById('round-instructions');
const status = document.getElementById('status');
const form = document.getElementById('game-form');
const submitBtn = document.getElementById('submit-btn');
const nextRoundBtn = document.getElementById('next-round-btn');

const state = {
  menuItems: [],
  defaultCapacity: 0,
  rounds: [],
  currentRoundIndex: 0,
  currentRound: null,
  totalScore: 0,
};

function getItemName(item) {
  return item?.name ?? item?.title ?? item?.id ?? 'Item';
}

function getItemWeight(item) {
  return item?.weight ?? item?.cost ?? item?.size ?? 0;
}

function getItemValue(item) {
  return item?.value ?? item?.points ?? item?.reward ?? 0;
}

function renderRound() {
  const round = state.rounds[state.currentRoundIndex];
  if (!round) return;

  const customer = round?.customer ?? {};
  const customerName = customer.name ?? 'Cliente';
  const hunger = Number(customer.hunger ?? customer.fome ?? 0);
  const prompt = customer.prompt ?? 'Chegou um cliente.';

  state.currentRound = round;
  form.reset();
  submitBtn.disabled = false;
  nextRoundBtn.hidden = true;
  status.innerHTML = '';

  roundCounter.textContent = `Cliente ${state.currentRoundIndex + 1} de ${state.rounds.length}`;
  roundTitle.textContent = customerName;
  roundCapacity.textContent = `Prato: ${round.capacity ?? state.defaultCapacity} · Fome: ${hunger}`;
  roundInstructions.textContent = prompt;

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
        hunger: 0,
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
    status.innerHTML = '<p>Não foi possível carregar o jogo.</p>';
    console.error(error);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!state.currentRound) return;

  const selectedNames = Array.from(
    document.querySelectorAll('input[name="item"]:checked'),
  ).map((input) => input.value);

  try {
    const response = await fetch('/game/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedNames,
        capacity: state.currentRound.capacity,
        hunger: state.currentRound.customer?.hunger ?? 0,
      }),
    });

    if (!response.ok) throw new Error('Não foi possível avaliar a escolha');

    const result = await response.json();
    state.totalScore += Number(result.selectedValue ?? 0);

    submitBtn.disabled = true;

    status.innerHTML = `
      <h3>${result.ok ? 'Boa escolha!' : 'Quase lá!'}</h3>
      <p>${result.message}</p>
      <p>Você saciou ${result.selectedValue} de fome neste round.</p>
      <p>Melhor solução possível: ${result.optimalValue}.</p>
    `;

    nextRoundBtn.hidden = false;
    nextRoundBtn.textContent =
      state.currentRoundIndex < state.rounds.length - 1
        ? 'Próximo cliente'
        : 'Ver resultado final';
  } catch (error) {
    status.innerHTML = '<p>Não foi possível enviar a resposta.</p>';
    console.error(error);
  }
});

nextRoundBtn.addEventListener('click', () => {
  if (state.currentRoundIndex < state.rounds.length - 1) {
    state.currentRoundIndex += 1;
    renderRound();
    return;
  }

  status.innerHTML = `
    <h3>Fim do jogo!</h3>
    <p>Sua pontuação total foi <strong>${state.totalScore}</strong>.</p>
    <p>Obrigado por atender os clientes na bancada!</p>
  `;
  nextRoundBtn.hidden = true;
});

initGame();