import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { AvatarFace, Logo } from "./Brand";
import { HOME } from "../App";

export function Header() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  // the login screen is "before login": no avatar there, even if an old session is still saved
  const onLogin = useLocation().pathname === "/login";
  const user = onLogin ? null : state.user;
  return (
    <header className="gnb">
      <div className="gnb-main">
        <Link to={user ? HOME : "/login"} aria-label="홈">
          <Logo />
        </Link>
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
