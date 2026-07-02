import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme, CAT_COLORS, CAT_ICONS } from '../constants/theme';
import TransactionItem from '../components/TransactionItem';
import StatCard from '../components/StatCard';

const FILTERS = [
  { key: 'All',      label: 'All' },
  { key: 'income',   label: 'Income' },
  { key: 'expense',  label: 'Expense' },
  { key: 'transfer', label: 'Transfer' },
];

export default function TransactionsScreen({ navigation }) {
  const { state } = useApp();
  const [filter, setFilter] = useState('All');

  const filtered = [...state.transactions]
    .filter(t => filter === 'All' || t.type === filter)
    .reverse();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Transactions</Text>
            <Text style={styles.headerSub}>{filtered.length} records</Text>
          </View>
        </View>

        {/* ── Filter chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── List ── */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={48} color={theme.textMuted} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {filtered.map(tx => (
              <TransactionItem key={tx.id} tx={tx} accounts={state.accounts} />
            ))}
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          if (state.accounts.length === 0) {
            Alert.alert(
              'No Account Found',
              'Please add an account before recording a transaction.',
              [{ text: 'Add Account', onPress: () => navigation.navigate('AddAccount', {}) }, { text: 'Cancel', style: 'cancel' }]
            );
          } else {
            navigation.navigate('AddTransaction', {});
          }
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.surface0 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', color: theme.textPrimary, letterSpacing: -0.6 },
  headerSub:   { fontSize: 13, color: theme.textMuted, marginTop: 2 },

  filterScroll:  { flexGrow: 0, marginBottom: 4 },
  filterContent: { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },

  filterChip: {
    paddingVertical: 7, paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 0.5, borderColor: theme.border,
    backgroundColor: theme.surface1,
  },
  filterChipActive: { backgroundColor: theme.bgAccent, borderColor: theme.borderAccent },
  filterChipText:       { fontSize: 13, fontWeight: '500', color: theme.textSecondary },
  filterChipTextActive: { color: theme.textAccent },

  txList: { paddingHorizontal: 16, marginTop: 8 },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText:  { fontSize: 14, color: theme.textMuted },

  fab: {
    position: 'absolute', bottom: 88, right: 16,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: theme.fillAccent,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: theme.fillAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10,
  },
});
