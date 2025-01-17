export function toName(name: string) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/_/g, ' ').split(' ').filter((
    word,
  ) => !!word).map(
    (word) => {
      const [first, ...rest] = word;
      return first.toUpperCase() + rest.join('');
    },
  ).join(' ');
}
