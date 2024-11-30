export function includeAny<T>(array: T[], ...elements: T[]): boolean {
  for(const element of elements) {
    if(array.includes(element)) {
      return true
    }
  }

  return false
}

export function sumOf<T>(array: T[], selector: (t: T) => number) {
  let result = 0
  for(const t of array) {
    result += selector(t)
  }
  return result
}

export function averageOf<T>(array: T[], selector: (t: T) => number) {
  const sum = sumOf(array, selector)
  return sum / array.length
}

export function numToStr(n: number): string {
  return n.toFixed(2)
}
