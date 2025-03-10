import random, math
import numpy as np
import scipy.stats as stats

def random_hex_colour():
    return "#{:06x}".format(random.randint(0,0xFFFFFF))

def calc_pred_interval(ground_truth_labels, ground_truth_data, predictions, line_color, interval:float = 0.95):
    residuals = np.array(ground_truth_data) - np.array(predictions)
    std_deviation = np.std(residuals, ddof=1)

    ground_truth_length = len(ground_truth_data)
    t_value = stats.t.ppf((1+interval) / 2, df=ground_truth_length-1)

    margin = t_value * std_deviation

    lower_bound = (np.array(predictions) - margin).tolist()
    upper_bound = (np.array(predictions) + margin).tolist()

    prediction_interval_chart = {
                "labels": ground_truth_labels,
                "datasets": [
                    {
                        "label": "Predictions",
                        "data": predictions,
                        "borderColor": line_color,
                        "borderWidth": 2,
                        "fill": False
                    },
                    {
                        "label": "Prediction Inverval 95%",
                        "data": upper_bound,
                        "borderColor": line_color,
                        "borderWidth": 0,
                        "backgroundColor": 'rgba(0,76,140,0.3)',
                        "fill": -1
                    },
                    {
                        "label": "",
                        "data": lower_bound,
                        "borderColor": line_color,
                        "borderWidth": 0,
                        "backgroundColor": 'rgba(0,76,140,0.3)',
                        "fill": 1
                    }
                ] 
            }
    
    return prediction_interval_chart

def calc_metrics(predictions: list, groundTruth: list) -> dict:
    mean_absolute_error = []
    root_mean_Squared_error = []
    mean_absolute_percentage_error = []
    symmetric_mape = []
    mean_absolute_scaled_error = []

    for i,_ in enumerate(predictions):
        mean_absolute_error.append(calc_mae(predictions[0:i+1], groundTruth[0:i+1]))
        root_mean_Squared_error.append(calc_rmse(predictions[0:i+1], groundTruth[0:i+1]))
        mean_absolute_percentage_error.append(calc_mape(predictions[0:i+1],groundTruth[0:i+1]))

    metrics_dict = {
        "MAE": mean_absolute_error,
        "RMSE": root_mean_Squared_error,
        "MAPE": mean_absolute_percentage_error
    }

    return metrics_dict

def calc_mae(predictions: list, groundTruth: list) -> float:
    # Mean Absolute Error
    return abs(sum(i-j for i,j in zip(predictions, groundTruth))/len(predictions))

def calc_rmse(predictions: list, groundTruth: list) -> float:
    # Root Mean Squared Error
    return math.sqrt(sum(pow(i-j,2) for i,j in zip(predictions, groundTruth))/len(predictions))

def calc_mape(predictions: list, groundTruth: list) -> float:
    # Mean Absolute Percentage Error
    return abs(sum((100*(i-j))/i for i,j in zip(predictions, groundTruth))/len(predictions))

def calc_smape(predictions: list, groundTruth: list) -> float:
    ...

def calc_mase(predictions: list, groundTruth: list) -> float:
    ...    