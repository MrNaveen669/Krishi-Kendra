import { useMemo } from 'react';

export default function useAppDerivedState({
  products,
  billingProducts = products,
  billingSearch,
  advisorySearch,
  selectedCategory,
  selectedSymptom,
  showLowStockOnly,
  historySearch,
  billsHistory,
  cart,
  discount,
  paymentMode,
  paidAmount
}) {
  const dynamicSymptomsList = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (Array.isArray(p.symptoms)) {
        p.symptoms.forEach((s) => {
          if (s && s.trim()) set.add(s.trim());
        });
      }
    });
    return Array.from(set);
  }, [products]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.qty * (parseFloat(item.sellingPrice) || 0)), 0);
  }, [cart]);

  const grandTotal = useMemo(() => {
    const rawDisc = parseFloat(discount) || 0;
    const effectiveDiscount = subtotal > 0 ? Math.min(subtotal, Math.max(0, rawDisc)) : 0;
    return Math.max(0, subtotal - effectiveDiscount);
  }, [subtotal, discount]);

  // CASH aur UPI dono me by default full payment select hota hai, credit me paidAmount check hota hai
  const effectivePaid = useMemo(() => {
    if (paymentMode === 'cash' || paymentMode === 'upi') {
      return paidAmount ? Math.min(grandTotal, Math.max(0, parseFloat(paidAmount) || 0)) : grandTotal;
    }
    const rawPaid = parseFloat(paidAmount) || 0;
    return Math.min(grandTotal, Math.max(0, rawPaid));
  }, [paidAmount, paymentMode, grandTotal]);

  const balanceDue = useMemo(() => {
    return Math.max(0, grandTotal - effectivePaid);
  }, [grandTotal, effectivePaid]);

  const searchResults = useMemo(() => {
    const q = (billingSearch || '').trim().toLowerCase();
    if (!q) return [];
    return billingProducts
      .filter(
        (p) =>
          (p.brandName || '').toLowerCase().includes(q) ||
          (p.grade || '').toLowerCase().includes(q) ||
          (p.pack || '').toLowerCase().includes(q) ||
          (p.technical || '').toLowerCase().includes(q) ||
          (Array.isArray(p.keywords) && p.keywords.some((keyword) => keyword.toLowerCase().includes(q)))
      )
      .slice(0, 5);
  }, [billingSearch, billingProducts]);

  const filteredAdvisoryProducts = useMemo(() => {
    const q = (advisorySearch || '').trim().toLowerCase();
    return products.filter((p) => {
      if (p.category === 'सीमेंट') return false;
      const searchableText = [
        p.brandName,
        p.technical,
        p.crop,
        ...(p.keywords || []),
        ...(p.symptoms || [])
      ].filter(Boolean).join(' ').toLowerCase();

      const matchQ = !q || searchableText.includes(q);
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSymptom = selectedSymptom === 'all' || (p.symptoms && p.symptoms.includes(selectedSymptom));
      const matchLowStock = !showLowStockOnly || (typeof p.stock === 'number' && p.stock <= 5);

      return matchQ && matchCat && matchSymptom && matchLowStock;
    });
  }, [advisorySearch, selectedCategory, selectedSymptom, showLowStockOnly, products]);

  // History Search: Name, Village, Bill No, Phone, Items aur Payment Mode se search
  const filteredBillsHistory = useMemo(() => {
    const q = (historySearch || '').trim().toLowerCase();
    if (!q) return billsHistory;
    return billsHistory.filter((b) => {
      const name = (b.customerName || '').toLowerCase();
      const villageName = (b.customerVillage || '').toLowerCase();
      const billNo = String(b.billNumber || '').toLowerCase();
      const phoneNum = String(b.customerPhone || '').toLowerCase();
      const dateStr = String(b.date || '').toLowerCase();
      const payDate = String(b.lastPaymentDate || '').toLowerCase();
      const mode = String(b.paymentMode || '').toLowerCase();

      const itemsMatch = Array.isArray(b.items) && b.items.some((it) => {
        return (it.brandName || '').toLowerCase().includes(q) || (it.grade || '').toLowerCase().includes(q);
      });

      return (
        name.includes(q) ||
        villageName.includes(q) ||
        billNo.includes(q) ||
        phoneNum.includes(q) ||
        dateStr.includes(q) ||
        payDate.includes(q) ||
        mode.includes(q) ||
        itemsMatch
      );
    });
  }, [historySearch, billsHistory]);

  // Daily Dashboard: Cash, UPI aur Due teeno ka alag-alag exact calculation
  const dailySummary = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const todayFormatted = `${day}/${month}/${year}`;
    const todayHindi = now.toLocaleDateString('hi-IN');

    const todayBills = (billsHistory || []).filter((b) => {
      const billDate = String(b.date || '');
      return billDate.includes(todayFormatted) || billDate.includes(todayHindi);
    });

    let totalSales = 0;
    let totalCash = 0;
    let totalUpi = 0;
    let totalDue = 0;

    todayBills.forEach((b) => {
      const gTot = Number(b.grandTotal || 0);
      const paid = Number(b.paidAmount || 0);
      const due = Number(b.balanceDue || 0);

      totalSales += gTot;
      totalDue += due;

      if (b.paymentMode === 'upi') {
        totalUpi += paid;
      } else {
        totalCash += paid;
      }
    });

    return {
      count: todayBills.length,
      totalSales,
      totalCash,
      totalUpi,
      totalDue
    };
  }, [billsHistory]);

  return {
    dynamicSymptomsList,
    subtotal,
    grandTotal,
    effectivePaid,
    balanceDue,
    searchResults,
    filteredAdvisoryProducts,
    filteredBillsHistory,
    dailySummary
  };
}