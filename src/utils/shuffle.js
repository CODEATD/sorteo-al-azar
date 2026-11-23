export function fisherYates(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function parseParticipants(text) {
  return text
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
}

export function pickWinners(participants, count) {
  const shuffled = fisherYates(participants)
  const winners = shuffled.slice(0, Math.min(count, shuffled.length))
  const remaining = shuffled.slice(winners.length)
  return { winners, remaining }
}
