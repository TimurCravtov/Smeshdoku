export interface SudokuGame {
  puzzle: number[][];   // shown to the user  (0 = empty cell)
  solution: number[][]; // kept hidden, used for validation
}

export function generateField(level: 1 | 2 | 3 | 4 = 1): SudokuGame {
  const grid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  function usedMask(r: number, c: number): number {
    let mask = 0;
    for (let i = 0; i < 9; i++) {
      mask |= 1 << grid[r][i];
      mask |= 1 << grid[i][c];
      mask |= 1 << grid[3 * Math.floor(r / 3) + Math.floor(i / 3)]
                        [3 * Math.floor(c / 3) + (i % 3)];
    }
    return mask;
  }

  function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function solve(randomise: boolean): boolean {
    let bestR = -1, bestC = -1, bestCount = 10;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== 0) continue;
        const used = usedMask(r, c);
        let count = 0;
        for (let d = 1; d <= 9; d++) if (!(used & (1 << d))) count++;
        if (count === 0) return false;
        if (count < bestCount) { bestCount = count; bestR = r; bestC = c; }
      }
    }
    if (bestR === -1) return true;

    const used = usedMask(bestR, bestC);
    const candidates: number[] = [];
    for (let d = 1; d <= 9; d++) if (!(used & (1 << d))) candidates.push(d);
    if (randomise) shuffle(candidates);

    for (const d of candidates) {
      grid[bestR][bestC] = d;
      if (solve(randomise)) return true;
      grid[bestR][bestC] = 0;
    }
    return false;
  }

  // Phase 1: fill a complete valid grid
  solve(true);

  // Snapshot the full solution before digging holes
  const solution: number[][] = grid.map(row => [...row]);

  // Phase 2: dig holes based on difficulty
  const cluesTarget: Record<number, number> = { 1: 45, 2: 35, 3: 28, 4: 23 };
  const targetClues = cluesTarget[level];

  function countSolutions(limit: number): number {
    let count = 0;
    function bt(): void {
      if (count >= limit) return;
      let bestR = -1, bestC = -1, bestCnt = 10;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] !== 0) continue;
          const used = usedMask(r, c);
          let n = 0;
          for (let d = 1; d <= 9; d++) if (!(used & (1 << d))) n++;
          if (n === 0) return;
          if (n < bestCnt) { bestCnt = n; bestR = r; bestC = c; }
        }
      }
      if (bestR === -1) { count++; return; }
      const used = usedMask(bestR, bestC);
      for (let d = 1; d <= 9; d++) {
        if (used & (1 << d)) continue;
        grid[bestR][bestC] = d;
        bt();
        grid[bestR][bestC] = 0;
        if (count >= limit) return;
      }
    }
    bt();
    return count;
  }

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) positions.push([r, c]);
  shuffle(positions);

  let clues = 81;
  for (const [r, c] of positions) {
    if (clues <= targetClues) break;
    const backup = grid[r][c];
    grid[r][c] = 0;
    if (countSolutions(2) !== 1) {
      grid[r][c] = backup;
    } else {
      clues--;
    }
  }

  return {
    puzzle: grid.map(row => [...row]),  // 0s where user must fill in
    solution,                           // complete board for answer checking
  };
}

// checkIfValid and checkIfCompleted stay the same
export function checkIfValid(field: number[][]): boolean {
  function noDuplicates(cells: number[]): boolean {
    const seen = new Set<number>();
    for (const v of cells) {
      if (v === 0) continue;
      if (seen.has(v)) return false;
      seen.add(v);
    }
    return true;
  }
  for (let i = 0; i < 9; i++) {
    if (!noDuplicates(field[i])) return false;
    if (!noDuplicates(field.map(row => row[i]))) return false;
    const br = 3 * Math.floor(i / 3), bc = 3 * (i % 3);
    const box: number[] = [];
    for (let dr = 0; dr < 3; dr++)
      for (let dc = 0; dc < 3; dc++)
        box.push(field[br + dr][bc + dc]);
    if (!noDuplicates(box)) return false;
  }
  return true;
}

export function checkIfCompleted(field: number[][]): boolean {
  return field.every(row => row.every(cell => cell !== 0)) && checkIfValid(field);
}