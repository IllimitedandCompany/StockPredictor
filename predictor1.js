// This function only works for predictions on timeframes below the Daily, for the Daily prediction use predictor2.
// To know unknown ticker, check "financialmodelingprep.com"
// ApiKey must be obtained in "financialmodelingprep.com"

apiKey = "YourApiKey"
ticker = "XAUUSD" // Gold against the Dollar
timeframe = "4hour"

async function predict(){
	console.log("Computing prediction..")
	let url = `https://financialmodelingprep.com/api/v3/historical-chart/${timeframe}/${ticker}?apikey=${apiKey}`
	
	if(timeframe === "daily" || timeframe === "Daily"){
		url = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=${apiKey}`
	}
		
	axios.get(url).then((response) => {
		console.log("Axios request sent..")
		var a = response.data;
		let dailyStats

		if(timeframe === "daily" || timeframe === "Daily"){
			dailyStats = a.historical.reverse().map(obj => obj["close"]);
		}else{
			dailyStats = a.reverse().map(obj => obj["close"]);
		}

		function format(arr) {
			const toReturn = []
			for(let i= 0; i<arr.length; i+=5) {
				toReturn.push(arr.slice(i, i+5))
			}
			if(toReturn[toReturn.length-1].length == 1) {
			const last = toReturn.pop()
			toReturn[toReturn.length-1].concat(last)
			}
			return toReturn
		}

		const scaledData = scaler.fit_transform(dailyStats);


		const trainingData = format(scaledData)


		const net = new brain.recurrent.LSTMTimeStep({
			inputSize: 1,
			hiddenLayers: [24, 24],
			outputSize: 1
		});

		net.train(trainingData, {
			learningRate: 0.005,
			errorThresh: 0.02,
		});

		let result = JSON.stringify(scaler.inverse_transform(net.forecast(scaledData, 1)));
		let parsedResult = JSON.parse(result);

		price = parsedResult["0"]

		result = {
			"asset":ticker,
			"price": price,
			"timeframe": timeframe
		}
	
		console.log(result)
	})
}
// uncomment line bellow to run function
// predict()
