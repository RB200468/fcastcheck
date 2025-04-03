document.addEventListener("forecastClicked", async (event) => {
    const forecast = event.detail;
    console.log(forecast)

    try {
        const response = await fetch(`http://localhost:8001/rmseDensity?name=${forecast}`) // change for residual density route
        
        if (!response.ok) {
            throw Error(`Error:  ${response.statusText}`)
        }

        const data = await response.json();
        console.log(data);

        // Data
        const rmseValues = data.content.labels;
        const densityData = data.content.modelNames.map((mName, index) => ({
            'label': mName,
            'data': data.content.densityData[index],
            'borderColor': data.content.colors[index],
            'borderWidth': 2,
            'backgroundColor': hexToRgba(data.content.colors[index], 0.2),
            'fill': 'origin',
            'tension': 0.1,
            'pointRadius': 0,
            'pointHoverRadius': 4
        }));


        // Destroy old Canvas
        const container = document.getElementById('density-chart-wrapper');
        const oldCanvas = document.getElementById('densityChart');
        container.removeChild(oldCanvas);

        // Create new Canvas
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'densityChart';
        newCanvas.ariaLabel = 'RMSE Kernel Density Estimation Chart';
        newCanvas.role = 'svg';
        container.appendChild(newCanvas);

        // Update New Canvas
        const ctx = newCanvas.getContext('2d');
        densityChart = buildDensityChart(ctx, densityData, rmseValues); 


    } catch (error) {
        console.error(`Error: ${error}}`);
    }
})

function buildDensityChart(ctx, data, labels) {
    const txt_color_1 = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-1').trim();

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: data
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'RMSE',
                        color: txt_color_1
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        color: txt_color_1,
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return parseFloat(label).toFixed(2);
                        }
                    },
                    grid: { color: txt_color_2_dark },
                    border: { color: txt_color_1, width: 1.25 }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Density',
                        color: txt_color_1
                    },
                    ticks: {color: txt_color_1},
                    grid: { color: txt_color_2_dark },
                    border: { color: txt_color_1, width: 1.25 },
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels:{color: txt_color_1}
                }
            }
        }
    }

    const densityChart = new Chart(ctx, config);
    return densityChart
}

document.addEventListener('themeSwitched', (event) => {
    if (event.detail == 'dark') {
        /* Change Chart Dark */
        densityChart.options.scales.x.ticks.color = txt_color_1_dark;
        densityChart.options.scales.y.ticks.color = txt_color_1_dark;
        densityChart.options.scales.x.border.color = txt_color_1_dark;
        densityChart.options.scales.y.border.color = txt_color_1_dark;
        densityChart.options.scales.y.title.color = txt_color_1_dark;
        densityChart.options.scales.x.title.color = txt_color_1_dark;

        densityChart.options.plugins.legend.labels.color = txt_color_1_dark;

    } else if (event.detail == 'light') {
        /* Change Chart Light */
        densityChart.options.scales.x.ticks.color = txt_color_1_light;
        densityChart.options.scales.y.ticks.color = txt_color_1_light;
        densityChart.options.scales.x.border.color = txt_color_1_light;
        densityChart.options.scales.y.border.color = txt_color_1_light;
        densityChart.options.scales.y.title.color = txt_color_1_light;
        densityChart.options.scales.x.title.color = txt_color_1_light;

        densityChart.options.plugins.legend.labels.color = txt_color_1_light;
    }
    densityChart.update();
});

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  