/** 대화 기록이 아직 없을 때: two quiet lines, no picture and no button (it's a normal state, nothing to fix). */
export function HistoryEmpty() {
  return (
    <div className="quiz-home quiz-fail--compact history-empty">
      <h3>아직 대화 기록이 없어요</h3>
      <p className="muted">새 대화를 시작하면<br />지난 대화가 여기에 쌓여요.</p>
    </div>
  );
}
