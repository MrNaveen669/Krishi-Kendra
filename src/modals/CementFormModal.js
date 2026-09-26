import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import styles from '../styles';

const GRADES = ['OPC 43', 'OPC 53', 'PPC', 'PSC'];
const EMPTY_FORM = {
  brandName: '',
  company: '',
  grade: 'OPC 53',
  pack: '50 kg',
  cashPrice: '',
  creditPrice: '',
  stock: '',
  batch: '',
  expiry: ''
};

export default function CementFormModal({ visible, initialValue, onClose, onSave, t }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!visible) return;
    setForm(initialValue ? {
      ...EMPTY_FORM,
      ...initialValue,
      cashPrice: String(initialValue.cashPrice ?? ''),
      creditPrice: String(initialValue.creditPrice ?? ''),
      stock: String(initialValue.stock ?? '')
    } : EMPTY_FORM);
    setErrors({});
  }, [initialValue, visible]);

  const setField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: '' }));
  };

  const handleSave = () => {
    const nextErrors = {};
    ['brandName', 'company', 'grade', 'pack', 'cashPrice', 'creditPrice', 'stock'].forEach((field) => {
      if (!String(form[field] ?? '').trim()) nextErrors[field] = t.cementRequired;
    });

    ['cashPrice', 'creditPrice', 'stock'].forEach((field) => {
      if (form[field] !== '' && (!Number.isFinite(Number(form[field])) || Number(form[field]) < 0)) {
        nextErrors[field] = t.cementInvalidNumber;
      }
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      ...form,
      cashPrice: Number(form.cashPrice),
      creditPrice: Number(form.creditPrice),
      stock: Math.floor(Number(form.stock)),
      category: 'सीमेंट'
    });
  };

  const renderTextField = (field, label, placeholder, options = {}) => (
    <View style={{ marginBottom: 6 }}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, errors[field] ? { borderColor: '#dc2626' } : null]}
        value={form[field]}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={options.numeric ? 'numeric' : 'default'}
        onChangeText={(value) => setField(field, value)}
      />
      {errors[field] ? <Text style={{ color: '#b91c1c', fontSize: 11 }}>{errors[field]}</Text> : null}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { maxHeight: '92%' }]}>
          <View style={styles.modalHeader}>
            <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#0f172a' }}>
              {initialValue ? t.cementEditTitle : t.cementAddTitle}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#64748b' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 10 }}>
            {renderTextField('brandName', t.cementBrand, t.cementBrandPlaceholder)}
            {renderTextField('company', t.cementCompany, t.cementCompanyPlaceholder)}

            <Text style={styles.formLabel}>{t.cementGrade}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {GRADES.map((grade) => (
                <TouchableOpacity
                  key={grade}
                  style={[styles.catChip, form.grade === grade && styles.catChipActive]}
                  onPress={() => setField('grade', grade)}
                >
                  <Text style={[styles.catChipText, form.grade === grade && styles.catChipTextActive]}>{grade}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.grade ? <Text style={{ color: '#b91c1c', fontSize: 11 }}>{errors.grade}</Text> : null}

            {renderTextField('pack', t.cementBagWeight, t.cementBagWeightPlaceholder)}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>{renderTextField('cashPrice', t.cementCashPrice, '0', { numeric: true })}</View>
              <View style={{ flex: 1 }}>{renderTextField('creditPrice', t.cementCreditPrice, '0', { numeric: true })}</View>
            </View>
            {renderTextField('stock', t.cementStock, '0', { numeric: true })}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>{renderTextField('batch', t.cementBatchOptional, t.cementBatchOptional)}</View>
              <View style={{ flex: 1 }}>{renderTextField('expiry', t.cementExpiryOptional, 'MM/YY')}</View>
            </View>

            <TouchableOpacity style={styles.saveProdSubmitBtn} onPress={handleSave}>
              <Text style={styles.saveProdSubmitBtnText}>{initialValue ? t.cementSaveChanges : t.cementSave}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
