document.addEventListener("forecastClicked", async (event) => {
    const forecastName = event.detail;

    try {
        const response = await fetch(`http://localhost:8001/metrics?name=${forecastName}`)

        if (!response.ok) {
            throw Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`RMSE: ${data.content.RMSE[0]}`);
        console.log(`MAE: ${data.content.MAE[0]}`);
        const rmse_data = data.content.RMSE[0]
        const mae_data = data.content.MAE[0]

        const heatmapData = data.content.labels.flatMap((t, i) => [
            { group: t, variable: "RMSE", value: rmse_data[i] },
            { group: t, variable: "MAE", value: mae_data[i] }
        ]);

        setupGraph(data.content.labels, heatmapData);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
})

function setupGraph(timeLabels, data) {
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
    const myVars = ["RMSE", "MAE"];

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

    // Compute min/max separately for RMSE and MAPE
    const rmseMin = d3.min(data.filter(d => d.variable === "RMSE"), d => d.value);
    const rmseMax = d3.max(data.filter(d => d.variable === "RMSE"), d => d.value);

    const maeMin = d3.min(data.filter(d => d.variable === "MAE"), d => d.value);
    const maeMax = d3.max(data.filter(d => d.variable === "MAE"), d => d.value);

    const totalMin = d3.min([maeMin,rmseMin]);
    const totalMax = d3.max([maeMax,rmseMax]);

    const myColor = d3.scaleLinear()
        .range(["white", "#0069C3"]) 
        .domain([totalMin,totalMax]);

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
        .attr("x", function(d) { return x(d.group); })
        .attr("y", function(d) { return y(d.variable); })
        .attr("width", x.bandwidth() * 0.8)
        .attr("height", y.bandwidth() * 1)
        .style("fill", function(d) { return myColor(d.value); })

        // Tooltip events
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1) // Make visible
                .html(`<strong>${d.variable}</strong><br>Value: ${d.value.toFixed(4)}`) // Set content
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
    setupGraph();
};