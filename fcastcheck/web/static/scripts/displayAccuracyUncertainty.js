document.addEventListener("forecastClicked", async (event) => {
    const forecastName = event.detail;

    try {
        const response = await fetch(`http://localhost:8001/AccuracyUncertaintyMetrics?name=${forecastName}`);

        if (!response.ok){
            throw Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Destroy old Canvas
        const container = document.getElementById('bubble-chart-wrapper');
        const oldCanvas = document.getElementById('bubbleChart');
        container.removeChild(oldCanvas);

        // Create new Canvas
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'bubbleChart';
        newCanvas.ariaLabel = 'bubbleChart';
        newCanvas.role = 'svg';
        container.appendChild(newCanvas);

        // Data
        const models = data.models;
        const rmse = data.rmse;
        const msis = data.rmse;
        const lineColors = data.colors;
        const avgPredInterval = data.avgPredInterval;

        // Create multiple datasets (one per model) for individual labels
        const datasets = models.map((model, i) => ({
            label: model, 
            data: [{ x: avgPredInterval[i], y: rmse[i]}], 
            backgroundColor: lineColors[i],
            pointRadius: 10
        }));

        // Create the chart
        const ctx = newCanvas.getContext('2d');
        bubbleChart = buildBubbleChart(ctx, datasets);

    } catch (error) {
        console.error(`Error: ${error}`);          
    }
    
});

function buildBubbleChart(ctx, chartData){

    const txt_color_1 = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-1').trim();
    const config = {
        type: 'scatter',
        data: { datasets: chartData },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const data = context.raw;
                            return `${context.dataset.label}: RMSE=${data.y.toFixed(3)}, AvgPredInt=${data.x.toFixed(3)}`;
                        }
                    }
                },
                legend: { display: true } // Show legend for color key
            },
            scales: {
                y: {
                    title: { display: true, text: 'RMSE (Accuracy)' },
                    min: 0,

                    grid: { color: txt_color_2_dark },
                    border: { color: txt_color_1, width: 1.25 }
                },
                x: {
                    title: { display: true, text: 'Average Prediction interval (Uncertainty)' },
                    min: 0,
                    grid: { color: txt_color_2_dark },
                    border: { color: txt_color_1, width: 1.25 }
                }
            }
        }
    }

    const bubbleChart = new Chart(ctx, config);
    return bubbleChart
}

document.addEventListener('themeSwitched', (event) => {
    if (event.detail == 'dark') {
        /* Change Chart Dark */
        bubbleChart.options.scales.x.ticks.color = txt_color_1_dark;
        bubbleChart.options.scales.y.ticks.color = txt_color_1_dark;
        bubbleChart.options.scales.x.border.color = txt_color_1_dark;
        bubbleChart.options.scales.y.border.color = txt_color_1_dark;
        bubbleChart.options.scales.y.title.color = txt_color_1_dark;
        bubbleChart.options.scales.x.title.color = txt_color_1_dark;

        bubbleChart.options.plugins.legend.labels.color = txt_color_1_dark;

    } else if (event.detail == 'light') {
        /* Change Chart Light */
        bubbleChart.options.scales.x.ticks.color = txt_color_1_light;
        bubbleChart.options.scales.y.ticks.color = txt_color_1_light;
        bubbleChart.options.scales.x.border.color = txt_color_1_light;
        bubbleChart.options.scales.y.border.color = txt_color_1_light;
        bubbleChart.options.scales.y.title.color = txt_color_1_light;
        bubbleChart.options.scales.x.title.color = txt_color_1_light;

        bubbleChart.options.plugins.legend.labels.color = txt_color_1_light;
    }
    bubbleChart.update();
});