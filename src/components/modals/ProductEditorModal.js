import React from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import styles from '../../styles';

const ProductEditorModal = React.memo(function ProductEditorModal({
  visible,
  editingProductId,
  form,
  onChangeField,
  onBrandNameChange,
  onClose,
  onSave
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { maxHeight: '92%' }]}>
          <View style={styles.modalHeader}>
            <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#0f172a' }}>
              {editingProductId ? '✏ दवा जानकारी एडिट करें' : '➕ नई दवा कैटलॉग में जोड़ें'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#64748b' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
            <Text style={styles.formLabel}>दवा का व्यापारिक नाम (Brand Name) *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="उदा. कोराजन (Coragen 18.5 SC)"
              value={form.brandName}
              onChangeText={onBrandNameChange}
            />

            <Text style={styles.formLabel}>रासायनिक फॉर्मूला (Technical) *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="उदा. Chlorantraniliprole 18.5% SC"
              value={form.technical}
              onChangeText={(value) => onChangeField('technical', value)}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>कंपनी</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="उदा. FMC"
                  value={form.company}
                  onChangeText={(value) => onChangeField('company', value)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>पैकिंग (Pack)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="उदा. 60 ml / 500 g"
                  value={form.pack}
                  onChangeText={(value) => onChangeField('pack', value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>बैच नंबर (Batch No.)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="उदा. CRG04"
                  value={form.batch}
                  onChangeText={(value) => onChangeField('batch', value)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>एक्सपायरी डेट (Expiry)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="उदा. 07/28 ya 2028"
                  value={form.expiry}
                  onChangeText={(value) => onChangeField('expiry', value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>नकद दर (₹)</Text>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  placeholder="उदा. 850"
                  value={form.cashPrice ? String(form.cashPrice) : ''}
                  onChangeText={(value) => onChangeField('cashPrice', value)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>उधार दर (₹)</Text>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  placeholder="उदा. 900"
                  value={form.creditPrice ? String(form.creditPrice) : ''}
                  onChangeText={(value) => onChangeField('creditPrice', value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>उपलब्ध स्टॉक (Stock)</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: '#f0fdf4', fontWeight: 'bold' }]}
                  keyboardType="numeric"
                  placeholder="उदा. 25"
                  value={form.stock !== undefined ? String(form.stock) : ''}
                  onChangeText={(value) => onChangeField('stock', value)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>प्रति एकड़ डोज़ (Dose/Acre)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="उदा. 60 ml"
                  value={form.doseAcre || form.dosePerAcre || ''}
                  onChangeText={(value) => {
                    onChangeField('doseAcre', value);
                    onChangeField('dosePerAcre', value);
                  }}
                />
              </View>
            </View>

            {/* Dose Details: 200L Drum Dose aur Pump Dose */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>200L ड्रम डोज़ (Drum Dose)</Text>
                <TextInput
                  style={[styles.formInput, { borderColor: '#0284c7' }]}
                  placeholder="उदा. 60-80 ml"
                  value={form.drumDose || ''}
                  onChangeText={(value) => onChangeField('drumDose', value)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>प्रति 15L पंप डोज़ (Pump Dose)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="उदा. 5-6 ml"
                  value={form.pumpDose || ''}
                  onChangeText={(value) => onChangeField('pumpDose', value)}
                />
              </View>
            </View>

            <Text style={styles.formLabel}>रोग के लक्षण (Symptoms) कॉमा लगाकर लिखें *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="उदा. गोब सूखना, इल्ली, तना छेदक"
              value={Array.isArray(form.symptoms) ? form.symptoms.join(', ') : (form.symptoms || '')}
              onChangeText={(value) => onChangeField('symptoms', value)}
            />

            <TouchableOpacity style={styles.saveProdSubmitBtn} onPress={onSave}>
              <Text style={styles.saveProdSubmitBtnText}>
                {editingProductId ? '💾 बदलाव सुरक्षित करें' : '➕ दवा सेव करें'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

export default ProductEditorModal;