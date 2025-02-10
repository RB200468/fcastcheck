document.addEventListener("activeChartChanged", (event) => {
    console.log("Active Chart Name: ", event.detail);
    const chartName = event.detail;

    fetch(`http://localhost:8001/chart?name=${chartName}`)
        .then(response => {
            if (!response.ok) {
                throw Error("Error Occured ", response.statusText)
            }
            return response.json();
        })
        .then (data => {
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
        })
        .catch (error => {
            console.error("Error: ", error)
        });
});

function buildChart(ctx, chartData){
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
                    ticks: {
                        color: txt_color_1
                    },
                    grid: {
                        display: false
                    },
                    border: {
                        color: txt_color_1
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: chartData.title,
                        color: txt_color_1
                    },
                    ticks: {
                        color: txt_color_1
                    },
                    grid: {
                        display: false
                    },
                    border: {
                        color: txt_color_1
                    }
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

/* Dark Colors */
const chrt_bg_color_1_dark = getComputedStyle(document.documentElement).getPropertyValue('--bg-color-1-dark').trim();
const chrt_bg_color_2_dark = getComputedStyle(document.documentElement).getPropertyValue('--bg-color-2-dark').trim();
const chrt_txt_color_1_dark = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-1-dark').trim();
const chrt_txt_color_2_dark = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-2-dark').trim();

/* Light Colors */
const chrt_bg_color_1_light = getComputedStyle(document.documentElement).getPropertyValue('--bg-color-1-light').trim();
const chrt_bg_color_2_light = getComputedStyle(document.documentElement).getPropertyValue('--bg-color-2-light').trim();
const chrt_txt_color_1_light = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-1-light').trim();
const chrt_txt_color_2_light = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-2-light').trim();


document.addEventListener('themeSwitched', (event) => {
    if (event.detail == 'dark') {
        /* Change Chart Dark */
        builtChart.options.scales.x.ticks.color = chrt_txt_color_1_dark;
        builtChart.options.scales.y.ticks.color = chrt_txt_color_1_dark;
        builtChart.options.scales.x.border.color = chrt_txt_color_1_dark;
        builtChart.options.scales.y.border.color = chrt_txt_color_1_dark;
        builtChart.options.scales.y.title.color = chrt_txt_color_1_dark;
        builtChart.options.plugins.legend.labels.color = chrt_txt_color_1_dark;

    } else if (event.detail == 'light') {
        /* Change Chart Light */
        builtChart.options.scales.x.ticks.color = chrt_txt_color_1_light;
        builtChart.options.scales.y.ticks.color = chrt_txt_color_1_light;
        builtChart.options.scales.x.border.color = chrt_txt_color_1_light;
        builtChart.options.scales.y.border.color = chrt_txt_color_1_light;
        builtChart.options.scales.y.title.color = chrt_txt_color_1_light;
        builtChart.options.plugins.legend.labels.color = chrt_txt_color_1_light;
    }
    builtChart.update();
});