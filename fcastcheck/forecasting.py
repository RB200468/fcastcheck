class ForecastingModel:
    def fit(self, data: list) -> None:
        raise NotImplementedError("fit() must be implemented")
    
    def predict(self, steps: int) -> list:
        raise NotImplementedError("predict() must be implemented")


class Forecast:
    def __init__(self, chart_name, models, start_time, end_time):
        self.__chart = chart_name
        self.__models = models
        self.__start_time = start_time
        self.__end_time = end_time
        
    def get_chart(self):
        return self.__chart
    
    def get_models(self):
        return self.__models
    
    def get_start_time(self):
        return self.__start_time
    
    def get_end_time(self):
        return self.__end_time