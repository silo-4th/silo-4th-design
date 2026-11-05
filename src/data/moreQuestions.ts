import type { Question } from "./questions";

/** Questions for the subquery, group function and window function units: one of each format per concept. */
export const MORE_QUESTIONS: Question[] = [
  {
    "id": "q-sqr-1",
    "concept": "sq_return",
    "type": "객관식",
    "level": 2,
    "family": "sq-any",
    "stem": "아래 SQL의 결과 행 수는?",
    "options": [
      {
        "text": "1",
        "tag": "개념 혼동",
        "why": "> ANY를 > ALL처럼 '모두보다 크다'로 읽었어요."
      },
      {
        "text": "3",
        "tag": "조건 누락",
        "why": "최솟값이 아니라 다른 값과 비교했어요."
      },
      {
        "text": "6"
      },
      {
        "text": "8",
        "tag": "조건 누락",
        "why": "3000인 사원이나 급여가 NULL인 서인턴까지 넣었어요."
      }
    ],
    "answer": 2,
    "hints": [
      "> ANY는 목록 중 하나보다만 크면 참이에요. 최솟값과 비교해 보세요.",
      "20번 부서 급여는 6000, 3500, 3000이라 > 3000과 같아요."
    ],
    "explanation": "> ANY는 최솟값 3000보다 크면 참이라 김대표, 이개발, 박영업, 최코드, 정코드, 한세일 6명이 남아요. 3000인 윤세일, 강신입과 급여가 NULL인 서인턴은 빠져요.",
    "code": "SELECT ENAME FROM EMP\nWHERE SAL > ANY (SELECT SAL FROM EMP\n                 WHERE DEPTNO = 20);"
  },
  {
    "id": "b-sqr-1",
    "concept": "sq_return",
    "type": "빈칸",
    "level": 1,
    "family": "sq-multi",
    "options": [],
    "answer": -1,
    "stem": "서브쿼리가 여러 행을 돌려줄 수 있다면 등호(=) 대신 ____ , ANY, ALL 같은 연산자를 써야 한다.",
    "blank": [
      "IN",
      "인"
    ],
    "hints": [
      "목록 안의 값 중 하나와 같은지 보는 연산자예요.",
      "= ANY와 같은 뜻이에요."
    ],
    "explanation": "여러 행 서브쿼리에 =를 쓰면 ORA-01427 오류가 나요. IN, ANY, ALL을 써야 해요."
  },
  {
    "id": "t-sqr-1",
    "concept": "sq_return",
    "type": "대화형",
    "level": 2,
    "family": "sq-any",
    "options": [],
    "answer": -1,
    "stem": "> ANY와 > ALL의 차이를 최솟값, 최댓값으로 바꿔서 설명해 보세요.",
    "talk": [
      {
        "label": "> ANY는 최솟값보다 크면 참이다",
        "keywords": [
          "최솟값",
          "min",
          "하나라도",
          "가장 작은"
        ]
      },
      {
        "label": "> ALL은 최댓값보다 커야 참이다",
        "keywords": [
          "최댓값",
          "max",
          "모두",
          "가장 큰"
        ]
      },
      {
        "label": "20번 부서 급여 기준으로 6명과 1명이 나온다",
        "keywords": [
          "6명",
          "1명",
          "3000",
          "6000"
        ]
      }
    ],
    "hints": [
      "20번 부서 급여는 6000, 3500, 3000이에요.",
      "하나보다만 크면 되는지, 모두보다 커야 하는지 생각해 보세요."
    ],
    "explanation": "> ANY는 목록 중 하나보다만 크면 되니 최솟값 3000보다 크면 참이에요. 그래서 6명이 나와요. > ALL은 모두보다 커야 하니 최댓값 6000보다 커야 하고, 김대표 1명만 나와요."
  },
  {
    "id": "q-sqp-1",
    "concept": "sq_position",
    "type": "객관식",
    "level": 1,
    "family": "sq-scalar",
    "stem": "SELECT 절의 스칼라 서브쿼리가 0행을 돌려주면 그 자리의 값은?",
    "options": [
      {
        "text": "오류가 난다",
        "tag": "개념 혼동",
        "why": "오류는 2행 이상일 때 나요. 0행과 혼동했어요."
      },
      {
        "text": "NULL이 된다"
      },
      {
        "text": "그 사원 행이 결과에서 빠진다",
        "tag": "개념 혼동",
        "why": "INNER JOIN처럼 행이 빠진다고 생각했어요."
      },
      {
        "text": "0이 된다",
        "tag": "암기 오류",
        "why": "COUNT처럼 0이 된다고 기억했어요."
      }
    ],
    "answer": 1,
    "hints": [
      "조미정은 부서가 NULL이라 맞는 부서 이름이 없어요.",
      "0행과 2행 이상일 때 동작이 달라요."
    ],
    "explanation": "스칼라 서브쿼리가 0행이면 오류가 아니라 NULL이 되고, 사원 행은 결과에 남아요. 2행 이상을 돌려줄 때만 오류가 나요."
  },
  {
    "id": "b-sqp-1",
    "concept": "sq_position",
    "type": "빈칸",
    "level": 1,
    "family": "sq-inline",
    "options": [],
    "answer": -1,
    "stem": "FROM 절에 넣은 서브쿼리는 ____ 뷰라고 부르고, 실행할 때 만들어지는 임시 테이블처럼 쓴다.",
    "blank": [
      "인라인",
      "inline"
    ],
    "hints": [
      "뷰 앞에 붙는 말이에요.",
      "영어로 inline이에요."
    ],
    "explanation": "FROM 절의 서브쿼리는 인라인 뷰예요. 안에서 만든 컬럼을 메인쿼리에서 그대로 쓸 수 있어요."
  },
  {
    "id": "t-sqp-1",
    "concept": "sq_position",
    "type": "대화형",
    "level": 2,
    "family": "sq-inline",
    "options": [],
    "answer": -1,
    "stem": "인라인 뷰와 WHERE 절 중첩 서브쿼리의 차이를 '메인쿼리에서 그 컬럼을 쓸 수 있는가'로 설명해 보세요.",
    "talk": [
      {
        "label": "인라인 뷰의 컬럼은 메인쿼리에서 쓸 수 있다",
        "keywords": [
          "인라인",
          "from"
        ]
      },
      {
        "label": "WHERE 절 서브쿼리의 컬럼은 메인쿼리에서 쓸 수 없다",
        "keywords": [
          "where",
          "중첩",
          "쓸 수 없"
        ]
      },
      {
        "label": "인라인 뷰는 임시 테이블처럼 쓰인다",
        "keywords": [
          "임시",
          "테이블"
        ]
      }
    ],
    "hints": [
      "V.CNT, V.AVG_SAL을 SELECT에 쓴 예제를 떠올려 보세요.",
      "WHERE 절 서브쿼리는 조건 비교에만 쓰여요."
    ],
    "explanation": "FROM 절의 인라인 뷰는 그 자리에서 임시 테이블이 되기 때문에 안의 컬럼을 메인쿼리 SELECT에서 쓸 수 있어요. WHERE 절의 중첩 서브쿼리는 조건 비교에만 쓰여서, 그 안의 컬럼은 메인쿼리에서 쓸 수 없어요."
  },
  {
    "id": "q-sqc-1",
    "concept": "sq_corr",
    "type": "객관식",
    "level": 2,
    "family": "sq-exists",
    "stem": "아래 SQL의 결과는?",
    "options": [
      {
        "text": "개발, 영업",
        "tag": "개념 혼동",
        "why": "NOT EXISTS를 EXISTS로 읽었어요."
      },
      {
        "text": "기획"
      },
      {
        "text": "결과 없음 (0행)",
        "tag": "개념 혼동",
        "why": "NOT IN의 NULL 함정과 혼동했어요."
      },
      {
        "text": "개발, 영업, 기획",
        "tag": "개념 부족"
      }
    ],
    "answer": 1,
    "hints": [
      "NOT EXISTS는 서브쿼리 결과가 0행일 때 참이에요.",
      "30번 기획 부서에는 사원이 한 명도 없어요."
    ],
    "explanation": "부서마다 사원이 있는지 보는데, 30번 기획만 사원이 없어서 NOT EXISTS가 참이에요. NOT EXISTS는 NULL의 영향을 받지 않아요.",
    "code": "SELECT D.DNAME FROM DEPT D\nWHERE NOT EXISTS (SELECT 1 FROM EMP E\n                  WHERE E.DEPTNO = D.DEPTNO);"
  },
  {
    "id": "b-sqc-1",
    "concept": "sq_corr",
    "type": "빈칸",
    "level": 1,
    "family": "sq-corr",
    "options": [],
    "answer": -1,
    "stem": "메인쿼리의 컬럼을 쓰는 서브쿼리를 ____ 서브쿼리라고 하며, 메인쿼리 행이 바뀔 때마다 다시 계산된다.",
    "blank": [
      "연관",
      "correlated",
      "상관"
    ],
    "hints": [
      "메인쿼리와 서로 엮여 있다는 뜻의 말이에요.",
      "반대말은 비연관 서브쿼리예요."
    ],
    "explanation": "서브쿼리 안에서 E.DEPTNO처럼 메인쿼리 컬럼을 쓰면 연관 서브쿼리예요. 메인쿼리의 각 행마다 다시 계산돼요."
  },
  {
    "id": "t-sqc-1",
    "concept": "sq_corr",
    "type": "대화형",
    "level": 2,
    "family": "sq-corr",
    "options": [],
    "answer": -1,
    "stem": "연관 서브쿼리로 '자기 부서 평균보다 많이 받는 사원'을 구할 때 이개발과 최코드가 어떻게 판단되는지 설명해 보세요.",
    "talk": [
      {
        "label": "서브쿼리가 사원마다 그 사원의 부서 평균을 다시 구한다",
        "keywords": [
          "다시",
          "행마다",
          "사원마다",
          "e.deptno"
        ]
      },
      {
        "label": "10번 부서 평균은 5200이다",
        "keywords": [
          "5200"
        ]
      },
      {
        "label": "이개발 6000은 남고 최코드 4000은 빠진다",
        "keywords": [
          "이개발",
          "최코드",
          "6000",
          "4000"
        ]
      }
    ],
    "hints": [
      "두 사람 모두 10번 부서예요.",
      "10번 부서 평균은 서인턴을 빼고 26000 ÷ 5예요."
    ],
    "explanation": "메인쿼리가 이개발을 볼 때 서브쿼리는 10번 부서 평균 5200을 구하고, 6000 > 5200이라 남아요. 최코드도 10번이라 같은 5200과 비교하는데, 4000 > 5200이 거짓이라 빠져요."
  },
  {
    "id": "q-sqn-1",
    "concept": "sq_notin",
    "type": "객관식",
    "level": 3,
    "family": "sq-notin",
    "stem": "EMP에는 부서가 NULL인 조미정이 있다. 아래 SQL의 결과 행 수는?",
    "options": [
      {
        "text": "0"
      },
      {
        "text": "1",
        "tag": "개념 혼동",
        "why": "NOT EXISTS와 결과가 같다고 생각했어요."
      },
      {
        "text": "2",
        "tag": "개념 혼동",
        "why": "IN의 결과와 혼동했어요."
      },
      {
        "text": "3",
        "tag": "개념 부족"
      }
    ],
    "answer": 0,
    "hints": [
      "NOT IN은 목록의 모든 값과 다른지 AND로 이어서 비교해요.",
      "30 <> NULL은 참일까요?"
    ],
    "explanation": "서브쿼리 결과가 {10, 20, NULL}이라 30번은 30 <> 10 AND 30 <> 20 AND 30 <> NULL이 돼요. 마지막이 UNKNOWN이라 전체가 UNKNOWN이고, 아무 행도 나오지 않아요.",
    "code": "SELECT D.DNAME FROM DEPT D\nWHERE D.DEPTNO NOT IN (SELECT E.DEPTNO\n                       FROM EMP E);"
  },
  {
    "id": "b-sqn-1",
    "concept": "sq_notin",
    "type": "빈칸",
    "level": 2,
    "family": "sq-notin",
    "options": [],
    "answer": -1,
    "stem": "NOT IN 목록에 NULL이 섞이면 x <> NULL의 결과가 ____ 이 되어, 전체 조건이 참이 될 수 없다.",
    "blank": [
      "UNKNOWN",
      "언노운",
      "알 수 없음"
    ],
    "hints": [
      "참도 거짓도 아닌 상태를 부르는 말이에요.",
      "영어로 써 보세요."
    ],
    "explanation": "NULL과 비교하면 UNKNOWN이 돼요. 참 AND UNKNOWN은 UNKNOWN이라 WHERE를 통과하지 못해요."
  },
  {
    "id": "t-sqn-1",
    "concept": "sq_notin",
    "type": "대화형",
    "level": 3,
    "family": "sq-notin",
    "options": [],
    "answer": -1,
    "stem": "NOT IN 서브쿼리 결과에 NULL이 하나라도 있으면 왜 0행이 되는지, 해결 방법과 함께 설명해 보세요.",
    "talk": [
      {
        "label": "NOT IN은 AND로 이어진 <> 비교다",
        "keywords": [
          "and",
          "<>",
          "모두",
          "다르"
        ]
      },
      {
        "label": "NULL과 비교하면 UNKNOWN이 된다",
        "keywords": [
          "unknown",
          "언노운"
        ]
      },
      {
        "label": "IS NOT NULL로 빼거나 NOT EXISTS를 쓴다",
        "keywords": [
          "is not null",
          "not exists"
        ]
      }
    ],
    "hints": [
      "30 <> 10 AND 30 <> 20 AND 30 <> NULL을 떠올려 보세요.",
      "NULL을 목록에서 빼는 방법이 있어요."
    ],
    "explanation": "NOT IN은 목록의 모든 값과 다른지를 AND로 비교해요. NULL과 비교한 부분이 UNKNOWN이라 전체가 UNKNOWN이 되고, WHERE는 참인 행만 남겨서 0행이에요. 서브쿼리에 WHERE DEPTNO IS NOT NULL을 넣거나 NOT EXISTS를 쓰면 해결돼요."
  },
  {
    "id": "q-gfr-1",
    "concept": "gf_rollup",
    "type": "객관식",
    "level": 1,
    "family": "gf-rollup",
    "stem": "ROLLUP(DEPTNO, YR)의 결과에 나오지 않는 행은?",
    "options": [
      {
        "text": "부서별 소계 (YR 자리 NULL)",
        "tag": "개념 부족"
      },
      {
        "text": "연도별 소계 (DEPTNO 자리 NULL)"
      },
      {
        "text": "총계 (둘 다 NULL)",
        "tag": "암기 오류",
        "why": "ROLLUP에는 총계가 없다고 기억했어요."
      },
      {
        "text": "상세 행 (둘 다 값)",
        "tag": "개념 부족"
      }
    ],
    "answer": 1,
    "hints": [
      "ROLLUP은 오른쪽 컬럼부터 하나씩 빼요.",
      "(DEPTNO, YR), (DEPTNO), () 3단계예요."
    ],
    "explanation": "ROLLUP(DEPTNO, YR)은 (DEPTNO, YR) 상세, (DEPTNO) 부서별 소계, () 총계만 만들어요. 연도별 소계는 CUBE나 ROLLUP(YR, DEPTNO)에서 나와요."
  },
  {
    "id": "b-gfr-1",
    "concept": "gf_rollup",
    "type": "빈칸",
    "level": 1,
    "family": "gf-rollup",
    "options": [],
    "answer": -1,
    "stem": "ROLLUP에 컬럼이 n개면 묶는 단계는 n + ____ 개이다.",
    "blank": [
      "1",
      "일",
      "하나"
    ],
    "hints": [
      "컬럼을 하나씩 빼다가 마지막에 붙는 것이 있어요.",
      "총계 단계가 하나 더 있어요."
    ],
    "explanation": "오른쪽부터 하나씩 빼며 n단계를 만들고, 마지막에 총계를 붙여서 n + 1단계예요."
  },
  {
    "id": "t-gfr-1",
    "concept": "gf_rollup",
    "type": "대화형",
    "level": 2,
    "family": "gf-rollup-order",
    "options": [],
    "answer": -1,
    "stem": "ROLLUP(DEPTNO, YR)와 ROLLUP(YR, DEPTNO)의 결과가 어떻게 다른지 SALES 예제 숫자로 설명해 보세요.",
    "talk": [
      {
        "label": "ROLLUP은 오른쪽 컬럼부터 뺀다",
        "keywords": [
          "오른쪽",
          "뺀",
          "빼"
        ]
      },
      {
        "label": "앞의 것은 부서별 소계 330, 320이 나온다",
        "keywords": [
          "330",
          "320",
          "부서별"
        ]
      },
      {
        "label": "뒤의 것은 연도별 소계 450, 200이 나온다",
        "keywords": [
          "450",
          "200",
          "연도별"
        ]
      }
    ],
    "hints": [
      "괄호 안 마지막 컬럼이 먼저 빠져요.",
      "두 결과 모두 7행이에요."
    ],
    "explanation": "ROLLUP(DEPTNO, YR)은 YR을 먼저 빼서 부서별 소계 330, 320이 나와요. ROLLUP(YR, DEPTNO)은 DEPTNO를 먼저 빼서 연도별 소계 450, 200이 나와요. 행 수는 둘 다 7행이지만 소계 기준이 달라요."
  },
  {
    "id": "q-gfc-1",
    "concept": "gf_cube",
    "type": "객관식",
    "level": 2,
    "family": "gf-sets",
    "stem": "SALES 예제에서 GROUP BY GROUPING SETS(DEPTNO, YR)의 결과 행 수는?",
    "options": [
      {
        "text": "4"
      },
      {
        "text": "5",
        "tag": "암기 오류",
        "why": "GROUPING SETS에도 총계가 붙는다고 기억했어요."
      },
      {
        "text": "7",
        "tag": "개념 혼동",
        "why": "ROLLUP과 혼동했어요."
      },
      {
        "text": "9",
        "tag": "개념 혼동",
        "why": "CUBE와 혼동했어요."
      }
    ],
    "answer": 0,
    "hints": [
      "나열한 그룹만 만들어요. 부서별 2행, 연도별 2행을 세어 보세요.",
      "총계는 ()를 직접 넣어야 생겨요."
    ],
    "explanation": "GROUPING SETS(DEPTNO, YR)는 부서별 2행(330, 320)과 연도별 2행(450, 200)만 만들어서 4행이에요. 총계 650은 없어요."
  },
  {
    "id": "b-gfc-1",
    "concept": "gf_cube",
    "type": "빈칸",
    "level": 2,
    "family": "gf-sets",
    "options": [],
    "answer": -1,
    "stem": "GROUPING SETS에 총계를 넣으려면 빈 ____ 를 직접 나열해야 한다.",
    "blank": [
      "괄호",
      "()",
      "빈괄호"
    ],
    "hints": [
      "아무 컬럼으로도 나누지 않는다는 표시예요.",
      "() 모양이에요."
    ],
    "explanation": "GROUPING SETS(DEPTNO, YR, ())처럼 빈 괄호를 넣으면 총계 650 행이 생겨서 5행이 돼요."
  },
  {
    "id": "t-gfc-1",
    "concept": "gf_cube",
    "type": "대화형",
    "level": 2,
    "family": "gf-cube",
    "options": [],
    "answer": -1,
    "stem": "CUBE(DEPTNO, YR)와 GROUPING SETS(DEPTNO, YR)의 차이를 행 수와 함께 설명해 보세요.",
    "talk": [
      {
        "label": "CUBE는 가능한 모든 조합(2의 n제곱)을 만든다",
        "keywords": [
          "모든",
          "조합",
          "2^n",
          "4가지"
        ]
      },
      {
        "label": "GROUPING SETS는 나열한 그룹만 만들고 총계가 없다",
        "keywords": [
          "나열",
          "총계"
        ]
      },
      {
        "label": "SALES 예제에서 9행과 4행이 나온다",
        "keywords": [
          "9",
          "4행"
        ]
      }
    ],
    "hints": [
      "CUBE(DEPTNO, YR)은 상세, 부서별, 연도별, 총계 4가지로 묶어요.",
      "GROUPING SETS는 상세 행도 총계도 없어요."
    ],
    "explanation": "CUBE는 (DEPTNO, YR), (DEPTNO), (YR), () 모든 조합으로 묶어서 9행이에요. GROUPING SETS(DEPTNO, YR)는 나열한 부서별과 연도별만 만들어서 4행이고, 상세 행과 총계가 없어요."
  },
  {
    "id": "q-gfp-1",
    "concept": "gf_pick",
    "type": "객관식",
    "level": 2,
    "family": "gf-pick",
    "stem": "결과표에 총계 행이 있고, 부서별 소계와 연도별 소계가 모두 있다. 어떤 GROUP BY를 썼을까?",
    "options": [
      {
        "text": "ROLLUP(DEPTNO, YR)",
        "tag": "조건 누락",
        "why": "연도별 소계가 있다는 점을 놓쳤어요."
      },
      {
        "text": "CUBE(DEPTNO, YR)"
      },
      {
        "text": "GROUPING SETS(DEPTNO, YR)",
        "tag": "개념 혼동",
        "why": "GROUPING SETS에는 총계가 없어요."
      },
      {
        "text": "ROLLUP(YR, DEPTNO)",
        "tag": "조건 누락",
        "why": "부서별 소계가 있다는 점을 놓쳤어요."
      }
    ],
    "answer": 1,
    "hints": [
      "총계가 있으면 GROUPING SETS는 아니에요.",
      "두 방향 소계가 모두 있는 것은 하나뿐이에요."
    ],
    "explanation": "총계가 있으니 GROUPING SETS가 아니고, 부서별과 연도별 소계가 모두 있으니 모든 조합을 만드는 CUBE예요."
  },
  {
    "id": "b-gfp-1",
    "concept": "gf_pick",
    "type": "빈칸",
    "level": 1,
    "family": "gf-pick",
    "options": [],
    "answer": -1,
    "stem": "결과표에 총계 행이 없다면 세 그룹 함수 중 ____ 를 쓴 것이다.",
    "blank": [
      "GROUPING SETS",
      "그루핑 세트",
      "groupingsets"
    ],
    "hints": [
      "ROLLUP과 CUBE는 총계를 자동으로 붙여요.",
      "나열한 그룹만 만드는 함수예요."
    ],
    "explanation": "ROLLUP과 CUBE는 총계를 붙이지만, GROUPING SETS는 ()를 나열하지 않으면 총계가 없어요."
  },
  {
    "id": "t-gfp-1",
    "concept": "gf_pick",
    "type": "대화형",
    "level": 2,
    "family": "gf-pick",
    "options": [],
    "answer": -1,
    "stem": "결과표만 보고 ROLLUP, CUBE, GROUPING SETS를 가려내는 순서를 설명해 보세요.",
    "talk": [
      {
        "label": "먼저 총계 행이 있는지 본다",
        "keywords": [
          "총계"
        ]
      },
      {
        "label": "총계가 없으면 GROUPING SETS다",
        "keywords": [
          "grouping sets"
        ]
      },
      {
        "label": "두 번째 컬럼만의 소계가 있으면 CUBE, 없으면 ROLLUP이다",
        "keywords": [
          "cube",
          "rollup"
        ]
      }
    ],
    "hints": [
      "모든 자리가 NULL인 행을 먼저 찾아보세요.",
      "DEPTNO 자리만 NULL인 행이 연도별 소계예요."
    ],
    "explanation": "총계 행이 없으면 GROUPING SETS예요. 총계가 있으면 연도별 소계처럼 두 번째 컬럼만의 소계가 있는지 봐요. 있으면 CUBE, 없으면 ROLLUP(DEPTNO, YR)이에요."
  },
  {
    "id": "q-gfg-1",
    "concept": "gf_grouping",
    "type": "객관식",
    "level": 3,
    "family": "gf-grouping",
    "stem": "EMP에 GROUP BY ROLLUP(DEPTNO)를 했다. 부서가 NULL인 조미정 한 명으로 된 행의 GROUPING(DEPTNO) 값은?",
    "options": [
      {
        "text": "0"
      },
      {
        "text": "1",
        "tag": "개념 혼동",
        "why": "컬럼 값이 NULL이면 GROUPING이 1이라고 생각했어요."
      },
      {
        "text": "NULL",
        "tag": "개념 부족"
      },
      {
        "text": "오류가 난다",
        "tag": "개념 부족"
      }
    ],
    "answer": 0,
    "hints": [
      "GROUPING은 값이 NULL인지가 아니라 묶음에서 뺐는지를 봐요.",
      "조미정 행은 DEPTNO의 원래 값으로 묶은 데이터 행이에요."
    ],
    "explanation": "조미정 행은 DEPTNO가 원래 NULL이라 생긴 데이터 행이라 GROUPING이 0이에요. 총계 행만 DEPTNO를 묶음에서 빼서 1이에요."
  },
  {
    "id": "b-gfg-1",
    "concept": "gf_grouping",
    "type": "빈칸",
    "level": 1,
    "family": "gf-grouping",
    "options": [],
    "answer": -1,
    "stem": "GROUPING(컬럼)은 그 컬럼을 묶음에서 빼고 집계한 소계·총계 행이면 ____ 을 돌려준다.",
    "blank": [
      "1",
      "일"
    ],
    "hints": [
      "0 아니면 이 값이에요.",
      "원래 값으로 묶은 행은 0이에요."
    ],
    "explanation": "소계나 총계 행이면 1, 원래 값으로 묶은 행이면 0이에요."
  },
  {
    "id": "t-gfg-1",
    "concept": "gf_grouping",
    "type": "대화형",
    "level": 3,
    "family": "gf-grouping",
    "options": [],
    "answer": -1,
    "stem": "ROLLUP(DEPTNO) 결과에서 DEPTNO가 NULL인 두 행을 GROUPING으로 어떻게 구분하는지 설명해 보세요.",
    "talk": [
      {
        "label": "조미정의 데이터 행은 GROUPING이 0이다",
        "keywords": [
          "0",
          "조미정",
          "데이터"
        ]
      },
      {
        "label": "총계 행은 GROUPING이 1이다",
        "keywords": [
          "1",
          "총계",
          "전체"
        ]
      },
      {
        "label": "CASE에서는 GROUPING 조건을 먼저 써야 한다",
        "keywords": [
          "case",
          "먼저",
          "decode"
        ]
      }
    ],
    "hints": [
      "두 행 모두 DEPTNO 자리는 NULL이에요.",
      "DEPTNO IS NULL을 먼저 쓰면 어떻게 될까요?"
    ],
    "explanation": "조미정 행은 원래 DEPTNO가 NULL인 그룹이라 GROUPING이 0이고, 총계 행은 DEPTNO를 빼고 집계해서 1이에요. CASE로 이름을 붙일 때는 GROUPING = 1 조건을 먼저 써야 총계가 '부서없음'으로 잘못 붙지 않아요."
  },
  {
    "id": "q-wfr-1",
    "concept": "wf_rank",
    "type": "객관식",
    "level": 2,
    "family": "wf-rank",
    "stem": "서인턴을 뺀 9명에게 RANK() OVER (ORDER BY SAL DESC)로 순위를 매겼다. 급여 4000인 최코드의 순위는?",
    "options": [
      {
        "text": "3",
        "tag": "개념 혼동",
        "why": "DENSE_RANK처럼 동점 다음 순위를 건너뛰지 않았어요."
      },
      {
        "text": "4"
      },
      {
        "text": "5",
        "tag": "개념 부족"
      },
      {
        "text": "2",
        "tag": "개념 부족"
      }
    ],
    "answer": 1,
    "hints": [
      "RANK는 나보다 앞선 사람 수 + 1이에요.",
      "최코드보다 많이 받는 사람은 김대표, 이개발, 박영업이에요."
    ],
    "explanation": "앞선 사람이 3명이라 RANK는 4예요. 6000 동점 두 명 때문에 3위가 비어요. DENSE_RANK였다면 3이에요."
  },
  {
    "id": "b-wfr-1",
    "concept": "wf_rank",
    "type": "빈칸",
    "level": 2,
    "family": "wf-null",
    "options": [],
    "answer": -1,
    "stem": "Oracle은 정렬할 때 NULL을 가장 ____ 값으로 다뤄서, DESC로 정렬하면 NULL이 맨 앞에 온다.",
    "blank": [
      "큰",
      "크다",
      "큰값"
    ],
    "hints": [
      "그래서 급여가 없는 서인턴이 DESC 순위 1위가 돼요.",
      "SQL Server는 반대로 가장 작은 값으로 다뤄요."
    ],
    "explanation": "Oracle은 NULL을 가장 큰 값으로 봐요. 맨 뒤로 보내려면 NULLS LAST를 붙여요."
  },
  {
    "id": "t-wfr-1",
    "concept": "wf_rank",
    "type": "대화형",
    "level": 1,
    "family": "wf-rank",
    "options": [],
    "answer": -1,
    "stem": "RANK, DENSE_RANK, ROW_NUMBER가 동점을 어떻게 다르게 처리하는지 설명해 보세요.",
    "talk": [
      {
        "label": "RANK는 동점 다음 순위를 건너뛴다",
        "keywords": [
          "건너",
          "rank"
        ]
      },
      {
        "label": "DENSE_RANK는 건너뛰지 않는다",
        "keywords": [
          "dense",
          "건너뛰지 않"
        ]
      },
      {
        "label": "ROW_NUMBER는 동점이어도 서로 다른 번호를 붙인다",
        "keywords": [
          "row_number",
          "다른 번호",
          "줄 번호"
        ]
      }
    ],
    "hints": [
      "급여 6000인 이개발과 박영업, 다음 4000인 최코드를 떠올려 보세요.",
      "1, 2, 2, 4와 1, 2, 2, 3을 비교해 보세요."
    ],
    "explanation": "RANK는 동점을 같은 순위로 두고 다음 순위를 건너뛰어요(1, 2, 2, 4). DENSE_RANK는 건너뛰지 않아요(1, 2, 2, 3). ROW_NUMBER는 동점이어도 1, 2, 3, 4처럼 서로 다른 번호를 붙여요."
  },
  {
    "id": "q-wff-1",
    "concept": "wf_frame",
    "type": "객관식",
    "level": 2,
    "family": "wf-frame",
    "stem": "급여가 있는 9명을 낮은 순으로 세우면 2800, 3000, 3000, … 이다. SUM(SAL) OVER (ORDER BY SAL)에서 급여 3000인 윤세일 행의 값은?",
    "options": [
      {
        "text": "5800",
        "tag": "개념 혼동",
        "why": "ROWS처럼 한 줄씩만 누적했어요."
      },
      {
        "text": "8800"
      },
      {
        "text": "3000",
        "tag": "개념 부족"
      },
      {
        "text": "41300",
        "tag": "개념 혼동",
        "why": "OVER ()처럼 전체 합계로 생각했어요."
      }
    ],
    "answer": 1,
    "hints": [
      "ORDER BY만 쓰면 기본 프레임은 RANGE예요.",
      "RANGE는 같은 값(동점)을 함께 넣어요."
    ],
    "explanation": "기본 프레임 RANGE는 3000 이하인 값을 모두 더해요. 2800 + 3000 + 3000 = 8800이라 동점인 윤세일과 강신입 모두 8800이에요."
  },
  {
    "id": "b-wff-1",
    "concept": "wf_frame",
    "type": "빈칸",
    "level": 2,
    "family": "wf-frame",
    "options": [],
    "answer": -1,
    "stem": "ORDER BY만 쓴 집계 윈도우 함수의 기본 프레임은 ____ 라서 동점 행이 같은 누적값을 받는다.",
    "blank": [
      "RANGE",
      "레인지"
    ],
    "hints": [
      "ROWS와 짝이 되는 말이에요.",
      "값을 기준으로 범위를 잡아요."
    ],
    "explanation": "ORDER BY만 쓰면 RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW가 기본이에요. 한 줄씩 누적하려면 ROWS를 직접 써요."
  },
  {
    "id": "t-wff-1",
    "concept": "wf_frame",
    "type": "대화형",
    "level": 2,
    "family": "wf-frame",
    "options": [],
    "answer": -1,
    "stem": "RANGE와 ROWS 프레임의 차이를 동점 행 예시로 설명해 보세요.",
    "talk": [
      {
        "label": "RANGE는 값 기준이라 동점을 함께 넣는다",
        "keywords": [
          "range",
          "값",
          "동점"
        ]
      },
      {
        "label": "ROWS는 실제 행을 한 줄씩 센다",
        "keywords": [
          "rows",
          "한 줄",
          "줄씩"
        ]
      },
      {
        "label": "윤세일은 RANGE 8800, ROWS 5800이다",
        "keywords": [
          "8800",
          "5800"
        ]
      }
    ],
    "hints": [
      "윤세일과 강신입은 둘 다 3000이에요.",
      "ROWS는 아직 오지 않은 다음 줄을 넣지 않아요."
    ],
    "explanation": "RANGE는 ORDER BY 값이 같은 행을 한 묶음으로 넣어서 윤세일 행에서도 강신입의 3000까지 더해 8800이에요. ROWS는 지금 줄까지만 세서 2800 + 3000 = 5800이고, 다음 줄 강신입에서 8800이 돼요."
  },
  {
    "id": "q-wfo-1",
    "concept": "wf_order",
    "type": "객관식",
    "level": 3,
    "family": "wf-lead",
    "stem": "LEAD(SAL, 1, 0) OVER (ORDER BY HIREDATE)에서 강신입의 다음 행인 서인턴은 급여가 NULL이다. 강신입 행의 값은?",
    "options": [
      {
        "text": "0",
        "tag": "개념 혼동",
        "why": "다음 값이 NULL이어도 기본값이 쓰인다고 생각했어요."
      },
      {
        "text": "NULL"
      },
      {
        "text": "3000",
        "tag": "개념 부족"
      },
      {
        "text": "오류가 난다",
        "tag": "개념 부족"
      }
    ],
    "answer": 1,
    "hints": [
      "기본값은 언제 쓰일까요?",
      "다음 행은 있지만, 그 행의 급여가 NULL이에요."
    ],
    "explanation": "기본값 0은 가리킬 행이 아예 없을 때만 써요. 다음 행 서인턴은 있으니 그 급여인 NULL을 그대로 가져와요."
  },
  {
    "id": "b-wfo-1",
    "concept": "wf_order",
    "type": "빈칸",
    "level": 2,
    "family": "wf-last",
    "options": [],
    "answer": -1,
    "stem": "LAST_VALUE로 파티션 전체의 마지막 값을 받으려면 프레임을 UNBOUNDED ____ 까지 넓혀야 한다.",
    "blank": [
      "FOLLOWING",
      "팔로잉"
    ],
    "hints": [
      "맨 마지막 행을 가리키는 표현이에요.",
      "PRECEDING의 반대말이에요."
    ],
    "explanation": "기본 프레임은 현재 행까지라 LAST_VALUE가 현재 행 값을 줘요. ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING으로 넓혀야 해요."
  },
  {
    "id": "t-wfo-1",
    "concept": "wf_order",
    "type": "대화형",
    "level": 2,
    "family": "wf-last",
    "options": [],
    "answer": -1,
    "stem": "LAST_VALUE(ENAME) OVER (ORDER BY HIREDATE)가 왜 마지막 입사자가 아니라 현재 행의 이름을 주는지 설명해 보세요.",
    "talk": [
      {
        "label": "기본 프레임은 처음부터 현재 행까지다",
        "keywords": [
          "현재 행",
          "current",
          "처음부터"
        ]
      },
      {
        "label": "그래서 프레임의 마지막이 현재 행 자신이다",
        "keywords": [
          "자기",
          "자신",
          "현재"
        ]
      },
      {
        "label": "UNBOUNDED FOLLOWING으로 넓히면 마지막 입사자가 나온다",
        "keywords": [
          "unbounded following",
          "following",
          "넓"
        ]
      }
    ],
    "hints": [
      "ORDER BY만 쓴 OVER의 기본 범위를 떠올려 보세요.",
      "이개발 행의 프레임은 김대표부터 이개발까지예요."
    ],
    "explanation": "ORDER BY만 쓰면 프레임이 처음부터 현재 행까지라, 그 끝은 늘 현재 행이에요. 그래서 LAST_VALUE가 자기 이름을 줘요. UNBOUNDED FOLLOWING까지 넓히면 모든 행에 마지막 입사자 서인턴이 나와요."
  },
  {
    "id": "q-wfq-1",
    "concept": "wf_ratio",
    "type": "객관식",
    "level": 3,
    "family": "wf-pr",
    "stem": "급여가 있는 9명에게 PERCENT_RANK() OVER (ORDER BY SAL)를 구했다. 낮은 순 RANK가 4인 한세일의 값은?",
    "options": [
      {
        "text": "0.375"
      },
      {
        "text": "0.444",
        "tag": "개념 혼동",
        "why": "CUME_DIST(4 ÷ 9)와 혼동했어요."
      },
      {
        "text": "0.333",
        "tag": "조건 누락",
        "why": "분모를 행 수 9로 잡았어요."
      },
      {
        "text": "0.5",
        "tag": "개념 부족"
      }
    ],
    "answer": 0,
    "hints": [
      "PERCENT_RANK는 (RANK − 1) ÷ (행 수 − 1)이에요.",
      "분모는 9 − 1 = 8이에요."
    ],
    "explanation": "(4 − 1) ÷ (9 − 1) = 3 ÷ 8 = 0.375예요. CUME_DIST는 3500 이하인 4명 ÷ 9 = 0.444라서 다른 값이에요."
  },
  {
    "id": "b-wfq-1",
    "concept": "wf_ratio",
    "type": "빈칸",
    "level": 2,
    "family": "wf-ntile",
    "options": [],
    "answer": -1,
    "stem": "NTILE(n)은 동점을 신경 쓰지 않고 ____ 수만으로 그룹을 나눈다.",
    "blank": [
      "행",
      "row",
      "줄"
    ],
    "hints": [
      "4000인 최코드와 정코드가 다른 그룹으로 갈라졌어요.",
      "값이 아니라 무엇을 세서 나눌까요?"
    ],
    "explanation": "NTILE은 행 수만으로 나눠요. 9행을 4그룹으로 나누면 3, 2, 2, 2행이 되고, 동점이어도 다른 그룹에 들어갈 수 있어요."
  },
  {
    "id": "t-wfq-1",
    "concept": "wf_ratio",
    "type": "대화형",
    "level": 3,
    "family": "wf-pr",
    "options": [],
    "answer": -1,
    "stem": "PERCENT_RANK와 CUME_DIST가 각각 어떻게 계산되는지 한세일(급여 3500) 예시로 설명해 보세요.",
    "talk": [
      {
        "label": "PERCENT_RANK는 (순위 − 1) ÷ (행 수 − 1)이다",
        "keywords": [
          "순위",
          "rank",
          "행 수 − 1",
          "8"
        ]
      },
      {
        "label": "CUME_DIST는 현재 값 이하인 행 수 ÷ 행 수다",
        "keywords": [
          "이하",
          "9",
          "cume"
        ]
      },
      {
        "label": "한세일은 0.375와 0.444다",
        "keywords": [
          "0.375",
          "0.444"
        ]
      }
    ],
    "hints": [
      "한세일보다 급여가 낮은 사람은 3명이에요.",
      "급여 있는 사람은 9명이에요."
    ],
    "explanation": "PERCENT_RANK는 한세일의 RANK 4로 (4 − 1) ÷ (9 − 1) = 0.375예요. CUME_DIST는 3500 이하인 4명을 9로 나눠 0.444예요."
  }
];
