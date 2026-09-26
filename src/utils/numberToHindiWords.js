const numberToHindiWords = (num) => {
  const units = ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
  const tens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];

  const convertTwoDigits = (n) => {
    if (n === 0) return '';
    if (n < 20) return units[n];
    const t = Math.floor(n / 10);
    const u = n % 10;
    return tens[t] + (u > 0 ? ' ' + units[u] : '');
  };

  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'शून्य';

  let str = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rem = n % 100;

  if (crore > 0) str += convertTwoDigits(crore) + ' करोड़ ';
  if (lakh > 0) str += convertTwoDigits(lakh) + ' लाख ';
  if (thousand > 0) str += convertTwoDigits(thousand) + ' हज़ार ';
  if (hundred > 0) str += convertTwoDigits(hundred) + ' सौ ';
  if (rem > 0) str += convertTwoDigits(rem);

  return str.trim();
};

export { numberToHindiWords };
