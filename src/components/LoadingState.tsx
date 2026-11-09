import thinkingUrl from "../assets/mascot-thinking.webp";

/**
 * 공용 로딩 화면 — for the longer AI waits (문제를 만드는 중, 서술형 채점, …): 플러키 thinking ("o" mouth) with the soft
 * thought cloud from the 꺼내 먹기 start over its head, three dots blinking inside the cloud, then a title and a quiet line.
 * Short loads (lists, a saved set, a unit's text) use skeletons instead.
 */
export function LoadingState({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="quiz-home loading-state" role="status">
      <span className="mascot loading-art" aria-hidden>
        <span className="recall-want-bob">
          <img src={thinkingUrl} alt="" width={136} height={110} draggable={false} />
          <span className="loading-dots"><span className="typing"><i /><i /><i /></span></span>
          <i className="mascot-lid l" />
          <i className="mascot-lid r" />
        </span>
      </span>
      <h3>{title}</h3>
      {sub && <p className="muted">{sub}</p>}
    </div>
  );
}

/** The quietest version: only a grey speech bubble with blinking dots — no 플러키, no text (the label is for screen readers). */
export function LoadingCloud({ label }: { label: string }) {
  return (
    <div className="quiz-home loading-state" role="status">
      {/* the chat's waiting bubble, enlarged: a soft grey bubble with the same blinking dots */}
      <span className="making-bubble" aria-hidden><span className="typing"><i /><i /><i /></span></span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
