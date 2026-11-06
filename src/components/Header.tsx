import { useLocation } from "react-router-dom";
import { useStore } from "../store";
import { Logo } from "./Brand";
import { UserMenu } from "./UserMenu";

export function Header() {
  const { state } = useStore();
  // the login screen is "before login": no avatar there, even if an old session is still saved
  const onLogin = useLocation().pathname === "/login";
  const user = onLogin ? null : state.user;
  return (
    <header className="gnb">
      <div className="gnb-main">
        {/* logo is just the brand mark: clicking it does nothing */}
        <Logo />
        <div className="gnb-right">
          {/* same avatar + log-out menu as the study screen */}
          {user ? <UserMenu /> : null}
        </div>
      </div>
    </header>
  );
}
