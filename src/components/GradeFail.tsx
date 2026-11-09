import { RotateCw } from "lucide-react";

/**
 * 채점 결과를 받지 못했을 때 (다듬기 3번): a pale pink note where the 해설 would go — the message in red with the chat's
 * 다시 시도 pill on the same line — and 다음 문제로 as the quiet link under it. What the learner picked or wrote stays.
 */
export function GradeFail({ onRetry, onNext, nextLabel = "다음 문제로" }: { onRetry: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <>
      <div className="explain grade-fail" role="alert">
        <span>채점 결과를 받지 못했어요.</span>
        <button className="bubble-retry grade-pill" onClick={onRetry}><RotateCw size={13} />다시 시도</button>
      </div>
      <button className="recall-later quiz-skip grade-skip" onClick={onNext}>{nextLabel}</button>
    </>
  );
}

/** The prototype grades on the spot and never fails: ?grade=fail makes the next grading fail once, to show this screen. */
let failNext = new URLSearchParams(window.location.search).get("grade") === "fail";
export function gradeFailsNow() {
  if (!failNext) return false;
  failNext = false;
  return true;
}
