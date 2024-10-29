import os
import time
import random
import requests
from openai import OpenAI
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Initialize OpenAI client using environment variable
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def get_random_user_agent():
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
    ]
    return random.choice(user_agents)

def get_stock_info(symbol, max_retries=3):
    ALPHA_VANTAGE_API_KEY = os.getenv('ALPHA_VANTAGE_API_KEY')
    
    if not ALPHA_VANTAGE_API_KEY:
        print("Warning: ALPHA_VANTAGE_API_KEY not found in environment variables")
        return None
    
    for attempt in range(max_retries):
        try:
            # Get Overview data
            overview_url = f'https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
            overview_response = requests.get(overview_url, timeout=5)
            overview_data = overview_response.json()

            # Add delay to avoid API rate limits
            time.sleep(0.5)

            # Get Quote data
            quote_url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
            quote_response = requests.get(quote_url, timeout=5)
            quote_data = quote_response.json()

            # Add delay to avoid API rate limits
            time.sleep(0.5)

            # Get Cash Flow Statement
            cashflow_url = f'https://www.alphavantage.co/query?function=CASH_FLOW&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
            cashflow_response = requests.get(cashflow_url, timeout=5)
            cashflow_data = cashflow_response.json()

            # Add Balance Sheet request for quarterly data
            balance_sheet_url = f'https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
            balance_sheet_response = requests.get(balance_sheet_url, timeout=5)
            balance_sheet_data = balance_sheet_response.json()

            if 'Global Quote' in quote_data and overview_data:
                quote = quote_data['Global Quote']
                
                # Calculate Free Cash Flow (TTM) from quarterly data
                free_cash_flow = None
                if 'quarterlyReports' in cashflow_data and len(cashflow_data['quarterlyReports']) >= 4:
                    ttm_free_cash_flow = 0
                    for quarter in cashflow_data['quarterlyReports'][:4]:  # Get last 4 quarters
                        operating_cashflow = safe_float_convert(quarter.get('operatingCashflow', '0'))
                        capital_expenditure = safe_float_convert(quarter.get('capitalExpenditures', '0'))
                        
                        if operating_cashflow is not None and capital_expenditure is not None:
                            quarter_fcf = operating_cashflow - abs(capital_expenditure)
                            ttm_free_cash_flow += quarter_fcf
                            print(f"Debug - Quarterly Free Cash Flow:")
                            print(f"Report Date: {quarter.get('fiscalDateEnding')}")
                            print(f"Operating Cash Flow: {operating_cashflow}")
                            print(f"Capital Expenditure: {capital_expenditure}")
                            print(f"Quarter FCF: {quarter_fcf}")
                    
                    free_cash_flow = ttm_free_cash_flow
                    print(f"Debug - TTM Free Cash Flow: {free_cash_flow}")

                # Calculate Debt to Equity from quarterly data
                debt_to_equity = None
                if 'quarterlyReports' in balance_sheet_data and balance_sheet_data['quarterlyReports']:
                    latest_quarter = balance_sheet_data['quarterlyReports'][0]
                    
                    # Get all debt components from quarterly data
                    long_term_debt = safe_float_convert(latest_quarter.get('longTermDebt', '0'))
                    short_term_debt = safe_float_convert(latest_quarter.get('shortTermDebt', '0'))
                    current_debt = safe_float_convert(latest_quarter.get('currentDebt', '0'))
                    operating_lease = safe_float_convert(latest_quarter.get('operatingLeaseNonCurrent', '0'))
                    total_equity = safe_float_convert(latest_quarter.get('totalShareholderEquity', '0'))
                    
                    # Print raw values for debugging
                    print(f"Debug - Raw values from quarterly balance sheet:")
                    print(f"Report Date: {latest_quarter.get('fiscalDateEnding')}")
                    print(f"Long Term Debt: {latest_quarter.get('longTermDebt')}")
                    print(f"Short Term Debt: {latest_quarter.get('shortTermDebt')}")
                    print(f"Current Debt: {latest_quarter.get('currentDebt')}")
                    print(f"Operating Lease: {latest_quarter.get('operatingLeaseNonCurrent')}")
                    print(f"Total Shareholder Equity: {latest_quarter.get('totalShareholderEquity')}")
                    
                    if total_equity and total_equity != 0:
                        # Include operating lease in total debt calculation
                        total_debt = (long_term_debt or 0) + (short_term_debt or 0) + (current_debt or 0) + (operating_lease or 0)
                        debt_to_equity = round(total_debt / total_equity, 4)
                        print(f"Debug - Calculated from quarterly balance sheet:")
                        print(f"Total Debt: {total_debt}")
                        print(f"Total Equity: {total_equity}")
                        print(f"Calculated Ratio: {debt_to_equity}")

                info = {
                    'longName': overview_data.get('Name', symbol),
                    'currentPrice': safe_float_convert(quote.get('05. price')),
                    'sector': overview_data.get('Sector', 'N/A'),
                    'industry': overview_data.get('Industry', 'N/A'),
                    
                    # Valuation Metrics
                    'trailingPE': safe_float_convert(overview_data.get('TrailingPE')),
                    'forwardPE': safe_float_convert(overview_data.get('ForwardPE')),
                    'priceToBook': safe_float_convert(overview_data.get('PriceToBookRatio')),
                    'pegRatio': safe_float_convert(overview_data.get('PEGRatio')),
                    'evToEBITDA': safe_float_convert(overview_data.get('EVToEBITDA')),
                    'dividendYield': safe_float_convert(overview_data.get('DividendYield')),
                    
                    # Financial Health
                    'marketCap': safe_float_convert(overview_data.get('MarketCapitalization')),
                    'revenueGrowth': safe_float_convert(overview_data.get('QuarterlyRevenueGrowthYOY')),
                    'profitMargin': safe_float_convert(overview_data.get('ProfitMargin')),
                    'operatingMargin': safe_float_convert(overview_data.get('OperatingMarginTTM')),
                    'debtToEquity': debt_to_equity,
                    'returnOnEquity': safe_float_convert(overview_data.get('ReturnOnEquityTTM')),
                    'freeCashFlow': free_cash_flow
                }
                
                return info

            print(f"Attempt {attempt + 1}: Invalid response format")
            print(f"Overview data: {overview_data}")
            print(f"Quote data: {quote_data}")
            
            if attempt < max_retries - 1:
                time.sleep(1)
                
        except requests.exceptions.Timeout:
            print(f"Attempt {attempt + 1} timed out")
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            
        if attempt < max_retries - 1:
            time.sleep(2)
            
    return None

def safe_float_convert(value):
    """Safely convert a value to float, returning None if conversion fails"""
    if value is None or value == 'None' or value == '':
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

@app.route('/api/analyze/<symbol>', methods=['GET'])
def analyze_stock(symbol):
    try:
        info = get_stock_info(symbol.upper())
        
        if not info:
            return jsonify({"error": "Unable to fetch stock data. Please try again later."}), 400

        # Create data for GPT analysis
        data_for_gpt = f"""
        Stock: {symbol.upper()}
        Company: {info.get('longName', 'N/A')}
        Current Price: ${info.get('currentPrice', 'N/A')}
        
        Key Statistics:
        PE Ratio: {info.get('trailingPE', 'N/A')}
        Forward PE: {info.get('forwardPE', 'N/A')}
        PEG Ratio: {info.get('pegRatio', 'N/A')}
        Price to Book: {info.get('priceToBook', 'N/A')}
        Market Cap: {info.get('marketCap', 'N/A')}
        Revenue Growth: {info.get('revenueGrowth', 'N/A')}
        Debt to Equity: {info.get('debtToEquity', 'N/A')}
        Return on Equity: {info.get('returnOnEquity', 'N/A')}
        Free Cash Flow: {info.get('freeCashFlow', 'N/A')}
        """

        return jsonify({
            "companyName": info.get('longName', 'N/A'),
            "currentPrice": info.get('currentPrice'),
            "sector": info.get('sector'),
            "industry": info.get('industry'),
            "statistics": {
                "Valuation Metrics": {
                    "PE Ratio": info.get('trailingPE'),
                    "Forward PE": info.get('forwardPE'),
                    "PEG Ratio": info.get('pegRatio'),
                    "Price to Book": info.get('priceToBook'),
                    "Dividend Yield": info.get('dividendYield')
                },
                "Financial Health": {
                    "Market Cap": info.get('marketCap'),
                    "Revenue Growth": info.get('revenueGrowth'),
                    "Debt to Equity": info.get('debtToEquity'),
                    "Return on Equity": info.get('returnOnEquity'),
                    "Free Cash Flow": info.get('freeCashFlow')
                }
            },
            "gptAnalysis": get_gpt_analysis(data_for_gpt)
        })

    except Exception as e:
        print(f"Error processing request for symbol {symbol}: {str(e)}")
        return jsonify({
            "error": "Unable to fetch stock data. Please try again."
        }), 400

def get_gpt_analysis(data):
    try:
        prompt = f"""
        You are a financial analyst. Based on the following stock data, provide a brief analysis 
        of the stock's financial health and potential as an investment. Consider:
        1. Valuation (PE Ratio, PEG Ratio, Price to Book)
        2. Financial Health (Debt to Equity, Free Cash Flow)
        3. Growth Metrics (Revenue Growth, Return on Equity)
        
        Keep your response focused and under 150 words.

        {data}

        Analysis:
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a concise financial analyst focused on key metrics and their implications."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"GPT Analysis error: {str(e)}")
        return "AI analysis temporarily unavailable. Please try again later."

if __name__ == '__main__':
    app.run(debug=True)
