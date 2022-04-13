const axios = require("axios");
// const http = require("http");

const getToken = async (iikoServer, iikoLogin, iikoPassword) => {
  // let data = "";
  // var options = {
  //   host: '95.31.10.45',
  //   port: 9080,
  //   path: `/resto/api/auth?login=${iikoLogin}&pass=${iikoPassword}`,
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   }
  // };
  // http.get(`${iikoServer}/auth?login=${iikoLogin}&pass=${iikoPassword}`, function(res) {
  //   console.log("Got response: " + res.statusCode);
  //   res.on("data", function (chunk) {
  //     // append this chunk to our growing `data` var
  //     data += chunk;
  //   });
  //
  //   // this event fires *one* time, after all the `data` events/chunks have been gathered
  //   res.on("end", function () {
  //     // you can use res.send instead of console.log to output via express
  //     console.log(data);
  //     return data;
  //   });
  // });



  const result = await axios.get(`${iikoServer}/auth?login=${iikoLogin}&pass=${iikoPassword}`);
  if (result.status != 200) {
    console.log('Error while authentificating in iiko:');
    console.log(result.statusText);
    return null;
  }

  return result.data;
}

const releaseToken = async (token, iikoServer) => {
  await axios.get(`${iikoServer}/logout?key=${token}`);
}

module.exports = {
  getToken,
  releaseToken
}