// ── State ──────────────────────────────────────────────
let currentInput = '';   // number being typed right now
let previousInput = '';  // number before the operator
let operator = null;     // active operator: + − × ÷
let shouldResetScreen = false; // true right after hitting = or an operator

// ── DOM refs ───────────────────────────────────────────
const resultEl = document.getElementById('result');
const expressionEl = document.getElementById('expression');

// ── Helpers ────────────────────────────────────────────

function updateDisplay(value) {
  // Trim very long numbers so they don't overflow the display
  const str = String(value);
  resultEl.textContent = str.length > 12 ? parseFloat(value).toExponential(4) : str;
}

function calculate(a, op, b) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  switch (op) {
    case '+': return numA + numB;
    case '−': return numA - numB;
    case '×': return numA * numB;
    case '÷': return numB === 0 ? 'Error' : numA / numB;
    default:  return numB;
  }
}

function roundResult(value) {
  if (value === 'Error') return 'Error';
  // Avoid floating-point artifacts like 0.1 + 0.2 = 0.30000000000000004
  return parseFloat(value.toFixed(10)).toString();
}

// ── Actions ────────────────────────────────────────────

function handleNumber(value) {
  if (shouldResetScreen) {
    currentInput = '';
    shouldResetScreen = false;
  }
  // Prevent multiple leading zeros
  if (currentInput === '0' && value === '0') return;
  // Replace a lone 0 with the new digit (unless it's a decimal)
  if (currentInput === '0' && value !== '.') {
    currentInput = value;
  } else {
    currentInput += value;
  }
  updateDisplay(currentInput);
}

function handleDecimal() {
  if (shouldResetScreen) {
    currentInput = '0';
    shouldResetScreen = false;
  }
  if (currentInput.includes('.')) return; // only one dot allowed
  if (currentInput === '') currentInput = '0';
  currentInput += '.';
  updateDisplay(currentInput);
}

function handleOperator(op) {
  if (currentInput === '' && previousInput === '') return;

  // Chain operations: if there's already a pending operation, resolve it first
  if (currentInput !== '' && previousInput !== '' && operator) {
    const result = roundResult(calculate(previousInput, operator, currentInput));
    updateDisplay(result);
    expressionEl.textContent = `${previousInput} ${operator} ${currentInput} ${op}`;
    previousInput = result;
    currentInput = '';
  } else {
    // First operator press
    if (currentInput !== '') previousInput = currentInput;
    expressionEl.textContent = `${previousInput} ${op}`;
    currentInput = '';
  }

  operator = op;
  shouldResetScreen = false;
}

function handleEquals() {
  if (operator === null || currentInput === '') return;

  const expression = `${previousInput} ${operator} ${currentInput}`;
  const result = roundResult(calculate(previousInput, operator, currentInput));

  expressionEl.textContent = `${expression} =`;
  updateDisplay(result);

  // Store result so next number press starts fresh
  previousInput = result;
  currentInput = result;
  operator = null;
  shouldResetScreen = true;
}

function handleClear() {
  currentInput = '';
  previousInput = '';
  operator = null;
  shouldResetScreen = false;
  updateDisplay('0');
  expressionEl.textContent = '';
}

function handleSign() {
  if (!currentInput || currentInput === '0') return;
  currentInput = (parseFloat(currentInput) * -1).toString();
  updateDisplay(currentInput);
}

function handlePercent() {
  if (!currentInput) return;
  currentInput = (parseFloat(currentInput) / 100).toString();
  updateDisplay(currentInput);
}

// ── Event delegation ───────────────────────────────────
document.querySelector('.buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  switch (action) {
    case 'number':   handleNumber(value);   break;
    case 'decimal':  handleDecimal();        break;
    case 'operator': handleOperator(value); break;
    case 'equals':   handleEquals();         break;
    case 'clear':    handleClear();          break;
    case 'sign':     handleSign();           break;
    case 'percent':  handlePercent();        break;
  }
});

// ── Keyboard support ───────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
  else if (e.key === '.')  handleDecimal();
  else if (e.key === '+')  handleOperator('+');
  else if (e.key === '-')  handleOperator('−');
  else if (e.key === '*')  handleOperator('×');
  else if (e.key === '/')  { e.preventDefault(); handleOperator('÷'); }
  else if (e.key === 'Enter' || e.key === '=') handleEquals();
  else if (e.key === 'Escape') handleClear();
  else if (e.key === 'Backspace') {
    // Simple backspace: remove last character
    if (shouldResetScreen) return;
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput || '0');
  }
});