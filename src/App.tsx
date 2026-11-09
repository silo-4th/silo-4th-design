import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Login } from "./pages/Login";
import { Recall, RecallPrepPreview } from "./pages/Recall";
import { Setup } from "./pages/Setup";
import { AgentWaitPreview, QuizFailPreview, QuizHistoryStatesPreview } from "./pages/Previews";
import { Workspace } from "./pages/Workspace";
import { useStore } from "./store";

/** The study screen is the whole app now; everything else lands here. */
export const HOME = "/learn/groupby";

/** Not logged in → the login page comes first. */
function Guard({ children }: { children: ReactNode }) {
  const { state } = useStore();
  if (!state.user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  const { state } = useStore();
  return (
    <Routes>
      <Route path="/login" element={<><Header /><Login /></>} />
      <Route path="/setup" element={state.user ? <><Header /><Setup /></> : <Navigate to="/login" replace />} />
      {/* After login: pull a few studied concepts back out before studying (skips itself when there is nothing yet). */}
      <Route path="/recall" element={state.user ? <><Header /><Recall /></> : <Navigate to="/login" replace />} />
      {/* 시안 검토용 (not linked anywhere): 꺼내 먹기 준비 중 화면 */}
      <Route path="/preview/recall-prep" element={<><Header /><RecallPrepPreview /></>} />
      <Route path="/preview/quiz-history-states" element={<><Header /><QuizHistoryStatesPreview /></>} />
      <Route path="/preview/quiz-fail" element={<><Header /><QuizFailPreview /></>} />
      <Route path="/preview/agent-wait" element={<><Header /><AgentWaitPreview /></>} />
      <Route path="/learn/:id" element={<Guard><Workspace /></Guard>} />
      {/* First entry (and any unknown address) always opens the login screen. */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
