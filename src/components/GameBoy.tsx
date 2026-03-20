"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getRandomWord, isValidWord, evaluateGuess, type TileState } from "@/lib/words";

type Screen = "menu" | "game" | "about" | "won" | "lost";
type KeyState = "unused" | "correct" | "present" | "absent";

const GB_W = 304;
const GB_H = 504;
const SCR_W = 160;
const SCR_H = 144;
const TILE = 24;
const GAP = 4;
const PAD = 12;
const MAX_GUESSES = 6;

const C = {
  bg: "#C4CFA1",
  med: "#8B956D",
  dark: "#4D533C",
  ink: "#1F1F1F",
  body: "#EBECEB",
  accent: "#939393",
  scrBack: "#9A9A9A",
  btn: "#DA3452",
  btnBord: "#D44848",
  led: "#D44848",
};

function tileStyle(state: TileState): React.CSSProperties {
  const base: React.CSSProperties = {
    width: TILE,
    height: TILE,
    fontFamily: "var(--font-silkscreen), monospace",
    fontSize: 16,
    lineHeight: `${TILE}px`,
    textAlign: "center",
    textTransform: "uppercase",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  switch (state) {
    case "empty":
      return {
        ...base,
        background: C.bg,
        border: `1px solid ${C.med}`,
        color: C.med,
      };
    case "active":
      return {
        ...base,
        background: C.bg,
        border: `1px solid ${C.ink}`,
        color: C.ink,
      };
    case "correct":
      return { ...base, background: C.ink, color: C.bg };
    case "present":
      return { ...base, background: C.dark, color: C.bg };
    case "absent":
      return { ...base, background: C.med, color: C.bg };
  }
}

// --- Sub-components ---

function MenuScreen({
  menuOption,
  onSelect,
  onToggle,
}: {
  menuOption: "play" | "about";
  onSelect: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        width: SCR_W,
        height: SCR_H,
        background: C.ink,
        position: "relative",
        fontFamily: "var(--font-silkscreen), monospace",
      }}
    >
      {/* Title card */}
      <div
        style={{
          position: "absolute",
          left: 14,
          top: 18,
          width: 132,
          height: 65,
          background: C.bg,
          border: `2px solid ${C.bg}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 2,
            border: `2px solid ${C.med}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 20,
            fontWeight: 700,
            color: C.ink,
            letterSpacing: 2,
          }}
        >
          WORDLE
        </div>
        <div
          style={{
            position: "absolute",
            top: 38,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 6,
            color: C.med,
          }}
        >
          MMXXII
        </div>
      </div>

      {/* Options bar */}
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 91,
          width: 136,
          height: 29,
          background: C.bg,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 2,
            border: `2px solid ${C.med}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 10,
            fontSize: 12,
            fontWeight: 700,
            color: C.ink,
            cursor: "pointer",
          }}
          onClick={() => {
            if (menuOption !== "play") onToggle();
            else onSelect();
          }}
        >
          {menuOption === "play" ? ">" : "\u00A0"}PLAY
        </div>
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 10,
            fontSize: 12,
            fontWeight: 700,
            color: C.ink,
            cursor: "pointer",
          }}
          onClick={() => {
            if (menuOption !== "about") onToggle();
            else onSelect();
          }}
        >
          {menuOption === "about" ? ">" : "\u00A0"}ABOUT
        </div>
        {menuOption === "play" && (
          <div
            style={{
              position: "absolute",
              bottom: 4,
              left: 10,
              width: 42,
              height: 2,
              background: C.ink,
            }}
          />
        )}
        {menuOption === "about" && (
          <div
            style={{
              position: "absolute",
              bottom: 4,
              right: 10,
              width: 42,
              height: 2,
              background: C.ink,
            }}
          />
        )}
      </div>
    </div>
  );
}

function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <div
      style={{
        width: SCR_W,
        height: SCR_H,
        background: C.ink,
        position: "relative",
        fontFamily: "var(--font-silkscreen), monospace",
        color: C.bg,
        cursor: "pointer",
      }}
      onClick={onBack}
    >
      <div style={{ position: "absolute", top: 16, left: 12, fontSize: 18, fontWeight: 700 }}>
        WORDLE
      </div>
      <div style={{ position: "absolute", top: 40, left: 12, fontSize: 8, color: C.med }}>
        GAME BOY EDITION
      </div>
      <div style={{ position: "absolute", top: 60, left: 12, fontSize: 8, color: C.med }}>
        TYPE OR USE D-PAD
      </div>
      <div style={{ position: "absolute", top: 74, left: 12, fontSize: 8, color: C.med }}>
        A=SELECT B=DELETE
      </div>
      <div style={{ position: "absolute", top: 88, left: 12, fontSize: 8, color: C.med }}>
        START=SUBMIT
      </div>
      <div style={{ position: "absolute", top: 108, left: 12, right: 12, fontSize: 8, color: C.bg }}>
        {"\u25C0"} PRESS B TO GO BACK
      </div>
    </div>
  );
}

function GameGrid({
  guesses,
  evaluations,
  currentGuess,
  currentRow,
  shake,
}: {
  guesses: string[];
  evaluations: TileState[][];
  currentGuess: string;
  currentRow: number;
  shake: boolean;
}) {
  const scrollOffset = Math.max(0, currentRow * (TILE + GAP) + PAD + TILE - SCR_H + PAD);

  const rows = [];
  for (let row = 0; row < MAX_GUESSES; row++) {
    const y = PAD + row * (TILE + GAP) - scrollOffset;
    if (y + TILE < -4 || y > SCR_H + 4) continue;

    const isCurrentRow = row === currentRow;
    const tiles = [];

    for (let col = 0; col < 5; col++) {
      const x = PAD + col * (TILE + GAP);
      let state: TileState = "empty";
      let letter = "";

      if (row < guesses.length) {
        state = evaluations[row][col];
        letter = guesses[row][col];
      } else if (isCurrentRow && col < currentGuess.length) {
        state = "active";
        letter = currentGuess[col];
      }

      const isCursor = isCurrentRow && col === currentGuess.length && currentGuess.length < 5;

      tiles.push(
        <div
          key={col}
          style={{
            ...tileStyle(state),
            position: "absolute",
            left: x,
            top: y,
            ...(isCursor ? { border: `1px solid ${C.ink}` } : {}),
          }}
        >
          {isCursor && (
            <div
              className="animate-blink"
              style={{
                position: "absolute",
                bottom: 2,
                left: 4,
                right: 4,
                height: 2,
                background: C.ink,
              }}
            />
          )}
          {letter}
        </div>
      );
    }

    rows.push(
      <div key={row} className={isCurrentRow && shake ? "animate-shake" : ""}>
        {tiles}
      </div>
    );
  }

  return <>{rows}</>;
}

function EndOverlay({
  won,
  targetWord,
  guessCount,
}: {
  won: boolean;
  targetWord: string;
  guessCount: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        background: C.ink,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-silkscreen), monospace",
        zIndex: 10,
      }}
    >
      <div style={{ fontSize: 10, color: C.bg, fontWeight: 700 }}>
        {won ? `YOU WIN! ${guessCount}/${MAX_GUESSES}` : "GAME OVER"}
      </div>
      {!won && (
        <div style={{ fontSize: 8, color: C.med, marginTop: 2 }}>
          {targetWord.toUpperCase()}
        </div>
      )}
      <div style={{ fontSize: 6, color: C.med, marginTop: 2 }}>PRESS START</div>
    </div>
  );
}

function DPad({
  x,
  y,
  onUp,
  onDown,
  onLeft,
  onRight,
}: {
  x: number;
  y: number;
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
}) {
  const size = 72;
  const arm = 24;
  const center = (size - arm) / 2;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size }}>
      {/* Cross shape */}
      <div
        style={{
          position: "absolute",
          left: center,
          top: 0,
          width: arm,
          height: size,
          background: C.ink,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: center,
          width: size,
          height: arm,
          background: C.ink,
          borderRadius: 2,
        }}
      />
      {/* Center circle */}
      <div
        style={{
          position: "absolute",
          left: size / 2 - 6,
          top: size / 2 - 6,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "#2a2a2a",
        }}
      />
      {/* Clickable regions */}
      <button
        aria-label="D-pad up"
        onClick={onUp}
        style={{
          position: "absolute",
          left: center,
          top: 0,
          width: arm,
          height: size / 2 - 6,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      />
      <button
        aria-label="D-pad down"
        onClick={onDown}
        style={{
          position: "absolute",
          left: center,
          top: size / 2 + 6,
          width: arm,
          height: size / 2 - 6,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      />
      <button
        aria-label="D-pad left"
        onClick={onLeft}
        style={{
          position: "absolute",
          left: 0,
          top: center,
          width: size / 2 - 6,
          height: arm,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      />
      <button
        aria-label="D-pad right"
        onClick={onRight}
        style={{
          position: "absolute",
          left: size / 2 + 6,
          top: center,
          width: size / 2 - 6,
          height: arm,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      />
    </div>
  );
}

function RoundButton({
  x,
  y,
  label,
  onClick,
}: {
  x: number;
  y: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <button
        onClick={onClick}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: C.btn,
          border: `1px solid ${C.btnBord}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 0,
          width: 40,
          textAlign: "center",
          fontFamily: "var(--font-silkscreen), monospace",
          fontSize: 8,
          color: C.accent,
          pointerEvents: "none",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function PillButton({
  x,
  y,
  label,
  onClick,
}: {
  x: number;
  y: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <button
        onClick={onClick}
        style={{
          width: 40,
          height: 12,
          borderRadius: 12,
          background: C.accent,
          border: "none",
          cursor: "pointer",
          transform: "rotate(-22.5deg)",
          padding: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 26,
          left: -8,
          width: 56,
          textAlign: "center",
          fontFamily: "var(--font-silkscreen), monospace",
          fontSize: 7,
          color: C.accent,
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function SpeakerGrille() {
  const lines = [];
  for (let i = 0; i < 6; i++) {
    lines.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: 8 + i * 9,
          top: 38 - i * 4,
          width: 5,
          height: 32,
          border: `1px solid ${C.accent}`,
          transform: "rotate(-30deg)",
          transformOrigin: "center",
          borderRadius: 1,
        }}
      />
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        right: 14,
        bottom: 24,
        width: 82,
        height: 64,
      }}
    >
      {lines}
    </div>
  );
}

// --- Main Component ---

export default function GameBoy() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<TileState[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [menuOption, setMenuOption] = useState<"play" | "about">("play");
  const [shake, setShake] = useState(false);
  const [scale, setScale] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateScale() {
      const maxW = window.innerWidth * 0.92;
      const maxH = window.innerHeight * 0.95;
      setScale(Math.min(maxW / GB_W, maxH / GB_H, 2.5));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const startGame = useCallback(() => {
    setTargetWord(getRandomWord());
    setGuesses([]);
    setEvaluations([]);
    setCurrentGuess("");
    setKeyStates({});
    setScreen("game");
  }, []);

  const addLetter = useCallback(
    (letter: string) => {
      if (screen !== "game") return;
      setCurrentGuess((prev) => (prev.length < 5 ? prev + letter : prev));
    },
    [screen]
  );

  const removeLetter = useCallback(() => {
    if (screen !== "game") return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [screen]);

  const cycleLetter = useCallback(
    (dir: 1 | -1) => {
      if (screen !== "game") return;
      setCurrentGuess((prev) => {
        if (prev.length === 0) return dir === 1 ? "a" : "z";
        const last = prev.charCodeAt(prev.length - 1);
        let next = last + dir;
        if (next > 122) next = 97;
        if (next < 97) next = 122;
        return prev.slice(0, -1) + String.fromCharCode(next);
      });
    },
    [screen]
  );

  const submitGuess = useCallback(() => {
    if (screen !== "game" || currentGuess.length !== 5) return;
    if (!isValidWord(currentGuess)) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    const evaluation = evaluateGuess(currentGuess, targetWord);
    const newGuesses = [...guesses, currentGuess];
    const newEvals = [...evaluations, evaluation];

    const newKeyStates = { ...keyStates };
    for (let i = 0; i < 5; i++) {
      const l = currentGuess[i];
      const s = evaluation[i];
      if (s === "correct") newKeyStates[l] = "correct";
      else if (s === "present" && newKeyStates[l] !== "correct") newKeyStates[l] = "present";
      else if (s === "absent" && newKeyStates[l] !== "correct" && newKeyStates[l] !== "present")
        newKeyStates[l] = "absent";
    }

    setGuesses(newGuesses);
    setEvaluations(newEvals);
    setKeyStates(newKeyStates);
    setCurrentGuess("");

    if (currentGuess === targetWord) {
      setTimeout(() => setScreen("won"), 300);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setTimeout(() => setScreen("lost"), 300);
    }
  }, [screen, currentGuess, targetWord, guesses, evaluations, keyStates]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.repeat) return;
      const key = e.key;

      if (screen === "menu") {
        if (key === "ArrowLeft" || key === "ArrowRight") {
          setMenuOption((p) => (p === "play" ? "about" : "play"));
        } else if (key === "Enter") {
          if (menuOption === "play") startGame();
          else setScreen("about");
        }
        return;
      }

      if (screen === "about") {
        if (key === "Escape" || key === "Backspace" || key === "b" || key === "B") {
          setScreen("menu");
        }
        return;
      }

      if (screen === "game") {
        if (/^[a-zA-Z]$/.test(key)) {
          addLetter(key.toLowerCase());
        } else if (key === "Backspace") {
          removeLetter();
        } else if (key === "Enter") {
          submitGuess();
        } else if (key === "ArrowUp") {
          e.preventDefault();
          cycleLetter(1);
        } else if (key === "ArrowDown") {
          e.preventDefault();
          cycleLetter(-1);
        } else if (key === "ArrowLeft") {
          e.preventDefault();
          removeLetter();
        } else if (key === "ArrowRight") {
          e.preventDefault();
          setCurrentGuess((prev) => {
            if (prev.length > 0 && prev.length < 5) return prev + "a";
            return prev;
          });
        }
        return;
      }

      if (screen === "won" || screen === "lost") {
        if (key === "Enter") startGame();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [screen, menuOption, startGame, addLetter, removeLetter, submitGuess, cycleLetter]);

  const handleDPadUp = () => {
    if (screen === "game") cycleLetter(1);
  };
  const handleDPadDown = () => {
    if (screen === "game") cycleLetter(-1);
  };
  const handleDPadLeft = () => {
    if (screen === "menu") setMenuOption((p) => (p === "play" ? "about" : "play"));
    else if (screen === "game") removeLetter();
  };
  const handleDPadRight = () => {
    if (screen === "menu") setMenuOption((p) => (p === "play" ? "about" : "play"));
    else if (screen === "game") {
      setCurrentGuess((prev) => {
        if (prev.length > 0 && prev.length < 5) return prev + "a";
        return prev;
      });
    }
  };
  const handleA = () => {
    if (screen === "menu") {
      if (menuOption === "play") startGame();
      else setScreen("about");
    } else if (screen === "game") {
      submitGuess();
    } else if (screen === "won" || screen === "lost") {
      startGame();
    }
  };
  const handleB = () => {
    if (screen === "about") setScreen("menu");
    else if (screen === "game") removeLetter();
  };
  const handleStart = () => {
    if (screen === "menu") {
      if (menuOption === "play") startGame();
      else setScreen("about");
    } else if (screen === "game") {
      submitGuess();
    } else if (screen === "won" || screen === "lost") {
      startGame();
    }
  };
  const handleSelect = () => {
    if (screen === "menu") setMenuOption((p) => (p === "play" ? "about" : "play"));
  };

  const currentRow = guesses.length;

  return (
    <div
      ref={wrapperRef}
      style={{
        width: GB_W * scale,
        height: GB_H * scale,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: GB_W,
          height: GB_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
          userSelect: "none",
        }}
        tabIndex={0}
      >
        {/* Body */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: C.body,
            border: `1px solid ${C.accent}`,
            borderRadius: "8px 8px 64px 8px",
          }}
        />

        {/* Screen bezel */}
        <div
          style={{
            position: "absolute",
            top: 42,
            left: 24,
            right: 24,
            bottom: 270,
            background: C.scrBack,
            border: `1px solid ${C.accent}`,
            borderRadius: "8px 8px 32px 8px",
          }}
        />

        {/* LED */}
        <div
          style={{
            position: "absolute",
            left: 36,
            top: 110,
            width: 12,
            height: 12,
            background: screen !== "menu" ? C.led : "#8a4444",
            borderRadius: 8,
            boxShadow: screen !== "menu" ? `0 0 6px ${C.led}` : "none",
            transition: "all 0.3s",
          }}
        />

        {/* Bezel label */}
        <div
          style={{
            position: "absolute",
            left: 52,
            top: 107,
            fontFamily: "var(--font-silkscreen), monospace",
            fontSize: 5,
            color: C.accent,
            letterSpacing: 0.5,
          }}
        >
          DOT MATRIX
        </div>

        {/* Inner screen */}
        <div
          style={{
            position: "absolute",
            left: 72,
            top: 66,
            width: SCR_W,
            height: SCR_H,
            background: C.bg,
            overflow: "hidden",
            imageRendering: "auto",
          }}
        >
          {screen === "menu" && (
            <MenuScreen
              menuOption={menuOption}
              onSelect={() => {
                if (menuOption === "play") startGame();
                else setScreen("about");
              }}
              onToggle={() => setMenuOption((p) => (p === "play" ? "about" : "play"))}
            />
          )}

          {screen === "about" && <AboutScreen onBack={() => setScreen("menu")} />}

          {(screen === "game" || screen === "won" || screen === "lost") && (
            <>
              <GameGrid
                guesses={guesses}
                evaluations={evaluations}
                currentGuess={currentGuess}
                currentRow={currentRow}
                shake={shake}
              />
              {(screen === "won" || screen === "lost") && (
                <EndOverlay
                  won={screen === "won"}
                  targetWord={targetWord}
                  guessCount={guesses.length}
                />
              )}
            </>
          )}
        </div>

        {/* GAME BOY label */}
        <div
          style={{
            position: "absolute",
            left: 72,
            top: 218,
            width: SCR_W,
            textAlign: "center",
            fontFamily: "var(--font-silkscreen), monospace",
            fontSize: 7,
            fontWeight: 700,
            color: "rgba(100, 100, 100, 0.45)",
            letterSpacing: 1.5,
          }}
        >
          GAME BOY
        </div>

        {/* D-Pad */}
        <DPad
          x={24}
          y={306}
          onUp={handleDPadUp}
          onDown={handleDPadDown}
          onLeft={handleDPadLeft}
          onRight={handleDPadRight}
        />

        {/* B button */}
        <RoundButton x={192} y={334} label="B" onClick={handleB} />

        {/* A button */}
        <RoundButton x={240} y={310} label="A" onClick={handleA} />

        {/* Select */}
        <PillButton x={96} y={406} label="SELECT" onClick={handleSelect} />

        {/* Start */}
        <PillButton x={148} y={406} label="START" onClick={handleStart} />

        {/* Speaker grille */}
        <SpeakerGrille />
      </div>
    </div>
  );
}
