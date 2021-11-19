/*
 * Codigo para generacion de las graficas
 */

// Load google charts
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

// Draw the chart and set the chart values
function drawChart() {
    var jsonData = $.ajax({
        url: "/emoteSum/",
        dataType: "json",
        async: false
        }).responseText;

    dataArray = JSON.parse(jsonData);
    var data = google.visualization.arrayToDataTable(dataArray);

    
    // Optional; add a title and set the width and height of the chart
    var options = {'title':'Emociones', 'width':550, 'height':400};

    // Display the chart inside the <div> element with id="piechart"
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
}