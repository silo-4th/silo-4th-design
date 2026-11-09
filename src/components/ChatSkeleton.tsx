/** Grey stand-ins for a conversation: my bubble on the right, 플러키 + its answer on the left, two rounds. */
export function ChatSkeleton() {
  return (
    <div className="chat-skel-list" aria-hidden>
      {[{ me: 46, bot: [100, 92, 64] }, { me: 58, bot: [100, 78] }].map((r, k) => (
        <div key={k} className="chat-skel-round">
          <i className="skel chat-skel-me" style={{ width: `${r.me}%` }} />
          <div className="chat-skel-bot">
            <i className="skel chat-skel-avatar" />
            <div className="chat-skel-bubble">
              {r.bot.map((w, j) => <i key={j} className="skel chat-skel-line" style={{ width: `${w}%` }} />)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
