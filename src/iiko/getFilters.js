const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const getFilters = async (token, iikoServer) => {
  const filters = {
    payTypes: [],
    discountTypes: [],
    orderTypes: []
  }
  let result = await axios.get(`${iikoServer}/v2/entities/list?rootType=PaymentType&key=${token}`);
  if (result.status != 200) {
    console.log('Error getting PaymentTypes from iiko:');
    console.log(result.statusText);
    return null;
  }
  result.data.forEach(el => filters.payTypes.push(el.name));
  result = await axios.get(`${iikoServer}/v2/entities/list?rootType=DiscountType&key=${token}`);
  if (result.status != 200) {
    console.log('Error getting DiscountTypes from iiko:');
    console.log(result.statusText);
    return null;
  }
  result.data.forEach(el => filters.discountTypes.push(el.name));
  result = await axios.get(`${iikoServer}/v2/entities/list?rootType=OrderType&key=${token}`);
  if (result.status != 200) {
    console.log('Error getting orderTypes from iiko:');
    console.log(result.statusText);
    return null;
  }
  result.data.forEach(el => filters.orderTypes.push(el.name));
  return filters;
}

module.exports = {
  getFilters
}
