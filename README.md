# Final Year Computer Science Project

By Ryan Bendall | University of Birmingham

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

An example `user_script.py`

```
from timeseriesanalysispackage.chart import Chart

my_chart = Chart(
		timeLabels = ['jan', 'feb', 'mar', 'apr', 'may'],
		yData = [10,15,25,45,20],
		dataLabel = 'Sales (USD)'
	)

my_chart.options(
		tension = 0.1,
		borderColor = 'rgba(250, 220, 122, 1)'
	)
```
