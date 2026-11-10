import { ArrowUp, BookmarkPlus, CheckCircle2, HelpCircle, Lightbulb, ListChecks, RefreshCw, RotateCw, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Mascot } from "../components/Brand";
import { ChatSkeleton } from "../components/ChatSkeleton";
import { FailState } from "../components/FailState";
import { Icon3D } from "../components/Icon3D";
import { QuizCard, tagChipClass, type QuizResult } from "../components/QuizCard";
import { Rich } from "../components/Rich";
import { useToast } from "../components/Toast";
import { CONCEPTS, type Material, type Section } from "../data/materials";
import { getQuestion, questionsFor, variantOf, type QuestionType } from "../data/questions";
import { askAgent } from "../lib/agent";
import { useStore, useWeakConcepts, type Attempt, type ChatMsg } from "../store";

export type Command = { n: number } & ({ kind: "ask"; prompt: string; quote?: string } | { kind: "quiz"; concept: string; qid?: string });

/** Chooses the next check question: easier after repeated misses, otherwise one not yet solved with confidence. */
/** Best next question on a concept: unseen or shaky first, easier ones when the learner is struggling. */
export function pickQuestion(concept: string, attempts: Attempt[], types: QuestionType[] = ["객관식", "OX"], exclude: string[] = []) {
  const typed = questionsFor(concept).filter((q) => types.includes(q.type));
  const fresh = typed.filter((q) => !exclude.includes(q.id));
  const pool = fresh.length ? fresh : typed;
  const mine = attempts.filter((a) => a.concept === concept);
  const solid = new Set(mine.filter((a) => a.correct && a.confidence === "sure").map((a) => a.qid));
  const lastTwo = mine.slice(-2);
  const struggling = lastTwo.length === 2 && lastTwo.every((a) => !a.correct);
  const open = pool.filter((q) => !solid.has(q.id));
  const list = (open.length ? open : pool).slice().sort((a, b) => {
    const seenA = mine.filter((x) => x.qid === a.id).length;
    const seenB = mine.filter((x) => x.qid === b.id).length;
    if (struggling) return a.level - b.level || seenA - seenB;
    return seenA - seenB || a.level - b.level;
  });
  return list[0];
}

/** Quick actions on the empty chat: the title is sent as the question. */
const QUICK = [
  { title: "이 페이지 핵심만 알려줘", desc: "지금 구간을 3줄로", icon: "summary" as const },
  { title: "예시로 설명해줘", desc: "SQL 예제와 실행 결과로", icon: "example" as const },
  { title: "내가 이해했는지 확인해줘", desc: "내 말로 답해 보기", icon: "check" as const },
  { title: "헷갈리는 개념 비교해줘", desc: "WHERE와 HAVING처럼", icon: "compare" as const },
];


export function AgentChat({ material, section, command, onRelated }: { material: Material; section?: Section; command: Command | null; onRelated?: (concept: string) => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const weak = useWeakConcepts();
  const msgs = state.chats[material.id] ?? [];
  // 지난 대화를 불러오는 동안 말풍선 모양 뼈대 (새로 필요 1번). In the prototype a unit always opens on a fresh chat and
  // past ones come back from 대화 기록, so the skeleton shows when a saved conversation is opened there (the list jumps
  // from empty to several messages at once), ~0.7s. ?chat=loading keeps it on screen for review.
  const keepLoading = new URLSearchParams(window.location.search).get("chat") === "loading";
  const [loadingChat, setLoadingChat] = useState(keepLoading);
  const prevCount = useRef(msgs.length);
  useEffect(() => {
    const before = prevCount.current;
    prevCount.current = msgs.length;
    if (before === 0 && msgs.length > 1) setLoadingChat(true);
  }, [msgs.length]);
  // 지난 대화를 불러오지 못했을 때 (새로 필요 2번): ?chat=fail makes the next opened conversation fail once.
  // The composer stays usable, so a new question can still be asked.
  const [failOnce, setFailOnce] = useState(() => new URLSearchParams(window.location.search).get("chat") === "fail");
  const [chatFailed, setChatFailed] = useState(false);
  useEffect(() => {
    if (!loadingChat || keepLoading) return;
    const t = window.setTimeout(() => {
      setLoadingChat(false);
      if (failOnce) { setFailOnce(false); setChatFailed(true); }
    }, 700);
    return () => window.clearTimeout(t);
  }, [loadingChat, keepLoading, failOnce]);
  const [input, setInput] = useState("");
  const [quote, setQuote] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  // 첫 글자가 5초 넘게 안 오면 말풍선 아래에 "조금 오래 걸리고 있어요"를 붙여요
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    setSlow(false);
    if (!busy) return;
    const t = window.setTimeout(() => setSlow(true), 5000);
    return () => window.clearTimeout(t);
  }, [busy]);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const msgsRef = useRef(msgs);
  const lastConcept = useRef<string | undefined>(section?.concept);
  msgsRef.current = msgs;

  const setMsgs = (next: ChatMsg[]) => {
    msgsRef.current = next;
    dispatch({ type: "chat", materialId: material.id, messages: next });
  };
  const push = (...m: ChatMsg[]) => setMsgs([...msgsRef.current, ...m]);

  useEffect(() => {
    const el = scroller.current;
    if (el) requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }));
  }, [msgs.length, busy]);
  // the skeleton and the failure screen read from the top (not scrolled down like a conversation)
  useEffect(() => {
    if (loadingChat || chatFailed) requestAnimationFrame(() => scroller.current?.scrollTo({ top: 0 }));
  }, [loadingChat, chatFailed]);

  // 답을 받지 못했을 때 (다듬기 1번): the AI bubble turns pale pink with a red line and 다시 시도, which re-asks the same
  // question without adding it again. The prototype's agent never fails: ?agent=fail makes the next answer fail once.
  // 답이 오다가 끊겼을 때 (다듬기 2번): the part that arrived stays in a normal bubble (ending in …) and the same pink bubble
  // follows, saying it stopped; 다시 시도 drops the partial answer and asks again. ?agent=cut makes the next answer stop halfway.
  const [answerFailed, setAnswerFailed] = useState<{ kind: "fail" | "cut"; prompt: string; quote?: string; history: { role: ChatMsg["role"]; content: string }[] } | null>(null);
  const demo = new URLSearchParams(window.location.search).get("agent");
  const failNext = useRef(demo === "fail");
  const cutNext = useRef(demo === "cut");
  // a fresh chat (새 대화, another unit) drops a failed answer from the old one
  useEffect(() => { if (msgs.length === 0) setAnswerFailed(null); }, [msgs.length]);
  const fetchAnswer = async (prompt: string, q: string | undefined, history: { role: ChatMsg["role"]; content: string }[]) => {
    setAnswerFailed(null);
    setBusy(true);
    try {
      if (failNext.current) { failNext.current = false; throw new Error("demo failure"); }
      const full = q ? `다음 문장에 대해: "${q}"\n${prompt}` : prompt;
      const r = await askAgent({ material, section, prompt: full, history, weak: weak.map((w) => w.name), tone: state.tone });
      if (cutNext.current) {
        cutNext.current = false;
        push({ role: "assistant", content: `${r.text.slice(0, Math.max(40, Math.floor(r.text.length * 0.45))).trimEnd()}…` });
        setAnswerFailed({ kind: "cut", prompt, quote: q, history });
        return;
      }
      push({ role: "assistant", content: r.text });
      if (r.concept) lastConcept.current = r.concept;
    } catch {
      setAnswerFailed({ kind: "fail", prompt, quote: q, history });
    } finally {
      setBusy(false);
    }
  };
  const ask = async (prompt: string, q?: string) => {
    if (!prompt.trim() || busy) return;
    const history = msgsRef.current.filter((m) => !m.card).map((m) => ({ role: m.role, content: m.content }));
    push({ role: "user", content: prompt, quote: q });
    setInput("");
    if (field.current) field.current.style.height = "";
    setQuote(undefined);
    setChatFailed(false);
    await fetchAnswer(prompt, q, history);
  };
  const quiz = (concept: string, qid?: string, intro?: string) => {
    const q = qid ? getQuestion(qid)! : pickQuestion(concept, state.attempts);
    if (!q) return;
    push({ role: "assistant", content: intro ?? `**${CONCEPTS[concept].name}** 확인 문제예요. 먼저 혼자 풀어보고, 막히면 힌트를 받아요.`, card: { kind: "quiz", qid: q.id } });
  };

  const onAnswered = (index: number, r: QuizResult) => {
    const q = getQuestion(r.qid)!;
    const next = msgsRef.current.map((m, i) => (i === index && m.card ? { ...m, card: { ...m.card, result: { correct: r.correct, tag: r.tag } } } : m));
    const follow = r.correct
      ? r.confidence === "sure"
        ? `좋아요! **${CONCEPTS[q.concept].name}**을 스스로 풀 수 있다는 기록이 남았어요.`
        : `맞혔지만 **${r.tag}**으로 기록했어요. 내일 같은 원리의 다른 문제로 한 번 더 확인할게요.`
      : `이번 실수는 **${r.tag}**이에요.${r.why ? ` ${r.why}` : ""}\n관련 취약점: **${CONCEPTS[q.concept].name}** · 내일 복습 목록에 넣어뒀어요.`;
    setMsgs([...next, { role: "assistant", content: follow }]);
  };

  // Commands from the reader (text selection, check buttons) arrive here.
  const handled = useRef(0);
  useEffect(() => {
    if (!command || handled.current === command.n) return;
    handled.current = command.n;
    if (command.kind === "ask") ask(command.prompt, command.quote);
    else quiz(command.concept, command.qid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command?.n]);

  const concept = lastConcept.current ?? section?.concept ?? weak[0]?.concept ?? "where_having";

  return (
    <>
      <div className="panel-body" ref={scroller}>
        <div className="chat">
          {loadingChat && (
            <>
              <span className="sr-only" role="status">지난 대화를 불러오고 있어요</span>
              <ChatSkeleton />
            </>
          )}
          {chatFailed && <FailState title="지난 대화를 불러오지 못했어요" onRetry={() => { setChatFailed(false); setLoadingChat(true); }} />}
          {!loadingChat && !chatFailed && msgs.length === 0 && (
            <div className="welcome">
              <Mascot size={112} live />
              <p className="welcome-hi">{state.user ? `${state.user.name}님, ` : "반가워요! "}저와 함께 쉽게 공부해요!</p>
              <h3 className="welcome-title">오늘은 무엇부터 해볼까요?</h3>
              <div className="quick-grid">
                {QUICK.map(({ title, desc, icon }) => (
                  <button key={title} className="quick-card" onClick={() => ask(title)}>
                    <span className="quick-ico"><Icon3D kind={icon} size={32} /></span>
                    <span className="quick-title">{title}</span>
                    <span className="quick-desc">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loadingChat && !chatFailed && msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="msg user">
                {m.quote && <span className="quote">{m.quote}</span>}
                {m.content}
              </div>
            ) : (
              <div key={i} className="msg bot">
                <div style={{ flex: "none", marginTop: 2 }}><Mascot size={26} /></div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="bubble"><Rich text={m.content} /></div>
                  {m.card?.kind === "quiz" &&
                    (m.card.result ? (
                      <div className="quiz-card" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle2 size={16} color={m.card.result.correct ? "var(--color-green)" : "var(--color-red)"} />
                        <span className="grow ellipsis" style={{ flex: 1, fontSize: 13 }}>{getQuestion(m.card.qid)!.stem}</span>
                        <span className={`chip ${tagChipClass(m.card.result.tag)}`}>{m.card.result.tag ?? "정답"}</span>
                      </div>
                    ) : (
                      <QuizCard
                        className="quiz-card"
                        qid={m.card.qid}
                        source="check"
                        onAnswered={(r) => onAnswered(i, r)}
                      />
                    ))}
                  {i === msgs.length - 1 && !busy && !answerFailed && (
                    <FollowUps
                      msg={m}
                      prev={msgs[i - 1]}
                      concept={concept}
                      onAsk={ask}
                      onQuiz={quiz}
                      onRelated={onRelated}
                      onNote={(t) => {
                        dispatch({ type: "note", note: { materialId: material.id, sectionId: section?.id ?? "intro", text: t.replace(/\*\*/g, "").slice(0, 300) } });
                        toast("노트에 저장했어요");
                      }}
                    />
                  )}
                </div>
              </div>
            ),
          )}
          {answerFailed && !busy && (
            <div className={`msg bot ${answerFailed.kind === "cut" ? "msg-follow" : ""}`}>
              {/* a cut answer continues the bubble above, so no second 플러키 — just the same indent */}
              <div style={{ flex: "none", marginTop: 2, width: 26 }}>{answerFailed.kind === "fail" && <Mascot size={26} mood="plain" />}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="bubble bubble-error" role="alert">
                  <span className="bubble-error-msg">{answerFailed.kind === "cut" ? "답이 중간에 끊겼어요." : "답을 가져오지 못했어요."}</span>
                  <button
                    className="bubble-retry"
                    onClick={() => {
                      // a cut answer is dropped and asked again from the start
                      if (answerFailed.kind === "cut") setMsgs(msgsRef.current.slice(0, -1));
                      fetchAnswer(answerFailed.prompt, answerFailed.quote, answerFailed.history);
                    }}
                  >
                    <RotateCw size={13} />다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}
          {busy && (
            <div className="msg bot">
              <Mascot size={26} mood="think" />
              <div className="wait-stack" role="status">
                <div className="bubble"><span className="typing" aria-label="답을 준비하고 있어요"><i /><i /><i /></span></div>
                {slow && <span className="wait-note wait-note--below">조금 오래 걸리고 있어요</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="composer">
        {quote && (
          <div className="ctx">
            <span className="chip quote-chip">
              <span className="ellipsis">“{quote}”</span>
              <button aria-label="인용 제거" onClick={() => setQuote(undefined)}><X size={11} /></button>
            </span>
          </div>
        )}
        <textarea
          ref={field}
          value={input}
          maxLength={1000}
          disabled={loadingChat}
          placeholder={quote ? "이 문장에 대해 물어보세요" : "궁금한 건 무엇이든 물어보세요"}
          onChange={(e) => {
            setInput(e.target.value);
            // Grow with the text up to the CSS max, then scroll inside.
            const el = e.target;
            el.style.height = "";
            el.style.height = `${Math.min(el.scrollHeight, 136)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              ask(input, quote);
            }
          }}
        />
        <div className="bar2">
          <button className="send" aria-label="보내기" disabled={!input.trim() || busy} onClick={() => ask(input, quote)}><ArrowUp size={16} /></button>
        </div>
      </div>
      <div className="disclaimer">AI는 실수할 수 있어요. 나눈 대화는 내게 맞는 퀴즈를 만드는 데 활용돼요.</div>
    </>
  );
}

function FollowUps({
  msg,
  prev,
  concept,
  onAsk,
  onQuiz,
  onNote,
  onRelated,
}: {
  msg: ChatMsg;
  prev?: ChatMsg;
  concept: string;
  onAsk: (p: string) => void;
  onQuiz: (concept: string, qid?: string, intro?: string) => void;
  onNote: (t: string) => void;
  onRelated?: (concept: string) => void;
}) {
  if (msg.card) return null;
  // Right after a graded quiz: re-explain, a variant on the same principle, or save to the wrong-answer note.
  const done = prev?.card?.result ? prev.card : undefined;
  if (done) {
    const q = getQuestion(done.qid)!;
    const v = variantOf(q);
    return (
      <div className="bot-actions">
        {!done.result!.correct && <button onClick={() => onAsk(`${CONCEPTS[q.concept].name}를 다시 쉽게 설명해줘`)}><RefreshCw size={12} />다시 설명</button>}
        {v && (
          <button className={done.result!.correct ? "" : "primary"} onClick={() => onQuiz(v.concept, v.id, "같은 원리를 쓰는 **새 문제**예요. 외운 답이 아니라 이해했는지 확인해요.")}>
            <HelpCircle size={12} />변형 문제 풀기
          </button>
        )}
        {!done.result!.correct && <button onClick={() => onNote(`[오답] ${q.stem} → ${q.explanation}`)}><BookmarkPlus size={12} />오답노트 저장</button>}
      </div>
    );
  }
  return <ExplainActions concept={concept} text={msg.content} onAsk={onAsk} onQuiz={onQuiz} onNote={onNote} onRelated={onRelated} />;
}

/** Actions shown under a plain explanation: move the learner from reading to self-checking. */
export function ExplainActions({ concept, onAsk, onQuiz, onNote, onRelated, text }: { concept: string; text: string; onAsk: (p: string) => void; onQuiz: (c: string) => void; onNote: (t: string) => void; onRelated?: (concept: string) => void }) {
  return (
    <div className="bot-actions">
      <button onClick={() => onAsk("더 쉽게 설명해줘")}><Sparkles size={12} />더 쉽게</button>
      <button onClick={() => onAsk("예시로 보여줘")}><Lightbulb size={12} />예시 보기</button>
      <button onClick={() => onNote(text)}><BookmarkPlus size={12} />노트 저장</button>
      {/* 관련 문제 풀어보기 (실제 서비스와 같은 흐름): opens the quiz tab and makes one question on this answer's concept */}
      {onRelated && <button onClick={() => onRelated(concept)}><ListChecks size={12} />관련 문제 풀어보기</button>}
    </div>
  );
}
