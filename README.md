# Stock Analysis App

## Overview
This Stock Analysis App is a web application that allows users to analyze stocks using real-time data and AI-powered insights. Users can enter a stock symbol and receive key statistics and an AI-generated analysis of the stock's performance and potential.

## Features
- User authentication with Google Sign-In
- Real-time stock data fetching
- AI-powered stock analysis
- Dark mode for comfortable viewing
- Responsive design for desktop and mobile use

## Technologies Used
- Frontend: React.js
- Backend: Flask (Python)
- APIs: Yahoo Finance for stock data, OpenAI for AI analysis
- Authentication: Firebase

## Setup and Installation
1. Clone the repository
2. Set up the backend:
   - Navigate to the backend directory
   - Install required Python packages: `pip install -r requirements.txt`
   - Set up your OpenAI API key in the `app.py` file
3. Set up the frontend:
   - Navigate to the frontend directory
   - Install dependencies: `npm install`
   - Set up your Firebase configuration in `src/firebase.js`
4. Start the backend server: `python app.py`
5. Start the frontend development server: `npm start`

## Usage
1. Sign in using your Google account
2. Enter a stock symbol (e.g., AAPL for Apple Inc.) in the input field
3. Click "Analyze" to fetch stock data and AI analysis
4. View the results, including key statistics and AI-generated insights
5. Toggle between light and dark modes using the button in the header

## Contributing
Contributions, issues, and feature requests are welcome. Feel free to check [issues page](link-to-your-issues-page) if you want to contribute.

## License
[MIT](https://choosealicense.com/licenses/mit/)