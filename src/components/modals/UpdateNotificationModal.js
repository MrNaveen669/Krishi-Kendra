// File: src/components/modals/UpdateNotificationModal.js

import React, { useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';
import styles from '../../styles';
import { CURRENT_VERSION, downloadAndInstallApk } from '../../services/updateService';

function UpdateNotificationModal({ visible, updateInfo, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!updateInfo) return null;

  const handleStartUpdate = async () => {
    try {
      setDownloading(true);
      setProgress(0);
      await downloadAndInstallApk(updateInfo.apkUrl, (percent) => {
        setProgress(percent);
      });
      setDownloading(false);
      onClose();
    } catch (err) {
      setDownloading(false);
      alert('APK डाउनलोड करने में समस्या आई।');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { padding: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>
              🔔 अपडेट सूचना (Notification)
            </Text>
            {!downloading && (
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: 20, color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ marginVertical: 14 }}>
            {updateInfo.hasUpdate ? (
              <>
                <View style={{ backgroundColor: '#dcfce7', padding: 8, borderRadius: 6, marginBottom: 10 }}>
                  <Text style={{ color: '#166534', fontWeight: 'bold', fontSize: 13 }}>
                    🚀 नया वर्जन {updateInfo.latestVersion} उपलब्ध है!
                  </Text>
                  <Text style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
                    मौजूदा वर्जन: v{CURRENT_VERSION}
                  </Text>
                </View>

                <Text style={{ fontWeight: 'bold', color: '#334155', fontSize: 12 }}>नये बदलाव:</Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
                  {updateInfo.changeLog || 'बग फिक्स और परफॉर्मेंस सुधार।'}
                </Text>
              </>
            ) : (
              <View style={{ padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginBottom: 6 }}>✅</Text>
                <Text style={{ color: '#0f172a', fontWeight: 'bold' }}>आपका ऐप पूरी तरह अपडेटेड है!</Text>
                <Text style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>वर्जन: v{CURRENT_VERSION}</Text>
              </View>
            )}
          </View>

          {updateInfo.hasUpdate && (
            <View style={{ marginTop: 10 }}>
              {downloading ? (
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: 'bold' }}>
                    डाउनलोड हो रहा है... {progress}%
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#16a34a',
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}
                  onPress={handleStartUpdate}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
                    ⬇️ Update Now (ऑटो इंस्टॉल करें)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ZAROORI: Default export hona chahiye
export default UpdateNotificationModal;