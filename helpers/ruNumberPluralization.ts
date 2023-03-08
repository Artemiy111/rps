export const ruNumberPluralization = (n: number): 0 | 1 | 2 => {
  if (n === 0) return 0

  const teen = n >= 10 && n <= 20
  const endsWithOne = n % 10 === 1

  if (teen) return 0
  if (!teen && endsWithOne) {
    return 1
  }
  if (!teen && n % 10 >= 2 && n % 10 <= 4) return 2

  if (!teen && n % 10 >= 5 && n % 10 <= 9) return 0

  return 2
}
