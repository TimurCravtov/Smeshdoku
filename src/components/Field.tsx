import { useState, useCallback, type KeyboardEvent, type CSSProperties } from "react";
import { generateField, checkIfCompleted, checkIfValid, type SudokuGame } from "../lib/sudoku_helpers";

const SMESHARIK_MAP: Record<number, string> = {
  1: "/ejik.png",
  2: "/krosh.png",
  3: "/barash.png",
  4: "/losiash.webp",
  5: "/sova.png",
  6: "/kopatich.png",
  7: "/pin.png",
  8: "/kar.png",
  9: "/nusha.png",
};

const cloneBoard = (rows: number[][]): number[][] => rows.map((row) => [...row]);
const createGame = (level: 1 | 2 | 3 | 4 = 1): SudokuGame => generateField(level);

interface CellCoords {
  row: number;
  col: number;
}

export default function SudokuBoard() {
  const [game, setGame] = useState<SudokuGame>(() => createGame(1));
  const [board, setBoard] = useState<number[][]>(() => cloneBoard(game.puzzle));
  const [selected, setSelected] = useState<CellCoords | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState<boolean>(false);
  const [showDifficulty, setShowDifficulty] = useState<boolean>(false);

  const checkCompletion = useCallback((b: number[][]): boolean => checkIfCompleted(b), []);
  const isFixed = (row: number, col: number): boolean => game.puzzle[row][col] !== 0;

  const handleCellClick = (row: number, col: number): void => {
    setSelected({ row, col });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (!selected) return;
    const { row, col } = selected;

    if (isFixed(row, col) && !e.key.startsWith("Arrow")) return;

    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= 9) {
      if (isFixed(row, col)) return;
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = num;
      const valid = checkIfValid(newBoard);
      const key = `${row}-${col}`;
      setErrors((prev) => ({ ...prev, [key]: !valid }));
      setBoard(newBoard);
      if (valid && checkCompletion(newBoard)) setCompleted(true);
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      if (isFixed(row, col)) return;
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = 0;
      setErrors((prev) => {
        const n = { ...prev };
        delete n[`${row}-${col}`];
        return n;
      });
      setBoard(newBoard);
      setCompleted(false);
    } else if (e.key === "ArrowUp" && row > 0) {
      setSelected({ row: row - 1, col });
    } else if (e.key === "ArrowDown" && row < 8) {
      setSelected({ row: row + 1, col });
    } else if (e.key === "ArrowLeft" && col > 0) {
      setSelected({ row, col: col - 1 });
    } else if (e.key === "ArrowRight" && col < 8) {
      setSelected({ row, col: col + 1 });
    }
  };

  const handleReset = (): void => {
    setBoard(cloneBoard(game.puzzle));
    setSelected(null);
    setErrors({});
    setCompleted(false);
  };

  const startNewGame = (level: 1 | 2 | 3 | 4): void => {
    const newGame = createGame(level);
    setGame(newGame);
    setBoard(cloneBoard(newGame.puzzle));
    setErrors({});
    setCompleted(false);
    setSelected(null);
    setShowDifficulty(false);
  };

  const isSameBox = (r1: number, c1: number, r2: number, c2: number): boolean =>
    Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
  const isSameRowOrCol = (r1: number, c1: number, r2: number, c2: number): boolean => r1 === r2 || c1 === c2;
  const isSameNum = (r1: number, c1: number, r2: number, c2: number): boolean =>
    board[r1][c1] !== 0 && board[r1][c1] === board[r2][c2];

  // Returns inline border styles to create thick 3x3 box lines and a thick outer border
  const getCellBorderStyle = (row: number, col: number): CSSProperties => {
    const borderThin = "1px solid #C8BC92";
    const borderThick = "2.5px solid #8B7340";
    const borderOuter = "3px solid #6B5528";

    return {
      borderTop: row === 0 ? borderOuter : row % 3 === 0 ? borderThick : borderThin,
      borderLeft: col === 0 ? borderOuter : col % 3 === 0 ? borderThick : borderThin,
      borderBottom: row === 8 ? borderOuter : borderThin,
      borderRight: col === 8 ? borderOuter : borderThin,
    };
  };

  const getCellBgClass = (row: number, col: number): string => {
    const sel = selected && selected.row === row && selected.col === col;
    const err = errors[`${row}-${col}`];
    const highlighted =
      selected &&
      !sel &&
      (isSameRowOrCol(row, col, selected.row, selected.col) ||
        isSameBox(row, col, selected.row, selected.col));
    const sameNum = selected && !sel && isSameNum(row, col, selected.row, selected.col);

    if (err) return "bg-[#F2B8B8]";
    if (sel) return "bg-[#E5CD8B]";
    if (sameNum) return "bg-[#EAD59B]";
    if (highlighted) return "bg-[#F0E2B4]";
    return "bg-[#F3ECC7]";
  };

  const getTextClasses = (row: number, col: number): string => {
    const fixed = isFixed(row, col);
    const err = errors[`${row}-${col}`];
    const sel = selected && selected.row === row && selected.col === col;

    let colorClass = fixed ? "text-[#4B3A2B]" : "text-[#6C5A47]";
    if (sel) colorClass = "text-[#4A311C]";
    if (err) colorClass = "text-[#B44747]";

    return [
      "font-['EB_Garamond'] text-[20px] sm:text-[22px] leading-none",
      fixed ? "font-semibold" : "font-medium",
      colorClass,
    ].join(" ");
  };

  const numpadNums: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleNumpad = (num: number): void => {
    if (!selected) return;
    const { row, col } = selected;
    if (isFixed(row, col)) return;
    const newBoard = board.map((r) => [...r]);
    if (newBoard[row][col] === num) {
      newBoard[row][col] = 0;
      setErrors((prev) => {
        const n = { ...prev };
        delete n[`${row}-${col}`];
        return n;
      });
    } else {
      newBoard[row][col] = num;
      const valid = checkIfValid(newBoard);
      setErrors((prev) => ({ ...prev, [`${row}-${col}`]: !valid }));
      if (valid && checkCompletion(newBoard)) setCompleted(true);
    }
    setBoard(newBoard);
  };

  return (
    <div
      className="w-full max-w-[620px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B46B] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFF5DF]"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="mb-4 flex items-center justify-center gap-3">
        <img
          src="/smeshdoku.png"
          alt="Смешдоку"
          width={80}
          height={48}
          className="object-contain"
          draggable={false}
        />
      </div>

      <div className="flex justify-center">
        <div className="w-fit rounded-[26px] bg-[#EAEACB] p-6 shadow-[0_40px_80px_#E0C58066]">
          <div className="w-fit rounded-[22px] bg-[#F7EEC9] p-5">
            {/* Grid: no gap, borders handled per-cell for precise Sudoku lines */}
            <div className="inline-grid grid-cols-9" style={{ borderCollapse: "collapse" }}>
              {board.map((row, rIdx) =>
                row.map((val, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={[
                      "relative flex h-[54px] w-[54px] items-center justify-center",
                      "transition-colors duration-150 select-none cursor-pointer",
                      getCellBgClass(rIdx, cIdx),
                      selected?.row === rIdx && selected?.col === cIdx
                        ? "ring-2 ring-inset ring-[#CBA659]"
                        : "",
                    ].join(" ")}
                    style={getCellBorderStyle(rIdx, cIdx)}
                    onClick={() => handleCellClick(rIdx, cIdx)}
                  >
                    {val !== 0 &&
                      (SMESHARIK_MAP[val] ? (
                        <>
                          <img
                            src={SMESHARIK_MAP[val]}
                            alt={`Смешарик ${val}`}
                            width={45}
                            height={45}
                            className="object-contain"
                            draggable={false}
                          />
                          <span className="absolute left-1 top-1 text-[10px] font-semibold leading-none text-[#5B411E] [text-shadow:0_0_2px_#FDF6E3]">
                            {val}
                          </span>
                        </>
                      ) : (
                        <span className={getTextClasses(rIdx, cIdx)}>{val}</span>
                      ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="inline-grid grid-cols-9 justify-items-center gap-2">
          {numpadNums.map((n) => (
            <button
              key={n}
              onClick={() => handleNumpad(n)}
              className="relative flex h-12 w-12 items-center justify-center rounded-[12px] border border-[#E1D0A7] bg-[#F6EBC8] text-lg font-semibold text-[#6B5A44] shadow-[0_6px_16px_#E1D0A733] transition hover:bg-[#F0E1B8] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B46B]"
            >
              {SMESHARIK_MAP[n] ? (
                <>
                  <img
                    src={SMESHARIK_MAP[n]}
                    alt={`Смешарик ${n}`}
                    width={32}
                    height={32}
                    className="object-contain"
                    draggable={false}
                  />
                  <span className="absolute left-1 top-1 text-[10px] font-semibold leading-none text-[#6B5A44] [text-shadow:0_0_2px_#FDF6E3]">
                    {n}
                  </span>
                </>
              ) : (
                n
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleReset}
          className="rounded-full border-2 border-[#C9A85E] bg-[#F6E7BB] px-6 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6C4F2A] shadow-[0_8px_18px_#E1C57F66] transition hover:bg-[#F1E0A8] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B46B]"
        >
          Сброс
        </button>
        <button
          onClick={() => {
            setShowDifficulty(true);
          }}
          className="rounded-full border-2 border-[#D98C50] bg-[#F9E1C2] px-6 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#A85A1D] shadow-[0_8px_18px_#E1B48C66] transition hover:bg-[#F4D2A6] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98C50]"
        >
          Новая игра
        </button>
      </div>

       {showDifficulty && (
         <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
           <div className="relative max-w-[520px] rounded-[28px] border-4 border-[#7BC5F0] bg-[#1E9AD8] px-6 py-8 text-center shadow-[0_30px_80px_#0B6EA84D]">
            <button
              onClick={() => setShowDifficulty(false)}
              className="absolute right-4 top-4 h-7 w-7 rounded-full border-2 border-[#E8F6FF] text-[16px] font-bold text-[#E8F6FF]"
              aria-label="Закрыть"
            >
              ×
            </button>
            <div className="mb-6 text-[20px] font-semibold text-white sm:text-[22px]">
              Выберите сложность
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => startNewGame(1)}
                className="rounded-[16px] border-4 border-[#0D78B4] bg-[#45B2E6] py-3 text-[14px] font-bold uppercase tracking-[0.2em] text-white shadow-[inset_0_2px_0_#9AD8F4]"
              >
                Легко
              </button>
              <button
                onClick={() => startNewGame(2)}
                className="rounded-[16px] border-4 border-[#0D78B4] bg-[#45B2E6] py-3 text-[14px] font-bold uppercase tracking-[0.2em] text-white shadow-[inset_0_2px_0_#9AD8F4]"
              >
                Средне
              </button>
              <button
                onClick={() => startNewGame(3)}
                className="rounded-[16px] border-4 border-[#0D78B4] bg-[#45B2E6] py-3 text-[14px] font-bold uppercase tracking-[0.2em] text-white shadow-[inset_0_2px_0_#9AD8F4]"
              >
                Сложно
              </button>
              <button
                onClick={() => startNewGame(4)}
                className="rounded-[16px] border-4 border-[#0D78B4] bg-[#45B2E6] py-3 text-[14px] font-bold uppercase tracking-[0.2em] text-white shadow-[inset_0_2px_0_#9AD8F4]"
              >
                Эксперт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}