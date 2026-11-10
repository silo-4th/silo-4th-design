/**
 * 문제를 만드는 중 / 풀던 문제를 불러오는 중: the quiz card's own shape in soft grey bars — progress strip, concept chip,
 * two question lines and four options — so the question drops into the same place when it arrives.
 */
export function QuizSkeleton({ label }: { label: string }) {
  return (
    <>
      <span className="sr-only" role="status">{label}</span>
      <div className="quiz-skel" aria-hidden>
        <div className="quiz-strip"><i /><i /><i /></div>
        <i className="skel" style={{ width: 92, height: 24, marginTop: 20 }} />
        <i className="skel skel-line" style={{ width: "92%", marginTop: 14 }} />
        <i className="skel skel-line" style={{ width: "64%", marginTop: 10 }} />
        {[0, 1, 2, 3].map((k) => <i key={k} className="skel quiz-skel-opt" />)}
      </div>
    </>
  );
}
