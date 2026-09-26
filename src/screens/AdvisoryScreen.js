import React from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ProductStockPill from '../components/ProductStockPill';
import styles from '../styles';

const AdvisoryScreen = React.memo(function AdvisoryScreen({
  products,
  productCount,
  symptoms,
  t,
  isFetchingProducts,
  search,
  selectedSymptom,
  selectedCategory,
  showLowStockOnly,
  acreState,
  onSyncProducts,
  onSearchChange,
  onAddProduct,
  onBulkAdd,
  onSelectSymptom,
  onSelectCategory,
  onToggleLowStock,
  onUpdateAcre,
  onSetExactAcre,
  onSetAcre,
  onEditProduct,
  onDeleteProduct,
  onAddToCart,
  setCurrentTab
}) {
  const renderItem = ({ item: product, index }) => {
    const currentAcreInput = acreState[product.id] !== undefined ? acreState[product.id] : '1.0';
    const currentAcre = parseFloat(currentAcreInput) || 1.0;
    const totalRequiredDose = ((parseFloat(product.doseAcre || product.dosePerAcre) || 0) * currentAcre).toFixed(1);
    const pumpsNeeded = (currentAcre * 10).toFixed(1);
    const recommendedPacks = Math.ceil(currentAcre);
    const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
    const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5;

    return (
      <View key={`${product.id || product.brandName}-${index}`} style={styles.advCard}>
        <View style={styles.advCardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            <View style={styles.cropBadgeBox}><Text style={styles.cropBadgeBoxText}>{product.crop}</Text></View>
            <Text style={styles.companyTag}>{product.company}</Text>
            <ProductStockPill
              isOutOfStock={isOutOfStock}
              isLowStock={isLowStock}
              stock={product.stock}
              label={isOutOfStock ? t.outOfStockBadge : isLowStock ? `${t.lowStockBadge}: ${product.stock}` : `स्टॉक: ${product.stock}`}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity style={styles.editProdBadgeBtn} onPress={() => onEditProduct(product)}>
              <Text style={styles.editProdBadgeText}>{t.edit}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteProdBadgeBtn} onPress={() => onDeleteProduct(product)}>
              <Text style={styles.deleteProdBadgeText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.advBrandName}>{product.brandName} ({product.pack})</Text>
        <Text style={styles.advTechName}>🧪 {product.technical}</Text>

        {product.symptoms && product.symptoms.length > 0 && (
          <View style={styles.symptomTagRow}>
            {product.symptoms.map((symptom, symptomIndex) => (
              <View key={`${symptom}-${symptomIndex}`} style={styles.symptomTag}>
                <Text style={styles.symptomTagText}>✓ {symptom}</Text>
              </View>
            ))}
          </View>
        )}

        {/* --- DOSE ROW (Acre | 200L Drum | Pump) --- */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#f8fafc',
          borderRadius: 8,
          paddingVertical: 6,
          paddingHorizontal: 8,
          marginVertical: 6,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          justifyContent: 'space-between'
        }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '600' }}>{t.dosePerAcreLabel || 'प्रति एकड़'}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a', marginTop: 2 }}>{product.doseAcre || '-'}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#cbd5e1', marginVertical: 2 }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#0284c7', fontWeight: '700' }}>{t.drumDoseLabel || '200L ड्रम'}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#0369a1', marginTop: 2 }}>{product.drumDose || '-'}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#cbd5e1', marginVertical: 2 }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '600' }}>{t.pumpDoseLabel || 'प्रति 15L पंप'}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a', marginTop: 2 }}>{product.pumpDose || '-'}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
          🏷️ बैच: <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{product.batch}</Text> | ⏳ एक्सपायरी: <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{product.expiry}</Text>
        </Text>
        <Text style={{ fontSize: 12, color: '#166534', fontWeight: 'bold', marginBottom: 6 }}>
          नकद: ₹{product.cashPrice} | उधार: ₹{product.creditPrice}
        </Text>

        <View style={styles.fractionCalcBox}>
          <View style={styles.calcHeaderRow}>
            <Text style={styles.calcTitle}>📐 खेत रकबा (एकड़ दर्ज करें):</Text>
            <View style={styles.acreInputContainer}>
              <TouchableOpacity style={styles.stepperMiniBtn} onPress={() => onUpdateAcre(product.id, -0.25)}>
                <Text style={styles.stepperMiniText}>-0.25</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.acreTextDirectInput}
                keyboardType="numeric"
                value={String(currentAcreInput)}
                onChangeText={(value) => onSetExactAcre(product.id, value)}
              />
              <TouchableOpacity style={styles.stepperMiniBtn} onPress={() => onUpdateAcre(product.id, 0.25)}>
                <Text style={styles.stepperMiniText}>+0.25</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.presetAcreRow}>
            {[0.5, 1.0, 1.25, 1.5, 2.0, 2.5].map((acre) => (
              <TouchableOpacity
                key={acre}
                style={[styles.presetAcreBtn, currentAcre === acre && styles.presetAcreBtnActive]}
                onPress={() => onSetAcre(product.id, String(acre))}
              >
                <Text style={[styles.presetAcreText, currentAcre === acre && styles.presetAcreTextActive]}>{acre} एकड़</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.calcGridCol}>
              <Text style={styles.calcGridLabel}>किसान को दें</Text>
              <Text style={styles.calcGridValPack}>{recommendedPacks} पैक/बोतल</Text>
            </View>

          <View style={styles.calcResultGrid}>
            {/* <View style={styles.calcGridCol}>
              <Text style={styles.calcGridLabel}>{currentAcre} एकड़ कुल दवा</Text>
              <Text style={styles.calcGridValHighlight}>{totalRequiredDose} {product.doseUnit}</Text>
            </View> */}
            {/* <View style={styles.calcGridCol}>
              <Text style={styles.calcGridLabel}>15L स्प्रे पंप</Text>
              <Text style={styles.calcGridVal}>{pumpsNeeded} पंप</Text>
            </View> */}
            {/* <View style={styles.calcGridCol}>
              <Text style={styles.calcGridLabel}>किसान को दें</Text>
              <Text style={styles.calcGridValPack}>{recommendedPacks} पैक/बोतल</Text>
            </View> */}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
          <TouchableOpacity
            style={[styles.historyBtn, { backgroundColor: isOutOfStock ? '#cbd5e1' : '#16a34a' }]}
            disabled={isOutOfStock}
            onPress={() => onAddToCart(product, 1)}
          >
            <Text style={{ color: isOutOfStock ? '#64748b' : '#fff', fontSize: 11, fontWeight: 'bold' }}>
              {isOutOfStock ? 'खत्म' : '+1 सिंगल'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.historyBtn, { backgroundColor: isOutOfStock ? '#e2e8f0' : '#2563eb', flex: 1.5 }]}
            disabled={isOutOfStock}
            onPress={() => {
              onAddToCart(product, recommendedPacks);
              setCurrentTab('billing');
            }}
          >
            <Text style={{ color: isOutOfStock ? '#94a3b8' : '#fff', fontSize: 11, fontWeight: 'bold' }}>
              🛒 {currentAcre} एकड़ ({recommendedPacks} पैक) जोड़ें
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ListHeader = (
    <View style={styles.tabSection}>
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{t.availableMedicines}</Text>
            <View style={styles.prodCountBadge}><Text style={styles.prodCountBadgeText}>{productCount}</Text></View>
          </View>
          <TouchableOpacity style={styles.fetchProductsBtn} onPress={onSyncProducts} disabled={isFetchingProducts}>
            {isFetchingProducts ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.fetchProductsBtnText}>{t.syncMedicines}</Text>}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
          <TextInput
            style={[styles.advisorySearchInput, { flex: 1, marginBottom: 0 }]}
            placeholder="दवा, रोग या लक्षण खोजें..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={onSearchChange}
          />
          <TouchableOpacity style={styles.addNewProdTopBtn} onPress={onAddProduct}>
            <Text style={styles.addNewProdTopBtnText}>{t.singleAdd}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addNewProdTopBtn, { backgroundColor: '#0f172a' }]} onPress={onBulkAdd}>
            <Text style={styles.addNewProdTopBtnText}>{t.bulkAdd}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.advisorBanner}>
          <Text style={styles.advisorTitle}>🩺 किसान डॉक्टर सलाहकार (लक्षण देखकर दवा चुनें):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
            <TouchableOpacity style={[styles.symptomChip, selectedSymptom === 'all' && styles.symptomChipActive]} onPress={() => onSelectSymptom('all')}>
              <Text style={[styles.symptomText, selectedSymptom === 'all' && styles.symptomTextActive]}>🌿 सभी लक्षण</Text>
            </TouchableOpacity>
            {symptoms.map((symptom, index) => (
              <TouchableOpacity
                key={`${symptom}-${index}`}
                style={[styles.symptomChip, selectedSymptom === symptom && styles.symptomChipActive]}
                onPress={() => onSelectSymptom(selectedSymptom === symptom ? 'all' : symptom)}
              >
                <Text style={[styles.symptomText, selectedSymptom === symptom && styles.symptomTextActive]}>⚠️ {symptom}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['all', 'कीटनाशक', 'फफूंदनाशक', 'खरपतवारनाशक', 'सीमेंट'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.catChip, selectedCategory === category && !showLowStockOnly && styles.catChipActive]}
              onPress={() => onSelectCategory(category)}
            >
              <Text style={[styles.catChipText, selectedCategory === category && !showLowStockOnly && styles.catChipTextActive]}>
                {category === 'all' ? t.allPests : category}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.catChip, showLowStockOnly && { backgroundColor: '#b91c1c', borderColor: '#b91c1c' }]}
            onPress={onToggleLowStock}
          >
            <Text style={[styles.catChipText, showLowStockOnly && { color: '#ffffff' }]}>{t.lowStockChip}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.contentScroll}
      contentContainerStyle={styles.contentInner}
      data={products}
      keyExtractor={(product, index) => `${product.id || product.brandName}-${index}`}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      keyboardShouldPersistTaps="handled"
    />
  );
});

export default AdvisoryScreen;