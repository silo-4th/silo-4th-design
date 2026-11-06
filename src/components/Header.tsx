import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { AvatarFace, Logo } from "./Brand";

export function Header() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  // the login screen is "before login": no avatar there, even if an old session is still saved
  const onLogin = useLocation().pathname === "/login";
  const user = onLogin ? null : state.user;
  return (
    <header className="gnb">
      <div className="gnb-main">
        {/* logo is just the brand mark: clicking it does nothing */}
        <Logo />
        <div className="gnb-right">
          {user ? (
            <>
              <button
                className="avatar"
                title="로그아웃"
                onClick={() => {
                  dispatch({ type: "logout" });
                  nav("/login");
                }}
              >
                <AvatarFace />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
