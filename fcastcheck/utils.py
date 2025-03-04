import random
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