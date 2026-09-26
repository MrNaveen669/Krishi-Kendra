import React, { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { handleHinglishChange } from '../utils/transliterate';

const HistoryScreen = React.memo(function HistoryScreen({
  data,
  dailySummary,
  t,
  isFetchingBills,
  historySearch,
  onSyncHistory,
  onSearchChange,
  onClearSearch,
  onOpenBill,
  onEdit,
  onPrint,
  onWhatsApp,
  onReminder
}) {
  const [filterType, setFilterType] = useState('all');

  const displayedBills = useMemo(() => {
    if (filterType === 'credit') {
      return (data || []).filter((b) => Number(b.balanceDue || 0) > 0 || b.paymentMode === 'credit');
    }
    if (filterType === 'cash') {
      return (data || []).filter((b) => Number(b.balanceDue || 0) === 0 && b.paymentMode === 'cash');
    }
    if (filterType === 'upi') {
      return (data || []).filter((b) => b.paymentMode === 'upi');
    }
    return data || [];
  }, [data, filterType]);

  const renderItem = ({ item }) => {
    const isDue = Number(item.balanceDue || 0) > 0;
    const isUpi = item.paymentMode === 'upi';

    return (
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          padding: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isDue ? '#fecaca' : isUpi ? '#bfdbfe' : '#e2e8f0',
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 2
        }}
      >
        {/* Header Strip */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={{ fontWeight: '800', fontSize: 15, color: '#0f172a' }}>
                {item.customerName}
              </Text>
              <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#475569' }}>
                  #{item.billNumber}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
              📍 {item.customerVillage || 'देवरी'} {item.customerPhone ? ` • 📞 ${item.customerPhone}` : ''}
            </Text>
          </View>

          {/* DYNAMIC STATUS BADGE (Cash / UPI / Credit) */}
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 20,
              backgroundColor: isDue ? '#fee2e2' : isUpi ? '#dbeafe' : '#dcfce7',
              borderWidth: 1,
              borderColor: isDue ? '#fca5a5' : isUpi ? '#93c5fd' : '#86efac'
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '800',
                color: isDue ? '#b91c1c' : isUpi ? '#1d4ed8' : '#15803d'
              }}
            >
              {isDue ? '📋 उधार' : isUpi ? '📱 UPI' : '💵 नकद'}
            </Text>
          </View>
        </View>

        {/* DATE & AMOUNT STRIP WITH AUDIT LOG */}
        <View
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 10,
            marginVertical: 10
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '600' }}>दवाई क्रय तिथि</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#1e293b', marginTop: 1 }}>
                📅 {item.date || '-'}
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '600' }}>कुल बिल</Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a', marginTop: 1 }}>
                ₹{Number(item.grandTotal || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, color: isDue ? '#b91c1c' : '#166534', fontWeight: '700' }}>
                {isDue ? 'बाकी उधारी' : 'पूर्ण जमा'}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '900', color: isDue ? '#dc2626' : '#16a34a', marginTop: 1 }}>
                ₹{Number(isDue ? item.balanceDue : item.paidAmount || item.grandTotal).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* AUDIT NOTE: Shows when the payment was settled */}
          {item.lastPaymentDate ? (
            <View style={{ marginTop: 6, paddingTop: 4, borderTopWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 9.5, color: '#0369a1', fontWeight: '700' }}>
                💳 अंतिम भुगतान समय: {item.lastPaymentDate}
              </Text>
              <Text style={{ fontSize: 9.5, color: isUpi ? '#1d4ed8' : '#15803d', fontWeight: '700' }}>
                [{isUpi ? 'ऑनलाइन / UPI' : 'नकद'}]
              </Text>
            </View>
          ) : null}
        </View>

        {/* Action Buttons Row */}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#0f172a',
              paddingVertical: 6,
              paddingHorizontal: 9,
              borderRadius: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}
            onPress={() => onOpenBill(item)}
          >
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>🧾 रसीद</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#2563eb',
              paddingVertical: 6,
              paddingHorizontal: 9,
              borderRadius: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}
            onPress={() => onEdit(item)}
          >
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>✏️ एडिट</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#d97706',
              paddingVertical: 6,
              paddingHorizontal: 9,
              borderRadius: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}
            onPress={() => onPrint(item)}
          >
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>🖨️ PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#16a34a',
              paddingVertical: 6,
              paddingHorizontal: 9,
              borderRadius: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}
            onPress={() => onWhatsApp(item)}
          >
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>💬 WA</Text>
          </TouchableOpacity>

          {/* Alert button on every bill */}
          <TouchableOpacity
            style={{
              backgroundColor: isDue ? '#dc2626' : '#64748b',
              paddingVertical: 6,
              paddingHorizontal: 9,
              borderRadius: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}
            onPress={() => onReminder(item)}
          >
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '800' }}>
              🔔 {isDue ? 'तगादा' : 'अलर्ट'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ListHeader = (
    <View style={{ marginBottom: 14 }}>
      {/* 4-Box Daily Dashboard (Total, Cash, UPI, Due) */}
      <View
        style={{
          backgroundColor: '#14532d',
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 3
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: '#86efac', fontWeight: '800', fontSize: 12 }}>
            📊 आज का गल्ला हिसाब (TODAY'S DASHBOARD)
          </Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
            <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '700' }}>{dailySummary.count} बिल</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 7, borderRadius: 8 }}>
            <Text style={{ color: '#bbf7d0', fontSize: 9.5, fontWeight: '600' }}>कुल बिक्री</Text>
            <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '900', marginTop: 2 }}>
              ₹{Number(dailySummary.totalSales || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 7, borderRadius: 8 }}>
            <Text style={{ color: '#bbf7d0', fontSize: 9.5, fontWeight: '600' }}>💵 नकद</Text>
            <Text style={{ color: '#4ade80', fontSize: 13, fontWeight: '900', marginTop: 2 }}>
              ₹{Number(dailySummary.totalCash || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 7, borderRadius: 8 }}>
            <Text style={{ color: '#93c5fd', fontSize: 9.5, fontWeight: '600' }}>📱 UPI</Text>
            <Text style={{ color: '#60a5fa', fontSize: 13, fontWeight: '900', marginTop: 2 }}>
              ₹{Number(dailySummary.totalUpi || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 7, borderRadius: 8 }}>
            <Text style={{ color: '#fca5a5', fontSize: 9.5, fontWeight: '600' }}>उधार बाकी</Text>
            <Text style={{ color: '#f87171', fontSize: 13, fontWeight: '900', marginTop: 2 }}>
              ₹{Number(dailySummary.totalDue || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>

      {/* Sync and Title Strip */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 15, fontWeight: '900', color: '#ffffff' }}>
          {t.oldBills} ({displayedBills.length})
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#0284c7',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
          }}
          onPress={onSyncHistory}
          disabled={isFetchingBills}
        >
          {isFetchingBills ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>🔄 {t.syncHistory}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 2,
          borderWidth: 1,
          borderColor: '#cbd5e1',
          marginBottom: 10
        }}
      >
        <Text style={{ fontSize: 15, marginRight: 6 }}>🔍</Text>
        <TextInput
          style={{
            flex: 1,
            height: 40,
            fontSize: 13,
            color: '#0f172a',
            fontWeight: '600'
          }}
          placeholder="किसान का नाम, गांव, फोन (उदा. ramesh + space)..."
          placeholderTextColor="#94a3b8"
          value={historySearch || ''}
          onChangeText={(newVal) => {
            handleHinglishChange(newVal, onSearchChange);
          }}
        />
        {historySearch && historySearch.length > 0 ? (
          <TouchableOpacity onPress={onClearSearch} style={{ padding: 6 }}>
            <Text style={{ color: '#64748b', fontWeight: 'bold', fontSize: 14 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Chips */}
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20,
            backgroundColor: filterType === 'all' ? '#ffffff' : 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            borderColor: filterType === 'all' ? '#ffffff' : 'rgba(255,255,255,0.2)'
          }}
          onPress={() => setFilterType('all')}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: filterType === 'all' ? '#0f172a' : '#ffffff' }}>
            सभी ({data?.length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20,
            backgroundColor: filterType === 'credit' ? '#b91c1c' : '#fef2f2',
            borderWidth: 1,
            borderColor: filterType === 'credit' ? '#b91c1c' : '#fecaca'
          }}
          onPress={() => setFilterType('credit')}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: filterType === 'credit' ? '#fff' : '#b91c1c' }}>
            ⚠️ केवल उधार
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20,
            backgroundColor: filterType === 'cash' ? '#166534' : '#f0fdf4',
            borderWidth: 1,
            borderColor: filterType === 'cash' ? '#166534' : '#bbf7d0'
          }}
          onPress={() => setFilterType('cash')}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: filterType === 'cash' ? '#fff' : '#166534' }}>
            💵 नकद
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20,
            backgroundColor: filterType === 'upi' ? '#2563eb' : '#eff6ff',
            borderWidth: 1,
            borderColor: filterType === 'upi' ? '#2563eb' : '#bfdbfe'
          }}
          onPress={() => setFilterType('upi')}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: filterType === 'upi' ? '#fff' : '#1d4ed8' }}>
            📱 UPI
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={displayedBills}
      keyExtractor={(item, index) => `${item.id || item.billNumber}-${item.date || 'na'}-${index}`}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        <View
          style={{
            padding: 30,
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            marginTop: 10
          }}
        >
          <Text style={{ fontSize: 32, marginBottom: 8 }}>📜</Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#475569' }}>कोई बिल रिकॉर्ड नहीं मिला</Text>
        </View>
      }
      contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
    />
  );
});

export default HistoryScreen;