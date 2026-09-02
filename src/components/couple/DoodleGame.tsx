import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLiveTable, type Stroke } from "@/lib/couple";

const COLORS = ["#f3f0df", "#4fb0d8", "#9fd8ea", "#e0776b", "#7fe0b0"];
const W = 600;
const H = 600;

/** Shared canvas — strokes appear on both phones in real time. */
export function DoodleGame() {
  const { rows } = useLiveTable<Stroke>("doodle_strokes", true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const current = useRef<number[][]>([]);
  const [color, setColor] = useState(COLORS[1]!);

  const paint = (ctx: CanvasRenderingContext2D, points: number[][], stroke: string) => {
    if (points.length < 1) return;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(points[0]![0]!, points[0]![1]!);
    for (const p of points.slice(1)) ctx.lineTo(p[0]!, p[1]!);
    ctx.stroke();
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    for (const s of rows) paint(ctx, s.points, s.color);
  }, [rows]);

  const posOf = (e: React.PointerEvent<HTMLCanvasElement>): number[] => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - rect.left) / rect.width) * W, ((e.clientY - rect.top) / rect.height) * H];
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    current.current = [posOf(e)];
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    current.current.push(posOf(e));
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) paint(ctx, current.current.slice(-2), color);
  };

  const end = async () => {
    if (!drawing.current) return;
    drawing.current = false;
    const points = current.current;
    current.current = [];
    if (points.length < 2) return;
    await supabase.from("doodle_strokes").insert({ points, color });
  };

  const clear = async () => {
    await supabase.from("doodle_strokes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-muted-foreground">
        Draw together — strokes sync live on both phones.
      </p>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="panel aspect-square w-full touch-none"
      />
      <div className="flex items-center justify-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={`Pick colour ${c}`}
            style={{ background: c }}
            className={`size-7 rounded-full transition-transform ${
              color === c ? "scale-110 ring-2 ring-primary" : ""
            }`}
          />
        ))}
        <button
          onClick={clear}
          aria-label="Clear the canvas"
          className="ml-2 flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
        >
          <Eraser className="size-3.5" /> Clear
        </button>
      </div>
    </div>
  );
}
