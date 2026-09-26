import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import styles from '../../styles';

const ConfirmationDialog = React.memo(function ConfirmationDialog({ dialog, onClose }) {
  return (
    <Modal visible={dialog.visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.customDialogBox}>
          <View style={[styles.dialogIconCircle, dialog.isDestructive ? styles.dialogIconDanger : styles.dialogIconPrimary]}>
            <Text style={{ fontSize: 24 }}>{dialog.icon}</Text>
          </View>
          <Text style={styles.dialogTitleText}>{dialog.title}</Text>
          <Text style={styles.dialogMsgText}>{dialog.message}</Text>

          <View style={styles.dialogActionsRow}>
            {dialog.cancelText && (
              <TouchableOpacity style={[styles.dialogBtn, styles.dialogCancelBtn]} onPress={onClose}>
                <Text style={styles.dialogCancelText}>{dialog.cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.dialogBtn,
                dialog.isDestructive ? styles.dialogDestructiveBtn : styles.dialogConfirmBtn,
                !dialog.cancelText && { flex: 1 }
              ]}
              onPress={() => {
                onClose();
                if (dialog.onConfirm) dialog.onConfirm();
              }}
            >
              <Text style={styles.dialogConfirmText}>{dialog.confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default ConfirmationDialog;