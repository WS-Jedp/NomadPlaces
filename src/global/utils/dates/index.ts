export const getCurrentMonth = (currentDate: Date):string => {
    const currMonth = currentDate.getMonth() + 1
    if(currMonth <= 9) return `0${currMonth}`
    return String(currMonth)
}

export const getCurrentDay = (currentDate: Date):string => {
    const currDay = currentDate.getDate()
    if(currDay <= 9) return `0${currDay}`
    return String(currDay)
}

export const getCurrentHours = (currentDate: Date):string => {
    const currHours = currentDate.getHours()
    if(currHours <= 9) return `0${currHours}`
    return String(currHours)
}

export const getColombianCurrentDate = (currDate?: Date) => {
    const currentDate = currDate ? currDate : new Date()
    const COLOMBIA_ZERO_TIME = '.350Z'
    currDate.getTime()
    const date = new Date(`${currentDate.getFullYear()}-${getCurrentMonth(currentDate)}-${getCurrentDay(currentDate)}T${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}${COLOMBIA_ZERO_TIME}`)
    return date
}