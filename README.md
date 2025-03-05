# Fcastcheck

# Contents

- [Fcastcheck](#fcastcheck)
- [Contents](#contents)
- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
	- [Chart](#chart)
	- [Forecasting Models](#forecasting-models)
	- [Forecasts](#forecasts)
- [3rd-Party Package Support](#3rd-party-package-support)

# Introduction

This project is a python package which allows users to analyse their own time-series data and forecasting models in a local web application.

# Installation

Install the library from PyPI

``` bash
pip install fcastcheck
```

# Usage
Fcastcheck provides a framework for you to define your time-series charts, models and forecasts.

To use the package enter this command into your terminal

``` bash
fcastcheck run <user_script.py>
```

## Chart
To define your chart, you must import it as follows
```
from fcastcheck.chart import Chart
```

Create chart objects to use in your analysis

``` python
my_chart = Chart(
		timeLabels: List[str],
		yData: List[int] | List[float] ,
		yTitle: str,
		dataLabel: str
	)
```

you can add options to your chart to make it more bespoke

``` python
my_chart.options(
		tension: float | None,
		borderColor: str | None,
		fill: bool | None
	)
```

The default options are as follows:

```python
default_options.options(
		tension = 0.3,
		borderColor = '#0069C3',
		fill = False
	)
```

## Forecasting Models
This allows you to import your forecasting models into the application.

```python
from fcastcheck.forecasting import ForecastingModel
```

To add your forecasting models you must write your own implementations of the `ForecastingModel` interface

```python
class ForecastingModel:
    def fit(self, data: list) -> None:
		"""Funciton for training model on the data"""
		raise NotImplementedError("fit() must be implemented")

    def predict(self, steps: int) -> list:
		"""Funciton for predicting"""
		raise NotImplementedError("predict() must be implemented")
```

Here's an example:

```python
class MyModel(ForecastingModel):
	def __init__(self):
		self.model = None

	def fit(self, data: list):
		self.model = data

	def predict(self, steps: int):
		prediction_data = []
		for i in range(steps):
			prediction_data.append(random.randrange(1,101))
		return prediction_data
```

## Forecasts
You can import the forecast class as follows

```python
from fcastcheck.Forecasting import Forcast
```

Now you can define which models you want to use on which charts and the time frame you wish to predict.

```python
my_forecast = Forecast(
	chart_name: str,
	models: List[str],
	start_time: str,
	end_time: str
)
```

# 3rd-Party Package Support
You are able to include some 3rd party packages as part of your model evaluation pipeline:
`pandas`, `numpy`, `scikit-learn`, `statsmodels`, `scipy`
Over time there will be wider 3rd-party package support.
