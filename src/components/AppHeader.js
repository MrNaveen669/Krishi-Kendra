import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import styles from '../styles';

function AppHeader({
  appLang,
  setAppLang,
  showToast,
  isSyncing,
  t,
  hasUpdate = false,
  onOpenNotification
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.shopInfo}>
          <Text style={styles.shopIcon}>🌱</Text>
          <View>
            <Text style={styles.shopName}>{t.shopName}</Text>
            <Text style={styles.shopSub}>{t.shopSub}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Notification Bell Icon */}
          <TouchableOpacity
            style={{
              position: 'relative',
              backgroundColor: '#166534',
              paddingHorizontal: 8,
              paddingVertical: 5,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#22c55e'
            }}
            onPress={onOpenNotification}
          >
            <Text style={{ fontSize: 14 }}>🔔</Text>
            {hasUpdate && (
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 9,
                  height: 9,
                  borderRadius: 4.5,
                  backgroundColor: '#ef4444',
                  borderWidth: 1.5,
                  borderColor: '#fff'
                }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.langToggleBtn}
            onPress={() => {
              const nextLang = appLang === 'hi' ? 'en' : 'hi';
              setAppLang(nextLang);
              showToast(nextLang === 'hi' ? '🇮🇳 हिंदी भाषा सक्रिय' : '🇬🇧 English Selected', 'info');
            }}
          >
            <Text style={styles.langToggleText}>
              {appLang === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 Eng'}
            </Text>
          </TouchableOpacity>

          {isSyncing && <ActivityIndicator size="small" color="#86efac" />}

          <View style={styles.gstBadge}>
            <Text style={styles.gstText}>GST: 22FTUPS0621B1ZU</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default React.memo(AppHeader);