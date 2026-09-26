import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import styles from '../../styles';

const InvoicePreviewModal = React.memo(function InvoicePreviewModal({ bill, t, onClose, onPrint, onWhatsApp, onNewBill }) {
  return (
    <Modal visible={!!bill} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#0f172a' }}>प्रमाणित केश मेमो (Legal Memo)</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#64748b' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {bill && (
            <View style={styles.invoicePaper}>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.paperBadge}>{bill.paymentMode === 'cash' ? '॥ नकद केश मेमो ॥' : '॥ उधार पर्ची ॥'}</Text>
                <Text style={styles.paperTitle}>जीवन कृषि केन्द्र</Text>
                <Text style={styles.paperSub}>ग्राम - देवरी, जिला - धमतरी (छ.ग.) | 70891-01502</Text>
                <Text style={styles.paperGst}>GSTIN: 22FTUPS0621B1ZU</Text>
              </View>

              <View style={styles.paperMeta}>
                <Text style={styles.metaText}>बिल: #{bill.billNumber} | दिनांक: {bill.date}</Text>
                <Text style={styles.metaText}>
                  किसान: {bill.customerName} {bill.customerFatherName ? `(आत्मज: ${bill.customerFatherName})` : ''}
                </Text>
                <Text style={styles.metaText}>गाँव: {bill.customerVillage} {bill.customerPhone ? `| M: ${bill.customerPhone}` : ''}</Text>
              </View>

              <ScrollView style={{ maxHeight: 180, marginVertical: 6 }}>
                {(bill.items || []).length === 0 ? (
                  <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginVertical: 8 }}>
                    {t.emptyInvoiceItems}
                  </Text>
                ) : (
                  (bill.items || []).map((item, index) => (
                    <View key={`${item.id || item.brandName}-${index}`} style={styles.paperItemRow}>
                      <Text style={{ flex: 1, fontSize: 11 }}>
                        {index + 1}. {item.brandName}{item.grade ? ` (${item.grade})` : ''} x{item.qty}{item.category === 'सीमेंट' ? ' bags' : ''}
                      </Text>
                      <Text style={{ fontWeight: 'bold', fontSize: 11 }}>₹{(item.qty || 1) * (item.sellingPrice || 0)}</Text>
                    </View>
                  ))
                )}
              </ScrollView>

              <View style={styles.paperTotalBox}>
                <View style={styles.paperTotalRow}>
                  <Text style={{ fontSize: 11 }}>कुल रकम:</Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 11 }}>₹{bill.grandTotal}</Text>
                </View>
                <View style={styles.paperTotalRow}>
                  <Text style={{ fontSize: 11, color: '#166534' }}>जमा राशि:</Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 11, color: '#166534' }}>₹{bill.paidAmount}</Text>
                </View>
                {bill.balanceDue > 0 && (
                  <View style={styles.paperTotalRow}>
                    <Text style={{ fontSize: 11, color: '#dc2626' }}>शेष उधारी:</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 11, color: '#dc2626' }}>₹{bill.balanceDue}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
            <TouchableOpacity style={[styles.historyBtn, { backgroundColor: '#d97706', paddingVertical: 10 }]} onPress={() => onPrint(bill)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 11 }}>🖨️ प्रिंट / PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.historyBtn, { backgroundColor: '#16a34a', paddingVertical: 10 }]} onPress={() => onWhatsApp(bill)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 11 }}>💬 WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.historyBtn, { backgroundColor: '#0f172a', paddingVertical: 10 }]} onPress={onNewBill}>
              <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 11 }}>➕ नया बिल</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default InvoicePreviewModal;