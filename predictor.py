# Libraries must be installed before hand

import requests
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.linear_model import LinearRegression

apiKey = "YourApiKey"
asset = "XAUUSD"
timeframe = "daily"

def predict(asset, timeframe):

    url = ""
    
    if timeframe == "daily" or timeframe == "Daily":
        url = f"https://financialmodelingprep.com/api/v3/historical-price-full/{asset}?apikey={apiKey}"
    else:
        url = f"https://financialmodelingprep.com/api/v3/historical-chart/{timeframe}/{asset}?apikey={apiKey}"

    response = requests.get(url)
    data = response.json()

    daily_stats = ""

    if timeframe == "daily" or timeframe == "Daily":
        historical_data = data["historical"]

        historical_data.reverse()

        # Extract the "close" prices
        daily_stats = [entry["close"] for entry in historical_data]
    else:
        data.reverse()
        daily_stats = [entry["close"] for entry in data]

    # Initialize MinMaxScaler
    scaler = MinMaxScaler()

    # Fit and transform the data
    scaled_data = scaler.fit_transform(np.array(daily_stats).reshape(-1, 1))

    # Split the data into input and output
    X = scaled_data[:-1]
    y = scaled_data[1:]

    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    # Create a linear regression model
    model = LinearRegression()

    # Train the model
    model.fit(X_train, y_train)

    # Predict the next data point
    next_data_point = X_test[-1].reshape(1, -1)
    predicted_data_point = model.predict(next_data_point)

    # Inverse transform to get the original scale
    predicted_value = scaler.inverse_transform(predicted_data_point)[0][0]

    worked_value = "%.5f" % predicted_value
    # Print the predicted value
    print(f"Predicted {asset} {timeframe} Close is {worked_value}")

predict()
