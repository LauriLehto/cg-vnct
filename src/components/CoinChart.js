import React, {useState, useEffect } from 'react'

import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

function CoinChart(props){

  const initBear = {
    start: 0, 
    end: 0,
    trend: 0
  }

  const { currency } = props
  const [ showChart, setShowChart ] = useState(false)
  const [ bearishSet, setBearish] = useState(initBear)
  const [ chartData, setChartData ] = useState({})

  
  const checkDateRange = (endDate, startDate) => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays
  }

  
  const getBearishChart = (bearish, first) => {

    let topPrice = chartData[0].y
    let bottomPrice = chartData[0].y
    if(chartData.length){
      chartData.map(p => {
        if(p.y>topPrice) topPrice=p.y
        if(p.y<bottomPrice) bottomPrice=p.y
        return null
      })
    }

    const firstTitleObject = {
      showInLegend: true,
      name:'Longest bearish trend',
    }

    let bearishData = {
      showInLegend: false,
      type:'line',
      marker:{enabled:false},
      lineWidth:3,
      color:'pink',
      data:[]
    }

    bearishData.data =[[bearish.start[0], bottomPrice*0.9],[bearish.end[0],bottomPrice*0.9]]

    if(first) {
      bearishData = {...bearishData, ...firstTitleObject}
    }
    return bearishData
  }

  const getChartTitle = () => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

    if(chartData.length && bearishSet.length){
      const startTime = (b) => new Date(b.start[0]).toLocaleDateString('en-EN', options)
      const endTime = (b) => new Date(b.end[0]).toLocaleDateString('en-EN', options)

      const getBearishText = () => {
        let textStart = `Longest bearish trend is ${bearishSet[0].trend} days <br /> between `
        bearishSet.map(b => {
          if(bearishSet.indexOf(b)<bearishSet.length-1){
            textStart = textStart + `${startTime(b)} and ${endTime(b)} and <br />`
          }else {
            textStart = textStart + `${startTime(b)} and ${endTime(b)}`
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
            text: getBearishText()
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
    const chartSeries = [
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
      //console.log('raw data', data.prices)
      //add dates to data for easy comparison
      let newData = data.prices.map(d => {
        d.date=new Date(d[0]).getDate()
        return d
      })
  
      //filter last value point for each date
      newData = newData.filter(d => {
        if(newData.indexOf(d)<newData.length-1 && d.date !== newData[newData.indexOf(d)+1].date){
          return d
        }
        return null
      }).filter(d => d)
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
            let trend =  checkDateRange(new Date(end[0]), new Date(start[0]))
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
            let trend =  checkDateRange(new Date(end[0]), new Date(start[0]))
            const newBearish = {
              start, end, trend
            }
            return newBearish
          }
        }
        return null
      })
  
      //find longest trend
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
        //console.log(startDate, endDate, selected)
        fetch(`/.netlify/functions/node-fetch?id=${currency.selected.id}&start=${currency.startDate}&end=${currency.endDate}`, { headers: { accept: "Accept: application/json" } })
          .then(res => res.json())
          .then(json => {
            //console.log(json.data)
            createChartData(json.data)
            setShowChart(true)
            props.setDataLoading(false)
          })
      } catch (error) {
        console.error(error)
      }
    }
    
  },[setChartData, setShowChart, props , currency])


  return (
    <>
      { showChart && chartData.length !== 0 &&
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
        />}
      { showChart && chartData.length === 0 && 
        <p>Choose different date range or currency, no data received!</p>}
    </>
  )
}

export default React.memo(CoinChart)
