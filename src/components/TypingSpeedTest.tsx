import { useState, useRef, useCallback, useEffect } from "react";
import { Keyboard, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const sentences = [
  "The quick brown fox jumps over the lazy dog near the river bank.",
  "A healthy lifestyle includes regular exercise and balanced nutrition.",
  "Early detection of health risks can significantly improve outcomes.",
  "Walking ten thousand steps daily reduces cardiovascular disease risk.",
  "Deep sleep is essential for memory consolidation and body recovery.",
];

interface Props {
  onResult: (wpm: number) => void;
}

export default function TypingSpeedTest({ onResult }: Props) {
  const [sentence, setSentence] = useState(() => sentences[Math.floor(Math.random() * sentences.length)]);
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setSentence(sentences[Math.floor(Math.random() * sentences.length)]);
    setTyped("");
    setStartTime(null);
    setWpm(null);
    setDone(false);
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (done) return;

    if (!startTime) setStartTime(Date.now());
    setTyped(val);

    if (val.length >= sentence.length) {
      const elapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60; // minutes
      const wordCount = sentence.split(" ").length;
      const calculatedWpm = Math.round(wordCount / Math.max(elapsed, 0.01));
      setWpm(calculatedWpm);
      setDone(true);
    }
  };

  const handleApply = () => {
    if (wpm !== null) onResult(wpm);
  };

  // Character-level coloring
  const renderSentence = () => {
    return sentence.split("").map((char, i) => {
      let cls = "text-muted-foreground";
      if (i < typed.length) {
        cls = typed[i] === char ? "text-health-good font-medium" : "text-health-danger font-medium underline";
      } else if (i === typed.length) {
        cls = "text-foreground bg-primary/15 rounded-sm";
      }
      return (
        <span key={i} className={cls}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Typing Speed Test</span>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="h-7 px-2 text-xs">
          <RotateCcw className="w-3 h-3 mr-1" /> New
        </Button>
      </div>

      <p className="text-sm leading-relaxed font-mono tracking-wide select-none min-h-[3rem]">
        {renderSentence()}
      </p>

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleChange}
        disabled={done}
        placeholder="Start typing here..."
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
        autoComplete="off"
        spellCheck={false}
      />

      {done && wpm !== null && (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-health-good" />
            <span className="text-sm font-bold text-foreground">{wpm} WPM</span>
            <span className="text-xs text-muted-foreground">
              ({Math.round((typed.split("").filter((c, i) => c === sentence[i]).length / sentence.length) * 100)}% accuracy)
            </span>
          </div>
          <Button size="sm" onClick={handleApply} className="h-7 text-xs">
            Use this score
          </Button>
        </div>
      )}
    </div>
  );
}
