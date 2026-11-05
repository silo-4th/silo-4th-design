import { CONCEPTS, type Material, type Section, materialToText } from "../data/materials";
import type { Tone } from "../store";
import { eulReul } from "./josa";
import { QUESTIONS, questionsFor } from "../data/questions";

export type AgentReply = { text: string; concept?: string; live: boolean };

const KEYWORDS: Record<string, string[]> = {
  agg_null: ["count", "avg", "sum", "집계", "null", "평균", "널"],
  groupby_rule: ["group by", "groupby", "그룹", "별칭", "alias", "select에"],
  where_having: ["having", "where", "해빙", "처리 순서", "거르"],
  empty_agg: ["공집합", "행이 없", "없을 때", "30번"],
  inner_join: ["inner"],
  outer_join: ["outer", "left join", "left outer"],
  join_order: ["on 조건", "on과", " on "],
  sq_return: ["서브쿼리", "any", "all", "단일 행", "다중 행", "다중 컬럼"],
  sq_position: ["스칼라", "인라인", "뷰", "view"],
  sq_corr: ["연관", "exists"],
  sq_notin: ["not in", "notin"],
  gf_rollup: ["rollup", "롤업", "소계"],
  gf_cube: ["cube", "큐브", "grouping sets", "그루핑 세트"],
  gf_pick: ["결과표", "어떤 그룹 함수", "무엇을 썼"],
  gf_grouping: ["grouping(", "grouping 함수", "grouping 값"],
  wf_rank: ["rank", "순위", "row_number", "dense_rank"],
  wf_frame: ["rows", "range", "프레임", "누적"],
  wf_order: ["lag", "lead", "first_value", "last_value"],
  wf_ratio: ["ratio_to_report", "percent_rank", "cume_dist", "ntile", "비율"],
};

/** Picks the concept a question is about, falling back to the section the learner is reading. */
export function detectConcept(text: string, section?: Section): string | undefined {
  const t = ` ${text.toLowerCase()} `;
  let best: string | undefined;
  let hits = 0;
  for (const [c, words] of Object.entries(KEYWORDS)) {
    const n = words.filter((w) => t.includes(w)).length;
    if (n > hits) [best, hits] = [c, n];
  }
  return best ?? section?.concept;
}

let liveCache: boolean | null = null;
export async function isLive() {
  if (liveCache !== null) return liveCache;
  try {
    const r = await fetch("/api/agent");
    liveCache = r.ok && (await r.json()).live === true;
  } catch {
    liveCache = false;
  }
  return liveCache;
}

export const TONES: { k: Tone; desc: string; sample: string }[] = [
  { k: "기본", desc: "친절하고 차분하게", sample: "COUNT(*)는 모든 행을 세요." },
  { k: "MZ", desc: "친구처럼 가볍고 짧게", sample: "COUNT(*)는 그냥 다 셈 ㅇㅇ" },
  { k: "선생님", desc: "차근차근 수업하듯이", sample: "COUNT(*)는 모든 행을 셉니다." },
  { k: "F감성", desc: "공감하고 응원하면서", sample: "헷갈릴 만해요, 같이 볼게요 😊" },
  { k: "T감성", desc: "결론부터 논리적으로", sample: "결론: COUNT(*)는 NULL도 셉니다." },
];

/** Tells the live model how to sound; the facts and teaching rules stay the same. */
export const TONE_GUIDE: Record<Tone, string> = {
  기본: "친절하고 차분한 해요체로 답한다.",
  MZ: "20대 친구에게 말하듯 가볍고 짧게 답한다. 음슴체(~임, ~함)와 가벼운 유행어를 조금 섞고, 이모지는 한 개 이하로 쓴다. 내용의 정확성은 그대로 지킨다.",
  선생님: "차분한 선생님처럼 합쇼체(~습니다)로 답한다. 개념, 예시, 정리 순서로 수업하듯 설명한다.",
  F감성: "먼저 학습자의 마음에 공감하고 격려한 뒤 따뜻한 해요체로 설명한다.",
  T감성: "결론부터 말하고, 짧고 논리적인 해요체로 군더더기 없이 답한다.",
};

/** Sentence endings rewritten per tone for the offline tutor, longest first so "거예요" wins over "예요". */
const ENDINGS: Partial<Record<Tone, [RegExp, string][]>> = {
  MZ: [
    [/거예요([.!?])/g, "거임$1"],
    [/이에요([.!?])/g, "임$1"],
    [/예요([.!?])/g, "임$1"],
    [/있어요([.!?])/g, "있음$1"],
    [/없어요([.!?])/g, "없음$1"],
    [/돼요([.!?])/g, "됨$1"],
    [/해요([.!?])/g, "함$1"],
    [/나와요([.!?])/g, "나옴$1"],
    [/빠져요([.!?])/g, "빠짐$1"],
    [/하세요([.!?])/g, "하셈$1"],
    // Anything else in 해요체 drops to friendly 반말: "골라요." → "골라.", "볼까요?" → "볼까?"
    [/([가-힣])(?<!세)요([.!?])/g, "$1$2"],
  ],
  선생님: [
    [/거예요([.!?])/g, "것입니다$1"],
    [/이에요([.!?])/g, "입니다$1"],
    [/예요([.!?])/g, "입니다$1"],
    [/있어요([.!?])/g, "있습니다$1"],
    [/없어요([.!?])/g, "없습니다$1"],
    [/돼요([.!?])/g, "됩니다$1"],
    [/해요([.!?])/g, "합니다$1"],
    [/나와요([.!?])/g, "나옵니다$1"],
    [/빠져요([.!?])/g, "빠집니다$1"],
    [/봐요([.!?])/g, "봅시다$1"],
    [/이래요([.!?])/g, "이렇습니다$1"],
    [/골라요([.!?])/g, "고릅니다$1"],
    [/남겨요([.!?])/g, "남깁니다$1"],
    [/사라져요([.!?])/g, "사라집니다$1"],
    [/채워요([.!?])/g, "채웁니다$1"],
    [/걸러요([.!?])/g, "거릅니다$1"],
    [/넘어가요([.!?])/g, "넘어갑시다$1"],
    [/외워요([.!?])/g, "외웁시다$1"],
    [/세요([.!?])/g, "세요$1"],
  ],
};

const TONE_WRAP: Record<Tone, { intro?: string; outro?: string }> = {
  기본: {},
  MZ: { intro: "오케이, 핵심만 바로 정리해 줌 👌", outro: "이거 시험에 진짜 자주 나옴. 꼭 챙기셈." },
  선생님: { intro: "좋은 질문입니다. 하나씩 짚어 보겠습니다.", outro: "오늘 배운 내용은 한 번 더 소리 내어 정리해 보세요." },
  F감성: { intro: "이 부분 많이들 헷갈려 해요. 지금처럼 물어보는 것 자체가 잘하고 있다는 뜻이에요 😊", outro: "천천히 해도 괜찮아요. 막히면 언제든 같이 봐요!" },
  T감성: { intro: "결론부터 말할게요." },
};

/** Reshapes an offline answer into the chosen tone without touching its facts. */
export function applyTone(text: string, tone: Tone) {
  if (tone === "기본") return text;
  let out = text;
  for (const [re, to] of ENDINGS[tone] ?? []) out = out.replace(re, to);
  if (tone === "T감성") out = out.replace(/\s*[😊👌🙂]/gu, "");
  const { intro, outro } = TONE_WRAP[tone];
  return [intro, out, outro].filter(Boolean).join("\n\n");
}

export async function askAgent(opts: {
  material: Material;
  section?: Section;
  prompt: string;
  history: { role: "user" | "assistant"; content: string }[];
  weak: string[];
  tone?: Tone;
}): Promise<AgentReply> {
  const tone = opts.tone ?? "기본";
  const concept = detectConcept(opts.prompt, opts.section);
  if (await isLive()) {
    try {
      const r = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          material: materialToText(opts.material),
          weak: opts.weak,
          tone: TONE_GUIDE[tone],
          history: opts.history,
          prompt: opts.section ? `[지금 읽는 구간: ${opts.section.title}]\n${opts.prompt}` : opts.prompt,
        }),
      });
      if (r.ok) return { text: (await r.json()).text, concept, live: true };
    } catch {
      /* fall through to the offline tutor */
    }
  }
  await new Promise((res) => setTimeout(res, 650));
  const lastAssistant = [...opts.history].reverse().find((h) => h.role === "assistant")?.content;
  const graded = gradeCheck(lastAssistant, opts.prompt);
  const text = graded ?? offline(opts.prompt, opts.material, opts.section, concept, opts.weak);
  return { text: applyTone(text, tone), concept, live: false };
}

const EXPLAIN: Record<string, { easy: string; example: string; point: string; confuse: string }> = {
  sq_return: {
    easy: "서브쿼리가 **몇 행을 돌려주는지**에 맞는 연산자를 써야 해요. 한 행이면 =, >, < 같은 비교 연산자를, 여러 행이면 IN, ANY, ALL을 써요.",
    example: "20번 부서 급여는 6000, 3500, 3000이에요. SAL > ANY(…)는 최솟값 3000보다 크면 참이라 6명, SAL > ALL(…)은 최댓값 6000보다 커야 해서 김대표 1명이 나와요.",
    point: "> ANY는 > MIN, > ALL은 > MAX로 바꿔 생각하면 대부분의 선지를 거를 수 있어요.",
    confuse: "ANY와 ALL",
  },
  sq_position: {
    easy: "서브쿼리는 들어가는 자리에 따라 이름이 달라요. **SELECT 절은 스칼라 서브쿼리**, **FROM 절은 인라인 뷰**, WHERE·HAVING 절은 중첩 서브쿼리예요.",
    example: "SALES 사원의 부서 이름을 스칼라 서브쿼리로 붙이면, 부서가 NULL인 조미정은 0행이 나와서 오류가 아니라 NULL이 돼요.",
    point: "인라인 뷰의 컬럼은 메인쿼리에서 쓸 수 있지만, WHERE 절 서브쿼리의 컬럼은 쓸 수 없어요.",
    confuse: "인라인 뷰와 중첩 서브쿼리",
  },
  sq_corr: {
    easy: "서브쿼리 안에서 메인쿼리의 컬럼을 쓰면 **연관 서브쿼리**예요. 메인쿼리의 행이 바뀔 때마다 서브쿼리가 다시 계산돼요. **EXISTS**는 결과가 한 행이라도 있으면 참이에요.",
    example: "자기 부서 평균보다 많이 받는 사원을 구하면, 10번 부서는 평균 5200과 비교해서 김대표와 이개발이 남고 최코드는 빠져요.",
    point: "NOT EXISTS로 사원이 없는 부서를 찾으면 30번 기획이 나와요. NOT EXISTS는 NULL의 영향을 받지 않아요.",
    confuse: "연관 서브쿼리와 비연관 서브쿼리",
  },
  sq_notin: {
    easy: "NOT IN은 목록의 **모든 값과 다른지**를 AND로 이어 비교해요. 목록에 NULL이 하나라도 있으면 x <> NULL이 UNKNOWN이 돼서 결과가 **0행**이 돼요.",
    example: "DEPT의 부서 번호를 NOT IN (SELECT DEPTNO FROM EMP)로 거르면, 조미정의 NULL 때문에 30번 기획도 나오지 않아요. 서브쿼리에 IS NOT NULL을 넣으면 30번이 나와요.",
    point: "NULL이 문제를 일으키는 것은 NOT IN뿐이에요. IN과 NOT EXISTS는 괜찮아요.",
    confuse: "NOT IN과 NOT EXISTS",
  },
  gf_rollup: {
    easy: "ROLLUP은 GROUP BY 결과에 **오른쪽 컬럼부터 하나씩 빼면서** 다시 집계한 소계와, 마지막에 총계를 붙여요. 컬럼이 n개면 n + 1단계예요.",
    example: "SALES에서 ROLLUP(DEPTNO, YR)은 상세 4행, 부서별 소계 330과 320, 총계 650으로 7행이에요. ROLLUP(YR, DEPTNO)는 소계가 연도별 450과 200으로 바뀌어요.",
    point: "ROLLUP(A, B)와 ROLLUP(B, A)는 결과가 달라요. 인자 순서가 소계 기준을 정해요.",
    confuse: "ROLLUP의 인자 순서",
  },
  gf_cube: {
    easy: "**CUBE**는 가능한 모든 조합(2의 n제곱)으로 묶고, **GROUPING SETS**는 괄호 안에 나열한 그룹만 묶어요. GROUPING SETS는 총계를 자동으로 붙이지 않아요.",
    example: "SALES에서 CUBE(DEPTNO, YR)는 상세, 부서별, 연도별, 총계로 9행이고, GROUPING SETS(DEPTNO, YR)는 부서별과 연도별만 4행이에요.",
    point: "GROUPING SETS에 총계를 넣으려면 빈 괄호 ()를 직접 나열해야 해요.",
    confuse: "CUBE와 GROUPING SETS",
  },
  gf_pick: {
    easy: "결과표만 보고 그룹 함수를 고를 때는 **총계 행이 있는지** 먼저 봐요. 없으면 GROUPING SETS예요. 있으면 두 번째 컬럼만의 소계가 있는지 봐서, 있으면 CUBE, 없으면 ROLLUP이에요.",
    example: "총계 650이 있고 부서별 소계(330, 320)와 연도별 소계(450, 200)가 모두 있으면 CUBE(DEPTNO, YR)예요.",
    point: "원래 데이터에 NULL이 있으면 'NULL이 보이면 소계 행'이라고 단정할 수 없어요.",
    confuse: "ROLLUP과 CUBE의 결과표",
  },
  gf_grouping: {
    easy: "**GROUPING(컬럼)**은 그 행이 해당 컬럼을 묶음에서 빼고 집계한 소계·총계 행이면 1, 원래 값으로 묶은 행이면 0이에요. 소계의 NULL과 데이터의 NULL을 가를 때 써요.",
    example: "EMP에 ROLLUP(DEPTNO)를 하면 DEPTNO가 NULL인 행이 둘 나와요. 조미정의 데이터 행은 GROUPING 0, 총계 행은 GROUPING 1이에요.",
    point: "CASE로 이름을 붙일 때는 GROUPING = 1 조건을 먼저 써야 총계가 '부서없음'으로 잘못 붙지 않아요.",
    confuse: "소계의 NULL과 데이터의 NULL",
  },
  wf_rank: {
    easy: "**RANK**는 동점 다음 순위를 건너뛰고(1, 2, 2, 4), **DENSE_RANK**는 건너뛰지 않고(1, 2, 2, 3), **ROW_NUMBER**는 동점이어도 서로 다른 번호를 붙여요.",
    example: "서인턴을 뺀 9명을 급여 높은 순으로 세우면 4000인 최코드는 RANK 4, DENSE_RANK 3이에요.",
    point: "Oracle은 NULL을 가장 큰 값으로 봐서 DESC 정렬에서 급여가 NULL인 서인턴이 1위가 돼요. 맨 뒤로 보내려면 NULLS LAST를 써요.",
    confuse: "RANK와 DENSE_RANK",
  },
  wf_frame: {
    easy: "집계 함수에 OVER를 붙이면 **프레임** 안의 행만 계산해요. ORDER BY만 쓰면 기본은 **RANGE**라서 동점 행이 같은 누적값을 받고, **ROWS**는 한 줄씩 계산해요.",
    example: "급여 낮은 순 누적합에서 3000인 윤세일은 RANGE로 8800, ROWS로 5800이에요. 동점 강신입까지 함께 넣느냐의 차이예요.",
    point: "OVER ()처럼 비워 두면 파티션 전체가 프레임이라 모든 행에 같은 합계가 붙어요.",
    confuse: "RANGE와 ROWS",
  },
  wf_order: {
    easy: "**LAG/LEAD**는 n행 앞/뒤의 값을, **FIRST_VALUE/LAST_VALUE**는 프레임의 처음/끝 값을 가져와요. 기본 프레임에서 LAST_VALUE는 현재 행 값이에요.",
    example: "10번 부서를 입사일 순으로 세우면 LEAD(SAL, 1, 0)에서 강신입은 다음 행 서인턴의 급여 NULL을, 마지막 서인턴은 기본값 0을 받아요.",
    point: "LAG/LEAD의 기본값은 값이 NULL일 때가 아니라 가리킬 행이 없을 때만 쓰여요.",
    confuse: "LEAD의 기본값과 NULL",
  },
  wf_ratio: {
    easy: "**RATIO_TO_REPORT**는 합계 대비 비율, **PERCENT_RANK**는 (순위 − 1) ÷ (행 수 − 1), **CUME_DIST**는 현재 값 이하인 행의 비율, **NTILE(n)**은 n개 그룹으로 나눈 번호예요.",
    example: "급여 있는 9명에서 한세일은 PERCENT_RANK 0.375, CUME_DIST 0.444예요. 김대표의 RATIO_TO_REPORT는 9000 ÷ 41300 = 0.218이에요.",
    point: "NTILE은 동점을 신경 쓰지 않고 행 수만으로 나눠서, 4000인 최코드와 정코드가 다른 그룹에 들어가요.",
    confuse: "PERCENT_RANK와 CUME_DIST",
  },
  agg_null: {
    easy: "출석부를 떠올려 보세요. **COUNT(*)**는 출석부에 적힌 사람 수를 세고, **COUNT(COMM)**은 그중 수당 칸에 뭔가 적힌 사람만 세요. 빈칸(NULL)은 '값이 없음'이라 집계에서 빠져요.",
    example: "EMP에서 COUNT(*)는 10, COUNT(COMM)은 3이에요. 수당이 0인 윤세일도 값이 있어서 세요. AVG(COMM)은 800 ÷ **3** = 266.7이에요. 분모에서도 NULL 행이 빠지는 게 포인트예요.",
    point: "AVG(COMM) 계산에서 분모를 10으로 잡거나, 0인 값을 NULL처럼 빼는 선지가 단골 함정이에요.",
    confuse: "COUNT(*)와 COUNT(컬럼)",
  },
  groupby_rule: {
    easy: "GROUP BY는 같은 값끼리 **바구니에 담는 것**이에요. 결과는 바구니마다 한 줄이라, SELECT에는 바구니 이름(GROUP BY 컬럼)이나 바구니 요약(집계 함수)만 쓸 수 있어요.",
    example: "부서 10 바구니에는 김대표, 이개발, 최코드 등 6명이 들어 있어요. 여기서 ENAME 하나를 고를 수 없으니 SELECT DEPTNO, ENAME ... GROUP BY DEPTNO는 오류예요.",
    point: "GROUP BY에는 SELECT 별칭을 못 써요. GROUP BY가 SELECT보다 먼저 처리되기 때문이에요.",
    confuse: "GROUP BY 컬럼과 SELECT 컬럼",
  },
  where_having: {
    easy: "**WHERE는 바구니에 담기 전에** 사람을 고르고, **HAVING은 담은 뒤에** 바구니를 골라요. 그래서 SUM(SAL) 같은 바구니 요약값으로 거르려면 HAVING을 써야 해요.",
    example: "WHERE DEPTNO = 10으로 10번 부서만 남기고, 직무별로 묶은 뒤, HAVING AVG(SAL) >= 4000으로 걸러요. 결과는 CEO(9000)와 MANAGER(6000) 두 줄이에요. DEV는 평균이 3666.7이라 빠져요.",
    point: "처리 순서 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY를 외워두면 대부분의 선지를 거를 수 있어요.",
    confuse: "WHERE와 HAVING",
  },
  empty_agg: {
    easy: "대상 행이 없을 때, **GROUP BY가 없으면** 빈 바구니 하나를 요약해서 한 줄이 나오고, **GROUP BY가 있으면** 바구니 자체가 없어서 아무 줄도 안 나와요.",
    example: "사원이 없는 30번 부서로 거르면(WHERE DEPTNO = 30) COUNT(*)는 0, SUM(SAL)은 NULL인 한 줄이 나와요. 여기에 GROUP BY DEPTNO를 붙이면 결과가 0행이에요.",
    point: "'공집합에서 COUNT는 0, 나머지 집계는 NULL'은 매 회차 나오는 선지예요.",
    confuse: "COUNT의 0과 SUM의 NULL",
  },
  inner_join: {
    easy: "INNER JOIN은 **양쪽에 짝이 있는 행만** 남겨요. 짝이 없으면 결과에서 사라져요.",
    example: "DEPT 40번(기획)은 소속 사원이 없어서 INNER JOIN 결과에 나오지 않아요.",
    point: "INNER JOIN 결과 행 수를 묻는 문제는 '짝 없는 행'부터 찾으면 빨라요.",
    confuse: "INNER JOIN과 OUTER JOIN",
  },
  outer_join: {
    easy: "LEFT OUTER JOIN은 **왼쪽 테이블은 전부 남기고**, 오른쪽에 짝이 없으면 오른쪽 칸을 NULL로 채워요.",
    example: "DEPT LEFT JOIN EMP에서 기획(40) 행은 남고 ENAME은 NULL이에요.",
    point: "어느 쪽이 '기준(왼쪽)'인지 먼저 표시하고 푸세요.",
    confuse: "LEFT와 RIGHT의 기준 테이블",
  },
  join_order: {
    easy: "OUTER JOIN에서 **ON은 붙일 때의 조건**, **WHERE는 붙인 뒤 거르는 조건**이에요.",
    example: "LEFT JOIN 뒤 WHERE E.JOB = 'DEV'를 쓰면 NULL로 채워진 기획(40) 행도 걸러져서 INNER JOIN처럼 돼요.",
    point: "오른쪽 테이블 조건을 WHERE에 쓰면 OUTER JOIN 효과가 사라진다는 선지를 조심하세요.",
    confuse: "ON 조건과 WHERE 조건",
  },
};

/** Opening line of the tutor's own check question. */
const CHECK_LEAD = "좋아요, 제가 질문할게요.";

/** When the learner answers the tutor's check question, compare their words with the question's key points. */
function gradeCheck(lastAssistant: string | undefined, answer: string) {
  if (!lastAssistant) return null;
  // Tone rewrites can change the lead line, so the question itself (bolded) is the reliable marker.
  const q = QUESTIONS.find((x) => x.type === "대화형" && lastAssistant.includes(`**${x.stem}**`));
  if (!q?.talk) return null;
  const said = answer.toLowerCase().replace(/\s+/g, "");
  const hit = q.talk.map((pt) => pt.keywords.some((k) => said.includes(k.toLowerCase().replace(/\s+/g, ""))));
  const n = hit.filter(Boolean).length;
  const lead =
    n === q.talk.length ? "완벽해요! 핵심을 모두 짚었어요." : n > 0 ? `좋아요, 핵심 ${q.talk.length}개 중 ${n}개를 짚었어요.` : "아직 핵심이 잘 드러나지 않았어요. 같이 다시 볼게요.";
  return [
    lead,
    ...q.talk.map((pt, i) => `- ${hit[i] ? "짚은 부분" : "빠진 부분"} · ${pt.label}`),
    "",
    `**모범 답안** · ${q.explanation}`,
    "",
    n === q.talk.length ? "이 개념은 확인 문제로 한 번 더 굳혀볼까요?" : "빠진 부분을 넣어서 한 번 더 설명해 보거나, 확인 문제로 넘어가 봐요.",
  ].join("\n");
}

function offline(prompt: string, m: Material, section: Section | undefined, concept: string | undefined, weak: string[]) {
  const p = prompt.replace(/\s/g, "");
  // Quick actions on an intro page still need a concept to work with: start from the unit's first one.
  const here = section?.concept ?? m.sections.find((s) => s.concept)?.concept;

  if (/핵심만|3줄/.test(p)) {
    const c = concept && EXPLAIN[concept] ? concept : here;
    if (!c) return `**${m.title}** 자료에서 핵심을 찾지 못했어요.`;
    const e = EXPLAIN[c];
    // Skip analogy openers ("출석부를 떠올려 보세요.") and lead with the sentence that names the terms.
    const first = (s: string) => {
      const parts = s.split(/(?<=[.!?])\s/);
      return (parts.find((x) => x.includes("**")) ?? parts[0]).replace(/\*\*/g, "");
    };
    return [
      `**${section?.title ?? m.title}** 핵심만 3줄로 정리했어요.`,
      `1. ${first(e.easy)}`,
      `2. ${first(e.example)}`,
      `3. 시험 포인트 · ${e.point}`,
    ].join("\n");
  }

  if (/이해했는지|확인해줘/.test(p)) {
    const c = concept && EXPLAIN[concept] ? concept : here;
    const q = c ? questionsFor(c).find((x) => x.type === "대화형") : undefined;
    if (!q) return "지금 구간에는 확인할 질문이 아직 없어요. 다른 구간으로 이동해서 다시 눌러 주세요.";
    return [CHECK_LEAD, `**${q.stem}**`, "", "보기를 고르는 대신 내 말로 설명해 보세요. 답을 보내면 핵심을 짚었는지 봐 드릴게요."].join("\n");
  }
  if (/무엇을할수|뭘할수|뭐할수|기능/.test(p))
    return [
      "저는 지금 읽는 자료를 같이 보면서 이렇게 도와요.",
      "- 드래그한 문장을 **쉽게 설명**하거나 예시로 풀어드려요",
      "- 설명이 끝나면 **짧은 확인 문제**로 진짜 이해했는지 같이 확인해요",
      "- 틀린 이유를 분류해서 **오답 기록**과 **복습 일정**에 남겨요",
      "- 다음에 다시 오면 지난번 취약 개념부터 이어서 봐요",
      "",
      "궁금한 문장을 드래그하거나, 아래 질문을 눌러 시작해 보세요.",
    ].join("\n");

  if (/요약/.test(p))
    return [
      `**${m.title}** 핵심만 정리했어요.`,
      ...m.sections.filter((s) => s.concept).map((s) => `- **${CONCEPTS[s.concept!].name}**: ${EXPLAIN[s.concept!].easy.replace(/\*\*/g, "").split(". ")[0]}.`),
      "",
      "더 자세한 암기 포인트가 필요하면 **시험 포인트 알려줘**라고 물어보세요.",
    ].join("\n");

  const quick = /예시로설명|비교해줘/.test(p);
  const c = concept && EXPLAIN[concept] ? concept : quick ? here : section?.concept;
  if (!c) {
    if (section?.id === "intro")
      return `지금은 **${m.title}** 인트로예요. 이 단원은 ${m.sections
        .filter((s) => s.concept)
        .map((s) => CONCEPTS[s.concept!].name)
        .join(", ")}을 다뤄요.\n\n${weak.length ? `지난 기록을 보면 **${weak[0]}**이 아직 불안해요. 해당 구간부터 보면 좋아요.` : "첫 구간부터 차근차근 읽어볼까요?"}`;
    return "이 질문은 지금 자료에서 근거를 찾기 어려워요. 자료 속 문장을 드래그해서 물어보면 더 정확하게 설명할 수 있어요.";
  }
  const e = EXPLAIN[c];
  const name = CONCEPTS[c].name;
  const wantsExample = /예시|예를|example/.test(p);
  const wantsPoint = /시험|포인트|출제/.test(p);
  const wantsCompare = /비교|차이|다른/.test(p);
  const lines = [wantsExample ? e.example : wantsPoint ? `**시험 포인트** · ${e.point}` : wantsCompare ? `**${e.confuse}**${eulReul(e.confuse).slice(e.confuse.length)} 비교하면 이래요.\n${e.easy}` : e.easy];
  if (!wantsExample) lines.push("", `예를 들면, ${e.example}`);
  if (weak.includes(name)) lines.push("", `지난번에 **${name}**에서 틀린 적이 있어요. 이번엔 확인 문제로 꼭 짚고 넘어가요.`);
  return lines.join("\n");
}

export function summaryOf(m: Material) {
  return m.sections
    .filter((s) => s.concept && EXPLAIN[s.concept])
    .map((s) => ({ section: s, concept: CONCEPTS[s.concept!].name, ...EXPLAIN[s.concept!] }));
}
