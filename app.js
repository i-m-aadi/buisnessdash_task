let records = [];
let monthly = [];
let campaigns = [];

let charts = {};


/* =========================================
   HELPER
========================================= */

const $ = (id) => document.getElementById(id);


/* =========================================
   FORMATTERS
========================================= */

const money = (number) => {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }
  ).format(number);

};


const number = (number) => {

  return new Intl.NumberFormat(
    "en-IN"
  ).format(number);

};


/* =========================================
   LOAD DATA
========================================= */

async function loadData() {

  $("loading").classList.remove("hidden");

  $("error").classList.add("hidden");

  $("dashboard").classList.add("hidden");


  try {

    /*
      Small delay to demonstrate
      loading state.
    */

    await new Promise(
      (resolve) => setTimeout(resolve, 550)
    );


    const response = await fetch(
      "data.json",
      {
        cache: "no-store"
      }
    );


    if (!response.ok) {

      throw new Error(
        "Data source returned an error."
      );

    }


    const data = await response.json();


    records = data.records;

    monthly = data.monthly;

    campaigns = data.campaigns;


    render();


    $("loading").classList.add("hidden");

    $("dashboard").classList.remove("hidden");


  } catch (error) {

    $("loading").classList.add("hidden");

    $("errorMessage").textContent =
      error.message +
      " Run the project through a local server.";

    $("error").classList.remove("hidden");

  }

}


/* =========================================
   FILTER RECORDS
========================================= */

function filteredRecords() {

  const dateValue =
    $("dateFilter").value;


  const category =
    $("categoryFilter").value;


  const query =
    $("searchInput")
      .value
      .trim()
      .toLowerCase();


  /*
    Latest synthetic reporting date.
  */

  const newest =
    new Date("2026-09-21");


  const days =
    dateValue === "all"
      ? Infinity
      : Number(dateValue);


  const cutoff =
    new Date(newest);


  if (days !== Infinity) {

    cutoff.setDate(
      cutoff.getDate() - days
    );

  }


  return records.filter((record) => {

    const date =
      new Date(record.date);


    const dateOk =
      days === Infinity ||
      date >= cutoff;


    const categoryOk =
      category === "all" ||
      record.service === category;


    const searchOk =
      !query ||
      `${record.customer} ${record.service} ${record.campaign}`
        .toLowerCase()
        .includes(query);


    return (
      dateOk &&
      categoryOk &&
      searchOk
    );

  });

}


/* =========================================
   MAIN RENDER
========================================= */

function render() {

  const data =
    filteredRecords();


  /*
    Revenue
  */

  const revenue =
    data.reduce(
      (sum, record) =>
        sum + record.amount,
      0
    );


  /*
    Unique customers
  */

  const customers =
    new Set(
      data.map(
        record => record.customer
      )
    ).size;


  /*
    Synthetic lead calculation.
  */

  const leads =
    Math.round(
      customers * 1.85
    );


  /*
    Conversion calculation.
  */

  const conversion =
    customers
      ? (customers / leads) * 100
      : 0;


  /* KPI VALUES */

  $("revenueKpi").textContent =
    money(revenue);


  $("customersKpi").textContent =
    number(customers);


  $("leadsKpi").textContent =
    number(leads);


  $("conversionKpi").textContent =
    conversion.toFixed(1) + "%";


  /* KPI CHANGES */

  $("revenueChange").textContent =
    "+18.4%";


  $("customersChange").textContent =
    "+11.2%";


  $("leadsChange").textContent =
    "+14.8%";


  $("conversionChange").textContent =
    "+2.6%";


  /* LOWER STATS */

  $("newCustomers").textContent =
    number(customers);


  $("retention").textContent =
    (
      customers
        ? Math.min(
            98,
            86 + (customers % 9)
          )
        : 0
    ) + "%";


  $("avgOrder").textContent =
    money(
      data.length
        ? revenue / data.length
        : 0
    );


  $("categoryTotal").textContent =
    money(revenue);


  $("rowCount").textContent =
    `${data.length} record${
      data.length === 1
        ? ""
        : "s"
    }`;


  /*
    Render everything.
  */

  renderTrend();

  renderCategory(data);

  renderAcquisition();

  renderCampaigns();

  renderTable(data);

}


/* =========================================
   BASE CHART OPTIONS
========================================= */

function baseChartOptions() {

  return {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: false
      },

      tooltip: {

        backgroundColor: "#182033",

        padding: 10,

        titleFont: {
          size: 11
        },

        bodyFont: {
          size: 10
        }

      }

    },

    animation: {
      duration: 500
    }

  };

}


/* =========================================
   REVENUE / CUSTOMER CHART
========================================= */

function renderTrend() {

  if (charts.trend) {

    charts.trend.destroy();

  }


  charts.trend =
    new Chart(
      $("trendChart"),
      {

        type: "line",

        data: {

          labels:
            monthly.map(
              item => item.month
            ),

          datasets: [

            {
              label: "Revenue",

              data:
                monthly.map(
                  item =>
                    item.revenue / 1000
                ),

              borderColor: "#5b5ce2",

              backgroundColor:
                "rgba(91,92,226,.10)",

              fill: true,

              tension: 0.4,

              pointRadius: 3,

              pointBorderWidth: 2,

              pointBackgroundColor: "#fff"
            },


            {
              label: "Customers",

              data:
                monthly.map(
                  item =>
                    item.customers
                ),

              borderColor: "#2db38a",

              backgroundColor:
                "transparent",

              tension: 0.4,

              pointRadius: 3,

              pointBackgroundColor: "#fff",

              pointBorderWidth: 2,

              yAxisID: "y1"
            }

          ]

        },


        options: {

          ...baseChartOptions(),

          scales: {

            y: {

              grid: {
                color: "#f0f1f5"
              },

              border: {
                display: false
              },

              ticks: {

                font: {
                  size: 9
                },

                color: "#9aa2b2",

                callback: (value) =>
                  "₹" + value + "k"

              }

            },


            y1: {

              position: "right",

              grid: {
                drawOnChartArea: false
              },

              border: {
                display: false
              },

              ticks: {

                font: {
                  size: 9
                },

                color: "#9aa2b2"

              }

            },


            x: {

              grid: {
                display: false
              },

              ticks: {

                font: {
                  size: 9
                },

                color: "#9aa2b2"

              }

            }

          }

        }

      }
    );

}


/* =========================================
   CATEGORY CHART
========================================= */

function renderCategory(data) {

  const totals = {

    SaaS: 0,

    Consulting: 0,

    Support: 0,

    Marketing: 0

  };


  data.forEach(
    record => {

      totals[record.service] =
        (
          totals[record.service] || 0
        ) + record.amount;

    }
  );


  const labels =
    Object.keys(totals);


  const values =
    labels.map(
      label =>
        totals[label]
    );


  if (charts.category) {

    charts.category.destroy();

  }


  charts.category =
    new Chart(
      $("categoryChart"),
      {

        type: "doughnut",

        data: {

          labels,

          datasets: [

            {

              data: values,

              backgroundColor: [

                "#5b5ce2",

                "#2db38a",

                "#f2a64b",

                "#e76f83"

              ],

              borderWidth: 0,

              hoverOffset: 5

            }

          ]

        },


        options: {

          ...baseChartOptions(),

          cutout: "72%",

          plugins: {

            ...baseChartOptions().plugins,

            tooltip: {

              ...baseChartOptions()
                .plugins
                .tooltip,

              callbacks: {

                label: (context) =>
                  " " + money(context.raw)

              }

            }

          }

        }

      }
    );


  const colors = [

    "#5b5ce2",

    "#2db38a",

    "#f2a64b",

    "#e76f83"

  ];


  $("categoryList").innerHTML =
    labels.map(
      (label, index) => `

        <div class="category-row">

          <span class="left">

            <i
              class="dot"
              style="background:${colors[index]}"
            ></i>

            ${label}

          </span>

          <strong>
            ${money(values[index])}
          </strong>

        </div>

      `
    ).join("");

}


/* =========================================
   CUSTOMER ACQUISITION
========================================= */

function renderAcquisition() {

  if (charts.acquisition) {

    charts.acquisition.destroy();

  }


  charts.acquisition =
    new Chart(
      $("acquisitionChart"),
      {

        type: "bar",

        data: {

          labels:
            monthly.map(
              item => item.month
            ),

          datasets: [

            {

              data:
                monthly.map(
                  item =>
                    Math.round(
                      item.customers * 0.8
                    )
                ),

              backgroundColor: "#e6e7ff",

              hoverBackgroundColor:
                "#6466e8",

              borderRadius: 5,

              barThickness: 22

            }

          ]

        },


        options: {

          ...baseChartOptions(),

          scales: {

            x: {

              grid: {
                display: false
              },

              ticks: {

                font: {
                  size: 8
                },

                color: "#9aa2b2"

              }

            },


            y: {

              grid: {

                color: "#f0f1f5"

              },

              border: {

                display: false

              },

              ticks: {

                font: {
                  size: 8
                },

                color: "#9aa2b2"

              }

            }

          }

        }

      }
    );

}


/* =========================================
   CAMPAIGNS
========================================= */

function renderCampaigns() {

  const max =
    Math.max(
      ...campaigns.map(
        campaign =>
          campaign.value
      )
    );


  $("campaignList").innerHTML =
    campaigns.map(
      campaign => `

        <div class="campaign-row">

          <span class="name">
            ${campaign.name}
          </span>

          <div class="progress">

            <span
              style="
                width:${
                  (campaign.value / max) * 100
                }%;
              "
            ></span>

          </div>

          <strong>
            ${campaign.value}%
          </strong>

        </div>

      `
    ).join("");

}


/* =========================================
   ACTIVITY TABLE
========================================= */

function renderTable(data) {

  $("activityBody").innerHTML =
    data.map(
      record => `

        <tr>

          <td>
            ${
              new Date(
                record.date
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                }
              )
            }
          </td>


          <td>

            <strong>
              ${record.customer}
            </strong>

          </td>


          <td>
            ${record.service}
          </td>


          <td>
            ${record.campaign}
          </td>


          <td>

            <span
              class="
                status
                ${record.status.toLowerCase()}
              "
            >
              ${record.status}
            </span>

          </td>


          <td class="align-right">
            ${money(record.amount)}
          </td>

        </tr>

      `
    ).join("");


  $("emptyState").classList.toggle(
    "hidden",
    data.length !== 0
  );

}


/* =========================================
   RESET FILTERS
========================================= */

function resetFilters() {

  $("dateFilter").value =
    "90";

  $("categoryFilter").value =
    "all";

  $("searchInput").value =
    "";

  render();

}


/* =========================================
   EVENTS
========================================= */

$("dateFilter")
  .addEventListener(
    "change",
    render
  );


$("categoryFilter")
  .addEventListener(
    "change",
    render
  );


$("searchInput")
  .addEventListener(
    "input",
    render
  );


$("resetBtn")
  .addEventListener(
    "click",
    resetFilters
  );


$("refreshBtn")
  .addEventListener(
    "click",
    loadData
  );


$("retryBtn")
  .addEventListener(
    "click",
    loadData
  );


$("menuBtn")
  .addEventListener(
    "click",
    () => {

      $("sidebar")
        .classList
        .toggle("open");

    }
  );


/* =========================================
   CURRENT DATE
========================================= */

$("todayLabel").textContent =
  new Date().toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );


/* =========================================
   INITIALIZE
========================================= */

loadData();