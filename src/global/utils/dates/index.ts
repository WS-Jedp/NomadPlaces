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