import { BookmarkPlus, Lightbulb, Sparkles, Target } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { type Block, type Material } from "../data/materials";

export type SelAction = "easy" | "example" | "compare" | "point" | "check" | "note";

const SEL_ACTIONS: { k: SelAction; label: string; icon: typeof Sparkles }[] = [
  { k: "easy", label: "쉽게 설명", icon: Sparkles },
  { k: "example", label: "예시 보기", icon: Lightbulb },
  { k: "point", label: "시험 포인트", icon: Target },
  { k: "note", label: "노트 저장", icon: BookmarkPlus },
];

export function Reader({
  material,
  active,
  onActive,
  scrollTo,
  onSelectAction,
}: {
  material: Material;
  active: string;
  onActive: (id: string) => void;
  scrollTo: { id: string; n: number } | null;
  onSelectAction: (a: SelAction, text: string, sectionId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<{ x: number; y: number; bottom: number; text: string; section: string } | null>(null);
  // final popup position, kept fully inside the reader (never cut off at the edges)
  const pop = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ left: number; top: number; below: boolean } | null>(null);

  // Moving to another lecture always starts from the top of its material
  // (except the first load, when a ?section= link asks for a specific spot).
  const firstMaterial = useRef(true);
  useEffect(() => {
    if (firstMaterial.current) {
      firstMaterial.current = false;
      if (scrollTo) return;
    }
    ref.current?.scrollTo({ top: 0 });
    setSel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material.id]);

  useEffect(() => {
    if (!scrollTo) return;
    document.getElementById(`sec-${scrollTo.id}`)?.scrollIntoView({ behavior: scrollTo.n === 0 ? "auto" : "smooth", block: "start" });
  }, [scrollTo]);

  // Scroll-spy: the section nearest the top of the reader is the one being read.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) onActive(vis[0].target.id.replace("sec-", ""));
      },
      { root, rootMargin: "-10% 0px -55% 0px" },
    );
    root.querySelectorAll("[id^=sec-]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [material.id, onActive]);

  const onMouseUp = () => {
    const s = window.getSelection();
    const text = s?.toString().trim() ?? "";
    if (!s || text.length < 2 || !ref.current) return setSel(null);
    const range = s.getRangeAt(0);
    const sec = (range.startContainer.parentElement as HTMLElement | null)?.closest("[id^=sec-]");
    if (!sec) return setSel(null);
    const r = range.getBoundingClientRect();
    const box = ref.current.getBoundingClientRect();
    setSel({
      x: r.left + r.width / 2 - box.left,
      y: r.top - box.top + ref.current.scrollTop - 8,
      bottom: r.bottom - box.top + ref.current.scrollTop + 8,
      text: text.slice(0, 1500), // room for a whole table
      section: sec.id.replace("sec-", ""),
    });
  };

  // Double-clicking a table selects the whole table (not just one word), then shows the same popup.
  const onDoubleClick = (e: React.MouseEvent) => {
    const table = (e.target as HTMLElement).closest("table");
    if (!table) return;
    const range = document.createRange();
    range.selectNodeContents(table);
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(range);
    onMouseUp();
  };

  useLayoutEffect(() => {
    if (!sel || !pop.current || !ref.current) return setPlace(null);
    const root = ref.current;
    const w = pop.current.offsetWidth;
    const h = pop.current.offsetHeight;
    const pad = 8;
    // keep it within the text column (a little outdent allowed) so it never drifts to the far edge of
    // the reader; only when the column is narrower than the popup fall back to the reader's own edges
    const col = root.querySelector(".reader-inner") as HTMLElement | null;
    const colL = col ? col.offsetLeft - 12 : pad;
    const colR = col ? col.offsetLeft + col.offsetWidth + 12 : root.clientWidth - pad;
    const [lo, hi] = colR - colL >= w ? [colL, colR - w] : [pad, Math.max(pad, root.clientWidth - w - pad)];
    const left = Math.min(Math.max(sel.x - w / 2, lo), hi);
    // not enough room above (sticky section tabs sit at the top) → show it under the selection
    const tocH = (root.querySelector(".toc") as HTMLElement | null)?.offsetHeight ?? 0;
    const below = sel.y - h < root.scrollTop + tocH + pad;
    setPlace({ left, top: below ? sel.bottom : sel.y - h, below });
  }, [sel]);

  return (
    <div className="reader" ref={ref} onMouseUp={onMouseUp} onDoubleClick={onDoubleClick} onScroll={(e) => {
        if (sel) setSel(null);
        // The last section can never reach the top band, so treat "scrolled to the end" as reading it.
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) onActive(material.sections[material.sections.length - 1].id);
      }}>
      <nav className="toc" aria-label="구간">
        <div className="toc-inner">
          {material.sections.map((s) => (
            <button key={s.id} className={active === s.id ? "on" : ""} onClick={() => document.getElementById(`sec-${s.id}`)?.scrollIntoView({ behavior: "smooth" })}>
              {s.title}
            </button>
          ))}
        </div>
      </nav>

      <article className="reader-inner">
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <span className="chip">{material.subject}</span>
        </div>
        <h1>{material.title}</h1>

        {material.sections.map((s) => {
          return (
            <section key={s.id} id={`sec-${s.id}`} style={{ scrollMarginTop: 48 }}>
              {s.id !== "intro" && <div className="sec-title">{s.title}</div>}
              {s.blocks.map((b, i) => <BlockView key={i} b={b} />)}
            </section>
          );
        })}
      </article>

      {sel && (
        <div ref={pop} className="sel-pop" style={place ? { left: place.left, top: place.top } : { left: 0, top: 0, visibility: "hidden" }} onMouseUp={(e) => e.stopPropagation()}>
          {SEL_ACTIONS.map(({ k, label, icon: Icon }) => (
            <button
              key={k}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelectAction(k, sel.text, sel.section);
                setSel(null);
                window.getSelection()?.removeAllRanges();
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Inline marks from the source notes: **bold** and `code`. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*(?:[^*]|\*(?!\*))+?\*\*|`[^`]+`)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <b key={i}>{part.slice(2, -2)}</b>
        ) : part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="inline-code">{part.slice(1, -1)}</code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.kind) {
    case "h2":
      return <h2>{b.text}</h2>;
    case "h3":
      return <h3 className="reader-h3"><Inline text={b.text} /></h3>;
    case "p":
      return <p><Inline text={b.text} /></p>;
    case "ul":
      return <ul>{b.items.map((i) => <li key={i}><Inline text={i} /></li>)}</ul>;
    case "ol":
      return <ol>{b.items.map((i) => <li key={i}><Inline text={i} /></li>)}</ol>;
    case "code":
      return <pre className="mono">{b.text}</pre>;
    case "callout": {
      // Callouts are written as "라벨 · 본문"; the label becomes the visual anchor.
      const [label, ...rest] = b.text.split(" · ");
      if (!rest.length) return <div className="callout">{b.text}</div>;
      return (
        <div className={`callout ${label === "자주 혼동" ? "warn" : ""}`}>
          <span className="callout-label">{label}</span>
          <span>{rest.join(" · ")}</span>
        </div>
      );
    }
    case "table":
      return (
        <table>
          <thead><tr>{b.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {b.rows.length === 0 && (
              <tr><td colSpan={b.head.length} className="subtle" style={{ textAlign: "center" }}>결과 없음 (0행)</td></tr>
            )}
            {b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={c === "NULL" ? "subtle" : ""}><Inline text={c} /></td>)}</tr>)}
          </tbody>
        </table>
      );
  }
}
