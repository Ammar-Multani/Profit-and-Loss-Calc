import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { Alert, Platform } from "react-native";

interface ResultsData {
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

interface ExportToPdfOptions {
  resultsData: ResultsData;
  fileName?: string;
  buyingPrice: number;
  sellingPrice: number;
  units: number;
  operatingExpenses: number;
  buyingExpensesPerUnit: number;
  sellingExpensesPerUnit: number;
  taxRate: number;
}

export const exportToPdf = async ({
  resultsData,
  fileName = "profit-loss-results",
  buyingPrice,
  sellingPrice,
  units,
  operatingExpenses,
  buyingExpensesPerUnit,
  sellingExpensesPerUnit,
  taxRate,
}: ExportToPdfOptions) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const pdfFileName = `${fileName}-${timestamp}.pdf`;

    // Format currency
    const formatCurrency = (value: number): string => {
      return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    // Format percentage
    const formatPercentage = (value: number): string => {
      return `${value.toFixed(2)}%`;
    };

    // Determine profit or loss color
    const profitColor = resultsData.netProfit >= 0 ? "#4CAF50" : "#F44336";
    const profitStatus = resultsData.netProfit >= 0 ? "Profit" : "Loss";

    // Create HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Profit & Loss Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.5;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #eee;
              padding-bottom: 10px;
            }
            .header h1 {
              color: #2196F3;
              margin-bottom: 5px;
            }
            .header p {
              color: #757575;
              margin-top: 0;
            }
            .summary {
              background-color: #f9f9f9;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
              border-left: 4px solid ${profitColor};
            }
            .summary-title {
              color: ${profitColor};
              font-size: 22px;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .profit-value {
              font-size: 28px;
              font-weight: bold;
              color: ${profitColor};
              margin: 10px 0;
            }
            .input-section, .results-section {
              margin-bottom: 30px;
            }
            .section-title {
              color: #2196F3;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 12px 15px;
              border-bottom: 1px solid #ddd;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .metrics-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              margin-top: 15px;
            }
            .metric-card {
              flex: 1;
              min-width: 200px;
              background-color: #f9f9f9;
              border-radius: 8px;
              padding: 15px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .metric-title {
              color: #757575;
              margin-top: 0;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .metric-value {
              font-size: 20px;
              font-weight: bold;
              margin: 0;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #757575;
              font-size: 12px;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Profit & Loss Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="summary">
            <h2 class="summary-title">Summary - ${profitStatus}</h2>
            <p class="profit-value">${formatCurrency(
              Math.abs(resultsData.netProfit)
            )}</p>
            <p>Net Profit Margin: ${formatPercentage(
              resultsData.netProfitMargin
            )}</p>
            <p>Return on Investment: ${formatPercentage(resultsData.roi)}</p>
          </div>
          
          <div class="input-section">
            <h2 class="section-title">Input Values</h2>
            <table>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
              </tr>
              <tr>
                <td>Buying Price</td>
                <td>${formatCurrency(buyingPrice)}</td>
              </tr>
              <tr>
                <td>Selling Price</td>
                <td>${formatCurrency(sellingPrice)}</td>
              </tr>
              <tr>
                <td>Units</td>
                <td>${units}</td>
              </tr>
              <tr>
                <td>Operating Expenses</td>
                <td>${formatCurrency(operatingExpenses)}</td>
              </tr>
              <tr>
                <td>Buying Expenses Per Unit</td>
                <td>${formatCurrency(buyingExpensesPerUnit)}</td>
              </tr>
              <tr>
                <td>Selling Expenses Per Unit</td>
                <td>${formatCurrency(sellingExpensesPerUnit)}</td>
              </tr>
              <tr>
                <td>Tax Rate</td>
                <td>${formatPercentage(taxRate)}</td>
              </tr>
            </table>
          </div>
          
          <div class="results-section">
            <h2 class="section-title">Financial Results</h2>
            <table>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Percentage</th>
              </tr>
              <tr>
                <td>Revenue</td>
                <td>${formatCurrency(resultsData.revenue)}</td>
                <td>100%</td>
              </tr>
              <tr>
                <td>Cost of Goods Sold</td>
                <td>${formatCurrency(resultsData.costOfGoodsSold)}</td>
                <td>${formatPercentage(
                  (resultsData.costOfGoodsSold / resultsData.revenue) * 100
                )}</td>
              </tr>
              <tr>
                <td>Gross Profit</td>
                <td>${formatCurrency(resultsData.grossProfit)}</td>
                <td>${formatPercentage(resultsData.grossProfitMargin)}</td>
              </tr>
              <tr>
                <td>Total Expenses</td>
                <td>${formatCurrency(resultsData.totalExpenses)}</td>
                <td>${formatPercentage(
                  (resultsData.totalExpenses / resultsData.revenue) * 100
                )}</td>
              </tr>
              <tr>
                <td>Operating Profit</td>
                <td>${formatCurrency(resultsData.operatingProfit)}</td>
                <td>${formatPercentage(
                  (resultsData.operatingProfit / resultsData.revenue) * 100
                )}</td>
              </tr>
              <tr>
                <td>Tax Amount</td>
                <td>${formatCurrency(resultsData.taxAmount)}</td>
                <td>${formatPercentage(
                  (resultsData.taxAmount / resultsData.revenue) * 100
                )}</td>
              </tr>
              <tr style="font-weight: bold; background-color: ${profitColor}25;">
                <td>Net Profit</td>
                <td>${formatCurrency(Math.abs(resultsData.netProfit))}</td>
                <td>${formatPercentage(
                  Math.abs(resultsData.netProfitMargin)
                )}</td>
              </tr>
            </table>
            
            <h3 class="section-title">Key Metrics</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <h4 class="metric-title">ROI (Return on Investment)</h4>
                <p class="metric-value" style="color: ${
                  resultsData.roi >= 0 ? "#4CAF50" : "#F44336"
                }">
                  ${formatPercentage(resultsData.roi)}
                </p>
              </div>
              
              <div class="metric-card">
                <h4 class="metric-title">Investment</h4>
                <p class="metric-value">${formatCurrency(
                  resultsData.investment
                )}</p>
              </div>
              
              ${
                resultsData.breakEvenUnits > 0
                  ? `
                <div class="metric-card">
                  <h4 class="metric-title">Break-even Point</h4>
                  <p class="metric-value">${resultsData.breakEvenUnits} units</p>
                </div>
              `
                  : ""
              }
            </div>
          </div>
          
          <div class="footer">
            <p>Generated using Profit & Loss Calculator</p>
          </div>
        </body>
      </html>
    `;

    try {
      // Generate PDF using expo-print
      console.log("Creating PDF from HTML...");
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        width: 612, // US Letter width in points
        height: 792, // US Letter height in points
        base64: false,
      });

      console.log("PDF Created at:", uri);

      // Export the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Save Profit & Loss Report",
          UTI: "com.adobe.pdf",
        });
        return uri;
      } else {
        Alert.alert(
          "Sharing not available",
          "Sharing is not available on this device"
        );
        return null;
      }
    } catch (error) {
      console.error("Error generating PDF:", error);

      // Fallback: Save HTML directly if PDF generation fails
      try {
        console.log("Attempting to save as HTML instead...");
        const htmlFilePath = `${FileSystem.cacheDirectory}${fileName}.html`;

        await FileSystem.writeAsStringAsync(htmlFilePath, htmlContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        await Sharing.shareAsync(htmlFilePath, {
          mimeType: "text/html",
          dialogTitle: "Save Profit & Loss Report as HTML",
          UTI: "public.html",
        });

        return htmlFilePath;
      } catch (htmlError) {
        console.error("Error saving as HTML:", htmlError);
        throw error; // Re-throw the original error
      }
    }
  } catch (error) {
    console.error("Error exporting results to PDF:", error);
    Alert.alert(
      "Export Failed",
      "There was an error exporting your results to PDF. Please try again."
    );
    return null;
  }
};
