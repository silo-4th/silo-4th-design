import { Check, ChevronLeft, House, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mascot } from "../components/Brand";
import failArtUrl from "../assets/mascot-fail.webp";
import mascotUrl from "../assets/mascot.png";
import quizArtUrl from "../assets/mascot-quiz.webp";
import quizMouthOpenUrl from "../assets/mascot-quiz-mouth-open.webp";
import { Burst } from "../components/Burst";
import { QuizCard, type QuizCta, type QuizResult } from "../components/QuizCard";
import { CONCEPTS, MATERIALS, type Material, type Section } from "../data/materials";
import { getQuestion, type QuestionType } from "../data/questions";
import { STUDY_FOCUS } from "../data/studyFocus";
import { detectConcept } from "../lib/agent";
import { listDate } from "../lib/listDate";
import { useStore, useWeakConcepts, type Attempt } from "../store";
import { pickQuestion } from "./AgentChat";
import { ReviewTab } from "./SidePanels";

type Format = "대화형" | "객관식" | "빈칸" | "랜덤";

const SET_SIZE = 3;
/** Asking this many questions in chat is enough to build a set from the conversation. */
const ENOUGH_QUESTIONS = 2;

/** Mixed formats keep a set varied now that there is no format picker. */
const DEFAULT_FORMAT: Format = "랜덤";

const TYPES: Record<Exclude<Format, "랜덤">, QuestionType[]> = {
  대화형: ["대화형"],
  객관식: ["객관식", "OX"],
  빈칸: ["빈칸"],
};

/** Three questions (one of each format) spread across the chosen concepts, never repeating one. */
function buildSet(concepts: string[], format: Format, attempts: Attempt[], fallback: string[]) {
  const order = format === "랜덤" ? shuffle<Exclude<Format, "랜덤">>(["객관식", "빈칸", "대화형"]) : Array(SET_SIZE).fill(format);
  const picked: string[] = [];
  const pools = [concepts, fallback];
  for (let i = 0; i < SET_SIZE; i++) {
    const types = TYPES[order[i] as Exclude<Format, "랜덤">];
    let id: string | undefined;
    for (const pool of pools) {
      for (let k = 0; k < pool.length && !id; k++) {
        const concept = pool[(i + k) % pool.length];
        const q = pickQuestion(concept, attempts, types, picked);
        if (q && !picked.includes(q.id)) id = q.id;
      }
      if (id) break;
    }
    if (id) picked.push(id);
  }
  return picked;
}

function shuffle<T>(list: T[]) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Concepts this material's conversations actually touched, from questions asked and quizzes taken in chat. */
function useChatConcepts(material: Material) {
  const { state } = useStore();
  return useMemo(() => {
    const msgs = [...(state.chats[material.id] ?? []), ...state.history.filter((h) => h.materialId === material.id).flatMap((h) => h.messages)];
    const asked = msgs.filter((m) => m.role === "user");
    const found = new Set<string>();
    for (const m of asked) {
      const c = detectConcept(`${m.quote ?? ""} ${m.content}`);
      if (c && CONCEPTS[c]?.material === material.id) found.add(c);
    }
    for (const m of msgs) {
      const c = m.card ? getQuestion(m.card.qid)?.concept : undefined;
      if (c) found.add(c);
    }
    return { concepts: [...found], asked: asked.length };
  }, [state.chats, state.history, material.id]);
}

export function QuizTab({ material, section, preset }: { material: Material; section?: Section; preset?: string }) {
  const { state, dispatch } = useStore();
  const weak = useWeakConcepts();
  const chat = useChatConcepts(material);
  const chatReady = chat.asked >= ENOUGH_QUESTIONS && chat.concepts.length > 0;

  const own = material.sections.filter((s) => s.concept).map((s) => s.concept!);
  // AI picks lead with weak spots, then the section being read, then the rest of the unit.
  const aiConcepts = [...new Set([...weak.map((w) => w.concept).filter((c) => own.includes(c)), ...(section?.concept ? [section.concept] : []), ...own])];

  // No setup step: questions come from what the learner asked when there's enough of it, otherwise the unit's core.
  const pick = () => buildSet(chatReady ? chat.concepts : aiConcepts, DEFAULT_FORMAT, state.attempts, aiConcepts);
  // Coming back to the tab resumes the saved set; a question answered but not yet moved past counts as done.
  const saved = state.quiz[material.id];
  const resumeAt = saved ? Math.max(saved.i, saved.results.length) : 0;
  const [phase, setPhase] = useState<"quiz" | "done">(saved ? (resumeAt >= saved.set.length ? "done" : saved.phase) : "quiz");
  const [reviewing, setReviewing] = useState(!!preset);
  const [set, setSet] = useState<string[]>(() => saved?.set ?? pick());
  const [retry, setRetry] = useState(saved?.retry ?? false);
  const [i, setI] = useState(saved ? Math.min(resumeAt, saved.set.length - 1) : 0);
  const [results, setResults] = useState<QuizResult[]>(saved?.results ?? []);

  // 퀴즈 홈: shown the first time; after that, switching tabs and back keeps whatever screen was open
  // (home, a set in progress, or the result)
  const [home, setHome] = useState(() => (preset ? false : saved ? saved.home ?? !(saved.phase === "quiz" && resumeAt > 0 && resumeAt < saved.set.length) : true));
  useEffect(() => {
    dispatch({ type: "quiz", materialId: material.id, session: { set, i, results, retry, phase, home } });
  }, [set, i, results, retry, phase, home, material.id, dispatch]);
  const [answered, setAnswered] = useState(false);
  const [cta, setCta] = useState<QuizCta>(null);
  const [round, setRound] = useState(0);
  // 지난 문제 보기: the list of questions solved before (the page itself is still to be designed)
  const [history, setHistory] = useState(false);
  // 문제를 만들지 못했을 때 (5번). The prototype never fails: add ?quiz=fail to the address and the first
  // 'AI 맞춤 문제 풀기' shows the failure screen (다시 시도 then works).
  const [failOnce, setFailOnce] = useState(() => new URLSearchParams(window.location.search).get("quiz") === "fail");
  const [genFailed, setGenFailed] = useState(false);

  if (history) return <QuizHistory material={material} onBack={() => setHistory(false)} />;

  if (reviewing) {
    return (
      <>
        <div style={{ padding: "12px 16px 0", flex: "none" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setReviewing(false)}>
            <ChevronLeft size={14} />확인 문제로 돌아가기
          </button>
        </div>
        <ReviewTab key={preset ?? "list"} preset={preset} />
      </>
    );
  }

  const begin = (ids: string[], isRetry: boolean) => {
    setSet(ids);
    setRetry(isRetry);
    setI(0);
    setResults([]);
    setAnswered(false);
    setRound((r) => r + 1);
    setPhase("quiz");
  };

  const start = () => {
    if (failOnce) { setFailOnce(false); setGenFailed(true); return; }
    setGenFailed(false);
    begin(pick(), false);
    setHome(false);
  };

  if (genFailed) {
    return (
      <div className="panel-body" style={{ padding: 20 }}>
        <FailState title="문제를 만들지 못했어요" onRetry={start} />
      </div>
    );
  }

  if (home) {
    return (
      <div className="panel-body" style={{ padding: 20 }}>
        <div className="quiz-home">
          <QuizHomeArt />
          <h3>확인 문제</h3>
          {/* questions come from this material's conversation when there is enough of it, otherwise exam-style ones */}
          <p className="muted">
            {chatReady ? (
              <>AI가 내가 나눈 대화를 바탕으로<br />{SET_SIZE}문제를 출제해요.</>
            ) : (
              <>AI가 내 대화를 바탕으로 문제를 내요.<br />아직 나눈 대화가 없어서 기출 문제로 준비했어요.</>
            )}
          </p>
          <div className="quiz-home-cta">
            <button className="btn btn-dark btn-lg btn-block" onClick={start}>
              AI 맞춤 문제 풀기
            </button>
            <button className="btn btn-lg btn-block" onClick={() => setHistory(true)}>지난 문제 보기</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const ok = results.filter((r) => r.correct).length;
    const n = results.length;
    const wrong = n - ok;
    const shaky = results.filter((r) => r.correct && r.confidence !== "sure").length;
    // the title says the result itself (same wording as the 꺼내 보기 result)
    const title =
      wrong === n ? `${n}개 모두 틀렸어요`
      : wrong > 0 ? `${n}개 중 ${wrong}개를 틀렸어요`
      : shaky > 0 ? `${n}개 다 맞혔지만 ${shaky}개는 헷갈렸어요`
      : `${n}개 모두 맞혔어요`;
    const status = (r: QuizResult) =>
      !r.correct ? { label: "틀렸어요", cls: "chip-red" }
      : r.confidence !== "sure" ? { label: "맞았지만 헷갈렸어요", cls: "chip-amber" }
      : { label: "맞혔어요", cls: "chip-green" };
    return (
      <>
      {/* back to the quiz home, same icon-button style as the agent tab's toolbar */}
      <div className="panel-tools">
        <button className="tool-btn" aria-label="퀴즈 홈" title="퀴즈 홈" onClick={() => setHome(true)}>
          <House size={18} />
        </button>
      </div>
      <div className="panel-body" style={{ padding: "0 20px 20px" }}>
        <div className="quiz-done">
          <Burst><Mascot size={72} spin mood={ok === results.length ? "wow" : "smile"} /></Burst>
          <h3>{title}</h3>
          <p className="muted">{wrong + shaky === 0 ? "이 흐름 그대로 다음 단원으로 가도 좋아요." : "헷갈린 문제는 내일 같은 원리의 새 문제로 다시 나와요."}</p>
        </div>
        <div className="quiz-log">
          {results.map((r, k) => {
            const q = getQuestion(r.qid)!;
            return (
              // in question order: number + concept name, one status badge
              <div className="list-row quiz-log-row" key={`${r.qid}-${k}`}>
                <span className="grow">
                  <span className="quiz-log-name">{k + 1}. {CONCEPTS[q.concept].name}</span>
                  {/* what to study again, only for the ones that weren't solid */}
                  {(!r.correct || r.confidence !== "sure") && STUDY_FOCUS[q.id] && <span className="quiz-log-focus">{STUDY_FOCUS[q.id]}</span>}
                </span>
                <span className={`chip ${status(r).cls}`}>{status(r).label}</span>
              </div>
            );
          })}
        </div>
        <div className="quiz-actions">
          <button className="btn" onClick={() => setHistory(true)}>지난 문제 보기</button>
          <button className="btn btn-dark" onClick={() => begin(pick(), false)}>새 문제 풀기</button>
        </div>
      </div>
      </>
    );
  }

  const qid = set[i];
  const last = i === set.length - 1;

  const next = () => {
    setAnswered(false);
    if (last) setPhase("done");
    else setI(i + 1);
  };
  // One button right under the card: submit while answering, then next / results once graded.
  // Before there is anything to submit, show no button at all.
  const bar = answered ? { label: last ? "결과 보기" : "다음 문제", disabled: false, run: next } : cta;
  // the gauge moves on 다음 문제 (not on 정답 확인); only the last question fills its segment on 정답 확인
  const filled = answered && last ? set.length : i;

  return (
    <>
      <div className="panel-body" style={{ padding: 20 }}>
        {/* the gauge lives outside the card so it isn't remounted per question and keeps its slide */}
        <div className="quiz-gauge">
          {/* one segment per question, split by 3px gaps; answered ones turn green */}
          <div className="quiz-strip" role="progressbar" aria-label="문제 진행" aria-valuemin={0} aria-valuemax={set.length} aria-valuenow={filled}>
            {set.map((_, k) => <i key={k} className={k < filled ? "on" : ""} />)}
          </div>
          {/* 플러키 sits at the end of the last green segment (the layer is as wide as the bar) */}
          <span
            className="quiz-runner"
            style={{ transform: filled ? `translateX(calc(${filled / set.length} * (100% + 3px) - 3px))` : "none" }}
            aria-hidden
          >
            <img src={mascotUrl} alt="" draggable={false} />
          </span>
        </div>
        <QuizCard
          key={`${qid}-${round}-${i}`}
          className="quiz-card quiz-flat"
          qid={qid}
          source="check"
          onCta={setCta}
          num={Math.min(i + 1, set.length)}
          onAnswered={(r) => {
            setResults((rs) => [...rs, r]);
            // skipped: no answer to look at, so go straight to the next question
            if (r.skipped) next();
            else setAnswered(true);
          }}
        />
        {bar && (
          <div className="quiz-cta">
            <button className="btn btn-block btn-dark" disabled={bar.disabled} onClick={bar.run}>
              {bar.label}
            </button>
            {!answered && bar.skip && <button className="recall-later quiz-skip" onClick={bar.skip}>이 문제 건너뛰기</button>}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * 퀴즈 홈의 플러키: holds a test sheet on its left lobe (the pencil was taken out). Same idle bob and blink as the other
 * mascots; every few seconds one more box on the sheet gets checked.
 * Built on the current mascot.png (see _work/quiz_art.py); canvas is 448×320 mascot units.
 */
function QuizHomeArt() {
  // check marks for boxes 2–4, drawn in the sheet's own (rotated) coordinates
  const box = (k: number) => -16.4 + 13.12 * k;
  return (
    <span className="mascot quiz-art" aria-hidden>
      <span className="quiz-art-bob">
        <img src={quizArtUrl} alt="" width={139} height={99} draggable={false} />
        {/* mouth: on every other hop it softly opens into a happy smile, then eases back */}
        <img className="quiz-art-mouth open" src={quizMouthOpenUrl} alt="" width={139} height={99} draggable={false} />
        <svg className="quiz-art-checks" viewBox="0 0 448 320">
          <g transform="translate(66 170) rotate(-19.48)">
            {[1, 2, 3].map((k) => (
              <path key={k} className={`quiz-art-check c${k}`} pathLength={1} d={`M${-21.86 - 2.52} ${box(k)} l2.1 2.52 l4.2 -5.88`} />
            ))}
          </g>
        </svg>
        <i className="mascot-lid l" />
        <i className="mascot-lid r" />
      </span>
    </span>
  );
}

/** Past quiz rounds: this material's 확인 문제 attempts, grouped into rounds (answers less than 15 minutes apart, 5 at most). */
type Round = { at: number; items: Attempt[] };
function quizRounds(attempts: Attempt[], materialId: string): Round[] {
  const mine = attempts.filter((a) => a.source === "check" && CONCEPTS[a.concept]?.material === materialId).sort((a, b) => a.at - b.at);
  const rounds: Round[] = [];
  for (const a of mine) {
    const last = rounds[rounds.length - 1];
    const prev = last?.items[last.items.length - 1];
    if (last && prev && a.at - prev.at < 15 * 60 * 1000 && last.items.length < 5) last.items.push(a);
    else rounds.push({ at: a.at, items: [a] });
  }
  return rounds.reverse();                       // newest first
}

const statusOf = (a: { correct: boolean; confidence: string }) =>
  !a.correct ? { label: "틀렸어요", cls: "chip-red" }
  : a.confidence !== "sure" ? { label: "맞았지만 헷갈렸어요", cls: "chip-amber" }
  : { label: "맞혔어요", cls: "chip-green" };


/**
 * 지난 문제: first a list of past rounds (newest first); opening one shows every question of that round
 * stacked in one vertical scroll — question, 내 답 / 정답, and 해설 — like the result screen.
 */
/** 불러오기·만들기에 실패했을 때 (퀴즈 탭 5번, 지난 문제 7번): 플러키 holding up a round X sign, a calm title, one 다시 시도. */
function FailState({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <div className="quiz-home quiz-fail" role="alert">
      <span className="mascot quiz-fail-sign" aria-hidden><img src={failArtUrl} alt="" width={224} height={160} draggable={false} /></span>
      <h3>{title}</h3>
      <p className="muted">잠시 뒤 다시 시도해 주세요.</p>
      <div className="quiz-home-cta">
        <button className="btn btn-dark btn-lg btn-block" onClick={onRetry}>다시 시도</button>
      </div>
    </div>
  );
}

function QuizHistory({ material, onBack }: { material: Material; onBack: () => void }) {
  const { state } = useStore();
  const rounds = useMemo(() => quizRounds(state.attempts, material.id), [state.attempts, material.id]);
  const [open, setOpen] = useState<number | null>(null);
  const round = open === null ? null : rounds[open];
  // 목록을 불러오는 동안 뼈대 줄 (6번), 못 불러오면 실패 화면 (7번). The prototype has the list at once, so the skeleton
  // shows ~0.7s; add ?history=fail to the address to see the failure screen (다시 시도 then loads normally).
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(() => new URLSearchParams(window.location.search).get("history") === "fail");
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(t);
  }, [loading]);
  const retry = () => { setFailed(false); setLoading(true); };
  // opening a round (or going back to the list) always starts from the top, not where the list was scrolled to
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [open]);
  // lecture number, the same order as the 강의 목록
  const unitNo = MATERIALS.findIndex((m) => m.id === material.id) + 1;

  return (
    <>
      {/* sub-page bar: back button on the left, title centred (an empty slot on the right balances it) */}
      <div className="panel-tools quiz-history-bar">
        <button className="tool-btn" aria-label={round ? "지난 문제 목록" : "돌아가기"} title={round ? "지난 문제 목록" : "돌아가기"} onClick={() => (round ? setOpen(null) : onBack())}>
          <ChevronLeft size={20} />
        </button>
        <h3 className="quiz-history-title">{round ? `${unitNo}강 · ${material.title}` : "지난 문제"}</h3>
        <span className="tool-btn-slot" aria-hidden />
      </div>
      <div className="panel-body" ref={bodyRef} style={{ padding: "0 20px 20px" }}>
        {!round && loading && (
          <>
            <span className="sr-only" role="status">지난 문제를 불러오고 있어요</span>
            {/* the list's own rows in grey: title, the 틀림/헷갈림/맞힘 line, the date on the right */}
            <div className="quiz-history-list" aria-hidden>
              {[64, 52, 70, 58].map((w, k) => (
                <div key={k} className="quiz-history-row quiz-history-skel">
                  <span className="grow">
                    <i className="skel" style={{ width: `${w}%`, height: 14 }} />
                    <i className="skel" style={{ width: "38%", height: 11 }} />
                  </span>
                  <i className="skel" style={{ width: 38, height: 11 }} />
                </div>
              ))}
            </div>
          </>
        )}
        {!round && !loading && failed && (
          <FailState title="목록을 불러오지 못했어요" onRetry={retry} />
        )}
        {!round && !loading && !failed && (
          <>
            {rounds.length === 0 ? (
              <p className="muted quiz-history-empty">아직 푼 확인 문제가 없어요. 문제를 풀면 여기에 모여요.</p>
            ) : (
              <div className="quiz-history-list">
                {rounds.map((r, k) => {
                  const wrong = r.items.filter((a) => !a.correct).length;
                  const shaky = r.items.filter((a) => a.correct && a.confidence !== "sure").length;
                  const solid = r.items.length - wrong - shaky;
                  return (
                    <button key={r.at} className="quiz-history-row" onClick={() => setOpen(k)}>
                      {/* same layout as 대화 기록: title + meta on the left, time on the right */}
                      <span className="grow">
                        <span className="quiz-history-when">{unitNo}강 · {material.title}</span>
                        <span className="quiz-history-sum">
                          <span>틀림 {wrong}</span><span>헷갈림 {shaky}</span><span>맞힘 {solid}</span>
                        </span>
                      </span>
                      <span className="quiz-history-date">{listDate(r.at)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {round && (
          <>
            <div className="quiz-history-detail">
              {round.items.map((a, k) => {
                const q = getQuestion(a.qid);
                if (!q) return null;
                const st = statusOf(a);
                const choice = q.type === "객관식" || q.type === "OX";
                const right = choice ? q.options[q.answer]?.text : q.blank?.[0] ?? q.talk?.[0]?.label ?? "";
                const mine = choice && a.picked !== undefined ? q.options[a.picked]?.text : undefined;
                return (
                  <section key={a.id} className="quiz-history-q">
                    <div className="quiz-history-q-head">
                      <span className="chip recall-from">{CONCEPTS[q.concept].name}</span>
                      <span className={`chip ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="quiz-history-stem">{k + 1}. {q.stem}</p>
                    {q.code && <pre className="q-code mono">{q.code}</pre>}
                    {choice ? (
                      // choice questions show the options the way they looked once graded: 정답 green, 내 답 red if wrong
                      <div className="opts">
                        {q.options.map((op, j) => {
                          const isRight = j === q.answer;
                          const isMine = j === a.picked;
                          const cls = isRight ? "right" : isMine ? "wrong" : "dim";
                          const letters = q.type === "OX" ? ["O", "X"] : ["A", "B", "C", "D"];
                          return (
                            <div key={j} className={`opt ${cls} quiz-history-opt`}>
                              <span className="k">{isRight ? <Check size={12} /> : isMine ? <X size={12} /> : letters[j]}</span>
                              <span className={op.text.includes("SELECT") ? "mono" : ""} style={{ fontSize: op.text.includes("SELECT") ? 12.5 : undefined }}>{op.text}</span>
                              {(isMine || isRight) && <span className="quiz-history-mine">{isRight ? "정답" : "내 답"}</span>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={`recall-compare ${Math.max((mine ?? "").length, right.length) > 30 ? "stack" : ""}`}>
                        <div className="mine"><span>내 답</span><div className="recall-compare-text">{mine ?? (a.correct ? right : "—")}</div></div>
                        <div className="right"><span>정답</span><div className="recall-compare-text">{right}</div></div>
                      </div>
                    )}
                    <div className="recall-why">
                      <span>해설</span>
                      <div className="recall-compare-text">{q.explanation}</div>
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
