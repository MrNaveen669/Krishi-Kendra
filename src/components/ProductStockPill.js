import React from 'react';
import { View, Text } from 'react-native';

import styles from '../styles';

export default function ProductStockPill({ isOutOfStock, isLowStock, stock, label }) {
  const stockText = isOutOfStock ? 'स्टॉक खत्म' : `स्टॉक: ${stock}`;

  return (
    <View
      style={[
        styles.stockPill,
        isOutOfStock ? styles.stockPillRed : isLowStock ? styles.stockPillYellow : styles.stockPillGreen
      ]}
    >
      <Text
        style={[
          styles.stockPillText,
          isOutOfStock ? styles.stockTextRed : isLowStock ? styles.stockTextYellow : styles.stockTextGreen
        ]}
      >
        {label || stockText}
      </Text>
    </View>
  );
}
