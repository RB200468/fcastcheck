from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/chart")
def get_chart(name: str, request: Request) -> JSONResponse:
    registered_charts = request.app.state.registered_charts
    registered_forecasts = request.app.state.registered_forecasts

    if name in registered_charts.keys():
        current_forecasts=[]
        for forecast_name in list(registered_forecasts.keys()):
            if registered_forecasts[forecast_name].get_chart() == name:
                current_forecasts.append(forecast_name)

        return JSONResponse(content={'content': registered_charts[name], 'forecasts': current_forecasts}, status_code=200)
    
    else:
        return JSONResponse(content={'content': "Chart not found"})