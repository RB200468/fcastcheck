document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('myChart');
    
    var chartsObj = JSON.parse(charts) //String to JSON

    const timeSeriesData = {
        labels: chartsObj.labels,
        datasets: [
            {
                label: chartsObj.label,
                data: chartsObj.data,
                borderColor: chartsObj.borderColor,
                backgroundColor: 'rgba(250, 198, 122, 0.2)',
                tension: chartsObj.tension,
                fill: chartsObj.fill,   
            }
        ]
    };
    
    const config = {
        type: 'line',
        data: timeSeriesData,
        options: {
            maintainAspectRatio: window.innerWidth <= 600,
            scales: {
                y: {
                    beginAtZero: true
                },
            },   
        },
    }

    const myChart = new Chart(ctx, config);

    window.addEventListener('resize', () => {
        const isScreenWide = window.innerWidth <= 600;
        myChart.options.maintainAspectRatio = isScreenWide;
        myChart.update()
    })



    const btn = document.getElementById('updateBtn');
    btn.addEventListener('click', () => {
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

});