import sys, importlib.util, uvicorn, os, json, random
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from inspect import isclass
from .chart import Chart
from .forecasting import ForecastingModel, Forecast
from .utils import random_hex_colour


app = FastAPI()

# Contains JSON Objects
registered_charts = {}
registered_models = {}
registered_forecasts = {}
forecast_lines = {}

templatesDir = os.path.join(os.path.dirname(__file__), 'web', 'templates')
templates = Jinja2Templates(directory=templatesDir)

staticDir = os.path.join(os.path.dirname(__file__), 'web', 'static')
app.mount("/static", StaticFiles(directory=staticDir))

# Endpoints
@app.get("/", response_class=HTMLResponse)
def home(request:Request):
    """Render Home Screen"""
    global registered_charts
    context= {
        'request': request,
        'charts': list(registered_charts.keys()),
        'models': list(registered_models.keys()),
        'forecasts': list(registered_forecasts.keys())
    }
    return templates.TemplateResponse("index.jinja2", context)

@app.get("/chart")
def get_chart(name: str):
    if name in registered_charts.keys():
        current_forecasts=[]
        for forecast_name in list(registered_forecasts.keys()):
            if registered_forecasts[forecast_name].get_chart() == name:
                current_forecasts.append(forecast_name)

        return JSONResponse(content={'content': registered_charts[name], 'forecasts': current_forecasts}, status_code=200)
    else:
        return JSONResponse(content={'content': "Chart not found"})
    
@app.get("/forecast")
def get_forecast(name: str):
    if name not in registered_forecasts.keys():
        return JSONResponse(content={'content': "Forecast not found"})
    
    current_forecast = registered_forecasts[name]

    current_chart_name = current_forecast.get_chart()
    current_chart = registered_charts[current_chart_name]
    # Clear all forecast lines
    current_chart["datasets"] = [current_chart["datasets"][0]]

    # Add pre-computed forecast lines
    forecasts = forecast_lines.get(current_chart_name).get(name)
    for forecast in forecasts:
        current_chart['datasets'].append(forecast)

    return JSONResponse(content={'content': current_chart_name}, status_code=200)


def get_user_data(filepath):
    """Search user script for chart types and forecasting models"""

    global registered_charts, registered_models

    # Loads the user's script
    spec = importlib.util.spec_from_file_location("user_script", filepath)
    user_module = importlib.util.module_from_spec(spec)
    sys.modules["user_script"] = user_module
    spec.loader.exec_module(user_module)

    # Find's attributes in user's script and add them to dicts
    for attr_name in dir(user_module):
        attr_value = getattr(user_module, attr_name)

        if isinstance(attr_value, Chart):
            """Checks for Chart objects"""
            registered_charts[attr_name] = attr_value.getChartData()
            print(f'Successfully added chart: {attr_name}')
        elif isclass(attr_value) and issubclass(attr_value, ForecastingModel) and attr_name != 'ForecastingModel':
            """Checks for ForecastingModel subclasses"""
            registered_models[attr_name] = attr_value
            print(f'Successfully added model: {attr_name}')
        elif isinstance(attr_value, Forecast):
            """Checks for Forecast Objects"""
            registered_forecasts[attr_name] = attr_value
            print(f"Successfully added forecast: {attr_name}")

    if not registered_charts:
        raise ValueError("No Chart objects found in the user's script.")
    
    if not registered_models:
        print("No Forecasting Models found in the user's script.'")


def load_forecasts():
    for forecast in registered_forecasts.keys():
        current_forecast = registered_forecasts[forecast]

        if current_forecast.get_chart() not in registered_charts.keys():
            print(current_forecast.get_chart())
            return "ERROR: Chart Not Found"
        current_chart = registered_charts[current_forecast.get_chart()]

        current_models = []
        for model in current_forecast.get_models():
            if model not in registered_models.keys():
                return "ERROR: Model Not Found"
            current_models.append(registered_models[model])


        chart_key = current_forecast.get_chart()
        if chart_key not in forecast_lines.keys():
            forecast_lines[chart_key] = {}

        if forecast in forecast_lines.get(chart_key).keys():
            return "ERROR: Only Unique Forecast Names Allowed"

        forecast_lines[current_forecast.get_chart()][forecast] = []

        # Validate forecast spread and calculate required steps
        current_chart_labels = current_chart.get('labels')
        start_date_index = current_chart_labels.index(current_forecast.get_start_time())
        end_date_index = current_chart_labels.index(current_forecast.get_end_time())
        steps = (end_date_index - start_date_index) + 1
        if ((start_date_index >= end_date_index) or (start_date_index == 0)):
            return "ERROR: Invalid Forecast Time Spread"
        

        # Fit and predict each model
        current_chart_data = current_chart.get('datasets')[0].get('data')
        training_data = current_chart_data[0:start_date_index]
        for i in range(len(current_models)):
            current_model = current_models[i]()
            current_model.fit(data=training_data)
            current_prediction = [None] * len(training_data)
            current_prediction.extend(current_model.predict(steps=steps))
            line_color = random_hex_colour()

            current_forecast_line = {
                "label": current_forecast.get_models()[i],
                "data": current_prediction,
                "borderColor": line_color,
                "backgroundColor": line_color,
                "borderDash": [5,5]
            }
            forecast_lines[current_forecast.get_chart()][forecast].append(current_forecast_line)
        
    return "Forecasts Loaded"

def main():
    if (len(sys.argv) != 3 or sys.argv[1] != "run"):
        print("Usage: timeseriesanalysispackage run <user_script.py>")
        sys.exit(1)

    user_script = sys.argv[2]

    try:
        get_user_data(user_script)
        print(load_forecasts())
    except Exception as e:
        print(f"Error getting chart: {e}")
        sys.exit(1)

    uvicorn.run(app, host="localhost", port=8001)
