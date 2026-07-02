import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fmt, formatDate } from '../utils/helpers';
import { theme, CAT_COLORS, CAT_ICONS } from '../constants/theme';

export default function TransactionItem({ tx, accounts }) {
  const acc = accounts.find(a => a.id === tx.accountId);
  const toAcc = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId) : null;

  const sign =
    tx.type === 'income' ? '+' :
    tx.type === 'expense' ? '−' : '↔';

  const amountColor =
    tx.type === 'income'   ? theme.textSuccess :
    tx.type === 'expense'  ? theme.textDanger :
    theme.textAccent;

  const iconBg =
    tx.type === 'income'   ? theme.bgSuccess :
    tx.type === 'expense'  ? theme.bgDanger :
    theme.bgAccent;

  const iconColor =
    tx.type === 'income'   ? theme.textSuccess :
    tx.type === 'expense'  ? theme.textDanger :
    theme.textAccent;

  const iconName =
    tx.type === 'transfer' ? 'swap-horizontal' :
    tx.type === 'income'   ? 'trending-up' :
    (CAT_ICONS[tx.category] || 'card');

  const subLabel = toAcc
    ? `${acc?.name ?? ''} → ${toAcc.name}`
    : `${acc?.name ?? ''} · ${formatDate(tx.date)}`;

  return (
    <View style={styles.item}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={19} color={iconColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {tx.note || tx.category || 'Transfer'}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>{subLabel}</Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {sign}{fmt(tx.amount, acc?.currency ?? 'PHP')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
    letterSpacing: -0.1,
  },
  sub: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 0,
    letterSpacing: -0.2,
  },
});
