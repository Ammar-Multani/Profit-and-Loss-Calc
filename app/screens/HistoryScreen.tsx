import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { 
  Text, 
  IconButton, 
  Searchbar,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

import { getCalculationHistory, deleteCalculation } from '../utils/storage';
import { HistoryItem } from '../types';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';

export default function HistoryScreen() {
  const { colors, isDarkMode, spacing, roundness } = useTheme();
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
        const profit = item.result?.netProfitLoss?.toString().includes(query);
        
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
  
  const renderHistoryItem = ({ item, index }: { item: HistoryItem; index: number }) => {
    const isProfitable = item.result?.netProfitLoss > 0;
    
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: index * 100 }}
        style={styles.historyItemContainer}
      >
        <Card elevation="sm">
          <View style={styles.historyItemHeader}>
            <View style={styles.historyItemDateContainer}>
              <IconButton
                icon="calendar"
                size={16}
                iconColor={colors.primary}
                style={styles.calendarIcon}
              />
              <Text style={[styles.historyItemDate, { color: colors.textSecondary }]}>
                {formatDate(item.timestamp)}
              </Text>
            </View>
            <View style={styles.historyItemActions}>
              <IconButton
                icon="content-copy"
                size={18}
                iconColor={colors.textSecondary}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.actionIcon}
              />
              <IconButton
                icon="delete-outline"
                size={18}
                iconColor={colors.textSecondary}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleDeleteItem(item.id);
                }}
                style={styles.actionIcon}
              />
            </View>
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
                {formatCurrency(item.result?.netProfitLoss || 0)}
              </Text>
            </View>
            
            <View style={styles.historyItemRow}>
              <Text style={[styles.historyItemLabel, { color: colors.textSecondary }]}>Return:</Text>
              <Text style={[
                styles.historyItemValue,
                {color: isProfitable ? colors.success : colors.error}
              ]}>
                {formatPercentage(item.result?.profitLossPercentage || 0)}
              </Text>
            </View>
          </View>
          
          <View style={styles.profitIndicatorContainer}>
            <LinearGradient
              colors={isProfitable ? colors.gradient.success : colors.gradient.error}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.profitIndicator,
                { borderRadius: roundness.full }
              ]}
            />
          </View>
        </Card>
      </MotiView>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <MotiView
          from={{ opacity: 0, translateX: -10 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={colors.primary}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            style={styles.backButton}
          />
        </MotiView>
        
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 100 }}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>History</Text>
        </MotiView>
        
        <View style={{ width: 40 }} />
      </View>
      
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 200 }}
        style={styles.searchBarContainer}
      >
        <Searchbar
          placeholder="Search history"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { 
            backgroundColor: colors.surface,
            borderColor: colors.borderLight,
          }]}
          iconColor={colors.primary}
          placeholderTextColor={colors.placeholder}
          inputStyle={{ color: colors.text }}
        />
      </MotiView>
      
      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 300 }}
          style={styles.emptyContainer}
        >
          <IconButton
            icon={history.length > 0 ? "magnify-close" : "history"}
            size={48}
            iconColor={colors.textTertiary}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {history.length > 0 
              ? 'No results found for your search.' 
              : 'No calculation history yet.'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            {history.length > 0 
              ? 'Try a different search term.' 
              : 'Your saved calculations will appear here.'}
          </Text>
        </MotiView>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    borderWidth: 1,
    elevation: 0,
    borderRadius: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  historyItemContainer: {
    marginBottom: 16,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyItemDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    margin: 0,
    marginRight: -4,
  },
  historyItemDate: {
    fontSize: 14,
  },
  historyItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    margin: 0,
  },
  historyItemDetails: {
    marginTop: 8,
  },
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  historyItemLabel: {
    fontSize: 14,
  },
  historyItemValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 8,
  },
  profitIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  profitIndicator: {
    width: 4,
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
});
