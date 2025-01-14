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
        fetch('http://localhost:8001/model?name=MyModel&steps=2')
            .then(response => {
                if (!response.ok) {
                    throw Error("Error Occured ", response.statusText)
                }
                return response.json();
            })
            .then(resJSON => {
                timeSeriesData.datasets.push({
                    label: 'Forecasted Sales',
                    data: resJSON.data.predictions,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.3, // For a smooth line curve
                    borderDash: [5, 5],
                    fill: false,   
                });
        
                myChart.update();
            })
            .catch(error => {
                console.error('Error: ', error);
            })
    });

});