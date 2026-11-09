import { MORE_MATERIALS } from "./moreMaterials";

export type Block =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ol"; items: string[] }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][]; caption?: string }
  | { kind: "code"; text: string }
  | { kind: "callout"; text: string };

export type Section = { id: string; title: string; concept?: string; blocks: Block[] };

export type Material = {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  minutes: number;
  sections: Section[];
};

export const EXAM = {
  name: "SQLD",
  round: "제63회",
  date: "2026-11-14",
  passLine: 60,
  cutLine: 40,
  subjects: [
    { name: "1과목 · 데이터 모델링의 이해", questions: 10, weight: 20 },
    { name: "2과목 · SQL 기본 및 활용", questions: 40, weight: 80 },
  ],
};

export const CONCEPTS: Record<string, { name: string; material: string }> = {
  agg_null: { name: "집계 함수와 NULL", material: "groupby" },
  groupby_rule: { name: "GROUP BY 규칙", material: "groupby" },
  where_having: { name: "WHERE와 HAVING", material: "groupby" },
  empty_agg: { name: "공집합 집계", material: "groupby" },
  inner_join: { name: "INNER JOIN", material: "join" },
  outer_join: { name: "OUTER JOIN", material: "join" },
  join_order: { name: "JOIN과 WHERE 적용 순서", material: "join" },
  sq_return: { name: "서브쿼리 반환 결과", material: "subquery" },
  sq_position: { name: "서브쿼리 위치와 뷰", material: "subquery" },
  sq_corr: { name: "연관 서브쿼리와 EXISTS", material: "subquery" },
  sq_notin: { name: "NOT IN과 NULL", material: "subquery" },
  gf_rollup: { name: "ROLLUP과 인자 순서", material: "groupfn" },
  gf_cube: { name: "CUBE와 GROUPING SETS", material: "groupfn" },
  gf_pick: { name: "결과표로 그룹 함수 고르기", material: "groupfn" },
  gf_grouping: { name: "GROUPING 함수", material: "groupfn" },
  wf_rank: { name: "순위 함수", material: "window" },
  wf_frame: { name: "집계 윈도우 함수와 프레임", material: "window" },
  wf_order: { name: "행 순서 함수", material: "window" },
  wf_ratio: { name: "비율 함수", material: "window" },
};

const EMP_TABLE: Block = {
  kind: "table",
  caption: "EMP",
  head: ["ENAME (이름)", "JOB (직무)", "SAL (급여)", "COMM (수당)", "DEPTNO (부서)"],
  rows: [
    ["김대표", "CEO", "9000", "NULL", "10"],
    ["이개발", "MANAGER", "6000", "NULL", "10"],
    ["박영업", "MANAGER", "6000", "500", "20"],
    ["최코드", "DEV", "4000", "NULL", "10"],
    ["정코드", "DEV", "4000", "NULL", "10"],
    ["한세일", "SALES", "3500", "300", "20"],
    ["윤세일", "SALES", "3000", "0", "20"],
    ["강신입", "DEV", "3000", "NULL", "10"],
    ["조미정", "SALES", "2800", "NULL", "NULL"],
    ["서인턴", "DEV", "NULL", "NULL", "10"],
  ],
};

export const MATERIALS: Material[] = [
  {
    id: "groupby",
    title: "GROUP BY와 HAVING",
    subject: "2과목 · SQL 기본 및 활용",
    chapter: "2장 3절",
    minutes: 25,
    sections: [
      {
        id: "intro",
        title: "인트로",
        blocks: [
          { kind: "h2", text: "이 단원에서 배우는 것" },
          {
            kind: "ul",
            items: [
              "COUNT(*)와 COUNT(컬럼)이 왜 서로 다른 값을 내는지 설명할 수 있어요.",
              "GROUP BY를 쓸 때 SELECT에 무엇을 쓸 수 있고 무엇을 쓸 수 없는지 구분할 수 있어요.",
              "WHERE와 HAVING이 각각 언제 행을 거르는지 처리 순서로 설명할 수 있어요.",
              "조건에 맞는 행이 하나도 없을 때 결과가 0인지, NULL인지, 아예 나오지 않는지 예측할 수 있어요.",
            ],
          },
          { kind: "h2", text: "개념 한눈에 보기" },
          {
            kind: "table",
            head: ["개념", "한 줄 정리"],
            rows: [
              ["집계 함수와 NULL", "COUNT(*)만 NULL이 있는 행도 세요. 나머지 집계 함수는 NULL을 빼고 계산해요"],
              ["GROUP BY 규칙", "같은 값끼리 묶어서 그룹마다 한 행을 만들어요. SELECT에는 묶은 컬럼과 집계 함수만 쓸 수 있어요"],
              ["WHERE와 HAVING", "WHERE는 묶기 전에 행을 거르고, HAVING은 묶은 뒤에 그룹을 걸러요"],
              ["공집합 집계", "대상 행이 없을 때, GROUP BY가 없으면 한 행이 나오고 GROUP BY가 있으면 아무 행도 나오지 않아요"],
            ],
          },
          { kind: "h2", text: "이 단원에서 쓰는 데이터" },
          { kind: "p", text: "이 단원의 예제는 모두 사원 테이블 `EMP`를 써요. 아래는 이 단원에 필요한 컬럼만 뽑은 거예요." },
          EMP_TABLE,
          { kind: "p", text: "시험에 자주 나오는 함정이 데이터에 일부러 들어 있어요. 아래 세 사람을 기억해 두면 예제를 따라가기 쉬워요." },
          {
            kind: "ul",
            items: [
              "**서인턴**은 급여(SAL)가 NULL이에요. 아직 급여가 정해지지 않았다고 생각하면 돼요.",
              "**윤세일**은 수당(COMM)이 0이에요. NULL과 달리 0은 \"값이 있다\"는 뜻이에요.",
              "**조미정**은 부서(DEPTNO)가 NULL이에요. 아직 부서에 배치되지 않았어요.",
            ],
          },
          { kind: "p", text: "부서 30(기획)도 있지만, 30번 부서에 속한 사원은 한 명도 없어요." },
        ],
      },
      {
        id: "agg",
        title: "1. 집계 함수와 NULL",
        concept: "agg_null",
        blocks: [
          { kind: "p", text: "집계 함수는 여러 행을 받아서 값 하나로 돌려주는 함수예요. COUNT, SUM, AVG, MAX, MIN이 대표적이에요." },
          { kind: "p", text: "규칙은 하나만 기억하면 돼요. **COUNT(*)를 빼면 모든 집계 함수가 NULL을 무시해요.** COUNT(*)는 \"행이 몇 개인가\"를 세기 때문에, 값이 NULL이어도 행이 있으면 세요." },
          { kind: "p", text: "먼저 개수를 세 볼게요." },
          { kind: "code", text: "SELECT COUNT(*)            AS C_ALL,\n       COUNT(SAL)          AS C_SAL,\n       COUNT(COMM)         AS C_COMM,\n       COUNT(DISTINCT JOB) AS C_JOB\nFROM EMP;" },
          { kind: "table", head: ["C_ALL", "C_SAL", "C_COMM", "C_JOB"], rows: [["10", "9", "3", "4"]] },
          { kind: "p", text: "하나씩 따라가 볼게요." },
          {
            kind: "ol",
            items: [
              "`COUNT(*)`는 행 수예요. 사원이 10명이라 10이에요.",
              "`COUNT(SAL)`은 SAL이 NULL이 아닌 행만 세요. 서인턴이 빠져서 9예요.",
              "`COUNT(COMM)`은 COMM이 NULL이 아닌 행만 세요. 박영업(500), 한세일(300), 윤세일(0)이 남아서 3이에요. **0은 NULL이 아니라서 세요.**",
              "`COUNT(DISTINCT JOB)`은 겹치지 않는 직무 수예요. CEO, MANAGER, DEV, SALES로 4예요.",
            ],
          },
          { kind: "p", text: "이번에는 합계와 평균을 구해 볼게요." },
          { kind: "code", text: "SELECT SUM(COMM)            AS S_COMM,\n       ROUND(AVG(COMM), 1)  AS A_COMM,\n       AVG(NVL(COMM, 0))    AS A_NVL\nFROM EMP;" },
          { kind: "table", head: ["S_COMM", "A_COMM", "A_NVL"], rows: [["800", "266.7", "80"]] },
          {
            kind: "ol",
            items: [
              "`SUM(COMM)`은 NULL을 빼고 더해요. 500 + 300 + 0 = 800이에요.",
              "`AVG(COMM)`은 나누는 수에서도 NULL을 빼요. 그래서 10으로 나누지 않고, 값이 있는 3명으로 나눠요. 800 ÷ 3 = 266.7이에요.",
              "`NVL(COMM, 0)`은 NULL을 0으로 바꿔요. 그러면 10명 모두 값이 생겨서 800 ÷ 10 = 80이 돼요. \"수당이 없는 사람도 0으로 치고 평균을 내고 싶다\"면 이렇게 써요.",
            ],
          },
        ],
      },
      {
        id: "group",
        title: "2. GROUP BY 규칙",
        concept: "groupby_rule",
        blocks: [
          { kind: "p", text: "GROUP BY는 지정한 컬럼의 값이 같은 행끼리 묶어서, **그룹마다 한 행**을 만들어요. 부서별 인원과 급여를 구해 볼게요." },
          { kind: "code", text: "SELECT DEPTNO,\n       COUNT(*)            AS CNT,\n       SUM(SAL)            AS SUM_SAL,\n       ROUND(AVG(SAL), 1)  AS AVG_SAL\nFROM EMP\nGROUP BY DEPTNO\nORDER BY DEPTNO;" },
          { kind: "table", head: ["DEPTNO", "CNT", "SUM_SAL", "AVG_SAL"], rows: [["10", "6", "26000", "5200"], ["20", "3", "12500", "4166.7"], ["NULL", "1", "2800", "2800"]] },
          {
            kind: "ol",
            items: [
              "10번 부서는 6명이에요. 그런데 평균은 26000 ÷ 6이 아니라 26000 ÷ 5 = 5200이에요. 서인턴의 급여가 NULL이라서 나누는 수에서 빠졌어요.",
              "부서가 NULL인 조미정은 버려지지 않아요. GROUP BY는 NULL끼리도 같은 그룹으로 묶기 때문에, **NULL 그룹**이 한 행 생겨요.",
              "30번 부서는 결과에 나오지 않아요. EMP에 30번 부서 사원이 한 명도 없어서 묶을 행이 없기 때문이에요.",
            ],
          },
          { kind: "h3", text: "SELECT에 쓸 수 있는 것" },
          { kind: "p", text: "그룹이 한 행으로 줄었기 때문에, SELECT에는 그룹마다 값이 하나로 정해지는 것만 쓸 수 있어요." },
          { kind: "table", head: ["쓸 수 있어요", "쓸 수 없어요"], rows: [["GROUP BY에 쓴 컬럼 (DEPTNO)", "GROUP BY에 쓰지 않은 컬럼 (ENAME)"], ["집계 함수 (COUNT, SUM 등)", ""], ["상수 (예: 'A')", ""]] },
          { kind: "p", text: "예를 들어 아래 SQL은 오류가 나요. 10번 부서에는 김대표, 이개발, 최코드 등 6명이 있는데, 한 행에 이름을 하나만 보여 줄 수는 없기 때문이에요." },
          { kind: "code", text: "-- 오류 (ORA-00979)\nSELECT DEPTNO, ENAME\nFROM EMP\nGROUP BY DEPTNO;" },
          { kind: "p", text: "또 하나 자주 나오는 함정이 있어요. **GROUP BY에는 SELECT에서 붙인 별칭을 쓸 수 없어요.** SQL은 GROUP BY를 SELECT보다 먼저 처리하기 때문에, GROUP BY를 처리하는 시점에는 아직 별칭이 없어요." },
          { kind: "code", text: "-- 오류: D라는 별칭은 아직 없어요\nSELECT DEPTNO AS D, COUNT(*)\nFROM EMP\nGROUP BY D;" },
        ],
      },
      {
        id: "having",
        title: "3. WHERE와 HAVING",
        concept: "where_having",
        blocks: [
          { kind: "p", text: "WHERE와 HAVING은 둘 다 조건을 걸지만, **거르는 시점**이 달라요. SQL은 아래 순서로 처리돼요." },
          { kind: "table", head: ["순서", "절", "하는 일"], rows: [["1", "FROM", "테이블을 가져와요"], ["2", "**WHERE**", "행을 걸러요 (묶기 전)"], ["3", "GROUP BY", "그룹으로 묶어요"], ["4", "**HAVING**", "그룹을 걸러요 (묶은 뒤)"], ["5", "SELECT", "보여 줄 컬럼을 골라요"], ["6", "ORDER BY", "정렬해요"]] },
          { kind: "p", text: "WHERE를 처리하는 시점에는 아직 그룹이 없어서 SUM이나 AVG 값도 없어요. 그래서 **집계 함수를 쓰는 조건은 WHERE에 쓸 수 없고, HAVING에 써야 해요.** WHERE에 쓰면 ORA-00934 오류가 나요." },
          { kind: "p", text: "두 조건을 함께 써 볼게요. \"10번 부서에서, 직무별 평균 급여가 4000 이상인 직무\"를 구하는 SQL이에요." },
          { kind: "code", text: "SELECT JOB, AVG(SAL) AS AVG_SAL\nFROM EMP\nWHERE DEPTNO = 10          -- ① 10번 부서 행만\nGROUP BY JOB               -- ② 직무별로 묶기\nHAVING AVG(SAL) >= 4000    -- ③ 평균 4000 이상만\nORDER BY JOB;" },
          { kind: "table", head: ["JOB", "AVG_SAL"], rows: [["CEO", "9000"], ["MANAGER", "6000"]] },
          {
            kind: "ol",
            items: [
              "**WHERE:** 10번 부서 6명만 남아요. 박영업도 MANAGER지만 20번 부서라서 여기서 빠져요.",
              "**GROUP BY:** 남은 6명을 직무로 묶어요. CEO는 김대표(9000), MANAGER는 이개발(6000), DEV는 최코드(4000), 정코드(4000), 강신입(3000), 서인턴(NULL)이에요.",
              "**HAVING:** DEV의 평균은 서인턴을 빼고 11000 ÷ 3 = 3666.7이에요. 4000보다 작아서 빠지고, CEO와 MANAGER만 남아요.",
            ],
          },
          { kind: "p", text: "**GROUP BY 없이 HAVING만 쓰면** 테이블 전체가 그룹 하나가 돼요." },
          { kind: "code", text: "SELECT COUNT(*) AS CNT, MAX(SAL) AS MX\nFROM EMP\nHAVING MAX(SAL) > 5000;" },
          { kind: "table", head: ["CNT", "MX"], rows: [["10", "9000"]] },
          { kind: "p", text: "전체에서 가장 높은 급여가 9000이라서 조건을 통과하고, 한 행이 나와요. 조건을 `COUNT(*) > 100`으로 바꾸면 그룹 하나가 통째로 빠져서 아무 행도 나오지 않아요." },
        ],
      },
      {
        id: "empty",
        title: "4. 공집합 집계",
        concept: "empty_agg",
        blocks: [
          { kind: "p", text: "공집합은 조건에 맞는 행이 하나도 없는 경우를 말해요. 시험에 자주 나오는 주제예요. 사원이 없는 30번 부서로 확인해 볼게요." },
          { kind: "h3", text: "GROUP BY가 없을 때" },
          { kind: "code", text: "SELECT COUNT(*)   AS CNT,\n       COUNT(SAL) AS CNT_SAL,\n       SUM(SAL)   AS SUM_SAL,\n       MAX(SAL)   AS MAX_SAL\nFROM EMP\nWHERE DEPTNO = 30;" },
          { kind: "table", head: ["CNT", "CNT_SAL", "SUM_SAL", "MAX_SAL"], rows: [["0", "0", "NULL", "NULL"]] },
          { kind: "p", text: "GROUP BY가 없으면 \"전체가 그룹 하나\"예요. 그래서 대상 행이 0개여도 결과는 **한 행**이 나와요. COUNT는 셀 것이 없으니 0이고, SUM과 MAX는 계산할 값이 없으니 NULL이에요." },
          { kind: "h3", text: "GROUP BY가 있을 때" },
          { kind: "code", text: "SELECT DEPTNO, COUNT(*) AS CNT\nFROM EMP\nWHERE DEPTNO = 30\nGROUP BY DEPTNO;" },
          { kind: "table", head: ["DEPTNO", "CNT"], rows: [] },
          { kind: "p", text: "결과가 **0행**이에요. 묶을 행이 없어서 그룹 자체가 만들어지지 않았어요. 그래서 \"CNT가 0인 행\"도 나오지 않아요." },
          { kind: "h3", text: "NULL 대신 0을 받고 싶을 때" },
          { kind: "table", head: ["SQL", "결과", "이유"], rows: [["`NVL(SUM(SAL), 0)`", "0", "SUM 결과인 NULL을 0으로 바꿔요"], ["`SUM(NVL(SAL, 0))`", "NULL", "0으로 바꿀 행 자체가 없어서, SUM은 여전히 NULL이에요"]] },
          { kind: "p", text: "NVL을 SUM의 **바깥**에 써야 0을 받을 수 있어요." },
        ],
      },
      {
        id: "myths",
        title: "자주 하는 오해",
        blocks: [
          {
            kind: "table",
            head: ["오해", "실제"],
            rows: [
              ["AVG(COMM)은 전체 인원으로 나눈다", "값이 있는 행 수로 나눠요. 800 ÷ 10이 아니라 800 ÷ 3 = 266.7이에요"],
              ["COUNT(COMM)은 0도 빼고 센다", "0은 값이에요. NULL만 빠져요. 그래서 윤세일도 세요"],
              ["SUM(SAL + COMM)과 SUM(SAL) + SUM(COMM)은 같다", "달라요. COMM이 NULL인 사원은 SAL + COMM도 NULL이 돼서 통째로 빠져요"],
              ["집계 함수 조건도 WHERE에 쓸 수 있다", "WHERE를 처리할 때는 아직 집계 값이 없어요. HAVING에 써야 해요"],
              ["행이 없으면 SUM은 0이다", "NULL이에요. GROUP BY가 있으면 아예 행이 나오지 않아요"],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "join",
    title: "JOIN 기본",
    subject: "2과목 · SQL 기본 및 활용",
    chapter: "2장 5절",
    minutes: 45,
    sections: [
      {
        "id": "intro",
        "title": "인트로",
        "blocks": [
          {
            "kind": "h2",
            "text": "이 단원에서 배우는 것"
          },
          {
            "kind": "ul",
            "items": [
              "EQUI JOIN과 NON-EQUI JOIN의 차이를 설명하고, 조인 키가 NULL이거나 범위에 맞지 않는 행이 왜 빠지는지 설명할 수 있어요.",
              "테이블 N개를 조인할 때 필요한 최소 조인 조건 수(N−1)를 알고, 조건이 빠졌을 때 늘어나는 행 수를 계산할 수 있어요.",
              "Oracle `(+)` 문법에서 `(+)`의 위치를 보고 어느 쪽 행이 모두 남는지 예측할 수 있어요.",
              "INNER, CROSS, NATURAL, USING, ON 조인의 문법 규칙(접두사, SELECT * 컬럼 수)을 설명할 수 있어요.",
              "LEFT / RIGHT / FULL OUTER JOIN의 결과 행 수를 예측할 수 있어요.",
              "OUTER JOIN에서 조건을 ON에 둘 때와 WHERE에 둘 때 결과가 어떻게 달라지는지 예측할 수 있어요."
            ]
          },
          {
            "kind": "h2",
            "text": "개념 한눈에 보기"
          },
          {
            "kind": "table",
            "head": [
              "개념",
              "한 줄 정리"
            ],
            "rows": [
              [
                "EQUI JOIN (등가 조인)",
                "두 테이블의 컬럼 값이 `=`로 같은 행끼리 붙여요. 조인 키가 NULL인 행은 빠져요"
              ],
              [
                "NON-EQUI JOIN (비등가 조인)",
                "`=`가 아니라 BETWEEN, >, < 같은 조건으로 붙여요. 급여 등급 테이블이 대표 예예요"
              ],
              [
                "조인 조건 N−1개와 카테시안 곱",
                "테이블 N개는 조인 조건이 최소 N−1개 필요해요. 빠지면 행 수가 곱으로 늘어나요"
              ],
              [
                "Oracle (+) OUTER JOIN",
                "NULL로 채워질 쪽 컬럼에 `(+)`를 붙이면, 반대쪽 행이 모두 남아요. Oracle 전용 문법이에요"
              ],
              [
                "INNER JOIN, CROSS JOIN과 ON 절",
                "표준 문법은 FROM 절에 `JOIN … ON 조건`을 써요. CROSS JOIN은 모든 조합을 만들어요"
              ],
              [
                "NATURAL JOIN과 USING 절",
                "이름이 같은 컬럼으로 조인해요. 공통 컬럼은 결과에 한 번만 나오고, 접두사를 붙일 수 없어요"
              ],
              [
                "LEFT / RIGHT / FULL OUTER JOIN",
                "기준 쪽 행은 짝이 없어도 남기고, 반대쪽을 NULL로 채워요. FULL은 양쪽 모두 남겨요"
              ],
              [
                "OUTER JOIN에서 ON과 WHERE",
                "안쪽 테이블 조건을 ON에 두면 기준 행이 남고, WHERE에 두면 NULL 행이 지워져 INNER JOIN처럼 돼요"
              ]
            ]
          },
          {
            "kind": "h2",
            "text": "이 단원에서 쓰는 데이터"
          },
          {
            "kind": "p",
            "text": "이 단원에서는 테이블 세 개를 써요. 아래는 이 단원에 필요한 컬럼만 뽑은 거예요."
          },
          {
            "kind": "h3",
            "text": "부서 테이블 `DEPT`"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO (부서 번호)",
              "DNAME (부서 이름)",
              "LOC (위치)"
            ],
            "rows": [
              [
                "10",
                "개발",
                "서울"
              ],
              [
                "20",
                "영업",
                "부산"
              ],
              [
                "30",
                "기획",
                "서울"
              ]
            ]
          },
          {
            "kind": "h3",
            "text": "사원 테이블 `EMP`"
          },
          {
            "kind": "table",
            "head": [
              "EMPNO (사원 번호)",
              "ENAME (이름)",
              "SAL (급여)",
              "DEPTNO (부서)"
            ],
            "rows": [
              [
                "1001",
                "김대표",
                "9000",
                "10"
              ],
              [
                "1002",
                "이개발",
                "6000",
                "10"
              ],
              [
                "1003",
                "박영업",
                "6000",
                "20"
              ],
              [
                "1004",
                "최코드",
                "4000",
                "10"
              ],
              [
                "1005",
                "정코드",
                "4000",
                "10"
              ],
              [
                "1006",
                "한세일",
                "3500",
                "20"
              ],
              [
                "1007",
                "윤세일",
                "3000",
                "20"
              ],
              [
                "1008",
                "강신입",
                "3000",
                "10"
              ],
              [
                "1009",
                "조미정",
                "2800",
                "NULL"
              ],
              [
                "1010",
                "서인턴",
                "NULL",
                "10"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "EMP에는 이 밖에도 JOB(직무), MGR(상사 번호), HIREDATE(입사일), COMM(수당) 컬럼이 있어요. EMP는 모두 8개 컬럼이고, DEPT는 3개 컬럼이에요. 이 숫자는 6번 설명에서 다시 써요."
          },
          {
            "kind": "h3",
            "text": "급여 등급 테이블 `SALGRADE`"
          },
          {
            "kind": "table",
            "head": [
              "GRADE (등급)",
              "LOSAL (최저 급여)",
              "HISAL (최고 급여)"
            ],
            "rows": [
              [
                "1",
                "0",
                "2999"
              ],
              [
                "2",
                "3000",
                "3999"
              ],
              [
                "3",
                "4000",
                "5999"
              ],
              [
                "4",
                "6000",
                "9999"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "조인 결과의 행 수를 바꾸는 함정이 데이터에 일부러 들어 있어요. 아래 세 가지를 기억해 두면 예제를 따라가기 쉬워요."
          },
          {
            "kind": "ul",
            "items": [
              "**조미정**은 부서(DEPTNO)가 NULL이에요. 어느 부서와도 짝이 맞지 않아요.",
              "**서인턴**은 급여(SAL)가 NULL이에요. 어느 급여 등급에도 들어가지 않아요.",
              "**30번 기획** 부서에는 사원이 한 명도 없어요. EMP 쪽에 짝이 없어요."
            ]
          }
        ]
      },
      {
        "id": "equi",
        "title": "1. EQUI JOIN (등가 조인)",
        "blocks": [
          {
            "kind": "p",
            "text": "조인(JOIN)은 여러 테이블의 행을 조건에 맞춰 옆으로 이어 붙이는 거예요. 1번부터 4번까지는 Oracle의 전통 문법으로 배워요. 전통 문법은 FROM에 테이블을 쉼표로 나열하고, 조인 조건을 WHERE에 써요."
          },
          {
            "kind": "p",
            "text": "조인 조건이 `=`이면 EQUI JOIN(등가 조인)이라고 해요. 보통 한 테이블의 기본키(PK)와 다른 테이블의 외래키(FK)를 연결해요. 여기서는 EMP.DEPTNO(외래키)와 DEPT.DEPTNO(기본키)를 연결해요."
          },
          {
            "kind": "code",
            "text": "SELECT E.ENAME, E.DEPTNO, D.DNAME\nFROM EMP E, DEPT D\nWHERE E.DEPTNO = D.DEPTNO\nORDER BY E.EMPNO;"
          },
          {
            "kind": "p",
            "text": "`EMP E`의 E는 테이블 별칭이에요. 별칭을 붙이면 `E.DEPTNO`처럼 어느 테이블의 컬럼인지 짧게 적을 수 있어요."
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "DEPTNO",
              "DNAME"
            ],
            "rows": [
              [
                "김대표",
                "10",
                "개발"
              ],
              [
                "이개발",
                "10",
                "개발"
              ],
              [
                "박영업",
                "20",
                "영업"
              ],
              [
                "최코드",
                "10",
                "개발"
              ],
              [
                "정코드",
                "10",
                "개발"
              ],
              [
                "한세일",
                "20",
                "영업"
              ],
              [
                "윤세일",
                "20",
                "영업"
              ],
              [
                "강신입",
                "10",
                "개발"
              ],
              [
                "서인턴",
                "10",
                "개발"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "결과는 9행이에요. 하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "EMP의 10행 하나하나에 대해 DEPTNO가 같은 DEPT 행을 찾아요. 10번 부서 사원 6명은 '개발'에, 20번 부서 사원 3명은 '영업'에 붙어요.",
              "조미정은 DEPTNO가 NULL이에요. `NULL = 10`은 참(TRUE)이 아니라 UNKNOWN(알 수 없음)이 돼요. 조건이 참인 행만 남기 때문에 조미정은 어느 부서와도 붙지 않고 빠져요.",
              "30번 기획 부서는 DEPTNO가 30인 사원이 없어서 결과에 나오지 않아요.",
              "그래서 사원 10명이 아니라 9행이에요. 서인턴은 급여가 NULL이지만, 이번 조인은 급여를 쓰지 않으니 그대로 남아요."
            ]
          }
        ]
      },
      {
        "id": "nonequi",
        "title": "2. NON-EQUI JOIN (비등가 조인)",
        "blocks": [
          {
            "kind": "p",
            "text": "두 테이블에 같은 값이 없어서 \"범위 안에 드는지\"로 연결해야 할 때가 있어요. 이렇게 `=`가 아닌 조건(BETWEEN, >, < 등)으로 붙이는 조인을 NON-EQUI JOIN(비등가 조인)이라고 해요."
          },
          {
            "kind": "p",
            "text": "SALGRADE에는 등급별 급여 구간(LOSAL ~ HISAL)만 있고, EMP의 급여와 똑같은 값은 없어요. 그래서 `=`로는 붙일 수 없고, BETWEEN으로 붙여요."
          },
          {
            "kind": "code",
            "text": "SELECT E.ENAME, E.SAL, S.GRADE\nFROM EMP E, SALGRADE S\nWHERE E.SAL BETWEEN S.LOSAL AND S.HISAL\nORDER BY E.EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "SAL",
              "GRADE"
            ],
            "rows": [
              [
                "김대표",
                "9000",
                "4"
              ],
              [
                "이개발",
                "6000",
                "4"
              ],
              [
                "박영업",
                "6000",
                "4"
              ],
              [
                "최코드",
                "4000",
                "3"
              ],
              [
                "정코드",
                "4000",
                "3"
              ],
              [
                "한세일",
                "3500",
                "2"
              ],
              [
                "윤세일",
                "3000",
                "2"
              ],
              [
                "강신입",
                "3000",
                "2"
              ],
              [
                "조미정",
                "2800",
                "1"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "김대표의 급여 9000은 6000 ~ 9999 구간에 들어가서 GRADE 4가 돼요.",
              "윤세일의 급여 3000은 2등급의 최저 급여(LOSAL)와 같아요. BETWEEN은 양 끝 값을 포함하기 때문에 3000 ~ 3999 구간인 GRADE 2가 돼요.",
              "조미정은 부서가 없지만 급여 2800이 있어서 GRADE 1로 붙어요. 이번 조인은 DEPTNO를 쓰지 않기 때문이에요.",
              "서인턴은 급여가 NULL이라 `NULL BETWEEN 0 AND 2999`가 UNKNOWN이 돼요. 어느 등급과도 붙지 않고 빠져요.",
              "그래서 이번에도 9행이에요. 하지만 1번 예제에서는 조미정이 빠졌고, 이번에는 서인턴이 빠졌어요. 빠지는 사람이 조인 조건에 따라 달라져요."
            ]
          },
          {
            "kind": "p",
            "text": "등급 구간이 서로 겹치지 않기 때문에, 사원 한 명은 등급 하나에만 붙어요. 그래서 NON-EQUI JOIN이라고 해서 행이 늘어나는 것은 아니에요. 행 수는 데이터에 따라 달라져요."
          }
        ]
      },
      {
        "id": "cartesian",
        "title": "3. 조인 조건 N−1개와 카테시안 곱",
        "blocks": [
          {
            "kind": "p",
            "text": "테이블 2개는 조인 조건 1개로 이어져요. 테이블이 3개면 사슬처럼 이어야 하니 조건이 2개 필요해요. 이렇게 테이블이 N개면 조인 조건은 **최소 N−1개**가 필요해요."
          },
          {
            "kind": "p",
            "text": "조건이 하나라도 빠지면, 그 테이블의 행은 다른 테이블의 모든 행과 하나씩 짝지어져요. 이것을 카테시안 곱(Cartesian Product)이라고 해요. 카테시안 곱의 행 수는 각 테이블 행 수를 곱한 값이에요."
          },
          {
            "kind": "p",
            "text": "먼저 테이블 3개를 조건 2개로 바르게 조인해 볼게요."
          },
          {
            "kind": "code",
            "text": "-- 테이블 3개, 조건 2개 (N-1 = 2)\nSELECT E.ENAME, D.DNAME, S.GRADE\nFROM EMP E, DEPT D, SALGRADE S\nWHERE E.DEPTNO = D.DEPTNO\n  AND E.SAL BETWEEN S.LOSAL AND S.HISAL\nORDER BY E.EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "DNAME",
              "GRADE"
            ],
            "rows": [
              [
                "김대표",
                "개발",
                "4"
              ],
              [
                "이개발",
                "개발",
                "4"
              ],
              [
                "박영업",
                "영업",
                "4"
              ],
              [
                "최코드",
                "개발",
                "3"
              ],
              [
                "정코드",
                "개발",
                "3"
              ],
              [
                "한세일",
                "영업",
                "2"
              ],
              [
                "윤세일",
                "영업",
                "2"
              ],
              [
                "강신입",
                "개발",
                "2"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "첫 번째 조건 `E.DEPTNO = D.DEPTNO`에서 부서가 NULL인 조미정이 빠져요.",
              "두 번째 조건 `E.SAL BETWEEN …`에서 급여가 NULL인 서인턴이 빠져요.",
              "두 사람이 빠져서 8행이에요."
            ]
          },
          {
            "kind": "p",
            "text": "이번에는 조건을 빼 볼게요. 먼저 EMP와 DEPT를 조건 없이 조인해요."
          },
          {
            "kind": "code",
            "text": "SELECT COUNT(*) AS CNT\nFROM EMP E, DEPT D;"
          },
          {
            "kind": "table",
            "head": [
              "CNT"
            ],
            "rows": [
              [
                "30"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "다음은 테이블 3개에 조건을 1개만 쓴 경우예요."
          },
          {
            "kind": "code",
            "text": "SELECT COUNT(*) AS CNT\nFROM EMP E, DEPT D, SALGRADE S\nWHERE E.DEPTNO = D.DEPTNO;"
          },
          {
            "kind": "table",
            "head": [
              "CNT"
            ],
            "rows": [
              [
                "36"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "첫 번째 쿼리는 조인 조건이 없어요. EMP 10행 각각이 DEPT 3행 모두와 짝지어져서 10 × 3 = 30행이에요.",
              "두 번째 쿼리는 EMP와 DEPT 사이에만 조건이 있어요. 이 둘은 1번 예제처럼 9행으로 이어져요.",
              "그런데 SALGRADE에는 아무 조건이 없어요. 그래서 9행 각각이 SALGRADE 4행 모두와 짝지어져 9 × 4 = 36행이 돼요."
            ]
          }
        ]
      },
      {
        "id": "oracle",
        "title": "4. Oracle (+) OUTER JOIN",
        "blocks": [
          {
            "kind": "p",
            "text": "1번 EQUI JOIN에서는 짝이 없는 행(30번 기획, 조미정)이 사라졌어요. 짝이 없어도 한쪽 테이블의 행을 모두 남기는 조인을 OUTER JOIN(외부 조인)이라고 해요. 짝이 없는 자리는 NULL로 채워요."
          },
          {
            "kind": "p",
            "text": "Oracle 전통 문법에서는 **값이 없어서 NULL로 채워질 쪽** 컬럼에 `(+)`를 붙여요. \"모자란 쪽에 (+)를 붙인다\"고 기억하면 돼요. `(+)`가 **붙지 않은 쪽**의 행이 모두 남아요."
          },
          {
            "kind": "code",
            "text": "SELECT D.DEPTNO, D.DNAME, E.ENAME\nFROM DEPT D, EMP E\nWHERE D.DEPTNO = E.DEPTNO(+)\nORDER BY D.DEPTNO, E.EMPNO;"
          },
          {
            "kind": "p",
            "text": "`E.DEPTNO(+)`는 \"EMP 쪽 값이 모자랄 수 있다\"는 뜻이에요. 그래서 반대쪽인 DEPT의 행이 모두 남아요. 표준 문법으로는 `DEPT LEFT OUTER JOIN EMP`와 같아요(7번에서 배워요)."
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "DNAME",
              "ENAME"
            ],
            "rows": [
              [
                "10",
                "개발",
                "김대표"
              ],
              [
                "10",
                "개발",
                "이개발"
              ],
              [
                "10",
                "개발",
                "최코드"
              ],
              [
                "10",
                "개발",
                "정코드"
              ],
              [
                "10",
                "개발",
                "강신입"
              ],
              [
                "10",
                "개발",
                "서인턴"
              ],
              [
                "20",
                "영업",
                "박영업"
              ],
              [
                "20",
                "영업",
                "한세일"
              ],
              [
                "20",
                "영업",
                "윤세일"
              ],
              [
                "30",
                "기획",
                "NULL"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "10번, 20번 부서는 EQUI JOIN과 똑같이 사원 6명, 3명과 붙어요. 여기까지 9행이에요.",
              "30번 기획은 짝이 되는 사원이 없어요. 하지만 `(+)`가 EMP 쪽에 있으니 DEPT 행은 남고, ENAME 자리는 NULL로 채워져요. 그래서 10행이에요.",
              "조미정은 여전히 나오지 않아요. 이번에 모두 남는 쪽은 DEPT이고, 조미정은 EMP 쪽 행이기 때문이에요."
            ]
          },
          {
            "kind": "p",
            "text": "방향을 바꿔서 `(+)`를 DEPT 쪽에 붙여 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT E.ENAME, E.DEPTNO, D.DNAME\nFROM EMP E, DEPT D\nWHERE E.DEPTNO = D.DEPTNO(+)\nORDER BY E.EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "DEPTNO",
              "DNAME"
            ],
            "rows": [
              [
                "김대표",
                "10",
                "개발"
              ],
              [
                "이개발",
                "10",
                "개발"
              ],
              [
                "박영업",
                "20",
                "영업"
              ],
              [
                "최코드",
                "10",
                "개발"
              ],
              [
                "정코드",
                "10",
                "개발"
              ],
              [
                "한세일",
                "20",
                "영업"
              ],
              [
                "윤세일",
                "20",
                "영업"
              ],
              [
                "강신입",
                "10",
                "개발"
              ],
              [
                "조미정",
                "NULL",
                "NULL"
              ],
              [
                "서인턴",
                "10",
                "개발"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "이번에는 EMP의 행이 모두 남아요. 조미정이 DNAME NULL로 나오고, 사원이 없는 기획은 빠져요. 행 수는 똑같이 10행이지만 들어 있는 행이 달라요."
          },
          {
            "kind": "h3",
            "text": "추가 조건에도 `(+)`를 붙여야 해요"
          },
          {
            "kind": "p",
            "text": "조인 조건 말고 다른 조건을 더 쓸 때도, NULL로 채워질 쪽 컬럼에는 `(+)`를 붙여야 OUTER JOIN이 유지돼요. \"급여 6000 이상인 사원만 부서에 붙이되, 부서는 모두 남기기\"를 써 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT D.DNAME, E.ENAME, E.SAL\nFROM DEPT D, EMP E\nWHERE D.DEPTNO = E.DEPTNO(+)\n  AND E.SAL(+) >= 6000\nORDER BY D.DEPTNO, E.EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "DNAME",
              "ENAME",
              "SAL"
            ],
            "rows": [
              [
                "개발",
                "김대표",
                "9000"
              ],
              [
                "개발",
                "이개발",
                "6000"
              ],
              [
                "영업",
                "박영업",
                "6000"
              ],
              [
                "기획",
                "NULL",
                "NULL"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "급여가 6000 이상인 사원은 김대표, 이개발, 박영업 세 명이에요. 이 세 명만 부서에 붙어요.",
              "기획은 붙을 사원이 없지만, DEPT 행은 모두 남기 때문에 NULL로 채워져 남아요. 그래서 4행이에요.",
              "`E.SAL(+)`에서 `(+)`를 빼고 `E.SAL >= 6000`이라고만 쓰면 결과가 달라져요. 기획 행은 SAL이 NULL이라 `NULL >= 6000`이 UNKNOWN이 되고, 이 조건에서 지워져요. 결과는 김대표, 이개발, 박영업 3행만 남아요. 이 차이는 8번에서 표준 문법으로 다시 볼게요."
            ]
          },
          {
            "kind": "h3",
            "text": "`(+)` 문법의 제약"
          },
          {
            "kind": "ul",
            "items": [
              "`(+)`는 한쪽에만 붙일 수 있어요. 양쪽 행을 모두 남기는 FULL OUTER JOIN은 이 문법으로 쓸 수 없어요. 표준 문법의 `FULL OUTER JOIN`을 써요.",
              "`(+)`가 붙은 조건은 OR나 IN과 함께 쓸 수 없어요."
            ]
          },
          {
            "kind": "callout",
            "text": "SQL Server에는 `(+)`가 없어요. 예전에 쓰던 `*=`, `=*` 문법도 지금은 지원하지 않으니, 표준 문법의 OUTER JOIN을 써요."
          }
        ]
      },
      {
        "id": "inner",
        "title": "5. INNER JOIN, CROSS JOIN과 ON 절",
        "concept": "inner_join",
        "blocks": [
          {
            "kind": "p",
            "text": "5번부터는 ANSI/ISO 표준 조인 문법이에요. 표준 문법은 조인 조건을 WHERE가 아니라 FROM 절의 `ON`에 써요. 조인 조건(ON)과 결과를 거르는 조건(WHERE)이 나뉘어서 읽기 쉬워요."
          },
          {
            "kind": "p",
            "text": "INNER JOIN은 양쪽 테이블 모두에 짝이 있는 행만 붙이는 조인이에요. 1번 EQUI JOIN과 결과가 같아요. `INNER`는 생략할 수 있어서 `JOIN`만 쓰면 INNER JOIN이에요. ON에는 두 컬럼의 이름이 달라도 되고, `=`가 아닌 조건을 써도 돼요."
          },
          {
            "kind": "code",
            "text": "SELECT E.ENAME, D.DNAME\nFROM EMP E INNER JOIN DEPT D\n  ON E.DEPTNO = D.DEPTNO\nWHERE D.LOC = '부산'\nORDER BY E.EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "DNAME"
            ],
            "rows": [
              [
                "박영업",
                "영업"
              ],
              [
                "한세일",
                "영업"
              ],
              [
                "윤세일",
                "영업"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "ON으로 EMP와 DEPT를 붙이면 9행이에요. 조미정은 DEPTNO가 NULL이라 빠지고, 기획은 짝이 없어서 빠져요.",
              "WHERE의 `D.LOC = '부산'`이 그중 부산에 있는 영업 부서 3행만 남겨요.",
              "INNER JOIN에서는 `D.LOC = '부산'`을 WHERE 대신 ON에 `AND`로 붙여도 결과가 같아요. 결과가 달라지는 것은 OUTER JOIN뿐이에요(8번에서 배워요)."
            ]
          },
          {
            "kind": "h3",
            "text": "CROSS JOIN"
          },
          {
            "kind": "p",
            "text": "CROSS JOIN은 조건 없이 모든 조합을 만드는 조인이에요. 3번에서 본 카테시안 곱을 일부러 만드는 문법이에요. CROSS JOIN에는 ON을 쓰지 않아요."
          },
          {
            "kind": "code",
            "text": "SELECT COUNT(*) AS CNT\nFROM EMP CROSS JOIN DEPT;"
          },
          {
            "kind": "table",
            "head": [
              "CNT"
            ],
            "rows": [
              [
                "30"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "EMP 10행과 DEPT 3행의 모든 조합이라 10 × 3 = 30행이에요. 3번에서 `FROM EMP E, DEPT D`에 조건을 쓰지 않았을 때와 같은 결과예요."
          }
        ]
      },
      {
        "id": "natural",
        "title": "6. NATURAL JOIN과 USING 절",
        "blocks": [
          {
            "kind": "p",
            "text": "NATURAL JOIN은 두 테이블에서 **이름이 같은 모든 컬럼**으로 자동으로 EQUI JOIN을 해요. EMP와 DEPT에서 이름이 같은 컬럼은 DEPTNO 하나라서, `E.DEPTNO = D.DEPTNO`로 조인한 것과 같아요."
          },
          {
            "kind": "p",
            "text": "USING 절은 이름이 같은 컬럼 가운데 **조인에 쓸 컬럼을 직접 골라** 적는 방법이에요. `USING (DEPTNO)`처럼 괄호 안에 컬럼 이름을 써요."
          },
          {
            "kind": "p",
            "text": "먼저 USING으로 박영업(사원 번호 1003)의 부서를 찾아볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT DEPTNO, DNAME, ENAME\nFROM DEPT D JOIN EMP E\n  USING (DEPTNO)\nWHERE EMPNO = 1003;"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "DNAME",
              "ENAME"
            ],
            "rows": [
              [
                "20",
                "영업",
                "박영업"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "`SELECT DEPTNO`에 `D.`나 `E.`를 붙이지 않은 것을 눈여겨봐 주세요. 이유는 아래에서 설명할게요."
          },
          {
            "kind": "h3",
            "text": "SELECT * 의 컬럼 수가 달라요"
          },
          {
            "kind": "p",
            "text": "같은 조인을 `SELECT *`로 실행하면, USING(또는 NATURAL)과 ON의 결과 컬럼 수가 달라요. 시험에 자주 나오는 부분이에요."
          },
          {
            "kind": "code",
            "text": "-- (1) USING\nSELECT *\nFROM DEPT D JOIN EMP E\n  USING (DEPTNO)\nWHERE EMPNO = 1003;\n\n-- (2) ON\nSELECT *\nFROM DEPT D JOIN EMP E\n  ON D.DEPTNO = E.DEPTNO\nWHERE EMPNO = 1003;"
          },
          {
            "kind": "p",
            "text": "결과는 둘 다 박영업 한 행이지만, 나오는 컬럼이 이렇게 달라요."
          },
          {
            "kind": "table",
            "head": [
              "쿼리",
              "컬럼 수",
              "나오는 컬럼 (순서대로)"
            ],
            "rows": [
              [
                "(1) USING",
                "10개",
                "**DEPTNO**, DNAME, LOC, EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM"
              ],
              [
                "(2) ON",
                "11개",
                "DEPTNO, DNAME, LOC, EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "`(1)`을 `DEPT NATURAL JOIN EMP`로 바꿔 실행해도 같은 10개 컬럼이 나와요."
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "USING과 NATURAL은 DEPTNO를 \"하나의 공통 컬럼\"으로 합쳐서 맨 앞에 한 번만 보여 줘요. DEPT 3개 + EMP 8개 − 공통 1개 = 10개 컬럼이에요.",
              "ON은 두 테이블의 DEPTNO를 각각 다른 컬럼으로 둬요. 그래서 3 + 8 = 11개 컬럼이고, DEPTNO가 두 번 나와요.",
              "USING과 NATURAL에서는 공통 컬럼이 하나로 합쳐졌으니, 어느 테이블의 DEPTNO인지 고를 수 없어요. 그래서 공통 컬럼에 `D.DEPTNO`처럼 접두사(테이블 별칭)를 붙이면 오류가 나요(Oracle ORA-25154, ORA-25155). `DEPTNO`라고만 써야 해요."
            ]
          },
          {
            "kind": "h3",
            "text": "그 밖의 규칙"
          },
          {
            "kind": "ul",
            "items": [
              "NATURAL JOIN에는 ON이나 USING을 함께 쓰지 않아요.",
              "NATURAL JOIN은 이름이 같은 컬럼을 모두 조인 조건으로 써요. 이름만 같고 뜻이 다른 컬럼이 있으면 그 컬럼까지 조건이 되어 원하지 않은 결과가 나올 수 있어요.",
              "USING에 쓰는 컬럼은 양쪽 테이블에 같은 이름으로 있어야 해요. 이름이 다르면 ON을 써요."
            ]
          },
          {
            "kind": "callout",
            "text": "SQL Server는 NATURAL JOIN과 USING을 지원하지 않아요. ON만 써요."
          }
        ]
      },
      {
        "id": "outer",
        "title": "7. LEFT / RIGHT / FULL OUTER JOIN",
        "concept": "outer_join",
        "blocks": [
          {
            "kind": "p",
            "text": "표준 문법의 OUTER JOIN은 어느 쪽 행을 모두 남길지를 키워드로 정해요."
          },
          {
            "kind": "table",
            "head": [
              "문법",
              "모두 남는 쪽"
            ],
            "rows": [
              [
                "`A LEFT OUTER JOIN B`",
                "왼쪽 A의 행. 짝이 없으면 B 컬럼을 NULL로 채워요"
              ],
              [
                "`A RIGHT OUTER JOIN B`",
                "오른쪽 B의 행. 짝이 없으면 A 컬럼을 NULL로 채워요"
              ],
              [
                "`A FULL OUTER JOIN B`",
                "양쪽 행 모두"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "`OUTER`는 생략할 수 있어서 `LEFT JOIN`이라고만 써도 돼요. 이 데이터에서는 사원이 없는 **30번 기획**과 부서가 없는 **조미정**이 행 수 차이를 만들어요. FULL OUTER JOIN으로 두 경우를 한 번에 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT E.ENAME,\n       E.DEPTNO AS E_DEPTNO,\n       D.DEPTNO AS D_DEPTNO,\n       D.DNAME\nFROM EMP E FULL OUTER JOIN DEPT D\n  ON E.DEPTNO = D.DEPTNO\nORDER BY E.EMPNO, D.DEPTNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "E_DEPTNO",
              "D_DEPTNO",
              "DNAME"
            ],
            "rows": [
              [
                "김대표",
                "10",
                "10",
                "개발"
              ],
              [
                "이개발",
                "10",
                "10",
                "개발"
              ],
              [
                "박영업",
                "20",
                "20",
                "영업"
              ],
              [
                "최코드",
                "10",
                "10",
                "개발"
              ],
              [
                "정코드",
                "10",
                "10",
                "개발"
              ],
              [
                "한세일",
                "20",
                "20",
                "영업"
              ],
              [
                "윤세일",
                "20",
                "20",
                "영업"
              ],
              [
                "강신입",
                "10",
                "10",
                "개발"
              ],
              [
                "조미정",
                "NULL",
                "NULL",
                "NULL"
              ],
              [
                "서인턴",
                "10",
                "10",
                "개발"
              ],
              [
                "NULL",
                "NULL",
                "30",
                "기획"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "조미정 행은 DEPT 쪽 컬럼(D_DEPTNO, DNAME)이 NULL이고, 기획 행은 EMP 쪽 컬럼(ENAME, E_DEPTNO)이 NULL이에요."
          },
          {
            "kind": "p",
            "text": "같은 `EMP E ○○ JOIN DEPT D ON E.DEPTNO = D.DEPTNO`에서 조인 종류만 바꾸면 행 수가 이렇게 달라요. CROSS JOIN은 ON 없이 실행한 값이에요."
          },
          {
            "kind": "table",
            "head": [
              "조인 종류",
              "행 수"
            ],
            "rows": [
              [
                "INNER",
                "9"
              ],
              [
                "LEFT",
                "10"
              ],
              [
                "RIGHT",
                "10"
              ],
              [
                "FULL",
                "11"
              ],
              [
                "CROSS",
                "30"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "INNER는 9행이에요. 짝이 있는 사원 9명이에요.",
              "LEFT(EMP 기준)는 10행이에요. 9행에 부서가 없는 조미정이 DNAME NULL로 더해져요.",
              "RIGHT(DEPT 기준)는 10행이에요. 9행에 사원이 없는 기획이 ENAME NULL로 더해져요. 조미정은 빠져요.",
              "FULL은 11행이에요. 짝이 있는 9행 + 왼쪽에만 있는 조미정 1행 + 오른쪽에만 있는 기획 1행이에요. LEFT 10행과 RIGHT 10행을 더한 20행이 아니에요. 두 결과에 겹치는 9행은 한 번만 세요."
            ]
          }
        ]
      },
      {
        "id": "order",
        "title": "8. OUTER JOIN에서 ON과 WHERE",
        "concept": "join_order",
        "blocks": [
          {
            "kind": "p",
            "text": "처리 순서로 이해하면 쉬워요. **ON은 조인하면서 \"누구와 붙을지\"를 정하고, WHERE는 조인이 끝난 결과에서 \"어떤 행을 남길지\"를 정해요.**"
          },
          {
            "kind": "p",
            "text": "OUTER JOIN은 ON에서 짝을 찾지 못한 기준 행도 NULL로 채워서 살려 둬요. 그런데 WHERE에서 그 NULL 컬럼에 조건을 걸면 결과가 UNKNOWN이 되어 다시 지워져요. 여기서 기준 테이블은 모두 남는 쪽(LEFT JOIN의 왼쪽)이고, 안쪽 테이블은 NULL로 채워질 수 있는 쪽이에요."
          },
          {
            "kind": "p",
            "text": "같은 조건 `E.SAL >= 6000`을 ON에 둘 때와 WHERE에 둘 때를 비교해 볼게요."
          },
          {
            "kind": "code",
            "text": "-- (1) 안쪽 테이블(EMP) 조건을 ON에\nSELECT D.DNAME, E.ENAME, E.SAL\nFROM DEPT D LEFT OUTER JOIN EMP E\n  ON D.DEPTNO = E.DEPTNO\n AND E.SAL >= 6000\nORDER BY D.DEPTNO, E.EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "DNAME",
              "ENAME",
              "SAL"
            ],
            "rows": [
              [
                "개발",
                "김대표",
                "9000"
              ],
              [
                "개발",
                "이개발",
                "6000"
              ],
              [
                "영업",
                "박영업",
                "6000"
              ],
              [
                "기획",
                "NULL",
                "NULL"
              ]
            ]
          },
          {
            "kind": "code",
            "text": "-- (2) 같은 조건을 WHERE에\nSELECT D.DNAME, E.ENAME, E.SAL\nFROM DEPT D LEFT OUTER JOIN EMP E\n  ON D.DEPTNO = E.DEPTNO\nWHERE E.SAL >= 6000\nORDER BY D.DEPTNO, E.EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "DNAME",
              "ENAME",
              "SAL"
            ],
            "rows": [
              [
                "개발",
                "김대표",
                "9000"
              ],
              [
                "개발",
                "이개발",
                "6000"
              ],
              [
                "영업",
                "박영업",
                "6000"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "(1)은 \"급여 6000 이상인 사원만 붙여라\"라는 뜻이에요. 김대표, 이개발, 박영업이 붙고, 기획은 붙을 사원이 없지만 LEFT JOIN의 기준 행이라 NULL로 남아요. 그래서 4행이에요. 4번의 `E.SAL(+) >= 6000` 예제와 같은 결과예요.",
              "(2)는 먼저 LEFT JOIN으로 10행(기획 NULL 행 포함)을 만들어요. 그다음 WHERE가 급여 6000 미만인 사원과, `NULL >= 6000`이 UNKNOWN인 기획 행을 지워요. 그래서 3행이에요.",
              "(2)의 결과는 INNER JOIN 결과와 같아요. 안쪽 테이블 조건을 WHERE에 두면 OUTER JOIN을 쓴 의미가 없어져요."
            ]
          },
          {
            "kind": "h3",
            "text": "기준 테이블의 조건을 ON에 두면"
          },
          {
            "kind": "p",
            "text": "반대로 기준 테이블(DEPT) 쪽 조건을 ON에 두면, 기준 행은 걸러지지 않아요."
          },
          {
            "kind": "code",
            "text": "SELECT D.DNAME, D.LOC, E.ENAME\nFROM DEPT D LEFT OUTER JOIN EMP E\n  ON D.DEPTNO = E.DEPTNO\n AND D.LOC = '부산'\nORDER BY D.DEPTNO, E.EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "DNAME",
              "LOC",
              "ENAME"
            ],
            "rows": [
              [
                "개발",
                "서울",
                "NULL"
              ],
              [
                "영업",
                "부산",
                "박영업"
              ],
              [
                "영업",
                "부산",
                "한세일"
              ],
              [
                "영업",
                "부산",
                "윤세일"
              ],
              [
                "기획",
                "서울",
                "NULL"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "ON의 `D.LOC = '부산'`은 \"부산에 있는 부서에만 사원을 붙여라\"라는 뜻이 돼요.",
              "영업(부산)에는 사원 3명이 붙어요.",
              "개발(서울)은 조건에 맞지 않아 사원이 붙지 않아요. 하지만 LEFT JOIN의 기준 행이라 사라지지 않고 ENAME NULL로 남아요. 기획(서울)도 마찬가지예요.",
              "그래서 5행이에요. 같은 `D.LOC = '부산'`을 WHERE에 두면 영업 3행만 남아요."
            ]
          },
          {
            "kind": "h3",
            "text": "정리"
          },
          {
            "kind": "table",
            "head": [
              "하고 싶은 것",
              "조건을 둘 곳"
            ],
            "rows": [
              [
                "기준 행은 모두 남기고, 붙일 상대만 고르기",
                "ON"
              ],
              [
                "결과 행 자체를 줄이기",
                "WHERE"
              ],
              [
                "짝이 없는 행만 찾기",
                "WHERE에 `IS NULL`"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "짝이 없는 행만 찾고 싶다면 안쪽 테이블의 컬럼에 `IS NULL` 조건을 걸어요. 예를 들어 `DEPT D LEFT OUTER JOIN EMP E ON D.DEPTNO = E.DEPTNO`에 `WHERE E.EMPNO IS NULL`을 붙이면, 사원이 없는 30번 기획 1행만 나와요."
          }
        ]
      },
      {
        "id": "myths",
        "title": "자주 하는 오해",
        "blocks": [
          {
            "kind": "table",
            "head": [
              "오해",
              "실제"
            ],
            "rows": [
              [
                "조인 키가 둘 다 NULL이면 같은 값이니 붙는다",
                "`NULL = NULL`은 UNKNOWN이라 EQUI JOIN에서 빠져요. 조미정은 EMP와 DEPT의 EQUI JOIN 결과 9행에 들어가지 않아요"
              ],
              [
                "NON-EQUI JOIN은 결과가 항상 EQUI JOIN보다 많다",
                "행 수는 데이터에 달려 있어요. 급여 등급처럼 구간이 겹치지 않으면 사원 한 명에 등급 하나씩만 붙어요. 이 데이터에서는 둘 다 9행이에요"
              ],
              [
                "테이블 3개를 조인하면 조건도 3개가 필요하다",
                "최소 N−1 = 2개예요. 조건이 모자라면 카테시안 곱이 생겨요. EMP·DEPT·SALGRADE에 조건이 1개뿐이면 9 × 4 = 36행이에요"
              ],
              [
                "`(+)`를 붙인 쪽 테이블의 행이 모두 남는다",
                "반대예요. `(+)`는 NULL로 채워질(모자란) 쪽에 붙고, **붙지 않은 쪽** 행이 모두 남아요"
              ],
              [
                "OUTER JOIN의 추가 조건은 `(+)` 없이 써도 OUTER JOIN이 유지된다",
                "안쪽 테이블 조건에 `(+)`가 없으면 NULL 행이 지워져 INNER JOIN처럼 돼요. 4행이 아니라 3행이 나와요"
              ],
              [
                "USING 컬럼에도 `E.DEPTNO`처럼 접두사를 붙이는 게 안전하다",
                "NATURAL JOIN과 USING의 공통 컬럼에 접두사를 붙이면 오류예요"
              ],
              [
                "NATURAL JOIN과 USING의 SELECT * 컬럼 수는 ON과 같다",
                "공통 컬럼이 하나로 합쳐져서 그만큼 적어요. DEPT와 EMP는 USING 10개, ON 11개예요"
              ],
              [
                "FULL OUTER JOIN 행 수 = LEFT 행 수 + RIGHT 행 수",
                "겹치는 부분은 한 번만 세요. 10 + 10 = 20이 아니라 9 + 1 + 1 = 11행이에요"
              ],
              [
                "OUTER JOIN에서도 조건을 ON에 두든 WHERE에 두든 같다",
                "같은 것은 INNER JOIN뿐이에요. 안쪽 테이블 조건을 WHERE에 두면 4행이 3행으로 줄어 INNER JOIN처럼 돼요"
              ],
              [
                "LEFT OUTER JOIN에서 기준 테이블 조건을 ON에 두면 기준 행이 걸러진다",
                "기준 행은 그대로 남고 상대만 붙지 않아요. `ON … AND D.LOC = '부산'`이어도 개발과 기획은 NULL로 남아 5행이에요"
              ]
            ]
          }
        ]
      }
    ],
  },
];

MATERIALS.push(...MORE_MATERIALS);

export function getMaterial(id: string) {
  return MATERIALS.find((m) => m.id === id);
}

/** Flattens a material to plain text so the agent can ground its answers in it. */
export function materialToText(m: Material) {
  return m.sections
    .map((s) => {
      const body = s.blocks
        .map((b) => {
          if (b.kind === "ul") return b.items.map((i) => `- ${i}`).join("\n");
          if (b.kind === "ol") return b.items.map((i, n) => `${n + 1}. ${i}`).join("\n");
          if (b.kind === "table") return [b.caption ?? "", b.head.join(" | "), ...b.rows.map((r) => r.join(" | "))].join("\n");
          return b.text;
        })
        .join("\n");
      return `## ${s.title}\n${body}`;
    })
    .join("\n\n");
}
