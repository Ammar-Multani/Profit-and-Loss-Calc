import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  useWindowDimensions,
  ListRenderItemInfo,
  Platform,
  Modal,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Currency, currencies } from "./CurrencySelectorScreen";

// Storage key for onboarding completion
export const ONBOARDING_COMPLETE_KEY = "profit-calculator-onboarding-complete";
export const THEME_PREFERENCE_KEY = "themeMode";
export const ACCOUNT_CURRENCY_KEY = "profit-calculator-account-currency";

// Type for theme option
interface ThemeOption {
  id: string;
  name: string;
  value: "light" | "dark" | "system";
  icon: string;
}

// Theme options
const themeOptions: ThemeOption[] = [
  {
    id: "light",
    name: "Light Theme",
    value: "light",
    icon: "wb-sunny",
  },
  {
    id: "dark",
    name: "Dark Theme",
    value: "dark",
    icon: "nightlight-round",
  },
  {
    id: "system",
    name: "System Default",
    value: "system",
    icon: "settings-suggest",
  },
];

// Type definition for onboarding item
interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Onboarding data
const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Welcome to Profit Calculator",
    description:
      "Your professional tool for accurate profit and loss analysis for your business decisions",
    icon: "bar-chart",
  },
  {
    id: "2",
    title: "Calculate Profit & Loss",
    description:
      "Enter buying price, selling price, and quantity to instantly see your profit margin and ROI",
    icon: "calculate",
  },
  {
    id: "3",
    title: "Select Your Currency",
    description:
      "Choose your preferred currency for more relevant profit calculations",
    icon: "account-balance-wallet",
  },
  {
    id: "4",
    title: "Choose Your Theme",
    description:
      "Customize your app experience with light, dark, or system theme to suit your preference",
    icon: "palette",
  },
  {
    id: "5",
    title: "Track Your History",
    description:
      "Save and revisit your calculations to analyze trends and make better decisions",
    icon: "history",
  },
];

// Onboarding screen component
const OnboardingScreen = ({ navigation }: { navigation: any }) => {
  const { colors, isDarkMode, themeMode, setThemeMode } = useTheme();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingItem>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >("system"); // default to system
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencies[0]
  ); // default to USD
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCurrencies, setFilteredCurrencies] =
    useState<Currency[]>(currencies);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;

  // Animate content when screen mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Update filtered currencies when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCurrencies(currencies);
    } else {
      const term = searchTerm.toLowerCase().trim();
      setFilteredCurrencies(
        currencies.filter(
          (currency) =>
            currency.code.toLowerCase().includes(term) ||
            currency.name.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm]);

  // Handle theme selection
  const handleThemeSelect = (themeValue: "light" | "dark" | "system") => {
    setSelectedTheme(themeValue);
    // Preview the theme preference
    setThemeMode(themeValue);
  };

  // Handle skip button press
  const handleSkip = async () => {
    // Save the selected theme
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, selectedTheme);

    // Save the selected currency
    await AsyncStorage.setItem(
      ACCOUNT_CURRENCY_KEY,
      JSON.stringify(selectedCurrency)
    );

    // Mark onboarding as complete in AsyncStorage
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    navigation.replace("Home");
  };

  // Handle next button press
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleSkip();
    }
  };

  // Handle currency selection
  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setShowCurrencyModal(false);
  };

  // Render pagination dots
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.4, 0.8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index.toString()}
              style={[
                styles.dot,
                {
                  opacity,
                  backgroundColor: colors.primary,
                  transform: [{ scale: dotScale }],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Render the logo header
  const renderLogoHeader = () => {
    return (
      <View style={styles.logoContainer}>
        <Image
          source={
            isDarkMode
              ? require("../../assets/splash-icon-dark.png")
              : require("../../assets/splash-icon-light.png")
          }
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    );
  };

  // Helper function for color based on type
  const getColorByType = (type: string) => {
    switch (type) {
      case "primary":
        return colors.primary;
      case "success":
        return colors.success;
      case "info":
        return isDarkMode ? "#29B6F6" : "#03A9F4";
      case "secondary":
        return isDarkMode ? "#BA68C8" : "#9C27B0";
      default:
        return colors.primary;
    }
  };

  // Render item helper for features page
  const renderFeatureCard = (
    icon: string,
    title: string,
    description: string,
    colorType: string
  ) => {
    return (
      <View
        style={[
          styles.featureCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.featureIconContainer,
            { backgroundColor: getColorByType(colorType) },
          ]}
        >
          <MaterialIcons name={icon as any} size={24} color="#fff" />
        </View>
        <Text style={[styles.featureTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.featureDescription, { color: colors.textSecondary }]}
        >
          {description}
        </Text>
      </View>
    );
  };

  // Render currency item
  const renderCurrencyItem = ({ item }: { item: Currency }) => {
    const isSelected = selectedCurrency.code === item.code;

    return (
      <TouchableOpacity
        style={[
          styles.currencyItem,
          {
            backgroundColor: colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          },
          isSelected && {
            backgroundColor: colors.primary + "15",
          },
        ]}
        onPress={() => handleCurrencySelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.currencyLeftContent}>
          <View style={styles.flagContainer}>
            <Image
              source={{
                uri: `https://flagcdn.com/w160/${item.countryCode.toLowerCase()}.png`,
              }}
              style={styles.flag}
              resizeMode="cover"
            />
          </View>
          <View style={styles.currencyInfo}>
            <Text style={[styles.currencyCode, { color: colors.text }]}>
              {item.code}
            </Text>
            <Text
              style={[styles.currencyName, { color: colors.textSecondary }]}
            >
              {item.name}
            </Text>
          </View>
        </View>
        <View style={styles.currencyRight}>
          <View
            style={[
              styles.symbolContainer,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Text style={[styles.currencySymbol, { color: colors.primary }]}>
              {item.symbol}
            </Text>
          </View>
          {isSelected && (
            <MaterialIcons
              name="check-circle"
              size={22}
              color={colors.primary}
              style={styles.checkIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render currency modal
  const renderCurrencyModal = () => {
    return (
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { backgroundColor: colors.primary }]}
          >
            <TouchableOpacity
              onPress={() => setShowCurrencyModal(false)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Base Currency</Text>
            <View style={styles.placeholder} />
          </View>

          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <MaterialIcons name="search" size={24} color={colors.primary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search available currencies..."
              placeholderTextColor={colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchTerm("")}
                activeOpacity={0.7}
                style={styles.clearButton}
              >
                <MaterialIcons
                  name="cancel"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredCurrencies}
            renderItem={renderCurrencyItem}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={20}
            windowSize={10}
            ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
          />
        </SafeAreaView>
      </Modal>
    );
  };

  // Render onboarding item
  const renderItem = ({ item, index }: ListRenderItemInfo<OnboardingItem>) => {
    // Animation values based on scroll position
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const translateXImage = scrollX.interpolate({
      inputRange,
      outputRange: [width * 0.5, 0, -width * 0.5],
      extrapolate: "clamp",
    });

    const translateXTitle = scrollX.interpolate({
      inputRange,
      outputRange: [width * 0.8, 0, -width * 0.8],
      extrapolate: "clamp",
    });

    const translateXDescription = scrollX.interpolate({
      inputRange,
      outputRange: [width, 0, -width],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

    // Currency selection slide (index === 2)
    if (index === 2) {
      return (
        <View style={[styles.slide, { width }]}>
          <Animated.View
            style={[
              styles.contentContainer,
              { opacity, transform: [{ translateY }] },
            ]}
          >
            <Animated.View
              style={{
                transform: [{ translateX: translateXImage }],
                opacity,
              }}
            >
              <MaterialIcons
                name={item.icon as any}
                size={40}
                color={colors.primary}
                style={styles.contentIcon}
              />
            </Animated.View>

            <Animated.Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  transform: [{ translateX: translateXTitle }],
                },
              ]}
            >
              {item.title}
            </Animated.Text>

            <Animated.Text
              style={[
                styles.description,
                {
                  color: colors.textSecondary,
                  marginBottom: 30,
                  transform: [{ translateX: translateXDescription }],
                },
              ]}
            >
              {item.description}
            </Animated.Text>

            <TouchableOpacity
              style={[
                styles.currencySelector,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowCurrencyModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.currencyLeftContent}>
                <View style={styles.flagContainer}>
                  <Image
                    source={{
                      uri: `https://flagcdn.com/w160/${selectedCurrency.countryCode.toLowerCase()}.png`,
                    }}
                    style={styles.flag}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.currencyInfo}>
                  <Text style={[styles.currencyCode, { color: colors.text }]}>
                    {selectedCurrency.code}
                  </Text>
                  <Text
                    style={[
                      styles.currencyName,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedCurrency.name}
                  </Text>
                </View>
              </View>
              <View style={styles.iconContainer}>
                <View
                  style={[
                    styles.symbolContainer,
                    {
                      backgroundColor: colors.primary + "15",
                    },
                  ]}
                >
                  <Text
                    style={[styles.currencySymbol, { color: colors.primary }]}
                  >
                    {selectedCurrency.symbol}
                  </Text>
                </View>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={24}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>

            <Animated.Text
              style={[
                styles.helpText,
                {
                  color: colors.textSecondary,
                  marginTop: 20,
                  transform: [{ translateX: translateXDescription }],
                },
              ]}
            >
              This currency will be used for all profit calculations and reports
            </Animated.Text>
          </Animated.View>
        </View>
      );
    }

    // Theme selection slide (index === 3)
    if (index === 3) {
      return (
        <View style={[styles.slide, { width }]}>
          <Animated.View
            style={[
              styles.contentContainer,
              { opacity, transform: [{ translateY }] },
            ]}
          >
            <Animated.View
              style={{
                transform: [{ translateX: translateXImage }],
                opacity,
              }}
            >
              <MaterialIcons
                name={item.icon as any}
                size={40}
                color={colors.primary}
                style={styles.contentIcon}
              />
            </Animated.View>

            <Animated.Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  transform: [{ translateX: translateXTitle }],
                },
              ]}
            >
              {item.title}
            </Animated.Text>

            <Animated.Text
              style={[
                styles.description,
                {
                  color: colors.textSecondary,
                  marginBottom: 30,
                  transform: [{ translateX: translateXDescription }],
                },
              ]}
            >
              {item.description}
            </Animated.Text>

            <View style={styles.themeOptionsContainer}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: colors.surface,
                      borderColor:
                        selectedTheme === option.value
                          ? colors.primary
                          : colors.border,
                      borderWidth: selectedTheme === option.value ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleThemeSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.themeIconContainer,
                      {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={option.icon as any}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <Text
                    style={[styles.themeOptionText, { color: colors.text }]}
                  >
                    {option.name}
                  </Text>
                  {selectedTheme === option.value && (
                    <MaterialIcons
                      name="check-circle"
                      size={22}
                      color={colors.primary}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Animated.Text
              style={[
                styles.helpText,
                {
                  color: colors.textSecondary,
                  marginTop: 20,
                  transform: [{ translateX: translateXDescription }],
                },
              ]}
            >
              You can always change your theme later in the app settings
            </Animated.Text>
          </Animated.View>
        </View>
      );
    }

    // Features page (last page)
    if (index === 4) {
      return (
        <View style={[styles.slide, { width }]}>
          <Animated.View
            style={[
              styles.contentContainer,
              { opacity, transform: [{ translateY }] },
            ]}
          >
            <Animated.View
              style={{
                transform: [{ translateX: translateXImage }],
                opacity,
              }}
            >
              <MaterialIcons
                name={item.icon as any}
                size={40}
                color={colors.primary}
                style={styles.contentIcon}
              />
            </Animated.View>

            <Animated.Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  transform: [{ translateX: translateXTitle }],
                },
              ]}
            >
              {item.title}
            </Animated.Text>

            <Animated.Text
              style={[
                styles.description,
                {
                  color: colors.textSecondary,
                  marginBottom: 30,
                  transform: [{ translateX: translateXDescription }],
                },
              ]}
            >
              {item.description}
            </Animated.Text>

            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                {renderFeatureCard(
                  "save",
                  "Save Calculations",
                  "Keep track of all your previous calculations",
                  "primary"
                )}
                {renderFeatureCard(
                  "share",
                  "Export Results",
                  "Share your calculations with others",
                  "success"
                )}
              </View>

              <View style={styles.featureRow}>
                {renderFeatureCard(
                  "show-chart",
                  "Visual Analysis",
                  "View charts of your profit breakdown",
                  "info"
                )}
                {renderFeatureCard(
                  "settings",
                  "Customizable",
                  "Configure the app to suit your needs",
                  "secondary"
                )}
              </View>
            </View>
          </Animated.View>
        </View>
      );
    }

    // Regular slide (index === 0 or index === 1)
    return (
      <View style={[styles.slide, { width }]}>
        <Animated.View
          style={[
            styles.contentContainer,
            { opacity, transform: [{ translateY }] },
          ]}
        >
          <Animated.View
            style={{
              transform: [{ translateX: translateXImage }],
              opacity,
            }}
          >
            <MaterialIcons
              name={item.icon as any}
              size={index === 0 ? 60 : 40}
              color={colors.primary}
              style={styles.contentIcon}
            />
          </Animated.View>

          <Animated.Text
            style={[
              styles.title,
              {
                color: colors.text,
                transform: [{ translateX: translateXTitle }],
              },
            ]}
          >
            {item.title}
          </Animated.Text>

          <Animated.Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
                transform: [{ translateX: translateXDescription }],
              },
            ]}
          >
            {item.description}
          </Animated.Text>

          {index === 0 && (
            <View style={styles.welcomeHighlightsContainer}>
              <Animated.View
                style={[
                  styles.welcomeHighlight,
                  {
                    backgroundColor: colors.primary + "15",
                    transform: [{ translateX: translateXDescription }],
                  },
                ]}
              >
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={colors.primary}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.highlightText, { color: colors.text }]}>
                  Easy to use interface
                </Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.welcomeHighlight,
                  {
                    backgroundColor: colors.primary + "15",
                    transform: [{ translateX: translateXDescription }],
                  },
                ]}
              >
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={colors.primary}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.highlightText, { color: colors.text }]}>
                  Instant calculations
                </Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.welcomeHighlight,
                  {
                    backgroundColor: colors.primary + "15",
                    transform: [{ translateX: translateXDescription }],
                  },
                ]}
              >
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={colors.primary}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.highlightText, { color: colors.text }]}>
                  Complete profit analysis
                </Text>
              </Animated.View>
            </View>
          )}

          {index === 1 && (
            <View style={styles.illustrationContainer}>
              <View
                style={[
                  styles.calculatorMockup,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.mockupField}>
                  <Text
                    style={[
                      styles.mockupLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Buying Price:
                  </Text>
                  <View
                    style={[
                      styles.mockupInput,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Text style={[styles.mockupValue, { color: colors.text }]}>
                      {selectedCurrency?.symbol || "$"}100.00
                    </Text>
                  </View>
                </View>
                <View style={styles.mockupField}>
                  <Text
                    style={[
                      styles.mockupLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Selling Price:
                  </Text>
                  <View
                    style={[
                      styles.mockupInput,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Text style={[styles.mockupValue, { color: colors.text }]}>
                      {selectedCurrency?.symbol || "$"}150.00
                    </Text>
                  </View>
                </View>
                <View style={styles.mockupField}>
                  <Text
                    style={[
                      styles.mockupLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Quantity:
                  </Text>
                  <View
                    style={[
                      styles.mockupInput,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Text style={[styles.mockupValue, { color: colors.text }]}>
                      100
                    </Text>
                  </View>
                </View>
                <View style={styles.mockupResult}>
                  <Text
                    style={[
                      styles.mockupResultLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Net Profit:
                  </Text>
                  <Text
                    style={[
                      styles.mockupResultValue,
                      { color: colors.success },
                    ]}
                  >
                    {selectedCurrency?.symbol || "$"}5,000.00
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {renderLogoHeader()}

      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        style={styles.flatList}
      />

      {renderPaginationDots()}
      {renderCurrencyModal()}

      <View style={styles.bottomContainer}>
        <View style={[styles.nextButton, { backgroundColor: colors.primary }]}>
          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButtonTouchable}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1
                ? "Get Started"
                : "Continue"}
            </Text>
            <MaterialIcons name="arrow-forward" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 10,
    zIndex: 10,
    right: 10,
  },
  logoImage: {
    width: 140,
    height: 140,
    marginRight: 8,
  },
  skipContainer: {
    position: "absolute",
    top: 60,
    right: 35,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.7,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 60,
  },
  contentIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
    letterSpacing: 0.3,
    marginBottom: 30,
  },
  welcomeHighlightsContainer: {
    width: "100%",
    marginTop: 20,
  },
  welcomeHighlight: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    width: "100%",
  },
  highlightText: {
    fontSize: 16,
    fontWeight: "600",
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
    alignItems: "center",
    width: "100%",
  },
  nextButton: {
    borderRadius: 30,
    overflow: "hidden",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  nextButtonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
    letterSpacing: 0.5,
  },
  // Feature card styles
  featuresContainer: {
    width: "100%",
    marginTop: 10,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  featureCard: {
    width: "48%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  // Calculator mockup
  illustrationContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  calculatorMockup: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mockupField: {
    marginBottom: 15,
  },
  mockupLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  mockupInput: {
    padding: 10,
    borderRadius: 8,
  },
  mockupValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  mockupResult: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  mockupResultLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mockupResultValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  // Theme selection styles
  themeOptionsContainer: {
    width: "100%",
    marginTop: 10,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  themeIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  helpText: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
    maxWidth: "90%",
    marginTop: 30,
    opacity: 0.7,
  },
  // Currency selection styles
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: "100%",
    marginTop: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currencyLeftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagContainer: {
    marginRight: 15,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  flag: {
    width: 35,
    height: 22,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.15)",
  },
  currencyInfo: {
    flexDirection: "column",
    marginLeft: 4,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 14,
    opacity: 0.8,
  },
  currencyRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  symbolContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === "android" ? 30 : 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "white",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    margin: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    padding: 4,
  },
  clearButton: {
    padding: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 40 : 16,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});

export default OnboardingScreen;
