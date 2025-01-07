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
        timeSeriesData.datasets.push({
            label: 'Forecasted Sales',
            data: [null, null, null, null, null, null, null, null, 1300, 1450, 1600, 1900],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3, // For a smooth line curve
            borderDash: [5, 5],
            fill: false,   
        });

        myChart.update();
    });



});