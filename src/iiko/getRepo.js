const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const fs = require("fs");

const getRepo = async (startDate, endDate, filters, department, token, iikoServer) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const data = {
    reportType: "SALES",
    buildSummary: "false",
    "groupByRowFields": [
      "Cashier",
      "Department",
      "DishCategory.Accounting"
    ],
    "aggregateFields": [
      "DishAmountInt"
    ],
    filters: {
      "Department": {
        "filterType": "IncludeValues",
        "values": [department]
      },
      "OpenDate.Typed": {
        filterType: "DateRange",
        periodType: "CUSTOM",
        from: startDate,
        to: endDate
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
  if (filters.payTypes && filters.payTypes.length) {
    data.filters["PayTypes"] = {
      filterType: "IncludeValues",
      values: filters.payTypes
    }
  }
  if (filters.discountTypes && filters.discountTypes.length) {
    data.filters["OrderDiscount.Type"] = {
      filterType: "IncludeValues",
      values: filters.discountTypes
    }
  }
  if (filters.orderTypes && filters.orderTypes.length) {
    data.filters["OrderType"] = {
      filterType: "IncludeValues",
      values: filters.orderTypes
    }
  }
  console.log(data);
  try {
    const result = await axios.post(`${iikoServer}/v2/reports/olap?reportType=SALES&key=${token}`, data, config);
    const str = `Get purchases: ${department}\n`;
    fs.appendFile('iiko.log', str, (err) => {
      if (err) throw err;
    });
    if (result.status != 200) {
      console.log('Error getting reports from iiko:');
      console.log(result.statusText);
      return null;
    }
    // console.log(result.data.data);
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
