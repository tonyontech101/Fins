import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider } from '../context/AppContext';
import { theme } from '../constants/theme';

import HomeScreen            from '../screens/HomeScreen';
import TransactionsScreen    from '../screens/TransactionsScreen';
import ReportsScreen         from '../screens/ReportsScreen';
import SettingsScreen        from '../screens/SettingsScreen';
import AccountDetailScreen   from '../screens/AccountDetailScreen';
import AddAccountScreen      from '../screens/AddAccountScreen';
import AddTransactionScreen  from '../screens/AddTransactionScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_CONFIG = [
  { name: 'HomeTab',         component: HomeScreen,         label: 'Home',         icon: 'home',         iconO: 'home-outline'         },
  { name: 'TransactionsTab', component: TransactionsScreen, label: 'Transactions', icon: 'list',         iconO: 'list-outline'         },
  { name: 'ReportsTab',      component: ReportsScreen,      label: 'Reports',      icon: 'pie-chart',    iconO: 'pie-chart-outline'    },
  { name: 'SettingsTab',     component: SettingsScreen,     label: 'Settings',     icon: 'settings',     iconO: 'settings-outline'     },
];

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const cfg = TAB_CONFIG.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: tabStyles.bar,
          tabBarLabelStyle: tabStyles.label,
          tabBarActiveTintColor: theme.textAccent,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? cfg.icon : cfg.iconO}
              size={23}
              color={focused ? theme.textAccent : theme.textMuted}
            />
          ),
        };
      }}
    >
      {TAB_CONFIG.map(cfg => (
        <Tab.Screen key={cfg.name} name={cfg.name} component={cfg.component} options={{ tabBarLabel: cfg.label }} />
      ))}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider style={styles.appRoot}>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={HomeTabs} />
            <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
            <Stack.Screen
              name="AddAccount"
              component={AddAccountScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{ presentation: 'modal' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: theme.surface2,
    borderTopWidth: 0.5,
    borderTopColor: theme.border,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: theme.surface0,
  },
});
