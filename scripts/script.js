/* global Vue */
var app = new Vue({
  el: "#container",
  data() {
    return {
      graphTitle: "Misingformation",
      svgHeight: window.innerHeight * 0.825,
      margin: { top: 25, left: 150, bottom: 25, right: 25 },
      misinfo: [{}],
      showLabel: false,
      showLabelAuto: false,
      showHoverTip: false,
      iSelected: null,
      fixedTip: false,
      nested_data: [{}],
      domainX: {
        min: 0,
        max: 65
      },
      filterKey: "Undefined",
      setShown: 0,
      xAxisLabel: "Number of Claims"
    };
  },
  computed: {
    filteredData() {
      let filteredData = this.nested_data.filter(
        el =>
          el.key !== this.filterKey &&
          el.key !== "" &&
          el.key !== "Various" &&
          el.key !== "Technical"
      );
      return filteredData;
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
    },
  
  },
  created() {
    this.loadData();
  },
  mounted() {
    this.initTooltip();
    this.scrollTrigger();
  },
  updated() {
    // console.log(this.misinfo);
  },
  methods: {
    loadData() {
      // d3.json("data/data.json").then(d => {
      //   return (this.data = d.misinfo);
      // });

      d3.csv("data/data.csv", d => {
        return {
          id: +d[""],
          party: d["Source"],
          domain: d["Frequented Topics"],
          cat: d["Overarching Themes"],
          site: d["Links"],
          purpose: d["Year"],
          name: d["Claims"]
        };
      })
        .then(d => {
          // add property for converted expiration time to days
          let convertedData = d
            .filter(d => d.domain != "Other")
            .map(d => ({
              ...d,
              days: this.convertData(d.exp)
            }));
          return (this.misinfo = convertedData);
        })
        .then(() => {
          this.nested_data = d3
            .nest()
            .key(d => {
              return d.party;
            })
            .entries(this.misinfo);
          this.sort();
        });
    },
    sort() {
      return this.nested_data.forEach(el => {
        el.values.sort((x, y) => {
          return d3.descending(x.cat, y.cat);
        });
      });
    },
    convertData(e) {
      // used to convert unix seconds to number of days until expiration
      let misinfodex = e;

      return misinfodex;
    },
    select(id) {
      this.iSelected = id;
      // this.domainSelected = d;
    },
    initTooltip() {
      let self = this;
      tooltip = {
        element: null,
        init: function() {
          this.element = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        },
        show: function(t) {
          this.element
            .html(t)
            .transition()
            .duration(200)
            .style(
              "left",
              `${self.fixedTip ? window.innerWidth * 0.35 : event.x + 30}px`
            )
            .style(
              "top",
              `${self.fixedTip ? window.innerHeight * 0.5 : event.y + 10}px`
            )
            .style("opacity", 0.925);
        },
        move: function() {
          this.element
            .transition()
            .duration(30)
            .style(
              "left",
              `${self.fixedTip ? window.innerWidth * 0.35 : event.x + 30}px`
            )
            .style(
              "top",
              `${self.fixedTip ? window.innerHeight * 0.5 : event.y + 10}px`
            )
            .style("opacity", 0.925);
        },
        hide: function() {
          this.element
            .transition()
            .duration(100)
            .style("opacity", 0);
          // .delay(100);
          // .style("right", `0px`);
        }
      };
      tooltip.init();
    },
    myTooltip(d) {
      // console.log(d);
      if (this.showLabel || this.showLabelAuto) {
        tooltip.show(`<div id="tip-band"></div><h5 class="total">${
          d.domain
        }</h5><p>
        <span class="datum"><i>"${
          d.name
        }"</i></span> This claim is from <span class="datum">${d.party}</span>  
        <span class="datum"></span>.
        </p>`);
        document.documentElement.style.setProperty(
          "--active-tip",
          this.myFill(d.cat)
        );
      } else if (!this.showLabel) {
        tooltip.hide();
      }
    },
    hoverTip(x) {
      this.activeLink = x;
      if (this.showHoverTip) {
        tooltip.show(
          `<img src="${this.links[this.activeLink]}" width="100%"/>`
        );
      } else if (!this.showHoverTip) {
        tooltip.hide();
      }
    },
    myFill(e) {
      if (e === "Protests") {
        return "var(--cat-news)";
      } else if (e === "Politicians ") {
        return "var( --cat-ent)";
      } else if (e === "Anti-Muslim") {
        return "var(--cat-social)";
      } else if (e === "Covid 19") {
        return "var(--cat-ecommerce)";
      }  else if(e === "Other") {
        return "#000";
      }
    },
    count() {
      return this.misinfo.length;
    },
    numFormater(el) {
      const numFormatT = d3.format(",d");
      return numFormatT(el);
    },
    
    scrollTrigger() {
      d3.graphScroll()
        .offset(130)
        .graph(d3.selectAll("#graph"))
        .container(d3.select("#chart"))
        .sections(d3.selectAll("#sections > div"))
        .eventId("uniqueId1")
        .on("active", i => {
          console.log("case", i);
          switch (i) {
            case 0:
              this.graphTitle = "Source";
              // set shown 0
              this.setShown = 0;
              // set nesting for party type
              this.nested_data = d3
                .nest()
                .key(d => {
                  return d.party;
                })
                .entries(this.misinfo);
              this.sort();

              // this.filterKey = "3rd Party";
              this.domainX.max = 2000;
              // reset active point
              this.select(null);
              this.showLabelAuto = false;
              this.myTooltip(null);

              break;

            case 1:
              this.graphTitle = "Emerging-Themes";
            
              this.setShown = 2;
              this.nested_data = d3
                .nest()
                .key(d => {
                  return d.cat;
                })
                .entries(this.misinfo);

              this.sort();

             
              this.domainX.max = 600;
             
              this.filterKey = "3rd Party";
        
              this.select(null);
              this.showLabelAuto = false;
              this.myTooltip(null);
              break;

            case 2:
              this.graphTitle = "COVID-19";
              // set shown 1
              this.setShown = 1;
              // set nesting for domain
              this.nested_data = d3
              .nest()
              .key(d => { 
                  if (d.cat == "Covid 19")  {
                  return d.domain
                  }
                })
                .entries(this.misinfo);

              // only first parties max domain
              this.domainX.max = 200;
              // remove third parties
              this.filterKey = "undefined";
        
              
              // reset active point
              this.select(null);
              this.showLabelAuto = false;
              this.myTooltip(null);
              this.fixedTip = false;

              break;

              case 3:
              this.graphTitle = "Politicians";
              // set shown 1
      
              // set nesting for domain
              this.nested_data = d3
                .nest()
                .key(d => { 
                  if (d.cat == "Politicians ")  {
                  return d.domain
                  }
                })
                .entries(this.misinfo);

              // only first parties max domain
              this.domainX.max = 250;
              // remove third parties
              this.filterKey = "undefined";
              
              
              // reset active point
              this.select(null);
              this.showLabelAuto = false;
              this.myTooltip(null);
              this.fixedTip = false;

              break;

              case 4:
              this.graphTitle = "Protests";
              // set shown 1
      
              // set nesting for domain
              this.nested_data = d3
                .nest()
                .key(d => { 
                  if (d.cat == "Protests")  {
                  return d.domain
                  }
                })
                .entries(this.misinfo);

              // only first parties max domain
              this.domainX.max = 165;
              // remove third parties
              this.filterKey = "undefined";
              
              
              // reset active point
              this.select(null);
              this.showLabelAuto = false;
              this.myTooltip(null);
              this.fixedTip = false;

              break;

              case 5:
                this.graphTitle = "Muslims";
                // set shown 1
        
                // set nesting for domain
                this.nested_data = d3
                  .nest()
                  .key(d => { 
                    if (d.cat == "Anti-Muslim")  {
                    return d.domain
                    }
                  })
                  .entries(this.misinfo);
  
                // only first parties max domain
                this.domainX.max = 250;
                // remove third parties
                this.filterKey = "undefined";
                
                
                // reset active point
                this.select(null);
                this.showLabelAuto = false;
                this.myTooltip(null);
                this.fixedTip = false;
  
                break;

            default:
              console.log(
                "hi im the default case...something didn't fire correctly"
              );
              this.showLabelAuto = false;
              this.myTooltip(null);

              break;
          }
        });
    }
  },
  directives: {
    axis(el, binding) {
      const axis = binding.arg; // x or y

      const axisMethod = { x: "axisTop", y: "axisLeft" }[axis];
      // The line below assigns the x or y function of the scale object
      const methodArg = binding.value[axis];

      // d3.axisBottom(scale.x)
      d3.select(el).call(d3[axisMethod](methodArg).ticks(5));
    },
    grid(el, binding) {
      const axis = binding.arg; // x or y
      const axisMethod = { gridlines: "axisTop" }[axis];
      // The line below assigns the x or y function of the scale object
      const methodArg = binding.value[axis];
      // d3.axisBottom(scale.x)
      d3.select(el).call(
        d3[axisMethod](methodArg)
          .tickFormat("")
          .tickSize(-window.innerHeight * 0.74)
          .ticks(5)
      );
    }
  }
});
