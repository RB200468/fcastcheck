class ForecastingModel:
    def fit(self, data: list) -> None:
        raise NotImplementedError("fit() must be implemented")
    
    def predict(self, steps: int) -> list:
        raise NotImplementedError("predict() must be implemented")


class Forecast:
    def __init__(self, chart_name, models, start_time, end_time):
        self.chart = chart_name
        self.models = models
        self.start_time = start_time
        self.end_time = end_time
        