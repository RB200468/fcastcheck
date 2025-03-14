document.addEventListener("forecastClicked", async (event) => {
    const forecastName = event.detail;

    try {
        const response = await fetch(`http://localhost:8001/metrics?name=${forecastName}`)

        if (!response.ok) {
            throw Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        const lineCount = data.content.RMSE.length;
        const timeLabels = data.content.labels

         // Create Model Selector Dots
         let currentIndex = 0;
         const dotsContainer = document.getElementById('hm-dot-container');
         dotsContainer.replaceChildren();
         updateChart(0); // Initial Render
 
         function updateChart(index) {
             currentIndex = index;
             const rmse_data = data.content.RMSE[currentIndex];
             const mae_data = data.content.MAE[currentIndex];
             const mape_data = data.content.MAPE[currentIndex];
             const color = data.content.colors[currentIndex];
             const heatmapData = data.content.labels.flatMap((t, i) => [
             { group: t, variable: "RMSE", value: rmse_data[i] },
             { group: t, variable: "MAE", value: mae_data[i] },
             { group: t, variable: "MAPE", value: mape_data[i] }
             ]);
             setupGraph(timeLabels, heatmapData, color)
             updateActiveDot();
         }
     
         function updateActiveDot() {
             document.querySelectorAll(".hm-dot").forEach((dot, i) => {
                 dot.classList.toggle("active", i === currentIndex);
             });
         }
         
         // Handle selector dot creation, active class assignment and updateChart onClick
         for (let i=0; i < lineCount; i++) {
             const dot = document.createElement("div");
             dot.classList.add("hm-dot");
             if (i === currentIndex) dot.classList.add("active");
             dot.addEventListener("click", () => updateChart(i));
             dotsContainer.appendChild(dot);
         };
    } catch (error) {
        console.error(`Error: ${error}`);
    }
})

function setupGraph(timeLabels, data, color) {
    // Set margins
    const margin = {top: 5, right: 5, bottom: 50, left: 40};

    // Select the container and get its dimensions
    const container = d3.select("#heatmapChart");
    container.select("*").remove();
    
    const width = container.node().clientWidth - margin.left - margin.right;
    const height = container.node().clientHeight - margin.top - margin.bottom;

    // Append SVG to the container
    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Labels of row and columns
    const myGroups = timeLabels;
    const myVars = ["RMSE", "MAE", "MAPE"];

    // Build X scales and axis
    const x = d3.scaleBand()
        .range([0, width])
        .domain(myGroups)
        .padding(0.01);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")  // Select all x-axis labels
        .style("text-anchor", "end")  // Align text to the end
        .attr("dx", "-0.5em")  // Adjust horizontal position
        .attr("dy", "0.5em")  // Adjust vertical position
        .attr("transform", "rotate(-45)");  // Rotate text

    // Build Y scales and axis
    const y = d3.scaleBand()
        .range([height, 0])
        .domain(myVars)
        .padding(0.01);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Compute min/max separately for RMSE, MAE, and MAPE
    const rmseMin = d3.min(data.filter(d => d.variable === "RMSE"), d => d.value);
    const rmseMax = d3.max(data.filter(d => d.variable === "RMSE"), d => d.value);

    const maeMin = d3.min(data.filter(d => d.variable === "MAE"), d => d.value);
    const maeMax = d3.max(data.filter(d => d.variable === "MAE"), d => d.value);

    const mapeMin = d3.min(data.filter(d => d.variable === "MAPE"), d => d.value);
    const mapeMax = d3.max(data.filter(d => d.variable === "MAPE"), d => d.value);

    // Create separate color scales for each metric
    const rmseColor = d3.scaleLinear()
        .range(["white", color]) // Adjust color range as needed
        .domain([0, rmseMax]);

    const maeColor = d3.scaleLinear()
        .range(["white", color])
        .domain([0, maeMax]);

    const mapeColor = d3.scaleLinear()
        .range(["white", color])
        .domain([0, mapeMax]);

    // Append a tooltip div (initially hidden)
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none") // Prevents interfering with mouse events
        .style("opacity", 0); // Initially hidden

    // Read the data and render the heatmap
    svg.selectAll()
        .data(data)
        .join("rect")
        .attr("x", d => x(d.group))
        .attr("y", d => y(d.variable))
        .attr("width", x.bandwidth() * 0.8)
        .attr("height", y.bandwidth() * 0.95)
        .style("fill", d => {
            // Use the appropriate color scale based on the metric
            if (d.variable === "RMSE") return rmseColor(d.value);
            if (d.variable === "MAE") return maeColor(d.value);
            if (d.variable === "MAPE") return mapeColor(d.value);
            return "grey"; // Fallback color
        })


        // Tooltip events
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1) // Make visible
                .html(`<strong>${d.variable}</strong><br>Value: ${d.value.toFixed(3)}`) // Set content
                .style("left", (event.pageX + 10) + "px") // Position tooltip
                .style("top", (event.pageY - 10) + "px")
                .style("color", "black");

            d3.select(this)  // Highlight the hovered rect
                .style("stroke", "black")
                .style("stroke-width", "2px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseleave", function() {
            tooltip.style("opacity", 0); // Hide tooltip

            d3.select(this)  // Remove border
                .style("stroke", "none")
        });
}

window.onresize = function() {
    // Not implemented
};