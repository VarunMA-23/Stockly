const majorFestivals = [
  { name: "New Year", month: 1, day: 1 },
  { name: "Pongal", month: 1, day: 15, window: 3 },
  { name: "Republic Day", month: 1, day: 26 },
  { name: "Valentine's Day", month: 2, day: 14 },
  { name: "Shivratri", month: 2, day: 26, window: 2 },
  { name: "Holi", month: 3, day: 14, window: 3 },
  { name: "Gudi Padwa", month: 3, day: 30, window: 2 },
  { name: "Eid-ul-Fitr", month: 3, day: 31, window: 3 },
  { name: "Ambedkar Jayanti", month: 4, day: 14 },
  { name: "Good Friday", month: 4, day: 18, window: 2 },
  { name: "Labour Day", month: 5, day: 1 },
  { name: "Buddha Purnima", month: 5, day: 12, window: 2 },
  { name: "Independence Day", month: 8, day: 15 },
  { name: "Raksha Bandhan", month: 8, day: 9, window: 2 },
  { name: "Janmashtami", month: 8, day: 16, window: 2 },
  { name: "Ganesh Chaturthi", month: 8, day: 27, window: 5 },
  { name: "Onam", month: 9, day: 5, window: 3 },
  { name: "Dussehra", month: 10, day: 2, window: 4 },
  { name: "Gandhi Jayanti", month: 10, day: 2 },
  { name: "Diwali", month: 10, day: 20, window: 5 },
  { name: "Bhai Dooj", month: 10, day: 24, window: 2 },
  { name: "Chhath Puja", month: 11, day: 5, window: 3 },
  { name: "Guru Nanak Jayanti", month: 11, day: 15, window: 2 },
  { name: "Christmas", month: 12, day: 25, window: 4 },
  { name: "Boxing Day", month: 12, day: 26 },
]

const seasons = [
  { name: "Winter", months: [1, 2] },
  { name: "Spring", months: [3, 4] },
  { name: "Summer", months: [5, 6, 7] },
  { name: "Monsoon", months: [8, 9] },
  { name: "Autumn", months: [10, 11] },
  { name: "Winter", months: [12] },
]

export const getSeason = (date) => {
  const month = date.getMonth() + 1
  for (const season of seasons) {
    if (season.months.includes(month)) return season.name
  }
  return "Unknown"
}

export const getFestival = (date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()

  for (const festival of majorFestivals) {
    if (festival.month !== month) continue
    const window = festival.window || 1
    const startDay = festival.day - Math.floor((window - 1) / 2)
    const endDay = festival.day + Math.ceil((window - 1) / 2)
    if (day >= startDay && day <= endDay) return festival.name
  }

  return null
}

export const isWeekend = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

export const getDayName = (date) => {
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return names[date.getDay()]
}
