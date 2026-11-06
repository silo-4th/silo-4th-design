import { BookOpen, Check, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { CONCEPTS, getMaterial } from "../data/materials";
import { questionsFor, type Question } from "../data/questions";
import { Rich } from "../components/Rich";
import { todayKey, useStore, type Attempt, type ChatMsg, type Confidence } from "../store";
import { HOME } from "../App";
import cookieUrl from "../assets/mascot-cookie.webp";

/**
 * 꺼내 보기 — right after login, pull 3 things studied before back out of memory (retrieval practice).
 * Entry → 3 questions (choice / explain-in-my-words / choice, no feedback in between) → result that only
 * dwells on what came out different from what the learner thought they knew.
 */

const DAY = 86_400_000;

type Item = {
  concept: string;
  materialId: string;
  materialTitle: string;
  sectionId: string;
  sectionTitle: string;
  /** a line from the section to remind them what they read */
  summary: string;
  /** when they last touched it (attempt time), if known */
  at?: number;
  /** whether they asked the AI about this concept while reading (물어봄) or moved on without asking (넘어감) */
  asked: boolean;
  question: Question;
  /** easier fill-in-the-blank version for the explain question, offered when they get stuck */
  scaffold?: Question;
};

type Answer = {
  item: Item;
  qid: string;
  correct: boolean;
  confidence: Confidence;
  dontKnow: boolean;
  mine: string;
  /** the answer itself (option text, blank word, or an explanation's key point) */
  right: string;
  /** why it is the answer, shown under the comparison */
  why?: string;
};

/** Answer + explanation for a question, kept apart so the result can show them separately. */
function answerOf(q: Question): Pick<Answer, "right" | "why"> {
  if (q.blank) return { right: q.blank[0], why: q.explanation };
  // explain questions: the first key point is the answer; the reasoning lives in 해설
  if (q.talk?.length) return { right: q.talk[0].label, why: q.explanation };
  return { right: q.explanation };
}

function agoLabel(at?: number) {
  if (!at) return "최근 읽음";
  const d = Math.floor((Date.now() - at) / DAY);
  if (d <= 0) return "오늘";
  if (d === 1) return "어제";
  return `${d}일 전`;
}

const isChoice = (q: Question) => q.type === "객관식" || q.type === "OX";

/** Pick up to 3 concepts the learner studied most recently (attempts first, then sections they read). */
/** Did the learner ask the AI about this section? A question that names the concept, or quotes a sentence from the section. */
function askedAbout(messages: ChatMsg[], conceptName: string, sectionText: string) {
  const name = norm(conceptName);
  const body = norm(sectionText);
  return messages.some((m) => m.role === "user" && (norm(m.content).includes(name) || (!!m.quote && body.includes(norm(m.quote)))));
}

function pickItems(attempts: Attempt[], read: Record<string, string[]>, lastMaterial: string | undefined, chatsFor: (materialId: string) => ChatMsg[]): Item[] {
  const latest = new Map<string, number>();
  for (const a of attempts) latest.set(a.concept, Math.max(latest.get(a.concept) ?? 0, a.at));
  const order = [...latest.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);

  const readConcepts = Object.entries(read).flatMap(([mid, ids]) =>
    (getMaterial(mid)?.sections ?? []).filter((s) => s.concept && ids.includes(s.id)).map((s) => s.concept!)
  );
  // last-opened material first among the read ones
  readConcepts.sort((a, b) => Number(CONCEPTS[b]?.material === lastMaterial) - Number(CONCEPTS[a]?.material === lastMaterial));
  for (const c of readConcepts) if (!order.includes(c)) order.push(c);

  const kinds: ("choice" | "explain")[] = ["choice", "explain", "choice"];
  const items: Item[] = [];
  for (const concept of order) {
    if (items.length === 3) break;
    const meta = CONCEPTS[concept];
    const m = meta && getMaterial(meta.material);
    const s = m?.sections.find((x) => x.concept === concept);
    if (!m || !s) continue;
    const pool = questionsFor(concept);
    // prefer a question they haven't answered solidly yet
    const solid = new Set(attempts.filter((a) => a.correct && a.confidence === "sure").map((a) => a.qid));
    const fresh = (qs: Question[]) => qs.find((q) => !solid.has(q.id)) ?? qs[0];
    const want = kinds[items.length];
    const choice = fresh(pool.filter(isChoice));
    const talk = fresh(pool.filter((q) => q.type === "대화형"));
    const blank = fresh(pool.filter((q) => q.type === "빈칸"));
    const question = want === "explain" ? talk ?? blank ?? choice : choice ?? talk ?? blank;
    if (!question) continue;
    const callout = s.blocks.find((b) => b.kind === "callout");
    const firstP = s.blocks.find((b) => b.kind === "p");
    const raw = (callout && "text" in callout ? callout.text : firstP && "text" in firstP ? firstP.text : s.title).replace(/^자주 혼동 · /, "");
    // drop sentences that point at what follows in the text ("아래 순서로…"), they make no sense on their own
    const summary = (raw.match(/[^.!?]+[.!?]?/g) ?? [raw]).map((x) => x.trim()).filter((x) => x && !/아래|다음과|다음 표/.test(x)).join(" ") || raw;
    items.push({
      concept,
      materialId: m.id,
      materialTitle: m.title,
      sectionId: s.id,
      sectionTitle: s.title.replace(/^\d+\.\s*/, ""),
      summary,
      at: latest.get(concept),
      asked: askedAbout(
        chatsFor(m.id),
        meta.name,
        s.title + s.blocks.map((b) => ("text" in b ? b.text : "items" in b ? b.items.join(" ") : "")).join(" ")
      ),
      question,
      scaffold: question.type === "대화형" ? blank : undefined,
    });
  }
  // PROTOTYPE DEMO: show the design's mix (넘어감 + 물어봄) even when the saved chats have no real question yet.
  // Remove this once real chat history is enough to tell them apart.
  if (items.length > 1 && !items.some((it) => it.asked)) items[items.length - 1].asked = true;
  return items;
}

export function Recall() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  // freeze the set when the page opens so answering doesn't reshuffle it
  const [items] = useState(() =>
    pickItems(state.attempts, state.read, state.lastMaterial?.id, (mid) => [
      ...(state.chats[mid] ?? []),
      ...state.history.filter((h) => h.materialId === mid).flatMap((h) => h.messages),
    ])
  );
  const [step, setStep] = useState<"intro" | "quiz" | "done">("intro");
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  // once a day: done or put off today → straight to studying (?again=1 opens it anyway, handy for testing)
  const [params] = useSearchParams();
  const [doneToday] = useState(() => state.recallDay === todayKey() && !params.get("again"));
  if (!items.length || doneToday) return <Navigate to={HOME} replace />;

  const later = () => {
    dispatch({ type: "recallDay" });
    nav(HOME);
  };
  const record = (a: Answer, picked: number) => {
    dispatch({ type: "attempt", attempt: { qid: a.qid, correct: a.correct, confidence: a.confidence, hints: 0, source: "review" }, picked });
    const next = [...answers, a];
    setAnswers(next);
    if (i + 1 < items.length) setI(i + 1);
    else {
      setStep("done");
      dispatch({ type: "recallDay" });
    }
  };

  return (
    <main className="recall">
      <section className="recall-frame">
        {/* the result page has no top bar: the cookie reward opens it */}
        {step !== "done" && (
          <div className="recall-bar">
            <span className="recall-bar-title">꺼내 보기</span>
            {/* 나중에 할게요 now lives under the start button, so the intro keeps this side empty */}
            {step === "quiz" && <span className="recall-bar-count">{i + 1} / {items.length}</span>}
          </div>
        )}
        {step === "quiz" && (
          <div className="recall-steps" role="progressbar" aria-label="꺼내 보기 진행" aria-valuemin={1} aria-valuemax={items.length} aria-valuenow={i + 1}>
            {items.map((_, k) => <i key={k} className={k < i ? "on" : k === i ? "now" : ""} />)}
          </div>
        )}
        <div className="recall-body">
          {step === "intro" && <Intro items={items} onStart={() => setStep("quiz")} onLater={later} />}
          {step === "quiz" && (
            isChoice(items[i].question)
              ? <ChoiceStep key={i} item={items[i]} last={i + 1 === items.length} onDone={record} />
              : <ExplainStep key={i} item={items[i]} last={i + 1 === items.length} onDone={record} />
          )}
          {step === "done" && <Result answers={answers} />}
        </div>
      </section>
    </main>
  );
}

function introSub(items: Item[]) {
  const asked = items.filter((it) => it.asked).length;
  const skipped = items.length - asked;
  // leave out a part whose count is 0
  const parts = [skipped > 0 && `질문 없이 넘어간 ${skipped}개`, asked > 0 && `물어본 ${asked}개`].filter(Boolean);
  return `${parts.join(", ")}예요`;
}

function Intro({ items, onStart, onLater }: { items: Item[]; onStart: () => void; onLater: () => void }) {
  return (
    <div className="recall-col">
      <h1 className="recall-title">지난번에 공부한 것 중 {items.length}개를 꺼내 볼게요</h1>
      <p className="recall-sub">{introSub(items)}</p>
      <div className="recall-list">
        {[...items].sort((a, b) => Number(a.asked) - Number(b.asked)).map((it) => (
          <div key={it.concept} className="recall-row">
            <span className={`chip ${it.asked ? "chip-green" : "chip-red"}`}>{it.asked ? "물어봄" : "넘어감"}</span>
            <span className="recall-row-name">{CONCEPTS[it.concept].name}</span>
            <span className="recall-row-src">{it.materialTitle}</span>
          </div>
        ))}
      </div>
      <div className="recall-cta">
        <button className="btn btn-dark btn-lg btn-block" onClick={onStart}>시작하기</button>
        <button className="recall-later" onClick={onLater}>내일 꺼내 먹을래요</button>
      </div>
    </div>
  );
}

const CONF: { v: Confidence; label: string }[] = [
  { v: "sure", label: "확실해요" },
  { v: "unsure", label: "애매해요" },
  { v: "guess", label: "찍었어요" },
];

/** "고른 답, 얼마나 확실해요?" + 확실해요 / 애매해요 / 찍었어요 — the same row under every question. */
function ConfRow({ q, off, value, onChange }: { q: string; off: boolean; value: Confidence | null; onChange: (c: Confidence) => void }) {
  return (
    <div className={`recall-conf ${off ? "off" : ""}`}>
      <span className="recall-conf-q">{q}</span>
      {CONF.map((c) => (
        <button key={c.v} className={`recall-conf-chip ${value === c.v ? "on" : ""}`} disabled={off} aria-pressed={value === c.v} onClick={() => onChange(c.v)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

/** "[책] 오늘 읽은 · 단원" — the same source badge on top of every question. */
function SourceBadge({ item }: { item: Item }) {
  return (
    <span className="chip recall-from">
      <BookOpen size={13} aria-hidden />
      <span className="recall-from-when">{item.at ? `${agoLabel(item.at)} 읽은` : "최근 읽은"}</span>
      {item.sectionTitle}
    </span>
  );
}

function ChoiceStep({ item, last, onDone }: { item: Item; last: boolean; onDone: (a: Answer, picked: number) => void }) {
  const q = item.question;
  const [picked, setPicked] = useState<number | null>(null);
  const [conf, setConf] = useState<Confidence | null>(null);
  // not sure at all → pick one and answer "찍었어요"
  const ready = picked !== null && conf !== null;
  const letters = q.type === "OX" ? ["O", "X"] : ["A", "B", "C", "D"];

  const next = () => {
    if (picked === null || conf === null) return;
    onDone(
      {
        item,
        qid: q.id,
        correct: picked === q.answer,
        confidence: conf,
        dontKnow: false,
        mine: q.options[picked].text,
        right: q.options[q.answer].text,
        why: q.explanation,
      },
      picked
    );
  };

  return (
    <div className="recall-col">
      <SourceBadge item={item} />
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

      {/* every step ends with the same full-width CTA as 시작하기, so the next action is always in one place */}
      <div className="recall-cta">
        <button className={`btn btn-dark btn-block ${last ? "btn-lg" : "recall-next"}`} disabled={!ready} onClick={next}>{last ? "결과 보기" : "다음"}</button>
      </div>
    </div>
  );
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

function ExplainStep({ item, last, onDone }: { item: Item; last: boolean; onDone: (a: Answer, picked: number) => void }) {
  const main = item.question;
  const talk = main.type === "대화형";
  const [text, setText] = useState("");
  // explain questions are written; other kinds are asked as a fill-in-the-blank
  const scaffold = !talk;
  const blankQ = talk ? item.scaffold : main;
  const [blank, setBlank] = useState("");
  const [conf, setConf] = useState<Confidence | null>(null);

  const submit = () => {
    if (conf === null) return;
    if (!scaffold) {
      const pts = main.talk ?? [];
      const hit = pts.filter((p) => p.keywords.some((k) => norm(text).includes(norm(k)))).length;
      const correct = pts.length === 0 ? text.trim().length > 20 : hit >= Math.ceil(pts.length / 2);
      onDone({ item, qid: main.id, correct, confidence: conf, dontKnow: false, mine: text.trim(), ...answerOf(main) }, -1);
      return;
    }
    if (!blankQ) return;
    const correct = !!blankQ.blank?.some((a) => norm(blank).includes(norm(a)));
    onDone(
      { item, qid: blankQ.id, correct, confidence: conf, dontKnow: false, mine: blank.trim(), ...answerOf(blankQ) },
      -1
    );
  };

  // "이 문제 건너뛰기" moves on to the next question; it is recorded as not remembered
  const giveUp = () => {
    const q = scaffold && blankQ ? blankQ : main;
    onDone({ item, qid: q.id, correct: false, confidence: "guess", dontKnow: true, mine: "건너뛰었어요", ...answerOf(q) }, -1);
  };

  const written = scaffold ? !!blank.trim() : !!text.trim();
  // same rule as the choice questions: answer first, then say how sure you are
  const ready = written && conf !== null;

  return (
    <div className="recall-col">
      <SourceBadge item={item} />

      {!scaffold ? (
        <>
          <p className="q-stem">{main.stem}</p>
          <textarea
            className="input q-write"
            rows={5}
            placeholder="핵심 개념을 넣어 내 말로 설명해 보세요"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </>
      ) : (
        blankQ && (
          <>
            <p className="q-stem">{talk ? "그럼 핵심만 채워 볼까요?" : "빈칸에 들어갈 말을 떠올려 보세요"}</p>
            <div className="recall-scaffold">
              <p className="recall-scaffold-stem">
                {blankQ.stem.split("____").map((part, k, arr) => (
                  <span key={k}>{part}{k < arr.length - 1 && <span className="q-blank" aria-label="빈칸">&nbsp;</span>}</span>
                ))}
              </p>
              <input
                className="input"
                placeholder="빈칸에 들어갈 말"
                value={blank}
                autoFocus
                onChange={(e) => setBlank(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && ready && submit()}
              />
            </div>
          </>
        )
      )}

      <ConfRow q="쓴 답, 얼마나 확실해요?" off={!written} value={conf} onChange={setConf} />

      <div className="recall-cta">
        <button className={`btn btn-dark btn-block ${last ? "btn-lg" : "recall-next"}`} disabled={!ready} onClick={submit}>{last ? "결과 보기" : "다음"}</button>
        <button className="recall-later" onClick={giveUp}>이 문제 건너뛰기</button>
      </div>
    </div>
  );
}

function status(a: Answer): { label: string; cls: string; solid: boolean } {
  if (a.dontKnow) return { label: "틀렸어요", cls: "chip-red", solid: false };
  if (!a.correct) return { label: "틀렸어요", cls: "chip-red", solid: false };
  if (a.confidence !== "sure") return { label: "맞았지만 헷갈렸어요", cls: "chip-amber", solid: false };
  return { label: "맞혔어요", cls: "chip-green", solid: true };
}

function Result({ answers }: { answers: Answer[] }) {
  const nav = useNavigate();
  const shaky = useMemo(() => answers.filter((a) => !status(a).solid), [answers]);
  const goto = (a: Answer) => `/learn/${a.item.materialId}?section=${a.item.sectionId}`;
  const differ = answers.filter((a) => !a.correct).length;
  const n = answers.length;
  const title =
    differ > 0 ? `${n}개 중 ${differ}개를 틀렸어요`
    : shaky.length > 0 ? `${n}개 다 맞혔지만 ${shaky.length}개는 헷갈렸어요`
    : `${n}개 모두 맞혔어요`;

  return (
    <div className="recall-col">
      {/* reward: finishing all three questions gives 플러키 a cookie */}
      <div className="recall-reward">
        <p className="recall-reward-msg"><span aria-hidden>🍪</span>플러키에게 쿠키를 전달했어요!</p>
        <div className="recall-cookie" aria-hidden>
          <div className="recall-cookie-float">
            <img src={cookieUrl} alt="" width={132} height={138} draggable={false} />
          </div>
        </div>
      </div>
      <h1 className="recall-title">{title}</h1>
      <p className="recall-sub">
        {shaky.length === 0 ? "오늘은 새로운 내용으로 넘어가도 좋아요." : "잘 기억한 건 넘어가고, 다른 건 다시 볼 곳을 알려줄게요."}
      </p>
      <div className="recall-list">
        {answers.map((a, i) => {
          const st = status(a);
          return (
            <div key={a.item.concept} className={`recall-res ${st.solid ? "solid" : ""}`}>
              <div className="recall-res-head">
                <b>{i + 1}. {CONCEPTS[a.item.concept].name}</b>
                <span className={`chip ${st.cls}`}>{st.solid && <Check size={12} />}{st.label}</span>
                {!st.solid && (
                  <Link className="recall-goto" to={goto(a)}>
                    공부하러 가기 <ChevronRight size={14} />
                  </Link>
                )}
              </div>
              {/* every result shows the explanation; wrong ones also compare my answer with the right one */}
              {(
                <>
                  {a.correct ? (
                    a.why ? (
                      <div className="recall-why">
                        <span>해설</span>
                        <div className="recall-compare-text"><Rich text={a.why} /></div>
                      </div>
                    ) : null
                  ) : (
                  <>
                    {/* long answers (a sentence or a query) stack top-to-bottom so they get the full width */}
                    <div className={`recall-compare ${Math.max(a.mine.length, a.right.length) > 30 ? "stack" : ""}`}>
                      <div className="mine"><span>내 답</span><div className="recall-compare-text">{a.mine || "—"}</div></div>
                      <div className="right">
                        <span>정답</span>
                        <div className="recall-compare-text"><Rich text={a.right} /></div>
                      </div>
                    </div>
                    {a.why && (
                      <div className="recall-why">
                        <span>해설</span>
                        <div className="recall-compare-text"><Rich text={a.why} /></div>
                      </div>
                    )}
                  </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="recall-cta">
        <button className="btn btn-dark btn-lg btn-block" onClick={() => nav(HOME)}>오늘 공부 시작하기</button>
        <p className="subtle recall-foot">헷갈린 개념은 복습 일정에 넣어 두었어요. 며칠 뒤 같은 원리의 새 문제로 다시 나와요.</p>
      </div>
    </div>
  );
}
