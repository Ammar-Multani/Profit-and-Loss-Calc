import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, IconButton, Divider, Button, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import ViewShot from "react-native-view-shot";

import { calculateResults } from "../utils/calculations";
import { saveCalculation, getSettings } from "../utils/storage";
import { TradeCalculation } from "../types";
import { useTheme } from "../context/ThemeContext";
import ResultsChart from "../components/ResultsChart";
import CircularProgressDisplay from "../components/CircularProgressDisplay";
import { generateUUID } from "../utils/uuid-helpers";
import { exportToPdf } from "../utils/pdf-export";

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
    const costOfGoodsSold = (buyPrice + buyExpenses) * quantity;
    const grossProfit = revenue - costOfGoodsSold;
    const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const totalExpenses = opExpenses + sellExpenses * quantity;
    const operatingProfit = grossProfit - totalExpenses;
    // Only apply tax if operating profit is positive
    const taxAmount = operatingProfit > 0 ? (operatingProfit * tax) / 100 : 0;
    const netProfit = operatingProfit - taxAmount;
    const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const investment = costOfGoodsSold + totalExpenses;
    const roi = investment > 0 ? (netProfit / investment) * 100 : 0;

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

  const renderEmptyState = () => {
    return (
      <View
        style={[
          styles.mainCard,
          styles.emptyStateCard,
          {
            backgroundColor: isDarkMode
              ? "rgba(30, 30, 30, 0.85)"
              : "rgba(255, 255, 255, 0.85)",
            borderColor: isDarkMode
              ? "rgba(75, 75, 75, 0.2)"
              : "rgba(230, 230, 230, 0.8)",
          },
        ]}
      >
        <LinearGradient
          colors={
            isDarkMode
              ? ["rgba(40, 40, 40, 0.7)", "rgba(30, 30, 30, 0.5)"]
              : ["rgba(255, 255, 255, 0.95)", "rgba(250, 250, 255, 0.85)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyStateGradient}
        >
          <View style={styles.emptyStateIconContainer}>
            <IconButton
              icon="calculator-variant"
              size={50}
              iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
            />
          </View>
          <Text
            style={[
              styles.emptyStateTitle,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            Ready to Calculate
          </Text>
          <Text
            style={[
              styles.emptyStateDescription,
              { color: isDarkMode ? "#AAAAAA" : "#757575" },
            ]}
          >
            Enter buying price, selling price, and units to see profit and loss
            calculations
          </Text>
          <View style={styles.emptyStateTipsContainer}>
            <View style={styles.emptyStateTipRow}>
              <View
                style={[
                  styles.emptyStateTipBullet,
                  { backgroundColor: isDarkMode ? "#90CAF9" : "#2196F3" },
                ]}
              />
              <Text
                style={[
                  styles.emptyStateTipText,
                  { color: isDarkMode ? "#DDDDDD" : "#555555" },
                ]}
              >
                Try the advanced options for detailed analysis
              </Text>
            </View>
            <View style={styles.emptyStateTipRow}>
              <View
                style={[
                  styles.emptyStateTipBullet,
                  { backgroundColor: isDarkMode ? "#90CAF9" : "#2196F3" },
                ]}
              />
              <Text
                style={[
                  styles.emptyStateTipText,
                  { color: isDarkMode ? "#DDDDDD" : "#555555" },
                ]}
              >
                Save calculations to track your profits over time
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const handleExportPdf = async () => {
    if (!results) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await exportToPdf({
        resultsData: results,
        fileName: `ProfitLoss-Report`,
        buyingPrice: parseFloat(buyingPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        units: parseFloat(units) || 0,
        operatingExpenses: parseFloat(operatingExpenses) || 0,
        buyingExpensesPerUnit: parseFloat(buyingExpensesPerUnit) || 0,
        sellingExpensesPerUnit: parseFloat(sellingExpensesPerUnit) || 0,
        taxRate: parseFloat(taxRate) || 0,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to export PDF:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#F8F9FA" },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDarkMode ? "#1A1A1A" : "#FFFFFF",
            borderBottomColor: isDarkMode
              ? "rgba(75, 75, 75, 0.3)"
              : "rgba(230, 230, 230, 0.8)",
          },
        ]}
      >
        <LinearGradient
          colors={
            isDarkMode
              ? ["rgba(40, 40, 40, 0.8)", "rgba(30, 30, 30, 0.8)"]
              : ["rgba(255, 255, 255, 1)", "rgba(250, 250, 250, 0.95)"]
          }
          style={styles.headerGradient}
        >
          <View style={styles.headerLeft}>
            <Text
              style={[
                styles.headerTitle,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              Profit & Loss
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: isDarkMode ? "#AAAAAA" : "#757575" },
              ]}
            >
              Calculator
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="history"
              size={24}
              iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
              style={styles.headerIcon}
              onPress={() => navigation.navigate("History" as never)}
            />
            <IconButton
              icon="cog"
              size={24}
              iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
              style={styles.headerIcon}
              onPress={() => navigation.navigate("Settings" as never)}
            />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.mainCard,
            {
              backgroundColor: isDarkMode ? "#1E1E1E" : "white",
              borderColor: isDarkMode
                ? "rgba(75, 75, 75, 0.2)"
                : "rgba(230, 230, 230, 0.8)",
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <View
                style={[
                  styles.titleAccent,
                  { backgroundColor: isDarkMode ? "#90CAF9" : "#2196F3" },
                ]}
              />
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDarkMode ? "#FFFFFF" : "#333333" },
                ]}
              >
                Input Values
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(50, 50, 50, 0.7)"
                      : "rgba(255, 255, 255, 0.88)",
                    borderColor: isDarkMode
                      ? "rgba(70, 70, 70, 0.5)"
                      : "rgba(210, 210, 210, 0.8)",
                  },
                ]}
                onPress={resetCalculator}
              >
                <Text
                  style={[
                    styles.resetButtonText,
                    { color: isDarkMode ? "#BBBBBB" : "#616161" },
                  ]}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: isDarkMode ? "#BBBBBB" : "#616161" },
                  ]}
                >
                  Buying price
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: isDarkMode
                        ? "rgba(70, 70, 70, 0.5)"
                        : "rgba(210, 210, 210, 0.8)",
                      backgroundColor: isDarkMode
                        ? "rgba(45, 45, 45, 0.5)"
                        : "rgba(248, 249, 250, 0.8)",
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
                    { color: isDarkMode ? "#BBBBBB" : "#616161" },
                  ]}
                >
                  Selling price
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: isDarkMode
                        ? "rgba(70, 70, 70, 0.5)"
                        : "rgba(210, 210, 210, 0.8)",
                      backgroundColor: isDarkMode
                        ? "rgba(45, 45, 45, 0.5)"
                        : "rgba(248, 249, 250, 0.8)",
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
                  { color: isDarkMode ? "#BBBBBB" : "#616161" },
                ]}
              >
                Expected sale units
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: isDarkMode
                      ? "rgba(70, 70, 70, 0.5)"
                      : "rgba(210, 210, 210, 0.8)",
                    backgroundColor: isDarkMode
                      ? "rgba(45, 45, 45, 0.5)"
                      : "rgba(248, 249, 250, 0.8)",
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
                    iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                    style={styles.unitButton}
                    onPress={() => {
                      const currentValue = parseInt(units) || 0;
                      if (currentValue > 0) {
                        setUnits((currentValue - 1).toString());
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                  />
                  <IconButton
                    icon="plus"
                    size={16}
                    iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                    style={styles.unitButton}
                    onPress={() => {
                      const currentValue = parseInt(units) || 0;
                      setUnits((currentValue + 1).toString());
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  />
                </View>
              </View>
            </View>
          </View>

          <LinearGradient
            colors={
              isDarkMode
                ? ["rgba(45, 45, 45, 0.5)", "rgba(35, 35, 35, 0.5)"]
                : ["rgba(243, 243, 243, 0.53)", "rgba(255, 255, 255, 0.79)"]
            }
            style={[
              styles.advancedToggleContainer,
              {
                borderColor: isDarkMode
                  ? "rgba(70, 70, 70, 0.5)"
                  : "rgba(210, 210, 210, 0.8)",
              },
            ]}
          >
            <TouchableOpacity
              style={styles.advancedToggle}
              onPress={() => {
                setShowAdvanced(!showAdvanced);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.advancedToggleText,
                  { color: isDarkMode ? "#90CAF9" : "#2196F3" },
                ]}
              >
                {showAdvanced
                  ? "HIDE ADVANCED OPTIONS"
                  : "SHOW ADVANCED OPTIONS"}
              </Text>
              <IconButton
                icon={showAdvanced ? "chevron-up" : "chevron-down"}
                size={20}
                iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
              />
            </TouchableOpacity>
          </LinearGradient>

          {showAdvanced && (
            <View style={styles.advancedSection}>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDarkMode ? "#BBBBBB" : "#616161" },
                    ]}
                  >
                    Operating expenses
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: isDarkMode
                          ? "rgba(70, 70, 70, 0.5)"
                          : "rgba(210, 210, 210, 0.8)",
                        backgroundColor: isDarkMode
                          ? "rgba(45, 45, 45, 0.5)"
                          : "rgba(248, 249, 250, 0.8)",
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
                      placeholderTextColor={isDarkMode ? "#555555" : "#AAAAAA"}
                    />
                    <View style={styles.quantityButtons}>
                      <IconButton
                        icon="minus"
                        size={16}
                        iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                        style={styles.unitButton}
                        onPress={() => {
                          const currentValue =
                            parseFloat(operatingExpenses) || 0;
                          if (currentValue > 0) {
                            setOperatingExpenses((currentValue - 1).toString());
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            );
                          }
                        }}
                      />
                      <IconButton
                        icon="plus"
                        size={16}
                        iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                        style={styles.unitButton}
                        onPress={() => {
                          const currentValue =
                            parseFloat(operatingExpenses) || 0;
                          setOperatingExpenses((currentValue + 1).toString());
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
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
                      { color: isDarkMode ? "#BBBBBB" : "#616161" },
                    ]}
                  >
                    Buying expenses per unit
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: isDarkMode
                          ? "rgba(70, 70, 70, 0.5)"
                          : "rgba(210, 210, 210, 0.8)",
                        backgroundColor: isDarkMode
                          ? "rgba(45, 45, 45, 0.5)"
                          : "rgba(248, 249, 250, 0.8)",
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
                      placeholderTextColor={isDarkMode ? "#555555" : "#AAAAAA"}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDarkMode ? "#BBBBBB" : "#616161" },
                    ]}
                  >
                    Selling expenses per unit
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: isDarkMode
                          ? "rgba(70, 70, 70, 0.5)"
                          : "rgba(210, 210, 210, 0.8)",
                        backgroundColor: isDarkMode
                          ? "rgba(45, 45, 45, 0.5)"
                          : "rgba(248, 249, 250, 0.8)",
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
                      placeholderTextColor={isDarkMode ? "#555555" : "#AAAAAA"}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: isDarkMode ? "#BBBBBB" : "#616161" },
                  ]}
                >
                  Tax rate
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: isDarkMode
                        ? "rgba(70, 70, 70, 0.5)"
                        : "rgba(210, 210, 210, 0.8)",
                      backgroundColor: isDarkMode
                        ? "rgba(45, 45, 45, 0.5)"
                        : "rgba(248, 249, 250, 0.8)",
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

        {results ? (
          <View
            style={[
              styles.mainCard,
              styles.resultsCard,
              {
                backgroundColor: isDarkMode
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
                borderColor: isDarkMode
                  ? "rgba(75, 75, 75, 0.2)"
                  : "rgba(230, 230, 230, 0.8)",
              },
            ]}
          >
            <LinearGradient
              colors={
                isDarkMode
                  ? ["rgba(40, 40, 40, 0.7)", "rgba(30, 30, 30, 0.5)"]
                  : ["rgba(255, 255, 255, 0.95)", "rgba(250, 250, 255, 0.85)"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resultsGradientOverlay}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                  <View
                    style={[
                      styles.titleAccent,
                      {
                        backgroundColor:
                          results.netProfit >= 0 ? "#4CAF50" : "#F44336",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: isDarkMode ? "#FFFFFF" : "#333333" },
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
                    onPress={() => {
                      if (hasAdvancedInputs) {
                        setShowChart(!showChart);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    disabled={!hasAdvancedInputs}
                  >
                    <LinearGradient
                      colors={
                        isDarkMode
                          ? ["rgba(40, 40, 40, 0.8)", "rgba(50, 50, 50, 0.8)"]
                          : [
                              "rgba(243, 243, 243, 0.8)",
                              "rgba(255, 255, 255, 0.92)",
                            ]
                      }
                      style={[
                        styles.actionButton,
                        {
                          borderColor: isDarkMode
                            ? "rgba(80, 80, 80, 0.5)"
                            : "rgba(220, 220, 220, 0.8)",
                        },
                      ]}
                    >
                      <IconButton
                        icon={showChart ? "format-list-bulleted" : "chart-pie"}
                        size={18}
                        iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                        onPress={() => {
                          if (hasAdvancedInputs) {
                            setShowChart(!showChart);
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            );
                          }
                        }}
                        disabled={!hasAdvancedInputs}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButtonContainer}
                    onPress={handleExportPdf}
                  >
                    <LinearGradient
                      colors={
                        isDarkMode
                          ? ["rgba(40, 40, 40, 0.8)", "rgba(50, 50, 50, 0.8)"]
                          : [
                              "rgba(243, 243, 243, 0.8)",
                              "rgba(255, 255, 255, 0.92)",
                            ]
                      }
                      style={[
                        styles.actionButton,
                        {
                          borderColor: isDarkMode
                            ? "rgba(80, 80, 80, 0.5)"
                            : "rgba(220, 220, 220, 0.8)",
                        },
                      ]}
                    >
                      <IconButton
                        icon="file-pdf-box"
                        size={18}
                        iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                        onPress={handleExportPdf}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButtonContainer}
                    onPress={() => {
                      saveToHistory();
                    }}
                  >
                    <LinearGradient
                      colors={
                        isDarkMode
                          ? ["rgba(40, 40, 40, 0.8)", "rgba(50, 50, 50, 0.8)"]
                          : [
                              "rgba(243, 243, 243, 0.8)",
                              "rgba(255, 255, 255, 0.92)",
                            ]
                      }
                      style={[
                        styles.actionButton,
                        {
                          borderColor: isDarkMode
                            ? "rgba(80, 80, 80, 0.5)"
                            : "rgba(220, 220, 220, 0.8)",
                        },
                      ]}
                    >
                      <IconButton
                        icon="content-save"
                        size={18}
                        iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                        onPress={() => {
                          saveToHistory();
                        }}
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
                        ? ["rgba(45, 45, 45, 0.9)", "rgba(35, 35, 35, 0.7)"]
                        : [
                            "rgba(255, 255, 255, 0.9)",
                            "rgba(255, 255, 255, 0.84)",
                          ]
                    }
                    style={[
                      styles.chartCard,
                      {
                        borderColor: isDarkMode
                          ? "rgba(80, 80, 80, 0.5)"
                          : "rgba(220, 220, 220, 0.8)",
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
                        ? ["rgba(45, 45, 45, 0.8)", "rgba(35, 35, 35, 0.6)"]
                        : [
                            "rgba(255, 255, 255, 0.9)",
                            "rgba(250, 250, 255, 0.7)",
                          ]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.resultCardGradient,
                      {
                        borderColor: isDarkMode
                          ? "rgba(80, 80, 80, 0.5)"
                          : "rgba(220, 220, 220, 0.8)",
                      },
                    ]}
                  >
                    {/* Revenue */}
                    <View
                      style={[
                        styles.resultItem,
                        {
                          borderBottomColor: isDarkMode
                            ? "rgba(80, 80, 80, 0.5)"
                            : "rgba(220, 220, 220, 0.8)",
                        },
                      ]}
                    >
                      <View style={styles.resultLabelRow}>
                        <Text
                          style={[
                            styles.resultLabel,
                            { color: isDarkMode ? "#DDDDDD" : "#555555" },
                          ]}
                        >
                          Revenue
                        </Text>
                        <View
                          style={[styles.badge, { backgroundColor: "#5C6BC0" }]}
                        >
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
                            ? "rgba(80, 80, 80, 0.5)"
                            : "rgba(220, 220, 220, 0.8)",
                        },
                      ]}
                    >
                      <View style={styles.resultLabelRow}>
                        <Text
                          style={[
                            styles.resultLabel,
                            { color: isDarkMode ? "#DDDDDD" : "#555555" },
                          ]}
                        >
                          Cost of goods sold
                        </Text>
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: "rgba(158, 158, 158, 0.9)" },
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
                                ? "rgba(35, 35, 35, 0.7)"
                                : "rgba(240, 240, 240, 0.7)",
                              borderColor: isDarkMode
                                ? "rgba(80, 80, 80, 0.5)"
                                : "rgba(220, 220, 220, 0.8)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.percentText,
                              { color: isDarkMode ? "#BBBBBB" : "#757575" },
                            ]}
                          >
                            {(
                              (results.costOfGoodsSold / results.revenue) *
                              100
                            ).toFixed(1)}
                            %
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Gross Profit */}
                    <View
                      style={[
                        styles.resultItem,
                        {
                          borderBottomColor: isDarkMode
                            ? "rgba(80, 80, 80, 0.5)"
                            : "rgba(220, 220, 220, 0.8)",
                        },
                      ]}
                    >
                      <View style={styles.resultLabelRow}>
                        <Text
                          style={[
                            styles.resultLabel,
                            { color: isDarkMode ? "#DDDDDD" : "#555555" },
                          ]}
                        >
                          Gross profit
                        </Text>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                results.grossProfit >= 0
                                  ? "rgba(76, 175, 80, 0.9)"
                                  : "rgba(244, 67, 54, 0.9)",
                            },
                          ]}
                        >
                          <Text style={styles.badgeText}>GP</Text>
                        </View>
                      </View>
                      <View style={styles.resultValueRow}>
                        <Text
                          style={[
                            styles.resultValueText,
                            {
                              color:
                                results.grossProfit >= 0
                                  ? "#4CAF50"
                                  : "#F44336",
                            },
                          ]}
                        >
                          {results.grossProfit < 0 && "-"}
                          {formatCurrency(Math.abs(results.grossProfit))}
                        </Text>
                        <View
                          style={[
                            styles.percentChip,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(35, 35, 35, 0.7)"
                                : "rgba(240, 240, 240, 0.7)",
                              borderColor: isDarkMode
                                ? "rgba(80, 80, 80, 0.5)"
                                : "rgba(220, 220, 220, 0.8)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.percentText,
                              {
                                color:
                                  results.grossProfit >= 0
                                    ? "#4CAF50"
                                    : "#F44336",
                              },
                            ]}
                          >
                            {(
                              (results.grossProfit / results.revenue) *
                              100
                            ).toFixed(1)}
                            %
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Gross Profit Margin - Only shown if advanced options are used */}
                    {hasAdvancedInputs && (
                      <View
                        style={[
                          styles.resultItem,
                          {
                            borderBottomColor: isDarkMode
                              ? "rgba(80, 80, 80, 0.5)"
                              : "rgba(220, 220, 220, 0.8)",
                          },
                        ]}
                      >
                        <View style={styles.resultLabelRow}>
                          <Text
                            style={[
                              styles.resultLabel,
                              { color: isDarkMode ? "#DDDDDD" : "#555555" },
                            ]}
                          >
                            Gross profit margin
                          </Text>
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor:
                                  results.grossProfitMargin >= 0
                                    ? "rgba(76, 175, 80, 0.9)"
                                    : "rgba(244, 67, 54, 0.9)",
                              },
                            ]}
                          >
                            <Text style={styles.badgeText}>GPM</Text>
                          </View>
                        </View>
                        <View style={styles.resultValueRow}>
                          <Text
                            style={[
                              styles.resultValueText,
                              {
                                color:
                                  results.grossProfitMargin >= 0
                                    ? "#4CAF50"
                                    : "#F44336",
                              },
                            ]}
                          >
                            {results.grossProfitMargin < 0 && "-"}
                            {formatPercentage(
                              Math.abs(results.grossProfitMargin)
                            )}
                          </Text>
                          <View style={styles.trendContainer}>
                            <View
                              style={[
                                styles.trendIndicator,
                                {
                                  borderTopColor:
                                    results.grossProfitMargin >= 0
                                      ? "#4CAF50"
                                      : "#F44336",
                                  transform: [
                                    {
                                      rotate:
                                        results.grossProfitMargin >= 0
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
                    )}

                    {/* Total Expenses - Only shown if advanced options are used */}
                    {hasAdvancedInputs && (
                      <View
                        style={[
                          styles.resultItem,
                          {
                            borderBottomColor: isDarkMode
                              ? "rgba(80, 80, 80, 0.5)"
                              : "rgba(220, 220, 220, 0.8)",
                          },
                        ]}
                      >
                        <View style={styles.resultLabelRow}>
                          <Text
                            style={[
                              styles.resultLabel,
                              { color: isDarkMode ? "#DDDDDD" : "#555555" },
                            ]}
                          >
                            Selling & operating expenses
                          </Text>
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: "rgba(255, 152, 0, 0.9)" },
                            ]}
                          >
                            <Text style={styles.badgeText}>EXP</Text>
                          </View>
                        </View>
                        <View style={styles.resultValueRow}>
                          <Text
                            style={[
                              styles.resultValueText,
                              { color: isDarkMode ? "#FFFFFF" : "#212121" },
                            ]}
                          >
                            {formatCurrency(results.totalExpenses)}
                          </Text>
                          <View
                            style={[
                              styles.percentChip,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(35, 35, 35, 0.7)"
                                  : "rgba(240, 240, 240, 0.7)",
                                borderColor: isDarkMode
                                  ? "rgba(80, 80, 80, 0.5)"
                                  : "rgba(220, 220, 220, 0.8)",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.percentText,
                                { color: isDarkMode ? "#BBBBBB" : "#757575" },
                              ]}
                            >
                              {(
                                (results.totalExpenses / results.revenue) *
                                100
                              ).toFixed(1)}
                              %
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Net profit margin */}
                    <View
                      style={[
                        styles.resultItem,
                        {
                          borderBottomColor: isDarkMode
                            ? "rgba(80, 80, 80, 0.5)"
                            : "rgba(220, 220, 220, 0.8)",
                        },
                      ]}
                    >
                      <View style={styles.resultLabelRow}>
                        <Text
                          style={[
                            styles.resultLabel,
                            { color: isDarkMode ? "#DDDDDD" : "#555555" },
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
                          {formatPercentage(Math.abs(results.netProfitMargin))}
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
                              ? "rgba(35, 35, 35, 0.7)"
                              : "rgba(248, 250, 252, 0.7)",
                            borderColor: isDarkMode
                              ? "rgba(80, 80, 80, 0.5)"
                              : "rgba(220, 220, 220, 0.8)",
                            borderRadius: 16,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.netProfitValueText,
                            {
                              color:
                                results.netProfit >= 0 ? "#4CAF50" : "#F44336",
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
                                ? "rgba(35, 35, 35, 0.9)"
                                : "rgba(240, 240, 240, 0.9)",
                              borderColor: isDarkMode
                                ? "rgba(80, 80, 80, 0.5)"
                                : "rgba(220, 220, 220, 0.8)",
                              borderRadius: 12,
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
                                ? "rgba(35, 35, 35, 0.7)"
                                : "rgba(248, 250, 252, 0.7)",
                              borderColor: isDarkMode
                                ? "rgba(80, 80, 80, 0.5)"
                                : "rgba(220, 220, 220, 0.8)",
                              borderRadius: 16,
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
                                color: results.roi >= 0 ? "#4CAF50" : "#F44336",
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
                                ? "rgba(35, 35, 35, 0.7)"
                                : "rgba(248, 250, 252, 0.7)",
                              borderColor: isDarkMode
                                ? "rgba(80, 80, 80, 0.5)"
                                : "rgba(220, 220, 220, 0.8)",
                              borderRadius: 16,
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
                        {results.breakEvenUnits > 0 && hasOperatingExpenses && (
                          <View
                            style={[
                              styles.metricCard,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(35, 35, 35, 0.7)"
                                  : "rgba(248, 250, 252, 0.7)",
                                borderColor: isDarkMode
                                  ? "rgba(80, 80, 80, 0.5)"
                                  : "rgba(220, 220, 220, 0.8)",
                                borderRadius: 16,
                                width: "100%",
                                marginTop: 8,
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
                              Break-even point
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
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
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
    height: 100,
    paddingBottom: 16,
    borderBottomWidth: 1,
    elevation: 3,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingTop: 13,
  },
  headerLeft: {
    flexDirection: "column",
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: "row",
    paddingTop: 16,
  },
  headerIcon: {
    marginLeft: 8,
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
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
  },
  resultsCard: {
    padding: 0,
    marginTop: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  resultsGradientOverlay: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  titleContainer: {
    position: "relative",
    paddingLeft: 12,
  },
  titleAccent: {
    position: "absolute",
    left: 0,
    top: -4,
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
    marginBottom: 8,
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
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  currencySymbol: {
    fontSize: 16,
    paddingRight: 8,
  },
  percentSymbol: {
    fontSize: 16,
    paddingLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  quantityButtons: {
    flexDirection: "row",
  },
  unitButton: {
    margin: 0,
  },
  advancedToggleContainer: {
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 8,
    borderWidth: 1,
  },
  advancedToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  advancedSection: {
    marginTop: 8,
    marginBottom: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "500",
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
  resultLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  badge: {
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
  chartView: {
    width: "100%",
    marginTop: 8,
  },
  chartCard: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
    padding: 16,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
  },
  resultsContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  resultCardGradient: {
    borderRadius: 20,
    padding: 20,
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
  },
  netProfitContainer: {
    marginBottom: 16,
  },
  netProfitLabel: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  netProfitValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
  },
  netProfitValueText: {
    fontSize: 24,
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
    marginTop: 16,
  },
  metricsHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
  },
  metricTitle: {
    fontSize: 14,
    marginBottom: 8,
    letterSpacing: 0.3,
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
  },
  emptyStateCard: {
    padding: 0,
    marginTop: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  emptyStateGradient: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 24,
    alignItems: "center",
  },
  emptyStateIconContainer: {
    marginBottom: 16,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderRadius: 50,
    padding: 10,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyStateTipsContainer: {
    width: "100%",
    marginTop: 8,
  },
  emptyStateTipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyStateTipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  emptyStateTipText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
