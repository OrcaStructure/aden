"use client";

import { useCallback, useRef, useState } from "react";
import { Chess } from "chess.js";
import {
  Chessboard,
  type ChessboardOptions,
  type PieceDropHandlerArgs,
} from "react-chessboard";

type CompletedLine = {
  id: number;
  pgn: string;
  lichessUrl: string;
};

export default function Page() {
  const gameRef = useRef<Chess>(new Chess());

  const [position, setPosition] = useState<string>(gameRef.current.fen());
  const [isFetchingReply, setIsFetchingReply] = useState<boolean>(false);
  const [completedLines, setCompletedLines] = useState<CompletedLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const log = useCallback((msg: string): void => {
    // visible + console for good measure
    // eslint-disable-next-line no-console
    console.log(msg);
    setDebugLog((prev) => [msg, ...prev].slice(0, 30));
  }, []);

  const syncPosition = useCallback((): void => {
    const fen = gameRef.current.fen();
    setPosition(fen);
    log(`syncPosition -> ${fen}`);
  }, [log]);

  const resetGame = useCallback((): void => {
    log("resetGame");
    gameRef.current = new Chess();
    setError(null);
    setIsFetchingReply(false);
    setPosition(gameRef.current.fen());
  }, [log]);

  const jumpBackTwoMoves = useCallback((): void => {
    const game = gameRef.current;
    const len = game.history().length;
    log(`jumpBackTwoMoves (history length: ${len})`);

    if (len < 2) {
      resetGame();
      return;
    }

    game.undo();
    game.undo();
    setError(null);
    syncPosition();
  }, [log, resetGame, syncPosition]);

  const saveCompletedLine = useCallback((): void => {
    const game = gameRef.current;
    const pgn = game.pgn().trim();
    if (!pgn) {
      log("saveCompletedLine skipped (empty PGN)");
      return;
    }

    const encoded = encodeURIComponent(pgn);
    const lichessUrl = `https://lichess.org/analysis/pgn/${encoded}`;

    log(`saveCompletedLine -> ${pgn}`);
    setCompletedLines((prev) => [
      { id: prev.length + 1, pgn, lichessUrl },
      ...prev,
    ]);
  }, [log]);

  const fetchLichessReply = useCallback(async (): Promise<void> => {
    const game = gameRef.current;

    if (game.isGameOver()) {
      log("Game over before reply; saving line.");
      saveCompletedLine();
      return;
    }

    setIsFetchingReply(true);
    setError(null);

    try {
      const fenStr = game.fen();
      const fen = encodeURIComponent(fenStr);
      log(`fetchLichessReply -> fen ${fenStr}`);

      const response = await fetch(
        `https://explorer.lichess.ovh/master?fen=${fen}`
      );

      if (!response.ok) {
        const msg = `Lichess HTTP ${response.status}; ending line.`;
        log(msg);
        setError(msg);
        saveCompletedLine();
        return;
      }

      const data = await response.json();

      if (!data.moves || data.moves.length === 0) {
        log("No moves from Lichess; saving line.");
        saveCompletedLine();
        return;
      }

      const goodMoves = data.moves.filter((m: any) => {
        const total =
          (m.white || 0) + (m.black || 0) + (m.draws || 0);
        return total >= 3;
      });

      const pool = goodMoves.length > 0 ? goodMoves : data.moves;
      const choice =
        pool[Math.floor(Math.random() * pool.length)];

      log(
        `Lichess choice -> san: ${choice.san || ""}, uci: ${
          choice.uci || ""
        }`
      );

      let applied = false;

      if (choice.san) {
        const move = game.move(choice.san);
        if (move) {
          applied = true;
          log(`Applied SAN: ${choice.san}`);
        }
      } else if (choice.uci) {
        const uci: string = choice.uci;
        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const promotion = uci[4];
        const move = game.move({
          from,
          to,
          promotion: promotion || "q",
        });
        if (move) {
          applied = true;
          log(`Applied UCI: ${uci}`);
        }
      }

      if (!applied) {
        const msg = "Could not apply Lichess move; ending line.";
        log(msg);
        setError(msg);
        saveCompletedLine();
        return;
      }

      syncPosition();

      if (game.isGameOver()) {
        log("Game over after reply; saving line.");
        saveCompletedLine();
      }
    } catch (err: any) {
      const msg = `Error contacting Lichess: ${
        err?.message || String(err)
      }`;
      log(msg);
      setError(msg);
      saveCompletedLine();
    } finally {
      setIsFetchingReply(false);
    }
  }, [log, saveCompletedLine, syncPosition]);

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare, piece }: PieceDropHandlerArgs): boolean => {
      if (isFetchingReply) {
        log(
          `Drop blocked (fetching reply): ${piece} ${sourceSquare} -> ${targetSquare}`
        );
        return false;
      }

      const game = gameRef.current;

      log(
        `onPieceDrop: ${piece} ${sourceSquare} -> ${targetSquare}`
      );

      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) {
        log("Illegal move (snapback).");
        return false;
      }

      log(`Player move accepted: ${move.san}`);
      setError(null);
      syncPosition();

      // async reply (do not await here)
      void fetchLichessReply();

      return true;
    },
    [fetchLichessReply, isFetchingReply, log, syncPosition]
  );

  const chessboardOptions: ChessboardOptions = {
    id: "lichess-db-sparring",
    position,
    boardOrientation: "white",
    allowDragging: !isFetchingReply,
    onPieceDrop,
    boardStyle: {
      borderRadius: "16px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    },
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-zinc-50 text-black">
      <main className="w-full max-w-5xl px-6 sm:px-10 py-10 flex flex-col gap-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Lichess Database Sparring
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col gap-3">
            <div className="shadow-xl rounded-2xl p-3 bg-white">
              <Chessboard options={chessboardOptions} />
            </div>

            <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
              <button
                type="button"
                onClick={resetGame}
                className="px-4 py-2 rounded-full border border-zinc-300 hover:bg-zinc-100 transition"
              >
                Restart
              </button>
              <button
                type="button"
                onClick={jumpBackTwoMoves}
                className="px-4 py-2 rounded-full border border-zinc-300 hover:bg-zinc-100 transition"
              >
                Back 2 moves
              </button>
            </div>

            <div className="text-[10px] text-zinc-600">
              <div>FEN</div>
              <code className="mt-1 block bg-zinc-100 px-3 py-2 rounded break-all">
                {position}
              </code>
              {isFetchingReply && (
                <div className="mt-1">
                  Fetching reply from Lichess…
                </div>
              )}
              {error && (
                <div className="mt-1 text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3 text-[10px]">
            <div className="font-semibold text-zinc-700">
              Debug
            </div>
            <div className="bg-zinc-100 rounded-lg p-2 h-52 overflow-auto border border-zinc-200">
              {debugLog.length === 0 && (
                <div className="text-zinc-500">
                  Move pieces to see logs.
                </div>
              )}
              {debugLog.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>

            <div className="font-semibold text-zinc-700 mt-4">
              Saved lines
            </div>
            {completedLines.length === 0 && (
              <div className="text-zinc-500">
                When the database runs out, lines appear here.
              </div>
            )}
            {completedLines.map((line) => (
              <div
                key={line.id}
                className="px-3 py-2 rounded-lg bg-white border border-zinc-200 mb-1"
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="text-[10px] font-semibold text-zinc-500">
                    Line #{line.id}
                  </div>
                  <a
                    href={line.lichessUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] underline underline-offset-2"
                  >
                    Lichess
                  </a>
                </div>
                <div className="text-[9px] leading-snug text-zinc-800 break-words">
                  {line.pgn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
