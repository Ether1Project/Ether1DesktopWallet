const {ipcRenderer} = require("electron");

class Markets {
  constructor() {}

  renderMarkets() {
    EthoMainGUI.renderTemplate("markets.html", {});
    $(document).trigger("render_markets");

    $.getJSON("https://api.coingecko.com/api/v3/coins/ether-1?sparkline=true", function (data) {
      // Check if data and required properties exist
      if (data && data.market_data && data.market_data.current_price) {
        $("#ETHOToUSD").html((data.market_data.current_price.usd || 0).toFixed(5) + " $");
        $("#ETHOToBTC").html((data.market_data.current_price.btc || 0).toFixed(8) + " sats");
        $("#marketcap").html((data.market_data.market_cap?.usd || 0).toFixed(0) + " $ (" + (data.market_cap_rank || "N/A") + ")");
        $("#dailyVolume").html((data.market_data.total_volume?.usd || 0).toFixed(0) + " $");

        $("#changeUSD").html((data.market_data.price_change_percentage_7d_in_currency?.usd || 0).toFixed(2) + "%");
        $("#changeBTC").html((data.market_data.price_change_percentage_7d_in_currency?.btc || 0).toFixed(2) + "%");
        $("#changeMarketcap").html((data.market_data.high_24h?.usd || 0).toFixed(5) + "$");
        $("#changeVolume").html((data.market_data.ath?.usd || 0).toFixed(5) + "$");
      } else {
        console.error("Invalid market data received:", data);
        $("#ETHOToUSD").html("N/A");
        $("#ETHOToBTC").html("N/A");
        $("#marketcap").html("N/A");
        $("#dailyVolume").html("N/A");
        $("#changeUSD").html("N/A");
        $("#changeBTC").html("N/A");
        $("#changeMarketcap").html("N/A");
        $("#changeVolume").html("N/A");
      }

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
              borderColor: "#25D4DC"
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
                  color: "rgba(255,255,255,.35)"
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
