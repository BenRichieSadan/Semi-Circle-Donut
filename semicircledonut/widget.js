/**
 * Semi Circle Donut main widget file
 * Developed By: Ben Richie Sadan @ Sisense
 * Version : 1.0.0
 * Last Modified Date : 10-Feb-2020
 */

prism.registerWidget("semicircledonut", {
    name: "semicircledonut",
    family: "Indicator",
    title: "Semi Circle Donut", // name that will be displayed for user selection
    iconSmall: "/plugins/semicircledonut/semicircledonut-icon-small.png",
    styleEditorTemplate: "/plugins/semicircledonut/styler.html",
    hideNoResults: true,
    directive: {
        desktop: "semicircledonut"
    },
    style: {
        /* object structure for styling use, available to be changed
            using the design panel*/
        isInnerLabels: true
    },
    data: {
        /**
         * the panels area will populate the left side bar with options for selecting colums out of the data model
         * this is where the building of a widget takes its first step
         * 
         * panel with type of 'dimensions' will have options such as:
         * all items or filter
         * 
         * panel with type of 'measures' will have options such as:
         * count unique, sum, avg, filter, ETC
         * 
         * filter panel will refer to the right side of the screen, where widget level filters have been placed
         * 
         * maxitems:
         * -1 = no max
         * number = max value
         */
        panels: [{
                name: 'Dimensions panel',
                type: "visible",
                metadata: {
                    types: ['dimensions'],
                    maxitems: 1
                },
                visibility: true
            },
            {
                name: 'Values panel',
                type: "visible",
                metadata: {
                    types: ['measures'],
                    maxitems: -1
                },
                visibility: true
            },
            {
                name: 'filters',
                type: 'filters',
                metadata: {
                    types: ['dimensions'],
                    maxitems: -1
                }
            }
        ],

        /**
         * build query will handle the jaql building for the widget request,
         * in this function we will gather the data from the panels and create a jaql query to be used
         * @param {*} widget 
         */
        buildQuery: function (widget) {
            // creating the jaql object
            var query = {
                datasource: widget.datasource,
                metadata: []
            };

            // populating the jaql object with the panels info
            if (widget.metadata.panel("Dimensions panel").items.length > 0) {
                widget.metadata.panel("Dimensions panel").items.forEach(curPanel => {
                    query.metadata.push(curPanel);
                });
            }

            if (widget.metadata.panel("Values panel").items.length > 0) {
                widget.metadata.panel("Values panel").items.forEach(curPanel => {
                    query.metadata.push(curPanel);
                });
            }

            if (defined(widget.metadata.panel("filters"), 'items.0')) {
                widget.metadata.panel('filters').items.forEach(function (item) {
                    item = $$.object.clone(item, true);
                    item.panel = "scope";
                    query.metadata.push(item);
                });
            }

            return query;
        },

        /**
         * OPTIONAL
         * process result will handle the functionality needed for structuring the data correctly for a UI component to consume
         * @param {*} widget 
         * @param {*} queryResult 
         */
        processResult: function (widget, queryResult) {
            let postProcessResult = [];
            let sumValue = 0;

            // Restructure the data and collect sum for % calculation
            queryResult.$$rows.forEach(curVal => {
                let dimName = curVal[0].text;
                let value = curVal[1].text;

                sumValue += curVal[1].data;

                postProcessResult.push([dimName, 'percent', value]);
            });

            // Calc of percent using the collected sum
            postProcessResult.forEach(curResult => {
                curResult[1] = (curResult[2] / sumValue);
            });

            return postProcessResult;
        }
    },

    /**
     * OPTIONAL
     * before query will be called right before the execution, this is the place to manipulate the jaql query further after
     * it was updated with dashboard filters and such
     * @param {*} widget 
     * @param {*} event 
     */
    beforequery(widget, event) {},

    /**
     * render function will be called right after process result function, this is where the UI component will interact with the data
     * this function can also be called after a filter change, redraw event or readjust event
     * @param {*} widget 
     * @param {*} event 
     */
    render: function (widget, event) {
        // the widget dom element, this is the element the plugin will populate with the UI component
        let element = $(event.element);
        element.empty();

        chartConfig = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                plotShadow: false
            },
            title: {
                text: widget.metadata.panel("Values panel").items[0].jaql.title + "<br> By <br>" + widget.metadata.panel("Dimensions panel").items[0].jaql.title,
                align: 'center',
                verticalAlign: 'middle',
                y: 60
            },
            tooltip: {
                formatter: function (d) {
                    return this.point.name + ' ' + this.series.name + ':<br><b>' + this.point.percentage.toFixed(1) + '% (' + d.chart.options.series[0].data[this.point.index][2] + ')</b>';
                }
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: false
                    },
                    startAngle: -90,
                    endAngle: 90,
                    center: ['50%', '75%'],
                    size: '110%'
                }
            },
            series: [{
                type: 'pie',
                name: widget.metadata.panel("Values panel").items[0].jaql.title,
                innerSize: '50%',
                data: widget.queryResult
            }]
        };

        if (widget.style.isInnerLabels) {
            chartConfig.plotOptions.pie.dataLabels = {
                enabled: true,
                distance: -50,
                style: {
                    fontWeight: 'bold',
                    color: 'white'
                }
            }
        }

        Highcharts.chart(element[0], chartConfig);
    },
    options: {
        dashboardFiltersMode: "slice"
    }
});