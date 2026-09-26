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
    <View style={[styles.tabSection, { paddingHorizontal: 10, paddingVertical: 4 }]}>
      {editingBillId && (
        <View style={[styles.editModeBanner, { marginBottom: 6, paddingVertical: 6 }]}>
          <Text style={styles.editModeText}>
            ⚠️ आप बिल #{nextBillNumber} को एडिट कर रहे हैं
          </Text>
          <TouchableOpacity style={styles.cancelEditBtn} onPress={onReset}>
            <Text style={styles.cancelEditText}>रद्द करें</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3-MODE PAYMENT SELECTOR (COMPACT) */}
      <View style={{ flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 3, borderRadius: 10, gap: 4, marginBottom: 6 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 7,
            borderRadius: 7,
            alignItems: 'center',
            backgroundColor: paymentMode === 'cash' ? '#166534' : 'transparent'
          }}
          onPress={() => onTogglePaymentMode('cash')}
        >
          <Text style={{ fontSize: 11.5, fontWeight: '800', color: paymentMode === 'cash' ? '#fff' : '#475569' }}>
            💵 नकद (Cash)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 7,
            borderRadius: 7,
            alignItems: 'center',
            backgroundColor: paymentMode === 'upi' ? '#2563eb' : 'transparent'
          }}
          onPress={() => onTogglePaymentMode('upi')}
        >
          <Text style={{ fontSize: 11.5, fontWeight: '800', color: paymentMode === 'upi' ? '#fff' : '#475569' }}>
            📱 UPI / PhonePe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 7,
            borderRadius: 7,
            alignItems: 'center',
            backgroundColor: paymentMode === 'credit' ? '#b91c1c' : 'transparent'
          }}
          onPress={() => onTogglePaymentMode('credit')}
        >
          <Text style={{ fontSize: 11.5, fontWeight: '800', color: paymentMode === 'credit' ? '#fff' : '#475569' }}>
            📋 उधार (Credit)
          </Text>
        </TouchableOpacity>
      </View>

      {/* COMPACT PRODUCT SEARCH */}
      <View style={[styles.card, { padding: 8, marginBottom: 6 }]}>
        <TextInput
          style={[styles.searchInput, { height: 42, paddingHorizontal: 12, fontSize: 13 }]}
          placeholder={t?.searchPlaceholder || '🔍 दवाई या सीमेंट का नाम लिखें...'}
          placeholderTextColor="#94a3b8"
          value={billingSearch}
          onChangeText={onSearchChange}
        />
        {Boolean(billingSearch && billingSearch.trim().length > 0) && (
          <ProductSearchResultsList
            data={searchResults}
            searchResults={searchResults}
            onAddToCart={onAddSearchProduct}
            onAddProduct={onAddSearchProduct}
            styles={styles}
            paymentMode={paymentMode}
            t={t}
          />
        )}
      </View>

      {/* COMPACT FARMER DETAILS */}
      <View style={[styles.card, { padding: 8, marginBottom: 6 }]}>
        <View style={[styles.customerHeader, { marginBottom: 6 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity onPress={onOpenBillNumber} style={[styles.billBadge, { paddingHorizontal: 8, paddingVertical: 3 }]}>
              <Text style={styles.billBadgeText}>बिल #{nextBillNumber} ✎</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpenBillNumber}>
              <Text style={styles.editLink}>[बदलें]</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onRequestNewBill} style={[styles.resetBtn, { paddingHorizontal: 8, paddingVertical: 4 }]}>
            <Text style={styles.resetBtnText}>🔄 नया ग्राहक</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 6 }}>
          <View style={[styles.row, { gap: 6 }]}>
            <TextInput
              style={[styles.input, { flex: 1.2, height: 38, paddingHorizontal: 10, fontSize: 12.5 }]}
              placeholder="किसान का नाम *"
              placeholderTextColor="#94a3b8"
              value={farmerName}
              onChangeText={onFarmerNameChange}
            />
            <TextInput
              style={[styles.input, { flex: 1, height: 38, paddingHorizontal: 10, fontSize: 12.5 }]}
              placeholder="पिता का नाम"
              placeholderTextColor="#94a3b8"
              value={fatherName}
              onChangeText={onFatherNameChange}
            />
          </View>
          <View style={[styles.row, { gap: 6 }]}>
            <TextInput
              style={[styles.input, { flex: 1, height: 38, paddingHorizontal: 10, fontSize: 12.5 }]}
              placeholder="गाँव *"
              placeholderTextColor="#94a3b8"
              value={village}
              onChangeText={onVillageChange}
            />
            <TextInput
              style={[styles.input, { flex: 1, height: 38, paddingHorizontal: 10, fontSize: 12.5 }]}
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

      {/* COMPACT CART & SUMMARY */}
      <View style={[styles.card, { padding: 8, marginBottom: 6 }]}>
        <View style={[styles.cartHeader, { marginBottom: 4 }]}>
          <Text style={[styles.cardLabel, { fontSize: 13, marginBottom: 0 }]}>
            दवाई सूची ({cart.length})
          </Text>
          {cart.length > 0 && (
            <TouchableOpacity onPress={onClearCart}>
              <Text style={[styles.clearCartText, { fontSize: 12 }]}>हटाएं</Text>
            </TouchableOpacity>
          )}
        </View>

        {cart.length === 0 ? (
          <Text style={[styles.emptyCartText, { paddingVertical: 6, fontSize: 12 }]}>
            {t?.emptyCart || 'कोई दवाई या सामान नहीं जोड़ा गया'}
          </Text>
        ) : (
          <View style={{ marginVertical: 2 }}>
            {cart.map((item, idx) => (
              <View key={`${item.id}-${idx}`} style={[styles.cartRow, { paddingVertical: 4, borderBottomWidth: 0.8 }]}>
                <View style={{ flex: 1.8 }}>
                  <Text style={[styles.cartItemTitle, { fontSize: 12 }]}>
                    {item.brandName}{item.grade ? ` (${item.grade})` : ''}
                  </Text>
                  <Text style={[styles.cartItemSub, { fontSize: 10 }]}>
                    {item.category === 'सीमेंट' ? `${item.pack || ''} bag` : item.pack} | दर: ₹{item.sellingPrice}
                  </Text>
                </View>

                <View style={[styles.stepper, { height: 28 }]}>
                  <TouchableOpacity style={[styles.stepBtn, { width: 24 }]} onPress={() => onUpdateCartQty(idx, -1)}>
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.stepQty, { minWidth: 20, fontSize: 12 }]}>{item.qty}</Text>
                  <TouchableOpacity style={[styles.stepBtn, { width: 24 }]} onPress={() => onUpdateCartQty(idx, 1)}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.rateInput, { height: 28, width: 62, fontSize: 12, paddingHorizontal: 4 }]}
                  keyboardType="numeric"
                  value={String(item.sellingPrice)}
                  onChangeText={(val) => onUpdateCartPrice(idx, val)}
                />

                <Text style={[styles.lineTotal, { fontSize: 12, minWidth: 54 }]}>
                  ₹{(item.qty * item.sellingPrice).toFixed(0)}
                </Text>

                <TouchableOpacity onPress={() => onUpdateCartQty(idx, -item.qty)} style={{ padding: 2 }}>
                  <Text style={[styles.delBtn, { fontSize: 13 }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* TIGHT TOTALS BREAKDOWN */}
        <View style={{ gap: 3, marginTop: 4, borderTopWidth: 1, borderColor: '#f1f5f9', paddingTop: 4 }}>
          <View style={[styles.calcRow, { paddingVertical: 2 }]}>
            <Text style={[styles.calcLabel, { fontSize: 12 }]}>उप-योग (Subtotal):</Text>
            <Text style={[styles.calcVal, { fontSize: 13 }]}>₹{subtotal.toFixed(2)}</Text>
          </View>

          <View style={[styles.calcRow, { paddingVertical: 2 }]}>
            <Text style={[styles.calcLabel, { fontSize: 12 }]}>छूट (Discount ₹):</Text>
            <TextInput
              style={[styles.discInput, { height: 28, paddingVertical: 2, paddingHorizontal: 6, fontSize: 12 }]}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94a3b8"
              value={discount}
              onChangeText={onDiscountChange}
            />
          </View>

          <View style={[styles.calcRow, styles.totalDivider, { paddingVertical: 3, marginTop: 2 }]}>
            <Text style={[styles.grandLabel, { fontSize: 13.5 }]}>कुल रकम (Grand Total):</Text>
            <Text style={[styles.grandVal, { fontSize: 15 }]}>₹{grandTotal.toFixed(2)}</Text>
          </View>

          <View style={[styles.calcRow, { paddingVertical: 2 }]}>
            <Text style={[styles.calcLabel, { fontSize: 12 }]}>
              {paymentMode === 'upi' ? '📱 UPI जमा (₹):' : paymentMode === 'cash' ? '💵 नकद जमा (₹):' : 'जमा राशि (₹):'}
            </Text>
            {(paymentMode === 'cash' || paymentMode === 'upi') && !paidAmount ? (
              <View style={[styles.cashPaidBadge, { paddingVertical: 3, paddingHorizontal: 8 }]}>
                <Text style={[styles.cashPaidText, { fontSize: 11 }]}>
                  {paymentMode === 'upi' ? '📱 ₹' : '💵 ₹'}{grandTotal.toFixed(0)} (पूर्ण प्राप्त)
                </Text>
              </View>
            ) : (
              <TextInput
                style={[styles.paidInput, { height: 28, paddingVertical: 2, paddingHorizontal: 6, fontSize: 12 }]}
                keyboardType="numeric"
                placeholder={String(grandTotal)}
                placeholderTextColor="#86efac"
                value={paidAmount}
                onChangeText={onPaidAmountChange}
              />
            )}
          </View>

          {balanceDue > 0 && (
            <View style={[styles.calcRow, { paddingVertical: 2 }]}>
              <Text style={[styles.dueLabel, { fontSize: 12 }]}>बाकी उधारी (Due):</Text>
              <Text style={[styles.dueVal, { fontSize: 13.5 }]}>₹{balanceDue.toFixed(2)}</Text>
            </View>
          )}

          <TouchableOpacity style={[styles.submitBtn, { marginTop: 6, paddingVertical: 10 }]} onPress={onFinalizeBill}>
            <Text style={[styles.submitBtnText, { fontSize: 13.5 }]}>
              {editingBillId ? '💾 बिल अपडेट करें' : `✅ बिल बनाएं (₹${grandTotal.toFixed(0)})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default BillingScreen;