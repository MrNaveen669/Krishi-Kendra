import { StyleSheet } from 'react-native';

const advisoryStyles = StyleSheet.create({
  advisorBanner: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 8
  },
  advisorTitle: { fontSize: 12, fontWeight: 'bold', color: '#166534' },
  symptomChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 6
  },
  symptomChipActive: { backgroundColor: '#166534', borderColor: '#166534' },
  symptomText: { fontSize: 11, color: '#334155', fontWeight: 'bold' },
  symptomTextActive: { color: '#ffffff' },
  chipScroll: { flexDirection: 'row' },
  catChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 6
  },
  catChipActive: { backgroundColor: '#166534', borderColor: '#166534' },
  catChipText: { fontSize: 11, color: '#475569', fontWeight: 'bold' },
  catChipTextActive: { color: '#ffffff' },
  advCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10
  },
  advCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cropBadgeBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  cropBadgeBoxText: { fontSize: 9.5, color: '#166534', fontWeight: 'bold' },
  companyTag: {
    fontSize: 10,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600'
  },
  editProdBadgeBtn: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  editProdBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#1d4ed8' },
  deleteProdBadgeBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  deleteProdBadgeText: { fontSize: 11 },
  advBrandName: { fontSize: 14.5, fontWeight: '800', color: '#0f172a' },
  advTechName: { fontSize: 11.5, color: '#475569', marginBottom: 4 },
  symptomTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  symptomTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  symptomTagText: { fontSize: 10, color: '#1e40af', fontWeight: 'bold' },
  
  // 3-Column Dosage Container Grid
  dosageBoxContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 8,
    justifyContent: 'space-between'
  },
  dosageCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4
  },
  dosageColBorder: {
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0'
  },
  dosageLabel: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2
  },
  dosageValue: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '800'
  },
  dosageDrumValue: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '800'
  },

  fractionCalcBox: { backgroundColor: '#0f172a', borderRadius: 12, padding: 10, marginBottom: 8 },
  calcHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  calcTitle: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  acreInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 8, padding: 2 },
  stepperMiniBtn: { paddingHorizontal: 7, paddingVertical: 4, backgroundColor: '#334155', borderRadius: 6 },
  stepperMiniText: { color: '#fff', fontSize: 10.5, fontWeight: 'bold' },
  acreTextDirectInput: { width: 46, color: '#38bdf8', fontSize: 13.5, fontWeight: '900', textAlign: 'center', paddingVertical: 1 },
  presetAcreRow: { flexDirection: 'row', gap: 4, marginBottom: 8, flexWrap: 'wrap' },
  presetAcreBtn: { backgroundColor: '#1e293b', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#334155' },
  presetAcreBtnActive: { backgroundColor: '#2563eb', borderColor: '#3b82f6' },
  presetAcreText: { color: '#cbd5e1', fontSize: 10, fontWeight: 'bold' },
  presetAcreTextActive: { color: '#fff' },
  calcResultGrid: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#1e293b', paddingTop: 6 },
  calcGridCol: { alignItems: 'center' },
  calcGridLabel: { color: '#94a3b8', fontSize: 9.5 },
  calcGridValHighlight: { color: '#4ade80', fontSize: 12.5, fontWeight: '900', marginTop: 1 },
  calcGridVal: { color: '#ffffff', fontSize: 12, fontWeight: 'bold', marginTop: 1 },
  calcGridValPack: { color: '#facc15', fontSize: 12.5, fontWeight: '900', marginTop: 1 },
  tankMixBox: { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, padding: 10, borderRadius: 12 },
  tankMixTitle: { fontSize: 11, fontWeight: 'bold', color: '#92400e', marginBottom: 2 },
  tankMixText: { fontSize: 10, color: '#b45309' }
});

export default advisoryStyles;