const transliterationCache = new Map();

const COMMON_FALLBACKS = {
  ramesh: 'रमेश',
  suresh: 'सुरेश',
  mahesh: 'महेश',
  dinesh: 'दिनेश',
  ram: 'राम',
  shyam: 'श्याम',
  devri: 'देवरी',
  dhamtari: 'धमतरी',
  kisan: 'किसान',
  khad: 'खाद',
  dawa: 'दवा',
  coragen: 'कोराजन',
  dhan: 'धान',
  gehu: 'गेहूं',
  chana: 'चना',
  mirch: 'मिर्च',
  patel: 'पटेल',
  sahu: 'साहू',
  kumar: 'कुमार',
  verma: 'वर्मा',
  sharma: 'शर्मा',
  singh: 'सिंह',
  yadav: 'यादव'
};

function phoneticHinglishToHindi(word) {
  if (!word) return '';
  const lower = word.toLowerCase();
  if (COMMON_FALLBACKS[lower]) return COMMON_FALLBACKS[lower];

  const vowels = {
    'aa': 'ा', 'ai': 'ै', 'au': 'ौ', 'ee': 'ी', 'oo': 'ू',
    'a': '', 'e': 'े', 'i': 'ि', 'o': 'ो', 'u': 'ु'
  };

  const consonants = {
    'kh': 'ख', 'gh': 'घ', 'ch': 'च', 'chh': 'छ', 'jh': 'झ',
    'th': 'थ', 'dh': 'ध', 'ph': 'फ', 'bh': 'भ', 'sh': 'श',
    'shh': 'ष', 'gn': 'ज्ञ', 'tr': 'त्र',
    'k': 'क', 'g': 'ग', 'j': 'ज', 't': 'त', 'd': 'द',
    'n': 'न', 'p': 'प', 'b': 'ब', 'm': 'म', 'y': 'य',
    'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व', 's': 'स', 'h': 'ह'
  };

  let hindi = '';
  let i = 0;
  const n = lower.length;

  while (i < n) {
    let c3 = lower.slice(i, i + 3);
    let c2 = lower.slice(i, i + 2);
    let c1 = lower.slice(i, i + 1);

    if (consonants[c3]) {
      hindi += consonants[c3];
      i += 3;
    } else if (consonants[c2]) {
      hindi += consonants[c2];
      i += 2;
    } else if (consonants[c1]) {
      hindi += consonants[c1];
      i += 1;
    } else {
      if (i === 0) {
        const initVowels = { 'a': 'अ', 'aa': 'आ', 'i': 'इ', 'ee': 'ई', 'u': 'उ', 'oo': 'ऊ', 'e': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ' };
        if (initVowels[c2]) { hindi += initVowels[c2]; i += 2; continue; }
        if (initVowels[c1]) { hindi += initVowels[c1]; i += 1; continue; }
      }
      hindi += lower[i];
      i += 1;
      continue;
    }

    let m2 = lower.slice(i, i + 2);
    let m1 = lower.slice(i, i + 1);

    if (vowels[m2] !== undefined) {
      hindi += vowels[m2];
      i += 2;
    } else if (vowels[m1] !== undefined) {
      hindi += vowels[m1];
      i += 1;
    }
  }

  return hindi || word;
}

export async function transliterateWord(word) {
  if (!word || !word.trim()) return word;
  const cleanWord = word.trim().toLowerCase();

  if (transliterationCache.has(cleanWord)) return transliterationCache.get(cleanWord);
  if (COMMON_FALLBACKS[cleanWord]) return COMMON_FALLBACKS[cleanWord];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(cleanWord)}&itc=hi-t-i0-und&num=1`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
      const hindiWord = data[1][0][1][0];
      transliterationCache.set(cleanWord, hindiWord);
      return hindiWord;
    }
  } catch (_err) {}

  const offlineHindi = phoneticHinglishToHindi(cleanWord);
  if (offlineHindi) {
    transliterationCache.set(cleanWord, offlineHindi);
    return offlineHindi;
  }
  return word;
}

export function handleHinglishChange(arg1, arg2, arg3) {
  let text = '';
  let onUpdate = null;
  let lang = 'hi';

  if (typeof arg2 === 'function') {
    text = arg1 || '';
    onUpdate = arg2;
    if (typeof arg3 === 'string') lang = arg3;
  } else if (typeof arg3 === 'function') {
    text = arg1 || '';
    onUpdate = arg3;
  }

  if (!onUpdate) return;

  // Screen par instant reflect ho (No Freeze)
  onUpdate(text);

  if (lang === 'en') return;

  if (text && text.endsWith(' ')) {
    const trimmed = text.trimEnd();
    const parts = trimmed.split(' ');
    const lastWord = parts[parts.length - 1];

    if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
      transliterateWord(lastWord).then((converted) => {
        if (converted && converted !== lastWord) {
          parts[parts.length - 1] = converted;
          const newText = parts.join(' ') + ' ';
          onUpdate(newText);
        }
      });
    }
  }
}

export const handleHinglishInput = handleHinglishChange;

export default {
  transliterateWord,
  handleHinglishChange,
  handleHinglishInput
};