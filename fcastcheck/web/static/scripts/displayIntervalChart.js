document.addEventListener("forecastsChanged", () => {

    // Destroy old Canvas
    const container = document.getElementById('interval-chart-wrapper');
    const oldCanvas = document.getElementById('intervalChart');
    container.removeChild(oldCanvas);

    // Create new Canvas
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'intervalChart';
    newCanvas.ariaLabel = 'intervalChart';
    newCanvas.role = 'svg';
    container.appendChild(newCanvas);

    // Generate mock forecast data (replace with actual values)
    const forecastSteps = 20;
    const forecastDates = Array.from({ length: forecastSteps }, (_, i) => {
        let date = new Date();
        date.setDate(date.getDate() + i);
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    });

    const forecastMean = Array.from({ length: forecastSteps }, (_, i) => 50 + i + (Math.random() * 2 - 1));
    const confIntLower = forecastMean.map(value => value - 1.5);
    const confIntUpper = forecastMean.map(value => value + 1.5);
    const predIntLower = forecastMean.map(value => value - 2);
    const predIntUpper = forecastMean.map(value => value + 2);

    const data = [
        {
            label: 'Forecast',
            data: forecastMean,
            borderColor: '#0069C3',
            borderWidth: 2,
            fill: false,
        },
        {
            label: 'Confidence Interval (95%)',
            data: confIntUpper,
            borderColor: '#004C8C',
            borderWidth: 0,
            backgroundColor: 'rgba(0,76,140,0.3)',
            fill: '-1',
        },
        {
            label: '',
            data: confIntLower,
            borderColor: '#004C8C',
            borderWidth: 0,
            backgroundColor: 'rgba(0,76,140,0.3)',
            fill: '-1',
        },
        {
            label: 'Prediction Interval (95%)',
            data: predIntUpper,
            borderColor: '#3395D6',
            borderWidth: 0,
            backgroundColor: 'rgba(51,149,214,0.2)',
            fill: '-1',
        },
        {
            label: '',
            data: predIntLower,
            borderColor: '#3395D6',
            borderWidth: 0,
            backgroundColor: 'rgba(51,149,214,0.2)',
            fill: '-1',
        }
    ]

    const ctx = newCanvas.getContext('2d');
    intervalChart = buildIntervalChart(ctx,data,forecastDates);

})

function buildIntervalChart(ctx, data, forecastDates) {

    const txt_color_1 = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-1').trim();
    const config = {
        type: 'line',
        data: {
            labels: forecastDates,
            datasets: data
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { color: txt_color_2_dark },
                    border: { color: txt_color_1, width: 1.25 }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value'
                    },
                    grid: { color: txt_color_2_dark },
                    border: { color: txt_color_1, width: 1.25 }
                }
            },
            plugins: {
                legend: {
                    display: true,
                }
            }
        }
    }

    const intervalChart = new Chart(ctx, config);
    return intervalChart
}

document.addEventListener('themeSwitched', (event) => {
    if (event.detail == 'dark') {
        /* Change Chart Dark */
        intervalChart.options.scales.x.ticks.color = txt_color_1_dark;
        intervalChart.options.scales.y.ticks.color = txt_color_1_dark;
        intervalChart.options.scales.x.border.color = txt_color_1_dark;
        intervalChart.options.scales.y.border.color = txt_color_1_dark;
        intervalChart.options.scales.y.title.color = txt_color_1_dark;
        intervalChart.options.scales.x.title.color = txt_color_1_dark;

        intervalChart.options.plugins.legend.labels.color = txt_color_1_dark;

    } else if (event.detail == 'light') {
        /* Change Chart Light */
        intervalChart.options.scales.x.ticks.color = txt_color_1_light;
        intervalChart.options.scales.y.ticks.color = txt_color_1_light;
        intervalChart.options.scales.x.border.color = txt_color_1_light;
        intervalChart.options.scales.y.border.color = txt_color_1_light;
        intervalChart.options.scales.y.title.color = txt_color_1_light;
        intervalChart.options.scales.x.title.color = txt_color_1_light;

        intervalChart.options.plugins.legend.labels.color = txt_color_1_light;
    }
    intervalChart.update();
});