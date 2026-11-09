import { useNavigate } from "react-router-dom";
import failArtUrl from "../assets/mascot-fail.webp";
import { HOME } from "../App";

/**
 * 없는 단원 주소로 들어왔을 때 (새로 필요 4번): the whole page, 플러키 with the round X sign, a short explanation, and one way
 * back into studying (the home address opens the last unit or the first one).
 */
export function NotFound() {
  const nav = useNavigate();
  return (
    <main className="not-found">
      <div className="quiz-home quiz-fail not-found-box" role="alert">
        <span className="mascot quiz-fail-sign" aria-hidden><img src={failArtUrl} alt="" width={224} height={160} draggable={false} /></span>
        <h3>찾을 수 없는 단원이에요</h3>
        <p className="muted">주소가 바뀌었거나 없는 단원이에요.</p>
        <div className="quiz-home-cta">
          <button className="btn btn-dark btn-lg btn-block" onClick={() => nav(HOME)}>내 학습으로 가기</button>
        </div>
      </div>
    </main>
  );
}
