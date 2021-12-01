import React, {useState} from 'react'

import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";


const CoinChart = ({data, selected}) => {

  const [ bearish, setBearish] = useState({
    startBear: 0, 
    endBear: 0,
    trendBear: 0
  })

  //console.log(selected, data)
  const checkDateRange = (endDate, startDate) => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays
  }


  let topPrice =data.prices[0][1]
  let bottomPrice =data.prices[0][1]
  data.prices.map(p => {
    if(p[1]>topPrice) topPrice=p[1]
    if(p[1]<bottomPrice) bottomPrice=p[1]
  })

  console.log(topPrice, bottomPrice)

  const createDataSet = () => {
    // extracting the last data point for each day
    let counter = 0
    let startBear
    let endBear
    let trendBear
    let topPrice = 0
    let bottomPrice = 0
    let extractedData = data.prices.filter(price => {
      if(data.prices.indexOf(price)<data.prices.length-1 && new Date(data.prices[data.prices.indexOf(price)+1][0]).getDate()>new Date(price[0]).getDate()){
        //console.log(new Date(price[0]).getDate())
        return price
      }
      return null
    })
    //console.log(extractedData)

    extractedData.map(d => {
      if(extractedData.indexOf(d)<extractedData.length-1){
        //console.log(d[1],extractedData[extractedData.indexOf(d)+1][1])

        if(d[1]>extractedData[extractedData.indexOf(d)+1][1]){
          counter += 1
        } else {
          startBear = extractedData[extractedData.indexOf(d)-counter]
          endBear = d
          counter = 0
          trendBear =  checkDateRange(new Date(endBear[0]), new Date(startBear[0]))

          if(bearish.trendBear<trendBear){
            const newBearish = {
              startBear, endBear, trendBear
            }
            setBearish(newBearish)
          }
        }
      }
      return null
    })

  }

  createDataSet()

  const chartData = data.prices.map(price => {
    const d = {x: price[0], y:price[1] }
    return d
  })

  console.log(chartData)

  
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  const startTime = new Date()
  startTime.setTime(bearish.startBear[0])
  const endTime = new Date()
  endTime.setTime(bearish.endBear[0])

  const chartOptions = {
    title: {
      text: `${selected.name} currency chart`
    },
    xAxis:{
      type:'datetime',
      lineColor:'#999',
      lineWidth:1,
      tickColor:'#666',
      tickLength:3,
      title:{
          text:`Longest bearish trend was ${bearish.trendBear} days <br /> between ${startTime.toLocaleDateString('en-EN', options)} and ${endTime.toLocaleDateString('en-EN', options)}`
      }
    },
    series: [
      {
        data: chartData,
        name:'Crypto currency graph',
        turboThreshold: 5000
      },
      {
        type:'line',
        name:'longest bearish trend',
         marker:{enabled:false},
         lineWidth:3,
         color:'orange',
        data:[[bearish.startBear[0], bottomPrice],[bearish.endBear[0],bottomPrice]]
         
     }
    ]
  }

  //console.log(Highcharts.chart().yAxis)
  console.log(bearish)
  
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
    />
  )
}

export default CoinChart
