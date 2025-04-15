import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { 
  Text, 
  IconButton, 
  useTheme, 
  Searchbar,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { getCalculationHistory, deleteCalculation } from '../utils/storage';
import { HistoryItem } from '../types';
import { useTheme } from '../context/ThemeContext';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  
  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
      return () => {};
    }, [])
  );
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHistory(history);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = history.filter(item => {
        const entryPrice = item.entryPrice.toString().includes(query);
        const exitPrice = item.exitPrice.toString().includes(query);
        const quantity = item.quantity.toString().includes(query);
        const date = new Date(item.timestamp).toLocaleDateString().toLowerCase().includes(query);
        const profit = item.result.netProfitLoss.toString().includes(query);
        
        return entryPrice || exitPrice || quantity || date || profit;
      });
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history]);
  
  const loadHistory = async () => {
    const calculationHistory = await getCalculationHistory();
    setHistory(calculationHistory);
    setFilteredHistory(calculationHistory);
  };
  
  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Calculation',
      'Are you sure you want to delete this calculation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            await deleteCalculation(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadHistory();
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const isProfitable = item.result.netProfitLoss > 0;
    
    return (
      <View style={[styles.historyItem, { backgroundColor: colors.surface }]}>
        <View style={styles.historyItemHeader}>
          <Text style={[styles.historyItemDate, { color: colors.textSecondary }]}>
            {formatDate(item.timestamp)}
          </Text>
          <IconButton
            icon="delete-outline"
            size={20}
            iconColor={colors.icon}
            onPress={() => handleDeleteItem(item.id)}
          />
        </View>
        
        <View style={styles.historyItemDetails}>
          <View style={styles.historyItemRow}>
            <Text style={[styles.historyItemLabel, { color: colors.textSecondary }]}>Entry Price:</Text>
            <Text style={[styles.historyItemValue, { color: colors.text }]}>
              {formatCurrency(item.entryPrice)}
            </Text>
          </View>
          
          <View style={styles.historyItemRow}>
            <Text style={[styles.historyItemLabel, { color: colors.textSecondary }]}>Exit Price:</Text>
            <Text style={[styles.historyItemValue, { color: colors.text }]}>
              {formatCurrency(item.exitPrice)}
            </Text>
          </View>
          
          <View style={styles.historyItemRow}>
            <Text style={[styles.historyItemLabel, { color: colors.textSecondary }]}>Quantity:</Text>
            <Text style={[styles.historyItemValue, { color: colors.text }]}>
              {item.quantity}
            </Text>
          </View>
          
          <Divider style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          
          <View style={styles.historyItemRow}>
            <Text style={[styles.historyItemLabel, { color: colors.textSecondary }]}>Net Profit/Loss:</Text>
            <Text style={[
              styles.historyItemValue,
              {color: isProfitable ? colors.success : colors.error}
            ]}>
              {formatCurrency(item.result.netProfitLoss)}
            </Text>
          </View>
          
          <View style={styles.historyItemRow}>
            <Text style={[styles.historyItemLabel, { color: colors.textSecondary }]}>Return:</Text>
            <Text style={[
              styles.historyItemValue,
              {color: isProfitable ? colors.success : colors.error}
            ]}>
              {formatPercentage(item.result.profitLossPercentage)}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: colors.surface, 
        borderBottomColor: colors.border 
      }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.icon}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Calculation History</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <Searchbar
        placeholder="Search history"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: colors.surface }]}
        iconColor={colors.icon}
        placeholderTextColor={colors.placeholder}
        inputStyle={{ color: colors.text }}
      />
      
      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {history.length > 0 
              ? 'No results found for your search.' 
              : 'No calculation history yet.'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyItemDate: {
    fontSize: 14,
    color: '#757575',
  },
  historyItemDetails: {
    marginTop: 8,
  },
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  historyItemLabel: {
    fontSize: 14,
    color: '#757575',
  },
  historyItemValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  divider: {
    marginVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});
