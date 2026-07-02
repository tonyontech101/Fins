import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fmt } from '../utils/helpers';
import { theme } from '../constants/theme';
import { INSTITUTIONS, renderInstitutionLogo } from '../constants/institutions';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

export default function AccountCard({ account, onPress, onMenuPress }) {
  const instId = account.institutionId || account.name.toLowerCase();
  const inst = INSTITUTIONS.find(i => i.id === instId) || INSTITUTIONS.find(i => i.id === 'other');
  const bgColor = inst.brandColor;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bgColor }]}
      activeOpacity={0.86}
      onPress={onPress}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
           {renderInstitutionLogo(instId, 28) || (
             <Ionicons name={account.icon || 'wallet-outline'} size={18} color="#fff" />
           )}
        </View>
        <TouchableOpacity
          onPress={onMenuPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.menuBtn}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>
      </View>

      {/* Card Name */}
      <View>
        <Text style={styles.cardName} numberOfLines={1}>{account.name}</Text>
        <Text style={styles.cardType}>{account.type || 'Bank'}</Text>
      </View>

      {/* Balance */}
      <View>
        <Text style={styles.cardBalLabel}>Balance</Text>
        <Text style={styles.cardBal} numberOfLines={1}>{fmt(account.balance, account.currency)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    minHeight: 130,
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  cardType: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  cardBalLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
  },
  cardBal: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    marginTop: 2,
  },
});
