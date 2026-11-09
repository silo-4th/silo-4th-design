import { Check, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMark } from "../components/Brand";
import laptopUrl from "../assets/plucky-laptop.webp";
import { DEFAULT_HANDLE, useStore } from "../store";

export function Login() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState(DEFAULT_HANDLE);
  // like a real sign-in: a short "checking" spinner, a brief welcome, then the next page
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // 로그인 실패 (다듬기 5번): the button comes back so it can be pressed again, and a pale pink note under it says so.
  // The prototype never fails: ?login=fail makes the first try fail.
  const failNext = useRef(new URLSearchParams(window.location.search).get("login") === "fail");
  const [failed, setFailed] = useState(false);

  const start = () => {
    if (phase !== "idle") return;
    const who = name.trim() || DEFAULT_HANDLE;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setFailed(false);
    setPhase("loading");
    if (failNext.current) {
      failNext.current = false;
      timers.current.push(window.setTimeout(() => { setPhase("idle"); setFailed(true); }, calm ? 200 : 700));
      return;
    }
    timers.current.push(
      window.setTimeout(() => setPhase("done"), calm ? 200 : 500),
      window.setTimeout(() => {
        dispatch({ type: "login", name: who });
        nav(state.setup ? "/recall" : "/setup");
      }, calm ? 900 : 1700),
    );
  };
  const busy = phase !== "idle";

  return (
    <main className="login">
      {/* Plucky at the laptop, talking to the visitor in three speech bubbles */}
      <section className="login-art" aria-hidden>
        <div className="login-art-head">읽고, 확인하고, 기록하는<br />AI 리딩 파트너</div>
        <div className="login-bubbles">
          <p className="login-bubble">모르는 문장은 드래그하면 바로 설명해 줄게요</p>
          <p className="login-bubble">짧은 확인 문제로 진짜 이해했는지 볼까요?</p>
          <p className="login-bubble">내 학습 데이터를 한눈에 보아요</p>
        </div>
        <img className="login-plucky" src={laptopUrl} alt="" draggable={false} />
      </section>

      <section className="login-form">
        <h1>나만의 학습을 시작해보세요!</h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--color-ink-2)", margin: "0 0 8px", maxWidth: 420 }}>
          궁금한 내용을 질문하고, 학습 기록을 저장하며 언제든 이어서 공부할 수 있어요.
        </p>
        <p className="muted" style={{ margin: "0 0 28px", maxWidth: 420 }}>AI가 설명만 하고 끝나지 않아요. 내가 혼자 풀 수 있을 때까지 도움을 조금씩 줄여가요.</p>
        <div className="field" style={{ maxWidth: 380 }}>
          <label htmlFor="name">별명</label>
          <input id="name" className="input" value={name} disabled={busy} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && start()} />
        </div>
        <button
          className={`google-btn${phase === "done" ? " is-done" : ""}`}
          style={{ maxWidth: 380 }}
          onClick={start}
          disabled={busy}
          aria-busy={phase === "loading"}
        >
          {phase === "idle" && (<><GoogleMark />Google로 계속하기</>)}
          {phase === "loading" && (<><LoaderCircle size={18} className="spinner" />로그인하는 중…</>)}
          {phase === "done" && (<><Check size={18} />{name.trim() || DEFAULT_HANDLE}님, 환영해요!</>)}
        </button>
        {failed && <p className="login-fail" role="alert">로그인하지 못했어요. 다시 시도해 주세요.</p>}
        <p className="sr-only" role="status">{phase === "loading" ? "로그인하는 중" : phase === "done" ? "로그인됐어요. 학습 화면으로 이동해요." : ""}</p>
        <p className="subtle" style={{ marginTop: 14, maxWidth: 380 }}>프로토타입이라 실제 Google 계정 연동 없이 이 브라우저에만 학습 기록이 저장돼요.</p>
      </section>
    </main>
  );
}
