/** Joins words with 와/과, picked by whether the last syllable has a final consonant. */
export function joinWa(words: string[]) {
  return words.reduce((acc, w, i) => {
    if (i === 0) return w;
    const last = acc[acc.length - 1];
    const code = last.charCodeAt(0) - 0xac00;
    // Latin words are read aloud: HAVING, NULL, JOIN, GROUP end in a consonant sound; RANK, SELECT (랭크, 셀렉트) do not.
    const batchim = code >= 0 && code <= 11171 ? code % 28 !== 0 : /[LMNGPB]/i.test(last);
    return `${acc}${batchim ? "과" : "와"} ${w}`;
  }, "");
}

/** True when a word ends in a final consonant sound, reading Latin letters aloud. */
export function hasBatchim(word: string) {
  // Skip closing brackets and punctuation: "COUNT(컬럼)" ends on 럼.
  const last = word.trim().replace(/[^0-9A-Za-z가-힣]+$/, "").slice(-1);
  const code = last.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 ? code % 28 !== 0 : /[LMNGPB]/i.test(last);
}

/** 을/를 for a word: "HAVING을", "WHERE를". */
export function eulReul(word: string) {
  return `${word}${hasBatchim(word) ? "을" : "를"}`;
}
