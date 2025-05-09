function findReminder(string) {
  let uniqueRemainders;
  const substring = string.substring(1, string.length);
  const isSame = (s, r) => {
    const codes = s.split("").map((c) => c.charCodeAt(0));
    const remainders = codes.map((code) => code % r);
    uniqueRemainders = new Set(remainders);
    return uniqueRemainders.size > 1;
  };
  let r = 2;

  // If the string is too short, stacking in one direction is OK.
  while (!isSame(substring, r) && r < 10 && string.length > 3) {
    r++;
  }
  return [r, Array.from(uniqueRemainders)[0]];
}

export function flex(string, x, y, x1, y1, {padding = 0.05} = {}) {
  const cellSize = Math.min(x1 - x, y1 - y);
  const p = cellSize * padding;
  const cells = [{x, y, x1, y1, ch: string[0]}];
  const n = string.length;
  const [r, d] = findReminder(string);
  const next = (code) => code % r === d;
  let i = 1;

  const constrain = (cell) => {
    cell.x = Math.min(Math.max(x, cell.x), x1);
    cell.y = Math.min(Math.max(y, cell.y), y1);
    cell.x1 = Math.min(Math.max(x, cell.x1), x1);
    cell.y1 = Math.min(Math.max(y, cell.y1), y1);
  };

  while (cells.length < n && i < n) {
    const char = string[i];
    const code = string.charCodeAt(i);
    const {x, y, x1, y1, ch} = cells[i - 1];
    const w = x1 - x;
    const h = y1 - y;
    const remain = n - i;
    const t = remain <= 1 ? 0.5 : 0.33;
    if (next(code)) {
      const cell0 = {x, y, x1: x + w * t - p, y1, ch};
      const cell1 = {x: x + w * t + p, y, x1, y1, ch: char};
      constrain(cell0);
      constrain(cell1);
      cells.pop();
      cells.push(cell0, cell1);
    } else {
      const cell0 = {x, y, x1, y1: y + h * t - p, ch};
      const cell1 = {x, y: y + h * t + p, x1, y1, ch: char};
      constrain(cell0);
      constrain(cell1);
      cells.pop();
      cells.push(cell0, cell1);
    }
    i++;
  }

  return cells;
}
