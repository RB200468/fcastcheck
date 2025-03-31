import sys, importlib.util, uvicorn, os

from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from inspect import isclass
from .chart import Chart
from .forecasting import ForecastingModel, Forecast
from .utils import random_hex_colour, calc_pred_interval, calc_metrics, make_stationary, reverse_transform, density_data

from .routes.chart import router as chart_router
from .routes.forecast import router as forecast_router
from .routes.predictionInterval import router as prediction_interval_router
from .routes.root import router as root_router
from .routes.metrics import router as metrics_router
from .routes.accuracyUncertainty import router as a_u_router
from .routes.kernelDensity import router as kernel_density_router


app = FastAPI()


# Data
app.state.registered_charts = {}
app.state.registered_models = {}
app.state.registered_forecasts = {}
app.state.forecast_lines = {}

templatesDir = os.path.join(os.path.dirname(__file__), 'web', 'templates')
templates = Jinja2Templates(directory=templatesDir)
app.state.templates = templates

staticDir = os.path.join(os.path.dirname(__file__), 'web', 'static')
app.mount("/static", StaticFiles(directory=staticDir))


# Routers
app.include_router(chart_router)
app.include_router(forecast_router)
app.include_router(prediction_interval_router)
app.include_router(root_router)
app.include_router(metrics_router)
app.include_router(a_u_router)
app.include_router(kernel_density_router)


def get_user_data(filepath: str) -> None:
    """Search user script for Charts, Models and Forecasts"""

    # Loads the user's script
    spec = importlib.util.spec_from_file_location("user_script", filepath)
    user_module = importlib.util.module_from_spec(spec)
    sys.modules["user_script"] = user_module
    spec.loader.exec_module(user_module)

    # Find's attributes in user's script and add them to dicts
    for attr_name in dir(user_module):
        attr_value = getattr(user_module, attr_name)

        if isinstance(attr_value, Chart):
            # Checks for Chart objects
            app.state.registered_charts[attr_name] = attr_value.getChartData()
            print(f'Successfully added chart: {attr_name}')

        elif isclass(attr_value) and issubclass(attr_value, ForecastingModel) and attr_name != 'ForecastingModel':
            # Checks for ForecastingModel subclasses
            app.state.registered_models[attr_name] = attr_value
            print(f'Successfully added model: {attr_name}')

        elif isinstance(attr_value, Forecast):
            # Checks for Forecast Objects
            app.state.registered_forecasts[attr_name] = attr_value
            print(f"Successfully added forecast: {attr_name}")

    if not app.state.registered_charts:
        raise ValueError("No Chart objects found in the user's script.")
    
    if not app.state.registered_models:
        raise ValueError("No Forecasting Models found in the user's script.'")


def load_forecasts() -> str:
    for forecast in app.state.registered_forecasts.keys():
        # Validate each Forecast and Model
        current_forecast = app.state.registered_forecasts[forecast]

        current_forecast_chart = current_forecast.get_chart()
        if current_forecast_chart not in app.state.registered_charts.keys():
            print(current_forecast_chart)
            raise ValueError("ERROR: Chart Not Found")
        current_chart = app.state.registered_charts[current_forecast_chart]
        

        current_models = []
        for model in current_forecast.get_models():
            if model not in app.state.registered_models.keys():
                raise ValueError("ERROR: Model Not Found")
            current_models.append(app.state.registered_models[model])


        if current_forecast_chart not in app.state.forecast_lines.keys():
            app.state.forecast_lines[current_forecast_chart] = {}

        if forecast in app.state.forecast_lines.get(current_forecast_chart).keys():
            raise ValueError("ERROR: Only Unique Forecast Names Allowed")

        # Define Data Structure
        app.state.forecast_lines[current_forecast_chart][forecast] = {
            'lines' : [],
            'lineColors': [],
            'dataLabels': [],
            'predictions': [],
            'predIntervals': {
                "upperBound": [],
                "lowerBound": []
            },
            'metrics' : {
                "MAE": [],
                "RMSE": [],
                "MAPE": []
            }
        }
        current_forecast_data = app.state.forecast_lines[current_forecast_chart][forecast]

        # Validate forecast spread and calculate required steps
        current_chart_labels = current_chart.get('labels')
        start_date_index = current_chart_labels.index(current_forecast.get_start_time())
        end_date_index = current_chart_labels.index(current_forecast.get_end_time())
        steps = (end_date_index - start_date_index) + 1
        if ((start_date_index >= end_date_index) or (start_date_index == 0)):
            raise ValueError("ERROR: Invalid Forecast Time Spread")
        

        # Fit and predict each model
        current_chart_data = current_chart.get('datasets')[0].get('data')
        training_data = current_chart_data[0:start_date_index]
        standardized_data, scaler, last_values = make_stationary(training_data)
        for i,_ in enumerate(current_models):
            # Fit and Predict Model
            current_model = current_models[i]()
            current_model.fit(data=standardized_data)
            standardized_prediction_data = current_model.predict(steps=steps)
            prediction_data = reverse_transform(standardized_prediction_data, scaler, last_values)
            
            current_prediction = [None] * len(standardized_data)
            current_prediction.extend(prediction_data)
            current_forecast_data.get('predictions').append(current_prediction[start_date_index::])

            ground_truth_data = current_chart_data[start_date_index : end_date_index+1]
            ground_truth_labels = current_chart_labels[start_date_index: end_date_index+1]
            current_forecast_data['dataLabels'] = ground_truth_labels


            # Build Prediction Line
            line_color = random_hex_colour()
            current_forecast_data.get('lineColors').append(line_color)

            current_forecast_line = {
                "label": current_forecast.get_models()[i],
                "data": current_prediction,
                "borderColor": line_color,
                "backgroundColor": line_color,
                "borderDash": [5,5]
            }
            current_forecast_data.get('lines').append(current_forecast_line)


            # Build Prediction Intervals
            lowerBound, upperBound = calc_pred_interval(
                ground_truth_data=ground_truth_data,
                predictions=current_prediction[start_date_index::],
            )
            current_forecast_data.get('predIntervals').get('upperBound').append(upperBound)
            current_forecast_data.get('predIntervals').get('lowerBound').append(lowerBound)


            # Get Data For Heatmap
            metrics = calc_metrics(current_prediction[start_date_index::], ground_truth_data)
            for key, value in metrics.items():
                current_forecast_data.get('metrics').get(key).append(value)


    print("Forecasts Loaded")


def main():
    if (len(sys.argv) != 3 or sys.argv[1] != "run"):
        # TODO: Add flag for custom port number
        print("Usage: timeseriesanalysispackage run <user_script.py>")
        sys.exit(1)

    user_script = sys.argv[2]

    try:
        get_user_data(user_script)
        load_forecasts()
    except Exception as ex:
        print(f"Error: [{ex}]")
        sys.exit(1)
    except ValueError as ve:
        print(f"Value Error: [{ve}]")
        sys.exit(1)


    uvicorn.run(app, host="localhost", port=8001)


if __name__ == "__main__":
    main()
