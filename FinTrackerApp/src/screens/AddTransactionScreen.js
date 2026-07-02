import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/helpers';
import { theme, CATEGORIES } from '../constants/theme';

const TX_TYPES = [
  { key: 'expense',  label: 'Expense',  icon: 'arrow-down-circle-outline' },
  { key: 'income',   label: 'Income',   icon: 'arrow-up-circle-outline' },
  { key: 'transfer', label: 'Transfer', icon: 'swap-horizontal-outline' },
];

export default function AddTransactionScreen({ navigation }) {
  const { state, dispatch } = useApp();

  const [txType,     setTxType]     = useState('expense');
  const [accountId,  setAccountId]  = useState(state.accounts[0]?.id ?? '');
  const [toAccId,    setToAccId]    = useState(state.accounts[1]?.id ?? '');
  const [category,   setCategory]   = useState('');
  const [amount,     setAmount]     = useState('');
  const [note,       setNote]       = useState('');

  const incomeCats  = CATEGORIES.filter(c => c === 'Income');
  const expenseCats = CATEGORIES.filter(c => c !== 'Income');
  const cats        = txType === 'income' ? incomeCats : expenseCats;

  async function handleSave() {
    if (state.accounts.length === 0) {
      Alert.alert('No Account Found', 'Please add an account before recording a transaction.');
      return;
    }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { Alert.alert('Error', 'Please enter a valid amount'); return; }
    if (txType === 'transfer' && accountId === toAccId) {
      Alert.alert('Error', 'From and To accounts must be different');
      return;
    }
    await dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id:          generateId(),
        type:        txType,
        accountId,
        toAccountId: txType === 'transfer' ? toAccId : null,
        category:    txType !== 'transfer' ? category : '',
        amount:      amt,
        note:        note.trim(),
        date:        Date.now(),
      },
    });
    navigation.goBack();
  }

  const accsForTo = state.accounts.filter(a => a.id !== accountId);

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
        <Text style={styles.title}>Add Transaction</Text>

        {/* ── TX Type ── */}
        <FieldLabel>Type</FieldLabel>
        <View style={styles.typeRow}>
          {TX_TYPES.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeCard, txType === t.key && styles.typeCardActive]}
              onPress={() => { setTxType(t.key); setCategory(''); }}
              activeOpacity={0.75}
            >
              <Ionicons
                name={t.icon}
                size={22}
                color={txType === t.key ? theme.textAccent : theme.textMuted}
              />
              <Text style={[styles.typeLabel, txType === t.key && styles.typeLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Account ── */}
        <FieldLabel>Account</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollChips}>
          <View style={styles.chipRowInner}>
            {state.accounts.map(a => (
              <Chip key={a.id} label={a.name} selected={accountId === a.id} onPress={() => setAccountId(a.id)} />
            ))}
          </View>
        </ScrollView>

        {/* ── To Account (transfer) ── */}
        {txType === 'transfer' && (
          <>
            <FieldLabel>To Account</FieldLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollChips}>
              <View style={styles.chipRowInner}>
                {accsForTo.map(a => (
                  <Chip key={a.id} label={a.name} selected={toAccId === a.id} onPress={() => setToAccId(a.id)} />
                ))}
              </View>
            </ScrollView>
          </>
        )}

        {/* ── Category ── */}
        {txType !== 'transfer' && (
          <>
            <FieldLabel>Category</FieldLabel>
            <View style={styles.chipRow}>
              {cats.map(cat => (
                <Chip key={cat} label={cat} selected={category === cat} onPress={() => setCategory(cat)} />
              ))}
            </View>
          </>
        )}

        {/* ── Amount ── */}
        <FieldLabel>Amount</FieldLabel>
        <View style={styles.amountRow}>
          <Text style={styles.currencyPrefix}>
            {state.accounts.find(a => a.id === accountId)?.currency === 'PHP' ? '₱' :
             state.accounts.find(a => a.id === accountId)?.currency === 'USD' ? '$' :
             state.accounts.find(a => a.id === accountId)?.currency === 'BTC' ? '₿' : ''}
          </Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        {/* ── Note ── */}
        <FieldLabel>Note (optional)</FieldLabel>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="What was this for?"
          placeholderTextColor={theme.textMuted}
          returnKeyType="done"
        />

        {/* ── Buttons ── */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.btnGhostText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPrimaryText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* Helpers */
function FieldLabel({ children }) {
  return <Text style={fieldStyle}>{children}</Text>;
}
const fieldStyle = {
  fontSize: 12,
  color: '#52525b',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  marginTop: 14,
  marginBottom: 6,
};

function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[chipSt.chip, selected && chipSt.selected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[chipSt.text, selected && chipSt.textSel]}>{label}</Text>
    </TouchableOpacity>
  );
}
const chipSt = StyleSheet.create({
  chip: {
    paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 0.5,
    borderColor: theme.borderStrong,
    backgroundColor: theme.surface1,
    marginBottom: 6,
  },
  selected:  { backgroundColor: theme.bgAccent, borderColor: theme.borderAccent },
  text:      { fontSize: 13, fontWeight: '500', color: theme.textSecondary },
  textSel:   { color: theme.textAccent },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.surface0 },

  handleRow: { alignItems: 'center', paddingTop: 14, paddingBottom: 4 },
  handle:    { width: 36, height: 4, borderRadius: 2, backgroundColor: theme.borderStrong },

  scroll: { flex: 1, paddingHorizontal: 16 },
  title:  { fontSize: 18, fontWeight: '700', color: theme.textPrimary, marginTop: 8, marginBottom: 4, letterSpacing: -0.3 },

  /* Type cards */
  typeRow: { flexDirection: 'row', gap: 8 },
  typeCard: {
    flex: 1, paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 0.5, borderColor: theme.borderStrong,
    backgroundColor: theme.surface1,
    alignItems: 'center', gap: 4,
  },
  typeCardActive: { backgroundColor: theme.bgAccent, borderColor: theme.borderAccent },
  typeLabel:      { fontSize: 12, fontWeight: '500', color: theme.textMuted },
  typeLabelActive:{ color: theme.textAccent },

  scrollChips:  { flexGrow: 0, marginBottom: 2 },
  chipRowInner: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  /* Amount */
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: theme.borderStrong,
    backgroundColor: theme.surface1,
    overflow: 'hidden',
  },
  currencyPrefix: {
    fontSize: 18, fontWeight: '600',
    color: theme.textSecondary,
    paddingHorizontal: 12,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 11,
    paddingRight: 12,
    fontSize: 22,
    fontWeight: '600',
    color: theme.textPrimary,
    letterSpacing: -0.5,
  },

  /* Note input */
  input: {
    paddingVertical: 11, paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 0.5, borderColor: theme.borderStrong,
    backgroundColor: theme.surface1,
    color: theme.textPrimary, fontSize: 15,
  },

  /* Buttons */
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  btn:    { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnPrimary:     { backgroundColor: theme.fillAccent },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  btnGhost: {
    backgroundColor: theme.surface1,
    borderWidth: 0.5, borderColor: theme.borderStrong,
  },
  btnGhostText: { fontSize: 15, fontWeight: '600', color: theme.textSecondary },
});
