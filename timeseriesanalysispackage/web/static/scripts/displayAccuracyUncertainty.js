document.addEventListener("forecastsChanged", () => {
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

        // Forecast data
        const forecasts = ['Forecast1', 'Forecast2', 'Forecast3', 'Forecast4', 'Forecast5'];
        const rmse = [1.2, 2.3, 0.9, 1.8, 2.0];
        const msis = [0.5, 0.8, 0.3, 0.7, 0.6]; 
        const wsql = [0.2, 0.4, 0.1, 0.5, 0.3]; 
    
        // Function to get color based on WSQL value
        function getColor(value) {
            if (value < 0.2) return "#B3D7F7"; // Light Blue
            if (value < 0.4) return "#0069C3"; // Medium Blue
            return "#003F8C"; // Dark Blue
        }
    
        // Create multiple datasets (one per forecast) for individual labels
        const datasets = forecasts.map((forecast, i) => ({
            label: forecast,  // Each forecast has its own label
            data: [{ x: rmse[i], y: msis[i], r: wsql[i] * 30 }], // Single point per dataset
            backgroundColor: getColor(wsql[i]),
            borderColor: getColor(wsql[i]),
            borderWidth: 1
        }));
    
        // Create the Chart.js bubble chart
        const ctx = newCanvas.getContext('2d');
        bubbleChart = buildBubbleChart(ctx, datasets);
    
});

function buildBubbleChart(ctx, chartData){

    const config = {
        type: 'bubble',
        data: { datasets: chartData },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const data = context.raw;
                            return `${context.dataset.label}: RMSE=${data.x}, MSIS=${data.y}, WSQL=${(data.r / 30).toFixed(2)}`;
                        }
                    }
                },
                legend: { display: true } // Show legend for color key
            },
            scales: {
                y: {
                    title: { display: true, text: 'MSIS (Lower is Better)' },
                    min: 0,
                    max: 1,
                    ticks: { stepSize: 0.1 },
                    grid: { color: txt_color_2_dark },
                    border: { color: txt_color_1, width: 1.25 }
                },
                x: {
                    title: { display: true, text: 'RMSE (Lower is Better)' },
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