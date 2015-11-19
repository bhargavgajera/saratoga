 google.load("visualization", "1", {
        packages: ["corechart"]
    });
    google.setOnLoadCallback(drawChart);

    function drawChart() {

        var data = google.visualization.arrayToDataTable([['Month', 'visit', {
            role: "style"
        }], ['September', 0, 'white'], ['', 14, 'white'], ['', 191, 'white'], ['October', 167, 'white'], ['', 1, 'white'], ['', 0, 'white']]);
        var view = new google.visualization.DataView(data);

        view.setColumns([0, 1,
            {
                calc: "stringify",
                sourceColumn: 1,
                type: "string",
                role: "annotation"
            },
            2]);

        var options = {
            title: "Listing Views \n Today 09:34 AM  ",
            width: "100%",
            height: 200,
            bar: {
                groupWidth: "20%"
            },
            legend: {
                position: "none"
            },
            backgroundColor: '#7272B8',
            legendTextStyle: {
                color: '#FFF'
            },
            titleTextStyle: {
                color: '#FFF'
            },
            hAxis: {
                textStyle: {
                    color: '#FFF'
                }
            },
            vAxis: {
                textStyle: {
                    color: '#FFF'
                }
            }

        };
        var chart = new google.visualization.ColumnChart(document.getElementById("columnchart_values"));
        chart.draw(view, options);
    }


    google.setOnLoadCallback(drawclickthroughpieChart);

    function drawclickthroughpieChart() {

        var data = google.visualization.arrayToDataTable([
          ['Click Thorugh Rate', 'Percentage'],
          ['Click Thorugh', 18],
          ['Visit', 355]


        ]);

        var options = {
            titlePosition: 'none',
            legend: {
                position: "none"
            },
            title: 'Click Thorugh Rate',
            colors: ['#4e385e', '#CE6A52']

        };

        var chart = new google.visualization.PieChart(document.getElementById('clickthroughpieChart'));

        chart.draw(data, options);
    }

    google.setOnLoadCallback(drawbouncepieChart);

    function drawbouncepieChart() {

        var data = google.visualization.arrayToDataTable([
					  ['Bounce Rate', 'Percentage'],
					  ['Bounce', 248],
					  ['Visit', 125]


					]);

        var options = {
            titlePosition: 'none',
            legend: {
                position: "none"
            },
            title: 'Click Thorugh Rate',
            colors: ['#4e385e', '#CE6A52']

        };

        var chart = new google.visualization.PieChart(document.getElementById('bouncepieChart'));

        chart.draw(data, options);
    }


    
     google.setOnLoadCallback(drawpushnotificationpieChart);
				  function drawpushnotificationpieChart() {

					var data = google.visualization.arrayToDataTable([
					  ['Push notification', 'Percentage'],
					  ['Remaining',  23],
					  ['Sent', 27]
					]);

					var options = {
						
					  titlePosition: 'none',
					  legend: { position: "none" },
					  title: 'Remaining Pushes',
					   colors: ['#4e385e', '#CE6A52']
					/*   slices: {1:{color: '#CE6A52'}, 2:{color: '#4e385e'}} */
					};

					var chart = new google.visualization.PieChart(document.getElementById('pushnotificationpieChart'));

					chart.draw(data, options);
				  }
    
    

     google.load("visualization", "1", {packages:["geochart"]});

			  google.setOnLoadCallback(drawRegionsMap);

			  function drawRegionsMap() {
				var data = google.visualization.arrayToDataTable([
				  ['Country', 'Users'],
				  ['India',13]				 
			  ]);

			  var options = {
				
				displayMode: 'markers',
				backgroundColor: '#fff',
				datalessRegionColor: '#b4bdde',
				defaultColor: '#b4bdde',
				colorAxis: {colors: ['#dad7de']}
			  };


      

			  var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
			  chart.draw(data, options);

      }
    