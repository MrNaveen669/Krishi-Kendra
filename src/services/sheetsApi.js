import { GOOGLE_SCRIPT_URL } from '../config/constants';

const fetchWithTimeout = async (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const normalizeProducts = (items) =>
  Array.isArray(items)
    ? items.map((product) => ({
        ...product,
        doseAcre: String(product.doseAcre ?? product.Dose_Acre ?? product.dosePerAcre ?? '').trim(),
        drumDose: String(product.drumDose ?? product.Drum_Dose ?? product.dose200LDrum ?? '').trim(),
        pumpDose: String(product.pumpDose ?? product.Pump_Dose ?? '').trim(),
        dosePerAcre: parseFloat(product.doseAcre ?? product.Dose_Acre ?? product.dosePerAcre) || 0,
        stock: typeof product.stock === 'number' ? product.stock : (parseInt(product.stock, 10) || 0),
        symptoms: Array.isArray(product.symptoms)
          ? product.symptoms
          : (product.symptoms ? String(product.symptoms).split(',').map((item) => item.trim()).filter(Boolean) : [])
      }))
    : [];

const fetchProductsFromSheet = async () => {
  if (!GOOGLE_SCRIPT_URL) {
    return { ok: false, data: [], error: 'missing-google-script-url' };
  }

  try {
    const response = await fetchWithTimeout(`${GOOGLE_SCRIPT_URL}?action=getProducts`);
    const json = await response.json();
    if (json.status === 'success' && Array.isArray(json.data)) {
      return { ok: true, data: normalizeProducts(json.data), error: null };
    }
    return { ok: false, data: [], error: json.message || 'products-fetch-failed' };
  } catch (error) {
    return {
      ok: false,
      data: [],
      error: error && error.name === 'AbortError' ? 'timeout' : (error && error.message) || 'products-fetch-failed'
    };
  }
};

const normalizeCement = (items) =>
  Array.isArray(items)
    ? items.filter((item) => item && item.category === 'सीमेंट').map((item) => ({
        id: item.id,
        brandName: String(item.brandName || ''),
        company: String(item.company || ''),
        category: 'सीमेंट',
        grade: String(item.grade || ''),
        pack: String(item.pack || '50 kg'),
        batch: String(item.batch || ''),
        expiry: String(item.expiry || ''),
        cashPrice: Number(item.cashPrice) || 0,
        creditPrice: Number(item.creditPrice) || 0,
        stock: Math.max(0, parseInt(item.stock, 10) || 0)
      }))
    : [];

const fetchCementFromSheet = async () => {
  if (!GOOGLE_SCRIPT_URL) {
    return { ok: false, data: [], error: 'missing-google-script-url' };
  }

  try {
    const response = await fetchWithTimeout(`${GOOGLE_SCRIPT_URL}?action=getCement`);
    const json = await response.json();
    if (json.status === 'success' && Array.isArray(json.data)) {
      return { ok: true, data: normalizeCement(json.data), error: null };
    }
    return { ok: false, data: [], error: json.message || 'cement-fetch-failed' };
  } catch (error) {
    return {
      ok: false,
      data: [],
      error: error && error.name === 'AbortError' ? 'timeout' : (error && error.message) || 'cement-fetch-failed'
    };
  }
};

const saveCementToGoogleSheet = async (operation) => {
  if (!GOOGLE_SCRIPT_URL) {
    return { ok: false, data: null, error: 'missing-google-script-url' };
  }

  try {
    const response = await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(operation),
      redirect: 'follow'
    });
    const text = await response.text();
    const json = (() => {
      try { return JSON.parse(text); } catch (_error) { return {}; }
    })();

    if (json.status === 'success') {
      return { ok: true, data: json, error: null };
    }

    return { ok: false, data: json, error: json.message || 'cement-save-failed' };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: error && error.name === 'AbortError' ? 'timeout' : (error && error.message) || 'cement-save-failed'
    };
  }
};

const fetchBillsFromSheet = async () => {
  if (!GOOGLE_SCRIPT_URL) {
    return { ok: false, data: [], error: 'missing-google-script-url' };
  }

  try {
    const response = await fetchWithTimeout(`${GOOGLE_SCRIPT_URL}?action=getBills`);
    const json = await response.json();
    if (json.status === 'success' && Array.isArray(json.data)) {
      const validBills = json.data
        .filter((bill) => bill && (bill.customerName || bill.billNumber))
        .map((bill) => ({
          ...bill,
          items: Array.isArray(bill.items) ? bill.items : []
        }))
        .slice(0, 100);

      return { ok: true, data: validBills, error: null };
    }
    return { ok: false, data: [], error: json.message || 'bills-fetch-failed' };
  } catch (error) {
    return {
      ok: false,
      data: [],
      error: error && error.name === 'AbortError' ? 'timeout' : (error && error.message) || 'bills-fetch-failed'
    };
  }
};

const saveBillToGoogleSheet = async (billData) => {
  if (!GOOGLE_SCRIPT_URL) {
    return { ok: false, data: null, error: 'missing-google-script-url' };
  }

  try {
    const response = await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(billData),
      redirect: 'follow'
    });
    const text = await response.text();
    const json = (() => {
      try { return JSON.parse(text); } catch (_error) { return {}; }
    })();

    if (json.status === 'success') {
      return { ok: true, data: json, error: null };
    }

    return { ok: false, data: json, error: json.message || 'bill-save-failed' };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: error && error.name === 'AbortError' ? 'timeout' : (error && error.message) || 'bill-save-failed'
    };
  }
};

export {
  fetchProductsFromSheet,
  fetchBillsFromSheet,
  saveBillToGoogleSheet,
  fetchCementFromSheet,
  saveCementToGoogleSheet
};