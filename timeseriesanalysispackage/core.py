import sys, importlib.util, uvicorn
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from .chart import Chart


app = FastAPI()

charts = []
templates = Jinja2Templates(directory="./web/templates")
app.mount("/static", StaticFiles(directory='./web/static'))


@app.get("/", response_class=HTMLResponse)
def home(request:Request):
    """Render Home Screen"""
    global charts
    context= {
        'request': request,
        'charts': charts
    }
    return templates.TemplateResponse("index.html", context)



def get_user_chart(filepath):
    global charts

    # Loads the user's script
    spec = importlib.util.spec_from_file_location("user_script", filepath)
    user_module = importlib.util.module_from_spec(spec)
    sys.modules["user_script"] = user_module
    spec.loader.exec_module(user_module)

    # Find's Chart attributes in users file and adds them to charts list
    for attr_name in dir(user_module):
        attr_value = getattr(user_module, attr_name)
        # Check if the attribute is an instance of Chart
        if isinstance(attr_value, Chart):
            charts.append(attr_value)
            print(f'Successfully added chart: {attr_name}')
    if not charts:
        raise ValueError("No Chart objects found in the user's script.")


def main():
    if (len(sys.argv) != 3 or sys.argv[1] != "run"):
        print("Usage: timeseriesanalysispackage run <user_script.py>")
        sys.exit(1)

    user_script = sys.argv[2]

    try:
        get_user_chart(user_script)
        
        for chart in charts:
            print(f'Title: {chart.title}')
    except Exception as e:
        print(f"Error getting chart: {e}")
        sys.exit(1)

    uvicorn.run(app, host="localhost", port=8001)
