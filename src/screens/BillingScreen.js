import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import styles from '../styles';
import ProductSearchResultsList from '../components/ProductSearchResultsList';

const BillingScreen = React.memo(function BillingScreen({
  t,
  editingBillId,
  nextBillNumber,
  paymentMode,
  billingSearch,
  searchResults,
  farmerName,
  fatherName,
  village,
  phone,
  cart,
  subtotal,
  discount,
  grandTotal,
  paidAmount,
  balanceDue,
  onReset,
  onTogglePaymentMode,
  onSearchChange,
  onAddSearchProduct,
  onOpenBillNumber,
  onRequestNewBill,
  onFarmerNameChange,
  onFatherNameChange,
  onVillageChange,
  onPhoneChange,
  onClearCart,
  onUpdateCartQty,
  onUpdateCartPrice,
  onDiscountChange,
  onPaidAmountChange,
  onFinalizeBill
}) {
  return (
    <View style={styles.tabSection}>
      {editingBillId && (
        <View style={styles.editModeBanner}>
          <Text style={styles.editModeText}>
            ⚠️ आप बिल #{nextBillNumber} को एडिट/अपडेट कर रहे हैं
          </Text>
          <TouchableOpacity style={styles.cancelEditBtn} onPress={onReset}>
            <Text style={styles.cancelEditText}>रद्द करें</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3-MODE SEGMENTED PAYMENT SWITCH */}
      <View style={{ flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 4, borderRadius: 12, gap: 4 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 9,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: paymentMode === 'cash' ? '#166534' : 'transparent'
          }}
          onPress={() => onTogglePaymentMode('cash')}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: paymentMode === 'cash' ? '#fff' : '#475569' }}>
            💵 नकद (Cash)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 9,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: paymentMode === 'upi' ? '#2563eb' : 'transparent'
          }}
          onPress={() => onTogglePaymentMode('upi')}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: paymentMode === 'upi' ? '#fff' : '#475569' }}>
            📱 UPI / PhonePe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 9,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: paymentMode === 'credit' ? '#b91c1c' : 'transparent'
          }}
          onPress={() => onTogglePaymentMode('credit')}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: paymentMode === 'credit' ? '#fff' : '#475569' }}>
            📋 उधार (Credit)
          </Text>
        </TouchableOpacity>
      </View>

      {/* PRODUCT SEARCH */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t.searchAndAdd}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t.searchPlaceholder}
          placeholderTextColor="#94a3b8"
          value={billingSearch}
          onChangeText={onSearchChange}
        />
        <ProductSearchResultsList
          searchResults={searchResults}
          t={t}
          onAddProduct={onAddSearchProduct}
        />
      </View>

      {/* FARMER DETAILS */}
      <View style={styles.card}>
        <View style={styles.customerHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity onPress={onOpenBillNumber} style={styles.billBadge}>
              <Text style={styles.billBadgeText}>बिल #{nextBillNumber} ✎</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpenBillNumber}>
              <Text style={styles.editLink}>[बदलें]</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onRequestNewBill} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>🔄 नया ग्राहक</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.transliterateHint}>
          {t.transliterateHint}
        </Text>

        <View style={{ gap: 8 }}>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1.2 }]}
              placeholder="किसान का नाम *"
              placeholderTextColor="#94a3b8"
              value={farmerName}
              onChangeText={onFarmerNameChange}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="पिता का नाम"
              placeholderTextColor="#94a3b8"
              value={fatherName}
              onChangeText={onFatherNameChange}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="गाँव *"
              placeholderTextColor="#94a3b8"
              value={village}
              onChangeText={onVillageChange}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="मोबाइल नंबर"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              maxLength={10}
              value={phone}
              onChangeText={onPhoneChange}
            />
          </View>
        </View>
      </View>

      {/* CART & CALCULATION */}
      <View style={styles.card}>
        <View style={styles.cartHeader}>
          <Text style={styles.cardLabel}>{t.cart} ({cart.length})</Text>
          {cart.length > 0 && (
            <TouchableOpacity onPress={onClearCart}>
              <Text style={styles.clearCartText}>हटाएं</Text>
            </TouchableOpacity>
          )}
        </View>

        {cart.length === 0 ? (
          <Text style={styles.emptyCartText}>{t.emptyCart}</Text>
        ) : (
          <View style={{ marginVertical: 6 }}>
            {cart.map((item, idx) => (
              <View key={`${item.id}-${idx}`} style={styles.cartRow}>
                <View style={{ flex: 1.8 }}>
                  <Text style={styles.cartItemTitle}>
                    {item.brandName}{item.grade ? ` (${item.grade})` : ''}
                  </Text>
                  <Text style={styles.cartItemSub}>
                    {item.category === 'सीमेंट' ? `${item.pack || ''} bag` : item.pack} | दर: ₹{item.sellingPrice}
                  </Text>
                </View>
                <View style={styles.stepper}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => onUpdateCartQty(idx, -1)}>
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepQty}>{item.qty}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => onUpdateCartQty(idx, 1)}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.rateInput}
                  keyboardType="numeric"
                  value={String(item.sellingPrice)}
                  onChangeText={(val) => onUpdateCartPrice(idx, val)}
                />
                <Text style={styles.lineTotal}>₹{(item.qty * item.sellingPrice).toFixed(0)}</Text>
                <TouchableOpacity onPress={() => onUpdateCartQty(idx, -item.qty)}>
                  <Text style={styles.delBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ gap: 4, marginTop: 8, borderTopWidth: 1, borderColor: '#f1f5f9', paddingTop: 8 }}>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>{t.subtotal}:</Text>
            <Text style={styles.calcVal}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>{t.discount} (₹):</Text>
            <TextInput
              style={styles.discInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94a3b8"
              value={discount}
              onChangeText={onDiscountChange}
            />
          </View>
          <View style={[styles.calcRow, styles.totalDivider]}>
            <Text style={styles.grandLabel}>{t.grandTotal}:</Text>
            <Text style={styles.grandVal}>₹{grandTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>
              {paymentMode === 'upi' ? '📱 UPI जमा (₹):' : paymentMode === 'cash' ? '💵 नकद जमा (₹):' : 'जमा राशि (₹):'}
            </Text>
            {(paymentMode === 'cash' || paymentMode === 'upi') && !paidAmount ? (
              <View style={styles.cashPaidBadge}>
                <Text style={styles.cashPaidText}>
                  {paymentMode === 'upi' ? '📱 ₹' : '💵 ₹'}{grandTotal.toFixed(0)} (पूर्ण प्राप्त)
                </Text>
              </View>
            ) : (
              <TextInput
                style={styles.paidInput}
                keyboardType="numeric"
                placeholder={String(grandTotal)}
                placeholderTextColor="#86efac"
                value={paidAmount}
                onChangeText={onPaidAmountChange}
              />
            )}
          </View>

          {balanceDue > 0 && (
            <View style={styles.calcRow}>
              <Text style={styles.dueLabel}>{t.balanceDue}:</Text>
              <Text style={styles.dueVal}>₹{balanceDue.toFixed(2)}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={onFinalizeBill}>
            <Text style={styles.submitBtnText}>
              {editingBillId ? '💾 बिल अपडेट करें' : `✅ बिल बनाएं (₹${grandTotal.toFixed(0)})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default BillingScreen;