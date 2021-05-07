var app = new Vue({
    el: ".chart",
    data() {
      return {graphTitle: "Misinformation Claims Data",
      svgHeight: window.innerHeight * 0.825,
      margin: { top: 25, left: 130, bottom: 25, right: 25 },
      misinfoData: [{}],
      showLabel: false,
      showLabelAuto: false,
      showHoverTip: false,
      activeLink: null,
      iSelected: null,
      activeIndex: 0,
      domainSelected: null,
      fixedTip: false,
      special: false,
      myCount: null,
      nested_data: [{}],
      domainX: {
        min: 0,
        max: 65
      },
      filterKey: "BoomLive",
      setShown: 0,
      xAxisLabel: "Number of Debunked Information",
    };
  },

svgWidth() {
    if (window.innerWidth < 926) {
      return window.innerWidth * 0.9;
    } else {
      return window.innerWidth * 0.55;
    }
  },
  width() {
    return this.svgWidth - this.margin.left - this.margin.right;
  },
  height() {
    return this.svgHeight - this.margin.top - this.margin.bottom;
  },
  scale() {
    const x = d3
    .scaleLinear()
    .domain([0, this.domainX.max])
    .rangeRound([0, this.width]);

    const y = d3
        .scaleBand()
        .domain(this.filteredData.map(y => y.key))
        .rangeRound([0, this.height])
        .padding(0.6);

    const gridlines = d3
        .scaleLinear()
        .domain([0, this.domainX.max])
        .rangeRound([0, this.width]);

      return { x, y, gridlines };
    }

})