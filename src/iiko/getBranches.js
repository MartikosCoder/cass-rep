const axios = require('axios')
const { XMLParser } = require('fast-xml-parser');

const getBranches = async (token, iikoServer) => {
  const result = await axios.get(`${iikoServer}/corporation/departments?key=${token}`, {  headers: {
      'Accept': 'application/xml'
    }});
  if (result.status != 200) {
      console.log('Error getting departments from iiko:');
      console.log(result.statusText);
      return null;
  }

  const parser = new XMLParser();
  const jsonResult = parser.parse(result.data);
  return jsonResult;
}

module.exports = {
  getBranches
}
