const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const { iikoServer, iikoLogin, iikoPassword } = require('./consts');

const getCategories = async () => {
  axios
    .get(iikoServer + `/auth?login=${iikoLogin}&pass=${iikoPassword}`)
    .then(async (token) => {
      axios
        .get(iikoServer + `entities/products/category/list?key=${token}`)
        .then(async (xmlResult) => {
          const parser = new XMLParser();
          const jsonResult = parser.parse(xmlResult);
          return jsonResult;
        });
    });
  return null;
}

module.exports = {
  getCategories
}