import React, { memo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { CEMENT_LOW_STOCK_THRESHOLD } from '../config/constants';

const ProductSearchResultsList = memo(function ProductSearchResultsList({ data, onAddToCart, styles, paymentMode, t }) {
  const renderItem = ({ item }) => {
    const isCement = item.category === 'सीमेंट';
    const isZeroStock = typeof item.stock === 'number' && item.stock <= 0;
    const isLowStock = isCement
      ? item.stock <= CEMENT_LOW_STOCK_THRESHOLD
      : item.stock <= 5;
    const price = paymentMode === 'cash' ? item.cashPrice : item.creditPrice;

    return (
      <Pressable
        key={item.id || item.name}
        style={[styles.cleanDropdownItem, isZeroStock && { backgroundColor: '#fef2f2' }]}
        onPress={() => onAddToCart(item)}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.dropTitle}>
              {isCement ? `${item.brandName} (${item.grade} · ${item.pack})` : `${item.brandName} (${item.pack})`}
            </Text>
            <View
              style={[
                styles.stockPill,
                isZeroStock ? styles.stockPillRed : isLowStock ? styles.stockPillYellow : styles.stockPillGreen
              ]}
            >
              <Text
                style={[
                  styles.stockPillText,
                  isZeroStock ? styles.stockTextRed : isLowStock ? styles.stockTextYellow : styles.stockTextGreen
                ]}
              >
                {isZeroStock ? (isCement ? t.cementOutOfStock : 'स्टॉक 0') : isCement ? t.cementBagStockCount.replace('{count}', item.stock) : `स्टॉक: ${item.stock}`}
              </Text>
            </View>
          </View>
          <Text style={styles.dropSub}>
            {isCement ? `${item.company} | ${item.grade} | ${t.cementBagUnit}` : `${item.technical} | बैच: ${item.batch} | एक्सपायरी: ${item.expiry}`}
          </Text>
        </View>
        <Text style={[styles.dropPrice, isZeroStock && { color: '#991b1b', backgroundColor: '#fee2e2' }]}>+ ₹{price}</Text>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => `${item.id || item.name}-${item.category || 'all'}`}
      renderItem={renderItem}
      contentContainerStyle={styles.productSearchListContent}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <View style={styles.emptyStateBox}>
          <Text style={styles.emptyStateText}>No matching products</Text>
        </View>
      }
      scrollEnabled={false}
    />
  );
});

export default ProductSearchResultsList;
