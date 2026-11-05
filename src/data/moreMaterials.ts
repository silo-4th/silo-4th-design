import type { Material } from "./materials";

/** Generated from the study notes (03-subquery, 04-group-functions, 05-window-functions). */
export const MORE_MATERIALS: Material[] = [
  {
    "id": "subquery",
    "title": "서브쿼리",
    "subject": "2과목 · SQL 기본 및 활용",
    "chapter": "",
    "minutes": 35,
    "sections": [
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
              "서브쿼리가 돌려주는 결과(한 행, 여러 행, 여러 컬럼)에 맞는 연산자를 고를 수 있어요.",
              "서브쿼리를 쓰는 위치(SELECT 절, FROM 절, WHERE 절)에 따라 이름과 규칙이 어떻게 다른지 구분할 수 있어요.",
              "`> ANY`, `> ALL` 같은 조건을 최솟값·최댓값 비교로 바꿔서 결과를 예측할 수 있어요.",
              "연관 서브쿼리와 EXISTS가 어떻게 동작하는지 설명할 수 있어요.",
              "NOT IN 서브쿼리 결과에 NULL이 하나라도 섞이면 왜 결과가 0행이 되는지 설명할 수 있어요."
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
                "반환 결과에 따른 분류",
                "서브쿼리가 한 행을 돌려주면 `=`, 여러 행이면 `IN`·`ANY`·`ALL`, 여러 컬럼이면 `(컬럼1, 컬럼2) IN`을 써요"
              ],
              [
                "위치에 따른 분류와 뷰",
                "SELECT 절은 스칼라 서브쿼리, FROM 절은 인라인 뷰, WHERE·HAVING 절은 중첩 서브쿼리예요. 뷰는 SELECT에 이름을 붙여 저장한 거예요"
              ],
              [
                "연관 서브쿼리와 EXISTS",
                "메인쿼리의 컬럼을 쓰는 서브쿼리는 메인쿼리 행마다 다시 계산돼요. EXISTS는 결과가 한 행이라도 있으면 참이에요"
              ],
              [
                "NOT IN과 NULL",
                "NOT IN 목록에 NULL이 하나라도 있으면 결과가 0행이 돼요. NOT EXISTS는 NULL의 영향을 받지 않아요"
              ]
            ]
          },
          {
            "kind": "h2",
            "text": "이 단원에서 쓰는 데이터"
          },
          {
            "kind": "p",
            "text": "이 단원의 예제는 사원 테이블 `EMP`와 부서 테이블 `DEPT`를 써요. 아래는 이 단원에 필요한 컬럼만 뽑은 거예요."
          },
          {
            "kind": "h3",
            "text": "EMP (사원)"
          },
          {
            "kind": "table",
            "head": [
              "EMPNO (사번)",
              "ENAME (이름)",
              "JOB (직무)",
              "SAL (급여)",
              "DEPTNO (부서)"
            ],
            "rows": [
              [
                "1001",
                "김대표",
                "CEO",
                "9000",
                "10"
              ],
              [
                "1002",
                "이개발",
                "MANAGER",
                "6000",
                "10"
              ],
              [
                "1003",
                "박영업",
                "MANAGER",
                "6000",
                "20"
              ],
              [
                "1004",
                "최코드",
                "DEV",
                "4000",
                "10"
              ],
              [
                "1005",
                "정코드",
                "DEV",
                "4000",
                "10"
              ],
              [
                "1006",
                "한세일",
                "SALES",
                "3500",
                "20"
              ],
              [
                "1007",
                "윤세일",
                "SALES",
                "3000",
                "20"
              ],
              [
                "1008",
                "강신입",
                "DEV",
                "3000",
                "10"
              ],
              [
                "1009",
                "조미정",
                "SALES",
                "2800",
                "NULL"
              ],
              [
                "1010",
                "서인턴",
                "DEV",
                "NULL",
                "10"
              ]
            ]
          },
          {
            "kind": "h3",
            "text": "DEPT (부서)"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO (부서 번호)",
              "DNAME (부서 이름)"
            ],
            "rows": [
              [
                "10",
                "개발"
              ],
              [
                "20",
                "영업"
              ],
              [
                "30",
                "기획"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "시험에 자주 나오는 함정이 데이터에 일부러 들어 있어요. 아래 내용을 기억해 두면 예제를 따라가기 쉬워요."
          },
          {
            "kind": "ul",
            "items": [
              "**서인턴**은 급여(SAL)가 NULL이에요. 급여를 비교하는 조건에서는 늘 빠져요.",
              "**조미정**은 부서(DEPTNO)가 NULL이에요. 아직 부서에 배치되지 않았어요. 이 단원의 NOT IN 함정은 조미정 때문에 생겨요.",
              "**30번 기획 부서**에는 사원이 한 명도 없어요."
            ]
          }
        ]
      },
      {
        "id": "s1",
        "title": "1. 반환 결과에 따른 분류",
        "concept": "sq_return",
        "blocks": [
          {
            "kind": "p",
            "text": "서브쿼리(Subquery)는 SQL 문장 안에 괄호로 넣은 또 하나의 SELECT예요. 서브쿼리를 품고 있는 바깥쪽 SELECT는 메인쿼리라고 불러요. 메인쿼리는 서브쿼리의 결과를 값처럼 받아서 써요."
          },
          {
            "kind": "p",
            "text": "그래서 **서브쿼리가 몇 행, 몇 컬럼을 돌려주는지에 맞는 연산자**를 써야 해요."
          },
          {
            "kind": "table",
            "head": [
              "서브쿼리 결과",
              "이름",
              "쓸 수 있는 연산자"
            ],
            "rows": [
              [
                "1행",
                "단일 행 서브쿼리",
                "`=`, `<>`, `>`, `>=`, `<`, `<=`"
              ],
              [
                "여러 행",
                "다중 행 서브쿼리",
                "`IN`, `NOT IN`, `ANY`(`SOME`), `ALL`, `EXISTS`"
              ],
              [
                "여러 컬럼",
                "다중 컬럼 서브쿼리",
                "`(컬럼1, 컬럼2) IN (SELECT a, b ...)`"
              ]
            ]
          },
          {
            "kind": "h3",
            "text": "단일 행 서브쿼리"
          },
          {
            "kind": "p",
            "text": "전체 평균 급여보다 많이 받는 사원을 찾아볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, SAL\nFROM EMP\nWHERE SAL > (SELECT AVG(SAL) FROM EMP)\nORDER BY EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "SAL"
            ],
            "rows": [
              [
                "김대표",
                "9000"
              ],
              [
                "이개발",
                "6000"
              ],
              [
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
              "서브쿼리 `SELECT AVG(SAL) FROM EMP`가 먼저 계산돼요. 급여 합계 41300을, 급여가 있는 9명(서인턴 제외)으로 나눠서 약 4588.9예요. 결과가 한 행이라서 `>`를 쓸 수 있어요.",
              "메인쿼리는 `WHERE SAL > 4588.9`처럼 동작해요.",
              "4588.9보다 많이 받는 김대표(9000), 이개발(6000), 박영업(6000) 3명이 남아요."
            ]
          },
          {
            "kind": "h3",
            "text": "여러 행이 나오는데 `=`를 쓰면 오류예요"
          },
          {
            "kind": "code",
            "text": "-- 오류 (ORA-01427)\nSELECT ENAME, SAL\nFROM EMP\nWHERE SAL = (SELECT SAL FROM EMP WHERE DEPTNO = 20);"
          },
          {
            "kind": "p",
            "text": "20번 부서 사원은 박영업(6000), 한세일(3500), 윤세일(3000) 3명이라서 서브쿼리가 3행을 돌려줘요. `=`는 값 하나와만 비교할 수 있기 때문에 오류가 나요. 서브쿼리가 여러 행을 돌려줄 수 있다면 `IN`, `ANY`, `ALL`을 써야 해요."
          },
          {
            "kind": "h3",
            "text": "다중 행 서브쿼리: ANY와 ALL"
          },
          {
            "kind": "p",
            "text": "`ANY`는 \"목록 안의 값 중 **하나라도** 조건을 만족하면 참\"이고, `ALL`은 \"목록 안의 값 **모두에 대해** 조건을 만족해야 참\"이에요. `SOME`은 `ANY`와 같은 뜻이에요."
          },
          {
            "kind": "p",
            "text": "20번 부서의 누군가보다 많이 받는 사원을 찾아볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, SAL\nFROM EMP\nWHERE SAL > ANY (SELECT SAL\n                 FROM EMP\n                 WHERE DEPTNO = 20)\nORDER BY EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "SAL"
            ],
            "rows": [
              [
                "김대표",
                "9000"
              ],
              [
                "이개발",
                "6000"
              ],
              [
                "박영업",
                "6000"
              ],
              [
                "최코드",
                "4000"
              ],
              [
                "정코드",
                "4000"
              ],
              [
                "한세일",
                "3500"
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
              "서브쿼리 결과는 {6000, 3500, 3000}이에요.",
              "`> ANY`는 이 중 하나보다만 크면 참이에요. 가장 작은 값인 3000보다 크기만 하면 되니까, 결국 `> 3000`과 같아요.",
              "3000을 받는 윤세일과 강신입은 3000보다 \"크지\" 않아서 빠져요. 2800을 받는 조미정도 빠져요.",
              "서인턴은 급여가 NULL이라 비교 결과가 UNKNOWN(참도 거짓도 아닌 상태)이 되고, WHERE는 참인 행만 남기기 때문에 빠져요.",
              "그래서 6명이 남아요."
            ]
          },
          {
            "kind": "p",
            "text": "같은 서브쿼리에 `ALL`을 쓰면 결과가 크게 달라져요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, SAL\nFROM EMP\nWHERE SAL > ALL (SELECT SAL\n                 FROM EMP\n                 WHERE DEPTNO = 20)\nORDER BY EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "SAL"
            ],
            "rows": [
              [
                "김대표",
                "9000"
              ]
            ]
          },
          {
            "kind": "ol",
            "items": [
              "`> ALL`은 6000, 3500, 3000 **모두보다** 커야 해요. 가장 큰 값인 6000보다 커야 한다는 뜻이라서 `> 6000`과 같아요.",
              "이개발과 박영업은 6000으로 같아서 \"크지\" 않아요. 그래서 김대표 1명만 남아요.",
              "방향을 바꿔 `< ALL`로 쓰면 가장 작은 값 3000보다 작아야 해서, 2800인 조미정 1명만 나와요."
            ]
          },
          {
            "kind": "p",
            "text": "ANY와 ALL은 최솟값·최댓값으로 바꿔서 생각하면 쉬워요."
          },
          {
            "kind": "table",
            "head": [
              "조건",
              "같은 뜻",
              "이 데이터에서"
            ],
            "rows": [
              [
                "`> ANY`",
                "`> MIN` (최솟값보다 크다)",
                "`> 3000` → 6명"
              ],
              [
                "`< ANY`",
                "`< MAX` (최댓값보다 작다)",
                "`< 6000` → 6명"
              ],
              [
                "`> ALL`",
                "`> MAX` (최댓값보다 크다)",
                "`> 6000` → 1명"
              ],
              [
                "`< ALL`",
                "`< MIN` (최솟값보다 작다)",
                "`< 3000` → 1명"
              ],
              [
                "`= ANY`",
                "`IN`",
                "6000, 3500, 3000 중 하나 → 5명"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "`< ANY`의 6명은 최코드, 정코드, 한세일, 윤세일, 강신입, 조미정이에요. `= ANY`의 5명은 이개발, 박영업, 한세일, 윤세일, 강신입이에요."
          },
          {
            "kind": "h3",
            "text": "다중 컬럼 서브쿼리"
          },
          {
            "kind": "p",
            "text": "서브쿼리가 컬럼 두 개 이상을 돌려주면, 메인쿼리에서도 컬럼을 괄호로 묶어 짝을 맞춰 비교해요. 부서별로 가장 많이 받는 사원을 찾아볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, DEPTNO, SAL\nFROM EMP\nWHERE (DEPTNO, SAL) IN (SELECT DEPTNO, MAX(SAL)\n                        FROM EMP\n                        GROUP BY DEPTNO)\nORDER BY EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "DEPTNO",
              "SAL"
            ],
            "rows": [
              [
                "김대표",
                "10",
                "9000"
              ],
              [
                "박영업",
                "20",
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
              "서브쿼리는 부서별 최고 급여를 구해요. 결과는 (10, 9000), (20, 6000), (NULL, 2800) 3행이에요. 마지막 행은 부서가 NULL인 조미정 혼자 만든 그룹이에요.",
              "메인쿼리는 각 사원의 (DEPTNO, SAL) 짝이 이 3개 중 하나와 똑같은지 봐요. 김대표의 (10, 9000)과 박영업의 (20, 6000)이 맞아요.",
              "조미정의 (NULL, 2800)은 서브쿼리 결과에 그대로 있는데도 빠져요. `NULL = NULL`은 참이 아니라 UNKNOWN이기 때문이에요."
            ]
          },
          {
            "kind": "p",
            "text": "참고로 다중 컬럼 IN은 Oracle에서는 쓸 수 있지만, SQL Server에서는 지원하지 않아요."
          }
        ]
      },
      {
        "id": "s2",
        "title": "2. 위치에 따른 분류와 뷰",
        "concept": "sq_position",
        "blocks": [
          {
            "kind": "p",
            "text": "서브쿼리는 SQL의 어느 절에 들어가느냐에 따라서도 이름과 규칙이 달라요."
          },
          {
            "kind": "table",
            "head": [
              "위치",
              "이름",
              "특징"
            ],
            "rows": [
              [
                "SELECT 절",
                "스칼라 서브쿼리",
                "반드시 1행 1열을 돌려줘야 해요. 0행이면 NULL, 2행 이상이면 오류예요"
              ],
              [
                "FROM 절",
                "인라인 뷰",
                "실행할 때 만들어지는 임시 테이블이에요. 안의 컬럼을 메인쿼리에서 쓸 수 있고, ORDER BY도 쓸 수 있어요"
              ],
              [
                "WHERE / HAVING 절",
                "중첩 서브쿼리",
                "조건을 비교할 때 써요. 1번에서 본 예제가 모두 여기에 해당해요"
              ]
            ]
          },
          {
            "kind": "h3",
            "text": "스칼라 서브쿼리"
          },
          {
            "kind": "p",
            "text": "스칼라(scalar)는 \"값 하나\"라는 뜻이에요. SELECT 절에 넣은 서브쿼리는 컬럼 자리에 들어가기 때문에, 행마다 값 하나만 돌려줘야 해요. SALES 직무 사원의 부서 이름을 붙여 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT E.ENAME,\n       (SELECT D.DNAME\n        FROM DEPT D\n        WHERE D.DEPTNO = E.DEPTNO) AS DNAME\nFROM EMP E\nWHERE E.JOB = 'SALES'\nORDER BY E.EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "DNAME"
            ],
            "rows": [
              [
                "한세일",
                "영업"
              ],
              [
                "윤세일",
                "영업"
              ],
              [
                "조미정",
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
              "SALES 사원은 한세일, 윤세일, 조미정 3명이에요. 스칼라 서브쿼리는 이 3명 각각에 대해 한 번씩 부서 이름을 찾아요.",
              "한세일과 윤세일은 20번 부서라서 '영업'을 찾아요.",
              "조미정은 DEPTNO가 NULL이라 맞는 부서가 없어서 서브쿼리가 0행을 돌려줘요. 이때 **오류가 아니라 NULL**이 돼요. 조미정의 행 자체는 결과에 남아요. 같은 내용을 INNER JOIN으로 썼다면 조미정은 빠졌을 거예요.",
              "서브쿼리에서 조건을 빼고 `(SELECT DNAME FROM DEPT)`로 쓰면 3행(개발, 영업, 기획)이 나와서 오류가 나요."
            ]
          },
          {
            "kind": "h3",
            "text": "인라인 뷰"
          },
          {
            "kind": "p",
            "text": "FROM 절에 넣은 서브쿼리는 그 자리에서 임시 테이블처럼 쓰여요. 부서별 인원과 평균 급여를 먼저 만들고, 그 결과를 DEPT와 조인해 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT D.DNAME,\n       V.CNT,\n       ROUND(V.AVG_SAL) AS AVG_SAL\nFROM DEPT D,\n     (SELECT DEPTNO,\n             COUNT(*) AS CNT,\n             AVG(SAL) AS AVG_SAL\n      FROM EMP\n      GROUP BY DEPTNO) V\nWHERE D.DEPTNO = V.DEPTNO\nORDER BY D.DEPTNO;"
          },
          {
            "kind": "table",
            "head": [
              "DNAME",
              "CNT",
              "AVG_SAL"
            ],
            "rows": [
              [
                "개발",
                "6",
                "5200"
              ],
              [
                "영업",
                "3",
                "4167"
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
              "인라인 뷰 V는 부서별로 묶어서 (10, 6명, 5200), (20, 3명, 4166.7), (NULL, 1명, 2800) 3행을 만들어요.",
              "10번 부서의 평균은 26000 ÷ 6이 아니라 26000 ÷ 5 = 5200이에요. AVG는 NULL을 빼고 계산하기 때문에 서인턴이 나누는 수에서 빠졌어요.",
              "DEPT와 부서 번호로 조인하면 개발(10)과 영업(20)만 짝이 맞아요. 조미정의 NULL 그룹은 짝이 없어서 빠지고, 30번 기획은 V에 행이 없어서 빠져요.",
              "메인쿼리가 인라인 뷰 안에서 만든 컬럼 `V.CNT`, `V.AVG_SAL`을 그대로 SELECT에 썼어요. **인라인 뷰의 컬럼은 메인쿼리에서 쓸 수 있지만, WHERE 절 중첩 서브쿼리의 컬럼은 메인쿼리에서 쓸 수 없어요.** 이 차이가 시험에 나와요."
            ]
          },
          {
            "kind": "h3",
            "text": "뷰(View)"
          },
          {
            "kind": "p",
            "text": "뷰는 SELECT 문장에 이름을 붙여 데이터베이스에 저장해 둔 거예요. 인라인 뷰를 이름 붙여 저장했다고 생각하면 돼요. 뷰는 데이터를 따로 저장하지 않고 SELECT 정의만 저장하기 때문에 **가상 테이블**이라고 불러요. 뷰를 조회할 때마다 저장된 SELECT가 실행돼요."
          },
          {
            "kind": "p",
            "text": "사원과 부서를 조인한 결과를 뷰로 만들어 볼게요."
          },
          {
            "kind": "code",
            "text": "CREATE VIEW V_EMP_DEPT AS\nSELECT E.EMPNO, E.ENAME, D.DNAME\nFROM EMP E\nJOIN DEPT D ON E.DEPTNO = D.DEPTNO;"
          },
          {
            "kind": "p",
            "text": "이제 이 뷰를 테이블처럼 조회할 수 있어요."
          },
          {
            "kind": "code",
            "text": "SELECT DNAME, COUNT(*) AS CNT\nFROM V_EMP_DEPT\nGROUP BY DNAME;"
          },
          {
            "kind": "table",
            "head": [
              "DNAME",
              "CNT"
            ],
            "rows": [
              [
                "개발",
                "6"
              ],
              [
                "영업",
                "3"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "뷰 안의 조인이 INNER JOIN이라서 부서가 없는 조미정은 뷰에 들어가지 않아요. 그래서 개발 6명, 영업 3명으로 모두 9명이에요."
          },
          {
            "kind": "p",
            "text": "뷰의 장점은 세 가지로 정리돼요."
          },
          {
            "kind": "table",
            "head": [
              "장점",
              "뜻"
            ],
            "rows": [
              [
                "독립성",
                "테이블 구조가 바뀌어도 뷰 정의만 고치면, 뷰를 쓰는 SQL은 그대로 둘 수 있어요"
              ],
              [
                "편리성",
                "복잡한 조인이나 조건을 이름 하나로 간단히 쓸 수 있어요"
              ],
              [
                "보안성",
                "보여 주고 싶은 컬럼만 담아서, 나머지 컬럼은 숨길 수 있어요"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "뷰의 정의는 **ALTER VIEW로 바꿀 수 없어요.** 정의를 바꾸려면 DROP VIEW로 지우고 다시 만들어야 해요. Oracle에서는 `CREATE OR REPLACE VIEW`로 한 번에 다시 만들 수 있어요."
          }
        ]
      },
      {
        "id": "s3",
        "title": "3. 연관 서브쿼리와 EXISTS",
        "concept": "sq_corr",
        "blocks": [
          {
            "kind": "p",
            "text": "서브쿼리는 메인쿼리의 컬럼을 쓰는지에 따라 두 가지로 나뉘어요."
          },
          {
            "kind": "table",
            "head": [
              "종류",
              "메인쿼리 컬럼 사용",
              "실행 방식"
            ],
            "rows": [
              [
                "비연관 서브쿼리",
                "쓰지 않아요",
                "서브쿼리가 혼자 한 번 실행되고, 그 결과를 메인쿼리에 넘겨요"
              ],
              [
                "연관 서브쿼리",
                "써요",
                "메인쿼리의 행이 바뀔 때마다 서브쿼리가 다시 계산돼요"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "1번에서 본 예제들은 모두 비연관 서브쿼리예요. 이번에는 연관 서브쿼리로 \"자기 부서 평균보다 많이 받는 사원\"을 찾아볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT E.ENAME, E.DEPTNO, E.SAL\nFROM EMP E\nWHERE E.SAL > (SELECT AVG(X.SAL)\n               FROM EMP X\n               WHERE X.DEPTNO = E.DEPTNO)\nORDER BY E.EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "DEPTNO",
              "SAL"
            ],
            "rows": [
              [
                "김대표",
                "10",
                "9000"
              ],
              [
                "이개발",
                "10",
                "6000"
              ],
              [
                "박영업",
                "20",
                "6000"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "서브쿼리 안의 `E.DEPTNO`는 메인쿼리의 사원 E를 가리켜요. 그래서 메인쿼리가 어떤 사원을 보고 있느냐에 따라 서브쿼리가 구하는 평균이 달라져요."
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "이개발(10번)을 볼 때 서브쿼리는 `X.DEPTNO = 10`으로 10번 부서 평균 5200을 구해요. 6000 > 5200이라 참이에요. 김대표(9000)도 같은 이유로 남아요.",
              "최코드(10번, 4000)는 4000 > 5200이 거짓이라 빠져요.",
              "한세일(20번)을 볼 때 서브쿼리는 20번 부서 평균 약 4166.7을 구해요. 3500 > 4166.7이 거짓이라 빠져요. 박영업(6000)은 참이라 남아요.",
              "조미정은 `X.DEPTNO = NULL`이 어떤 행과도 맞지 않아서 평균이 NULL이에요. 비교가 UNKNOWN이 되어 빠져요.",
              "서인턴은 자기 급여가 NULL이라 비교가 UNKNOWN이 되어 빠져요."
            ]
          },
          {
            "kind": "h3",
            "text": "EXISTS"
          },
          {
            "kind": "p",
            "text": "EXISTS는 서브쿼리 결과가 **한 행이라도 있으면 참**, 한 행도 없으면 거짓이에요. 행이 있는지만 보고 값은 보지 않기 때문에, 서브쿼리의 SELECT에는 `SELECT 1`이나 `SELECT 'X'`처럼 아무 값이나 써요. 주로 연관 서브쿼리와 함께 써요."
          },
          {
            "kind": "p",
            "text": "사원이 한 명도 없는 부서를 찾아볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT D.DEPTNO, D.DNAME\nFROM DEPT D\nWHERE NOT EXISTS (SELECT 1\n                  FROM EMP E\n                  WHERE E.DEPTNO = D.DEPTNO)\nORDER BY D.DEPTNO;"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "DNAME"
            ],
            "rows": [
              [
                "30",
                "기획"
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
              "10번 개발을 볼 때 서브쿼리는 10번 부서 사원 6명을 찾아요. 행이 있으니 EXISTS는 참, NOT EXISTS는 거짓이라 빠져요.",
              "20번 영업도 사원 3명이 있어서 빠져요.",
              "30번 기획을 볼 때 서브쿼리는 0행이에요. NOT EXISTS가 참이라 남아요."
            ]
          },
          {
            "kind": "p",
            "text": "`NOT EXISTS`를 `EXISTS`로 바꾸면 반대로 사원이 있는 10 개발, 20 영업 2행이 나와요."
          }
        ]
      },
      {
        "id": "s4",
        "title": "4. NOT IN과 NULL 함정",
        "concept": "sq_notin",
        "blocks": [
          {
            "kind": "p",
            "text": "3번에서 NOT EXISTS로 찾은 \"사원이 없는 부서\"를 NOT IN으로 찾아볼게요. 같은 결과가 나올 것 같지만, 결과가 비어 있어요."
          },
          {
            "kind": "code",
            "text": "SELECT D.DEPTNO, D.DNAME\nFROM DEPT D\nWHERE D.DEPTNO NOT IN (SELECT E.DEPTNO\n                       FROM EMP E);"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "DNAME"
            ],
            "rows": []
          },
          {
            "kind": "p",
            "text": "0행이에요. 하나씩 따라가 볼게요."
          },
          {
            "kind": "ol",
            "items": [
              "서브쿼리는 사원 10명의 부서 번호를 돌려줘요. 겹치는 값을 빼면 {10, 20, NULL}이에요. NULL은 조미정의 부서예요.",
              "`NOT IN`은 \"목록의 모든 값과 다르다\"는 뜻이라서, `AND`로 이어진 비교로 바뀌어요. 30번 부서라면 `30 <> 10 AND 30 <> 20 AND 30 <> NULL`이에요.",
              "`30 <> 10`은 참, `30 <> 20`도 참이에요. 그런데 `30 <> NULL`은 NULL과 비교했기 때문에 UNKNOWN이에요.",
              "참 AND 참 AND UNKNOWN은 UNKNOWN이에요. WHERE는 참인 행만 남기기 때문에 30번도 빠져요. 10번과 20번은 목록에 있어서 처음부터 거짓이에요.",
              "그래서 아무 행도 남지 않아요."
            ]
          },
          {
            "kind": "p",
            "text": "해결하려면 서브쿼리에서 NULL을 빼면 돼요."
          },
          {
            "kind": "code",
            "text": "SELECT D.DEPTNO, D.DNAME\nFROM DEPT D\nWHERE D.DEPTNO NOT IN (SELECT E.DEPTNO\n                       FROM EMP E\n                       WHERE E.DEPTNO IS NOT NULL);"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "DNAME"
            ],
            "rows": [
              [
                "30",
                "기획"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "이제 목록이 {10, 20}이 되어서 `30 <> 10 AND 30 <> 20`이 참이고, 30 기획 1행이 나와요."
          },
          {
            "kind": "h3",
            "text": "NOT EXISTS와 IN은 괜찮아요"
          },
          {
            "kind": "ul",
            "items": [
              "NOT EXISTS는 \"짝이 되는 행이 있는가\"만 보기 때문에 NULL의 영향을 받지 않아요. 3번 예제에서 NULL을 따로 빼지 않았는데도 30 기획이 제대로 나왔어요.",
              "`IN`은 NULL이 섞여도 괜찮아요. `x IN (10, 20, NULL)`은 `x = 10 OR x = 20 OR x = NULL`이라서, 맞는 값이 하나라도 있으면 참이에요. 그래서 `DEPTNO IN (SELECT DEPTNO FROM EMP)`는 10 개발, 20 영업 2행이 정상으로 나와요."
            ]
          },
          {
            "kind": "p",
            "text": "정리하면, **NULL이 문제를 일으키는 것은 NOT IN뿐**이에요."
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
                "`> ANY`는 \"모두보다 크다\"는 뜻이다",
                "`> ANY`는 하나라도보다 크면, 즉 최솟값보다 크면 참이에요. 20번 부서 급여로 비교하면 `> 3000`이라 6명이에요. \"모두보다 크다\"는 `> ALL`이고, `> 6000`이라 김대표 1명이에요"
              ],
              [
                "여러 행이 나오는 서브쿼리에도 `=`를 쓸 수 있다",
                "오류(ORA-01427)가 나요. 20번 부서 급여는 3행이라 `IN`이나 `ANY`를 써야 해요"
              ],
              [
                "스칼라 서브쿼리가 0행이면 오류다",
                "0행이면 NULL이 돼요. 조미정의 부서 이름이 NULL로 나온 것처럼요. 오류는 2행 이상일 때 나요"
              ],
              [
                "NOT IN과 NOT EXISTS는 언제나 결과가 같다",
                "서브쿼리 결과에 NULL이 있으면 NOT IN만 0행이 돼요. 같은 질문에 NOT EXISTS는 30 기획 1행, NOT IN은 0행이었어요"
              ],
              [
                "서브쿼리 안의 컬럼은 메인쿼리 SELECT에서 쓸 수 있다",
                "WHERE 절 중첩 서브쿼리의 컬럼은 쓸 수 없어요. FROM 절 인라인 뷰의 컬럼만 쓸 수 있어요"
              ],
              [
                "뷰는 결과 데이터를 따로 저장한다",
                "뷰는 SELECT 정의만 저장하는 가상 테이블이에요. 조회할 때마다 SELECT가 다시 실행돼요"
              ],
              [
                "뷰 정의는 ALTER VIEW로 고친다",
                "ALTER VIEW로는 정의를 바꿀 수 없어요. 지우고 다시 만들거나, Oracle에서는 `CREATE OR REPLACE VIEW`를 써요"
              ]
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "groupfn",
    "title": "그룹 함수",
    "subject": "2과목 · SQL 기본 및 활용",
    "chapter": "",
    "minutes": 30,
    "sections": [
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
              "ROLLUP, CUBE, GROUPING SETS가 각각 어떤 소계와 총계를 만드는지 설명할 수 있어요.",
              "결과표에서 어떤 행이 상세 행이고, 어떤 행이 소계나 총계 행인지 알아볼 수 있어요.",
              "ROLLUP의 인자 순서를 바꿨을 때 결과가 어떻게 달라지는지 예측할 수 있어요.",
              "결과표만 보고 ROLLUP, CUBE, GROUPING SETS 중 무엇을 썼는지 고를 수 있어요.",
              "GROUPING 함수로 소계 행의 NULL과 원래 데이터의 NULL을 구분할 수 있어요."
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
                "ROLLUP과 인자 순서",
                "오른쪽 컬럼부터 하나씩 빼면서 소계를 만들고, 마지막에 총계를 붙여요. 인자 순서가 바뀌면 소계 기준이 바뀌어요"
              ],
              [
                "CUBE와 GROUPING SETS",
                "CUBE는 가능한 모든 조합(2^n개)의 소계와 총계를 만들어요. GROUPING SETS는 괄호 안에 나열한 그룹만 만들고, 총계는 붙이지 않아요"
              ],
              [
                "결과표로 그룹 함수 고르기",
                "총계 행이 있는지, 두 번째 컬럼만의 소계 행이 있는지를 보고 셋을 가려요"
              ],
              [
                "GROUPING 함수",
                "그 행이 해당 컬럼을 빼고 집계한 소계·총계 행이면 1, 아니면 0을 돌려줘요. 소계의 NULL과 데이터의 NULL을 구분할 때 써요"
              ]
            ]
          },
          {
            "kind": "h2",
            "text": "이 단원에서 쓰는 데이터"
          },
          {
            "kind": "p",
            "text": "GROUP BY 하나로는 \"부서별 합계\"처럼 한 가지 기준의 결과만 나와요. 이 단원에서 배우는 그룹 함수(ROLLUP, CUBE, GROUPING SETS)를 쓰면 여기에 **소계 행과 총계 행**을 한 번에 붙일 수 있어요. 시험에서는 결과표를 보여 주고 \"어떤 GROUP BY를 썼나\"를 고르게 하는 문제가 많이 나와요."
          },
          {
            "kind": "p",
            "text": "설명 1~3의 예제는 매출 테이블 `SALES`를 써요. 부서별, 연도별, 분기별 매출 금액이 들어 있어요."
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO (부서)",
              "YR (연도)",
              "QTR (분기)",
              "AMT (금액)"
            ],
            "rows": [
              [
                "10",
                "2025",
                "Q1",
                "100"
              ],
              [
                "10",
                "2025",
                "Q2",
                "150"
              ],
              [
                "10",
                "2026",
                "Q1",
                "80"
              ],
              [
                "20",
                "2025",
                "Q1",
                "200"
              ],
              [
                "20",
                "2025",
                "Q2",
                "NULL"
              ],
              [
                "20",
                "2026",
                "Q1",
                "120"
              ]
            ]
          },
          {
            "kind": "ul",
            "items": [
              "**20번 부서의 2025년 Q2** 행은 금액(AMT)이 NULL이에요. SUM은 NULL을 빼고 더하기 때문에, 20번 부서의 2025년 합계는 200 + NULL이 아니라 200이에요."
            ]
          },
          {
            "kind": "p",
            "text": "설명 4의 예제는 사원 테이블 `EMP`를 써요. 아래는 필요한 컬럼만 뽑은 거예요."
          },
          {
            "kind": "table",
            "head": [
              "ENAME (이름)",
              "SAL (급여)",
              "DEPTNO (부서)"
            ],
            "rows": [
              [
                "김대표",
                "9000",
                "10"
              ],
              [
                "이개발",
                "6000",
                "10"
              ],
              [
                "최코드",
                "4000",
                "10"
              ],
              [
                "정코드",
                "4000",
                "10"
              ],
              [
                "강신입",
                "3000",
                "10"
              ],
              [
                "서인턴",
                "NULL",
                "10"
              ],
              [
                "박영업",
                "6000",
                "20"
              ],
              [
                "한세일",
                "3500",
                "20"
              ],
              [
                "윤세일",
                "3000",
                "20"
              ],
              [
                "조미정",
                "2800",
                "NULL"
              ]
            ]
          },
          {
            "kind": "ul",
            "items": [
              "**조미정**은 부서(DEPTNO)가 NULL이에요. 이 사람 때문에 결과표에 \"부서가 NULL인 행\"이 생겨서, 소계 행과 헷갈리게 돼요. 설명 4에서 다뤄요.",
              "**서인턴**은 급여(SAL)가 NULL이에요. 10번 부서의 급여 합계에서 빠져요."
            ]
          }
        ]
      },
      {
        "id": "s1",
        "title": "1. ROLLUP과 인자 순서",
        "concept": "gf_rollup",
        "blocks": [
          {
            "kind": "p",
            "text": "먼저 그룹 함수 없이 부서별, 연도별 합계를 구해 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT DEPTNO, YR, SUM(AMT) AS TOTAL\nFROM SALES\nGROUP BY DEPTNO, YR\nORDER BY DEPTNO, YR;"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "YR",
              "TOTAL"
            ],
            "rows": [
              [
                "10",
                "2025",
                "250"
              ],
              [
                "10",
                "2026",
                "80"
              ],
              [
                "20",
                "2025",
                "200"
              ],
              [
                "20",
                "2026",
                "120"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "부서와 연도가 모두 값으로 채워진 4행이 나와요. 이렇게 GROUP BY 기준 컬럼이 모두 값으로 채워진 행을 이 단원에서는 **상세 행**이라고 부를게요."
          },
          {
            "kind": "p",
            "text": "이제 GROUP BY 자리에 `ROLLUP(DEPTNO, YR)`을 써 볼게요. ROLLUP은 상세 행에 더해, **오른쪽 컬럼부터 하나씩 빼면서** 다시 집계한 행을 붙여 줘요."
          },
          {
            "kind": "ul",
            "items": [
              "(DEPTNO, YR)로 묶은 상세 행",
              "YR을 빼고 DEPTNO로만 묶은 **부서별 소계** 행",
              "둘 다 빼고 전체를 하나로 묶은 **총계** 행"
            ]
          },
          {
            "kind": "p",
            "text": "그래서 컬럼이 n개면 묶는 단계는 n + 1개예요. 컬럼이 2개인 지금은 3단계예요."
          },
          {
            "kind": "code",
            "text": "SELECT DEPTNO, YR, SUM(AMT) AS TOTAL\nFROM SALES\nGROUP BY ROLLUP(DEPTNO, YR)\nORDER BY DEPTNO, YR;"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "YR",
              "TOTAL"
            ],
            "rows": [
              [
                "10",
                "2025",
                "250"
              ],
              [
                "10",
                "2026",
                "80"
              ],
              [
                "10",
                "NULL",
                "330"
              ],
              [
                "20",
                "2025",
                "200"
              ],
              [
                "20",
                "2026",
                "120"
              ],
              [
                "20",
                "NULL",
                "320"
              ],
              [
                "NULL",
                "NULL",
                "650"
              ]
            ]
          },
          {
            "kind": "h3",
            "text": "소계와 총계 행은 이렇게 알아봐요"
          },
          {
            "kind": "p",
            "text": "소계 행에서는 묶음에서 뺀 컬럼에 넣을 값이 없어요. 그래서 그 자리가 **NULL**로 나와요. 결과표에서 NULL이 어느 자리에 있는지를 보면 행의 종류를 알 수 있어요."
          },
          {
            "kind": "table",
            "head": [
              "행 모양",
              "무슨 행인지",
              "위 결과의 예"
            ],
            "rows": [
              [
                "두 자리 모두 값",
                "상세 행",
                "10, 2025, 250"
              ],
              [
                "YR 자리만 NULL",
                "부서별 소계 (연도를 뺌)",
                "10, NULL, 330"
              ],
              [
                "DEPTNO 자리만 NULL",
                "연도별 소계 (부서를 뺌)",
                "이 결과에는 없어요"
              ],
              [
                "두 자리 모두 NULL",
                "총계 (둘 다 뺌)",
                "NULL, NULL, 650"
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
              "처음 4행은 상세 행이에요. 앞에서 GROUP BY DEPTNO, YR로 구한 결과와 같아요.",
              "20번 부서의 2025년은 200이에요. 2025년 Q2의 금액이 NULL이라서 SUM에서 빠졌어요.",
              "`10, NULL, 330`은 10번 부서의 소계예요. 연도를 빼고 10번 부서 전체를 더해서 250 + 80 = 330이에요.",
              "`20, NULL, 320`은 20번 부서의 소계예요. 200 + 120 = 320이에요.",
              "마지막 `NULL, NULL, 650`은 총계예요. 330 + 320 = 650이에요.",
              "상세 4행 + 소계 2행 + 총계 1행으로 모두 7행이에요."
            ]
          },
          {
            "kind": "p",
            "text": "ROLLUP 결과의 행 순서는 보장되지 않아요. 상세 행과 소계 행이 섞여 나올 수 있으니, 결과를 볼 때는 ORDER BY를 붙이세요. 위 예제는 ORDER BY DEPTNO, YR로 정렬해서 NULL이 각 부서의 맨 아래에 왔어요. Oracle은 오름차순 정렬에서 NULL을 맨 뒤에 놓기 때문이에요."
          },
          {
            "kind": "h3",
            "text": "인자 순서를 바꾸면"
          },
          {
            "kind": "p",
            "text": "이번에는 괄호 안의 순서를 `ROLLUP(YR, DEPTNO)`로 바꿔 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT DEPTNO, YR, SUM(AMT) AS TOTAL\nFROM SALES\nGROUP BY ROLLUP(YR, DEPTNO)\nORDER BY YR, DEPTNO;"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "YR",
              "TOTAL"
            ],
            "rows": [
              [
                "10",
                "2025",
                "250"
              ],
              [
                "20",
                "2025",
                "200"
              ],
              [
                "NULL",
                "2025",
                "450"
              ],
              [
                "10",
                "2026",
                "80"
              ],
              [
                "20",
                "2026",
                "120"
              ],
              [
                "NULL",
                "2026",
                "200"
              ],
              [
                "NULL",
                "NULL",
                "650"
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
              "이번에는 오른쪽 컬럼이 DEPTNO예요. 그래서 DEPTNO를 먼저 빼고 YR로만 묶은 **연도별 소계**가 생겨요.",
              "`NULL, 2025, 450`은 2025년 소계예요. 10번 부서 250 + 20번 부서 200 = 450이에요. DEPTNO 자리만 NULL이에요.",
              "`NULL, 2026, 200`은 2026년 소계예요. 80 + 120 = 200이에요.",
              "상세 4행과 총계 650은 앞의 결과와 같아요.",
              "행 수는 7행으로 같지만, 소계가 \"부서별\"에서 \"연도별\"로 바뀌었어요."
            ]
          },
          {
            "kind": "p",
            "text": "정리하면 **ROLLUP(A, B)와 ROLLUP(B, A)는 결과가 달라요.** 인자 순서가 소계 기준을 정해요."
          }
        ]
      },
      {
        "id": "s2",
        "title": "2. CUBE와 GROUPING SETS",
        "concept": "gf_cube",
        "blocks": [
          {
            "kind": "h3",
            "text": "CUBE"
          },
          {
            "kind": "p",
            "text": "CUBE는 괄호 안 컬럼으로 만들 수 있는 **모든 조합**으로 묶어요. `CUBE(DEPTNO, YR)`이면 아래 4가지로 묶어요."
          },
          {
            "kind": "ul",
            "items": [
              "(DEPTNO, YR): 상세 행",
              "(DEPTNO): 부서별 소계",
              "(YR): 연도별 소계",
              "(): 총계. 빈 괄호 `()`는 \"아무 컬럼으로도 나누지 않고 전체를 하나로 묶는다\"는 뜻이에요"
            ]
          },
          {
            "kind": "p",
            "text": "컬럼이 n개면 조합은 2^n개예요. 모든 조합을 다 만들기 때문에 인자 순서를 바꿔도 결과 내용은 같아요. 행이 나오는 순서만 다를 수 있어요."
          },
          {
            "kind": "code",
            "text": "SELECT DEPTNO, YR, SUM(AMT) AS TOTAL\nFROM SALES\nGROUP BY CUBE(DEPTNO, YR)\nORDER BY DEPTNO, YR;"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "YR",
              "TOTAL"
            ],
            "rows": [
              [
                "10",
                "2025",
                "250"
              ],
              [
                "10",
                "2026",
                "80"
              ],
              [
                "10",
                "NULL",
                "330"
              ],
              [
                "20",
                "2025",
                "200"
              ],
              [
                "20",
                "2026",
                "120"
              ],
              [
                "20",
                "NULL",
                "320"
              ],
              [
                "NULL",
                "2025",
                "450"
              ],
              [
                "NULL",
                "2026",
                "200"
              ],
              [
                "NULL",
                "NULL",
                "650"
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
              "위쪽 6행은 ROLLUP(DEPTNO, YR) 결과의 상세 행과 부서별 소계(330, 320)와 같아요.",
              "`NULL, 2025, 450`과 `NULL, 2026, 200`은 연도별 소계예요. ROLLUP(DEPTNO, YR)에는 없던 행이에요. DEPTNO 자리만 NULL이에요.",
              "마지막 `NULL, NULL, 650`은 총계예요.",
              "ROLLUP(DEPTNO, YR)의 7행에 연도별 소계 2행이 더해져서 모두 9행이에요."
            ]
          },
          {
            "kind": "h3",
            "text": "GROUPING SETS"
          },
          {
            "kind": "p",
            "text": "GROUPING SETS는 괄호 안에 **나열한 그룹만** 따로 집계해서 합쳐요. `GROUPING SETS(DEPTNO, YR)`이면 \"부서별\"과 \"연도별\" 두 가지로만 묶어요."
          },
          {
            "kind": "code",
            "text": "SELECT DEPTNO, YR, SUM(AMT) AS TOTAL\nFROM SALES\nGROUP BY GROUPING SETS(DEPTNO, YR)\nORDER BY DEPTNO, YR;"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "YR",
              "TOTAL"
            ],
            "rows": [
              [
                "10",
                "NULL",
                "330"
              ],
              [
                "20",
                "NULL",
                "320"
              ],
              [
                "NULL",
                "2025",
                "450"
              ],
              [
                "NULL",
                "2026",
                "200"
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
              "`10, NULL, 330`과 `20, NULL, 320`은 DEPTNO로만 묶은 부서별 결과예요. 연도로는 나누지 않았으니 YR 자리가 NULL이에요.",
              "`NULL, 2025, 450`과 `NULL, 2026, 200`은 YR로만 묶은 연도별 결과예요. DEPTNO 자리가 NULL이에요.",
              "(부서, 연도) 상세 행이 없어요. 나열하지 않았기 때문이에요.",
              "**총계 650 행도 없어요.** GROUPING SETS는 총계를 자동으로 붙이지 않아요."
            ]
          },
          {
            "kind": "p",
            "text": "그래서 GROUPING SETS(DEPTNO, YR)는 \"GROUP BY DEPTNO 결과\"와 \"GROUP BY YR 결과\"를 UNION ALL로 이어 붙인 것과 같아요."
          },
          {
            "kind": "p",
            "text": "총계가 필요하면 빈 괄호 `()`를 직접 나열하면 돼요."
          },
          {
            "kind": "code",
            "text": "SELECT DEPTNO, YR, SUM(AMT) AS TOTAL\nFROM SALES\nGROUP BY GROUPING SETS(DEPTNO, YR, ())\nORDER BY DEPTNO, YR;"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "YR",
              "TOTAL"
            ],
            "rows": [
              [
                "10",
                "NULL",
                "330"
              ],
              [
                "20",
                "NULL",
                "320"
              ],
              [
                "NULL",
                "2025",
                "450"
              ],
              [
                "NULL",
                "2026",
                "200"
              ],
              [
                "NULL",
                "NULL",
                "650"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "`()`를 넣었더니 마지막에 총계 650 행이 생겨서 5행이 됐어요."
          },
          {
            "kind": "h3",
            "text": "셋은 서로 바꿔 쓸 수 있어요"
          },
          {
            "kind": "p",
            "text": "GROUPING SETS에 그룹을 어떻게 나열하느냐에 따라 ROLLUP이나 CUBE와 같은 결과를 만들 수 있어요."
          },
          {
            "kind": "table",
            "head": [
              "그룹 함수",
              "같은 결과를 내는 GROUPING SETS"
            ],
            "rows": [
              [
                "ROLLUP(A, B)",
                "GROUPING SETS((A, B), A, ())"
              ],
              [
                "CUBE(A, B)",
                "GROUPING SETS((A, B), A, B, ())"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "예를 들어 `GROUPING SETS((DEPTNO, YR), DEPTNO, ())`를 실행하면 ROLLUP(DEPTNO, YR)과 똑같은 7행이 나와요. `GROUPING SETS((DEPTNO, YR), DEPTNO, YR, ())`는 CUBE(DEPTNO, YR)과 똑같은 9행이 나와요. 괄호로 묶은 `(A, B)`는 \"A와 B 두 컬럼으로 함께 묶는다\"는 뜻이고, 이것이 상세 행을 만들어요."
          }
        ]
      },
      {
        "id": "s3",
        "title": "3. 결과표로 그룹 함수 고르기",
        "concept": "gf_pick",
        "blocks": [
          {
            "kind": "p",
            "text": "결과표만 주고 어떤 그룹 함수를 썼는지 묻는 문제는 아래 표로 풀 수 있어요. A는 괄호 안 첫 번째 컬럼, B는 두 번째 컬럼이에요."
          },
          {
            "kind": "table",
            "head": [
              "확인할 것",
              "ROLLUP(A, B)",
              "CUBE(A, B)",
              "GROUPING SETS(A, B)"
            ],
            "rows": [
              [
                "(A, B) 상세 행",
                "있음",
                "있음",
                "없음"
              ],
              [
                "A별 소계 (B 자리 NULL)",
                "있음",
                "있음",
                "있음"
              ],
              [
                "B별 소계 (A 자리 NULL)",
                "없음",
                "있음",
                "있음"
              ],
              [
                "총계 (둘 다 NULL)",
                "있음",
                "있음",
                "없음"
              ],
              [
                "묶는 단계 수",
                "n + 1",
                "2^n",
                "나열한 수"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "하나씩 따라가 볼게요. 앞에서 본 SALES 결과로 확인해요."
          },
          {
            "kind": "ol",
            "items": [
              "**총계 650 행이 있는지** 먼저 봐요. 없으면 GROUPING SETS예요. 위의 4행 결과가 여기에 해당해요.",
              "총계가 있으면, **연도만의 소계**(`NULL, 2025, 450`처럼 DEPTNO 자리만 NULL인 행)가 있는지 봐요. 부서별 소계도 있고 연도별 소계도 있으면 CUBE예요. 위의 9행 결과예요.",
              "총계가 있고 연도별 소계가 없으면 ROLLUP(DEPTNO, YR)이에요. 위의 첫 번째 7행 결과예요.",
              "반대로 총계가 있는데 부서별 소계(`10, NULL, 330`)가 없고 연도별 소계만 있으면 ROLLUP(YR, DEPTNO)예요."
            ]
          },
          {
            "kind": "p",
            "text": "한 가지 주의할 점이 있어요. 원래 데이터에 NULL이 들어 있으면 \"NULL이 보이면 소계 행\"이라고 단정할 수 없어요. 이 경우는 다음 설명에서 다뤄요."
          }
        ]
      },
      {
        "id": "s4",
        "title": "4. GROUPING 함수",
        "concept": "gf_grouping",
        "blocks": [
          {
            "kind": "p",
            "text": "`GROUPING(컬럼)`은 그 행이 해당 컬럼을 **묶음에서 빼고 집계한 행**(소계나 총계)이면 1을, 그 컬럼의 원래 값으로 묶은 행이면 0을 돌려줘요."
          },
          {
            "kind": "p",
            "text": "이 함수가 필요한 이유는 이래요. 소계 행의 NULL과 원래 데이터의 NULL은 결과표에서 똑같이 NULL로 보여요. EMP에는 부서가 NULL인 조미정이 있어서, `ROLLUP(DEPTNO)`를 하면 DEPTNO가 NULL인 행이 두 개 생겨요."
          },
          {
            "kind": "ul",
            "items": [
              "조미정 한 명으로 이루어진 \"부서가 NULL인 그룹\" 행",
              "모든 사원을 더한 총계 행"
            ]
          },
          {
            "kind": "p",
            "text": "GROUPING으로 두 행을 구분하고, 각각에 이름을 붙여 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT DEPTNO,\n       GROUPING(DEPTNO) AS G,\n       CASE WHEN GROUPING(DEPTNO) = 1 THEN '전체'\n            WHEN DEPTNO IS NULL THEN '부서없음'\n            ELSE TO_CHAR(DEPTNO)\n       END AS LABEL,\n       COUNT(*) AS CNT,\n       SUM(SAL) AS SUM_SAL\nFROM EMP\nGROUP BY ROLLUP(DEPTNO)\nORDER BY GROUPING(DEPTNO), DEPTNO;"
          },
          {
            "kind": "table",
            "head": [
              "DEPTNO",
              "G",
              "LABEL",
              "CNT",
              "SUM_SAL"
            ],
            "rows": [
              [
                "10",
                "0",
                "10",
                "6",
                "26000"
              ],
              [
                "20",
                "0",
                "20",
                "3",
                "12500"
              ],
              [
                "NULL",
                "0",
                "부서없음",
                "1",
                "2800"
              ],
              [
                "NULL",
                "1",
                "전체",
                "10",
                "41300"
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
              "10번 부서 행은 G가 0이에요. DEPTNO의 원래 값 10으로 묶은 행이에요. CNT는 6명인데 SUM_SAL은 26000이에요. 서인턴의 급여가 NULL이라 합계에서 빠졌어요. COUNT(*)는 행 수를 세기 때문에 서인턴도 세서 6이에요.",
              "세 번째 행은 DEPTNO가 NULL이지만 G가 0이에요. 조미정의 원래 DEPTNO 값이 NULL이라서 생긴 그룹이고, 묶음에서 뺀 행이 아니에요. 그래서 CASE의 두 번째 조건에 걸려 '부서없음'이 붙었어요.",
              "마지막 행은 DEPTNO를 묶음에서 빼고 전체를 집계한 총계 행이라 G가 1이에요. CASE의 첫 번째 조건에 걸려 '전체'가 붙었어요. CNT 10은 조미정까지 모두 센 값이에요.",
              "두 행 모두 DEPTNO는 NULL이지만, G 값으로 둘을 구분할 수 있어요."
            ]
          },
          {
            "kind": "p",
            "text": "CASE에서 GROUPING 조건을 먼저 쓴 데도 이유가 있어요. `DEPTNO IS NULL`을 먼저 쓰면 총계 행도 그 조건에 걸려서 '부서없음'이 붙어 버려요."
          },
          {
            "kind": "p",
            "text": "Oracle 문제에서는 CASE 대신 `DECODE(GROUPING(DEPTNO), 1, '전체', ...)`처럼 DECODE로 쓰는 경우도 자주 나와요. GROUPING 값이 1이면 '전체'를 보여 준다는 뜻으로 읽으면 돼요."
          },
          {
            "kind": "p",
            "text": "SQL Server에서도 GROUPING 함수는 똑같이 쓸 수 있어요. SQL Server에는 `GROUP BY DEPTNO WITH ROLLUP` 같은 예전 문법도 있어요."
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
                "ROLLUP(A, B)와 ROLLUP(B, A)는 결과가 같다",
                "소계 기준이 바뀌어요. ROLLUP(DEPTNO, YR)에는 부서별 소계(330, 320)가, ROLLUP(YR, DEPTNO)에는 연도별 소계(450, 200)가 나와요. CUBE와 GROUPING SETS만 인자 순서와 상관없어요"
              ],
              [
                "GROUPING SETS도 마지막에 총계가 붙는다",
                "나열한 그룹만 만들어요. GROUPING SETS(DEPTNO, YR)는 4행이고 총계 650이 없어요. `()`를 넣어야 총계가 나와요"
              ],
              [
                "결과에서 NULL이 보이면 무조건 소계 행이다",
                "원래 데이터가 NULL인 그룹도 NULL로 보여요. 조미정의 행(CNT 1)은 DEPTNO가 NULL이지만 GROUPING이 0인 데이터 행이에요"
              ],
              [
                "GROUPING(컬럼)은 컬럼 값이 NULL이면 1이다",
                "그 컬럼을 묶음에서 빼고 집계한 행이면 1이에요. 값이 NULL인지와는 상관없어요. 조미정의 행은 NULL이어도 0이에요"
              ],
              [
                "CUBE(A, B, C)는 묶는 단계가 4개다",
                "2^3 = 8개예요. 4개(n + 1)는 ROLLUP(A, B, C)예요"
              ]
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "window",
    "title": "윈도우 함수",
    "subject": "2과목 · SQL 기본 및 활용",
    "chapter": "",
    "minutes": 40,
    "sections": [
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
              "RANK, DENSE_RANK, ROW_NUMBER가 동점을 어떻게 처리하는지 보고 결과를 예측할 수 있어요.",
              "NULL이 섞여 있을 때 Oracle에서 순위가 어떻게 매겨지는지 설명할 수 있어요.",
              "ORDER BY만 쓴 집계 윈도우 함수의 기본 범위(RANGE 누적)와 ROWS의 차이를 설명하고, 동점이 있을 때 누적합을 예측할 수 있어요.",
              "LAG, LEAD, FIRST_VALUE, LAST_VALUE의 결과를 예측하고, LAST_VALUE에서 자주 틀리는 이유를 설명할 수 있어요.",
              "RATIO_TO_REPORT, PERCENT_RANK, CUME_DIST, NTILE 값을 직접 계산할 수 있어요."
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
                "순위 함수",
                "RANK는 동점 다음 순위를 건너뛰고, DENSE_RANK는 건너뛰지 않고, ROW_NUMBER는 동점이어도 1, 2, 3처럼 서로 다른 번호를 붙여요"
              ],
              [
                "집계 윈도우 함수와 프레임",
                "ORDER BY가 있으면 기본 계산 범위는 \"처음부터 현재 값까지(RANGE)\"라서 동점 행은 같은 누적값을 받아요. ROWS는 한 줄씩 계산해요"
              ],
              [
                "행 순서 함수",
                "LAG/LEAD는 n행 앞/뒤의 값을, FIRST_VALUE/LAST_VALUE는 계산 범위의 처음/끝 값을 가져와요. 기본 범위에서 LAST_VALUE는 현재 행 값이에요"
              ],
              [
                "비율 함수",
                "RATIO_TO_REPORT는 합계 대비 비율, PERCENT_RANK는 (순위−1)÷(행 수−1), CUME_DIST는 현재 값 이하인 행의 비율, NTILE(n)은 n개 그룹으로 나눈 번호예요"
              ]
            ]
          },
          {
            "kind": "h2",
            "text": "이 단원에서 쓰는 데이터"
          },
          {
            "kind": "p",
            "text": "이 단원의 예제는 모두 사원 테이블 `EMP`를 써요. 아래는 이 단원에 필요한 컬럼만 뽑은 거예요."
          },
          {
            "kind": "table",
            "head": [
              "EMPNO (사번)",
              "ENAME (이름)",
              "HIREDATE (입사일)",
              "SAL (급여)",
              "DEPTNO (부서)"
            ],
            "rows": [
              [
                "1001",
                "김대표",
                "2015-01-01",
                "9000",
                "10"
              ],
              [
                "1002",
                "이개발",
                "2016-03-01",
                "6000",
                "10"
              ],
              [
                "1003",
                "박영업",
                "2016-05-01",
                "6000",
                "20"
              ],
              [
                "1004",
                "최코드",
                "2018-07-01",
                "4000",
                "10"
              ],
              [
                "1005",
                "정코드",
                "2019-02-01",
                "4000",
                "10"
              ],
              [
                "1006",
                "한세일",
                "2019-06-01",
                "3500",
                "20"
              ],
              [
                "1007",
                "윤세일",
                "2020-01-01",
                "3000",
                "20"
              ],
              [
                "1008",
                "강신입",
                "2021-09-01",
                "3000",
                "10"
              ],
              [
                "1009",
                "조미정",
                "2022-04-01",
                "2800",
                "NULL"
              ],
              [
                "1010",
                "서인턴",
                "2023-01-02",
                "NULL",
                "10"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "이 단원에서 결과를 헷갈리게 만드는 사람들이에요. 미리 봐 두면 예제를 따라가기 쉬워요."
          },
          {
            "kind": "ul",
            "items": [
              "**서인턴**은 급여(SAL)가 NULL이에요. Oracle은 정렬할 때 NULL을 **가장 큰 값**으로 다뤄요. 그래서 급여가 높은 순(DESC)으로 줄을 세우면 서인턴이 맨 앞에 와요. 순위 결과가 크게 달라지니 꼭 기억해 두세요.",
              "**이개발과 박영업**(6000), **최코드와 정코드**(4000), **윤세일과 강신입**(3000)은 급여가 같아요. 동점을 어떻게 처리하는지가 이 단원의 핵심이에요.",
              "**조미정**은 부서(DEPTNO)가 NULL이에요. 그래서 부서 10이나 20으로 거른 예제에는 나오지 않아요."
            ]
          },
          {
            "kind": "p",
            "text": "윈도우 함수는 행을 줄이지 않고, **각 행 옆에 계산 결과를 붙여 주는 함수**예요. GROUP BY는 그룹마다 한 행으로 줄이지만, 윈도우 함수는 원래 행 수가 그대로 남아요. 함수 뒤에 `OVER (...)`를 붙여서 쓰고, 괄호 안에는 아래 세 가지를 쓸 수 있어요."
          },
          {
            "kind": "table",
            "head": [
              "쓰는 것",
              "하는 일"
            ],
            "rows": [
              [
                "PARTITION BY",
                "행을 그룹으로 나눠요. 계산은 그룹 안에서만 해요"
              ],
              [
                "ORDER BY",
                "그룹 안에서 행의 순서를 정해요"
              ],
              [
                "ROWS / RANGE",
                "계산에 넣을 행의 범위(프레임)를 정해요"
              ]
            ]
          }
        ]
      },
      {
        "id": "s1",
        "title": "1. 순위 함수",
        "concept": "wf_rank",
        "blocks": [
          {
            "kind": "p",
            "text": "순위 함수는 ORDER BY 기준으로 순위를 매겨요. 세 함수는 **동점일 때만** 결과가 달라져요."
          },
          {
            "kind": "table",
            "head": [
              "함수",
              "순위 매기는 방법",
              "동점 다음 순위"
            ],
            "rows": [
              [
                "RANK",
                "나보다 앞선 사람 수 + 1",
                "건너뛰어요 (1, 2, 2, 4)"
              ],
              [
                "DENSE_RANK",
                "나보다 앞선 서로 다른 값의 수 + 1",
                "건너뛰지 않아요 (1, 2, 2, 3)"
              ],
              [
                "ROW_NUMBER",
                "그냥 줄 번호",
                "동점도 서로 다른 번호예요 (1, 2, 3, 4)"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "ROW_NUMBER는 동점끼리 누가 먼저 번호를 받을지 정해져 있지 않아요. 그래서 아래 예제는 ORDER BY에 EMPNO를 하나 더 넣어서 순서를 고정했어요."
          },
          {
            "kind": "p",
            "text": "먼저 급여가 NULL인 서인턴을 빼고 순위를 매겨 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, SAL,\n       RANK()       OVER (ORDER BY SAL DESC) AS RK,\n       DENSE_RANK() OVER (ORDER BY SAL DESC) AS DRK,\n       ROW_NUMBER() OVER (ORDER BY SAL DESC, EMPNO) AS RN\nFROM EMP\nWHERE SAL IS NOT NULL\nORDER BY SAL DESC, EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "SAL",
              "RK",
              "DRK",
              "RN"
            ],
            "rows": [
              [
                "김대표",
                "9000",
                "1",
                "1",
                "1"
              ],
              [
                "이개발",
                "6000",
                "2",
                "2",
                "2"
              ],
              [
                "박영업",
                "6000",
                "2",
                "2",
                "3"
              ],
              [
                "최코드",
                "4000",
                "4",
                "3",
                "4"
              ],
              [
                "정코드",
                "4000",
                "4",
                "3",
                "5"
              ],
              [
                "한세일",
                "3500",
                "6",
                "4",
                "6"
              ],
              [
                "윤세일",
                "3000",
                "7",
                "5",
                "7"
              ],
              [
                "강신입",
                "3000",
                "7",
                "5",
                "8"
              ],
              [
                "조미정",
                "2800",
                "9",
                "6",
                "9"
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
              "**이개발, 박영업(6000):** 앞선 사람은 김대표 1명이라 RANK는 둘 다 2예요.",
              "**최코드, 정코드(4000):** 앞선 사람이 김대표, 이개발, 박영업 3명이라 RANK는 4예요. 3위가 없어졌어요. 이것이 \"동점 다음 순위를 건너뛴다\"는 뜻이에요.",
              "**같은 4000의 DENSE_RANK:** 앞선 서로 다른 값은 9000, 6000 두 개라 3이에요. 건너뛰지 않아요.",
              "**ROW_NUMBER:** 동점과 상관없이 1부터 9까지 한 번씩 붙어요. 이개발과 박영업은 사번이 빠른 이개발이 2, 박영업이 3이에요."
            ]
          },
          {
            "kind": "h3",
            "text": "NULL이 섞이면 순위가 어떻게 될까요?"
          },
          {
            "kind": "p",
            "text": "이번에는 서인턴을 빼지 않고, 사원 10명 전체로 순위를 매겨 볼게요. 시험에 자주 나오는 함정이에요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, SAL,\n       RANK()       OVER (ORDER BY SAL DESC) AS RK,\n       DENSE_RANK() OVER (ORDER BY SAL DESC) AS DRK\nFROM EMP\nORDER BY SAL DESC, EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "SAL",
              "RK",
              "DRK"
            ],
            "rows": [
              [
                "서인턴",
                "NULL",
                "1",
                "1"
              ],
              [
                "김대표",
                "9000",
                "2",
                "2"
              ],
              [
                "이개발",
                "6000",
                "3",
                "3"
              ],
              [
                "박영업",
                "6000",
                "3",
                "3"
              ],
              [
                "최코드",
                "4000",
                "5",
                "4"
              ],
              [
                "정코드",
                "4000",
                "5",
                "4"
              ],
              [
                "한세일",
                "3500",
                "7",
                "5"
              ],
              [
                "윤세일",
                "3000",
                "8",
                "6"
              ],
              [
                "강신입",
                "3000",
                "8",
                "6"
              ],
              [
                "조미정",
                "2800",
                "10",
                "7"
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
              "Oracle은 NULL을 가장 큰 값으로 다뤄요. 그래서 높은 순(DESC)으로 세우면 급여가 없는 **서인턴이 1위**가 돼요.",
              "그 바람에 모든 사람이 한 칸씩 밀려요. 김대표는 2위, 이개발과 박영업은 3위예요.",
              "한세일은 앞선 사람이 6명이라 RANK 7이에요. 앞선 서로 다른 값은 NULL, 9000, 6000, 4000 네 개라 DENSE_RANK는 5예요. 서인턴을 뺐던 위 표와 비교하면 RANK 6, DENSE_RANK 4에서 하나씩 늘었어요."
            ]
          },
          {
            "kind": "p",
            "text": "서인턴을 맨 뒤로 보내고 싶으면 ORDER BY에 `NULLS LAST`를 붙여요. `NULLS LAST`는 \"NULL을 맨 뒤에 둔다\"는 뜻이에요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, SAL,\n       RANK() OVER (ORDER BY SAL DESC NULLS LAST) AS RK\nFROM EMP;"
          },
          {
            "kind": "p",
            "text": "이렇게 쓰면 김대표가 다시 1위가 되고, 한세일은 RANK 6으로 돌아와요. 서인턴은 10위로 맨 뒤에 가요."
          },
          {
            "kind": "p",
            "text": "정리하면 Oracle에서 NULL의 위치는 아래와 같아요."
          },
          {
            "kind": "table",
            "head": [
              "정렬",
              "NULL의 위치",
              "바꾸는 방법"
            ],
            "rows": [
              [
                "ASC (낮은 순)",
                "맨 뒤",
                "`NULLS FIRST`"
              ],
              [
                "DESC (높은 순)",
                "맨 앞",
                "`NULLS LAST`"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "SQL Server는 반대로 NULL을 가장 작은 값으로 다뤄요. 문제에 \"Oracle 기준\"이라고 나오면 NULL이 DESC에서 맨 앞이라는 점을 먼저 떠올리세요."
          },
          {
            "kind": "h3",
            "text": "PARTITION BY로 그룹마다 따로 매기기"
          },
          {
            "kind": "p",
            "text": "PARTITION BY를 붙이면 부서마다 순위를 따로 매겨요. 이때도 행은 줄지 않아요. 20번 부서로 확인해 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, DEPTNO, SAL,\n       RANK() OVER (PARTITION BY DEPTNO\n                    ORDER BY SAL DESC) AS DEPT_RK,\n       SUM(SAL) OVER (PARTITION BY DEPTNO) AS DEPT_SUM\nFROM EMP\nWHERE DEPTNO = 20\nORDER BY SAL DESC;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "DEPTNO",
              "SAL",
              "DEPT_RK",
              "DEPT_SUM"
            ],
            "rows": [
              [
                "박영업",
                "20",
                "6000",
                "1",
                "12500"
              ],
              [
                "한세일",
                "20",
                "3500",
                "2",
                "12500"
              ],
              [
                "윤세일",
                "20",
                "3000",
                "3",
                "12500"
              ]
            ]
          },
          {
            "kind": "ol",
            "items": [
              "박영업은 전체에서는 이개발과 공동 2위였지만, 20번 부서 안에서는 가장 높아서 1위예요.",
              "DEPT_SUM은 20번 부서 급여를 모두 더한 값(6000 + 3500 + 3000 = 12500)이에요. GROUP BY와 달리 3명의 행이 그대로 남고, 각 행에 같은 합계가 붙어요."
            ]
          }
        ]
      },
      {
        "id": "s2",
        "title": "2. 집계 윈도우 함수와 프레임",
        "concept": "wf_frame",
        "blocks": [
          {
            "kind": "p",
            "text": "SUM, AVG, COUNT, MAX, MIN 같은 집계 함수도 OVER를 붙이면 윈도우 함수가 돼요. 이때는 **프레임** 안의 행만 계산해요. 프레임은 \"현재 행을 계산할 때 함께 넣을 행의 범위\"를 말해요."
          },
          {
            "kind": "p",
            "text": "프레임은 OVER 안에 무엇을 썼는지에 따라 정해져요."
          },
          {
            "kind": "table",
            "head": [
              "OVER 안에 쓴 것",
              "프레임"
            ],
            "rows": [
              [
                "아무것도 없음 `OVER ()`",
                "파티션 전체"
              ],
              [
                "ORDER BY만",
                "처음부터 현재 값까지 (RANGE 누적)"
              ],
              [
                "ORDER BY + ROWS",
                "직접 정한 행 범위"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "ORDER BY만 쓰면 Oracle은 `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`를 쓴 것으로 봐요. \"처음부터 현재 행까지\"라는 뜻이에요."
          },
          {
            "kind": "p",
            "text": "여기서 RANGE와 ROWS의 차이가 중요해요."
          },
          {
            "kind": "ul",
            "items": [
              "**RANGE**는 값을 기준으로 범위를 잡아요. ORDER BY 값이 같은 행(동점)을 한 묶음으로 보고 함께 넣어요.",
              "**ROWS**는 실제 행을 한 줄씩 세서 범위를 잡아요. 동점이어도 아직 오지 않은 행은 넣지 않아요."
            ]
          },
          {
            "kind": "p",
            "text": "범위를 쓸 때는 아래 표현을 조합해요."
          },
          {
            "kind": "table",
            "head": [
              "표현",
              "뜻"
            ],
            "rows": [
              [
                "UNBOUNDED PRECEDING",
                "맨 처음 행"
              ],
              [
                "n PRECEDING",
                "n행 앞"
              ],
              [
                "CURRENT ROW",
                "현재 행"
              ],
              [
                "n FOLLOWING",
                "n행 뒤"
              ],
              [
                "UNBOUNDED FOLLOWING",
                "맨 마지막 행"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "세 가지 방식을 한 번에 비교해 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, SAL,\n       SUM(SAL) OVER (ORDER BY SAL) AS RANGE_SUM,\n       SUM(SAL) OVER (\n         ORDER BY SAL, EMPNO\n         ROWS BETWEEN UNBOUNDED PRECEDING\n                  AND CURRENT ROW\n       ) AS ROWS_SUM,\n       SUM(SAL) OVER () AS ALL_SUM\nFROM EMP\nWHERE SAL IS NOT NULL\nORDER BY SAL, EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "SAL",
              "RANGE_SUM",
              "ROWS_SUM",
              "ALL_SUM"
            ],
            "rows": [
              [
                "조미정",
                "2800",
                "2800",
                "2800",
                "41300"
              ],
              [
                "윤세일",
                "3000",
                "8800",
                "5800",
                "41300"
              ],
              [
                "강신입",
                "3000",
                "8800",
                "8800",
                "41300"
              ],
              [
                "한세일",
                "3500",
                "12300",
                "12300",
                "41300"
              ],
              [
                "최코드",
                "4000",
                "20300",
                "16300",
                "41300"
              ],
              [
                "정코드",
                "4000",
                "20300",
                "20300",
                "41300"
              ],
              [
                "이개발",
                "6000",
                "32300",
                "26300",
                "41300"
              ],
              [
                "박영업",
                "6000",
                "32300",
                "32300",
                "41300"
              ],
              [
                "김대표",
                "9000",
                "41300",
                "41300",
                "41300"
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
              "**윤세일의 RANGE_SUM:** RANGE는 \"3000 이하인 값 전부\"를 더해요. 조미정 2800, 윤세일 3000, 강신입 3000이 들어가서 8800이에요. 강신입은 아직 다음 줄인데도 같은 값이라 함께 들어가요. 강신입의 RANGE_SUM도 똑같이 8800이에요.",
              "**윤세일의 ROWS_SUM:** ROWS는 \"지금 줄까지\"만 더해요. 조미정 2800 + 윤세일 3000 = 5800이에요. 다음 줄인 강신입에서 3000이 더해져 8800이 돼요.",
              "**동점 묶음의 마지막 행**(강신입, 정코드, 박영업)에서는 RANGE_SUM과 ROWS_SUM이 같아져요.",
              "**ALL_SUM:** OVER 안이 비어 있어서 모든 행이 같은 프레임이에요. 9명 급여를 모두 더한 41300이 모든 행에 붙어요."
            ]
          },
          {
            "kind": "p",
            "text": "ROWS로 한 줄씩 셀 때 동점끼리의 순서는 정해져 있지 않아요. 그래서 ROWS_SUM에는 ORDER BY에 EMPNO를 더 넣어서 순서를 고정했어요."
          },
          {
            "kind": "h3",
            "text": "앞뒤 몇 행만 계산하기"
          },
          {
            "kind": "p",
            "text": "`ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`처럼 쓰면 \"앞 1행, 현재 행, 뒤 1행\"까지 최대 3행을 계산해요. 20번 부서로 확인해 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, SAL,\n       SUM(SAL) OVER (\n         ORDER BY SAL, EMPNO\n         ROWS BETWEEN 1 PRECEDING\n                  AND 1 FOLLOWING\n       ) AS MOV_SUM,\n       COUNT(SAL) OVER (\n         ORDER BY SAL, EMPNO\n         ROWS BETWEEN 1 PRECEDING\n                  AND 1 FOLLOWING\n       ) AS MOV_CNT\nFROM EMP\nWHERE DEPTNO = 20\nORDER BY SAL, EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "SAL",
              "MOV_SUM",
              "MOV_CNT"
            ],
            "rows": [
              [
                "윤세일",
                "3000",
                "6500",
                "2"
              ],
              [
                "한세일",
                "3500",
                "12500",
                "3"
              ],
              [
                "박영업",
                "6000",
                "9500",
                "2"
              ]
            ]
          },
          {
            "kind": "ol",
            "items": [
              "**윤세일:** 첫 행이라 앞 행이 없어요. 윤세일 3000 + 한세일 3500 = 6500이고, 2행만 계산했어요.",
              "**한세일:** 앞뒤가 다 있어서 3000 + 3500 + 6000 = 12500, 3행이에요.",
              "**박영업:** 마지막 행이라 뒤 행이 없어요. 3500 + 6000 = 9500, 2행이에요."
            ]
          }
        ]
      },
      {
        "id": "s3",
        "title": "3. 행 순서 함수",
        "concept": "wf_order",
        "blocks": [
          {
            "kind": "p",
            "text": "행 순서 함수는 ORDER BY로 정한 순서에서 **다른 행의 값을 가져오는** 함수예요."
          },
          {
            "kind": "table",
            "head": [
              "함수",
              "가져오는 값"
            ],
            "rows": [
              [
                "`LAG(컬럼, n, 기본값)`",
                "n행 앞의 값 (n을 생략하면 1)"
              ],
              [
                "`LEAD(컬럼, n, 기본값)`",
                "n행 뒤의 값 (n을 생략하면 1)"
              ],
              [
                "`FIRST_VALUE(컬럼)`",
                "프레임의 첫 번째 값"
              ],
              [
                "`LAST_VALUE(컬럼)`",
                "프레임의 마지막 값"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "LAG와 LEAD의 기본값은 **가리킬 행이 아예 없을 때** 대신 보여 줄 값이에요. 생략하면 NULL이 나와요."
          },
          {
            "kind": "h3",
            "text": "LAG와 LEAD"
          },
          {
            "kind": "p",
            "text": "10번 부서를 입사일 순으로 세우고, 바로 앞 사람과 바로 뒤 사람의 급여를 가져와 볼게요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, HIREDATE, SAL,\n       LAG(SAL) OVER (ORDER BY HIREDATE) AS PREV_SAL,\n       LEAD(SAL, 1, 0)\n         OVER (ORDER BY HIREDATE) AS NEXT_SAL\nFROM EMP\nWHERE DEPTNO = 10\nORDER BY HIREDATE;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "HIREDATE",
              "SAL",
              "PREV_SAL",
              "NEXT_SAL"
            ],
            "rows": [
              [
                "김대표",
                "2015-01-01",
                "9000",
                "NULL",
                "6000"
              ],
              [
                "이개발",
                "2016-03-01",
                "6000",
                "9000",
                "4000"
              ],
              [
                "최코드",
                "2018-07-01",
                "4000",
                "6000",
                "4000"
              ],
              [
                "정코드",
                "2019-02-01",
                "4000",
                "4000",
                "3000"
              ],
              [
                "강신입",
                "2021-09-01",
                "3000",
                "4000",
                "NULL"
              ],
              [
                "서인턴",
                "2023-01-02",
                "NULL",
                "3000",
                "0"
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
              "**김대표의 PREV_SAL:** 가장 먼저 입사해서 앞 행이 없어요. LAG에 기본값을 주지 않았으니 NULL이에요.",
              "**강신입의 NEXT_SAL:** 다음 행(서인턴)은 있어요. 그런데 서인턴의 급여가 NULL이라 그대로 NULL을 가져와요. 기본값 0은 쓰이지 않아요.",
              "**서인턴의 NEXT_SAL:** 가장 늦게 입사해서 다음 행이 아예 없어요. 이때 기본값 0이 나와요."
            ]
          },
          {
            "kind": "p",
            "text": "2번과 3번의 차이가 시험에 자주 나와요. **기본값은 값이 NULL일 때가 아니라, 가리킬 행이 없을 때만** 쓰여요."
          },
          {
            "kind": "h3",
            "text": "FIRST_VALUE와 LAST_VALUE"
          },
          {
            "kind": "p",
            "text": "같은 순서로 첫 번째 사람과 마지막 사람의 이름을 가져와 볼게요. LAST_VALUE는 기본 프레임으로 한 번, 프레임을 넓혀서 한 번 써 봤어요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, HIREDATE,\n       FIRST_VALUE(ENAME)\n         OVER (ORDER BY HIREDATE) AS FIRST_NM,\n       LAST_VALUE(ENAME)\n         OVER (ORDER BY HIREDATE) AS LAST_DEF,\n       LAST_VALUE(ENAME) OVER (\n         ORDER BY HIREDATE\n         ROWS BETWEEN UNBOUNDED PRECEDING\n                  AND UNBOUNDED FOLLOWING\n       ) AS LAST_ALL\nFROM EMP\nWHERE DEPTNO = 10\nORDER BY HIREDATE;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "HIREDATE",
              "FIRST_NM",
              "LAST_DEF",
              "LAST_ALL"
            ],
            "rows": [
              [
                "김대표",
                "2015-01-01",
                "김대표",
                "김대표",
                "서인턴"
              ],
              [
                "이개발",
                "2016-03-01",
                "김대표",
                "이개발",
                "서인턴"
              ],
              [
                "최코드",
                "2018-07-01",
                "김대표",
                "최코드",
                "서인턴"
              ],
              [
                "정코드",
                "2019-02-01",
                "김대표",
                "정코드",
                "서인턴"
              ],
              [
                "강신입",
                "2021-09-01",
                "김대표",
                "강신입",
                "서인턴"
              ],
              [
                "서인턴",
                "2023-01-02",
                "김대표",
                "서인턴",
                "서인턴"
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
              "**FIRST_NM:** 기본 프레임은 \"처음부터 현재 행까지\"예요. 첫 번째 값은 언제나 김대표라서 모든 행이 김대표예요.",
              "**LAST_DEF:** 같은 기본 프레임에서 마지막 값은 **현재 행 자신**이에요. 그래서 이개발 행에는 이개발, 최코드 행에는 최코드가 나와요. 부서의 마지막 입사자를 기대했다면 틀린 결과예요.",
              "**LAST_ALL:** 프레임을 `UNBOUNDED FOLLOWING`(맨 마지막 행)까지 넓혔어요. 이제 프레임의 끝이 서인턴이라 모든 행에 서인턴이 나와요."
            ]
          },
          {
            "kind": "p",
            "text": "LAST_VALUE로 파티션 전체의 마지막 값을 구하려면 **프레임을 UNBOUNDED FOLLOWING까지 넓혀야** 해요."
          }
        ]
      },
      {
        "id": "s4",
        "title": "4. 비율 함수",
        "concept": "wf_ratio",
        "blocks": [
          {
            "kind": "p",
            "text": "비율 함수는 각 행이 전체에서 어느 정도 위치나 비중인지 계산해요."
          },
          {
            "kind": "table",
            "head": [
              "함수",
              "계산",
              "특징"
            ],
            "rows": [
              [
                "RATIO_TO_REPORT(컬럼)",
                "컬럼 값 ÷ 파티션의 합계",
                "OVER 안에 ORDER BY를 쓰지 않아요. 모두 더하면 1이에요"
              ],
              [
                "PERCENT_RANK()",
                "(RANK − 1) ÷ (행 수 − 1)",
                "첫 행은 0, 마지막 행은 1이에요"
              ],
              [
                "CUME_DIST()",
                "현재 값 이하인 행 수 ÷ 행 수",
                "동점은 묶음의 마지막 행 기준이에요. 마지막 행은 1이에요"
              ],
              [
                "NTILE(n)",
                "행을 n개 그룹으로 나눈 번호",
                "나누어떨어지지 않으면 앞 그룹부터 1행씩 더 받아요"
              ]
            ]
          },
          {
            "kind": "p",
            "text": "결과표가 넓어지지 않도록 쿼리를 둘로 나눴어요. 먼저 RATIO_TO_REPORT와 PERCENT_RANK예요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, SAL,\n       ROUND(RATIO_TO_REPORT(SAL) OVER (), 3) AS RATIO,\n       ROUND(PERCENT_RANK()\n               OVER (ORDER BY SAL), 3) AS PR\nFROM EMP\nWHERE SAL IS NOT NULL\nORDER BY SAL, EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "SAL",
              "RATIO",
              "PR"
            ],
            "rows": [
              [
                "조미정",
                "2800",
                "0.068",
                "0"
              ],
              [
                "윤세일",
                "3000",
                "0.073",
                "0.125"
              ],
              [
                "강신입",
                "3000",
                "0.073",
                "0.125"
              ],
              [
                "한세일",
                "3500",
                "0.085",
                "0.375"
              ],
              [
                "최코드",
                "4000",
                "0.097",
                "0.5"
              ],
              [
                "정코드",
                "4000",
                "0.097",
                "0.5"
              ],
              [
                "이개발",
                "6000",
                "0.145",
                "0.75"
              ],
              [
                "박영업",
                "6000",
                "0.145",
                "0.75"
              ],
              [
                "김대표",
                "9000",
                "0.218",
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
              "**RATIO:** 9명의 급여 합계는 41300이에요. 김대표는 9000 ÷ 41300 = 0.218이에요.",
              "**PR:** 행 수가 9라서 분모는 9 − 1 = 8이에요. 조미정은 낮은 순 RANK 1이라 (1 − 1) ÷ 8 = 0이에요.",
              "윤세일과 강신입은 동점이라 RANK가 둘 다 2예요. (2 − 1) ÷ 8 = 0.125예요.",
              "한세일은 앞에 3명이 있어서 RANK 4예요. (4 − 1) ÷ 8 = 0.375예요. 김대표는 RANK 9라서 (9 − 1) ÷ 8 = 1이에요."
            ]
          },
          {
            "kind": "p",
            "text": "이어서 CUME_DIST와 NTILE이에요."
          },
          {
            "kind": "code",
            "text": "SELECT ENAME, SAL,\n       ROUND(CUME_DIST()\n               OVER (ORDER BY SAL), 3) AS CD,\n       NTILE(4) OVER (ORDER BY SAL, EMPNO) AS NT\nFROM EMP\nWHERE SAL IS NOT NULL\nORDER BY SAL, EMPNO;"
          },
          {
            "kind": "table",
            "head": [
              "ENAME",
              "SAL",
              "CD",
              "NT"
            ],
            "rows": [
              [
                "조미정",
                "2800",
                "0.111",
                "1"
              ],
              [
                "윤세일",
                "3000",
                "0.333",
                "1"
              ],
              [
                "강신입",
                "3000",
                "0.333",
                "1"
              ],
              [
                "한세일",
                "3500",
                "0.444",
                "2"
              ],
              [
                "최코드",
                "4000",
                "0.667",
                "2"
              ],
              [
                "정코드",
                "4000",
                "0.667",
                "3"
              ],
              [
                "이개발",
                "6000",
                "0.889",
                "3"
              ],
              [
                "박영업",
                "6000",
                "0.889",
                "4"
              ],
              [
                "김대표",
                "9000",
                "1",
                "4"
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
              "**CD:** 조미정은 2800 이하가 자기 1명뿐이라 1 ÷ 9 = 0.111이에요.",
              "윤세일은 3000 이하가 조미정, 윤세일, 강신입 3명이라 3 ÷ 9 = 0.333이에요. 아직 다음 줄인 강신입까지 세는 이유는 \"현재 값 이하\"가 기준이기 때문이에요. 그래서 동점인 강신입도 같은 0.333이에요.",
              "김대표는 9000 이하가 9명 전부라 9 ÷ 9 = 1이에요.",
              "**NT:** 9행을 4개 그룹으로 나누면 9 ÷ 4 = 2, 나머지 1이에요. 남는 1행은 첫 그룹이 받아서 그룹 크기는 3, 2, 2, 2가 돼요. 조미정, 윤세일, 강신입이 1그룹, 한세일과 최코드가 2그룹이에요.",
              "최코드와 정코드는 같은 4000인데 2그룹과 3그룹으로 갈라졌어요. NTILE은 **동점을 신경 쓰지 않고** 행 수만으로 나눠요."
            ]
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
                "윈도우 함수도 GROUP BY처럼 행이 줄어든다",
                "원래 행 수 그대로예요. 20번 부서 3명에 DEPT_SUM 12500이 각각 붙어요"
              ],
              [
                "급여 높은 순(DESC) 순위에서 NULL은 꼴찌다",
                "Oracle은 NULL을 가장 큰 값으로 봐서 DESC면 1위예요. 10번 부서에서 서인턴이 1위, 김대표가 2위가 돼요. 맨 뒤로 보내려면 `NULLS LAST`를 써요. SQL Server는 반대예요"
              ],
              [
                "RANK와 DENSE_RANK는 동점 다음 순위가 같다",
                "RANK는 건너뛰고 DENSE_RANK는 건너뛰지 않아요. 4000인 최코드는 RANK 4, DENSE_RANK 3이에요"
              ],
              [
                "ORDER BY만 쓴 SUM OVER는 한 줄씩 누적한다",
                "기본 프레임은 RANGE라 동점 행이 같은 누적값을 받아요. 윤세일과 강신입이 둘 다 8800이에요. 한 줄씩 누적하려면 ROWS를 직접 써야 해요"
              ],
              [
                "LAST_VALUE는 파티션의 마지막 값을 준다",
                "기본 프레임이 현재 행까지라 현재 행 값이 나와요. 마지막 값을 받으려면 UNBOUNDED FOLLOWING까지 넓혀야 해요"
              ],
              [
                "LEAD(SAL, 1, 0)은 다음 값이 NULL이면 0을 준다",
                "기본값은 가리킬 행이 없을 때만 써요. 강신입의 다음 행인 서인턴은 급여가 NULL이라 NULL이 나와요"
              ],
              [
                "NTILE은 동점을 같은 그룹에 넣는다",
                "행 수만으로 나눠요. 4000인 최코드와 정코드가 2그룹과 3그룹으로 갈라져요"
              ]
            ]
          }
        ]
      }
    ]
  }
];
