document.addEventListener("forecastClicked", (event) => {
    const forecast = event.detail;
    console.log(forecast)

    fetch(`http://localhost:8001/predictionInterval?name=${forecast}`)
        .then(response => {
            if (!response.ok) {
                throw Error("Error Occured ", response.statusText)
            }
            return response.json();
        })
        .then (data => {
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

            // Update New Canvas
            const ctx = newCanvas.getContext('2d');
            intervalChart = buildIntervalChart(ctx,data.content);
        })
        .catch (error => {
            console.error("Error: ", error)
        });
})

function buildIntervalChart(ctx, data) {
    const txt_color_1 = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-1').trim();

    const paddingFactor = 0.25; // 10% padding

    const allDataPoints = data.datasets.flatMap(dataset => dataset.data);
    const minY = Math.min(...allDataPoints);
    const maxY = Math.max(...allDataPoints);

    // Calculate dynamic padding
    const range = maxY - minY;
    const padding = range * paddingFactor;

    // Adjusted axis limits
    const suggestedMin = minY - padding;
    const suggestedMax = maxY + padding;

    const config = {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: data.datasets
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
                    border: { color: txt_color_1, width: 1.25 },
                    suggestedMin: suggestedMin,
                    suggestedMax: suggestedMax
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