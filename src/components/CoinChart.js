import React, {useState, useEffect } from 'react'

import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

import  { getUTCTimeString, filterDataByDate, getTopBottom, checkDateRange, numberWithSpaces } from '../functions/helpers'

function CoinChart(props){

  const initBear = {
    start: 0, 
    end: 0,
    trend: 0
  }

  const { currency } = props
  const [ data, setData ] = useState([])
  const [ showChart, setShowChart ] = useState(false)
  const [ bearishSet, setBearish] = useState(initBear)
  const [ chartData, setChartData ] = useState({})
  const [ prices, setTopBottom ] = useState({})
  
  
  const getBearishChart = (bearish, first) => {

    const { bottomPrice } = prices

    const firstTitleObject = {
      showInLegend: true,
      name:'Longest bearish trend',
    }

    let bearishData = {
      showInLegend: false,
      type:'line',
      marker:{enabled:false},
      lineWidth:3,
      color:'grey',
      data:[]
    }

    bearishData.data =[[bearish.start[0], bottomPrice[1]*0.9],[bearish.end[0],bottomPrice[1]*0.9]]

    if(first) {
      bearishData = {...bearishData, ...firstTitleObject}
    }
    return bearishData
  }

  const getHighestVolumeChart = () => {

    if(Object.keys(data).length){
      const { topPrice, bottomPrice } = prices

      let volumeData = {
        showInLegend: true,
        name:'',
        type:'line',
        marker:{enabled:false},
        lineWidth:2,
        color:'orange',
        data:[]
      }

      const total_volumes = filterDataByDate(data.total_volumes)
      let highestV = 0
      total_volumes.map(v => {
        if(v[1]>highestV) highestV=v[1]
        return v
      })

      highestV = total_volumes.filter(v => v[1]===highestV)
      highestV = highestV[0]
      const hvTime = new Date(highestV[0])
      let hvAmount = parseInt(highestV[1])
      const getTextHighestVolumeAmount = (hva) => {
        return `${numberWithSpaces(hva)} euros`
      }
      let hvaText = `Highest trading volume was ${getTextHighestVolumeAmount(hvAmount)} on ${getUTCTimeString(hvTime)}`

      volumeData.data = [[highestV[0], bottomPrice[1]*0.8],[highestV[0],topPrice[1]*1.1]]
      volumeData.name = hvaText

      return volumeData
    }
    return null

  }

  const getBuyingChart = () => {

    if(Object.keys(data).length){
      const { topPrice, bottomPrice } = prices
      const priceDiff = topPrice[1]-bottomPrice[1]
      console.log(priceDiff/10)
      const tenth = priceDiff/10


      const priceData = {
        showInLegend: true,
        name:'',
        type:'line',
        marker:{enabled:true},
        lineWidth:2,
        data:[]
      }
      const highestPrice = {
        color:'green',

      }
      highestPrice.name = `Highest price was ${numberWithSpaces(topPrice[1])} euros on ${getUTCTimeString(topPrice[0])}`
      highestPrice.data = [[topPrice[0], topPrice[1]+tenth],[topPrice[0],topPrice[1]+tenth]]
      const lowestPrice = {
        color:'red',

      }
      lowestPrice.name = `Lowest price was ${numberWithSpaces(bottomPrice[1])} euros on ${getUTCTimeString(bottomPrice[0])}`
      lowestPrice.data = [[bottomPrice[0], bottomPrice[1]-tenth],[bottomPrice[0],bottomPrice[1]-tenth]]

      return [{...priceData, ...lowestPrice}, {...priceData, ...highestPrice}]
        //volumeData.data = [[highestV[0], bottomPrice],[highestV[0],topPrice]]
        //volumeData.name = hvaText

    }
  }

  const getChartTitle = () => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

    if(chartData.length && bearishSet.length){

      const getTitle = () => {
        let textStart = `Longest bearish trend is ${bearishSet[0].trend} days <br /> between `
        bearishSet.map(b => {
          if(bearishSet.indexOf(b)<bearishSet.length-1){
            textStart = textStart + `${getUTCTimeString(b.start[0])} and ${getUTCTimeString(b.end[0])} and <br />`
          }else {
            textStart = textStart + `${getUTCTimeString(b.start[0])} and ${getUTCTimeString(b.end[0])}`
          }
          return null
        })
        return textStart
      }

      return {
        type:'datetime',
        lineColor:'#999',
        lineWidth:1,
        tickColor:'#666',
        tickLength:3,
        title:{
            text: getTitle()
        }
      }
    } else {
      return {
        type:'datetime',
        lineColor:'#999',
        lineWidth:1,
        tickColor:'#666',
        tickLength:3,
      }
    }
  }

  const getChartSeries = () => {
    let chartSeries = [
      {
        data: chartData,
        name:'Crypto currency graph',
        turboThreshold: 5000
      }
    ]

    if(bearishSet.length){
      bearishSet.map(b=> {
        chartSeries.push(getBearishChart(b, bearishSet.indexOf(b)===0))
        return null
      })
    }

    chartSeries.push(getHighestVolumeChart())
    console.log(getBuyingChart())
    const buyingChart = getBuyingChart()
    chartSeries = chartSeries.concat(getBuyingChart())
    //chartSeries = [...chartSeries, ...buyingChart]
    /* Object.keys(getBuyingChart()).map(c => {
      chartSeries.push(getBuyingChart()[c])
      return null
    }) */
    console.log(chartSeries)
    return chartSeries
  }

  let chartOptions = {}
  if(chartData.length){
    chartOptions = {
      title: {
        text: `${currency.selected.name} currency chart`
      },
      xAxis: getChartTitle(),
      series: getChartSeries()
    }
  }

  useEffect(()=>{
    const createChartData = (data) => {

      let newData = filterDataByDate(data.prices)
      console.log('top and bottom',getTopBottom(newData))
      setTopBottom(getTopBottom(newData))
      //format data for charts
      const newChartData = newData.map(d => {
        const data = {x: d[0], y:d[1] }
        return data
      })
  
      //console.log('daily data',newChartData)
      setChartData(newChartData)
  
      //produce bearish data
      let counter = 0
      let newBearishSet = newData.map(d => {
        if(newData.indexOf(d)<newData.length-1){
          // if value drops add to counter
          if(d[1]>newData[newData.indexOf(d)+1][1]){
            counter += 1
            return null
          } else {
            let start = newData[newData.indexOf(d)-counter]
            let end = d
            let trend = checkDateRange(end[0], start[0])
            const newBearish = {
              start, end, trend
            }
            counter = 0
            return newBearish
          }
        } else {
          if(d[1]<newData[newData.indexOf(d)-1][1]){
            let start = newData[newData.indexOf(d)-counter]
            let end = d
            let trend =  checkDateRange(end[0], start[0])
            const newBearish = {
              start, end, trend
            }
            return newBearish
          }
        }
        return null
      })
  
      //determine longest bearish trend
      let longestTrend = 0
      newBearishSet.map(b => {
        if(b && b.trend > longestTrend){
          longestTrend = b.trend
        }
        return b
      })
      newBearishSet=newBearishSet.filter(b => b && b.trend===longestTrend)
      
      setBearish(newBearishSet)
    }
  
    setShowChart(false)

    if(Object.keys(currency).length){
      try {
        fetch(`/.netlify/functions/node-fetch?id=${currency.selected.id}&start=${currency.startDate}&end=${currency.endDate}`, { headers: { accept: "Accept: application/json" } })
          .then(res => res.json())
          .then(json => {
            createChartData(json.data)
            setData(json.data)
            setShowChart(true)
            props.setDataLoading(false)
          })
      } catch (error) {
        console.error(error)
      }
    }
    
  },[setChartData, setShowChart, setData, props , currency])


  return (
    <>
      { 
        /* Show data in a chart */
        showChart && chartData.length !== 0 &&
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            />
      }
      { 
        /* Show message if no data has been received */
        showChart && chartData.length === 0 && 
          <p>Choose different date range or currency, no data received!</p>
      }
    </>
  )
}

export default React.memo(CoinChart)
