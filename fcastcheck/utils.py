import random, math
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV
from sklearn.neighbors import KernelDensity
import scipy.stats as stats
from scipy.stats import gaussian_kde, norm


def random_hex_colour():
    return "#{:06x}".format(random.randint(0,0xFFFFFF))


def calc_pred_interval(ground_truth_data, predictions, interval: float = 0.95):
    ground_truth_data = np.asarray(ground_truth_data)
    predictions = np.asarray(predictions)
    
    if len(ground_truth_data) < 2:
        raise ValueError("Not enough data points to compute prediction intervals.")

    residuals = ground_truth_data - predictions

    std_dev = np.std(residuals)

    # Scale std_div by sqrt of index +1 to make naive scaling 
    naive_scaling = np.array([np.sqrt(i+1) for i in range(len(predictions))])
    
    critical_val = norm.ppf((1 + interval)/2)

    # Compute bounds
    margin = critical_val * std_dev * naive_scaling
    lower_bound = (predictions - margin).tolist()
    upper_bound = (predictions + margin).tolist()

    return lower_bound, upper_bound

def calc_metrics(predictions: list, groundTruth: list) -> dict:
    mean_absolute_error = []
    root_mean_Squared_error = []
    mean_absolute_percentage_error = []

    for i,_ in enumerate(predictions):
        root_mean_Squared_error.append(calc_rmse(predictions[0:i+1], groundTruth[0:i+1]))
    
    metrics_dict = {
        "MAE": mean_absolute_error,
        "RMSE": root_mean_Squared_error,
        "MAPE": mean_absolute_percentage_error,
    }

    return metrics_dict

def calc_residuals(predictions: list, groundTruth: list) -> list:
    return groundTruth - predictions

def calc_rmse(predictions: list, groundTruth: list) -> float:
    # Root Mean Squared Error
    return math.sqrt(sum(pow(i-j,2) for i,j in zip(groundTruth,predictions))/len(predictions))



def make_stationary(data, diff_order=1):
    data = np.array(data, dtype=float)
    last_values = data[-diff_order:]  

    # Differencing
    for _ in range(diff_order):
        data = np.diff(data, n=1)

    # Standardization
    scaler = StandardScaler()
    standardized_data = scaler.fit_transform(data.reshape(-1, 1)).flatten()

    return standardized_data, scaler, last_values


def reverse_transform(predictions, scaler, last_values, diff_order=1):
    """ Reverses standardization and differencing. """
    # Reverse standardization
    predictions = np.array(predictions, dtype=float)
    original_predictions = scaler.inverse_transform(predictions.reshape(-1, 1)).flatten()

    # Reverse differencing
    if diff_order == 1:
        restored_predictions = np.cumsum(np.insert(original_predictions, 0, last_values))
    elif diff_order == 2:
        restored_predictions = np.cumsum(np.insert(original_predictions, 0, last_values[0]))
        restored_predictions += last_values[1]
    
    return restored_predictions


def cross_validation_bandwidth(data):
    bandwidths = np.linspace(0.01,0.1,100)
    
    data = np.array(data).reshape(-1, 1)

    grid = GridSearchCV(KernelDensity(kernel='gaussian'), param_grid={'bandwidth': bandwidths}, cv=5) 
    grid.fit(data)

    best_bandwidth = grid.best_estimator_.bandwidth
    return best_bandwidth



def density_data(values, x_values):
    optimal_bandwidth = cross_validation_bandwidth(values)

    kde = gaussian_kde(values, bw_method=optimal_bandwidth / np.std(values, ddof=1))
    densityValues = kde(x_values)

    return densityValues.tolist()



