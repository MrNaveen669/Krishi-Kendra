import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { CEMENT_LOW_STOCK_THRESHOLD } from '../config/constants';
import ProductStockPill from '../components/ProductStockPill';
import CementFormModal from '../modals/CementFormModal';
import styles from '../styles';

const CementScreen = React.memo(function CementScreen({
  products,
  brands,
  t,
  search,
  onSearchChange,
  brandFilter,
  onBrandFilter,
  lowStockOnly,
  onToggleLowStock,
  syncPending,
  isSyncing,
  onSync,
  onSaveCement,
  onDeleteCement,
  onUpdateStock,
  onAddToBill
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCement, setEditingCement] = useState(null);

  const openAdd = () => {
    setEditingCement(null);
    setModalVisible(true);
  };

  const openEdit = (product) => {
    setEditingCement(product);
    setModalVisible(true);
  };

  const handleSave = async (values) => {
    await onSaveCement(editingCement ? { ...editingCement, ...values } : values);
    setModalVisible(false);
    setEditingCement(null);
  };

  const renderItem = ({ item }) => {
    const isOutOfStock = item.stock <= 0;
    const isLowStock = !isOutOfStock && item.stock <= CEMENT_LOW_STOCK_THRESHOLD;

    return (
      <View style={styles.advCard}>
        <View style={styles.advCardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.advBrandName}>{item.brandName}</Text>
            <Text style={styles.advTechName}>{item.company} · {item.grade} · {item.pack} {t.cementBagUnit}</Text>
          </View>
          <ProductStockPill
            isOutOfStock={isOutOfStock}
            isLowStock={isLowStock}
            stock={item.stock}
            label={isOutOfStock ? t.cementOutOfStock : isLowStock ? `${t.cementLowStock}: ${item.stock}` : `${item.stock} ${t.cementInStock}`}
          />
        </View>

        <Text style={{ fontSize: 12, color: '#166534', fontWeight: 'bold', marginBottom: 8 }}>
          {t.cementCashLabel}: ₹{item.cashPrice} / bag  |  {t.cementCreditLabel}: ₹{item.creditPrice} / bag
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Text style={styles.dailyDashLabel}>{t.cementStockAdjustment}</Text>
          <TouchableOpacity
            style={[styles.stepperMiniBtn, { opacity: isOutOfStock ? 0.45 : 1 }]}
            disabled={isOutOfStock}
            onPress={() => onUpdateStock(item.id, item.stock - 1)}
          >
            <Text style={styles.stepperMiniText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.stepQty}>{item.stock}</Text>
          <TouchableOpacity style={styles.stepperMiniBtn} onPress={() => onUpdateStock(item.id, item.stock + 1)}>
            <Text style={styles.stepperMiniText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <TouchableOpacity
            style={[styles.historyBtn, { backgroundColor: isOutOfStock ? '#cbd5e1' : '#166534' }]}
            disabled={isOutOfStock}
            onPress={() => onAddToBill(item)}
          >
            <Text style={{ color: isOutOfStock ? '#64748b' : '#fff', fontSize: 11, fontWeight: 'bold' }}>
              {isOutOfStock ? t.cementOutOfStock : t.cementAddToBill}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.historyBtn, { backgroundColor: '#2563eb' }]} onPress={() => openEdit(item)}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{t.cementEdit}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.historyBtn, { backgroundColor: '#b91c1c' }]} onPress={() => onDeleteCement(item)}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{t.cementDelete}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ListHeader = (
    <View style={styles.tabSection}>
      <View style={styles.dailyDashboardCard}>
        <Text style={styles.dailyDashboardTitle}>{t.cementTitle}</Text>
        <Text style={styles.dailyDashLabel}>{t.cementSubtitle}</Text>
      </View>

      <View style={styles.historySearchBox}>
        <TextInput
          style={styles.historySearchInput}
          value={search}
          onChangeText={onSearchChange}
          placeholder={t.cementSearchPlaceholder}
          placeholderTextColor="#94a3b8"
        />
        {search.length > 0 && (
          <TouchableOpacity style={styles.clearSearchBtn} onPress={() => onSearchChange('')}>
            <Text style={{ color: '#94a3b8', fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <TouchableOpacity style={[styles.catChip, brandFilter === 'all' && styles.catChipActive]} onPress={() => onBrandFilter('all')}>
          <Text style={[styles.catChipText, brandFilter === 'all' && styles.catChipTextActive]}>{t.cementAllBrands}</Text>
        </TouchableOpacity>
        {brands.map((brand) => (
          <TouchableOpacity key={brand} style={[styles.catChip, brandFilter === brand && styles.catChipActive]} onPress={() => onBrandFilter(brand)}>
            <Text style={[styles.catChipText, brandFilter === brand && styles.catChipTextActive]}>{brand}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity
          style={[styles.catChip, lowStockOnly && { backgroundColor: '#b91c1c', borderColor: '#b91c1c' }]}
          onPress={onToggleLowStock}
        >
          <Text style={[styles.catChipText, lowStockOnly && { color: '#fff' }]}>{t.cementLowStockOnly}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fetchProductsBtn} onPress={onSync} disabled={isSyncing}>
          {isSyncing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.fetchProductsBtnText}>{t.cementSync}</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.dailyDashLabel}>{syncPending ? t.cementSyncPending : t.cementSyncComplete}</Text>
      <TouchableOpacity style={styles.addNewProdTopBtn} onPress={openAdd}>
        <Text style={styles.addNewProdTopBtnText}>{t.cementAdd}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <FlatList
        style={styles.contentScroll}
        contentContainerStyle={styles.contentInner}
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<View style={styles.emptyStateBox}><Text style={styles.emptyStateText}>{t.cementNoItems}</Text></View>}
        keyboardShouldPersistTaps="handled"
      />
      <CementFormModal
        visible={modalVisible}
        initialValue={editingCement}
        t={t}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </>
  );
});

export default CementScreen;