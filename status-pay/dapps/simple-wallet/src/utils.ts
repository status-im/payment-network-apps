export const emptyAddress = "0x0000000000000000000000000000000000000000";

export const compressedAddress = (a: string, padding: number = 4) => {
  return `${a.slice(0, padding + 2)}...${a.slice(a.length - padding)}`;
}

export const isEmptyAddress = (a: string) =>
  a === emptyAddress;

export const addPadding = (n: number, hex: string) => {
  if (hex.startsWith("0x")) {
    hex = hex.slice(2);
  }

  for (let i = hex.length; i < n; i++) {
    hex = `0${hex}`;
  }

  return `0x${hex}`;
};
