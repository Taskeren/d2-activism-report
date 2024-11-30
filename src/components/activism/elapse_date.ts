export function getElapsedTime(d: Date, t: any) {
  const elapsedMs = new Date().getTime() - d.getTime()

  const aSecond = 1000
  const aMinute = aSecond * 60
  const anHour = aMinute * 60
  const aDay = anHour * 24
  const aMonth = aDay * 30
  const aYear = aDay * 365

  if (elapsedMs < aSecond) {
    return t("elapsed_duration.recent")
  } else if (elapsedMs < aMinute) {
    return t("elapsed_duration.second", [Math.floor(elapsedMs / aSecond)])
  } else if (elapsedMs < anHour) {
    return t("elapsed_duration.minute", [Math.floor(elapsedMs / aMinute)])
  } else if (elapsedMs < aDay) {
    return t("elapsed_duration.hour", [Math.floor(elapsedMs / anHour)])
  } else if (elapsedMs < aMonth) {
    return t("elapsed_duration.day", [Math.floor(elapsedMs / aDay)])
  } else if (elapsedMs < aYear) {
    return t("elapsed_duration.month", [Math.floor(elapsedMs / aMonth)])
  } else {
    return t("elapsed_duration.year", [Math.floor(elapsedMs / aYear)])
  }
}
