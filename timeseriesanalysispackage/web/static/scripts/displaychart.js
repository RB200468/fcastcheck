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
        })
        .catch (error => {
            console.error("Error: ", error)
        });
});

function buildChart(ctx, chartData){
    const timeSeriesData = {
        labels: chartData.labels,
        datasets: [
            {
                label: chartData.label,
                data: chartData.data,
                borderColor: chartData.borderColor,
                backgroundColor: chartData.borderColor,
                tension: chartData.tension,
                fill: chartData.fill,   
            }
        ]
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




document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('updateBtn');
    btn.addEventListener('click', () => {
        builtChart.options.scales.x.ticks.color = '#19D302';
        builtChart.update();
        fetch('http://localhost:8001/model?name=MyModel&start=2&steps=2')
            .then(response => {
                if (!response.ok) {
                    throw Error("Error Occured ", response.statusText)
                }
                return response.json();
            })
            .then(resJSON => {

                /* Finding how many new labels are required */
                const pred_length = resJSON.data.predictions.length;
                const label_length = myChart.data.labels.length;
                const new_labels_count = Math.max(0, pred_length - label_length);
                const new_labels = [];

                for(let i = 1; i <= new_labels_count; i++) {
                    new_labels.push(`Point ${label_length + i}`);
                }

                /* Adding forecast data and new labels to chart */
                timeSeriesData.datasets.push({
                    label: 'Forecasted Sales',
                    data: resJSON.data.predictions,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.3, // For a smooth line curve
                    borderDash: [5, 5],
                    fill: false,   
                });

                myChart.data.labels.push(...new_labels);
                myChart.update();
            })
            .catch(error => {
                console.error('Error: ', error);
            })
    });
})
