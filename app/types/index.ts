export interface TradeCalculation {
  id: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  commission: number;
  slippage: number;
  positionFees: number;
  taxRate: number;
  includeCommission: boolean;
  includeSlippage: boolean;
  includePositionFees: boolean;
  includeTax: boolean;
  stopLoss: number | null;
  takeProfit: number | null;
  timestamp: number;
  notes: string;
}

export interface CalculationResult {
  profitLoss: number;
  profitLossPercentage: number;
  riskRewardRatio: number | null;
  breakEvenPrice: number;
  requiredPriceMovement: number;
  maxDrawdown: number | null;
  positionValue: number;
  totalCosts: number;
  netProfitLoss: number;
}

export interface HistoryItem extends TradeCalculation {
  result: CalculationResult;
}

export interface ChartData {
  revenue: number;
  costOfGoodsSold: number;
  totalExpenses: number;
  netProfit: number;
}
