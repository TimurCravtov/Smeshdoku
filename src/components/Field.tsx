import { useState, useCallback, type KeyboardEvent, type CSSProperties } from "react";
import { generateField, checkIfCompleted, checkIfValid, type SudokuGame } from "../lib/sudoku_helpers";
import { createPortal } from "react-dom";

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
  const [game, setGame] = useState<SudokuGame>(() => createGame(3));
  const [board, setBoard] = useState<number[][]>(() => cloneBoard(game.puzzle));
  const [selected, setSelected] = useState<CellCoords | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [_, setCompleted] = useState<boolean>(false);
  const [showDifficulty, setShowDifficulty] = useState<boolean>(false);
  const [showAuthor, setShowAuthor] = useState<boolean>(false);

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
      "font-['EB_Garamond'] text-[clamp(14px,4vw,20px)] leading-none",
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

  const handleToggleAuthor = () => setShowAuthor((prev) => !prev);

  // Responsive cell size: fills available width on mobile, capped at 54px on desktop.
  // 32px accounts for the outer board padding (16px each side at minimum).
  const cellSize = "min(54px, calc((100vw - 32px) / 9))";

  return (
    <div className="relative">
      <div
        className="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B46B] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFF5DF]"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <img
            src="/smeshdoku.png"
            alt="Смешдоку"
            width={80}
            height={48}
            className="object-contain"
            draggable={false}
          />
          <div
            className="relative cursor-pointer"
            onMouseEnter={() => setShowAuthor(true)}
            onMouseLeave={() => setShowAuthor(false)}
            onClick={handleToggleAuthor}
          >
            <img
              src="q.png"
              alt="Q"
              width={48}
              height={48}
              className="object-contain"
              draggable={false}
            />

            {showAuthor && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-[10px] w-[220px] z-50
                  bg-gradient-to-b from-[#7a6235] to-[#4e3a1e]
                  rounded-[20px] p-4 shadow-2xl
                  border border-[#c9a85e]/40
                  backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2 pt-2 mt-2">
                  <div className="relative">
                    <img
                      src="/author.png"
                      alt="автор"
                      width={52}
                      height={52}
                      className="rounded-full object-cover ring-2 ring-[#c9a85e]/60 ring-offset-2 ring-offset-[#5a3e1e]"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-bold text-[#f3ecc7] tracking-wide">tima40</p>
                    <p className="text-[10px] text-[#c9a85e]/70 uppercase tracking-widest">автор</p>
                  </div>
                  <div className="w-full h-px bg-[#c9a85e]/20 my-1" />
                  <a
                    href="https://github.com/TimurCravtov/Smeshdoku"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[12px] text-[#f3ecc7]/80 hover:text-[#f3ecc7] mb-[3px] transition-colors group"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 group-hover:opacity-100">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    Smeshdoku
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Board */}
        <div className="flex justify-center px-0">
        
          <div
            className=""
            style={{ padding: "clamp(8px, 3vw, 24px)" }}
          >
            <div
              className="w-fit rounded-[22px] bg-[#EAEACB]"
              style={{ padding: "clamp(6px, 2.5vw, 20px)" }}
            >
              {/*
                Grid: each cell uses CSS var --cell for both width and height.
                --cell = min(54px, (100vw - 32px) / 9)
                This ensures the whole grid is always ≤ 100vw.
              */}
              <div
                className="inline-grid grid-cols-9"
                style={{ "--cell": cellSize } as CSSProperties}
              >
                {board.map((row, rIdx) =>
                  row.map((val, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={[
                        "relative flex items-center justify-center",
                        "transition-colors duration-150 select-none cursor-pointer",
                        getCellBgClass(rIdx, cIdx),
                        selected?.row === rIdx && selected?.col === cIdx
                          ? "ring-2 ring-inset ring-[#CBA659]"
                          : "",
                      ].join(" ")}
                      style={{
                        ...getCellBorderStyle(rIdx, cIdx),
                        width: "var(--cell)",
                        height: "var(--cell)",
                      }}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                    >
                      {val !== 0 &&
                        (SMESHARIK_MAP[val] ? (
                          <>
                            <img
                              src={SMESHARIK_MAP[val]}
                              alt={`Смешарик ${val}`}
                              // Scale image to ~83% of cell, but no larger than 45px
                              style={{
                                width: "min(45px, calc(var(--cell) * 0.83))",
                                height: "min(45px, calc(var(--cell) * 0.83))",
                                objectFit: "contain",
                              }}
                              draggable={false}
                            />
                           
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

        {/* Numpad */}
        <div className="mt-4 flex justify-center px-0">
          <div
            className="inline-grid grid-cols-9 justify-items-center"
            style={{
              gap: "clamp(2px, 1vw, 8px)",
              "--cell": cellSize,
            } as CSSProperties}
          >
            {numpadNums.map((n) => (
              <button
                key={n}
                onClick={() => handleNumpad(n)}
                className="relative flex items-center justify-center rounded-[12px] border border-[#E1D0A7] bg-[#F6EBC8] font-semibold text-[#6B5A44] shadow-[0_6px_16px_#E1D0A733] transition hover:bg-[#F0E1B8] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B46B]"
                style={{
                  width: "var(--cell)",
                  height: "var(--cell)",
                  fontSize: "clamp(12px, 3.5vw, 18px)",
                }}
              >
                {SMESHARIK_MAP[n] ? (
                  <>
                    <img
                      src={SMESHARIK_MAP[n]}
                      alt={`Смешарик ${n}`}
                      style={{
                        width: "min(32px, calc(var(--cell) * 0.65))",
                        height: "min(32px, calc(var(--cell) * 0.65))",
                        objectFit: "contain",
                      }}
                      draggable={false}
                    />
                  </>
                ) : (
                  n
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-[20px] flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleReset}
            className="rounded-[16px] border-2 border-[#C9A85E] bg-[#F6E7BB] px-8 py-2.5
        text-[11px] font-bold uppercase tracking-[0.22em] text-[#6C4F2A]
        shadow-[inset_0_2px_0_#fffbe8,0_4px_12px_#E1C57F44]
        transition hover:bg-[#F1E0A8] active:scale-95 active:shadow-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B46B] h-[32px]"
          >
            Сброс
          </button>
          <button
            onClick={() => setShowDifficulty(true)}
            className="rounded-[16px] border-2 border-[#D98C50] bg-[#F9E1C2] px-8 py-2.5
        text-[11px] font-bold uppercase tracking-[0.22em] text-[#A85A1D]
        shadow-[inset_0_2px_0_#fff5e8,0_4px_12px_#E1B48C44]
        transition hover:bg-[#F4D2A6] active:scale-95 active:shadow-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98C50] h-[32px]"
          >
            Новая игра
          </button>
        </div>
      </div>

      {/* Difficulty modal */}
      {showDifficulty && createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: "16px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDifficulty(false); }}
        >
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: "400px",
            borderRadius: "28px",
            border: "4px solid #7BC5F0",
            background: "#1E9AD8",
            padding: "32px 24px",
            textAlign: "center",
          }}>
            <button
              onClick={() => setShowDifficulty(false)}
              style={{
                position: "absolute", right: 16, top: 16,
                width: 28, height: 28, borderRadius: "50%",
                border: "2px solid #E8F6FF", background: "transparent",
                color: "#E8F6FF", fontSize: 18, fontWeight: "bold",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >×</button>
            <div style={{ marginBottom: 24, fontSize: 20, fontWeight: 600, color: "#fff" }}>
              Выберите сложность
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {([["Легко", 1], ["Средне", 2], ["Сложно", 3], ["Эксперт", 4]] as const).map(([label, lvl]) => (
                <button key={lvl} onClick={() => startNewGame(lvl)} style={{
                  borderRadius: 16, border: "4px solid #0D78B4", background: "#45B2E6",
                  padding: "12px", fontSize: 14, fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff",
                  cursor: "pointer", boxShadow: "inset 0 2px 0 #9AD8F4",
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}