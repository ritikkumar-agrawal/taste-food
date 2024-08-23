import { useState, useEffect } from 'react'

// breakfast -  6am to 9:59am,
// brunch - 10am to 11:59pm,
// lunch – 12pm to 2pm,
// snack - 2pm to 5pm and 7pm to 10pm
// dinner OR supper - 5pm to 7pm,
// midnight snack – 10pm to 6am

// Good morning - 12am to 11:59am
// Good afternoon - 12pm to 3:59pm
// Good evening - 4pm to 11:59pm

export const Greeting = () => {
  const [greeting, setGreeting] = useState('')
  const [mealType, setMealType] = useState('')

  useEffect(() => {
    const currentDate = new Date()
    const currentHour = currentDate.getHours()
    const currentMinutes = currentDate.getMinutes()

    if (
      (currentHour >= 6 && currentHour < 10) ||
      (currentHour === 10 && currentMinutes < 1)
    ) {
      setMealType('breakfast')
    } else if (
      (currentHour >= 10 && currentHour < 12) ||
      (currentHour === 12 && currentMinutes < 1)
    ) {
      setMealType('brunch')
    } else if (currentHour >= 12 && currentHour < 14) {
      setMealType('lunch')
    } else if (currentHour >= 14 && currentHour < 17) {
      setMealType('snack')
    } else if (
      (currentHour >= 17 && currentHour < 19) ||
      (currentHour === 19 && currentMinutes < 1)
    ) {
      const randomMealType = Math.random() < 0.5 ? 'dinner' : 'supper'
      setMealType(randomMealType)
    } else if (currentHour >= 19 && currentHour < 22) {
      setMealType('snack')
    } else if (
      (currentHour >= 22 && currentHour < 24) ||
      (currentHour >= 0 && currentHour < 6)
    ) {
      setMealType('midnight snack')
    }

    setGreeting(
      currentHour >= 0 && currentHour < 12
        ? 'Good morning, '
        : currentHour >= 12 && currentHour < 16
        ? 'Good afternoon, '
        : 'Good evening, '
    )
  }, [])

  return { greeting, mealType }
}
