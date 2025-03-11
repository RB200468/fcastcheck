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
    current_forecast_data = forecast_lines[current_chart_name][name]

    rmse = current_forecast_data.get('metrics').get('RMSE')
    mae = current_forecast_data.get('metrics').get('MAE')
    mape = current_forecast_data.get('metrics').get('MAPE')
    dataLabels = current_forecast_data.get('dataLabels')
    colors = current_forecast_data.get('lineColors')

    content = {
        'labels': dataLabels,
        'RMSE': rmse,
        'MAE': mae,
        'MAPE': mape,
        'colors': colors
    }

    return JSONResponse(content={'content': content}, status_code=200)