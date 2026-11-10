import { Menu, SquarePen, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Mascot } from "../components/Brand";
import { UserMenu } from "../components/UserMenu";
import { Header } from "../components/Header";
import { NotFound } from "../components/NotFound";
import { useToast } from "../components/Toast";
import { getMaterial } from "../data/materials";
import { useStore } from "../store";
import { AgentChat, type Command } from "../workspace/AgentChat";
import { Reader, ReaderSkeleton, type SelAction } from "../workspace/Reader";
import { PanelMenu } from "../workspace/PanelMenu";
import { ToneMenu } from "../workspace/ToneMenu";
import { UnitMenu } from "../workspace/UnitMenu";
import { QuizTab } from "../workspace/QuizTab";

type Tab = "agent" | "review";

const SEL_PROMPT: Record<Exclude<SelAction, "note" | "check">, string> = {
  easy: "이 부분을 쉽게 설명해줘",
  example: "이 부분을 예시로 보여줘",
  compare: "비슷한 개념과 비교해서 차이를 알려줘",
  point: "이 부분의 시험 포인트를 알려줘",
};

export function Workspace() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const material = getMaterial(id);
  const { state, dispatch } = useStore();
  // 단원을 바꾸면 새 본문을 받는 동안 뼈대 화면을 보여 줘요. The prototype has the text at once, so the skeleton stays
  // ~0.9s just to show the moment; the real service shows it until the body arrives. (Not on the first visit.)
  const [shownId, setShownId] = useState(id);
  const switching = shownId !== id;
  useEffect(() => {
    if (!switching) return;
    const t = window.setTimeout(() => setShownId(id), 900);
    return () => window.clearTimeout(t);
  }, [id, switching]);
  const toast = useToast();
  const initialTab: Tab = params.get("tab") === "review" ? "review" : "agent";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState(params.get("section") ?? "intro");
  const [scrollTo] = useState(() => (params.get("section") ? { id: params.get("section")!, n: 0 } : null));
  const [command, setCommand] = useState<Command | null>(null);
  const [reviewPreset] = useState<string | undefined>();
  // 관련 문제 풀어보기 from the agent tab: switch to the quiz tab and hand it the concept (n makes each press a new request)
  const [related, setRelated] = useState<{ concept: string; n: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const n = useRef(0);

  // Count study time while the tab is visible.
  useEffect(() => {
    const t = window.setInterval(() => document.visibilityState === "visible" && dispatch({ type: "tick", minutes: 1 }), 60_000);
    return () => window.clearInterval(t);
  }, [dispatch]);

  // Entering a lecture opens the agent on its first (welcome) screen: the previous conversation
  // is filed into 대화 기록, where it can be reopened. Runs once per lecture visit.
  const freshFor = useRef<string | null>(null);
  useEffect(() => {
    if (freshFor.current === id) return;
    freshFor.current = id;
    dispatch({ type: "newChat", materialId: id });
  }, [id, dispatch]);

  // A new lecture starts at its intro section.
  const prevId = useRef(id);
  useEffect(() => {
    if (prevId.current === id) return;
    prevId.current = id;
    setActive("intro");
  }, [id]);

  useEffect(() => {
    if (material) dispatch({ type: "read", materialId: material.id, sectionId: active });
  }, [active, material, dispatch]);

  const send = useCallback((c: Omit<Command, "n"> & Record<string, unknown>) => {
    n.current += 1;
    setTab("agent");
    setOpen(true);
    setCommand({ ...(c as Command), n: n.current });
  }, []);

  const autoAsked = useRef(false);
  useEffect(() => {
    if (params.get("ask") === "check" && material && !autoAsked.current) {
      autoAsked.current = true;
      const s = material.sections.find((x) => x.id === params.get("section"));
      if (s?.concept) window.setTimeout(() => send({ kind: "quiz", concept: s.concept! }), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 없는 단원 주소: a page that says so, with a way back (새로 필요 4번), instead of silently jumping away
  if (!material) return <><Header /><NotFound /></>;
  const section = material.sections.find((s) => s.id === active);
  const hasChat = (state.chats[material.id] ?? []).length > 0;

  const onSelect = (a: SelAction, text: string, sectionId: string) => {
    if (a === "note") {
      dispatch({ type: "note", note: { materialId: material.id, sectionId, text: "(드래그 저장)", quote: text } });
      toast("선택한 문장을 노트에 저장했어요");
      return;
    }
    const s = material.sections.find((x) => x.id === sectionId);
    if (a === "check") return send({ kind: "quiz", concept: s?.concept ?? material.sections.find((x) => x.concept)!.concept! });
    send({ kind: "ask", prompt: SEL_PROMPT[a], quote: text });
  };

  const TABS: { k: Tab; label: string }[] = [
    { k: "agent", label: "AI 에이전트" },
    { k: "review", label: "퀴즈" },
  ];

  return (
    <div className="ws">
      <div className="ws-main">
        <header className="ws-top">
          <UnitMenu material={material} />
          <span className="title">{material.title}</span>
          <div className="right">
            <UserMenu />
          </div>
        </header>

        <div className="ws-body">
          {/* ?loading=1 keeps the body in its loading state (시안 검토용) */}
          {switching || params.get("loading") ? <ReaderSkeleton material={material} /> : <Reader
            material={material}
            active={active}
            onActive={setActive}
            scrollTo={scrollTo}
            onSelectAction={onSelect}
          />}
        </div>

        {/* Panel closed: the sprout peeks in from the top-right edge; click it to open the AI panel. */}
        {!open && (
          <button className="peek" aria-label="AI 패널 열기" onClick={() => setOpen(true)}>
            <span className="peek-bubble" aria-hidden>궁금한 거 있어?</span>
            <span className="peek-clip">
              <span className="peek-body"><Mascot size={104} mood="zip" hoverMood="cat" /></span>
            </span>
          </button>
        )}
      </div>

      {open && (
        <aside className="panel" aria-label="AI 패널">
          <div className="panel-head">
            <span aria-hidden="true" />
            <div className="seg" role="tablist" aria-label="AI 패널 메뉴">
              {TABS.map(({ k, label }) => (
                <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); setMenuOpen(false); }}>
                  {label}
                </button>
              ))}
            </div>
            <div className="panel-head-side end">
              <button className="head-icon" aria-label="패널 닫기" title="패널 닫기" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
          </div>
          {tab === "agent" && (
            <>
              <div className="panel-tools">
                <button className="tool-btn" aria-label="대화 기록" title="대화 기록" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
                  <Menu size={18} />
                </button>
                <div className="panel-tools-end">
                  {/* 새 대화 only once there is a conversation (the empty start screen already is a new chat) */}
                  {hasChat && (
                    <button
                      className="tool-btn"
                      aria-label="새 대화"
                      title="새 대화"
                      onClick={() => {
                        dispatch({ type: "newChat", materialId: material.id });
                        toast("새 대화를 시작했어요. 지난 대화는 대화 기록에 있어요.");
                      }}
                    >
                      <SquarePen size={17} />
                    </button>
                  )}
                  {hasChat && <ToneMenu />}
                </div>
              </div>
              <AgentChat material={material} section={section} command={command} onRelated={(concept) => { setRelated((r) => ({ concept, n: (r?.n ?? 0) + 1 })); setTab("review"); }} />
              {menuOpen && <PanelMenu material={material} onClose={() => setMenuOpen(false)} />}
            </>
          )}
          {tab === "review" && <QuizTab key={reviewPreset ?? "quiz"} material={material} section={section} preset={reviewPreset} related={related} onRelatedDone={() => setRelated(null)} />}
        </aside>
      )}
    </div>
  );
}
