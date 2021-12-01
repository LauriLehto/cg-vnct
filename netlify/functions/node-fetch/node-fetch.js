const fetch = require('node-fetch')

//1. Import coingecko-api
const CoinGecko = require('coingecko-api');

//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();

//3. Make calls

const cg_rul = 'https://www.coingecko.com/en/api/documentation'

const handler = async function (query) {
  const CoinGeckoClient = new CoinGecko();
  /* console.log(query.queryStringParameters.id) */
  const params = query.queryStringParameters
  try {
    if(params.id){

      const client = CoinGeckoClient.coins.fetchMarketChartRange(params.id, {
        from: parseInt(params.start),
        to: parseInt(params.end),
        vs_currency: 'eur'
      }) 
      
      const result = await client
      if (!result.success) {
        // NOT res.status >= 200 && res.status < 300
        return { statusCode: 200, body: result.message }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ data: result.data }),
      }

    } else {
      const client = CoinGeckoClient.coins.list()
      
      const result = await client
      if (!result.success) {
        // NOT res.status >= 200 && res.status < 300
        return { statusCode: 200, body: result.message }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ data: result.data }),
      }
    }
  } catch (error) {
    // output to netlify function log
    console.log(error)
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ msg: error.message }),
    }
  }
}

module.exports = { handler }
