import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export default function StatCard({ label, value, valueColor, fullWidth = false }) {
  return (
    <View style={[styles.card, fullWidth && styles.fullWidth]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor || theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.surface1,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: theme.border,
  },
  fullWidth: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 5,
    letterSpacing: -0.5,
  },
});
