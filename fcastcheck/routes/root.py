from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

router = APIRouter()

@router.get("/", response_class=HTMLResponse)
def get_root(request:Request) -> HTMLResponse:
    context= {
        'request': request,
        'charts': list(request.app.state.registered_charts.keys()),
        'models': list(request.app.state.registered_models.keys()),
        'forecasts': list(request.app.state.registered_forecasts.keys())
    }
    
    templates = request.app.state.templates
    return templates.TemplateResponse("index.jinja2", context)