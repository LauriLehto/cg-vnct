import React, {useState} from 'react'

import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";


const CoinChart = ({data, selected}) => {

  const [ bearish, setBearish] = useState({
    /* startBear: new Date().getTime(), 
    endBear: new Date().getTime(), */ 
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

  const createDataSet = () => {
    // extracting the last data point for each day
    let counter = 0
    let startBear
    let endBear
    let trendBear
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
        turboThreshold: 5000
      },
      /* {
        type:'area',
        name:'band',
         marker:{enabled:false},
         lineWidth:0,
         color:'rgba(156,156,156,.5)',
        data:[[new Date(bearish.startBear[0]), Highcharts.chart().yAxis[max]],[new Date(bearish.startBear[0]),80],[new Date(bearish.endBear[0]),80],[new Date(bearish.endBear[0]),0]]
         
     } */
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
