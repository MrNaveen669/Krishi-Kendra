import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CEMENT_LOW_STOCK_THRESHOLD } from '../config/constants';

const ProductSearchResultsList = memo(function ProductSearchResultsList({
  data,
  searchResults,
  onAddToCart,
  onAddProduct,
  styles = {},
  paymentMode = 'cash',
  t = {}
}) {
  const itemsList = data || searchResults || [];
  const handleSelect = onAddToCart || onAddProduct;

  if (!itemsList || itemsList.length === 0) {
    return (
      <View style={{ padding: 12, alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, marginTop: 4 }}>
        <Text style={{ fontSize: 12, color: '#64748b' }}>कोई दवाई या सीमेंट नहीं मिला</Text>
      </View>
    );
  }

  return (
    <View
      style={
        styles?.dropdown || {
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#cbd5e1',
          borderRadius: 10,
          marginTop: 4,
          overflow: 'hidden'
        }
      }
    >
      <View style={styles?.productSearchListContent || { paddingVertical: 4, paddingHorizontal: 2 }}>
        {itemsList.map((item, index) => {
          const isCement = item.category === 'सीमेंट';
          const isZeroStock = typeof item.stock === 'number' && item.stock <= 0;
          const isLowStock = isCement
            ? typeof item.stock === 'number' && item.stock <= CEMENT_LOW_STOCK_THRESHOLD
            : typeof item.stock === 'number' && item.stock <= 5;

          const price =
            paymentMode === 'cash' || paymentMode === 'upi'
              ? item.cashPrice !== undefined
                ? item.cashPrice
                : item.sellingPrice || 0
              : item.creditPrice !== undefined
              ? item.creditPrice
              : item.sellingPrice || 0;

          return (
            <Pressable
              key={`${item.id || item.name || item.brandName}-${index}`}
              style={[
                styles?.cleanDropdownItem || {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f1f5f9'
                },
                isZeroStock && { backgroundColor: '#fef2f2' }
              ]}
              onPress={() => handleSelect && handleSelect(item)}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles?.dropTitle || { fontSize: 13, fontWeight: '700', color: '#0f172a' }}>
                    {isCement
                      ? `${item.brandName} (${item.grade || ''} · ${item.pack || '50kg'})`
                      : `${item.brandName} (${item.pack || ''})`}
                  </Text>
                  <View
                    style={[
                      styles?.stockPill || { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 },
                      isZeroStock
                        ? styles?.stockPillRed || { backgroundColor: '#fee2e2' }
                        : isLowStock
                        ? styles?.stockPillYellow || { backgroundColor: '#fef3c7' }
                        : styles?.stockPillGreen || { backgroundColor: '#dcfce7' }
                    ]}
                  >
                    <Text
                      style={[
                        styles?.stockPillText || { fontSize: 10, fontWeight: '700' },
                        isZeroStock
                          ? styles?.stockTextRed || { color: '#991b1b' }
                          : isLowStock
                          ? styles?.stockTextYellow || { color: '#92400e' }
                          : styles?.stockTextGreen || { color: '#166534' }
                      ]}
                    >
                      {isZeroStock
                        ? isCement
                          ? t?.cementOutOfStock || 'स्टॉक 0'
                          : 'स्टॉक 0'
                        : isCement
                        ? t?.cementBagStockCount
                          ? t.cementBagStockCount.replace('{count}', item.stock)
                          : `स्टॉक: ${item.stock} बोरी`
                        : `स्टॉक: ${item.stock}`}
                    </Text>
                  </View>
                </View>
                <Text style={styles?.dropSub || { fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {isCement
                    ? `${item.company || ''} | ${item.grade || ''} | ${t?.cementBagUnit || 'बोरी'}`
                    : `${item.technical || ''} | बैच: ${item.batch || 'NEW'} | एक्सपायरी: ${item.expiry || '-'}`}
                </Text>
              </View>
              <Text
                style={[
                  styles?.dropPrice || { fontSize: 13, fontWeight: '700', color: '#166534' },
                  isZeroStock && { color: '#991b1b', backgroundColor: '#fee2e2' }
                ]}
              >
                + ₹{price}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

export default ProductSearchResultsList;