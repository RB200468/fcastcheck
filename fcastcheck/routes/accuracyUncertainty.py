from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/AccuracyUncertaintyMetrics")
def get_AUMetrics(name: str, request: Request) -> JSONResponse:
    registered_forecasts = request.app.state.registered_forecasts
    forecast_lines = request.app.state.forecast_lines

    
    if name not in registered_forecasts.keys():
        return JSONResponse(content={'content': "Forecast not found"})
    
    current_forecast = registered_forecasts[name]
    current_chart_name = current_forecast.get_chart()
    current_models = current_forecast.get_models()
    current_forecast_data = forecast_lines[current_chart_name][name]

    # Average RMSE 
    rmse = current_forecast_data.get('metrics').get('RMSE')
    avg_rmse = []
    for index, _ in enumerate(rmse):
        avg_rmse.append(rmse[index][-1])
    
    # Line Colors
    colors = current_forecast_data.get('lineColors')
    
    # Average Prediction Interval 
    upper_bound = current_forecast_data['predIntervals'].get('upperBound')
    lower_bound = current_forecast_data['predIntervals'].get('lowerBound')
    avg_pred_interval = []

    for upper,lower in zip(upper_bound,lower_bound):
        count = 0
        for i,j in zip(upper,lower):
            count += (i-j)
        avg_pred_interval.append(count/len(upper))

    return JSONResponse(content={'models': current_models, 'rmse': avg_rmse, 'colors': colors, 'avgPredInterval': avg_pred_interval}, status_code=200)