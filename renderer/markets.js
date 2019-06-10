const {ipcRenderer} = require("electron");

class Markets {
  constructor() {}

  renderMarkets() {
    EthoMainGUI.renderTemplate("markets.html", {});
    $(document).trigger("render_markets");

    $.getJSON("https://api.coingecko.com/api/v3/coins/ether-1?sparkline=true", function (data) {
      $("#ETHOToUSD").html(data.market_data.current_price.usd.toFixed(5) + " $");
      $("#ETHOToBTC").html(data.market_data.current_price.btc.toFixed(8)) + " sats";
      $("#marketcap").html(data.market_data.market_cap.usd.toFixed(0) + " $ (" + data.market_cap_rank + ")");
      $("#dailyVolume").html(data.market_data.total_volume.usd.toFixed(0) + " $");

      $("#changeUSD").html("7 days change: " + data.market_data.price_change_percentage_7d_in_currency.usd.toFixed(2) + "%");
      $("#changeBTC").html("7 days change: " + data.market_data.price_change_percentage_7d_in_currency.btc.toFixed(2) + "%");
      $("#changeMarketcap").html("high 24h: " + data.market_data.high_24h.usd.toFixed(5) + " $");
      $("#changeVolume").html("all time high: " + data.market_data.ath.usd.toFixed(5) + " $");

      new Chart(document.getElementById("chartMarketPriceCanvas"), {
        type: "line",
        data: {
          labels: data.market_data.sparkline_7d.price,
          datasets: [
            {
              data: data.market_data.sparkline_7d.price,
              backgroundColor: "rgb(122,19,54,0.1)",
              fill: true,
              borderWidth: 3,
              pointRadius: 0,
              borderColor: "#7A1336"
            }
          ]
        },
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false,
            labels: {
              display: false
            }
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  maxTicksLimit: 5,
                  beginAtZero: true,
                  fontSize: 10,
                  callback: function (value, index, values) {
                    return value.toFixed(2) + " $";
                  }
                },
                gridLines: {
                  color: "rgba(255,255,255,.08)"
                }
              }
            ],
            xAxes: [
              {
                display: false
              }
            ]
          }
        }
      });
    });
  }
}

// create new markets variable
EthoMarkets = new Markets();
