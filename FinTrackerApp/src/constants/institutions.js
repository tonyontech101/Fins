import BdoLogo from '../../assets/logos/BDO_Unibank_idSAwwVGmk_0.svg';
import GcashLogo from '../../assets/logos/GCash_idOP67IR4D_0.svg';
import PaypalLogo from '../../assets/logos/paypal-4.svg';
import React from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const INSTITUTIONS = [
  { id: 'bdo', name: 'BDO', LogoComponent: BdoLogo, type: 'Bank', brandColor: '#0b2972' },
  { id: 'gcash', name: 'GCash', LogoComponent: GcashLogo, type: 'E-Wallet', brandColor: '#007CFF' },
  { id: 'maya', name: 'Maya', imageSource: require('../../assets/logos/Maya.jpeg'), type: 'E-Wallet', brandColor: '#0f172a' },
  { id: 'paypal', name: 'PayPal', LogoComponent: PaypalLogo, type: 'E-Wallet', brandColor: '#003087' },
  { id: 'other', name: 'Other', type: 'Other', icon: 'wallet-outline', brandColor: '#64748b' } // fallback
];

export function renderInstitutionLogo(id, size = 40) {
  const inst = INSTITUTIONS.find(i => i.id === id);
  if (!inst) return null;
  
  if (inst.LogoComponent) {
    const Logo = inst.LogoComponent;
    return <Logo width={size} height={size} />;
  }

  if (inst.imageSource) {
    return <Image source={inst.imageSource} style={{ width: size, height: size, borderRadius: size/2 }} resizeMode="contain" />;
  }
  
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', borderRadius: size/2 }}>
      <Ionicons name={inst.icon || 'wallet-outline'} size={size * 0.6} color="#64748b" />
    </View>
  );
}
