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

export default function HistoryScreen() {
  const theme = useTheme();
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
        const notes = item.notes.toLowerCase().includes(query);
        
        return entryPrice || exitPrice || quantity || date || notes;
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
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyItemHeader}>
          <View style={styles.historyItemDate}>
            <IconButton icon="calendar" size={16} style={styles.historyIcon} />
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
          <IconButton
            icon="delete-outline"
            size={20}
            onPress={() => handleDeleteItem(item.id)}
          />
        </View>
        
        <View style={styles.historyItemDetails}>
          {item.notes ? (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          ) : null}
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Currency Pair</Text>
              <Text style={styles.detailValue}>EUR/USD</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lot Size</Text>
              <Text style={styles.detailValue}>{item.quantity} {item.quantity === 1 ? 'lot' : 'lots'}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Pip Value</Text>
              <Text style={styles.detailValue}>${(item.quantity * 10).toFixed(2)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Value</Text>
              <Text style={styles.detailValue}>${(item.quantity * 10 * 10).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Calculation History</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <Searchbar
        placeholder="Search history"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor="#5B7FFF"
      />
      
      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <IconButton
            icon="history"
            size={48}
            color="#CCCCCC"
          />
          <Text style={styles.emptyText}>
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
    backgroundColor: '#F5F7FA',
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
    fontWeight: '600',
  },
  searchBar: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyItemDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    margin: 0,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  historyItemDetails: {
    padding: 16,
  },
  notesContainer: {
    backgroundColor: '#EEF3FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});
