document.addEventListener("forecastClicked", async (event) => {
    const forecast = event.detail;
    console.log(forecast)

    try {
        const response = await fetch(`http://localhost:8001/predictionInterval?name=${forecast}`)
        
        if (!response.ok) {
            throw Error(`Error:  ${response.statusText}`)
        }

        const data = await response.json();

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
        intervalChart = buildIntervalChart(ctx,data.content[0]);


        // Create Model Selector Dots
        let currentIndex = 0;
        const dotsContainer = document.getElementById('dot-container');
        dotsContainer.replaceChildren();

        function updateChart(index) {
            currentIndex = index;
            intervalChart.destroy();
            intervalChart = buildIntervalChart(ctx, data.content[currentIndex])
            console.log(data.content[currentIndex]);
            updateActiveDot();
        }
    
        function updateActiveDot() {
            document.querySelectorAll(".dot").forEach((dot, i) => {
                dot.classList.toggle("active", i === currentIndex);
            });
        }
        
        // Handle selector dot creation, active class assignment and updateChart onClick
        data.content.forEach((_, index) => {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            if (index === currentIndex) dot.classList.add("active");
            dot.addEventListener("click", () => updateChart(index));
            dotsContainer.appendChild(dot);
        });

    } catch (error) {
        console.error(`Error: ${error}}`);
    }
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
                        text: 'Date',
                        color: txt_color_1
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        color: txt_color_1
                    },
                    grid: { color: txt_color_2_dark },
                    border: { color: txt_color_1, width: 1.25 }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value',
                        color: txt_color_1
                    },
                    ticks: {color: txt_color_1},
                    grid: { color: txt_color_2_dark },
                    border: { color: txt_color_1, width: 1.25 },
                    suggestedMin: suggestedMin,
                    suggestedMax: suggestedMax
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