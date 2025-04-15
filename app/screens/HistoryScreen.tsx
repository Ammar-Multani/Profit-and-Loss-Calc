import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Divider, 
  IconButton, 
  useTheme as usePaperTheme,
  Searchbar,
  Button,
  ActivityIndicator,
  Dialog,
  Portal
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { getCalculationHistory, deleteCalculation, clearCalculationHistory, getSettings } from '../utils/storage';
import { formatCurrency, formatPercentage } from '../utils/calculations';
import { HistoryItem } from '../types';
import { useTheme as useAppTheme } from '../context/ThemeContext';

export default function HistoryScreen() {
  const paperTheme = usePaperTheme();
  const { isDarkMode } = useAppTheme();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [enableHaptics, setEnableHaptics] = useState(true);
  const [clearDialogVisible, setClearDialogVisible] = useState(false);
  
  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        setLoading(true);
        const settings = await getSettings();
        setEnableHaptics(settings.enableHapticFeedback);
        
        const historyData = await getCalculationHistory();
        setHistory(historyData);
        setFilteredHistory(historyData);
        setLoading(false);
      };
      
      loadHistory();
    }, [])
  );
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredHistory(history);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = history.filter(item => {
      const entryPrice = item.entryPrice.toString();
      const exitPrice = item.exitPrice.toString();
      const quantity = item.quantity.toString();
      const profitLoss = item.result.netProfitLoss.toString();
      const notes = item.notes.toLowerCase();
      const date = new Date(item.timestamp).toLocaleDateString();
      
      return (
        entryPrice.includes(query) ||
        exitPrice.includes(query) ||
        quantity.includes(query) ||
        profitLoss.includes(query) ||
        notes.includes(query) ||
        date.includes(query)
      );
    });
    
    setFilteredHistory(filtered);
  }, [searchQuery, history]);
  
  const handleDelete = (id: string) => {
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
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCalculation(id);
              
              if (enableHaptics) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              
              const updatedHistory = history.filter(item => item.id !== id);
              setHistory(updatedHistory);
              setFilteredHistory(
                searchQuery ? 
                  updatedHistory.filter(item => 
                    item.notes.toLowerCase().includes(searchQuery.toLowerCase())
                  ) : 
                  updatedHistory
              );
            } catch (error) {
              console.error('Error deleting calculation:', error);
              Alert.alert('Error', 'Failed to delete calculation');
            }
          },
        },
      ]
    );
  };
  
  const handleClearAll = async () => {
    setClearDialogVisible(false);
    
    try {
      await clearCalculationHistory();
      
      if (enableHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setHistory([]);
      setFilteredHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
      Alert.alert('Error', 'Failed to clear history');
    }
  };
  
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const isProfitable = item.result.netProfitLoss > 0;
    const profitLossColor = isProfitable ? paperTheme.colors.primary : paperTheme.colors.error;
    const date = new Date(item.timestamp).toLocaleDateString();
    const time = new Date(item.timestamp).toLocaleTimeString();
    
    return (
      <Card style={styles.historyCard}>
        <Card.Content>
          <View style={styles.historyHeader}>
            <View>
              <Text variant="titleMedium">
                {formatCurrency(item.entryPrice)} → {formatCurrency(item.exitPrice)}
              </Text>
              <Text variant="bodySmall">{date} at {time}</Text>
            </View>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDelete(item.id)}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.historyDetails}>
            <View style={styles.detailRow}>
              <Text variant="bodyMedium">Quantity:</Text>
              <Text variant="bodyMedium">{item.quantity}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium">P/L:</Text>
              <Text 
                variant="bodyMedium" 
                style={{ color: profitLossColor, fontWeight: 'bold' }}
              >
                {formatCurrency(item.result.netProfitLoss)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium">ROI:</Text>
              <Text 
                variant="bodyMedium" 
                style={{ color: profitLossColor, fontWeight: 'bold' }}
              >
                {formatPercentage(item.result.profitLossPercentage)}
              </Text>
            </View>
          </View>
          
          {item.notes && (
            <>
              <Divider style={styles.divider} />
              <Text variant="bodySmall" style={styles.notes}>
                {item.notes}
              </Text>
            </>
          )}
        </Card.Content>
      </Card>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: paperTheme.colors.background }]} edges={['bottom']}>
      <Searchbar
        placeholder="Search history..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: paperTheme.colors.surface }]}
        iconColor={paperTheme.colors.onSurface}
        inputStyle={{ color: paperTheme.colors.onSurface }}
        placeholderTextColor={paperTheme.colors.onSurfaceVariant}
      />
      
      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      ) : filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          style={{ backgroundColor: paperTheme.colors.background }}
        />
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: paperTheme.colors.background }]}>
          <Text style={{ color: paperTheme.colors.onBackground }} variant="bodyLarge">
            No calculations found
          </Text>
          <Text 
            style={[styles.emptySubtext, { color: paperTheme.colors.onBackgroundVariant }]} 
            variant="bodyMedium"
          >
            {searchQuery ? 'Try a different search term' : 'Your calculation history will appear here'}
          </Text>
        </View>
      )}
      
      {history.length > 0 && (
        <Button 
          mode="contained-tonal" 
          onPress={() => setClearDialogVisible(true)}
          style={styles.clearButton}
        >
          Clear All History
        </Button>
      )}
      
      <Portal>
        <Dialog visible={clearDialogVisible} onDismiss={() => setClearDialogVisible(false)}>
          <Dialog.Title>Clear History</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to clear all calculation history? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleClearAll}>Clear All</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  historyCard: {
    marginBottom: 16,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  historyDetails: {
    marginVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  notes: {
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptySubtext: {
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  clearButton: {
    margin: 16,
  },
});
