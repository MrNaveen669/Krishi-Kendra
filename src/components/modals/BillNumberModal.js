import React from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

import styles from '../../styles';

const BillNumberModal = React.memo(function BillNumberModal({ visible, value, onChange, onCancel, onSave }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { maxWidth: 300 }]}>
          <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#0f172a', marginBottom: 6 }}>
            अगला बिल नंबर सेट करें
          </Text>
          <TextInput
            style={styles.billNumberInput}
            keyboardType="numeric"
            autoComplete="off"
            importantForAutofill="no"
            textContentType="none"
            value={value}
            onChangeText={onChange}
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity style={[styles.historyBtn, { backgroundColor: '#f1f5f9' }]} onPress={onCancel}>
              <Text style={{ color: '#475569', fontWeight: 'bold' }}>रद्द</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.historyBtn, { backgroundColor: '#166534' }]} onPress={onSave}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>सेव करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default BillNumberModal;