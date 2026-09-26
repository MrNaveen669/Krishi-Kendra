import React from 'react';
import { Text, View } from 'react-native';

import { CROP_STAGES } from '../config/cropStages';
import styles from '../styles';

const CropGuideScreen = React.memo(function CropGuideScreen() {
  return (
    <View style={styles.tabSection}>
      <View style={styles.tankMixBox}>
        <Text style={styles.tankMixTitle}>🧪 अनिवार्य टैंक मिक्स घोल क्रम</Text>
        <Text style={styles.tankMixText}>
          WDG/WP (पाउडर) ➔ SC/F (सस्पेंशन) ➔ EC (इमल्शन) ➔ SL (तरल) ➔ स्प्रेडर
        </Text>
      </View>

      {CROP_STAGES.map((stage, index) => (
        <View key={stage.stageName} style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={styles.stageBadge}>
              <Text style={styles.stageBadgeText}>{stage.badge}</Text>
            </View>
            <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: 'bold' }}>#{index + 1}</Text>
          </View>
          <Text style={styles.stageHeading}>{stage.stageName}</Text>
          <Text style={styles.stageObs}>{stage.observation}</Text>
          <View style={styles.pestBadge}>
            <Text style={styles.pestBadgeText}>⚠️ {stage.targetPest}</Text>
          </View>
          <Text style={styles.recomText}>💡 {stage.recommendedTech}</Text>
        </View>
      ))}
    </View>
  );
});

export default CropGuideScreen;