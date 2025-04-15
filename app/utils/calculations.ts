import { TradeCalculation, CalculationResult } from '../types';

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

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}

export function calculatePositionSize(
  accountSize: number,
  riskPercentage: number,
  entryPrice: number,
  stopLoss: number
): number {
  if (!stopLoss || entryPrice === stopLoss) return 0;
  
  const riskAmount = accountSize * (riskPercentage / 100);
  const priceDifference = Math.abs(entryPrice - stopLoss);
  
  return riskAmount / priceDifference;
}

export function calculateStopLoss(
  entryPrice: number,
  riskPercentage: number
): number {
  return entryPrice * (1 - riskPercentage / 100);
}

export function calculateTakeProfit(
  entryPrice: number,
  stopLoss: number,
  riskRewardRatio: number
): number {
  const riskAmount = Math.abs(entryPrice - stopLoss);
  const rewardAmount = riskAmount * riskRewardRatio;
  
  return entryPrice + rewardAmount;
}