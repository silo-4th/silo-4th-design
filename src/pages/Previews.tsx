import { useEffect, useState } from "react";
import { ArrowUp, ChevronLeft, ListChecks, LoaderCircle, RotateCw, X } from "lucide-react";
import { Mascot } from "../components/Brand";
import failArtUrl from "../assets/mascot-fail.webp";
import { ChatSkeleton } from "../components/ChatSkeleton";
import { FailState } from "../components/FailState";
import { HistoryEmpty } from "../components/HistoryEmpty";
import { GradeFail } from "../components/GradeFail";
import { LoadingCloud, LoadingState } from "../components/LoadingState";
import { getQuestion } from "../data/questions";
import { CONCEPTS } from "../data/materials";

/**
 * 시안 검토용 pages (not linked anywhere). /preview/agent-wait: 에이전트 답을 기다리는 동안 — A and B side by side,
 * looping 9s (the first 5s with dots only, then the "still waiting" state).
 */
export function AgentWaitPreview() {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setSec((s) => (s + 1) % 9), 1000);
    return () => window.clearInterval(t);
  }, []);
  const late = sec >= 5;
  return (
    <main className="recall">
      <div className="pv-row">
        {(["A", "B"] as const).map((v) => (
          <section key={v} className="pv-panel">
            <div className="pv-label">
              <b>{v}안</b>
              <span>{v === "A" ? "말풍선 하나로 통일" : "말풍선 그대로 + 아래 안내"}</span>
              <span className="pv-sec">{sec + 1}초</span>
            </div>
            <div className="chat pv-chat">
              <div className="msg user">WHERE와 HAVING은 언제 각각 써?</div>
              <div className="msg bot">
                <Mascot size={26} mood="think" />
                {v === "A" ? (
                  <div className="bubble">
                    <span className="typing"><i /><i /><i /></span>
                    {late && <span className="wait-note">답을 기다리는 중이에요</span>}
                  </div>
                ) : (
                  <div className="wait-stack">
                    <div className="bubble"><span className="typing"><i /><i /><i /></span></div>
                    {late && <span className="wait-note wait-note--below">조금 오래 걸리고 있어요</span>}
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

/** /preview/quiz-fail: 퀴즈 탭에서 문제를 만들지 못했을 때 (A안) — same place and size as the quiz home, calm 플러키. */
export function QuizFailPreview() {
  return (
    <main className="recall">
      <div className="pv-row">
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>5번</b><span>문제를 만들지 못함</span></div>
          <div className="panel-body pv-panel-body" style={{ padding: 20 }}>
            <div className="quiz-home" role="alert">
              {/* 플러키 holding up a round X sign (same canvas as the quiz-home art) */}
              <span className="mascot quiz-fail-sign" aria-hidden><img src={failArtUrl} alt="" width={224} height={160} draggable={false} /></span>
              <h3>문제를 만들지 못했어요</h3>
              <p className="muted">잠시 뒤 다시 시도해 주세요.</p>
              <div className="quiz-home-cta">
                <button className="btn btn-dark btn-lg btn-block">다시 시도</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/** /preview/quiz-history-states: 지난 문제 목록 — 6번 불러오는 중 (skeleton rows) and 7번 불러오지 못함, side by side. */
export function QuizHistoryStatesPreview() {
  const bar = (
    <div className="panel-tools quiz-history-bar">
      <button className="tool-btn" aria-label="돌아가기"><ChevronLeft size={20} /></button>
      <h3 className="quiz-history-title">지난 문제</h3>
      <span className="tool-btn-slot" aria-hidden />
    </div>
  );
  return (
    <main className="recall">
      <div className="pv-row">
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>6번</b><span>목록을 불러오는 중</span></div>
          {bar}
          <div className="panel-body pv-panel-body" style={{ padding: "0 20px 20px" }}>
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
          </div>
        </section>
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>7번</b><span>목록을 불러오지 못함</span></div>
          {bar}
          <div className="panel-body pv-panel-body" style={{ padding: 20 }}>
            <div className="quiz-home" role="alert">
              <span className="mascot quiz-fail-sign" aria-hidden><img src={failArtUrl} alt="" width={224} height={160} draggable={false} /></span>
              <h3>목록을 불러오지 못했어요</h3>
              <p className="muted">잠시 뒤 다시 시도해 주세요.</p>
              <div className="quiz-home-cta">
                <button className="btn btn-dark btn-lg btn-block">다시 시도</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/** /preview/agent-loading: 에이전트 탭에서 지난 대화를 불러오는 중 — message-shaped grey bars, composer stays. */
export function AgentLoadingPreview() {
  return (
    <main className="recall">
      <div className="pv-row">
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>새로 필요 1번</b><span>지난 대화를 불러오는 중</span></div>
          <div className="pv-panel-body" style={{ minHeight: 0 }}>
            <div className="chat chat-skel" style={{ flex: 1 }}>
              <span className="sr-only" role="status">지난 대화를 불러오고 있어요</span>
              <ChatSkeleton />
            </div>
            <div className="composer">
              <textarea placeholder="궁금한 건 무엇이든 물어보세요" disabled />
              <div className="bar2"><button className="send" aria-label="보내기" disabled><ArrowUp size={16} /></button></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


/** /preview/agent-fail: 에이전트 탭에서 지난 대화를 불러오지 못했을 때 — same failure screen; the composer stays usable. */
export function AgentFailPreview() {
  return (
    <main className="recall">
      <div className="pv-row">
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>새로 필요 2번</b><span>지난 대화를 불러오지 못함</span></div>
          <div className="pv-panel-body" style={{ minHeight: 0 }}>
            <div className="panel-body" style={{ padding: 20, flex: 1 }}>
              <FailState title="지난 대화를 불러오지 못했어요" onRetry={() => {}} />
            </div>
            <div className="composer">
              <textarea placeholder="궁금한 건 무엇이든 물어보세요" />
              <div className="bar2"><button className="send" aria-label="보내기" disabled><ArrowUp size={16} /></button></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/** /preview/history-fail: 대화 기록 메뉴 — 기록이 아예 없음 (빈 상태) and 목록을 불러오지 못함 (실패), side by side. */
export function HistoryFailPreview() {
  const menu = (label: string, body: React.ReactNode) => (
    <section className="pv-panel pv-panel--tall">
      <div className="pv-label"><b>새로 필요 3번</b><span>{label}</span></div>
      <div className="pv-panel-body pv-menu-host">
        <nav className="panel-menu pv-panel-menu" aria-label="대화 기록">
          <div className="panel-menu-head">
            <span className="strong">대화 기록</span>
            <button className="head-icon" aria-label="대화 기록 닫기"><X size={16} /></button>
          </div>
          <div className="panel-menu-body">{body}</div>
        </nav>
      </div>
    </section>
  );
  return (
    <main className="recall">
      <div className="pv-row">
        {menu("기록이 아예 없음", <HistoryEmpty />)}
        {menu("목록을 불러오지 못함", <FailState compact title="대화 기록을 불러오지 못했어요" onRetry={() => {}} />)}
      </div>
    </main>
  );
}


/** /preview/agent-error: 에이전트 답을 받지 못했을 때 — the AI bubble itself says so in a calm line, with a small 다시 시도. */
export function AgentErrorPreview() {
  return (
    <main className="recall">
      <div className="pv-row">
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>다듬기 1번</b><span>답을 받지 못함</span></div>
          <div className="pv-panel-body" style={{ minHeight: 0 }}>
            <div className="chat" style={{ flex: 1 }}>
              <div className="msg user">WHERE와 HAVING은 언제 각각 써?</div>
              <div className="msg bot">
                <div style={{ flex: "none", marginTop: 2 }}><Mascot size={26} mood="plain" /></div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  {/* the message and the usual small action button, both inside the bubble */}
                  {/* what happened (red, in a pale pink bubble), and a small round 다시 시도 under it */}
                  <div className="bubble bubble-error" role="alert">
                    <span className="bubble-error-msg">답을 가져오지 못했어요.</span>
                    <button className="bubble-retry"><RotateCw size={13} />다시 시도</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="composer">
              <textarea placeholder="궁금한 건 무엇이든 물어보세요" />
              <div className="bar2"><button className="send" aria-label="보내기" disabled><ArrowUp size={16} /></button></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/** /preview/agent-cut: 답이 오다가 끊겼을 때 — A: the cut notice inside the same bubble, under the partial text; B: a separate pink bubble. */
export function AgentCutPreview() {
  const partial = "WHERE는 그룹으로 묶기 전에 행을 거르고, HAVING은 묶은 뒤 그룹을 걸러요. 그래서 집계 함수 조건은";
  const user = <div className="msg user">WHERE와 HAVING은 언제 각각 써?</div>;
  const avatar = <div style={{ flex: "none", marginTop: 2 }}><Mascot size={26} mood="plain" /></div>;
  const retry = <button className="bubble-retry"><RotateCw size={13} />다시 시도</button>;
  const panel = (label: string, bot: React.ReactNode) => (
    <section className="pv-panel">
      <div className="pv-label"><b>다듬기 2번</b><span>{label}</span></div>
      <div className="chat pv-chat">{user}<div className="msg bot">{avatar}<div style={{ minWidth: 0, flex: 1 }}>{bot}</div></div></div>
    </section>
  );
  return (
    <main className="recall">
      <div className="pv-row">
        {panel("A안 · 같은 말풍선 아래", (
          <div className="bubble bubble-cut">
            <span>{partial}…</span>
            <div className="bubble-cut-foot" role="alert">
              <span className="bubble-error-msg">답이 중간에 끊겼어요.</span>
              {retry}
            </div>
          </div>
        ))}
        {panel("B안 · 분홍 말풍선 따로", (
          <>
            <div className="bubble">{partial}…</div>
            <div className="bubble bubble-error" role="alert" style={{ marginTop: 8 }}>
              <span className="bubble-error-msg">답이 중간에 끊겼어요.</span>
              {retry}
            </div>
          </>
        ))}
      </div>
    </main>
  );
}

/** /preview/quiz-grade-fail: 채점 결과를 받지 못했을 때 — the picked answer stays, a pink note where the 해설 would go,
 *  and the bottom bar offers 다시 시도 (main) with 다음 문제로 as the quiet link (same as 이 문제 건너뛰기). */
export function QuizGradeFailPreview() {
  const q = getQuestion("t-hav-1")!;
  return (
    <main className="recall">
      <div className="pv-row">
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>다듬기 3번</b><span>채점 실패 · 서술형</span></div>
          <div className="panel-body pv-panel-body" style={{ padding: 20 }}>
            <div className="quiz-gauge"><div className="quiz-strip"><i className="on" /><i className="on" /><i /></div></div>
            <div className="quiz-card quiz-flat">
              <div className="q-chips" style={{ display: "flex", gap: 6, marginBottom: 10 }}><span className="chip">{CONCEPTS[q.concept].name}</span></div>
              <p className="q-stem">3. {q.stem}</p>
              {q.code && <pre className="q-code mono">{q.code}</pre>}
              {/* what the learner wrote stays as it was */}
              <textarea className="input q-write" rows={4} disabled defaultValue="WHERE는 그룹으로 묶기 전에 행을 거르고, HAVING은 GROUP BY로 묶은 다음 그룹을 걸러요. 그래서 SUM 같은 집계 조건은 HAVING에 써요." />
              <div className="recall-conf quiz-conf">
                <span className="recall-conf-q">쓴 설명, 얼마나 확실해요?</span>
                <button className="recall-conf-chip" disabled>확실해요</button>
                <button className="recall-conf-chip on" disabled>애매해요</button>
                <button className="recall-conf-chip" disabled>찍었어요</button>
              </div>
              <GradeFail onRetry={() => {}} onNext={() => {}} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/** /preview/start-save: 실제 서비스의 시작 화면(/start, silo-4th develop app/start)을 시안 스타일로 옮긴 것 —
 *  시험 날짜, 기록 저장 동의, 시작하기. 기본 / 저장하는 중(6번) / 저장 실패(7번) 세 상태를 나란히. */
export function StartSavePreview() {
  const screen = (label: string, state: "idle" | "saving" | "failed") => (
    <section className="pv-panel" style={{ width: 400 }}>
      <div className="pv-label"><b>{label}</b></div>
      <div className="start-screen">
        <h1 className="start-title">학습을 시작하기 전에 알려 주세요</h1>
        <p className="muted" style={{ margin: 0 }}>시험 날짜와 기록 저장 동의만 받으면 바로 시작할 수 있어요.</p>
        <div className="field" style={{ marginTop: 28 }}>
          <label>시험 날짜</label>
          <input className="input" type="date" defaultValue="2026-11-29" disabled={state === "saving"} />
        </div>
        <label className="start-consent on">
          <input type="checkbox" defaultChecked disabled={state === "saving"} />
          공부하며 남긴 질문과 확인 결과를 저장하고 분석하는 데 동의해요
        </label>
        {state === "failed" && <p className="login-fail start-fail" role="alert">저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.</p>}
        {state === "saving" ? (
          <button className="btn btn-dark btn-lg btn-block start-cta" disabled aria-busy="true" style={{ opacity: 1 }}><LoaderCircle size={18} className="spinner" style={{ color: "#fff" }} />저장하는 중…</button>
        ) : (
          <button className="btn btn-dark btn-lg btn-block start-cta">시작하기</button>
        )}
        <button className="btn btn-ghost btn-block" style={{ marginTop: 8, color: "var(--color-gray)" }}>로그아웃</button>
      </div>
    </section>
  );
  return (
    <main className="recall">
      <div className="pv-row">
        {screen("기본", "idle")}
        {screen("6번 · 저장하는 중", "saving")}
        {screen("7번 · 저장 실패", "failed")}
      </div>
    </main>
  );
}

/** /preview/quiz-loading: 퀴즈 탭 — 지금 실제 서비스 / 문제를 만드는 중 / 풀던 문제 불러오는 중 (both: the shared grey-bubble loading). */
export function QuizLoadingPreview() {
  return (
    <main className="recall">
      <div className="pv-row">
        {/* 지금 실제 서비스 (silo-4th develop, study-panel.tsx): 위쪽 가운데 도는 마스코트 88px + 회색 글자 */}
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>지금 실제 서비스</b><span>도는 마스코트 + 회색 글자</span></div>
          <div className="panel-body pv-panel-body" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 32 }}><Mascot size={88} spin /></div>
            <p role="status" style={{ textAlign: "center", fontSize: 14, color: "var(--color-gray)", margin: 0 }}>문제를 만들고 있어요</p>
          </div>
        </section>
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>문제를 만드는 중</b><span>5~10초</span></div>
          <div className="panel-body pv-panel-body" style={{ padding: 20 }}>
            {/* 문제를 만드는 중: the shared loading — only the grey bubble with blinking dots */}
            <LoadingCloud label="문제를 만들고 있어요" />
          </div>
        </section>
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>풀던 문제 불러오는 중</b><span>금방 끝나요</span></div>
          <div className="panel-body pv-panel-body" style={{ padding: 20 }}>
            <LoadingCloud label="풀던 문제를 불러오고 있어요" />
          </div>
        </section>
      </div>
    </main>
  );
}

/** /preview/loading: 공용 로딩 화면 — 퀴즈 탭(문제를 만드는 중) 패널 안에서. */
export function LoadingPreview() {
  return (
    <main className="recall">
      <div className="pv-row">
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>공용 로딩</b><span>퀴즈 탭 · 문제를 만드는 중</span></div>
          <div className="panel-body pv-panel-body" style={{ padding: 20 }}>
            <LoadingState title="문제를 만들고 있어요" sub="대화에서 헷갈린 부분으로 3문제를 고르는 중이에요" />
          </div>
        </section>
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>공용 로딩 · 말풍선만</b><span>플러키·문구 없음</span></div>
          <div className="panel-body pv-panel-body" style={{ padding: 20 }}>
            <LoadingCloud label="문제를 만들고 있어요" />
          </div>
        </section>
      </div>
    </main>
  );
}

/** /preview/related-quiz: 확인만 3번 — 에이전트 답 아래 '관련 문제 풀어보기' → 퀴즈 탭에서 문제를 만드는 중 → 실패. */
export function RelatedQuizPreview() {
  const tabs = (active: "agent" | "quiz") => (
    <div className="pv-tabs"><span className={active === "agent" ? "on" : ""}>AI 에이전트</span><span className={active === "quiz" ? "on" : ""}>퀴즈</span></div>
  );
  return (
    <main className="recall">
      <div className="pv-row">
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>① 에이전트 탭</b><span>답 아래 버튼을 눌러요</span></div>
          {tabs("agent")}
          <div className="chat pv-chat">
            <div className="msg user">WHERE와 HAVING은 언제 각각 써?</div>
            <div className="msg bot">
              <div style={{ flex: "none", marginTop: 2 }}><Mascot size={26} /></div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="bubble"><b>WHERE</b>는 그룹으로 묶기 전에 행을 거르고, <b>HAVING</b>은 묶은 뒤 그룹을 걸러요. 그래서 집계 함수 조건은 HAVING에 써요.</div>
                <div className="bot-actions"><button><ListChecks size={12} />관련 문제 풀어보기</button></div>
              </div>
            </div>
          </div>
        </section>
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>② 퀴즈 탭으로 넘어와 만드는 중</b><span>1번과 같은 로딩</span></div>
          {tabs("quiz")}
          <div className="panel-body pv-panel-body" style={{ padding: 20 }}><LoadingCloud label="문제를 만들고 있어요" /></div>
        </section>
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>③ 실패했을 때</b><span>5번과 같은 실패 화면</span></div>
          {tabs("quiz")}
          <div className="panel-body pv-panel-body" style={{ padding: 20 }}><FailState title="문제를 만들지 못했어요" onRetry={() => {}} /></div>
        </section>
      </div>
    </main>
  );
}

/** /preview/grading: 확인만 5번 — 답을 보내고 채점 결과를 받는 중. 지금 실제 서비스(quiz-card.tsx): 카드 아래 회색 13px 글자 한 줄. */
export function GradingPreview() {
  const q = getQuestion("t-hav-1")!;
  return (
    <main className="recall">
      <div className="pv-row">
        <section className="pv-panel pv-panel--tall">
          <div className="pv-label"><b>채점하는 중</b><span>버튼에 로딩 · 서술형</span></div>
          <div className="panel-body pv-panel-body" style={{ padding: 20 }}>
            <div className="quiz-gauge"><div className="quiz-strip"><i className="on" /><i className="on" /><i /></div></div>
            <div className="quiz-card quiz-flat">
              <div className="q-chips" style={{ display: "flex", gap: 6, marginBottom: 10 }}><span className="chip">{CONCEPTS[q.concept].name}</span></div>
              <p className="q-stem">3. {q.stem}</p>
              <textarea className="input q-write" rows={4} disabled defaultValue="WHERE는 그룹으로 묶기 전에 행을 거르고, HAVING은 GROUP BY로 묶은 다음 그룹을 걸러요." />
              <div className="recall-conf quiz-conf">
                <span className="recall-conf-q">쓴 설명, 얼마나 확실해요?</span>
                <button className="recall-conf-chip" disabled>확실해요</button>
                <button className="recall-conf-chip on" disabled>애매해요</button>
                <button className="recall-conf-chip" disabled>찍었어요</button>
              </div>
            </div>
            {/* 채점 중: the 정답 확인 button stays where it was and turns into a spinner + 채점하는 중… (like 저장하는 중…) */}
            <div className="quiz-cta">
              <button className="btn btn-block btn-dark" disabled aria-busy="true" style={{ opacity: 1 }}><LoaderCircle size={17} className="spinner" style={{ color: "#fff" }} />채점하는 중…</button>
            </div>
            <span className="sr-only" role="status">채점하고 있어요</span>
          </div>
        </section>
      </div>
    </main>
  );
}
