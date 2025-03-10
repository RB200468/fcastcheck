// TODO: make sure the 'active forecast stays visible'
document.addEventListener("forecastsChanged", (event) => {
    const current_forecasts = event.detail;
    const container = document.getElementById('forecast-wrapper');

    document.querySelectorAll('.forecast-btn').forEach(button => { button.remove() });

    current_forecasts.forEach(forecast => {
        // Create forecast div
        const div = document.createElement("div");
        div.classList.add("forecast-btn");
        div.textContent = forecast;

        div.addEventListener("click", async () => {
            // Remove "active" class from all forecast divs
            document.querySelectorAll(".forecast-btn").forEach(btn => btn.classList.remove("active"));
            div.classList.add('active');

            // Write Forecast Lines
            try {
                const response = await fetch(`http://localhost:8001/forecast?name=${forecast}`);

                if (!response.ok) {
                    throw Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();

                document.dispatchEvent(new CustomEvent("activeChartChanged", { detail: data.content }));
                document.dispatchEvent(new CustomEvent("forecastClicked", { detail: forecast }))

            } catch (error) {
                console.error(`Error: ${error}`);
            }
        });

        // Add forecast button to container
        container.appendChild(div);
    });
});