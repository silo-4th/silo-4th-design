import failArtUrl from "../assets/mascot-fail.webp";

/**
 * 불러오기·만들기에 실패했을 때 (퀴즈 탭, 지난 문제, 지난 대화…): 플러키 holding up a round X sign, a calm title, one 다시 시도.
 * `compact` is the small version for narrow places like the 대화 기록 menu (smaller art and text, a short button).
 */
export function FailState({ title, onRetry, compact = false }: { title: string; onRetry: () => void; compact?: boolean }) {
  return (
    <div className={`quiz-home quiz-fail ${compact ? "quiz-fail--compact" : ""}`} role="alert">
      <span className="mascot quiz-fail-sign" aria-hidden><img src={failArtUrl} alt="" width={224} height={160} draggable={false} /></span>
      <h3>{title}</h3>
      <p className="muted">잠시 뒤 다시 시도해 주세요.</p>
      <div className="quiz-home-cta">
        <button className={`btn btn-dark ${compact ? "btn-sm" : "btn-lg btn-block"}`} onClick={onRetry}>다시 시도</button>
      </div>
    </div>
  );
}
