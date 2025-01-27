import sys, importlib.util, uvicorn, os, json, random
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from inspect import isclass
from .chart import Chart
from .forecasting import ForecastingModel


app = FastAPI()

# Contains JSON Objects
registered_charts = {}
registered_models = {}

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
        'models': list(registered_models.keys())
    }
    return templates.TemplateResponse("index.jinja2", context)

@app.get("/chart")
def get_chart(name: str):
    if name in registered_charts.keys():
        return JSONResponse(content={'content': registered_charts[name]}, status_code=200)
    else:
        return JSONResponse(content={'content': "Chart not found"})

@app.put("/forecast")
def put_forecast(chart: str,model: str, start: int, steps: int, name: str):
    if not chart in registered_charts.keys():
        return JSONResponse(content={'content': "Chart Not Found."}, status_code=404)
    elif not model in registered_models.keys():
        return JSONResponse(content={'content': "Model Not Found"}, status_code=404)
    
    # Get Data
    current_chart = registered_charts.get(chart)
    current_model_class = registered_models.get(model)
    current_data = current_chart['datasets'][0].get('data')
    current_model = current_model_class()

    # Train and Predict
    pred_data = [None] * start
    pred_data.append(current_data[start])
    current_model.fit(data=current_data[:(start+1)])
    pred_data.extend(current_model.predict(steps=steps))

    #Update Labels
    current_labels_length = len(current_chart['labels'])
    forecast_data_length = len(pred_data)
    new_labels_num = max(0, (forecast_data_length - current_labels_length))
    new_labels = []
    for i in range(current_labels_length, current_labels_length + new_labels_num):
        new_labels.append(f"Point {i}")
    current_chart['labels'].extend(new_labels)

    # Add forecast line
    line_colour = random_hex_colour()

    forecast_line = {
        "label": name,
        "data": pred_data,
        "borderColor": line_colour,
        "backgroundColor": line_colour,
        "borderDash": [5,5]
    }
    current_chart["datasets"].append(forecast_line)

    return JSONResponse(content={'content': chart}, status_code=200)


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

    if not registered_charts:
        raise ValueError("No Chart objects found in the user's script.")
    
    if not registered_models:
        print("No Forecasting Models found in the user's script.'")


def random_hex_colour():
    return "#{:06x}".format(random.randint(0,0xFFFFFF))


def main():
    if (len(sys.argv) != 3 or sys.argv[1] != "run"):
        print("Usage: timeseriesanalysispackage run <user_script.py>")
        sys.exit(1)

    user_script = sys.argv[2]

    try:
        get_user_data(user_script)
    except Exception as e:
        print(f"Error getting chart: {e}")
        sys.exit(1)

    uvicorn.run(app, host="localhost", port=8001)
