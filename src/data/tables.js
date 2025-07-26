export const tables = [
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Table ${i + 1}`,
  })),
];