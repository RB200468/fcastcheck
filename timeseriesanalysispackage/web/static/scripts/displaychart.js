document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('myChart');
  

    const timeSeriesData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                 'August', 'September', 'October', 'November', 'December'],
        datasets: [
            {
                label: 'Monthly Sales',
                data: [500, 700, 800, 600, 900, 1200, 1500, 1400, 1300, 1100, 1000, 1700],
                borderColor: 'rgba(250, 198, 122, 1)',
                backgroundColor: 'rgba(250, 198, 122, 0.2)',
                tension: 0.3, // For a smooth line curve
                fill: false,   
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