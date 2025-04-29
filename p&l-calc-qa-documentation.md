# P & L Calc - QA Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [How the App Works](#how-the-app-works)
3. [Technical Implementation](#technical-implementation)
4. [User-Friendly Explanation](#user-friendly-explanation)
5. [Input/Output Flow](#inputoutput-flow)
6. [Key Formulas and Calculations](#key-formulas-and-calculations)
7. [User Testing Guide](#user-testing-guide)

## Project Overview

P & L Calc is a user-friendly mobile app that helps traders and investors quickly understand if their trades and investments are making money.

### What It Does

The app helps you see if your trades are profitable by calculating all the costs that impact your bottom line - not just buying and selling prices, but also commissions, fees, taxes, and other trading expenses.

### Why People Love It

- See if you're making money on trades at a glance
- Understand where your money is going with visual breakdowns
- Save and compare different trading scenarios
- Adjust calculations based on your investment strategy
- Works for beginners and professional traders alike

### Cool Features

- Simple and advanced calculation options
- Visual charts that make trading numbers easy to understand
- Save your calculations to review trading history
- Export results to share with other traders or your accountant
- Customize the app to your preferences
- Find your break-even point easily

### Who It's For

- Stock and cryptocurrency traders
- Investors tracking their portfolio returns
- Day traders and swing traders
- Resellers and flippers
- Financial planners helping clients with investment strategies

## How the App Works

### Getting Started

1. Download and open the app - no account needed!
2. Optional: Customize your experience in Settings
   - Choose simple or detailed calculations
   - Select light or dark theme
   - Set your preferred language

### Using the App

1. **Enter the basics**: Your entry price, exit price, and quantity
2. **Add details** (if you want): Commissions, fees, taxes
3. **Instant results**: The app automatically calculates everything
4. **See the breakdown**: View detailed results including:
   - Total revenue from your trades
   - Your costs and expenses
   - Your profit before and after expenses
   - Percentage returns and ROI
   - How far prices need to move to break even
5. **Visual chart**: See a colorful breakdown of your profits vs. costs
6. **Save or share**: Keep for later or export as a PDF
7. **Review history**: Look back at past trades

### What Each Input Means

- **Buying Price**: Your entry price per share/unit
- **Selling Price**: Your exit price per share/unit
- **Units**: Quantity of shares or items traded
- **Operating Expenses**: Fixed costs like subscriptions or tools
- **Buying Expenses**: Commissions or fees when buying
- **Selling Expenses**: Commissions or fees when selling
- **Tax Rate**: What percentage of profit goes to taxes

### What the Results Tell You

- **Revenue**: Total sale value of your position
- **Cost of Position**: What you paid to enter the position
- **Gross Profit**: Money left after position cost
- **Gross Margin**: Percentage of revenue that's gross profit
- **Total Expenses**: All your trading fees and costs
- **Operating Profit**: Money left after all expenses
- **Tax Amount**: What you'll pay in taxes on this trade
- **Net Profit**: What you actually get to keep
- **Net Margin**: Percentage of revenue that's actual profit
- **Investment**: Total capital you put at risk
- **ROI**: Percentage return on your investment
- **Break-even Point**: Price needed to cover all costs

## Technical Implementation

### Key Components and Their Relationships

The app is built using React Native with the following key components:

- **HomeScreen** (`app/screens/HomeScreen.tsx`): Main interface for calculations
- **HistoryScreen** (`app/screens/HistoryScreen.tsx`): Displays saved calculations
- **SettingsScreen** (`app/screens/SettingsScreen.tsx`): User configuration options
- **Calculation Utilities** (`app/utils/calculations.ts`): Core calculation logic
- **Storage Utilities** (`app/utils/storage.ts`): Data persistence
- **Types** (`app/types/index.ts`): TypeScript interfaces for data structures

The app follows a component-based architecture where calculation logic is separated from the UI components. Data flows from user inputs to calculation functions and then to the display components.

### Important Algorithms

The core calculation algorithm is in `calculateResults` function:

```51:123:app/utils/calculations.ts
export function calculateResults(trade: TradeCalculation): CalculationResult {
  const {
    entryPrice,
    exitPrice,
    quantity,
    commission,
    slippage,
    positionFees,
    taxRate,
    includeCommission,
    includeSlippage,
    includePositionFees,
    includeTax,
    stopLoss
  } = trade;

  // Calculate base profit/loss
  const positionValue = entryPrice * quantity;
  const exitValue = exitPrice * quantity;
  const rawProfitLoss = exitValue - positionValue;

  // Calculate costs
  const commissionCost = includeCommission ? (positionValue * (commission / 100)) + (exitValue * (commission / 100)) : 0;
  const slippageCost = includeSlippage ? slippage : 0;
  const feesCost = includePositionFees ? positionFees : 0;
  const totalCosts = commissionCost + slippageCost + feesCost;

  // Calculate net profit/loss
  let netProfitLoss = rawProfitLoss - totalCosts;

  // Apply tax if applicable
  if (includeTax && netProfitLoss > 0) {
    const taxAmount = netProfitLoss * (taxRate / 100);
    netProfitLoss -= taxAmount;
  }

  // Calculate percentage return
  const profitLossPercentage = (netProfitLoss / positionValue) * 100;

  // Calculate break-even price
  const breakEvenPrice = entryPrice + (totalCosts / quantity);

  // Calculate required price movement for profit
  const requiredPriceMovement = breakEvenPrice - entryPrice;

  // Calculate risk/reward ratio if stop loss is provided
  let riskRewardRatio = null;
  let maxDrawdown = null;

  if (stopLoss) {
    const potentialLoss = Math.abs((entryPrice - stopLoss) * quantity);
    const potentialGain = netProfitLoss > 0 ? netProfitLoss : 0;

    if (potentialLoss > 0) {
      riskRewardRatio = potentialGain / potentialLoss;
    }

    maxDrawdown = ((entryPrice - stopLoss) / entryPrice) * 100;
  }

  return {
    profitLoss: rawProfitLoss,
    profitLossPercentage,
    riskRewardRatio,
    breakEvenPrice,
    requiredPriceMovement,
    maxDrawdown,
    positionValue,
    totalCosts,
    netProfitLoss
  };
}
```

The HomeScreen also contains calculation logic for the main profit and loss functions:

```51:118:app/screens/HomeScreen.tsx
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
```

### Data Flow Between Components

1. User inputs values in HomeScreen
2. HomeScreen calls calculateAndUpdateResults() function
3. Results are stored in state and displayed to user
4. When saved, calculation is stored in AsyncStorage
5. HistoryScreen retrieves saved calculations for display
6. User can delete or view details of historical calculations

### External Services/APIs Integration

- PDF export functionality using react-native-view-shot
- AsyncStorage for local data persistence

## User-Friendly Explanation

### The App in Everyday Terms

Think of P&L Calc like a smart trading calculator that answers the question: "Did I actually make money on this trade?"

Just like trading involves more than just buying low and selling high (you also pay commissions, platform fees, etc.), this app helps you see your true trading performance by factoring in all costs.

### Real-Life Example: First Stock Trade

Imagine you're making your first stock trade:

1. **What you put in the app:**

   - Buy shares at $10 each
   - Sell shares at $12 each
   - Buy 50 shares
   - Commission: $5 per trade ($5 to buy, $5 to sell)

2. **What the app shows you:**

   - Total sale value: $600 (50 shares × $12)
   - Cost of shares: $500 (50 shares × $10)
   - Commission costs: $10 ($5 buy + $5 sell)
   - Profit: $90
   - Return on investment: 17.6%
   - Break-even price: $10.10 per share

3. **What this means in plain language:**
   - You made $90 profit on this trade
   - You earned a 17.6% return on your money
   - The stock only needed to rise to $10.10 to cover your costs
   - Despite the $2 per share price increase, your actual profit was reduced by commissions

### Trading Scenarios

## Example 1: Stock Trading

**Scenario**: John buys and sells shares of a tech company.

**Inputs:**

- Buy Price: $45 per share
- Sell Price: $52 per share
- Quantity: 100 shares
- Buying Expenses: $0.10 per share (commission)
- Selling Expenses: $0.10 per share (commission)
- Operating Expenses: $20 (research subscription)

**App Calculation:**

- Revenue: $5,200 (100 shares × $52)
- COGS: $4,510 (($45 + $0.10) × 100)
- Gross Profit: $690
- Total Expenses: $30 ($20 + $0.10 × 100)
- Net Profit: $660
- ROI: 14.6%

This correctly shows John his true trading profit after accounting for all costs associated with the trade.

## Example 2: Sneaker Reselling

**Scenario**: Alex buys limited edition sneakers online and resells them.

**Inputs:**

- Buy Price: $120 per pair
- Sell Price: $200 per pair
- Quantity: 5 pairs
- Buying Expenses: $0 (free shipping)
- Selling Expenses: $15 per pair (marketplace fees + shipping)
- Operating Expenses: $25 (storage and photography)

**App Calculation:**

- Revenue: $1,000 (5 pairs × $200)
- COGS: $600 ($120 × 5)
- Gross Profit: $400
- Total Expenses: $100 ($25 + $15 × 5)
- Net Profit: $300
- ROI: 42.9%

This correctly shows Alex's profit on each sneaker flip, making it perfect for resellers tracking their business performance.

### Special Situations Made Simple

**When You Take a Loss:**
If your exit price is lower than your entry price plus expenses, the app shows negative numbers and doesn't calculate taxes (since you don't pay tax on losses). This helps you quickly assess losing trades.

**Finding Your Break-Even Price:**
The app tells you exactly what price you need to sell at to break even. For example, if you buy at $50 with $2 in commissions per share, your break-even price is $52, helping you set appropriate stop-losses and take-profit orders.

**When Some Numbers Are Zero:**
The app handles situations where you might enter zero for some values, such as commission-free trades, giving you meaningful results without errors.

## Input/Output Flow

```
You Enter Trade Data → App Checks They Make Sense → App Calculates Results → You See Trade Analysis
```

### What You Enter

```
Basic Information (Required):
- Entry Price (what you pay per unit)
- Exit Price (what you sell for per unit)
- Quantity (number of shares/units)

Additional Details (Optional):
- Fixed Expenses (subscriptions, tools)
- Entry Commissions and Fees
- Exit Commissions and Fees
- Tax Rate
```

### How the App Processes Your Information

```
First, the app checks if you've provided the basic required information
↓
Then it converts everything to numbers the app can calculate with
↓
It performs calculations in this order:
  1. Calculate total position value (entry price × quantity)
  2. Calculate total exit value (exit price × quantity)
  3. Calculate raw profit/loss
  4. Add up all commissions and fees
  5. Calculate profit after costs
  6. Calculate tax (if you're profitable)
  7. Calculate final profit
  8. Calculate percentages (ROI, profit margin)
  9. Calculate break-even price
↓
Finally, it displays all results with proper formatting
```

### How Errors Are Handled

The app is designed to prevent common mistakes:

- If you enter text instead of numbers, it converts to zero
- If you try to divide by zero, it protects against errors
- If you enter negative numbers, it still calculates correctly
- If calculations produce invalid results, it shows zero instead

## Key Formulas and Calculations

### How Position Value Is Calculated

**The Simple Version**: Total Position Value = Entry Price × Quantity

**Example With Real Numbers**: If you buy 100 shares at $25 each, your position value is $25 × 100 = $2,500

### How Exit Value Is Calculated

**The Simple Version**: Exit Value = Exit Price × Quantity

**Example With Real Numbers**: If you sell 100 shares at $30 each, your exit value is $30 × 100 = $3,000

### How Raw Profit/Loss Is Calculated

**The Simple Version**:

- Raw Profit/Loss = Exit Value - Position Value
- Profit Percentage = (Raw Profit ÷ Position Value) × 100

**Example With Real Numbers**: With $3,000 exit value and $2,500 position value:

- Raw Profit = $3,000 - $2,500 = $500
- Profit Percentage = ($500 ÷ $2,500) × 100 = 20%

### How Net Profit Is Calculated

**The Simple Version**:

- Total Costs = Commission Costs + Fees + Other Expenses
- Net Profit = Raw Profit - Total Costs
- Tax = Net Profit × (Tax Rate ÷ 100) (if profitable)
- Final Profit = Net Profit - Tax

**Example With Real Numbers**: If you have $500 raw profit, $30 in commissions, and 20% tax rate:

- Total Costs = $30
- Net Profit = $500 - $30 = $470
- Tax = $470 × 20% = $94
- Final Profit = $470 - $94 = $376

### How Return on Investment (ROI) Is Calculated

**The Simple Version**: ROI = (Final Profit ÷ Total Investment) × 100

**Example With Real Numbers**: If your final profit is $376 and total investment is $2,530:

- ROI = ($376 ÷ $2,530) × 100 = 14.86%

### How Break-Even Price Is Calculated

**The Simple Version**: Break-Even Price = Entry Price + (Total Costs ÷ Quantity)

**Example With Real Numbers**: If your entry price is $25, total costs are $30, and quantity is 100:

- Break-Even Price = $25 + ($30 ÷ 100) = $25.30

## User Testing Guide

### How to Test the App Like a Real Trader

This section helps you make sure the app works the way real traders will use it, focusing on everyday trading scenarios.

### Real-World Testing Scenarios

1. **First-Time Trader Experience**

   - Open the app for the first time
   - Can a new trader figure out how to use it without instructions?
   - Try entering a basic stock trade to see if it works
   - Check if the results make sense to someone new to trading

2. **Common Trading Use Cases**
   - Try calculating profit for a simple stock purchase and sale
   - Add commission costs and see how they affect profit
   - Try saving a calculation to trading history
   - Try dark mode for night trading sessions
3. **Error Prevention**
   - What happens if you enter letters instead of numbers?
   - What happens if you leave fields blank?
   - Does the app warn you about potential errors?
   - Can you easily correct mistakes?

### Practical Test Scenarios

#### Scenario 1: Cryptocurrency Trading

**The Story**: Maria trades Bitcoin on a crypto exchange.

**To Test**:

- Buy price: $28,500 per BTC
- Sell price: $30,200 per BTC
- Quantity: 0.5 BTC
- Trading fees: 0.1% on both entry and exit
- Operating expenses: $15 (premium charting tool subscription)

**Expected Experience**:

- The app should calculate the 0.1% fee correctly
- The decimal quantity should be handled properly
- The profit should account for all fees

**Success Looks Like**: Maria can clearly see her actual profit after all exchange fees and tool costs.

#### Scenario 2: Day Trading Stocks

**The Story**: Carlos is day trading tech stocks with multiple trades per day.

**To Test**:

- Buy price: $150 per share
- Sell price: $152.50 per share
- Quantity: 200 shares
- Commission: $5 flat fee per trade
- Operating expenses: $30 (data feed)

**Expected Experience**:

- App calculates both percentage gain and dollar profit
- Shows break-even price clearly
- Allows quick saving of multiple trade calculations

**Success Looks Like**: Carlos can quickly log each trade and see if his day trading strategy is profitable after commissions and data costs.

#### Scenario 3: Options Trading Loss

**The Story**: Taylor bought call options that expired with less value.

**To Test**:

- Buy price: $3.50 per contract
- Sell price: $1.75 per contract
- Quantity: 10 contracts (each represents 100 shares)
- Commission: $0.65 per contract
- Contract multiplier: 100 (standard for options)

**Expected Experience**:

- App clearly shows the loss
- No tax is calculated on the loss
- Option contract multiplier can be factored in

**Success Looks Like**: Taylor can see exactly how much was lost on the options trade, including commissions.

### Usability Checkpoints

**Ease of Use**

- Can traders enter information quickly between trades?
- Is the calculation instant for quick trading decisions?
- Are results clear and understandable for trading analysis?

**Visual Clarity**

- Are charts easy to understand for performance review?
- Is text readable in both light and dark mode for day/night trading?
- Do colors help distinguish between profitable and losing trades?

**Performance**

- Does the app respond quickly during active trading sessions?
- Do charts update smoothly as new data is entered?
- Does trading history load quickly for reference?

### Common Issues to Watch For

1. **Trader Confusion**

   - Unclear labels for trading terminology
   - Misunderstanding of fee calculations
   - Difficulty interpreting results for decision-making

2. **Display Problems**

   - Text too small to read during fast-paced trading
   - Charts not scaling properly for different asset values
   - Keyboard covering input fields during mobile trading

3. **Calculation Issues**

   - Incorrect handling of percentage-based vs. flat commissions
   - Confusing profit/loss displays
   - Rounding errors in final results

4. **Saving & Sharing**
   - Problems saving trades to history
   - PDF export errors for trade records
   - Sharing functionality issues when sending to advisors

The best testing comes from watching real traders use the app and solving the problems they actually encounter during trading sessions.
