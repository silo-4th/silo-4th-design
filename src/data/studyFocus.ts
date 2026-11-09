/**
 * "다시 볼 부분" for each question: the one point to go back and study when the learner got it wrong
 * or was unsure. Shown under each row of the quiz result, written in 요체.
 */
export const STUDY_FOCUS: Record<string, string> = {
  // 집계 함수와 NULL
  "q-agg-1": "COUNT(*)와 COUNT(컬럼)이 NULL을 어떻게 다르게 세는지 다시 봐요",
  "q-agg-2": "AVG가 NULL을 빼고 몇으로 나누는지 다시 봐요",
  "b-agg-1": "COUNT(컬럼)이 NULL을 빼고 센다는 점을 다시 봐요",
  "t-agg-1": "AVG(COMM)과 SUM(COMM) / COUNT(*)의 분모가 왜 다른지 다시 봐요",
  // GROUP BY 규칙
  "q-grp-1": "GROUP BY를 쓸 때 SELECT에 올 수 있는 컬럼을 다시 봐요",
  "q-grp-2": "GROUP BY에서 SELECT 별칭을 못 쓰는 이유를 다시 봐요",
  "b-grp-1": "SELECT에는 GROUP BY 컬럼과 집계 함수만 온다는 규칙을 다시 봐요",
  "t-grp-1": "그룹당 한 줄이라 ENAME을 보여줄 수 없는 이유를 다시 봐요",
  // WHERE와 HAVING
  "q-hav-1": "집계 함수 조건은 HAVING에 쓴다는 규칙을 다시 봐요",
  "q-hav-2": "WHERE → GROUP BY → HAVING 순서로 행이 걸러지는 과정을 다시 봐요",
  "q-hav-3": "WHERE가 그룹을 만들기 전에 실행된다는 점을 다시 봐요",
  "b-hav-1": "묶은 뒤 그룹을 거르는 절이 HAVING이라는 점을 다시 봐요",
  "t-hav-1": "WHERE와 HAVING이 거르는 시점의 차이를 다시 봐요",
  // 공집합 집계
  "q-emp-1": "GROUP BY 없이 공집합을 집계하면 COUNT는 0, SUM은 NULL이 되는 이유를 다시 봐요",
  "q-emp-2": "GROUP BY가 있으면 공집합에서 행이 안 나오는 이유를 다시 봐요",
  "b-emp-1": "GROUP BY 없이 공집합을 집계하면 한 줄이 나오는 이유를 다시 봐요",
  "t-emp-1": "공집합에서 GROUP BY가 있을 때와 없을 때 결과 차이를 다시 봐요",
  // INNER JOIN
  "q-inner-1": "INNER JOIN에서 짝이 없는 행이 빠지는 원리를 다시 봐요",
  "b-inner-1": "INNER JOIN은 ON 조건이 맞는 행만 남긴다는 점을 다시 봐요",
  "t-inner-1": "INNER JOIN에서 행이 사라지는 이유와 OUTER JOIN과의 차이를 다시 봐요",
  // OUTER JOIN
  "q-outer-1": "LEFT OUTER JOIN에서 짝이 없는 쪽이 NULL로 채워지는 방식을 다시 봐요",
  "b-outer-1": "LEFT OUTER JOIN이 왼쪽 행을 모두 남기는 방식을 다시 봐요",
  "t-outer-1": "LEFT OUTER JOIN과 INNER JOIN의 결과 행 차이를 다시 봐요",
  // JOIN과 WHERE 적용 순서
  "q-order-1": "LEFT JOIN 뒤 WHERE가 NULL 행을 지우는 이유를 다시 봐요",
  "b-order-1": "ON은 조인할 때, WHERE는 조인 뒤에 적용된다는 순서를 다시 봐요",
  "t-order-1": "OUTER JOIN에서 조건을 ON에 둘 때와 WHERE에 둘 때의 차이를 다시 봐요",
  // 서브쿼리 반환 결과
  "q-sqr-1": "> ANY가 목록의 최솟값과 비교하는 것과 같다는 점을 다시 봐요",
  "b-sqr-1": "여러 행 서브쿼리에 쓰는 연산자(IN, ANY, ALL)를 다시 봐요",
  "t-sqr-1": "> ANY와 > ALL을 최솟값·최댓값으로 바꿔 읽는 방법을 다시 봐요",
  // 서브쿼리 위치와 뷰
  "q-sqp-1": "스칼라 서브쿼리가 0행이면 NULL이 된다는 규칙을 다시 봐요",
  "b-sqp-1": "FROM 절 서브쿼리인 인라인 뷰를 다시 봐요",
  "t-sqp-1": "인라인 뷰와 중첩 서브쿼리에서 컬럼을 쓸 수 있는 범위를 다시 봐요",
  // 연관 서브쿼리와 EXISTS
  "q-sqc-1": "NOT EXISTS가 서브쿼리 결과 0행일 때 참이 되는 원리를 다시 봐요",
  "b-sqc-1": "연관 서브쿼리가 메인쿼리 행마다 다시 계산되는 방식을 다시 봐요",
  "t-sqc-1": "연관 서브쿼리가 행마다 자기 부서 평균과 비교하는 과정을 다시 봐요",
  // NOT IN과 NULL
  "q-sqn-1": "NOT IN 목록에 NULL이 있으면 0행이 되는 이유를 다시 봐요",
  "b-sqn-1": "NULL과 비교하면 UNKNOWN이 된다는 점을 다시 봐요",
  "t-sqn-1": "NOT IN과 NULL 문제를 피하는 방법(IS NOT NULL, NOT EXISTS)을 다시 봐요",
  // ROLLUP과 인자 순서
  "q-gfr-1": "ROLLUP이 오른쪽부터 하나씩 빼며 소계를 만드는 단계를 다시 봐요",
  "b-gfr-1": "ROLLUP 컬럼 n개가 n + 1단계가 되는 이유를 다시 봐요",
  "t-gfr-1": "ROLLUP 인자 순서에 따라 소계가 달라지는 방식을 다시 봐요",
  // CUBE와 GROUPING SETS
  "q-gfc-1": "GROUPING SETS는 나열한 것만 만들고 총계가 없다는 점을 다시 봐요",
  "b-gfc-1": "GROUPING SETS에 빈 괄호 ()로 총계를 넣는 방법을 다시 봐요",
  "t-gfc-1": "CUBE와 GROUPING SETS의 결과 행 수 차이를 다시 봐요",
  // 결과표로 그룹 함수 고르기
  "q-gfp-1": "결과표의 총계와 소계 종류로 CUBE를 알아보는 방법을 다시 봐요",
  "b-gfp-1": "총계 행이 없으면 GROUPING SETS라는 판단 기준을 다시 봐요",
  "t-gfp-1": "결과표로 ROLLUP, CUBE, GROUPING SETS를 가려내는 순서를 다시 봐요",
  // GROUPING 함수
  "q-gfg-1": "원래 NULL인 행과 총계 행의 GROUPING 값 차이를 다시 봐요",
  "b-gfg-1": "GROUPING이 소계·총계 행에서 1을 돌려준다는 점을 다시 봐요",
  "t-gfg-1": "GROUPING으로 NULL 행과 총계 행을 구분하는 방법을 다시 봐요",
  // 순위 함수
  "q-wfr-1": "RANK가 동점 뒤 순위를 건너뛰는 방식을 다시 봐요",
  "b-wfr-1": "Oracle이 NULL을 가장 큰 값으로 정렬한다는 점을 다시 봐요",
  "t-wfr-1": "RANK, DENSE_RANK, ROW_NUMBER의 동점 처리 차이를 다시 봐요",
  // 집계 윈도우 함수와 프레임
  "q-wff-1": "기본 프레임 RANGE가 동점 행을 한꺼번에 더하는 방식을 다시 봐요",
  "b-wff-1": "ORDER BY만 쓴 윈도우 함수의 기본 프레임이 RANGE라는 점을 다시 봐요",
  "t-wff-1": "RANGE와 ROWS 프레임의 차이를 다시 봐요",
  // 행 순서 함수
  "q-wfo-1": "LEAD의 기본값은 가리킬 행이 없을 때만 쓰인다는 점을 다시 봐요",
  "b-wfo-1": "LAST_VALUE에 UNBOUNDED FOLLOWING 프레임이 필요한 이유를 다시 봐요",
  "t-wfo-1": "기본 프레임 때문에 LAST_VALUE가 현재 행 값을 주는 이유를 다시 봐요",
  // 비율 함수
  "q-wfq-1": "PERCENT_RANK 계산식 (RANK − 1) ÷ (행 수 − 1)을 다시 봐요",
  "b-wfq-1": "NTILE이 행 수만으로 그룹을 나눈다는 점을 다시 봐요",
  "t-wfq-1": "PERCENT_RANK와 CUME_DIST의 계산 차이를 다시 봐요",
};
