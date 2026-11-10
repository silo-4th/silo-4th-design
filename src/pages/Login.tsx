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
        {/* one stage, scaled as a whole to the panel so the composition keeps its proportions on any screen */}
        <div className="login-stage">
        <div className="login-copy">
        <div className="login-art-head">읽고, 확인하고, 기록하는<br />AI 리딩 파트너</div>
        <div className="login-bubbles">
          <p className="login-bubble">모르는 문장, <u className="login-drag">드래그</u>만 하면 돼요</p>
          <p className="login-bubble login-bubble--icon"><span className="login-checkbox"><Check size={12} strokeWidth={3.2} /></span>짧은 문제로 이해했는지 확인해 볼까요?</p>
          <p className="login-bubble">내 학습 데이터를 한눈에 보아요 <span className="login-emoji">👀</span></p>
        </div>
        </div>
        <img className="login-plucky" src={laptopUrl} alt="" draggable={false} />
        </div>
      </section>

      <section className="login-form">
        <h1>나만의 학습을 시작해 보세요!</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--color-ink-2)", margin: "0 0 32px" }}>
          맞춤형 AI 문제로 막힌 부분을 해결하고, 진짜 내 것으로 만들어요.
        </p>
        <div className="field">
          <label htmlFor="name">별명</label>
          <input id="name" className="input" value={name} disabled={busy} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && start()} />
        </div>
        <button
          className={`google-btn${phase === "done" ? " is-done" : ""}`}
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
        {/* terms consent (plain text for now; turn the two names into links once the pages exist) */}
        <p className="subtle login-terms" style={{ marginTop: 16 }}>
          Google로 로그인하면 Pluck 이용약관과 개인정보처리방침에 동의하게 돼요.
        </p>
      </section>
    </main>
  );
}
