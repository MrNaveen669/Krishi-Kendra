import { StyleSheet } from 'react-native';

const invoiceStyles = StyleSheet.create({
  invoicePaper: { borderWidth: 1, borderColor: '#0f172a', padding: 10 },
  paperBadge: {
    fontSize: 9,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#0f172a',
    paddingHorizontal: 4,
    paddingVertical: 1
  },
  paperTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  paperSub: { fontSize: 9, color: '#475569' },
  paperGst: { fontSize: 8, color: '#64748b' },
  paperMeta: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#cbd5e1', paddingVertical: 4, marginVertical: 4 },
  metaText: { fontSize: 9, color: '#1e293b' },
  paperItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  paperTotalBox: { borderTopWidth: 1, borderColor: '#cbd5e1', paddingTop: 4, gap: 2 },
  paperTotalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billNumberInput: {
    borderWidth: 2,
    borderColor: '#166534',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 6,
    color: '#0f172a'
  }
});

export default invoiceStyles;
