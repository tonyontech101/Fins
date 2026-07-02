import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/helpers';
import { theme } from '../constants/theme';
import { INSTITUTIONS, renderInstitutionLogo } from '../constants/institutions';

const CURRENCIES = ['PHP', 'USD', 'BTC', 'EUR'];

export default function AddAccountScreen({ navigation, route }) {
  const { dispatch } = useApp();
  const existing = route.params?.account || null;
  const isEdit   = !!existing;

  const [name,     setName]     = useState(existing?.name     ?? '');
  const [instId,   setInstId]   = useState(existing?.institutionId ?? 'bdo');
  const [currency, setCurrency] = useState(existing?.currency ?? 'PHP');
  const [balance,  setBalance]  = useState(existing?.balance?.toString() ?? '0');
  const [currOpen, setCurrOpen] = useState(false);

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Error', 'Please enter an account name'); return; }
    
    const inst = INSTITUTIONS.find(i => i.id === instId);
    
    const payload = {
      ...existing,
      id:         existing?.id ?? generateId(),
      name:       name.trim(),
      institutionId: instId,
      type:       inst?.type || 'Bank',
      currency,
      balance:    parseFloat(balance) || 0,
      updatedAt:  Date.now(),
      createdAt:  existing?.createdAt ?? Date.now(),
    };
    await dispatch({ type: isEdit ? 'UPDATE_ACCOUNT' : 'ADD_ACCOUNT', payload });
    navigation.goBack();
  }

  function handleDelete() {
    Alert.alert(
      'Delete Account',
      'This will permanently remove the account and all its transactions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await dispatch({ type: 'DELETE_ACCOUNT', payload: existing.id });
            navigation.popToTop();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Drag handle */}
      <View style={styles.handleRow}>
        <View style={styles.handle} />
      </View>

      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{isEdit ? 'Edit Account' : 'New Account'}</Text>

        {/* ── Institution (Bank / E-Wallet) ── */}
        <FieldLabel>Bank or E-Wallet</FieldLabel>
        <View style={styles.instGrid}>
          {INSTITUTIONS.map(inst => (
            <TouchableOpacity
              key={inst.id}
              style={[
                styles.instCard,
                instId === inst.id && styles.instCardSelected
              ]}
              onPress={() => {
                setInstId(inst.id);
                // auto-fill name if empty
                if (!name.trim() || INSTITUTIONS.some(i => i.name === name)) {
                  setName(inst.name);
                }
              }}
              activeOpacity={0.7}
            >
              {renderInstitutionLogo(inst.id, 32)}
              <Text style={[styles.instName, instId === inst.id && styles.instNameSelected]}>
                {inst.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Account Name ── */}
        <FieldLabel>Account Name</FieldLabel>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. BPI Savings"
          placeholderTextColor={theme.textMuted}
          returnKeyType="done"
        />

        {/* ── Currency ── */}
        <FieldLabel>Currency</FieldLabel>
        <TouchableOpacity style={styles.selectBtn} onPress={() => setCurrOpen(true)} activeOpacity={0.8}>
          <Text style={styles.selectText}>{currency}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* ── Opening Balance ── */}
        <FieldLabel>Opening Balance</FieldLabel>
        <TextInput
          style={styles.input}
          value={balance}
          onChangeText={setBalance}
          keyboardType="decimal-pad"
          placeholderTextColor={theme.textMuted}
        />

        {/* ── Buttons ── */}
        <View style={styles.btnRow}>
          {isEdit && (
            <TouchableOpacity style={styles.btnDelete} onPress={handleDelete} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={20} color={theme.textDanger} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.btnGhostText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.btnPrimaryText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Currency picker modal ── */}
      <Modal visible={currOpen} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setCurrOpen(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Select Currency</Text>
            {CURRENCIES.map(cur => (
              <TouchableOpacity
                key={cur}
                style={[styles.pickerItem, currency === cur && styles.pickerItemActive]}
                onPress={() => { setCurrency(cur); setCurrOpen(false); }}
              >
                <Text style={[styles.pickerItemText, currency === cur && styles.pickerItemTextActive]}>
                  {cur}
                </Text>
                {currency === cur && (
                  <Ionicons name="checkmark" size={18} color={theme.textAccent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* Small helpers */
function FieldLabel({ children }) {
  return <Text style={fieldLabelStyle}>{children}</Text>;
}
const fieldLabelStyle = {
  fontSize: 12,
  color: '#52525b',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  marginTop: 14,
  marginBottom: 6,
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.surface0 },

  handleRow: { alignItems: 'center', paddingTop: 14, paddingBottom: 4 },
  handle:    { width: 36, height: 4, borderRadius: 2, backgroundColor: theme.borderStrong },

  scroll: { flex: 1, paddingHorizontal: 16 },
  title:  { fontSize: 18, fontWeight: '700', color: theme.textPrimary, marginTop: 8, marginBottom: 4, letterSpacing: -0.3 },

  instGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  instCard: {
    width: '31%',
    backgroundColor: theme.surface1,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  instCardSelected: {
    backgroundColor: theme.bgAccent,
    borderColor: theme.borderAccent,
  },
  instName: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  instNameSelected: {
    color: theme.textAccent,
    fontWeight: '600',
  },

  input: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: theme.borderStrong,
    backgroundColor: theme.surface1,
    color: theme.textPrimary,
    fontSize: 15,
  },

  selectBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: theme.borderStrong,
    backgroundColor: theme.surface1,
  },
  selectText: { fontSize: 15, color: theme.textPrimary },

  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary:     { backgroundColor: theme.fillAccent },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  btnGhost: {
    backgroundColor: theme.surface1,
    borderWidth: 0.5,
    borderColor: theme.borderStrong,
  },
  btnGhostText: { fontSize: 15, fontWeight: '600', color: theme.textSecondary },
  btnDelete: {
    width: 48, height: 48,
    borderRadius: 12,
    backgroundColor: theme.bgDanger,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* Currency Modal */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerSheet: {
    backgroundColor: theme.surface0,
    borderRadius: 18,
    padding: 16,
    width: 240,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  pickerTitle: {
    fontSize: 15, fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 12, textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  pickerItemActive:     { backgroundColor: theme.bgAccent },
  pickerItemText:       { fontSize: 15, color: theme.textPrimary },
  pickerItemTextActive: { color: theme.textAccent, fontWeight: '600' },
});
