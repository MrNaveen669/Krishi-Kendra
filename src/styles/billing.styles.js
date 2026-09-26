import { StyleSheet } from 'react-native';

const billingStyles = StyleSheet.create({
  advisorySearchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    marginBottom: 8
  },
  addNewProdTopBtn: {
    backgroundColor: '#166534',
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 10
  },
  addNewProdTopBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  historyBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  
  productSearchListContent: {
    paddingVertical: 4,
    paddingHorizontal: 2
  }

});

export default billingStyles;
