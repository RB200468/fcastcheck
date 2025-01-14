# Final Year Computer Science Project

By Ryan Bendall | University of Birmingham

# Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
  - [Chart](##chart)
  - [Forecasting](##forecasting)

# Introduction

This project is a python package which allows users to analyse their own time-series data and forecasting models in a local web application.

# Installation

Clone the repository

```
git clone https://github.com/RB200468/timeSeriesAnalysisPackage
```

Make sure poetry is installed

```
pipx install poetry
poetry --version
```

Install the package locally

```
poetry install
```

Enter the virtual environment and use the package!

```
poetry shell
```

Exiting the poetry shell

```
exit
```

# Usage

To use the package enter this command into your terminal

```
timeseriesanalysispackage run <user_script.py>
```

## Chart

```
from timeseriesanalysispackage.chart import Chart
```

Create chart objects to use in your analysis

```
my_chart = Chart(
		timeLabels = ['jan', 'feb', 'mar', 'apr', 'may'],
		yData = [10,15,25,45,20],
		dataLabel = 'Sales (USD)'
	)
```

you can add options to your chart to make it more bespoke

```
my_chart = Chart(
		timeLabels = ['jan', 'feb', 'mar', 'apr', 'may'],
		yData = [10,15,25,45,20],
		dataLabel = 'Sales (USD)'
	)

my_chart.options(
		tension = 0.1,
		borderColor = 'rgba(250, 220, 122, 1)',
		fill = False
	)
```

The default options are as follows:

```
default_options.options(
		tension = 0.3,
		borderColor = 'rgba(250, 198, 122, 1)',
		fill = False
	)
```

## Forecasting

```
from timeseriesanalysispackage.forecasting import ForecastingModel
```

This allows you to import your forecasting models into the application.

To add your forecasting models you must write your own implementations of the base interface

```
class ForecastingModel:
    def fit(self, data: list) -> None:
		"""Funciton for training model on the data"""
		raise NotImplementedError("fit() must be implemented")

    def predict(self, steps: int) -> list:
		"""Funciton for predicting"""
		raise NotImplementedError("predict() must be implemented")
```

Here's an example:

```
class MyModel(ForecastingModel):
	def __init__(self):
		self.model = None

	def fit(self, data: list):
		self.model = data

	def predict(self, steps: int):
		prediction_data = []
		for i in range(len(self.model)):
			prediction_data.append(self.model[i] * 2)
		return prediction_data
```

# Examples

An example `user_script.py`

```
from timeseriesanalysispackage.chart import Chart
from timeseriesanalysispackage.forecasting import ForecastingModel


my_chart = Chart(
		timeLabels = ['January', 'Feburary', 'March', 'April', 'May'],
		yData = [10,15,25,45,20],
		dataLabel = 'Sales (USD)'
	)

my_chart.options(
		tension = 0.1,
		borderColor = '#60B6E4'
	)

class MyModel(ForecastingModel):
	def __init__(self):
		self.model = None

	def fit(self, data: list):
		print('fitting data')
		self.model = data

	def predict(self, steps: int):
		prediction_data = []
		print('predicting...')
		for i in range(len(self.model)):
			prediction_data.append(self.model[i] * 2)
		return prediction_data

```
