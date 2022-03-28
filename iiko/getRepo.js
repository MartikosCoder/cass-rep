const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const { iikoServer, iikoLogin, iikoPassword } = require('./consts');

const getRepo = async () => {
  axios
    .get(iikoServer + `/auth?login=${iikoLogin}&pass=${iikoPassword}`)
    .then(async (token) => {
      const date = Date.now();
      const strDate = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
      axios
        .post(iikoServer + `resto/api/v2/reports/olap?key=${token}`, {
          reportType: "SALES",
          buildSummary: "false",
          groupByRowFields: [
            "Cashier.Id",
            "Department",
            "OrderNum",
            "DishName",
            "DishCategory",
            "DishAmountInt"
          ],
          filters: {
            "OpenDate.Typed": {
                filterType: "DateRange",
                periodType: "CUSTOM",
                from: `${strDate}T00:00:00.000`,
                to: `${strDate}T23:59:59.999`
            }
          }
        } )
        .then(async (xmlResult) => {
          const parser = new XMLParser();
          const jsonResult = parser.parse(xmlResult);
          return jsonResult;
        });
    });
  return null;
}

module.exports = {
  getRepo
}