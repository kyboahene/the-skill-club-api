export function getPeriod(date: Date) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return new Date(`${year}-${month}`)
}