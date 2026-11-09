import { Component, type ReactNode } from "react";
import { Header } from "./Header";
import { GlobalError } from "./GlobalError";

/**
 * 예상하지 못한 오류가 나면 (다듬기 4번): instead of a blank page, the whole screen shows the scruffy 플러키 with
 * 다시 시도 (reloads). Wraps every route.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error(error);
  }
  render() {
    if (this.state.failed) return <><Header /><GlobalError /></>;
    return this.props.children;
  }
}

/** The prototype doesn't crash on its own: ?crash=1 throws once while rendering, to show the screen above. */
export function CrashForReview() {
  if (new URLSearchParams(window.location.search).get("crash") === "1") throw new Error("review: unexpected error screen");
  return null;
}
