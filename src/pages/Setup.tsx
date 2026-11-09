import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mascot } from "../components/Brand";
import { type QuizResult } from "../components/QuizCard";
import { ConfRow } from "./Recall";
import { CONCEPTS, EXAM, getMaterial } from "../data/materials";
import { DIAGNOSIS_SET, getQuestion } from "../data/questions";
import { joinWa } from "../lib/josa";
import { tagFor, useStore, type Confidence } from "../store";
import { HOME } from "../App";

export function Setup() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  // first visit: no exam picker any more — go straight to a short skill check in the 꺼내 보기 layout
  const [step, setStep] = useState<"intro" | "quiz" | "done">("intro");
  // daily study time is no longer asked during setup; keep the default plan length
  const minutes = 30;
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const total = DIAGNOSIS_SET.length;

  const finish = (diagnosed: boolean) => {
    dispatch({ type: "setup", dailyMinutes: minutes, diagnosed });
    nav(HOME);
  };
  const record = (r: QuizResult, picked: number) => {
    dispatch({ type: "attempt", attempt: { qid: r.qid, correct: r.correct, confidence: r.confidence, hints: 0, source: "diagnosis" }, picked });
    setResults((rs) => [...rs, r]);
    if (idx + 1 < total) setIdx(idx + 1);
    else setStep("done");
  };

  return (
    <main className="recall">
      <section className="recall-frame">
        <div className="recall-bar">
          <span className="recall-bar-title">실력 진단</span>
          {step === "quiz" && <span className="recall-bar-count">{idx + 1} / {total}</span>}
        </div>
        {step === "quiz" && (
          <div className="recall-steps" role="progressbar" aria-label="실력 진단 진행" aria-valuemin={1} aria-valuemax={total} aria-valuenow={idx + 1}>
            {DIAGNOSIS_SET.map((_, k) => <i key={k} className={k < idx ? "on" : k === idx ? "now" : ""} />)}
          </div>
        )}
        <div className="recall-body">
          {step === "intro" && (
            <div className="recall-col">
              <h1 className="recall-title">{state.user?.name}님, 실력부터 짧게 진단해 볼게요</h1>
              <p className="recall-sub">{EXAM.name} 단원별 대표 문제 {total}개예요. 힌트 없이 풀고, 얼마나 확신했는지도 알려주세요</p>
              <div className="recall-list">
                {DIAGNOSIS_SET.map((qid, k) => {
                  const c = CONCEPTS[getQuestion(qid)!.concept];
                  return (
                    <div key={qid} className="recall-row">
                      <span className="recall-row-name">{k + 1}. {c.name}</span>
                      <span className="recall-row-src">{getMaterial(c.material)?.title}</span>
                    </div>
                  );
                })}
              </div>
              <div className="recall-cta">
                {/* skipping is a real choice here, so it gets a button (quieter than 시작하기) instead of a text link */}
                <div className="setup-cta-pair">
                  <button className="btn btn-lg btn-block" onClick={() => finish(false)}>건너뛰기</button>
                  <button className="btn btn-dark btn-lg btn-block" onClick={() => setStep("quiz")}>시작하기</button>
                </div>
              </div>
            </div>
          )}
          {step === "quiz" && <DiagnosisStep key={idx} qid={DIAGNOSIS_SET[idx]} last={idx + 1 === total} onDone={record} />}
          {step === "done" && <DiagnosisResult results={results} onStart={() => finish(true)} />}
        </div>
      </section>
    </main>
  );
}

/** One diagnosis question, drawn exactly like a 꺼내 보기 choice question. */
function DiagnosisStep({ qid, last, onDone }: { qid: string; last: boolean; onDone: (r: QuizResult, picked: number) => void }) {
  const q = getQuestion(qid)!;
  const [picked, setPicked] = useState<number | null>(null);
  const [conf, setConf] = useState<Confidence | null>(null);
  const letters = q.type === "OX" ? ["O", "X"] : ["A", "B", "C", "D"];
  const ready = picked !== null && conf !== null;
  const next = () => {
    if (picked === null || conf === null) return;
    const correct = picked === q.answer;
    onDone({ qid, correct, confidence: conf, tag: tagFor(correct, conf, q.options[picked]?.tag) }, picked);
  };

  return (
    <div className="recall-col">
      <span className="chip recall-from">{CONCEPTS[q.concept].name}</span>
      <p className="q-stem">{q.stem}</p>
      {q.code && <pre className="q-code mono">{q.code}</pre>}
      <div className="opts" role="radiogroup" aria-label="보기">
        {q.options.map((o, k) => (
          <button key={k} className={`opt ${picked === k ? "sel" : ""}`} role="radio" aria-checked={picked === k} onClick={() => setPicked(k)}>
            <span className="k">{letters[k]}</span>
            <span className={o.text.includes("SELECT") ? "mono" : ""} style={{ fontSize: o.text.includes("SELECT") ? 12.5 : undefined }}>{o.text}</span>
          </button>
        ))}
      </div>
      <ConfRow q="고른 답, 얼마나 확실해요?" off={picked === null} value={conf} onChange={setConf} />
      <div className="recall-cta">
        <button className={`btn btn-dark btn-block ${last ? "btn-lg" : "recall-next"}`} disabled={!ready} onClick={next}>{last ? "결과 보기" : "다음"}</button>
      </div>
    </div>
  );
}

function DiagnosisResult({ results, onStart }: { results: QuizResult[]; onStart: () => void }) {
  const correct = results.filter((r) => r.correct).length;
  const solid = results.filter((r) => r.correct && r.confidence === "sure").length;
  const shaky = correct - solid;
  // Shaky correct answers count for half: they are not yet reliable points.
  const expected = Math.round(((solid + shaky * 0.5) / results.length) * 100);
  const weak = results.filter((r) => !r.correct || r.confidence !== "sure").map((r) => CONCEPTS[getQuestion(r.qid)!.concept].name);
  const pass = expected >= EXAM.passLine;

  // one column like the other steps: .recall-body is a flex row, so loose children would sit side by side
  return (
    <div className="recall-col">
      <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "8px 0 20px" }}>
        <Mascot size={64} mood={pass ? "smile" : "think"} />
        <h1 style={{ margin: 0 }}>합격 예상 점수는 {expected}점이에요</h1>
      </div>
      <div className="card" style={{ background: "var(--color-bg)", border: 0 }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7 }}>
          {results.length}문제 중 <b>{correct}문제</b>를 맞혔고, 그중 <b>{shaky}문제</b>는 확신이 낮았어요.{" "}
          {weak.length === 0
            ? "모든 영역을 안정적으로 이해하고 있어요. 기출 위주로 실전 감각을 올려볼게요."
            : `개념 전체가 부족한 건 아니에요. ${joinWa([...new Set(weak)].slice(0, 2))}에서 점수를 잃고 있어요.`}
        </p>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head"><h3>진단 상세</h3><span className="subtle">확신도 포함</span></div>
        {results.map((r) => {
          const q = getQuestion(r.qid)!;
          return (
            <div className="list-row" key={r.qid}>
              <span className={`chip ${r.correct ? "chip-green" : "chip-red"}`}>{r.correct ? "정답" : "오답"}</span>
              <span className="grow">{CONCEPTS[q.concept].name}</span>
              {r.tag && <span className={`chip ${r.tag === "찍어서 맞힘" || r.tag === "낮은 확신" ? "chip-amber" : "chip-red"}`}>{r.tag}</span>}
            </div>
          );
        })}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-head"><h3>내일까지 이렇게 해봐요</h3></div>
        <p className="muted" style={{ margin: 0 }}>
          약한 개념이 있는 <b style={{ color: "var(--color-ink)" }}>GROUP BY와 HAVING</b> 자료부터 읽고, 구간마다 확인 문제를 풀어요. 틀리거나 확신이 낮았던 문제는 내일 복습 목록에 자동으로 들어가요.
        </p>
      </div>
      <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 24 }} onClick={onStart}>내 학습으로 가기</button>
    </div>
  );
}
