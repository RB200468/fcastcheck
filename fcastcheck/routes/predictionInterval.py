from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/predictionInterval")
def get_predInterval(name: str, request: Request) -> JSONResponse:
    registered_forecasts = request.app.state.registered_forecasts
    forecast_lines = request.app.state.forecast_lines

    if name not in registered_forecasts.keys():
        return JSONResponse(content={'content': "Forecast not found"})
    
    current_forecast = registered_forecasts[name]
    current_chart_name = current_forecast.get_chart()
    current_forecast_data = forecast_lines[current_chart_name][name]

    predictions = current_forecast_data.get('predictions')
    upperBounds = current_forecast_data['predIntervals'].get('upperBound')
    lowerBounds = current_forecast_data['predIntervals'].get('lowerBound')
    lineColors = current_forecast_data.get('lineColors')
    timeLabels = current_forecast_data.get('dataLabels')

    return JSONResponse(content={'predictions': predictions, 'upperBounds': upperBounds, 'lowerBounds': lowerBounds, 'lineColors': lineColors, 'timeLabels': timeLabels }, status_code=200)