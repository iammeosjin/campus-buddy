export function toName(name: string) {
  return name.toLowerCase().trim().split(' ').filter((word) => !!word).map(
    (word) => {
      const [first, ...rest] = word;
      return first.toUpperCase() + rest.join('');
    },
  ).join(' ');
}
