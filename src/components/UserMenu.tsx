import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_HANDLE, useStore } from "../store";
import { AvatarFace } from "./Brand";

/** Avatar at the right of the study header: shows who is signed in, opens a small menu with log out. */
export function UserMenu() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!state.user) return null;
  const handle = state.user.handle ?? DEFAULT_HANDLE;

  return (
    <div className="user-menu" ref={box}>
      <button
        className="user-chip"
        aria-label={`${handle}(으)로 로그인됨, 계정 메뉴`}
        title={`${handle} · 로그인됨`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="avatar avatar--dark"><AvatarFace /></span>
      </button>
      {open && (
        <div className="tone-menu user-pop" role="menu" aria-label="계정">
          <div className="user-pop-head">
            <span className="avatar"><AvatarFace /></span>
            <span>
              <b>{handle}</b>
              <span className="user-pop-sub">로그인됨 · 학습 기록이 이 브라우저에 저장돼요</span>
            </span>
          </div>
          <button
            role="menuitem"
            className="user-pop-item"
            onClick={() => {
              dispatch({ type: "logout" });
              nav("/login");
            }}
          >
            <LogOut size={15} />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
