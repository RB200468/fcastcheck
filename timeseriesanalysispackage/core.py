import sys, importlib.util, uvicorn, os
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from inspect import isclass
from .chart import Chart
from .forecasting import ForecastingModel


app = FastAPI()

# Contains JSON Objects
registered_charts = []
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
        'charts': registered_charts[0]
    }
    return templates.TemplateResponse("index.html", context)

@app.get("/model")
def get_prediction(name:str, steps:int):
    if name in registered_models.keys():
        model = registered_models.get(name)()
        model.fit(data=[10,15,25,45,20])
        pred_data = model.predict(steps=steps)

        return JSONResponse(content={'message': 'Good request', 'data': {'predictions': pred_data}}, status_code=200)
    else:
        return JSONResponse(content={'messge': 'Model not found'}, status_code=404)


def get_user_data(filepath):
    """Search user script for chart types and forecasting models"""

    global registered_charts, registered_models

    # Loads the user's script
    spec = importlib.util.spec_from_file_location("user_script", filepath)
    user_module = importlib.util.module_from_spec(spec)
    sys.modules["user_script"] = user_module
    spec.loader.exec_module(user_module)

    # Find's Chart attributes in users file and adds them to charts list
    for attr_name in dir(user_module):
        attr_value = getattr(user_module, attr_name)

        if isinstance(attr_value, Chart):
            """Checks for Chart objects"""
            registered_charts.append(attr_value.getChartData())
            print(f'Successfully added chart: {attr_name}')
        elif isclass(attr_value) and issubclass(attr_value, ForecastingModel) and attr_name != 'ForecastingModel':
            """Checks for ForecastingModel subclasses"""
            registered_models[attr_name] = attr_value
            print(f'Successfully added model: {attr_name}')

    if not registered_charts:
        raise ValueError("No Chart objects found in the user's script.")
    
    if not registered_models:
        print("No Forecasting Models found in the user's script.'")


def validate_chart() -> bool:
    #TODO: Write function to validate charts
    pass

def validate_model(name, model) -> bool:
    #TODO: write function to validate models
    pass


def main():
    if (len(sys.argv) != 3 or sys.argv[1] != "run"):
        print("Usage: timeseriesanalysispackage run <user_script.py>")
        sys.exit(1)

    user_script = sys.argv[2]

    try:
        get_user_data(user_script)
        
        for chart in registered_charts:
            print(chart)
    except Exception as e:
        print(f"Error getting chart: {e}")
        sys.exit(1)

    uvicorn.run(app, host="localhost", port=8001)
