import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme, CAT_COLORS, CAT_ICONS } from '../constants/theme';
import StatCard from '../components/StatCard';

export default function ReportsScreen() {
  const { state } = useApp();

  const expenseTxs = state.transactions.filter(t => t.type === 'expense');
  const incomeTxs  = state.transactions.filter(t => t.type === 'income');

  const totalIncome  = incomeTxs.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenseTxs.reduce((s, t) => s + t.amount, 0);
  const net          = totalIncome - totalExpense;

  // Group expense by category
  const cats = {};
  expenseTxs.forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
  const catTotal = Object.values(cats).reduce((s, v) => s + v, 0) || 1;
  const sortedCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reports</Text>
          <Text style={styles.headerSub}>Financial overview</Text>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statRow}>
          <StatCard
            label="Total Income"
            value={`+₱${totalIncome.toLocaleString()}`}
            valueColor={theme.textSuccess}
          />
          <StatCard
            label="Total Expenses"
            value={`−₱${totalExpense.toLocaleString()}`}
            valueColor={theme.textDanger}
          />
        </View>

        {/* Net Balance spanning full width */}
        <View style={[styles.statRow, { marginBottom: 20 }]}>
          <StatCard
            label="Net Balance"
            value={`${net >= 0 ? '+' : '−'}₱${Math.abs(net).toLocaleString()}`}
            valueColor={net >= 0 ? theme.textSuccess : theme.textDanger}
            fullWidth
          />
        </View>

        {/* ── Category breakdown ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expenses by Category</Text>

          {sortedCats.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={48} color={theme.textMuted} />
              <Text style={styles.emptyText}>No expense data yet</Text>
            </View>
          ) : (
            sortedCats.map(([cat, amt]) => {
              const pct   = ((amt / catTotal) * 100).toFixed(1);
              const color = CAT_COLORS[cat] || '#64748b';
              const icon  = CAT_ICONS[cat]  || 'ellipsis-horizontal';
              return (
                <View key={cat} style={styles.catItem}>
                  <View style={[styles.catIconBox, { backgroundColor: color + '1A' }]}>
                    <Ionicons name={icon} size={18} color={color} />
                  </View>
                  <View style={styles.catBody}>
                    <View style={styles.catTopRow}>
                      <Text style={styles.catName}>{cat}</Text>
                      <Text style={styles.catAmt}>₱{amt.toLocaleString()}</Text>
                    </View>
                    <View style={styles.progressBg}>
                      <View
                        style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]}
                      />
                    </View>
                    <Text style={styles.catPct}>{pct}%</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.surface0 },

  header: {
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 14,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', color: theme.textPrimary, letterSpacing: -0.6 },
  headerSub:   { fontSize: 13, color: theme.textMuted, marginTop: 2 },

  statRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, marginBottom: 12,
  },

  section:      { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: theme.textPrimary,
    marginBottom: 12, letterSpacing: -0.2,
  },

  catItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.border,
  },
  catIconBox: {
    width: 40, height: 40,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
  },
  catBody:   { flex: 1 },
  catTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catName:   { fontSize: 14, fontWeight: '500', color: theme.textPrimary },
  catAmt:    { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
  progressBg: {
    backgroundColor: theme.surface2,
    borderRadius: 8, height: 7, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 8 },
  catPct: { fontSize: 11, color: theme.textMuted, marginTop: 4 },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText:  { fontSize: 14, color: theme.textMuted },
});
