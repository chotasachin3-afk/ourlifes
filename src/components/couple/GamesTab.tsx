import { useEffect, useState } from "react";
import { Trash2, Plus, Shuffle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLiveTable, type Board, type QuizItem, type TodItem } from "@/lib/couple";
import { toast } from "sonner";
import { BingoGame } from "./BingoGame";
import { DoodleGame } from "./DoodleGame";

type Game = "tod" | "ttt" | "quiz" | "bingo" | "doodle";

export function GamesTab() {
  const [game, setGame] = useState<Game>("tod");
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["tod", "Truth or Dare"],
            ["ttt", "Tic-Tac-Toe"],
            ["quiz", "Know Me"],
            ["bingo", "Bingo"],
            ["doodle", "Doodle"],
          ] as [Game, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setGame(key)}
            className={`min-w-24 flex-1 rounded-full px-3 py-2 text-xs font-medium transition-all ${
              game === key
                ? "romance-gradient text-primary-foreground"
                : "border border-border text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {game === "tod" && <TruthOrDare />}
      {game === "ttt" && <TicTacToe />}
      {game === "quiz" && <Quiz />}
      {game === "bingo" && <BingoGame />}
      {game === "doodle" && <DoodleGame />}
    </section>
  );
}

/* ---------------- Truth or Dare ---------------- */

function TruthOrDare() {
  const { rows } = useLiveTable<TodItem>("truth_or_dare", true);
  const [current, setCurrent] = useState<TodItem | null>(null);
  const [manage, setManage] = useState(false);
  const [kind, setKind] = useState("truth");
  const [prompt, setPrompt] = useState("");

  const draw = (want: string) => {
    const pool = rows.filter((r) => r.kind === want);
    if (!pool.length) {
      toast.error(`No ${want}s left — add one!`);
      return;
    }
    setCurrent(pool[Math.floor(Math.random() * pool.length)]!);
  };

  const add = async () => {
    if (!prompt.trim()) return;
    await supabase.from("truth_or_dare").insert({ kind, prompt: prompt.trim() });
    setPrompt("");
  };

  return (
    <div className="space-y-4">
      <div className="panel flex min-h-40 items-center justify-center p-6 text-center">
        {current ? (
          <div className="float-in">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold">{current.kind}</p>
            <p className="mt-3 font-display text-2xl leading-snug text-blush">{current.prompt}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Pick your poison, love.</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => draw("truth")}
          className="flex-1 rounded-xl romance-gradient py-3 text-sm font-medium text-primary-foreground"
        >
          Truth
        </button>
        <button
          onClick={() => draw("dare")}
          className="flex-1 rounded-xl border border-gold/60 py-3 text-sm font-medium text-gold"
        >
          Dare
        </button>
      </div>

      <button
        onClick={() => setManage((m) => !m)}
        className="flex w-full items-center justify-center gap-2 text-xs text-muted-foreground"
      >
        <Shuffle className="size-3.5" />
        {manage ? "Hide questions" : `Manage questions (${rows.length})`}
      </button>

      {manage && (
        <div className="space-y-3">
          <div className="panel space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              {["truth", "dare"].map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`flex-1 rounded-lg py-2 text-xs capitalize ${
                    kind === k
                      ? "romance-gradient text-primary-foreground"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Add your own…"
              className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={add}
              className="flex w-full items-center justify-center gap-2 rounded-xl romance-gradient py-2.5 text-sm font-medium text-primary-foreground"
            >
              <Plus className="size-4" /> Add
            </button>
          </div>
          <ul className="space-y-2">
            {rows.map((r) => (
              <li key={r.id} className="panel flex items-center gap-3 px-4 py-3">
                <span className="w-12 shrink-0 text-[10px] uppercase tracking-widest text-gold">
                  {r.kind}
                </span>
                <span className="flex-1 text-sm">{r.prompt}</span>
                <button
                  onClick={() => supabase.from("truth_or_dare").delete().eq("id", r.id)}
                  aria-label="Delete question"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------------- Tic Tac Toe (realtime) ---------------- */

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function winnerOf(board: string[]) {
  for (const [a, b, c] of LINES) {
    if (board[a!] && board[a!] === board[b!] && board[a!] === board[c!]) return board[a!]!;
  }
  return board.every(Boolean) ? "draw" : null;
}

function TicTacToe() {
  const [state, setState] = useState<Board | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("tictactoe").select("*").eq("id", "main").maybeSingle();
      if (data) setState(data as Board);
    };
    load();
    const channel = supabase
      .channel("live-ttt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tictactoe" },
        (payload) => setState(payload.new as Board),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!state) return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;

  const board = state.board;
  const winner = winnerOf(board);

  const play = async (i: number) => {
    if (board[i] || winner) return;
    const next = [...board];
    next[i] = state.turn;
    setState({ ...state, board: next, turn: state.turn === "X" ? "O" : "X" });
    await supabase
      .from("tictactoe")
      .update({ board: next, turn: state.turn === "X" ? "O" : "X" })
      .eq("id", "main");
  };

  const reset = async () => {
    await supabase
      .from("tictactoe")
      .update({ board: ["", "", "", "", "", "", "", "", ""], turn: "X" })
      .eq("id", "main");
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        {winner === "draw"
          ? "It's a draw — kiss and try again."
          : winner
            ? `${winner} wins this one!`
            : `${state.turn}'s turn · synced live on both phones`}
      </p>
      <div className="panel mx-auto grid aspect-square w-full max-w-xs grid-cols-3 gap-2 p-2">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            className="flex items-center justify-center rounded-xl border border-border/60 bg-accent/30 font-display text-4xl text-gold transition-colors active:bg-accent"
          >
            {cell}
          </button>
        ))}
      </div>
      <button
        onClick={reset}
        className="mx-auto flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground"
      >
        <RotateCcw className="size-3.5" /> New round
      </button>
    </div>
  );
}

/* ---------------- Quiz ---------------- */

function Quiz() {
  const { rows } = useLiveTable<QuizItem>("quiz", true);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [manage, setManage] = useState(false);
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState("");
  const [ans, setAns] = useState("");

  const item = rows[index];

  const choose = (option: string) => {
    if (picked) return;
    setPicked(option);
    if (option === item?.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const add = async () => {
    const options = opts
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
    if (!q.trim() || options.length < 2 || !ans.trim()) {
      toast.error("Add a question, at least 2 options and the right answer");
      return;
    }
    if (!options.includes(ans.trim())) {
      toast.error("The answer must be one of the options");
      return;
    }
    await supabase.from("quiz").insert({ question: q.trim(), options, answer: ans.trim() });
    setQ("");
    setOpts("");
    setAns("");
  };

  return (
    <div className="space-y-4">
      {!item ? (
        <div className="panel p-8 text-center">
          <p className="font-display text-3xl text-romance">
            {score} / {rows.length}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {rows.length ? "That's how well you know me." : "No questions yet — add some below."}
          </p>
          {rows.length > 0 && (
            <button
              onClick={() => {
                setIndex(0);
                setScore(0);
                setPicked(null);
              }}
              className="mt-4 rounded-xl romance-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Play again
            </button>
          )}
        </div>
      ) : (
        <div className="panel space-y-4 p-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
            Question {index + 1} of {rows.length}
          </p>
          <p className="font-display text-2xl leading-snug text-blush">{item.question}</p>
          <div className="space-y-2">
            {item.options.map((o) => {
              const right = o === item.answer;
              const chosen = picked === o;
              return (
                <button
                  key={o}
                  onClick={() => choose(o)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    picked && right
                      ? "border-gold bg-gold/15 text-gold"
                      : chosen
                        ? "border-destructive bg-destructive/15 text-destructive"
                        : "border-border bg-accent/20"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {picked && (
            <button
              onClick={next}
              className="w-full rounded-xl romance-gradient py-2.5 text-sm font-medium text-primary-foreground"
            >
              Next
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => setManage((m) => !m)}
        className="flex w-full items-center justify-center gap-2 text-xs text-muted-foreground"
      >
        <Plus className="size-3.5" />
        {manage ? "Hide questions" : `Manage questions (${rows.length})`}
      </button>

      {manage && (
        <div className="space-y-3">
          <div className="panel space-y-3 p-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Question"
              className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              value={opts}
              onChange={(e) => setOpts(e.target.value)}
              placeholder="Options, comma separated"
              className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              value={ans}
              onChange={(e) => setAns(e.target.value)}
              placeholder="Correct answer"
              className="w-full rounded-xl border border-border bg-input/40 px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={add}
              className="w-full rounded-xl romance-gradient py-2.5 text-sm font-medium text-primary-foreground"
            >
              Add question
            </button>
          </div>
          <ul className="space-y-2">
            {rows.map((r) => (
              <li key={r.id} className="panel flex items-center gap-3 px-4 py-3">
                <span className="flex-1 text-sm">{r.question}</span>
                <button
                  onClick={() => supabase.from("quiz").delete().eq("id", r.id)}
                  aria-label="Delete question"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
