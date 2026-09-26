import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles from '../styles';

export default React.memo(function BottomNavigation({ currentTab, setCurrentTab, t }) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('billing')}>
        <Text style={[styles.navIcon, currentTab === 'billing' && styles.navTextActive]}>🧾</Text>
        <Text style={[styles.navText, currentTab === 'billing' && styles.navTextActive]}>{t.billingTab}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('search')}>
        <Text style={[styles.navIcon, currentTab === 'search' && styles.navTextActive]}>🩺</Text>
        <Text style={[styles.navText, currentTab === 'search' && styles.navTextActive]}>{t.searchTab}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('cement')}>
        <Text style={[styles.navIcon, currentTab === 'cement' && styles.navTextActive]}>🏗️</Text>
        <Text style={[styles.navText, currentTab === 'cement' && styles.navTextActive]}>{t.cementTab}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('stages')}>
        <Text style={[styles.navIcon, currentTab === 'stages' && styles.navTextActive]}>🌾</Text>
        <Text style={[styles.navText, currentTab === 'stages' && styles.navTextActive]}>{t.stagesTab}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('history')}>
        <Text style={[styles.navIcon, currentTab === 'history' && styles.navTextActive]}>📜</Text>
        <Text style={[styles.navText, currentTab === 'history' && styles.navTextActive]}>{t.historyTab}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
});
