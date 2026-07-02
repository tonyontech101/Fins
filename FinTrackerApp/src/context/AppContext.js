import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  initDB,
  dbGetAccounts,
  dbGetTransactions,
  dbDeleteAccount,
  dbSaveTransactionState,
  dbUpsertAccount,
  dbClearAll,
} from '../utils/database';

const initialState = {
  accounts: [],
  transactions: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { accounts: action.accounts, transactions: action.transactions };

    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };

    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(a => a.id === action.payload.id ? action.payload : a),
      };

    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(a => a.id !== action.payload),
        transactions: state.transactions.filter(
          t => t.accountId !== action.payload && t.toAccountId !== action.payload
        ),
      };

    case 'ADD_TRANSACTION':
      return applyTransaction(state, action.payload);

    case 'CLEAR_ALL':
      return { accounts: [], transactions: [] };

    default:
      return state;
  }
}

function applyTransaction(state, tx) {
  const updatedAt = Date.now();
  const newState = { ...state, accounts: [...state.accounts] };
  const accIdx = newState.accounts.findIndex(a => a.id === tx.accountId);

  if (accIdx > -1) {
    const acc = { ...newState.accounts[accIdx], updatedAt };

    if (tx.type === 'expense') {
      acc.balance = Math.max(0, acc.balance - tx.amount);
    } else if (tx.type === 'income') {
      acc.balance += tx.amount;
    } else if (tx.type === 'transfer') {
      acc.balance = Math.max(0, acc.balance - tx.amount);
      const toIdx = newState.accounts.findIndex(a => a.id === tx.toAccountId);

      if (toIdx > -1) {
        newState.accounts[toIdx] = {
          ...newState.accounts[toIdx],
          balance: newState.accounts[toIdx].balance + tx.amount,
          updatedAt,
        };
      }
    }

    newState.accounts[accIdx] = acc;
  }

  return { ...newState, transactions: [...state.transactions, tx] };
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, baseDispatch] = useReducer(reducer, initialState);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initDB();
        const accounts = await dbGetAccounts();
        const transactions = await dbGetTransactions();

        if (!mounted) return;
        baseDispatch({ type: 'LOAD', accounts, transactions });
        setDbReady(true);
      } catch (error) {
        console.error('SQLite startup failed', error);
        if (mounted) setDbError(error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function dispatch(action) {
    if (!dbReady && action.type !== 'LOAD') return;

    if (action.type === 'ADD_ACCOUNT' || action.type === 'UPDATE_ACCOUNT') {
      await dbUpsertAccount(action.payload);
      baseDispatch(action);
      return;
    }

    if (action.type === 'DELETE_ACCOUNT') {
      await dbDeleteAccount(action.payload);
      baseDispatch(action);
      return;
    }

    if (action.type === 'ADD_TRANSACTION') {
      const nextState = applyTransaction(state, action.payload);
      await dbSaveTransactionState(action.payload, nextState.accounts);
      baseDispatch(action);
      return;
    }

    if (action.type === 'CLEAR_ALL') {
      await dbClearAll();
      baseDispatch(action);
      return;
    }

    baseDispatch(action);
  }

  if (dbError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Database failed to start</Text>
        <Text style={styles.message}>{String(dbError?.message ?? dbError)}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading your wallet...</Text>
      </View>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch, dbReady }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    marginBottom: 8,
    color: '#0f0f10',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: '#52525b',
    fontSize: 14,
    textAlign: 'center',
  },
});
