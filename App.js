import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Text,
  View,
  ScrollView,
  StatusBar,
  Linking,
  ActivityIndicator,
  Animated,
  BackHandler,
  Modal
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GOOGLE_SCRIPT_URL } from './src/config/constants';
import { STRINGS } from './src/config/strings';
import { DEFAULT_PRODUCTS } from './src/data/defaultProducts';
import useCement from './src/hooks/useCement';
import { numberToHindiWords } from './src/utils/numberToHindiWords';
import { handleHinglishChange } from './src/utils/transliterate';
import { loadJSON, saveJSON } from './src/services/storage';
import {
  fetchProductsFromSheet as fetchProductsFromSheetService,
  fetchBillsFromSheet as fetchBillsFromSheetService,
  saveBillToGoogleSheet as saveBillToGoogleSheetService
} from './src/services/sheetsApi';
import { fetchLatestUpdateInfo, downloadAndInstallApk, CURRENT_VERSION } from './src/services/updateService';
import styles from './src/styles';
import useAppDerivedState from './src/hooks/useAppDerivedState';
import AppHeader from './src/components/AppHeader';
import BottomNavigation from './src/components/BottomNavigation';
import useDebouncedValue from './src/hooks/useDebouncedValue';
import CementScreen from './src/screens/CementScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import CropGuideScreen from './src/screens/CropGuideScreen';
import BillNumberModal from './src/components/modals/BillNumberModal';
import ConfirmationDialog from './src/components/modals/ConfirmationDialog';
import BulkProductsModal from './src/components/modals/BulkProductsModal';
import ProductEditorModal from './src/components/modals/ProductEditorModal';
import InvoicePreviewModal from './src/components/modals/InvoicePreviewModal';
import AdvisoryScreen from './src/screens/AdvisoryScreen';
import BillingScreen from './src/screens/BillingScreen';

function SafeUpdateNotificationModal({ visible, updateInfo, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!updateInfo) return null;

  const handleStartUpdate = async () => {
    try {
      setDownloading(true);
      setProgress(0);
      await downloadAndInstallApk(updateInfo.apkUrl, (percent) => {
        setProgress(percent);
      });
      setDownloading(false);
      onClose();
    } catch (err) {
      setDownloading(false);
      alert('APK डाउनलोड करने में समस्या आई।');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { padding: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>
              🔔 अपडेट सूचना (Notification)
            </Text>
            {!downloading && (
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: 20, color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ marginVertical: 14 }}>
            {updateInfo.hasUpdate ? (
              <>
                <View style={{ backgroundColor: '#dcfce7', padding: 8, borderRadius: 6, marginBottom: 10 }}>
                  <Text style={{ color: '#166534', fontWeight: 'bold', fontSize: 13 }}>
                    🚀 नया वर्जन {updateInfo.latestVersion} उपलब्ध है!
                  </Text>
                  <Text style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
                    मौजूदा वर्जन: v{CURRENT_VERSION}
                  </Text>
                </View>

                <Text style={{ fontWeight: 'bold', color: '#334155', fontSize: 12 }}>नये बदलाव:</Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
                  {updateInfo.changeLog || 'बग फिक्स और परफॉर्मेंस सुधार।'}
                </Text>
              </>
            ) : (
              <View style={{ padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginBottom: 6 }}>✅</Text>
                <Text style={{ color: '#0f172a', fontWeight: 'bold' }}>आपका ऐप पूरी तरह अपडेटेड है!</Text>
                <Text style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>वर्जन: v{CURRENT_VERSION}</Text>
              </View>
            )}
          </View>

          {updateInfo.hasUpdate && (
            <View style={{ marginTop: 10 }}>
              {downloading ? (
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: 'bold' }}>
                    डाउनलोड हो रहा है... {progress}%
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#16a34a',
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}
                  onPress={handleStartUpdate}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
                    ⬇️ Update Now (ऑटो इंस्टॉल करें)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function App() {
  const [appLang, setAppLang] = useState('hi');
  const t = STRINGS[appLang];

  const [currentTab, setCurrentTab] = useState('billing');
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const cementInventory = useCement();
  const {
    cementProducts,
    filteredCementProducts,
    brands: cementBrands,
    cementSearch,
    setCementSearch,
    brandFilter: cementBrandFilter,
    setBrandFilter: setCementBrandFilter,
    lowStockOnly: cementLowStockOnly,
    setLowStockOnly: setCementLowStockOnly,
    syncPending: cementSyncPending,
    isSyncing: isCementSyncing,
    syncCement,
    addCement,
    updateCement,
    deleteCement,
    updateCementStock,
    deductCementStock
  } = cementInventory;
  const billingProducts = useMemo(() => [...products, ...cementProducts], [products, cementProducts]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetchingBills, setIsFetchingBills] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);

  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  const [billsHistory, setBillsHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [nextBillNumber, setNextBillNumber] = useState(1221);
  const [editingBillId, setEditingBillId] = useState(null);

  const [farmerName, setFarmerName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [village, setVillage] = useState('देवरी');
  const [phone, setPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'upi' | 'credit'
  const [cart, setCart] = useState([]);
  const [billingSearch, setBillingSearch] = useState('');
  const [discount, setDiscount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');

  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodForm, setProdForm] = useState({
    brandName: '',
    technical: '',
    company: '',
    pack: '',
    batch: 'NEW',
    expiry: '2028',
    category: 'कीटनाशक',
    power: 'Medium',
    crop: 'धान',
    cashPrice: '',
    creditPrice: '',
    stock: '25',
    doseAcre: '',
    dosePerAcre: '',
    drumDose: '',
    pumpDose: '',
    doseUnit: 'ml',
    waterPerAcre: '150 L',
    symptoms: '',
    keywords: ''
  });

  const [bulkAddModalVisible, setBulkAddModalVisible] = useState(false);
  const [bulkProductsText, setBulkProductsText] = useState('');

  const [advisorySearch, setAdvisorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSymptom, setSelectedSymptom] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [acreState, setAcreState] = useState({});

  const [activeInvoice, setActiveInvoice] = useState(null);
  const [editBillNoModal, setEditBillNoModal] = useState(false);
  const [customBillInput, setCustomBillInput] = useState('1221');

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const toastFadeAnim = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
    Animated.sequence([
      Animated.timing(toastFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastFadeAnim, { toValue: 0, duration: 250, useNativeDriver: true })
    ]).start(() => setToast({ visible: false, message: '', type: 'success' }));
  }, [toastFadeAnim]);

  const [dialog, setDialog] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'ℹ️',
    confirmText: 'ठीक है',
    cancelText: null,
    onConfirm: null,
    isDestructive: false
  });

  const showDialog = useCallback(({ title, message, icon = 'ℹ️', confirmText = 'ठीक है', cancelText = null, onConfirm = null, isDestructive = false }) => {
    setDialog({
      visible: true,
      title,
      message,
      icon,
      confirmText,
      cancelText,
      onConfirm,
      isDestructive
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, visible: false }));
  }, []);

  const debouncedBillingSearch = useDebouncedValue(billingSearch, 250);
  const debouncedAdvisorySearch = useDebouncedValue(advisorySearch, 300);
  const debouncedHistorySearch = useDebouncedValue(historySearch, 300);

  useEffect(() => {
    const handleBackPress = () => {
      if (dialog.visible) {
        closeDialog();
        return true;
      }
      if (updateModalVisible) {
        setUpdateModalVisible(false);
        return true;
      }
      if (productModalVisible) {
        setProductModalVisible(false);
        return true;
      }
      if (bulkAddModalVisible) {
        setBulkAddModalVisible(false);
        return true;
      }
      if (activeInvoice) {
        setActiveInvoice(null);
        return true;
      }
      if (editBillNoModal) {
        setEditBillNoModal(false);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [activeInvoice, bulkAddModalVisible, closeDialog, dialog.visible, editBillNoModal, productModalVisible, updateModalVisible]);

  useEffect(() => {
    let mounted = true;
    fetchLatestUpdateInfo().then((info) => {
      if (mounted && info) {
        setUpdateInfo(info);
      }
    });
    return () => { mounted = false; };
  }, []);

  const fetchProductsFromSheet = async (manual = false) => {
    const cachedProducts = await loadJSON('jkk:products', DEFAULT_PRODUCTS);
    setProducts(Array.isArray(cachedProducts) ? cachedProducts.filter((product) => product.category !== 'सीमेंट') : DEFAULT_PRODUCTS);

    if (!GOOGLE_SCRIPT_URL) return;
    try {
      setIsFetchingProducts(true);
      const result = await fetchProductsFromSheetService();
      if (result.ok && Array.isArray(result.data)) {
        const pesticideProducts = result.data.filter((product) => product.category !== 'सीमेंट');
        setProducts(pesticideProducts);
        await saveJSON('jkk:products', pesticideProducts);
        if (manual) showToast(`कुल ${pesticideProducts.length} दवाइयां और स्टॉक लोड हुए!`, 'success');
      }
    } catch (err) {
      if (manual) showToast('दवाइयां फेच नहीं हो सकीं।', 'error');
    } finally {
      setIsFetchingProducts(false);
    }
  };

  const fetchBillsFromSheet = async (manual = false) => {
    const cachedBills = await loadJSON('jkk:bills', []);
    if (Array.isArray(cachedBills) && cachedBills.length > 0) {
      setBillsHistory(cachedBills);
    }

    if (!GOOGLE_SCRIPT_URL) return;
    try {
      setIsFetchingBills(true);
      const result = await fetchBillsFromSheetService();
      if (result.ok && Array.isArray(result.data)) {
        const validBills = result.data;
        setBillsHistory(validBills);
        await saveJSON('jkk:bills', validBills);

        if (validBills.length > 0) {
          const maxBillNo = Math.max(...validBills.map((b) => parseInt(b.billNumber, 10) || 0));
          if (maxBillNo >= 1221) {
            setNextBillNumber(maxBillNo + 1);
            await saveJSON('jkk:nextBillNo', maxBillNo + 1);
          }
        }

        if (manual) showToast(`${validBills.length} बिल लोड हुए!`, 'success');
      }
    } catch (err) {
      if (manual) showToast('Database से बिल फेच नहीं हो सके।', 'error');
    } finally {
      setIsFetchingBills(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const hydrateCachedState = async () => {
      const cachedProducts = await loadJSON('jkk:products', DEFAULT_PRODUCTS);
      const cachedBills = await loadJSON('jkk:bills', []);
      const cachedNextBill = await loadJSON('jkk:nextBillNo', 1221);

      if (!mounted) return;
      setProducts(Array.isArray(cachedProducts) ? cachedProducts.filter((product) => product.category !== 'सीमेंट') : DEFAULT_PRODUCTS);
      setBillsHistory(cachedBills);
      setNextBillNumber(cachedNextBill || 1221);
    };

    hydrateCachedState();
    fetchProductsFromSheet(false);
    fetchBillsFromSheet(false);

    return () => { mounted = false; };
  }, []);

  const {
    dynamicSymptomsList,
    subtotal,
    grandTotal,
    effectivePaid,
    balanceDue,
    searchResults,
    filteredAdvisoryProducts,
    filteredBillsHistory,
    dailySummary
  } = useAppDerivedState({
    products,
    billingProducts,
    billingSearch: debouncedBillingSearch,
    advisorySearch: debouncedAdvisorySearch,
    selectedCategory,
    selectedSymptom,
    showLowStockOnly,
    historySearch: debouncedHistorySearch,
    billsHistory,
    cart,
    discount,
    paymentMode,
    paidAmount
  });

  const resetEntireForm = useCallback(() => {
    setFarmerName('');
    setFatherName('');
    setVillage('देवरी');
    setPhone('');
    setCart([]);
    setBillingSearch('');
    setDiscount('');
    setPaidAmount('');
    setPaymentMode('cash');
    setEditingBillId(null);
  }, []);

  const handlePhoneChange = useCallback((val) => {
    const cleaned = (val || '').replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  }, []);

  const handleDiscountChange = useCallback((val) => {
    const cleaned = (val || '').replace(/\D/g, '');
    const num = parseFloat(cleaned) || 0;
    if (subtotal > 0 && num > subtotal) {
      setDiscount(String(subtotal));
    } else {
      setDiscount(cleaned);
    }
  }, [subtotal]);

  const handlePaidAmountChange = useCallback((val) => {
    const cleaned = (val || '').replace(/\D/g, '');
    const num = parseFloat(cleaned) || 0;
    if (grandTotal > 0 && num > grandTotal) {
      setPaidAmount(String(grandTotal));
    } else {
      setPaidAmount(cleaned);
    }
  }, [grandTotal]);

  const togglePaymentMode = useCallback((mode) => {
    setPaymentMode(mode);
    setCart((prev) =>
      prev.map((it) => ({
        ...it,
        sellingPrice: (mode === 'cash' || mode === 'upi') ? it.cashPrice : it.creditPrice
      }))
    );
  }, []);

  const addToCart = useCallback((product, customQty = 1) => {
    const qtyToAdd = Math.max(1, Math.ceil(customQty));
    const existing = cart.find((i) => i.id === product.id);
    const alreadyInCart = existing ? existing.qty : 0;
    const totalDemanded = alreadyInCart + qtyToAdd;

    if (typeof product.stock === 'number' && product.stock <= 0) {
      showToast(`'${product.brandName}' का स्टॉक खत्म है!`, 'error');
      return;
    }
    if (typeof product.stock === 'number' && totalDemanded > product.stock) {
      showToast(`स्टॉक में केवल ${product.stock} उपलब्ध हैं!`, 'error');
      return;
    }

    const rate = (paymentMode === 'cash' || paymentMode === 'upi') ? product.cashPrice : product.creditPrice;
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + qtyToAdd } : i));
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          brandName: product.brandName,
          technical: product.technical,
          pack: product.pack,
          batch: product.batch || 'NEW',
          expiry: product.expiry || '2028',
          cashPrice: product.cashPrice,
          creditPrice: product.creditPrice,
          sellingPrice: rate,
          qty: qtyToAdd,
          stock: product.stock,
          category: product.category || 'कीटनाशक',
          grade: product.grade || ''
        }
      ]);
    }
    setBillingSearch('');
  }, [cart, paymentMode, showToast]);

  const updateCartQty = useCallback((idx, delta) => {
    const updated = [...cart];
    const item = updated[idx];
    const newQty = item.qty + delta;

    if (newQty <= 0) {
      updated.splice(idx, 1);
    } else {
      if (delta > 0 && typeof item.stock === 'number' && newQty > item.stock) {
        showToast(`स्टॉक में केवल ${item.stock} बोतल/पैक उपलब्ध हैं!`, 'error');
        return;
      }
      updated[idx].qty = newQty;
    }
    setCart(updated);
  }, [cart, showToast]);

  const updateCartPrice = useCallback((idx, text) => {
    const cleanText = (text || '').replace(/\D/g, '');
    const updated = [...cart];
    updated[idx].sellingPrice = parseFloat(cleanText) || 0;
    setCart(updated);
  }, [cart]);

  const updateAcre = useCallback((prodId, delta) => {
    const cur = parseFloat(acreState[prodId] || 1.0);
    const nextVal = Math.max(0.25, parseFloat((cur + delta).toFixed(2)));
    setAcreState((prev) => ({ ...prev, [prodId]: String(nextVal) }));
  }, []);

  const setExactAcre = useCallback((prodId, text) => {
    const clean = text.replace(/[^0-9.]/g, '');
    setAcreState((prev) => ({ ...prev, [prodId]: clean }));
  }, []);

  const openAddProductModal = () => {
    setEditingProductId(null);
    setProdForm({
      brandName: '',
      technical: '',
      company: '',
      pack: '',
      batch: 'NEW',
      expiry: '2028',
      category: 'कीटनाशक',
      power: 'Medium',
      crop: 'धान',
      cashPrice: '',
      creditPrice: '',
      stock: '25',
      doseAcre: '',
      dosePerAcre: '',
      drumDose: '',
      pumpDose: '',
      doseUnit: 'ml',
      waterPerAcre: '150 L',
      symptoms: '',
      keywords: ''
    });
    setProductModalVisible(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProductId(prod.id);
    setProdForm({
      brandName: prod.brandName,
      technical: prod.technical || '',
      company: prod.company || '',
      pack: prod.pack || '',
      batch: prod.batch || '',
      expiry: prod.expiry || '',
      category: prod.category || 'कीटनाशक',
      power: prod.power || 'Medium',
      crop: prod.crop || 'धान',
      cashPrice: String(prod.cashPrice || ''),
      creditPrice: String(prod.creditPrice || ''),
      stock: String(prod.stock !== undefined ? prod.stock : 20),
      doseAcre: prod.doseAcre || String(prod.dosePerAcre || ''),
      dosePerAcre: String(prod.dosePerAcre || prod.doseAcre || ''),
      drumDose: prod.drumDose || '',
      pumpDose: prod.pumpDose || '',
      doseUnit: prod.doseUnit || 'ml',
      waterPerAcre: prod.waterPerAcre || '150 L',
      symptoms: Array.isArray(prod.symptoms) ? prod.symptoms.join(', ') : '',
      keywords: prod.keywords ? prod.keywords.join(', ') : ''
    });
    setProductModalVisible(true);
  };

  const deleteProduct = (prod) => {
    showDialog({
      title: 'दवा हटाएं?',
      message: `क्या आप वाकई "${prod.brandName}" को कैटलॉग से हटाना चाहते हैं?`,
      icon: '🗑️',
      confirmText: 'हाँ, हटाएं',
      cancelText: 'रद्द करें',
      isDestructive: true,
      onConfirm: () => {
        setProducts((prev) => prev.filter((p) => p.id !== prod.id));
        showToast(`${prod.brandName} हटा दी गई!`, 'info');
      }
    });
  };

  const handleSaveProduct = async () => {
    if (!prodForm.brandName.trim()) {
      showDialog({
        title: 'अधूरी जानकारी',
        message: 'कृपया दवा का व्यापारिक नाम दर्ज करें!',
        icon: '⚠️'
      });
      return;
    }
    const cPrice = parseFloat(prodForm.cashPrice) || 0;
    const crPrice = parseFloat(prodForm.creditPrice) || cPrice;
    const dose = parseFloat(prodForm.dosePerAcre || prodForm.doseAcre) || 0;
    const stockQty = parseInt(prodForm.stock, 10) || 0;

    const keywordsArr = prodForm.keywords
      ? prodForm.keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean)
      : [];
    const symptomsArr = prodForm.symptoms
      ? prodForm.symptoms.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    let savedItem;
    if (editingProductId) {
      savedItem = {
        id: editingProductId,
        ...prodForm,
        doseAcre: prodForm.doseAcre || prodForm.dosePerAcre,
        dosePerAcre: dose,
        drumDose: prodForm.drumDose || '',
        pumpDose: prodForm.pumpDose || '',
        batch: prodForm.batch.trim() || 'NEW',
        expiry: prodForm.expiry.trim() || '2028',
        cashPrice: cPrice,
        creditPrice: crPrice,
        stock: stockQty,
        symptoms: symptomsArr,
        keywords: keywordsArr
      };
      setProducts((prev) => prev.map((p) => (p.id === editingProductId ? savedItem : p)));
      showToast(`${prodForm.brandName} अपडेट हो गई!`, 'success');
    } else {
      savedItem = {
        id: 'p_' + Date.now(),
        ...prodForm,
        doseAcre: prodForm.doseAcre || prodForm.dosePerAcre,
        dosePerAcre: dose,
        drumDose: prodForm.drumDose || '',
        pumpDose: prodForm.pumpDose || '',
        batch: prodForm.batch.trim() || 'NEW',
        expiry: prodForm.expiry.trim() || '2028',
        cashPrice: cPrice,
        creditPrice: crPrice,
        stock: stockQty,
        symptoms: symptomsArr,
        keywords: keywordsArr
      };
      setProducts([savedItem, ...products]);
      showToast(`${prodForm.brandName} कैटलॉग में जुड़ गई!`, 'success');
    }
    setProductModalVisible(false);

    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'saveProducts', products: [savedItem] }),
          redirect: 'follow'
        });
      } catch (e) {
        console.log('Product save error', e);
      }
    }
  };

  const handleBulkAddSubmit = async () => {
    if (!bulkProductsText.trim()) {
      showDialog({
        title: 'खाली इनपुट',
        message: 'कृपया बल्क दवाइयाँ प्रारूप अनुसार पेस्ट या टाइप करें!',
        icon: '⚠️'
      });
      return;
    }

    const lines = bulkProductsText.split('\n');
    const newItems = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split(',').map((p) => p.trim());
      if (parts.length > 0 && parts[0]) {
        const brandName = parts[0];
        const technical = parts[1] || 'कृषि तकनीकी रसायन';
        const company = parts[2] || 'ब्रांडेड';
        const pack = parts[3] || 'मानक पैक';
        const cashPrice = parseFloat(parts[4]) || 0;
        const creditPrice = parseFloat(parts[5]) || cashPrice;
        const dosePerAcre = parseFloat(parts[6]) || 50;
        const batch = parts[7] || ('LOT' + Math.floor(10 + Math.random() * 90));
        const expiry = parts[8] || '2028';
        const stock = parseInt(parts[9], 10) || 20;

        newItems.push({
          id: 'p_' + Date.now() + '_' + index,
          brandName,
          technical,
          company,
          pack,
          batch,
          expiry,
          stock,
          category: 'कीटनाशक',
          power: 'Medium',
          crop: 'धान',
          cashPrice,
          creditPrice,
          doseAcre: `${dosePerAcre} ml`,
          dosePerAcre,
          drumDose: '60-80 ml',
          pumpDose: '5-10 ml',
          doseUnit: 'ml',
          waterPerAcre: '150 L',
          symptoms: ['इल्ली', 'तना छेदक'],
          keywords: [brandName.toLowerCase(), technical.toLowerCase()]
        });
      }
    });

    if (newItems.length === 0) {
      showDialog({
        title: 'प्रारूप अमान्य',
        message: 'दवाइयों का प्रारूप सही नहीं था।',
        icon: '⚠️'
      });
      return;
    }

    setProducts((prev) => [...newItems, ...prev]);
    setBulkProductsText('');
    setBulkAddModalVisible(false);
    showToast(`${newItems.length} दवाइयां ऐप में जुड़ गईं!`, 'info');

    if (GOOGLE_SCRIPT_URL) {
      try {
        setIsSyncing(true);
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'saveProducts', products: newItems }),
          redirect: 'follow'
        });
      } catch (err) {
        console.log('Database Product Sync Error:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const saveBillToGoogleSheet = async (billData, updatedProductStockList) => {
    const payload = {
      ...billData,
      updatedStock: updatedProductStockList
    };

    if (!GOOGLE_SCRIPT_URL) return;
    try {
      setIsSyncing(true);
      const result = await saveBillToGoogleSheetService(payload);
      if (result.ok) {
        showToast('बिल Database में सुरक्षित व स्टॉक अपडेट हुआ!', 'success');
        return;
      }
      const pendingBills = await loadJSON('jkk:pendingBills', []);
      await saveJSON('jkk:pendingBills', [payload, ...pendingBills]);
      showToast(`⏳ ${pendingBills.length + 1} बिल sync बाकी`, 'info');
    } catch (err) {
      const pendingBills = await loadJSON('jkk:pendingBills', []);
      await saveJSON('jkk:pendingBills', [payload, ...pendingBills]);
      showToast(`⏳ ${pendingBills.length + 1} बिल sync बाकी`, 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  // FINALIZE BILL: Preserves original purchase date & records settlement time
  const finalizeBill = async () => {
    if (!farmerName.trim()) {
      showDialog({
        title: 'अधूरी जानकारी',
        message: 'कृपया किसान का नाम दर्ज करें!',
        icon: '⚠️'
      });
      return;
    }
    if (cart.length === 0) {
      showDialog({
        title: 'खाली बिल',
        message: t.emptyBillError,
        icon: '🛒'
      });
      return;
    }

    const existingBill = editingBillId ? billsHistory.find(b => b.id === editingBillId) : null;
    const nowTimestamp = new Date().toLocaleString('hi-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const stockDeductionSummary = [];
    const newProductsState = products.map((prod) => {
      const soldItem = cart.find((c) => c.id === prod.id);
      if (soldItem) {
        const remainingStock = Math.max(0, (prod.stock || 0) - soldItem.qty);
        stockDeductionSummary.push({ id: prod.id, stock: remainingStock });
        return { ...prod, stock: remainingStock };
      }
      return prod;
    });
    const cementStockUpdates = await deductCementStock(cart);
    stockDeductionSummary.push(...cementStockUpdates);

    const assignedNo = String(nextBillNumber);
    const updatedBillObj = {
      id: editingBillId || ('BILL_' + Date.now()),
      billNumber: assignedNo,
      // Preserves original purchase date
      date: existingBill ? existingBill.date : new Date().toLocaleDateString('hi-IN'),
      customerName: farmerName.trim(),
      customerFatherName: fatherName.trim(),
      customerVillage: village.trim() || 'देवरी',
      customerPhone: phone.trim(),
      paymentMode, // 'cash' | 'upi' | 'credit'
      items: [...cart],
      subtotal,
      discount: parseFloat(discount) || 0,
      grandTotal,
      paidAmount: effectivePaid,
      balanceDue,
      // Records settlement timestamp
      lastPaymentDate: editingBillId ? nowTimestamp : (effectivePaid > 0 ? nowTimestamp : '')
    };

    const nextHistory = editingBillId
      ? billsHistory.map((b) => (b.id === editingBillId ? updatedBillObj : b))
      : [updatedBillObj, ...billsHistory];

    setProducts(newProductsState);
    setBillsHistory(nextHistory);
    await saveJSON('jkk:products', newProductsState);
    await saveJSON('jkk:bills', nextHistory);
    const nextBillNumberValue = Number(assignedNo) + 1;
    await saveJSON('jkk:nextBillNo', nextBillNumberValue);
    setNextBillNumber(nextBillNumberValue);

    saveBillToGoogleSheet(updatedBillObj, stockDeductionSummary);

    showToast(editingBillId ? `बिल #${assignedNo} अपडेट हुआ!` : `बिल #${assignedNo} तैयार हुआ!`, 'success');
    setActiveInvoice(updatedBillObj);
    resetEntireForm();
  };

  const handleEditBillFromHistory = (bill) => {
    if (!bill) return;
    setEditingBillId(bill.id);
    setNextBillNumber(parseInt(bill.billNumber, 10) || nextBillNumber);
    setFarmerName(bill.customerName || '');
    setFatherName(bill.customerFatherName || '');
    setVillage(bill.customerVillage || 'देवरी');
    setPhone(bill.customerPhone || '');
    setPaymentMode(bill.paymentMode || 'cash');

    const safeItems = Array.isArray(bill.items) ? bill.items.map((it) => ({
      id: it.id || ('it_' + Math.random()),
      brandName: it.brandName || 'दवा',
      category: it.category || 'कीटनाशक',
      grade: it.grade || '',
      technical: it.technical || '',
      pack: it.pack || '',
      batch: it.batch || 'NEW',
      expiry: it.expiry || '2028',
      cashPrice: Number(it.cashPrice) || Number(it.sellingPrice) || 0,
      creditPrice: Number(it.creditPrice) || Number(it.sellingPrice) || 0,
      sellingPrice: Number(it.sellingPrice) || 0,
      qty: Number(it.qty) || 1
    })) : [];

    setCart(safeItems);
    setDiscount(bill.discount ? String(bill.discount) : '');
    setPaidAmount(bill.paidAmount ? String(bill.paidAmount) : '');
    setCurrentTab('billing');
    showToast(`बिल #${bill.billNumber} काउंटर पर लोड हो गया!`, 'info');
  };

  const printOrDownloadPDF = async (bill) => {
    if (!bill) return;
    const totalQty = (bill.items || []).reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
    const amountInWords = numberToHindiWords(bill.grandTotal);

    const rowsHtml = (bill.items || [])
      .map(
        (it, idx) => `
        <tr>
          <td style="border: 1px solid #111; padding: 6px 4px; text-align: center;">${idx + 1}</td>
          <td style="border: 1px solid #111; padding: 6px 8px; text-align: left;">
            <strong>${it.brandName}${it.grade ? ` (${it.grade})` : ''}</strong>
            ${it.technical ? `<div style="font-size: 10px; color: #444;">${it.technical}</div>` : ''}
          </td>
          <td style="border: 1px solid #111; padding: 6px 4px; text-align: center;">${it.batch || '-'}</td>
          <td style="border: 1px solid #111; padding: 6px 4px; text-align: center;">${it.expiry || '-'}</td>
          <td style="border: 1px solid #111; padding: 6px 4px; text-align: center;">${it.category === 'सीमेंट' ? `${it.pack || ''} bag` : it.pack || '-'}</td>
          <td style="border: 1px solid #111; padding: 6px 4px; text-align: center; font-weight: bold;">${it.qty}${it.category === 'सीमेंट' ? ' bags' : ''}</td>
          <td style="border: 1px solid #111; padding: 6px 6px; text-align: right;">${Number(it.sellingPrice).toFixed(2)}</td>
          <td style="border: 1px solid #111; padding: 6px 6px; text-align: right; font-weight: bold;">${(it.qty * it.sellingPrice).toFixed(2)}</td>
        </tr>`
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>जीवन_कृषि_बिल_${bill.billNumber}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Helvetica Neue', 'Arial', sans-serif; color: #000; background-color: #fff; margin: 0; padding: 0; }
            .memo-box { border: 1.5px solid #111; padding: 14px 18px; background-color: #fffdfa; border-radius: 4px; }
            .top-meta-row { display: flex; justify-content: space-between; align-items: flex-start; font-size: 10.5px; line-height: 1.35; }
            .center-header { text-align: center; margin-top: -6px; }
            .memo-type-badge { display: inline-block; font-size: 12px; font-weight: bold; padding: 1px 10px; border: 1px solid #000; border-radius: 3px; margin-bottom: 4px; }
            .shop-title { font-size: 24px; font-weight: 900; letter-spacing: 0.5px; margin: 2px 0; }
            .customer-strip { display: flex; justify-content: space-between; border-top: 1px solid #111; border-bottom: 1px solid #111; padding: 6px 2px; margin: 10px 0 12px 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
            th { border: 1px solid #111; padding: 6px 4px; background-color: #f7f3ea; font-weight: bold; text-align: center; }
            .footer-words-box { margin-top: 10px; padding: 6px 8px; font-size: 11.5px; font-weight: bold; border-bottom: 1px dashed #777; }
          </style>
        </head>
        <body>
          <div class="memo-box">
            <div class="top-meta-row">
              <div><strong>GSTIN :</strong> 22FTUPS0621B1ZU<br/><strong>Pes. L.No :</strong> RYP/1315</div>
              <div class="center-header">
                <div class="memo-type-badge">${bill.paymentMode === 'upi' ? 'ऑनलाइन / UPI रसीद' : bill.paymentMode === 'cash' ? 'केश मेमो' : 'उधार पर्ची'}</div>
                <div class="shop-title">जीवन कृषि केन्द्र</div>
                <div>ग्राम - देवरी, जिला - धमतरी (छ.ग.) | 70891-01502</div>
              </div>
            </div>
            <div class="customer-strip">
              <div><strong>क्र. <span style="color: #b91c1c;">${bill.billNumber}</span></strong> &nbsp; <strong>नाम:</strong> ${bill.customerName}</div>
              <div><strong>(गांव :</strong> ${bill.customerVillage || 'देवरी'}<strong>)</strong> &nbsp; <strong>दि. :</strong> ${bill.date}</div>
            </div>
            <table>
              <thead>
                <tr><th>क्र.</th><th>विवरण</th><th>बेच</th><th>अवधि</th><th>भरती</th><th>मात्रा</th><th>दर</th><th>रकम</th></tr>
              </thead>
              <tbody>
                ${rowsHtml}
                <tr style="background-color: #faf6ee;">
                  <td colspan="5" style="border: 1px solid #111; text-align: right; padding: 6px 8px;"><strong>कुल योग :-</strong></td>
                  <td style="border: 1px solid #111; text-align: center; font-weight: 900;">${totalQty}</td>
                  <td style="border: 1px solid #111; text-align: center; font-weight: bold;">कुल:</td>
                  <td style="border: 1px solid #111; text-align: right; font-weight: 900;">₹ ${Number(bill.grandTotal).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div class="footer-words-box">अक्षरों में : ${amountInWords} रुपये मात्र</div>
            ${bill.lastPaymentDate ? `<div style="font-size: 10px; color: #555; margin-top: 6px;">अंतिम भुगतान दिनांक: ${bill.lastPaymentDate} (${bill.paymentMode === 'upi' ? 'UPI' : 'नकद'})</div>` : ''}
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        await Print.printAsync({ html: htmlContent });
      }
    } catch (e) {
      showToast('प्रिंटिंग में समस्या आई', 'error');
    }
  };

  const sendWhatsApp = (bill) => {
    if (!bill) return;
    const msg =
      `*॥ जीवन कृषि केन्द्र ॥*\n` +
      `बिल क्र.: #${bill.billNumber} | दिनांक: ${bill.date}\n` +
      `किसान: ${bill.customerName} (${bill.customerVillage})\n` +
      `माध्यम: ${bill.paymentMode === 'upi' ? '📱 UPI / ऑनलाइन' : bill.paymentMode === 'cash' ? '💵 नकद' : '📋 उधार'}\n` +
      `कुल रकम: ₹${bill.grandTotal} | जमा: ₹${bill.paidAmount}\n` +
      (bill.balanceDue > 0 ? `*शेष बाकी उधारी:* ₹${bill.balanceDue}\n` : '') +
      (bill.lastPaymentDate ? `भुगतान समय: ${bill.lastPaymentDate}\n` : '') +
      `धन्यवाद! जीवन कृषि केन्द्र (70891-01502)`;

    const cleanPhone = (bill.customerPhone || '').replace(/\D/g, '');
    const url = cleanPhone.length >= 10
      ? `whatsapp://send?phone=91${cleanPhone.slice(-10)}&text=${encodeURIComponent(msg)}`
      : `whatsapp://send?text=${encodeURIComponent(msg)}`;

    Linking.openURL(url).catch(() => showToast('WhatsApp खोलने में असमर्थ', 'error'));
  };

  // Direct WhatsApp Tagada Alert Function
  const sendPaymentReminderWhatsApp = (bill) => {
    if (!bill) return;
    const isDue = Number(bill.balanceDue || 0) > 0;
    let msg = '';

    if (isDue) {
      msg =
        `*॥ जीवन कृषि केन्द्र (खाता सूचना / तगादा) ॥*\n` +
        `नमस्ते श्री ${bill.customerName} जी,\n` +
        `ग्राम - ${bill.customerVillage || 'देवरी'}, धमतरी (छ.ग.)\n\n` +
        `आपके बिल क्र. *#${bill.billNumber}* (दवाई क्रय तिथि: ${bill.date}) की शेष उधारी राशि *₹${bill.balanceDue}* बाकी है।\n` +
        `कृपया सुविधा अनुसार दुकान पर आकर या UPI माध्यम से भुगतान करने का कष्ट करें।\n\n` +
        `सम्पर्क: 70891-01502 | जीवन कृषि केन्द्र`;
    } else {
      msg =
        `*॥ जीवन कृषि केन्द्र (भुगतान पावती) ॥*\n` +
        `नमस्ते श्री ${bill.customerName} जी,\n` +
        `आपके बिल क्र. *#${bill.billNumber}* (क्रय तिथि: ${bill.date}) का कुल भुगतान ₹${bill.grandTotal} पूर्णतः प्राप्त हो चुका है।\n` +
        (bill.lastPaymentDate ? `अंतिम भुगतान समय: ${bill.lastPaymentDate} (${bill.paymentMode === 'upi' ? 'UPI' : 'नकद'})\n` : '') +
        `जीवन कृषि केन्द्र पर खरीदारी के लिए धन्यवाद!`;
    }

    const cleanPhone = (bill.customerPhone || '').replace(/\D/g, '');
    const url = cleanPhone.length >= 10
      ? `whatsapp://send?phone=91${cleanPhone.slice(-10)}&text=${encodeURIComponent(msg)}`
      : `whatsapp://send?text=${encodeURIComponent(msg)}`;

    Linking.openURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msg)}`);
        }
      })
      .catch(() => showToast('WhatsApp खोलने में असमर्थ', 'error'));
  };

  return (
    <SafeAreaProvider>
      <View style={styles.rootContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#14532d" translucent={false} />

        <AppHeader
          appLang={appLang}
          setAppLang={setAppLang}
          showToast={showToast}
          isSyncing={isSyncing}
          t={t}
          hasUpdate={Boolean(updateInfo?.hasUpdate)}
          onOpenNotification={() => setUpdateModalVisible(true)}
        />

        {currentTab === 'history' ? (
          <HistoryScreen
            data={filteredBillsHistory}
            dailySummary={dailySummary}
            t={t}
            isFetchingBills={isFetchingBills}
            historySearch={historySearch}
            onSyncHistory={() => fetchBillsFromSheet(true)}
            onSearchChange={(val) => handleHinglishChange(val, setHistorySearch, appLang)}
            onClearSearch={() => setHistorySearch('')}
            onOpenBill={setActiveInvoice}
            onEdit={handleEditBillFromHistory}
            onPrint={printOrDownloadPDF}
            onWhatsApp={sendWhatsApp}
            onReminder={sendPaymentReminderWhatsApp}
          />
        ) : currentTab === 'search' ? (
          <AdvisoryScreen
            products={filteredAdvisoryProducts}
            productCount={products.length}
            symptoms={dynamicSymptomsList}
            t={t}
            isFetchingProducts={isFetchingProducts}
            search={advisorySearch}
            selectedSymptom={selectedSymptom}
            selectedCategory={selectedCategory}
            showLowStockOnly={showLowStockOnly}
            acreState={acreState}
            onSyncProducts={() => fetchProductsFromSheet(true)}
            onSearchChange={setAdvisorySearch}
            onAddProduct={openAddProductModal}
            onBulkAdd={() => setBulkAddModalVisible(true)}
            onSelectSymptom={setSelectedSymptom}
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setShowLowStockOnly(false);
            }}
            onToggleLowStock={() => setShowLowStockOnly((previous) => !previous)}
            onUpdateAcre={updateAcre}
            onSetExactAcre={setExactAcre}
            onSetAcre={(productId, value) => setAcreState((previous) => ({ ...previous, [productId]: value }))}
            onEditProduct={openEditProductModal}
            onDeleteProduct={deleteProduct}
            onAddToCart={(product, quantity) => {
              addToCart(product, quantity);
              if (quantity === 1) showToast(`${product.brandName} बिल में जुड़ा!`, 'success');
            }}
            setCurrentTab={setCurrentTab}
          />
        ) : currentTab === 'cement' ? (
          <CementScreen
            products={filteredCementProducts}
            brands={cementBrands}
            t={t}
            search={cementSearch}
            onSearchChange={setCementSearch}
            brandFilter={cementBrandFilter}
            onBrandFilter={setCementBrandFilter}
            lowStockOnly={cementLowStockOnly}
            onToggleLowStock={() => setCementLowStockOnly((previous) => !previous)}
            syncPending={cementSyncPending}
            isSyncing={isCementSyncing}
            onSync={syncCement}
            onSaveCement={async (item) => {
              const isExisting = cementProducts.some((existing) => existing.id === item.id);
              if (isExisting) await updateCement(item);
              else await addCement(item);
              showToast(isExisting ? t.cementUpdated : t.cementAdded, 'success');
            }}
            onDeleteCement={(item) => showDialog({
              title: t.cementDeleteTitle,
              message: t.cementDeleteMessage.replace('{brand}', item.brandName),
              icon: '🗑️',
              confirmText: 'हाँ, हटाएं',
              cancelText: 'रद्द करें',
              isDestructive: true,
              onConfirm: async () => {
                await deleteCement(item);
                showToast(t.cementDeleted, 'info');
              }
            })}
            onUpdateStock={updateCementStock}
            onAddToBill={(item) => {
              addToCart(item, 1);
              showToast(t.cementAddedToBill, 'success');
              setCurrentTab('billing');
            }}
          />
        ) : (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentInner}
            keyboardShouldPersistTaps="handled"
          >
            {currentTab === 'billing' && (
              <BillingScreen
                t={t}
                editingBillId={editingBillId}
                nextBillNumber={nextBillNumber}
                paymentMode={paymentMode}
                billingSearch={billingSearch}
                searchResults={searchResults}
                farmerName={farmerName}
                fatherName={fatherName}
                village={village}
                phone={phone}
                cart={cart}
                subtotal={subtotal}
                discount={discount}
                grandTotal={grandTotal}
                paidAmount={paidAmount}
                balanceDue={balanceDue}
                onReset={resetEntireForm}
                onTogglePaymentMode={togglePaymentMode}
                onSearchChange={(text) => handleHinglishChange(text, setBillingSearch, appLang)}
                onAddSearchProduct={(product) => {
                  if (typeof product.stock === 'number' && product.stock <= 0) {
                    showToast(product.category === 'सीमेंट' ? t.cementOutOfStock : `'${product.brandName}' का स्टॉक खत्म है!`, 'error');
                    return;
                  }
                  addToCart(product, 1);
                  showToast(product.category === 'सीमेंट' ? t.cementAddedToBill : `${product.brandName} कार्ट में जोड़ी गई!`, 'success');
                }}
                onOpenBillNumber={() => {
                  setCustomBillInput(String(nextBillNumber));
                  setEditBillNoModal(true);
                }}
                onRequestNewBill={() => showDialog({
                  title: 'नया बिल शुरू करें?',
                  message: 'क्या आप नई पर्ची शुरू करना चाहते हैं?',
                  icon: '🔄',
                  confirmText: 'हाँ, रीसेट करें',
                  cancelText: 'नहीं',
                  onConfirm: () => {
                    resetEntireForm();
                    showToast('नया बिल काउंटर तैयार है!', 'info');
                  }
                })}
                onFarmerNameChange={(value) => handleHinglishChange(value, setFarmerName, appLang)}
                onFatherNameChange={(value) => handleHinglishChange(value, setFatherName, appLang)}
                onVillageChange={(value) => handleHinglishChange(value, setVillage, appLang)}
                onPhoneChange={handlePhoneChange}
                onClearCart={() => setCart([])}
                onUpdateCartQty={updateCartQty}
                onUpdateCartPrice={updateCartPrice}
                onDiscountChange={handleDiscountChange}
                onPaidAmountChange={handlePaidAmountChange}
                onFinalizeBill={finalizeBill}
              />
            )}

            {currentTab === 'stages' && <CropGuideScreen />}
          </ScrollView>
        )}

        <BottomNavigation currentTab={currentTab} setCurrentTab={setCurrentTab} t={t} />

        <ProductEditorModal
          visible={productModalVisible}
          editingProductId={editingProductId}
          form={prodForm}
          onChangeField={(field, value) => setProdForm((previous) => ({ ...previous, [field]: value }))}
          onBrandNameChange={(text) => handleHinglishChange(
            text,
            (value) => setProdForm((previous) => ({ ...previous, brandName: value })),
            appLang
          )}
          onClose={() => setProductModalVisible(false)}
          onSave={handleSaveProduct}
        />

        <SafeUpdateNotificationModal
          visible={updateModalVisible}
          updateInfo={updateInfo}
          onClose={() => setUpdateModalVisible(false)}
        />

        <BulkProductsModal
          visible={bulkAddModalVisible}
          value={bulkProductsText}
          onChange={setBulkProductsText}
          onCancel={() => setBulkAddModalVisible(false)}
          onSubmit={handleBulkAddSubmit}
        />

        <InvoicePreviewModal
          bill={activeInvoice}
          t={t}
          onClose={() => setActiveInvoice(null)}
          onPrint={printOrDownloadPDF}
          onWhatsApp={sendWhatsApp}
          onNewBill={() => {
            setActiveInvoice(null);
            resetEntireForm();
          }}
        />

        <BillNumberModal
          visible={editBillNoModal}
          value={customBillInput}
          onChange={setCustomBillInput}
          onCancel={() => setEditBillNoModal(false)}
          onSave={() => {
            const value = parseInt(customBillInput, 10);
            if (!isNaN(value) && value > 0) {
              setNextBillNumber(value);
              setEditBillNoModal(false);
              showToast(`बिल नंबर #${value} सेट हुआ!`, 'success');
            }
          }}
        />

        <ConfirmationDialog dialog={dialog} onClose={closeDialog} />

        {toast.visible && (
          <Animated.View style={[
            styles.toastContainer,
            toast.type === 'error' ? styles.toastError : toast.type === 'info' ? styles.toastInfo : styles.toastSuccess,
            { opacity: toastFadeAnim, transform: [{ translateY: toastFadeAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }
          ]}>
            <Text style={styles.toastIconText}>
              {toast.type === 'error' ? '❌' : toast.type === 'info' ? 'ℹ️' : '✅'}
            </Text>
            <Text style={styles.toastMsgText}>{toast.message}</Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}