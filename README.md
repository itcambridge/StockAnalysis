# Stock Analysis App

A full-stack application that provides financial analysis of stocks using:
- Real-time stock data from Alpha Vantage API
- AI-powered analysis using OpenAI's GPT-3.5
- React frontend
- Flask backend

## Features
- Stock metrics analysis
- Debt to Equity ratio (MRQ)
- Free Cash Flow (TTM)
- AI-generated stock analysis
- User authentication

## Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   pip install -r requirements.txt
   ```
3. Create .env file with your API keys:
   ```
   ALPHA_VANTAGE_API_KEY=your_key
   OPENAI_API_KEY=your_key
   ```
4. Run the application:
   ```bash
   # Frontend
   npm start

   # Backend
   python app.py