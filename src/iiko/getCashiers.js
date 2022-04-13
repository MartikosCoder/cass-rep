const axios = require('axios')
const { XMLParser } = require('fast-xml-parser');

const getCashiers = async (token, iikoServer) => {
  const result = await axios.get(`${iikoServer}/employees?key=${token}`, {  headers: {
      'Accept': 'application/xml'
    }});

  if (result.status != 200) {
    console.log('Error getting cachiers from iiko:');
    console.log(result.statusText);
    return null;
  }

  const parser = new XMLParser();
  const jsonResult = parser.parse(result.data);

  return jsonResult;
}

module.exports = {
  getCashiers
}
