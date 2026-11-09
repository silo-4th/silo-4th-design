import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Mascot } from "../components/Brand";
import failArtUrl from "../assets/mascot-fail.webp";

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
