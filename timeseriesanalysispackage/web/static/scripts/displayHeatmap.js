document.addEventListener("forecastsChanged", () => {
    setupGraph();
})

function setupGraph() {
    // Set margins
    const margin = {top: 15, right: 20, bottom: 30, left: 30};

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
    const myGroups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const myVars = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"];

    // Build X scales and axis
    const x = d3.scaleBand()
        .range([0, width])
        .domain(myGroups)
        .padding(0.01);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Build Y scales and axis
    const y = d3.scaleBand()
        .range([height, 0])
        .domain(myVars)
        .padding(0.01);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Build color scale
    const myColor = d3.scaleLinear()
        .range(["white", "#0069C3"])
        .domain([1, 100]);

    // Read the data and render the heatmap
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv").then(function(data) {
        svg.selectAll()
            .data(data, function(d) { return d.group + ':' + d.variable; })
            .join("rect")
            .attr("x", function(d) { return x(d.group); })
            .attr("y", function(d) { return y(d.variable); })
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function(d) { return myColor(d.value); });
    });
}