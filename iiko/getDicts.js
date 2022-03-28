const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const { iikoServer, iikoLogin, iikoPassword } = require('./consts');

const getDicts = async () => {
  axios
    .get(iikoServer + `/auth?login=${iikoLogin}&pass=${iikoPassword}`)
    .then(async (token) => {
      axios
        .get(iikoServer + `/entities/list?key=${token}`)
        .then(async (xmlResult) => {
          const parser = new XMLParser();
          const jsonResult = parser.parse(xmlResult);
          return jsonResult;
        });
    });
  return null;
}

module.exports = {
  getDicts
}