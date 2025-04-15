import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Text, IconButton, Divider, Button, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";

import { calculateResults } from "../utils/calculations";
import { saveCalculation, getSettings } from "../utils/storage";
import { TradeCalculation } from "../types";
import { useTheme } from "../context/ThemeContext";
import ResultsChart from "../components/ResultsChart";
import CircularProgressDisplay from "../components/CircularProgressDisplay";
import { generateUUID } from "../utils/uuid-helpers";

interface ResultsType {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossProfitMargin: number;
  totalExpenses: number;
  operatingProfit: number;
  taxAmount: number;
  netProfit: number;
  netProfitMargin: number;
  investment: number;
  roi: number;
  breakEvenUnits: number;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [units, setUnits] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [operatingExpenses, setOperatingExpenses] = useState("0");
  const [buyingExpensesPerUnit, setBuyingExpensesPerUnit] = useState("0");
  const [sellingExpensesPerUnit, setSellingExpensesPerUnit] = useState("0");
  const [taxRate, setTaxRate] = useState("0");

  const [calculatorMode, setCalculatorMode] = useState("standard");
  const [results, setResults] = useState<ResultsType | null>(null);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const loadCalculatorMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem("calculatorMode");
        if (savedMode) {
          setCalculatorMode(savedMode);
          if (savedMode === "advanced" || savedMode === "professional") {
            setShowAdvanced(true);
          }
        }
      } catch (error) {
        console.error("Failed to load calculator mode:", error);
      }
    };

    loadCalculatorMode();
  }, []);

  useEffect(() => {
    if (buyingPrice && sellingPrice && units) {
      calculateAndUpdateResults();
    }
  }, [
    buyingPrice,
    sellingPrice,
    units,
    operatingExpenses,
    buyingExpensesPerUnit,
    sellingExpensesPerUnit,
    taxRate,
  ]);

  const calculateAndUpdateResults = () => {
    const buyPrice = parseFloat(buyingPrice) || 0;
    const sellPrice = parseFloat(sellingPrice) || 0;
    const quantity = parseFloat(units) || 0;
    const opExpenses = parseFloat(operatingExpenses) || 0;
    const buyExpenses = parseFloat(buyingExpensesPerUnit) || 0;
    const sellExpenses = parseFloat(sellingExpensesPerUnit) || 0;
    const tax = parseFloat(taxRate) || 0;

    const revenue = sellPrice * quantity;
    const costOfGoodsSold = buyPrice * quantity + buyExpenses * quantity;
    const grossProfit = revenue - costOfGoodsSold;
    const grossProfitMargin = (grossProfit / revenue) * 100;
    const totalExpenses = opExpenses + sellExpenses * quantity;
    const operatingProfit = grossProfit - totalExpenses;
    const taxAmount = (operatingProfit * tax) / 100;
    const netProfit = operatingProfit - taxAmount;
    const netProfitMargin = (netProfit / revenue) * 100;
    const investment = costOfGoodsSold + totalExpenses;
    const roi = (netProfit / investment) * 100;

    const unitContribution = sellPrice - buyPrice - buyExpenses - sellExpenses;

    let breakEvenUnits = 0;
    if (unitContribution > 0) {
      breakEvenUnits = Math.ceil(opExpenses / unitContribution);
    }

    setResults({
      revenue,
      costOfGoodsSold,
      grossProfit,
      grossProfitMargin,
      totalExpenses,
      operatingProfit,
      taxAmount,
      netProfit,
      netProfitMargin,
      investment,
      roi,
      breakEvenUnits,
    });
  };

  const saveToHistory = () => {
    if (!buyingPrice || !sellingPrice || !units) return;

    const calculation: TradeCalculation = {
      id: generateUUID(),
      entryPrice: parseFloat(buyingPrice),
      exitPrice: parseFloat(sellingPrice),
      quantity: parseFloat(units),
      commission:
        parseFloat(buyingExpensesPerUnit) + parseFloat(sellingExpensesPerUnit),
      slippage: 0,
      positionFees: parseFloat(operatingExpenses),
      taxRate: parseFloat(taxRate),
      includeCommission: true,
      includeSlippage: false,
      includePositionFees: true,
      includeTax: parseFloat(taxRate) > 0,
      stopLoss: null,
      takeProfit: null,
      timestamp: Date.now(),
      notes: "",
    };

    saveCalculation(calculation);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const resetCalculator = () => {
    setBuyingPrice("");
    setSellingPrice("");
    setUnits("");
    setOperatingExpenses("0");
    setBuyingExpensesPerUnit("0");
    setSellingExpensesPerUnit("0");
    setTaxRate("0");
    setResults(null);
    setShowChart(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getDonutChartData = () => {
    if (!results) return [];

    const total = results.revenue;

    return [
      {
        value: results.costOfGoodsSold,
        color: "#A0887E",
        text: `${((results.costOfGoodsSold / total) * 100).toFixed(2)}%`,
        name: "Cost of goods sold",
      },
      {
        value: results.totalExpenses,
        color: "#FFA07A",
        text: `${((results.totalExpenses / total) * 100).toFixed(2)}%`,
        name: "Selling and operating expenses",
      },
      {
        value: results.taxAmount,
        color: "#F08080",
        text: `${((results.taxAmount / total) * 100).toFixed(2)}%`,
        name: "Taxes",
      },
      {
        value: results.netProfit,
        color: "#8FBC8F",
        text: `${((results.netProfit / total) * 100).toFixed(2)}%`,
        name: "Net profit margin",
      },
    ];
  };

  const renderResultsChart = () => {
    if (!results) return null;

    // Only show chart if advanced options are used
    if (
      parseFloat(operatingExpenses) > 0 ||
      parseFloat(buyingExpensesPerUnit) > 0 ||
      parseFloat(sellingExpensesPerUnit) > 0 ||
      parseFloat(taxRate) > 0
    ) {
      const chartData = {
        revenue: results.revenue,
        costOfGoodsSold: results.costOfGoodsSold,
        totalExpenses: results.totalExpenses,
        taxAmount: results.taxAmount,
        netProfit: results.netProfit,
      };

      return <CircularProgressDisplay data={chartData} />;
    }

    return null;
  };

  // Check if advanced inputs are used
  const hasOperatingExpenses = parseFloat(operatingExpenses) > 0;
  const hasTaxRate = parseFloat(taxRate) > 0;
  const hasBuyingSellingExpenses =
    parseFloat(buyingExpensesPerUnit) > 0 ||
    parseFloat(sellingExpensesPerUnit) > 0;
  const hasAdvancedInputs =
    hasOperatingExpenses || hasTaxRate || hasBuyingSellingExpenses;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#F5F5F5" },
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}translucent 
      />


        <View       style={[
        styles.header,
        { backgroundColor: isDarkMode ? "#121212" : "#F5F5F5" , borderBottomColor: isDarkMode ? "#333333" : "#E0E0E0" },
      ]}
    >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Profit & Loss</Text>
            <Text style={styles.headerSubtitle}>Calculator</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="history"
              size={24}
              onPress={() => navigation.navigate("History" as never)}
            />
            <IconButton
              icon="cog"
              size={24}
              onPress={() => navigation.navigate("Settings" as never)}
            />
          </View>
        </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.mainCard,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "white" },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: isDarkMode ? "#90CAF9" : "#2196F3" },
                  ]}
                >
                  Input Values
                </Text>
              </View>
            </View>

            <View style={styles.inputSection}>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDarkMode ? "#BBBBBB" : "#757575" },
                    ]}
                  >
                    Buying price
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: isDarkMode ? "#333333" : "#E0E0E0",
                        backgroundColor: isDarkMode ? "#2A2A2A" : "#F9F9F9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.currencySymbol,
                        { color: isDarkMode ? "#BBBBBB" : "#757575" },
                      ]}
                    >
                      $
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        { color: isDarkMode ? "#FFFFFF" : "#212121" },
                      ]}
                      value={buyingPrice}
                      onChangeText={setBuyingPrice}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={isDarkMode ? "#555555" : "#AAAAAA"}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDarkMode ? "#BBBBBB" : "#757575" },
                    ]}
                  >
                    Selling price
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: isDarkMode ? "#333333" : "#E0E0E0",
                        backgroundColor: isDarkMode ? "#2A2A2A" : "#F9F9F9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.currencySymbol,
                        { color: isDarkMode ? "#BBBBBB" : "#757575" },
                      ]}
                    >
                      $
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        { color: isDarkMode ? "#FFFFFF" : "#212121" },
                      ]}
                      value={sellingPrice}
                      onChangeText={setSellingPrice}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={isDarkMode ? "#555555" : "#AAAAAA"}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: isDarkMode ? "#BBBBBB" : "#757575" },
                  ]}
                >
                  Expected sale units
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: isDarkMode ? "#333333" : "#E0E0E0",
                      backgroundColor: isDarkMode ? "#2A2A2A" : "#F9F9F9",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.input,
                      { color: isDarkMode ? "#FFFFFF" : "#212121" },
                    ]}
                    value={units}
                    onChangeText={setUnits}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={isDarkMode ? "#555555" : "#AAAAAA"}
                  />
                  <View style={styles.quantityButtons}>
                    <IconButton
                      icon="minus"
                      size={16}
                      iconColor={isDarkMode ? "#BBBBBB" : "#757575"}
                      onPress={() => {
                        const currentValue = parseInt(units) || 0;
                        if (currentValue > 0) {
                          setUnits((currentValue - 1).toString());
                        }
                      }}
                    />
                    <IconButton
                      icon="plus"
                      size={16}
                      iconColor={isDarkMode ? "#BBBBBB" : "#757575"}
                      onPress={() => {
                        const currentValue = parseInt(units) || 0;
                        setUnits((currentValue + 1).toString());
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.advancedToggle]}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Text
                style={[
                  styles.advancedToggleText,
                  { color: isDarkMode ? "#BBBBBB" : "#757575" },
                ]}
              >
                ADVANCED OPTIONS
              </Text>
              <IconButton
                icon={showAdvanced ? "chevron-up" : "chevron-down"}
                size={20}
                iconColor={isDarkMode ? "#BBBBBB" : "#757575"}
              />
            </TouchableOpacity>

            {showAdvanced && (
              <View style={styles.advancedSection}>
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: isDarkMode ? "#BBBBBB" : "#757575" },
                      ]}
                    >
                      Operating expenses
                    </Text>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          borderColor: isDarkMode ? "#333333" : "#E0E0E0",
                          backgroundColor: isDarkMode ? "#2A2A2A" : "#F9F9F9",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.currencySymbol,
                          { color: isDarkMode ? "#BBBBBB" : "#757575" },
                        ]}
                      >
                        $
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          { color: isDarkMode ? "#FFFFFF" : "#212121" },
                        ]}
                        value={operatingExpenses}
                        onChangeText={setOperatingExpenses}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={
                          isDarkMode ? "#555555" : "#AAAAAA"
                        }
                      />
                      <View style={styles.quantityButtons}>
                        <IconButton
                          icon="minus"
                          size={16}
                          iconColor={isDarkMode ? "#BBBBBB" : "#757575"}
                          onPress={() => {
                            const currentValue =
                              parseFloat(operatingExpenses) || 0;
                            if (currentValue > 0) {
                              setOperatingExpenses(
                                (currentValue - 1).toString()
                              );
                            }
                          }}
                        />
                        <IconButton
                          icon="plus"
                          size={16}
                          iconColor={isDarkMode ? "#BBBBBB" : "#757575"}
                          onPress={() => {
                            const currentValue =
                              parseFloat(operatingExpenses) || 0;
                            setOperatingExpenses((currentValue + 1).toString());
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: isDarkMode ? "#BBBBBB" : "#757575" },
                      ]}
                    >
                      Buying expenses per unit
                    </Text>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          borderColor: isDarkMode ? "#333333" : "#E0E0E0",
                          backgroundColor: isDarkMode ? "#2A2A2A" : "#F9F9F9",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.currencySymbol,
                          { color: isDarkMode ? "#BBBBBB" : "#757575" },
                        ]}
                      >
                        $
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          { color: isDarkMode ? "#FFFFFF" : "#212121" },
                        ]}
                        value={buyingExpensesPerUnit}
                        onChangeText={setBuyingExpensesPerUnit}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={
                          isDarkMode ? "#555555" : "#AAAAAA"
                        }
                      />
                    </View>
                  </View>

                  <View
                    style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}
                  >
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: isDarkMode ? "#BBBBBB" : "#757575" },
                      ]}
                    >
                      Selling expenses per unit
                    </Text>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          borderColor: isDarkMode ? "#333333" : "#E0E0E0",
                          backgroundColor: isDarkMode ? "#2A2A2A" : "#F9F9F9",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.currencySymbol,
                          { color: isDarkMode ? "#BBBBBB" : "#757575" },
                        ]}
                      >
                        $
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          { color: isDarkMode ? "#FFFFFF" : "#212121" },
                        ]}
                        value={sellingExpensesPerUnit}
                        onChangeText={setSellingExpensesPerUnit}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={
                          isDarkMode ? "#555555" : "#AAAAAA"
                        }
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDarkMode ? "#BBBBBB" : "#757575" },
                    ]}
                  >
                    Tax rate
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: isDarkMode ? "#333333" : "#E0E0E0",
                        backgroundColor: isDarkMode ? "#2A2A2A" : "#F9F9F9",
                      },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.input,
                        { color: isDarkMode ? "#FFFFFF" : "#212121" },
                      ]}
                      value={taxRate}
                      onChangeText={setTaxRate}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={isDarkMode ? "#555555" : "#AAAAAA"}
                    />
                    <Text
                      style={[
                        styles.percentSymbol,
                        { color: isDarkMode ? "#BBBBBB" : "#757575" },
                      ]}
                    >
                      %
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {results && (
            <View
              style={[
                styles.mainCard,
                styles.resultsCard,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(30, 30, 30, 0.85)"
                    : "rgba(255, 255, 255, 0.85)",
                },
              ]}
            >
              <LinearGradient
                colors={
                  isDarkMode
                    ? ["rgba(32, 32, 32, 0.7)", "rgba(25, 25, 25, 0.5)"]
                    : ["rgba(255, 255, 255, 0.9)", "rgba(248, 248, 252, 0.8)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.resultsGradientOverlay}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.titleContainer}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: isDarkMode ? "#90CAF9" : "#2196F3" },
                      ]}
                    >
                      Results
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButtonContainer,
                        { opacity: hasAdvancedInputs ? 1 : 0.5 },
                      ]}
                      onPress={() =>
                        hasAdvancedInputs && setShowChart(!showChart)
                      }
                      disabled={!hasAdvancedInputs}
                    >
                      <LinearGradient
                        colors={
                          isDarkMode
                            ? ["rgba(30, 30, 30, 0.8)", "rgba(40, 40, 40, 0.8)"]
                            : [
                                "rgba(245, 245, 245, 0.8)",
                                "rgba(235, 235, 235, 0.8)",
                              ]
                        }
                        style={[
                          styles.actionButton,
                          {
                            borderColor: isDarkMode
                              ? "rgba(60, 60, 60, 0.3)"
                              : "rgba(230, 230, 230, 0.5)",
                          },
                        ]}
                      >
                        <IconButton
                          icon={
                            showChart ? "format-list-bulleted" : "chart-pie"
                          }
                          size={18}
                          iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                          onPress={() =>
                            hasAdvancedInputs && setShowChart(!showChart)
                          }
                          disabled={!hasAdvancedInputs}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButtonContainer}
                      onPress={saveToHistory}
                    >
                      <LinearGradient
                        colors={
                          isDarkMode
                            ? ["rgba(30, 30, 30, 0.8)", "rgba(40, 40, 40, 0.8)"]
                            : [
                                "rgba(245, 245, 245, 0.8)",
                                "rgba(235, 235, 235, 0.8)",
                              ]
                        }
                        style={[
                          styles.actionButton,
                          {
                            borderColor: isDarkMode
                              ? "rgba(60, 60, 60, 0.3)"
                              : "rgba(230, 230, 230, 0.5)",
                          },
                        ]}
                      >
                        <IconButton
                          icon="content-save"
                          size={18}
                          iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                          onPress={saveToHistory}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>

                {showChart && hasAdvancedInputs ? (
                  <View style={styles.chartView}>
                    <LinearGradient
                      colors={
                        isDarkMode
                          ? ["rgba(37, 37, 37, 0.9)", "rgba(30, 30, 30, 0.7)"]
                          : [
                              "rgba(248, 249, 250, 0.9)",
                              "rgba(240, 242, 245, 0.7)",
                            ]
                      }
                      style={[
                        styles.chartCard,
                        {
                          borderColor: isDarkMode
                            ? "rgba(60, 60, 60, 0.5)"
                            : "rgba(230, 230, 230, 0.8)",
                        },
                      ]}
                    >
                      {renderResultsChart()}
                    </LinearGradient>
                  </View>
                ) : (
                  <View style={styles.resultsContainer}>
                    <LinearGradient
                      colors={
                        isDarkMode
                          ? ["rgba(37, 37, 37, 0.8)", "rgba(30, 30, 30, 0.6)"]
                          : [
                              "rgba(255, 255, 255, 0.8)",
                              "rgba(248, 248, 252, 0.6)",
                            ]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.resultCardGradient,
                        {
                          borderColor: isDarkMode
                            ? "rgba(60, 60, 60, 0.5)"
                            : "rgba(230, 230, 230, 0.8)",
                        },
                      ]}
                    >
                      {/* Revenue */}
                      <View
                        style={[
                          styles.resultItem,
                          {
                            borderBottomColor: isDarkMode
                              ? "rgba(60, 60, 60, 0.5)"
                              : "rgba(230, 230, 230, 0.8)",
                          },
                        ]}
                      >
                        <View style={styles.resultLabelRow}>
                          <Text
                            style={[
                              styles.resultLabel,
                              { color: isDarkMode ? "#BBBBBB" : "#757575" },
                            ]}
                          >
                            Revenue
                          </Text>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>TOTAL</Text>
                          </View>
                        </View>
                        <View style={styles.resultValueRow}>
                          <Text
                            style={[
                              styles.resultValueText,
                              { color: isDarkMode ? "#FFFFFF" : "#212121" },
                            ]}
                          >
                            {formatCurrency(results.revenue)}
                          </Text>
                        </View>
                      </View>

                      {/* Cost of goods sold */}
                      <View
                        style={[
                          styles.resultItem,
                          {
                            borderBottomColor: isDarkMode
                              ? "rgba(60, 60, 60, 0.5)"
                              : "rgba(230, 230, 230, 0.8)",
                          },
                        ]}
                      >
                        <View style={styles.resultLabelRow}>
                          <Text
                            style={[
                              styles.resultLabel,
                              { color: isDarkMode ? "#BBBBBB" : "#757575" },
                            ]}
                          >
                            Cost of goods sold
                          </Text>
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: "rgba(179, 155, 128, 0.9)" },
                            ]}
                          >
                            <Text style={styles.badgeText}>COGS</Text>
                          </View>
                        </View>
                        <View style={styles.resultValueRow}>
                          <Text
                            style={[
                              styles.resultValueText,
                              { color: isDarkMode ? "#FFFFFF" : "#212121" },
                            ]}
                          >
                            {formatCurrency(results.costOfGoodsSold)}
                          </Text>
                          <View
                            style={[
                              styles.percentChip,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(26, 26, 26, 0.5)"
                                  : "rgba(234, 234, 234, 0.5)",
                                borderColor: isDarkMode
                                  ? "rgba(60, 60, 60, 0.5)"
                                  : "rgba(230, 230, 230, 0.8)",
                              },
                            ]}
                          >
                            <Text style={styles.percentText}>
                              {(
                                (results.costOfGoodsSold / results.revenue) *
                                100
                              ).toFixed(1)}
                              %
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Net profit margin */}
                      <View
                        style={[
                          styles.resultItem,
                          {
                            borderBottomColor: isDarkMode
                              ? "rgba(60, 60, 60, 0.5)"
                              : "rgba(230, 230, 230, 0.8)",
                          },
                        ]}
                      >
                        <View style={styles.resultLabelRow}>
                          <Text
                            style={[
                              styles.resultLabel,
                              { color: isDarkMode ? "#BBBBBB" : "#757575" },
                            ]}
                          >
                            Net profit margin
                          </Text>
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor:
                                  results.netProfitMargin >= 0
                                    ? "rgba(76, 175, 80, 0.9)"
                                    : "rgba(244, 67, 54, 0.9)",
                              },
                            ]}
                          >
                            <Text style={styles.badgeText}>NPM</Text>
                          </View>
                        </View>
                        <View style={styles.resultValueRow}>
                          <Text
                            style={[
                              styles.resultValueText,
                              {
                                color:
                                  results.netProfitMargin >= 0
                                    ? "#4CAF50"
                                    : "#F44336",
                              },
                            ]}
                          >
                            {results.netProfitMargin < 0 && "-"}
                            {formatPercentage(
                              Math.abs(results.netProfitMargin)
                            )}
                          </Text>
                          <View style={styles.trendContainer}>
                            <View
                              style={[
                                styles.trendIndicator,
                                {
                                  borderTopColor:
                                    results.netProfitMargin >= 0
                                      ? "#4CAF50"
                                      : "#F44336",
                                  transform: [
                                    {
                                      rotate:
                                        results.netProfitMargin >= 0
                                          ? "0deg"
                                          : "180deg",
                                    },
                                  ],
                                },
                              ]}
                            />
                          </View>
                        </View>
                      </View>

                      {/* Net profit */}
                      <View style={styles.netProfitContainer}>
                        <View style={styles.resultLabelRow}>
                          <Text
                            style={[
                              styles.netProfitLabel,
                              { color: isDarkMode ? "#FFFFFF" : "#212121" },
                            ]}
                          >
                            Net profit
                          </Text>
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor:
                                  results.netProfit >= 0
                                    ? "rgba(76, 175, 80, 0.9)"
                                    : "rgba(244, 67, 54, 0.9)",
                              },
                            ]}
                          >
                            <Text style={styles.badgeText}>NP</Text>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.netProfitValueContainer,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(26, 26, 26, 0.8)"
                                : "rgba(248, 248, 248, 0.8)",
                              borderColor: isDarkMode
                                ? "rgba(60, 60, 60, 0.5)"
                                : "rgba(230, 230, 230, 0.8)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.netProfitValueText,
                              {
                                color:
                                  results.netProfit >= 0
                                    ? "#4CAF50"
                                    : "#F44336",
                              },
                            ]}
                          >
                            {results.netProfit < 0 && "-"}
                            {formatCurrency(Math.abs(results.netProfit))}
                          </Text>
                          <View
                            style={[
                              styles.percentChip,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(26, 26, 26, 0.5)"
                                  : "rgba(234, 234, 234, 0.5)",
                                borderColor: isDarkMode
                                  ? "rgba(60, 60, 60, 0.5)"
                                  : "rgba(230, 230, 230, 0.8)",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.netProfitPercentage,
                                {
                                  color:
                                    results.netProfit >= 0
                                      ? "#4CAF50"
                                      : "#F44336",
                                },
                              ]}
                            >
                              {(
                                (results.netProfit / results.revenue) *
                                100
                              ).toFixed(1)}
                              %
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Additional metrics section */}
                      <View style={styles.metricsContainer}>
                        <Text
                          style={[
                            styles.metricsHeader,
                            { color: isDarkMode ? "#90CAF9" : "#2196F3" },
                          ]}
                        >
                          Key metrics
                        </Text>

                        <View style={styles.metricsGrid}>
                          {/* ROI */}
                          <View
                            style={[
                              styles.metricCard,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(26, 26, 26, 0.8)"
                                  : "rgba(248, 248, 248, 0.8)",
                                borderColor: isDarkMode
                                  ? "rgba(60, 60, 60, 0.5)"
                                  : "rgba(230, 230, 230, 0.8)",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.metricTitle,
                                { color: isDarkMode ? "#BBBBBB" : "#757575" },
                              ]}
                            >
                              ROI
                            </Text>
                            <Text
                              style={[
                                styles.metricValue,
                                {
                                  color:
                                    results.roi >= 0 ? "#4CAF50" : "#F44336",
                                },
                              ]}
                            >
                              {results.roi < 0 && "-"}
                              {formatPercentage(Math.abs(results.roi))}
                            </Text>
                          </View>

                          {/* Investment */}
                          <View
                            style={[
                              styles.metricCard,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(26, 26, 26, 0.8)"
                                  : "rgba(248, 248, 248, 0.8)",
                                borderColor: isDarkMode
                                  ? "rgba(60, 60, 60, 0.5)"
                                  : "rgba(230, 230, 230, 0.8)",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.metricTitle,
                                { color: isDarkMode ? "#BBBBBB" : "#757575" },
                              ]}
                            >
                              Investment
                            </Text>
                            <Text
                              style={[
                                styles.metricValue,
                                { color: isDarkMode ? "#FFFFFF" : "#212121" },
                              ]}
                            >
                              {formatCurrency(results.investment)}
                            </Text>
                          </View>

                          {/* Break-even units - Only shown if has operating expenses */}
                          {results.breakEvenUnits > 0 &&
                            hasOperatingExpenses && (
                              <View
                                style={[
                                  styles.metricCard,
                                  {
                                    backgroundColor: isDarkMode
                                      ? "rgba(26, 26, 26, 0.8)"
                                      : "rgba(248, 248, 248, 0.8)",
                                    borderColor: isDarkMode
                                      ? "rgba(60, 60, 60, 0.5)"
                                      : "rgba(230, 230, 230, 0.8)",
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.metricTitle,
                                    {
                                      color: isDarkMode ? "#BBBBBB" : "#757575",
                                    },
                                  ]}
                                >
                                  Break-even
                                </Text>
                                <Text
                                  style={[
                                    styles.metricValue,
                                    {
                                      color: isDarkMode ? "#FFFFFF" : "#212121",
                                    },
                                  ]}
                                >
                                  {results.breakEvenUnits} units
                                </Text>
                              </View>
                            )}
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                )}
              </LinearGradient>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1, 
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: "row",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  mainCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsCard: {
    padding: 0,
    marginTop: 8,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  resultsGradientOverlay: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  titleContainer: {
    position: "relative",
    paddingLeft: 0,
  },
  titleAccent: {
    position: "absolute",
    left: 0,
    top: -5,
    width: 4,
    height: "80%",
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputSection: {
    marginBottom: 1,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#757575",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#757575",
    paddingRight: 8,
  },
  percentSymbol: {
    fontSize: 16,
    color: "#757575",
    paddingLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: "#212121",
  },
  quantityButtons: {
    flexDirection: "row",
  },
  advancedToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 5,
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  advancedSection: {
    marginTop: 8,
  },
  resultsSection: {
    marginTop: 8,
  },
  resultCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#757575",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  resultLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#607D8B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  resultValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    marginVertical: 16,
  },
  additionalMetricsLabel: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
  },
  chartView: {
    width: "100%",
    marginTop: 8,
  },
  chartCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    padding: 0,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
  },
  donutChartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  legendContainer: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#757575",
  },
  simpleChartContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  simpleDonut: {
    flexDirection: "row",
    height: 30,
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
    marginVertical: 20,
  },
  donutSegment: {
    height: "100%",
  },
  resultsContainer: {
    marginTop: 0,
    borderRadius: 12,
    overflow: "hidden",
  },
  resultCardGradient: {
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  resultItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  resultValueText: {
    fontSize: 20,
    fontWeight: "600",
  },
  percentChip: {
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  percentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#757575",
  },
  netProfitContainer: {
    marginBottom: 1,
  },
  netProfitLabel: {
    fontSize: 18,
    fontWeight: "700",
  },
  netProfitValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginTop: 5,
    borderWidth: 1,
  },
  netProfitValueText: {
    fontSize: 22,
    fontWeight: "700",
  },
  netProfitPercentage: {
    fontSize: 18,
    fontWeight: "700",
  },
  trendContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  trendIndicator: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#4CAF50",
  },
  metricsContainer: {
    marginTop: 12,
  },
  metricsHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  metricTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "600",
  },
  actionButtonContainer: {
    marginLeft: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(200, 200, 200, 0.3)",
  },
});
