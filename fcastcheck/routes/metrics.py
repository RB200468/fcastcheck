from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/metrics")
def get_predInterval(name: str, request: Request) -> JSONResponse:
    registered_forecasts = request.app.state.registered_forecasts
    forecast_lines = request.app.state.forecast_lines

    if name not in registered_forecasts.keys():
        return JSONResponse(content={'content': "Forecast not found"})
    
    current_forecast = registered_forecasts[name]
    current_chart_name = current_forecast.get_chart()

    rmse = forecast_lines[current_chart_name][name].get('metrics').get('RMSE')
    mae = forecast_lines[current_chart_name][name].get('metrics').get('MAE')
    dataLabels = forecast_lines[current_chart_name][name].get('dataLabels')

    content = {
        'labels': dataLabels,
        'RMSE': rmse,
        'MAE': mae
    }

    return JSONResponse(content={'content': content}, status_code=200)