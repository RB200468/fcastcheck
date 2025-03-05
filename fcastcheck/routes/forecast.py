from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/forecast")
def get_forecast(name: str, request: Request) -> JSONResponse:
    registered_charts = request.app.state.registered_charts
    registered_forecasts = request.app.state.registered_forecasts
    forecast_lines = request.app.state.forecast_lines

    if name not in registered_forecasts.keys():
        return JSONResponse(content={'content': "Forecast not found"})
    
    current_forecast = registered_forecasts[name]

    current_chart_name = current_forecast.get_chart()
    current_chart = registered_charts[current_chart_name]
    # Clear all forecast lines
    current_chart["datasets"] = [current_chart["datasets"][0]]

    # Add pre-computed forecast lines
    forecasts = forecast_lines.get(current_chart_name).get(name).get('lines')
    for forecast in forecasts:
        current_chart['datasets'].append(forecast)

    return JSONResponse(content={'content': current_chart_name}, status_code=200)