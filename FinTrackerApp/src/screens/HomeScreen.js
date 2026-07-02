import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Dimensions, Modal, Pressable, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { fmt, totalPhp, formatTime } from '../utils/helpers';
import { theme } from '../constants/theme';
import AccountCard from '../components/AccountCard';
import TransactionItem from '../components/TransactionItem';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { state } = useApp();
  const [fabOpen, setFabOpen] = useState(false);

  const total = totalPhp(state.accounts);
  const recentTxs = [...state.transactions].reverse().slice(0, 6);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Wallet</Text>
            <Text style={styles.headerSub}>Overview of your accounts</Text>
          </View>
        </View>

        {/* ── Total Balance ── */}
        <View style={styles.totalBar}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <Text style={styles.totalAmount}>
            ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.totalSub}>
            Last updated: Today, {formatTime(Date.now())}
          </Text>
        </View>

        {/* ── Account Cards Grid ── */}
        {state.accounts.length === 0 ? (
          <View style={styles.emptyAccounts}>
            <Ionicons name="wallet-outline" size={48} color={theme.textMuted} />
            <Text style={styles.emptyText}>No accounts yet</Text>
            <TouchableOpacity style={styles.addAccountBtn} onPress={() => navigation.navigate('AddAccount', {})}>
              <Text style={styles.addAccountBtnText}>Add your first account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {state.accounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onPress={() => navigation.navigate('AccountDetail', { accountId: account.id })}
                onMenuPress={() => navigation.navigate('AddAccount', { account })}
              />
            ))}
          </View>
        )}

        {/* ── Recent Transactions ── */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {recentTxs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={48} color={theme.textMuted} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {recentTxs.map(tx => (
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
        onPress={() => setFabOpen(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ── FAB Action Sheet Modal ── */}
      <Modal visible={fabOpen} transparent animationType="fade">
        <Pressable style={styles.fabOverlay} onPress={() => setFabOpen(false)}>
          <View style={styles.fabSheet}>
            <View style={styles.fabHandle} />
            <Text style={styles.fabTitle}>Create New</Text>

            <TouchableOpacity 
              style={styles.fabItem} 
              activeOpacity={0.7}
              onPress={() => {
                setFabOpen(false);
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
              <View style={[styles.fabIconBox, { backgroundColor: theme.bgAccent }]}>
                <Ionicons name="swap-horizontal" size={20} color={theme.textAccent} />
              </View>
              <View>
                <Text style={styles.fabItemTitle}>Transaction</Text>
                <Text style={styles.fabItemSub}>Record income, expense, or transfer</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.fabItem} 
              activeOpacity={0.7}
              onPress={() => { setFabOpen(false); navigation.navigate('AddAccount', {}); }}
            >
              <View style={[styles.fabIconBox, { backgroundColor: theme.bgSuccess }]}>
                <Ionicons name="wallet-outline" size={20} color={theme.textSuccess} />
              </View>
              <View>
                <Text style={styles.fabItemTitle}>Account</Text>
                <Text style={styles.fabItemSub}>Add a new wallet, bank, or card</Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: theme.surface0 },
  scroll:    { flex: 1 },
  content:   { flexGrow: 1 },

  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.textPrimary,
    letterSpacing: -0.6,
  },
  headerSub: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },

  /* Total bar */
  totalBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e3a4a',
    borderRadius: 16,
    padding: 18,
  },
  totalLabel:  { fontSize: 12, color: '#1e9fdb', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  totalAmount: { fontSize: 32, fontWeight: '700', letterSpacing: -1.5, color: '#ffffff' },
  totalSub:    { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 },

  /* Card grid */
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },

  /* Section */
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    paddingHorizontal: 16,
    paddingBottom: 10,
    letterSpacing: -0.2,
  },
  txList: { paddingHorizontal: 16 },

  /* Empty States */
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyAccounts: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText:  { fontSize: 14, color: theme.textMuted },
  
  addAccountBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: theme.surface1,
    borderWidth: 1,
    borderColor: theme.borderAccent,
  },
  addAccountBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textAccent,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 88,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.fillAccent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: theme.fillAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },

  /* FAB Action Sheet Modal */
  fabOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  fabSheet: {
    backgroundColor: theme.surface0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 12,
  },
  fabHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.borderStrong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  fabTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  fabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.border,
  },
  fabIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  fabItemSub: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },
});
