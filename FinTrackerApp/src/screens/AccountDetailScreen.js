import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from '../constants/theme';
import { INSTITUTIONS, renderInstitutionLogo } from '../constants/institutions';
import TransactionItem from '../components/TransactionItem';
import StatCard from '../components/StatCard';

export default function AccountDetailScreen({ navigation, route }) {
  const { state } = useApp();
  const { accountId } = route.params;
  const acc = state.accounts.find(a => a.id === accountId);

  if (!acc) {
    navigation.goBack();
    return null;
  }

  const instId = acc.institutionId || acc.name.toLowerCase();
  const inst = INSTITUTIONS.find(i => i.id === instId) || INSTITUTIONS.find(i => i.id === 'other');
  const bgColor = inst.brandColor;
  
  const txs = state.transactions.filter(
    t => t.accountId === accountId || t.toAccountId === accountId
  );
  const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const sorted  = [...txs].reverse();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{acc.name}</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddAccount', { account: acc })}
          >
            <Ionicons name="create-outline" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Detail Card ── */}
        <View style={[styles.detailCard, { backgroundColor: bgColor }]}>
          <View style={styles.detailCardHeader}>
            <View>
              <Text style={styles.detailType}>{acc.type || 'Bank'}</Text>
              <Text style={styles.detailName}>{acc.name}</Text>
            </View>
            <View style={styles.detailLogoBox}>
              {renderInstitutionLogo(instId, 40)}
            </View>
          </View>
          <View>
            <Text style={styles.detailBalLabel}>Balance</Text>
            <Text style={styles.detailBal}>{fmt(acc.balance, acc.currency)}</Text>
          </View>
        </View>

        {/* ── Stat Row ── */}
        <View style={styles.statRow}>
          <StatCard
            label="Income"
            value={`+${fmt(income, acc.currency)}`}
            valueColor={theme.textSuccess}
          />
          <StatCard
            label="Expenses"
            value={`−${fmt(expense, acc.currency)}`}
            valueColor={theme.textDanger}
          />
        </View>

        {/* ── Transactions ── */}
        <Text style={styles.sectionTitle}>Transactions</Text>

        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={48} color={theme.textMuted} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {sorted.map(tx => (
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
        onPress={() => navigation.navigate('AddTransaction', {})}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.surface0 },

  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: theme.surface1,
    borderWidth: 0.5, borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17, fontWeight: '600',
    color: theme.textPrimary, letterSpacing: -0.3,
  },
  iconBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: theme.surface1,
    borderWidth: 0.5, borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Detail Card */
  detailCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 20,
    minHeight: 150,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLogoBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailType: {
    fontSize: 12, color: 'rgba(255,255,255,0.72)',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  detailName: {
    fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 4,
  },
  detailBalLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20,
  },
  detailBal: {
    fontSize: 32, fontWeight: '700', color: '#fff', letterSpacing: -1, marginTop: 2,
  },

  /* Stats */
  statRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, marginBottom: 16,
  },

  /* Transactions */
  sectionTitle: {
    fontSize: 16, fontWeight: '600',
    color: theme.textPrimary,
    paddingHorizontal: 16, paddingBottom: 10, letterSpacing: -0.2,
  },
  txList: { paddingHorizontal: 16 },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText:  { fontSize: 14, color: theme.textMuted },

  /* FAB */
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
