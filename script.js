const display = document.getElementById('display');
const tape = document.getElementById('tape');
const tapeInner = document.getElementById('tapeInner');
const keys = document.querySelector('.keys');

let current = '0';
let previous = null;
let operator = null;
let justEvaluated = false;

function updateDisplay(){
  display.textContent = formatForDisplay(current);
}

function formatForDisplay(value){
  if (value === 'Ошибка') return value;
  const num = Number(value);
  if (!isFinite(num)) return 'Ошибка';
  const str = value.toString().replace('.', ',');
  return str.length > 11 ? Number(num.toPrecision(9)).toString().replace('.', ',') : str;
}

function printLine(text, opts = {}){
  const p = document.createElement('p');
  p.className = 'tape__line' + (opts.result ? ' tape__line--result' : '');
  p.textContent = text;
  tapeInner.appendChild(p);
  while (tapeInner.children.length > 8){
    tapeInner.removeChild(tapeInner.firstChild);
  }
  tape.scrollTop = tape.scrollHeight;
}

function inputDigit(digit){
  if (justEvaluated){
    current = digit;
    justEvaluated = false;
    return;
  }
  current = current === '0' ? digit : current + digit;
}

function inputDot(){
  if (justEvaluated){
    current = '0.';
    justEvaluated = false;
    return;
  }
  if (!current.includes('.')) current += '.';
}

function clearAll(){
  current = '0';
  previous = null;
  operator = null;
  justEvaluated = false;
  printLine('— НОВЫЙ РАСЧЁТ —', {});
}

function negate(){
  if (current === '0') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
}

function percent(){
  current = (parseFloat(current) / 100).toString();
}

function chooseOperator(op){
  if (operator && !justEvaluated){
    evaluate(false);
  }
  printLine(`${formatForDisplay(current)} ${op}`);
  previous = current;
  operator = op;
  current = '0';
  justEvaluated = false;
}

function evaluate(showLine = true){
  if (operator === null || previous === null) return;
  const a = parseFloat(previous);
  const b = parseFloat(current);
  let result;

  switch(operator){
    case '+': result = a + b; break;
    case '−': result = a - b; break;
    case '×': result = a * b; break;
    case '÷': result = b === 0 ? NaN : a / b; break;
    default: return;
  }

  current = isNaN(result) ? 'Ошибка' : trimResult(result);

  if (showLine){
    printLine(`${formatForDisplay(current)}`, { result: true });
  }

  previous = null;
  operator = null;
  justEvaluated = true;
}

function trimResult(num){
  return Math.round(num * 1e10) / 1e10 + '';
}

keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  if (btn.dataset.num !== undefined){
    inputDigit(btn.dataset.num);
  } else if (btn.dataset.op !== undefined){
    chooseOperator(btn.dataset.op);
  } else if (btn.dataset.action){
    switch(btn.dataset.action){
      case 'clear': clearAll(); break;
      case 'negate': negate(); break;
      case 'percent': percent(); break;
      case 'dot': inputDot(); break;
      case 'equals': evaluate(true); break;
    }
  }
  updateDisplay();
});

document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9'){ inputDigit(e.key); }
  else if (e.key === '.' || e.key === ','){ inputDot(); }
  else if (e.key === '+'){ chooseOperator('+'); }
  else if (e.key === '-'){ chooseOperator('−'); }
  else if (e.key === '*'){ chooseOperator('×'); }
  else if (e.key === '/'){ e.preventDefault(); chooseOperator('÷'); }
  else if (e.key === 'Enter' || e.key === '='){ evaluate(true); }
  else if (e.key === 'Escape'){ clearAll(); }
  else if (e.key === 'Backspace'){
    current = current.length > 1 ? current.slice(0, -1) : '0';
  } else {
    return;
  }
  updateDisplay();
});

updateDisplay();
