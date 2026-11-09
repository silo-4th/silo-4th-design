import { Check, CircleDashed, Lightbulb, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { CONCEPTS } from "../data/materials";
import { getQuestion, type ErrorTag, type Question } from "../data/questions";
import { tagFor, useStore, type Confidence, type Source } from "../store";
import { GradeFail, gradeFailsNow } from "./GradeFail";

/** The card's main action, handed to a host that shows it as a fixed button below the card. */
export type QuizCta = { label: string; disabled: boolean; run: () => void; /** 빈칸·서술형: move on without answering (counted as wrong) */ skip?: () => void } | null;

export type QuizResult = { qid: string; correct: boolean; confidence: Confidence; tag?: ErrorTag; why?: string; skipped?: boolean };

const CONF: { v: Confidence; label: string }[] = [
  { v: "sure", label: "확실해요" },
  { v: "unsure", label: "애매해요" },
  { v: "guess", label: "찍었어요" },
];

/** Same chips as 꺼내 보기: shown from the start, dim until there is an answer. Picking one only selects it; 정답 확인 grades. */
function ConfChips({ q, off, value, onChange }: { q: string; off: boolean; value: Confidence | null; onChange: (c: Confidence) => void }) {
  return (
    <div className={`recall-conf quiz-conf ${off ? "off" : ""}`}>
      <span className="recall-conf-q">{q}</span>
      {CONF.map((c) => (
        <button key={c.v} className={`recall-conf-chip ${value === c.v ? "on" : ""}`} disabled={off} aria-pressed={value === c.v} onClick={() => onChange(c.v)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

/** Inline 정답 확인 for cards shown without the quiz panel's bottom bar. */
function CheckButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <div className="quiz-cta">
      <button className="btn btn-block btn-dark" disabled={disabled} onClick={onClick}>정답 확인</button>
    </div>
  );
}

export function tagChipClass(tag?: ErrorTag) {
  if (!tag) return "chip-green";
  if (tag === "찍어서 맞힘" || tag === "낮은 확신") return "chip-amber";
  return "chip-red";
}

export function QuizCard({
  qid,
  source,
  reviewOf,
  hints = true,
  showExplain = true,
  className = "",
  footer,
  top,
  num,
  onCta,
  onAnswered,
}: {
  qid: string;
  source: Source;
  reviewOf?: string;
  hints?: boolean;
  showExplain?: boolean;
  className?: string;
  footer?: (r: QuizResult) => ReactNode;
  /** Shown inside the card above the question, e.g. set progress. */
  top?: ReactNode;
  /** question number shown before the title (quiz panel) */
  num?: number;
  /** When given, the card hides its own submit button and reports it here instead. */
  onCta?: (cta: QuizCta) => void;
  onAnswered?: (r: QuizResult) => void;
}) {
  const q = getQuestion(qid)!;
  if (q.type === "빈칸" || q.type === "대화형") {
    return <WrittenCard q={q} source={source} reviewOf={reviewOf} hints={hints} showExplain={showExplain} className={className} footer={footer} top={top} num={num} onCta={onCta} onAnswered={onAnswered} />;
  }
  return <ChoiceCard q={q} source={source} reviewOf={reviewOf} hints={hints} showExplain={showExplain} className={className} footer={footer} top={top} num={num} onCta={onCta} onAnswered={onAnswered} />;
}

type CardProps = {
  q: Question;
  source: Source;
  reviewOf?: string;
  hints: boolean;
  showExplain: boolean;
  className: string;
  footer?: (r: QuizResult) => ReactNode;
  /** Shown inside the card above the question, e.g. set progress. */
  top?: ReactNode;
  /** question number shown before the title (quiz panel) */
  num?: number;
  onCta?: (cta: QuizCta) => void;
  onAnswered?: (r: QuizResult) => void;
};

function CardHead({ q, num, aside, below }: { q: Question; num?: number; aside?: ReactNode; below?: ReactNode }) {
  // "4. 문제…": the number is part of the title text, same size and weight
  const n = num ? `${num}. ` : "";
  return (
    <>
      <div className="q-chips" style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        <span className="chip">{CONCEPTS[q.concept].name}</span>
        {aside}
      </div>
      {q.type === "빈칸" ? (
        <p className="q-stem">
          {n}
          {q.stem.split("____").map((part, i, arr) => (
            <span key={i}>{part}{i < arr.length - 1 && <span className="q-blank" aria-label="빈칸">&nbsp;</span>}</span>
          ))}
        </p>
      ) : (
        <>
          <p className="q-stem">{n}{q.stem}</p>
        </>
      )}
      {q.code && <pre className="q-code mono">{q.code}</pre>}
      {below}
    </>
  );
}

function Hints({ q, n }: { q: Question; n: number }) {
  return (
    <>
      {q.hints.slice(0, Math.min(n, 1)).map((h, i) => (
        <div className="hint" key={i}>
          <Lightbulb size={15} style={{ flex: "none", marginTop: 1 }} />
          <span><b>힌트</b> {h}</span>
        </div>
      ))}
    </>
  );
}

function HintButton({ n, onMore }: { n: number; onMore: () => void }) {
  return (
    n >= 1 ? null : (
      <button className="hint-link" onClick={onMore}>
        <Lightbulb size={13} />
        힌트
      </button>
    )
  );
}

function ResultBanner({ result }: { result: QuizResult }) {
  return (
    <div className={`q-result ${result.correct ? "ok" : "no"}`}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {result.correct ? <Check size={18} /> : <X size={18} />}
        {result.correct ? "정답입니다!" : "아쉬워요, 오답이에요"}
      </span>
      {result.tag && <span className={`chip ${tagChipClass(result.tag)}`}>{result.tag}</span>}
    </div>
  );
}

/** Small badge at the right of the 해설 title: the error tag (개념 혼동…) in the banner's own colours. */
function ResultTag({ result }: { result: QuizResult }) {
  // the verdict line already says 맞았어요/틀렸어요, so only a mistake type (개념 혼동…) gets a badge
  // yellow ones (낮은 확신 / 찍어서 맞힘) are left out: the explanation box keeps to the verdict and the 해설
  return result.tag && tagChipClass(result.tag) !== "chip-amber" ? <span className={`chip ${tagChipClass(result.tag)}`}>{result.tag}</span> : null;
}

/** The answer's verdict, first thing in the explanation box: ✓ 맞았어요 / ✕ 틀렸어요. */
function Verdict({ result }: { result: QuizResult }) {
  return (
    <b className={`verdict ${result.correct ? "ok" : "no"}`}>
      {result.correct ? <Check size={18} strokeWidth={3} aria-hidden /> : <X size={18} strokeWidth={3} aria-hidden />}
      {result.correct ? "맞았어요" : "틀렸어요"}
    </b>
  );
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

/** 빈칸 grades the typed word; 대화형 compares the learner's explanation with key points, then lets them judge. */
function WrittenCard({ q, source, reviewOf, hints, showExplain, className, footer, top, num, onCta, onAnswered }: CardProps) {
  const { dispatch } = useStore();
  const [text, setText] = useState("");
  const [stage, setStage] = useState<"write" | "done">("write");
  const [conf, setConf] = useState<Confidence | null>(null);
  const [hintN, setHintN] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const talk = q.type === "대화형";

  const empty = !text.trim();
  const typedRight = !talk && !!q.blank?.some((a) => norm(text).includes(norm(a)));
  const covered = talk ? (q.talk ?? []).map((p) => p.keywords.some((k) => norm(text).includes(norm(k)))) : [];

  // 빈칸: the typed word must match; 대화형: the explanation must touch at least half of the key points
  const gradeAs = () => (talk ? covered.filter(Boolean).length >= Math.ceil((q.talk?.length ?? 1) / 2) : typedRight);

  // 정답 확인: on once there is an answer and a confidence; shown in the panel's bottom bar (or inline without one)
  const canCheck = stage === "write" && !empty && conf !== null;
  // 채점 결과를 받지 못했을 때: the answer stays, the pink note offers 다시 시도 / 다음 문제로, and the bottom button steps aside
  const [gradeFailed, setGradeFailed] = useState(false);
  const check = () => {
    if (!canCheck) return;
    if (gradeFailsNow()) { setGradeFailed(true); return; }
    setGradeFailed(false);
    finish(gradeAs(), conf!);
  };
  useEffect(() => {
    onCta?.(stage === "write" && !gradeFailed ? { label: "정답 확인", disabled: !canCheck, run: check, skip } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCta, stage, text, conf, hintN, gradeFailed]);

  // "이 문제 건너뛰기" (same as 꺼내 보기): recorded as a wrong guess, and the host moves straight on to the next question
  const skip = () => {
    dispatch({ type: "attempt", attempt: { qid: q.id, correct: false, confidence: "guess", hints: hintN, source, reviewOf }, picked: -1 });
    onAnswered?.({ qid: q.id, correct: false, confidence: "guess", tag: tagFor(false, "guess", talk ? "개념 부족" : "암기 오류"), skipped: true });
  };

  const finish = (correct: boolean, confidence: Confidence) => {
    dispatch({ type: "attempt", attempt: { qid: q.id, correct, confidence, hints: hintN, source, reviewOf }, picked: -1 });
    const r: QuizResult = {
      qid: q.id,
      correct,
      confidence,
      tag: tagFor(correct, confidence, talk ? "개념 부족" : "암기 오류"),
      why: talk ? undefined : `입력한 답 · ${text.trim()}`,
    };
    setResult(r);
    setStage("done");
    onAnswered?.(r);
  };

  return (
    <div className={className}>
      {top}
      <CardHead
        q={q}
        num={num}
        aside={hints && stage === "write" ? <HintButton n={hintN} onMore={() => setHintN((n) => n + 1)} /> : null}
        below={stage === "write" ? <Hints q={q} n={hintN} /> : null}
      />
      {talk ? (
        <textarea
          className="input q-write"
          rows={4}
          placeholder="핵심 개념을 넣어 내 말로 설명해 보세요"
          value={text}
          disabled={stage !== "write"}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        stage === "done" && result ? (
          // graded: my answer becomes a row like a 객관식 option (✕ wrong / ✓ right)
          <div className={`opt ${result.correct ? "right" : "wrong"} q-fill-answer`} aria-label="내 답">
            <span className="k">{result.correct ? <Check size={12} /> : <X size={12} />}</span>
            {text.trim()}
          </div>
        ) : (
        <input
          className="input q-fill"
          placeholder="빈칸에 들어갈 말"
          value={text}
          disabled={stage === "done"}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && text.trim() && conf) finish(gradeAs(), conf);
          }}
        />
        )
      )}

      {!talk && stage === "done" && result && !result.correct && (
        <div className="opt right q-fill-answer" aria-label="정답">
          <span className="k"><Check size={12} /></span>
          {q.blank![0]}
        </div>
      )}

      {stage === "write" && <ConfChips q={talk ? "쓴 설명, 얼마나 확실해요?" : "쓴 답, 얼마나 확실해요?"} off={empty} value={conf} onChange={setConf} />}
      {stage === "write" && gradeFailed && <GradeFail onRetry={check} onNext={skip} />}
      {stage === "write" && !onCta && !gradeFailed && <CheckButton disabled={!canCheck} onClick={check} />}

      {talk && stage !== "write" && (
        <div className="talk-check">
          <div className="talk-check-head explain-head">
            {result ? <Verdict result={result} /> : <b>핵심</b>}
            {result && <ResultTag result={result} />}
          </div>
          <div className="talk-check-sub">핵심 {q.talk!.length}개 중 {covered.filter(Boolean).length}개를 짚었어요
          </div>
          {q.talk!.map((p, i) => (
            <div key={p.label} className={`talk-point ${covered[i] ? "on" : ""}`}>
              {covered[i] ? <Check size={14} /> : <CircleDashed size={14} />}
              {p.label}
            </div>
          ))}
          <div className="talk-model"><b>모범 답안</b>{q.explanation}</div>
        </div>
      )}

      {stage === "done" && result && (
        <>
          {/* with an explanation below, the result lives as a badge on its title; otherwise keep the banner */}
          {!showExplain && <ResultBanner result={result} />}
          {showExplain && !talk && (
            <div className="explain">
              <div className="explain-head"><Verdict result={result} /><ResultTag result={result} /></div>
              {q.explanation}
            </div>
          )}
          {footer?.(result)}
        </>
      )}
    </div>
  );
}

function ChoiceCard({ q, source, reviewOf, hints, showExplain, className, footer, top, num, onCta, onAnswered }: CardProps) {
  const qid = q.id;
  const { dispatch } = useStore();
  const [picked, setPicked] = useState<number | null>(null);
  const [stage, setStage] = useState<"pick" | "done">("pick");
  const [conf, setConf] = useState<Confidence | null>(null);
  const [hintN, setHintN] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const canCheck = stage === "pick" && picked !== null && conf !== null;
  const [gradeFailed, setGradeFailed] = useState(false);
  useEffect(() => {
    if (!onCta) return;
    onCta(stage === "pick" && !gradeFailed ? { label: "정답 확인", disabled: !canCheck, run: () => conf && submit(conf) } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCta, stage, picked, conf, hintN, gradeFailed]);
  // 다음 문제로 after a failed grading: recorded as not graded (a wrong guess) and the host moves on
  const skipUngraded = () => {
    dispatch({ type: "attempt", attempt: { qid, correct: false, confidence: "guess", hints: hintN, source, reviewOf }, picked: picked ?? -1 });
    onAnswered?.({ qid, correct: false, confidence: "guess", tag: tagFor(false, "guess", undefined), skipped: true });
  };

  const submit = (confidence: Confidence) => {
    if (picked === null) return;
    if (gradeFailsNow()) { setGradeFailed(true); return; }
    setGradeFailed(false);
    const correct = picked === q.answer;
    dispatch({ type: "attempt", attempt: { qid, correct, confidence, hints: hintN, source, reviewOf }, picked });
    const r: QuizResult = { qid, correct, confidence, tag: tagFor(correct, confidence, q.options[picked].tag), why: q.options[picked].why };
    setResult(r);
    setStage("done");
    onAnswered?.(r);
  };

  const letters = q.type === "OX" ? ["O", "X"] : ["A", "B", "C", "D"];
  return (
    <div className={className}>
      {top}
      <CardHead
        q={q}
        num={num}
        aside={hints && stage === "pick" ? <HintButton n={hintN} onMore={() => setHintN((n) => n + 1)} /> : null}
        below={stage !== "done" ? <Hints q={q} n={hintN} /> : null}
      />

      <div className="opts" role="radiogroup">
        {q.options.map((o, i) => {
          let cls = "opt";
          if (stage === "done") {
            if (i === q.answer) cls += " right";
            else if (i === picked) cls += " wrong";
            else cls += " dim";
          } else if (i === picked) cls += " sel";
          return (
            <button key={i} className={cls} role="radio" aria-checked={i === picked} disabled={stage === "done"} onClick={() => stage !== "done" && setPicked(i)}>
              <span className="k">{stage === "done" && i === q.answer ? <Check size={12} /> : stage === "done" && i === picked ? <X size={12} /> : letters[i]}</span>
              <span className={q.type === "객관식" && o.text.includes("SELECT") ? "mono" : ""} style={{ fontSize: o.text.includes("SELECT") ? 12.5 : undefined }}>
                {o.text}
              </span>
            </button>
          );
        })}
      </div>

      {stage === "pick" && <ConfChips q="고른 답, 얼마나 확실해요?" off={picked === null} value={conf} onChange={setConf} />}
      {stage === "pick" && gradeFailed && <GradeFail onRetry={() => conf && submit(conf)} onNext={skipUngraded} />}
      {stage === "pick" && !onCta && !gradeFailed && <CheckButton disabled={!canCheck} onClick={() => conf && submit(conf)} />}

      {stage === "done" && result && (
        <>
          {!showExplain && <ResultBanner result={result} />}
          {showExplain && (
            <div className="explain">
              <div className="explain-head"><Verdict result={result} /><ResultTag result={result} /></div>
              {q.explanation}
            </div>
          )}
          {footer?.(result)}
        </>
      )}
    </div>
  );
}
