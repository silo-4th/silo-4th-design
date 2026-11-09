import grubbyUrl from "../assets/mascot-grubby.webp";

/**
 * 예상하지 못한 오류 (다듬기 4번, global-error): the whole page, same layout as 없는 단원 — a scruffy, smudged 플러키
 * (something went wrong on our side, not the learner's), a calm title, one 다시 시도 that reloads the page.
 */
export function GlobalError({ onRetry = () => window.location.reload() }: { onRetry?: () => void }) {
  return (
    <main className="not-found">
      <div className="quiz-home quiz-fail not-found-box" role="alert">
        {/* scruffy 플러키 sways a little, dazed; it blinks like the other 플러키 (the mouth stays as drawn) */}
        <span className="mascot quiz-fail-sign grubby" aria-hidden>
          <span className="grubby-body">
            <img src={grubbyUrl} alt="" width={224} height={160} draggable={false} />
            {/* the usual blink */}
            <i className="mascot-lid l" />
            <i className="mascot-lid r" />
          </span>
        </span>
        <h3>문제가 생겼어요</h3>
        <p className="muted">잠시 뒤 다시 시도해 주세요.</p>
        <div className="quiz-home-cta">
          <button className="btn btn-dark btn-lg btn-block" onClick={onRetry}>다시 시도</button>
        </div>
      </div>
    </main>
  );
}
