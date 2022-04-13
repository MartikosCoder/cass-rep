const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const getCategories = async (token, iikoServer) => {
  const result = await axios.get(`${iikoServer}/v2/entities/products/category/list?key=${token}`);
  if (result.status != 200) {
    console.log('Error getting categories from iiko:');
    console.log(result.statusText);
    return null;
  }
  return result.data;
}

module.exports = {
  getCategories
}