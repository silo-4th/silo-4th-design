import mascotUrl from "../assets/mascot.png";
import turnUrl from "../assets/mascot-turn.webp";

/**
 * Sprout buddy used as the AI agent's face.
 * `live` = hop, breathe and blink (agent main screen); `spin` = hop with a full turn (quiz screens).
 * Without either, small mascots get a gentle bob.
 * The spin uses the character turnaround sheet: 8 frames (front → 3/4 → side → back → other side → front,
 * the second half mirrored) that swap while it jumps, so it really turns instead of flipping a flat card.
 * `mood` is kept for existing call sites; the artwork is the same for every mood.
 */
export function Mascot({ size = 96, live = false, spin = false }: { size?: number; mood?: "smile" | "wow" | "think"; live?: boolean; spin?: boolean }) {
  const motion = spin ? "mascot mascot--spin" : live ? "mascot mascot--live" : "mascot";
  const big = live || spin;
  const src = mascotUrl;
  if (spin) {
    return (
      <span className={motion} style={{ width: size, height: size }} aria-hidden>
        <span className="mascot-body">
          {/* stacking order matters: frames 1→7 each fade in over the previous, the front (0) sits on top */}
          {[1, 2, 3, 4, 5, 6, 7, 0].map((k) => (
            <span key={k} className={`mascot-turn f${k}`} style={{ backgroundImage: `url(${turnUrl})` }} />
          ))}
        </span>
      </span>
    );
  }
  return (
    <span className={motion} style={{ width: size, height: size }} aria-hidden>
      {big ? (
        <span className="mascot-body">
          <img src={src} width={size} height={size} alt="" draggable={false} />
          <i className="mascot-lid l" />
          <i className="mascot-lid r" />
        </span>
      ) : (
        <img src={src} width={size} height={size} alt="" draggable={false} />
      )}
    </span>
  );
}

/** Close-up of the sprout's face, used as the signed-in user's avatar (fills its round parent). */
export function AvatarFace() {
  return <img className="avatar-face" src={mascotUrl} alt="" draggable={false} />;
}

export function Logo() {
  return (
    <span className="logo">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.4" />
        <path d="M12 17V10M12 10c0-2.5 2-4 4.5-4 0 2.5-2 4-4.5 4ZM12 12c0-2-1.6-3.2-3.6-3.2 0 2 1.6 3.2 3.6 3.2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      sprout
    </span>
  );
}

export function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
