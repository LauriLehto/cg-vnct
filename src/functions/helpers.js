
  const getUTCTimeString = (t) => {
    const time = new Date(t)
    const timeString = `${time.getUTCFullYear()}-${time.getUTCMonth()+1}-${time.getUTCDate()}`
    return timeString
  }

  const filterDataByDate = (data) => {
    let newData = data.map(d => {
      d.date = new Date(d[0]).getUTCDate()
      return d
    })

    //filter last value point for each date
    newData = newData.filter(d => {
      if(newData.indexOf(d)<newData.length-1 && d.date !== newData[newData.indexOf(d)+1].date){
        return d
      }
      return null
    }).filter(d => d)
    return newData
  }

  const getTopBottom = (prices) => {
    let topPrice = prices[0]
    let bottomPrice = prices[0]
    if(prices.length){
      prices.map(p => {
        if(p[1]>topPrice[1]) topPrice=p
        if(p[1]<bottomPrice[1]) bottomPrice=p
        return null
      })
    }
    return { topPrice, bottomPrice }
  }

  const checkDateRange = (endDate, startDate) => {
    //const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    //const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    //const diffD = parseInt((endDate-startDate)/(24*3600*1000));

    let range = (endDate-startDate)/(24*60*60*1000)
    range = Number((range).toFixed());
    return range
  }

  const numberWithSpaces= (x) => {
    let parts = x.toString().split(".");
    if(parts[0].length>3){
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    return parts.join(" .");
  }

  export { getUTCTimeString, filterDataByDate, getTopBottom, checkDateRange, numberWithSpaces}