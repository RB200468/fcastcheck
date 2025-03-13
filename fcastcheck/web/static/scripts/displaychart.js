document.addEventListener("activeChartChanged", async (event) => {
    const chartName = event.detail;
    console.log(`Active Chart Name: ${chartName}`);

    try {
        const response = await fetch(`http://localhost:8001/chart?name=${chartName}`);

        if (!response.ok) {
            throw Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Destroy old Canvas
        const container = document.getElementById('canvas-container');
        const oldCanvas = document.getElementById('Chart');
        container.removeChild(oldCanvas);

        // Create New Canvas
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'Chart';
        newCanvas.ariaLabel = 'Chart';
        newCanvas.role = 'svg';
        container.appendChild(newCanvas);

        // Update New Canvas
        const ctx = newCanvas.getContext('2d');
        builtChart = buildChart(ctx, data.content);

        document.dispatchEvent(new CustomEvent("forecastsChanged", { detail: data.forecasts }));

    } catch (error) {
        console.error(`Error: ${error}`);
    }
});

function buildChart(ctx, chartData){
    // Flatten all data points across datasets
    const allValues = chartData.datasets.flatMap(dataset => dataset.data.filter(value => value !== null && value !== undefined));

    // Get the min and max values
    const minY = Math.min(...allValues);
    const maxY = Math.max(...allValues);

    // Calculate dynamic padding
    const range = maxY - minY;
    const padding = range * 0.25;

    // Adjusted axis limits
    const suggestedMin = minY - padding;
    const suggestedMax = maxY + padding;
    

    const timeSeriesData = {
        labels: chartData.labels,
        datasets: chartData.datasets
    };

    const txt_color_1 = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-1').trim();
    const config = {
        type: 'line',
        data: timeSeriesData,
        options: {
            maintainAspectRatio: window.innerWidth <= 600,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        color: txt_color_1
                    }
                },
            },
            scales: {
                x: {
                    ticks: { color: txt_color_1 },
                    grid: { display: false },
                    border: { color: txt_color_1 }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: chartData.title,
                        color: txt_color_1
                    },
                    ticks: { color: txt_color_1 },
                    grid: { display: false },
                    border: { color: txt_color_1 },
                    min: suggestedMin,
                    max: suggestedMax
                },
            },   
        },
    }

    const chart = new Chart(ctx, config);
    return chart;
}

window.addEventListener('resize', () => {
    const isScreenWide = window.innerWidth <= 600;
    builtChart.options.maintainAspectRatio = isScreenWide;
    builtChart.update()
})

document.addEventListener('themeSwitched', (event) => {
    if (event.detail == 'dark') {
        /* Change Chart Dark */
        builtChart.options.scales.x.ticks.color = txt_color_1_dark;
        builtChart.options.scales.y.ticks.color = txt_color_1_dark;
        builtChart.options.scales.x.border.color = txt_color_1_dark;
        builtChart.options.scales.y.border.color = txt_color_1_dark;
        builtChart.options.scales.y.title.color = txt_color_1_dark;
        builtChart.options.plugins.legend.labels.color = txt_color_1_dark;

    } else if (event.detail == 'light') {
        /* Change Chart Light */
        builtChart.options.scales.x.ticks.color = txt_color_1_light;
        builtChart.options.scales.y.ticks.color = txt_color_1_light;
        builtChart.options.scales.x.border.color = txt_color_1_light;
        builtChart.options.scales.y.border.color = txt_color_1_light;
        builtChart.options.scales.y.title.color = txt_color_1_light;
        builtChart.options.plugins.legend.labels.color = txt_color_1_light;
    }
    builtChart.update();
});