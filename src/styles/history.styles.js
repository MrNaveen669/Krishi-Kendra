import { StyleSheet } from 'react-native';

const historyStyles = StyleSheet.create({
  historySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10
  },
  historySearchInput: { flex: 1, paddingVertical: 8, fontSize: 13, color: '#0f172a' },
  clearSearchBtn: { padding: 4 },
  fetchBillsBtn: {
    backgroundColor: '#166534',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  fetchBillsBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  fetchProductsBtn: {
    backgroundColor: '#166534',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  fetchProductsBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' }
});

export default historyStyles;
