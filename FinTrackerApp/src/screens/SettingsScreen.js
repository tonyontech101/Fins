import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from '../constants/theme';

const SETTINGS = [
  {
    icon: 'cash-outline',
    iconBg: '#2563eb18', iconColor: '#2563eb',
    label: 'Currency settings',
    sub: 'PHP · USD · BTC',
  },
  {
    icon: 'trash-outline',
    iconBg: '#dc262618', iconColor: '#dc2626',
    label: 'Clear all data',
    sub: 'Irreversible action',
  },
];

export default function SettingsScreen() {
  const { dispatch } = useApp();

  function onPress(label) {
    if (label === 'Clear all data') {
      Alert.alert(
        'Clear All Data',
        'This will permanently delete all accounts and transactions.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear', style: 'destructive',
            onPress: async () => dispatch({ type: 'CLEAR_ALL' }),
          },
        ]
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>App preferences</Text>
        </View>

        {/* ── Section Label ── */}
        <Text style={styles.sectionLabel}>General</Text>

        {/* ── Items ── */}
        <View style={styles.listCard}>
          {SETTINGS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.settingItem,
                idx < SETTINGS.length - 1 && styles.settingItemBorder,
              ]}
              onPress={() => onPress(item.label)}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIconBox, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={20} color={item.iconColor} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
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

  sectionLabel: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 12, fontWeight: '600',
    color: theme.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  listCard: {
    marginHorizontal: 16,
    backgroundColor: theme.surface1,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: theme.border,
    overflow: 'hidden',
  },

  settingItem: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 13, paddingHorizontal: 14,
  },
  settingItemBorder: {
    borderBottomWidth: 0.5, borderBottomColor: theme.border,
  },
  settingIconBox: {
    width: 36, height: 36,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: theme.textPrimary },
  settingSub:   { fontSize: 12, color: theme.textMuted, marginTop: 1 },
});
