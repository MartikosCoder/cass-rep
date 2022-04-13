const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const getRepo = async (lastCheck, token, iikoServer) => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const strDate = date.toJSON().substring(0, 10) + 'T00:00:00.000';
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const data = {
    reportType: "SALES",
    buildSummary: "false",
    groupByRowFields: [
      "Cashier",
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
        from: lastCheck,
        to: `${strDate}`
      },
      "DeletedWithWriteoff": {
        filterType: "ExcludeValues",
        values: ["DELETED_WITH_WRITEOFF","DELETED_WITHOUT_WRITEOFF"]
      },
      "OrderDeleted": {
        filterType: "IncludeValues",
        values: ["NOT_DELETED"]
      }
    }
  }
  try {
    const result = await axios.post(`${iikoServer}/v2/reports/olap?reportType=SALES&key=${token}`, data, config);
    if (result.status != 200) {
      console.log('Error getting reports from iiko:');
      console.log(result.statusText);
      return null;
    }
    return result.data;
  } catch (e) {
    console.log(e);
    console.log(token);
    return null;
  }
}

module.exports = {
  getRepo
}