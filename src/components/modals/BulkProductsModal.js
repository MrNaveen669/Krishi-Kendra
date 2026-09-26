import React from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

import styles from '../../styles';

const BulkProductsModal = React.memo(function BulkProductsModal({ visible, value, onChange, onCancel, onSubmit }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#0f172a' }}>📦 बल्क में दवाइयाँ जोड़ें</Text>
              <Text style={{ fontSize: 10, color: '#64748b' }}>एक साथ कई दवाइयाँ पेस्ट या टाइप करें</Text>
            </View>
            <TouchableOpacity onPress={onCancel}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#64748b' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bulkHelperBox}>
            <Text style={styles.bulkHelperTitle}>📝 लिखने का प्रारूप (प्रत्येक लाइन में एक दवा):</Text>
            <Text style={styles.bulkHelperText}>नाम, फॉर्मूला, कंपनी, पैक, नकद, उधार, एकड़ डोज़, बैच, एक्सपायरी, स्टॉक, 200L ड्रम डोज़</Text>
          </View>

          <TextInput
            style={styles.bulkTextArea}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            placeholder={`कोराजन, Chlorantraniliprole, FMC, 60ml, 850, 900, 60ml, CRG01, 08/28, 25, 60-80ml\nचेस, Pymetrozine, Syngenta, 120g, 630, 670, 120g, CHS09, 06/28, 15, 120g`}
            placeholderTextColor="#94a3b8"
            value={value}
            onChangeText={onChange}
          />

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TouchableOpacity style={[styles.historyBtn, { backgroundColor: '#f1f5f9' }]} onPress={onCancel}>
              <Text style={{ color: '#475569', fontWeight: 'bold' }}>रद्द</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.historyBtn, { backgroundColor: '#166534', flex: 2 }]} onPress={onSubmit}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>📥 सभी दवाइयाँ जोड़ें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default BulkProductsModal;