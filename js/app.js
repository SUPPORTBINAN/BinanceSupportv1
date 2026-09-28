const cryptoList = [
  { name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
  { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
  { name: 'Cardano', symbol: 'ADA', icon: '₳' },
  { name: 'Solana', symbol: 'SOL', icon: '◎' },
  { name: 'Ripple', symbol: 'XRP', icon: '✕' },
  { name: 'Polkadot', symbol: 'DOT', icon: '◉' },
  { name: 'Litecoin', symbol: 'LTC', icon: 'Ł' },
  { name: 'Dogecoin', symbol: 'DOGE', icon: 'Ð' }
];

const STORAGE_KEYS = {
  users: 'rtc_users',
  currentUser: 'rtc_current_user',
  cryptoData: 'rtc_crypto_data'
};

const state = {
  users: JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [],
  currentUser: JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser)) || null,
  cryptoData: JSON.parse(localStorage.getItem(STORAGE_KEYS.cryptoData)) || {}
};

let countdownTimer = null;

function basePriceFor(symbol) {
  const map = {
    BTC: { min: 42000, max: 72000 },
    ETH: { min: 2000, max: 4200 },
    ADA: { min: 0.5, max: 1.5 },
    SOL: { min: 90, max: 260 },
    XRP: { min: 0.45, max: 1.4 },
    DOT: { min: 10, max: 35 },
    LTC: { min: 70, max: 220 },
    DOGE: { min: 0.05, max: 0.35 }
  };
  return map[symbol] || { min: 1, max: 50 };
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function generateCryptoData() {
  const next = {};
  cryptoList.forEach((coin) => {
    const { min, max } = basePriceFor(coin.symbol);
    const price = randomRange(min, max);
    const change = (Math.random() - 0.5) * 12;

    next[coin.symbol] = {
      price,
      change,
      volume: Math.floor(randomRange(500000, 9000000000)),
      marketCap: Math.floor(randomRange(5000000000, 1600000000000))
    };
  });

  state.cryptoData = next;
  localStorage.setItem(STORAGE_KEYS.cryptoData, JSON.stringify(next));
  return next;
}

function formatPrice(value) {
  if (value >= 1000) return '$' + value.toFixed(0);
  if (value >= 1) return '$' + value.toFixed(2);
  return '$' + value.toFixed(4);
}

function formatCompact(value) {
  if (value >= 1_000_000_000) return '$' + (value / 1_000_000_000).toFixed(2) + 'B';
  if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(2) + 'M';
  return '$' + value.toFixed(0);
}

function toggleMode() {
  const loginPanel = document.getElementById('loginFormWrap');
  const registerPanel = document.getElementById('registerFormWrap');
  loginPanel.classList.toggle('show');
  registerPanel.classList.toggle('show');
}

function renderCryptoCards() {
  const grid = document.getElementById('cryptoGrid');
  grid.innerHTML = '';

  cryptoList.forEach((coin) => {
    const data = state.cryptoData[coin.symbol];
    if (!data) return;

    const positive = data.change >= 0;
    const row = document.createElement('article');
    row.className = 'crypto-card';
    row.id = `coin-${coin.symbol}`;
    row.innerHTML = `
      <div class="card-header">
        <div class="coin-main">${coin.icon} ${coin.name}<span class="coin-symbol">${coin.symbol}</span></div>
      </div>
      <div class="price">${formatPrice(data.price)}</div>
      <div class="price-change ${positive ? 'up' : 'down'}">${positive ? '📈' : '📉'} ${Math.abs(data.change).toFixed(2)}%</div>
      <div class="card-stats">
        <div class="stat">
          <div class="stat-label">Volume</div>
          <div class="stat-value">${formatCompact(data.volume)}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Market cap</div>
          <div class="stat-value">${formatCompact(data.marketCap)}</div>
        </div>
      </div>
    `;
    grid.appendChild(row);
  });
}

function updateSingleCoin(symbol) {
  const card = document.getElementById(`coin-${symbol}`);
  if (!card) return;

  const data = state.cryptoData[symbol];
  const coin = cryptoList.find((item) => item.symbol === symbol);
  if (!data || !coin) return;

  const positive = data.change >= 0;
  card.innerHTML = `
    <div class="card-header">
      <div class="coin-main">${coin.icon} ${coin.name}<span class="coin-symbol">${coin.symbol}</span></div>
    </div>
    <div class="price">${formatPrice(data.price)}</div>
    <div class="price-change ${positive ? 'up' : 'down'}">${positive ? '📈' : '📉'} ${Math.abs(data.change).toFixed(2)}%</div>
    <div class="card-stats">
      <div class="stat">
        <div class="stat-label">Volume</div>
        <div class="stat-value">${formatCompact(data.volume)}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Market cap</div>
        <div class="stat-value">${formatCompact(data.marketCap)}</div>
      </div>
    </div>
  `;
}

function showDashboard() {
  document.getElementById('authSection').classList.remove('show');
  document.getElementById('dashboardSection').classList.add('show');
  document.getElementById('welcomeText').textContent = `Welcome back, ${state.currentUser.name}!`;
  renderCryptoCards();
  startCountdown();
}

function logoutUser() {
  state.currentUser = null;
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(null));
  clearInterval(countdownTimer);
  document.getElementById('dashboardSection').classList.remove('show');
  document.getElementById('authSection').classList.add('show');
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
  document.getElementById('loginFormWrap').classList.add('show');
  document.getElementById('registerFormWrap').classList.remove('show');
}

function startCountdown() {
  clearInterval(countdownTimer);
  let remaining = 120;
  const countdownEl = document.getElementById('countdown');
  countdownEl.textContent = remaining;

  countdownTimer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      remaining = 120;
      triggerRefresh();
    }
    countdownEl.textContent = remaining;
  }, 1000);
}

function triggerRefresh() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('show');

  setTimeout(() => {
    generateCryptoData();

    cryptoList.forEach((coin, index) => {
      setTimeout(() => {
        updateSingleCoin(coin.symbol);
      }, index * 120);
    });

    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
    overlay.classList.remove('show');
  }, 700);
}

function registerUser(name, email, password) {
  const exists = state.users.some((user) => user.email === email);
  if (exists) {
    alert('Email already registered.');
    return;
  }

  const user = { id: Date.now(), name, email, password };
  state.users.push(user);
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(state.users));
  alert('Registration successful! Please sign in.');
  toggleMode();
}

function loginUser(email, password) {
  const user = state.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    alert('Invalid email or password.');
    return;
  }

  state.currentUser = user;
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  if (Object.keys(state.cryptoData).length === 0) {
    generateCryptoData();
  }
  showDashboard();
}

document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault();
  loginUser(document.getElementById('loginEmail').value.trim(), document.getElementById('loginPassword').value);
});

document.getElementById('registerForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirm = document.getElementById('registerConfirm').value;

  if (password !== confirm) {
    alert('Passwords do not match.');
    return;
  }

  registerUser(name, email, password);
  document.getElementById('registerForm').reset();
});

window.addEventListener('load', function () {
  if (!state.cryptoData || !Object.keys(state.cryptoData).length) {
    generateCryptoData();
  }

  if (state.currentUser) {
    showDashboard();
  } else {
    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
  }
});
