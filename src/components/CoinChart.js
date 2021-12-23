import React, {useState, useEffect } from 'react'

import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

import  { getUTCTimeString, filterDataByDate, getHighLow, checkDateRange, numberWithSpaces } from '../functions/helpers'

function CoinChart(props){

  const initBear = {
    start: 0, 
    end: 0,
    trend: 0
  }

  const { currency } = props
  const [ data, setData ] = useState([])
  const [ showChart, setShowChart ] = useState(false)
  const [ bearishData, setBearish] = useState(initBear)
  const [ chartData, setChartData ] = useState({})
  const [ prices, setHighLow ] = useState({})
  
  
  const getBearishChart = (bearish, first) => {

    const { bottomPrice } = prices

    const firstTitleObject = {
      showInLegend: true,
      name: getBearishTitle(),
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
        return `${numberWithSpaces(hva)} €`
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
      const tenth = priceDiff/15

      const priceData = {
        showInLegend: true,
        name:'',
        type:'line',
        lineWidth:2,
        data:[]
      }
        
        const highestPrice = { marker:{enabled:true, symbol: 'triangle-down'}, color:'green', }
      highestPrice.name = `Highest price was ${numberWithSpaces(topPrice[1])} € on ${getUTCTimeString(topPrice[0])}`
      highestPrice.data = [[topPrice[0], topPrice[1]+tenth],[topPrice[0],topPrice[1]+tenth]]

      const lowestPrice = { marker:{enabled:true, symbol: 'triangle'}, color:'red',  }
      lowestPrice.name = `Lowest price was ${numberWithSpaces(bottomPrice[1])} € on ${getUTCTimeString(bottomPrice[0])}`
      lowestPrice.data = [[bottomPrice[0], bottomPrice[1]-tenth],[bottomPrice[0],bottomPrice[1]-tenth]]

      return [{...priceData, ...lowestPrice}, {...priceData, ...highestPrice}]

    }
  }

  const getBearishTitle = () => {
    let textStart = ''
    if(chartData.length && bearishData.length){
      textStart = `Longest bearish trend was ${bearishData[0].trend} days between <br />  `

      bearishData.map(b => {
        if(bearishData.indexOf(b)<bearishData.length-1){
          textStart = textStart + `${getUTCTimeString(b.start[0])} and ${getUTCTimeString(b.end[0])} and <br />`
        }else {
          textStart = textStart + `${getUTCTimeString(b.start[0])} and ${getUTCTimeString(b.end[0])}`
        }
        return null
      })
    }
    return textStart
  }

  const getChartTitle = () => {

    if(chartData.length && bearishData.length){
      const chartStart = new Date(chartData[0].x).setUTCHours(0,0,0,0)
      const chartEnd = new Date(chartData[chartData.length-1].x).setUTCHours(0,0,0,0)
      const bearStart = new Date(bearishData[0].start[0]).setUTCHours(0,0,0,0)
      const bearEnd = new Date(bearishData[0].end[0]).setUTCHours(0,0,0,0)

      let titleText = ''
      if(chartStart === bearStart && chartEnd === bearEnd){
        titleText = "You should DUCK and SCROOGE, date range is complete bearish! Do not buy or sell!"
      }

      return {
        type:'datetime',
        lineColor:'#999',
        lineWidth:1,
        tickColor:'#666',
        tickLength:3,
        title:{
            text: titleText,
            style: {
              color: 'red'
            }
        }
      }
    } 
  }

  const getChartSeries = () => {
    let chartSeries = [
      {
        data: chartData,
        name:`${currency.selected.name} value between ${getUTCTimeString(currency.startDate)} and ${getUTCTimeString(currency.endDate)}`,
        turboThreshold: 5000
      }
    ]

    if(bearishData.length){
      bearishData.map(b=> {
        chartSeries.push(getBearishChart(b, bearishData.indexOf(b)===0))
        return null
      })
    }

    chartSeries = chartSeries.concat(getHighestVolumeChart())
    chartSeries = chartSeries.concat(getBuyingChart())
    return chartSeries
  }

  let chartOptions = {}
  if(chartData.length){
    chartOptions = {
      title: {
        text: `${currency.selected.name} cryptocurrency value chart`
      },
      xAxis: getChartTitle(),
      series: getChartSeries()
    }
  }

  useEffect(()=>{
    const createChartData = (data) => {

      let newData = filterDataByDate(data.prices)
      setHighLow(getHighLow(newData))
      //format data for charts
      const newChartData = newData.map(d => {
        const data = {x: d[0], y:d[1] }
        return data
      })
  
      //console.log('daily data',newChartData)
      setChartData(newChartData)
  
      //produce bearish data
      let counter = 0
      let newBearishData = newData.map(d => {
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
      newBearishData.map(b => {
        if(b && b.trend > longestTrend){
          longestTrend = b.trend
        }
        return b
      })
      newBearishData=newBearishData.filter(b => b && b.trend===longestTrend)
      
      setBearish(newBearishData)
    }
  
    setShowChart(false)

    if(Object.keys(currency).length){
      try {
        fetch(`/.netlify/functions/node-fetch?id=${currency.selected.id}&start=${currency.startDate}&end=${currency.endDate}`, { headers: { accept: "Accept: application/json" } })
          .then(res => res.json())
          .then(json => {
            if(json.data){
              console.log(json.data)
              createChartData(json.data)
              setData(json.data)
              setShowChart(true)
              props.setDataLoading(false)
            } else {
              setData([])
              console.log(json)
            }

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
