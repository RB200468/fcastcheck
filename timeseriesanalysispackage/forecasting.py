class ForecastingModel:
    def fit(self, data: list) -> None:
        raise NotImplementedError("fit() must be implemented")
    
    def predict(self, steps: int) -> list:
        raise NotImplementedError("predict() must be implemented")