import mascotUrl from "../assets/mascot.png";
import catUrl from "../assets/mascot-cat.png";
import openUrl from "../assets/mascot-open.png";
import oUrl from "../assets/mascot-o.png";
import grinUrl from "../assets/mascot-grin.png";
import shyUrl from "../assets/mascot-shy.png";
import turnUrl from "../assets/mascot-turn.webp";
import plainUrl from "../assets/mascot-plain.png";
import zipUrl from "../assets/mascot-zip.png";
import logoUrl from "../assets/pluck-logo.svg";

/** Plucky's faces. The resting face is the gentle smile (`mascot.png`); the rest only change the mouth (and blush). `plain` has no mouth. */
const FACES = { plain: plainUrl, smile: mascotUrl, cat: catUrl, open: openUrl, think: oUrl, wow: grinUrl, shy: shyUrl, zip: zipUrl } as const;
export type MascotMood = keyof typeof FACES;

/**
 * Plucky, used as the AI agent's face.
 * `live` = hop, breathe and blink (agent main screen); `spin` = hop with a full turn (quiz screens).
 * Without either, small mascots get a gentle bob.
 * `mood` picks the resting face: smile (default) · plain (no mouth) · cat · open · think (little "o") · wow (big grin) · shy (blush) · zip (zipped mouth, quiet while the panel is closed).
 * `hoverMood` swaps to another face while the mascot (or the button around it) is hovered or focused.
 * Faces follow the motion: while it hops it opens its mouth, and after the quiz spin lands it shows a happy
 * mouth (the big grin when `mood` is "wow"), then settles back to its resting face.
 * The spin uses a 16-view sheet: the front and back drawings wrapped round one body and turned a full circle,
 * swapped while it jumps, so it really turns and its outline never jumps between drawings.
 */
export function Mascot({ size = 96, live = false, spin = false, mood = "smile", hoverMood }: { size?: number; mood?: MascotMood; hoverMood?: MascotMood; live?: boolean; spin?: boolean }) {
  const motion = spin ? "mascot mascot--spin" : live ? "mascot mascot--live" : "mascot";
  const face = FACES[mood] ?? mascotUrl;
  // the face it makes mid-motion: big grin if it's already beaming, otherwise an open happy mouth
  const action = mood === "wow" ? grinUrl : openUrl;
  if (spin) {
    return (
      <span className={motion} style={{ width: size, height: size }} aria-hidden>
        <span className="mascot-body">
          <span className="mascot-turn" style={{ backgroundImage: `url(${turnUrl})` }} />
          <img className="mascot-face mascot-face--land" src={action} width={size} height={size} alt="" draggable={false} />
        </span>
      </span>
    );
  }
  if (live) {
    return (
      <span className={motion} style={{ width: size, height: size }} aria-hidden>
        <span className="mascot-body">
          <img src={face} width={size} height={size} alt="" draggable={false} />
          <img className="mascot-face mascot-face--hop" src={action} width={size} height={size} alt="" draggable={false} />
          <i className="mascot-lid l" />
          <i className="mascot-lid r" />
        </span>
      </span>
    );
  }
  return (
    <span className={motion} style={{ width: size, height: size }} aria-hidden>
      <img src={face} width={size} height={size} alt="" draggable={false} />
      {hoverMood && <img className="mascot-face mascot-face--hover" src={FACES[hoverMood]} width={size} height={size} alt="" draggable={false} />}
    </span>
  );
}

/** Close-up of the sprout's face, used as the signed-in user's avatar (fills its round parent). No mouth: just the eyes. */
export function AvatarFace() {
  return <img className="avatar-face" src={plainUrl} alt="" draggable={false} />;
}

/** Service logo: the bubbly green "Pluck" wordmark (final, used as-is). */
export function Logo() {
  return (
    <span className="logo">
      <img src={logoUrl} alt="Pluck" draggable={false} />
    </span>
  );
}

export function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FBBC05" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#EA4335" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#34A853" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
