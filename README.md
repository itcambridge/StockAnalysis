# Stock Analysis App with AI Insights

A full-stack financial analysis application that provides real-time stock metrics and AI-powered analysis. The app fetches current financial data and provides TTM (Trailing Twelve Months) and MRQ (Most Recent Quarter) metrics, along with AI-generated insights.

## Key Features

### Financial Metrics
- Real-time stock data from Alpha Vantage API
- Accurate financial ratios:
  - Debt to Equity Ratio (MRQ)
  - Free Cash Flow (TTM)
  - PE Ratio
  - PEG Ratio
  - Price to Book Ratio
  - Revenue Growth
  - Return on Equity
  - Market Capitalization

### AI Analysis
- GPT-3.5 powered financial analysis
- Comprehensive evaluation of:
  - Valuation metrics
  - Financial health
  - Growth potential

### User Interface
- Clean, responsive design
- Real-time data updates
- User authentication
- Error handling and loading states

## Tech Stack

### Frontend
- React.js
- Firebase Authentication
- CSS3 for styling

### Backend
- Flask (Python)
- OpenAI API
- Alpha Vantage API

## Setup

1. **Clone the Repository**
bash
git clone https://github.com/itcambridge/StockAnalysis.git
cd StockAnalysis

2. **Frontend Setup**
bash
cd frontend
npm install

3. **Backend Setup**
bash
cd backend
pip install -r requirements.txt

4. **Environment Variables**
Create a `.env` file in the backend directory:
env
ALPHA_VANTAGE_API_KEY=your_alphavantage_key
OPENAI_API_KEY=your_openai_key

5. **Running the Application**

Backend:
bash
cd backend
python app.py

Frontend:
bash
cd frontend
npm start

## Data Accuracy

- Free Cash Flow: Calculated using TTM (Trailing Twelve Months) data
- Debt to Equity: Uses MRQ (Most Recent Quarter) data
- All metrics are validated against major financial platforms

## Contributing

Feel free to submit issues and enhancement requests!

## License

[MIT License](LICENSE)