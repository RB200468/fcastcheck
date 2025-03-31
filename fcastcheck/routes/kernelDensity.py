from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import numpy as np
from ..utils import density_data

router = APIRouter()


@router.get("/rmseDensity")
def get_rmseDensity(name: str, request: Request) -> JSONResponse:
    registered_forecasts = request.app.state.registered_forecasts
    forecast_lines = request.app.state.forecast_lines

    if name not in registered_forecasts.keys():
        return JSONResponse(content={'content': "Forecast not found"})
    
    current_forecast = registered_forecasts[name]
    current_chart_name = current_forecast.get_chart()
    current_models = current_forecast.get_models()
    current_forecast_data = forecast_lines[current_chart_name][name]
    colors = current_forecast_data.get('lineColors')

    rmse = forecast_lines[current_chart_name][name].get('metrics').get('RMSE')
    combinedRMSE = np.concatenate(rmse)
    dataLabels = np.linspace(np.min(combinedRMSE), np.max(combinedRMSE), 100).tolist()
    densityData = []

    for i in range(len(rmse)):
        densityData.append(density_data(rmse[i],dataLabels))

    content = {
        'labels': dataLabels,
        'densityData': densityData,
        'modelNames': current_models,
        'colors': colors
    }

    return JSONResponse(content={'content': content}, status_code=200)