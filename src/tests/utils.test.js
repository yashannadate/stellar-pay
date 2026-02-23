import { describe, it, expect } from 'vitest';

const isValidAddress = (addr) => /^[G][A-Z2-7]{55}$/.test(addr);

const toStroops = (amt) => {
  const str = String(parseFloat(amt).toFixed(7));
  const [whole, frac = ""] = str.split(".");
  const padded = frac.padEnd(7, "0").slice(0, 7);
  return BigInt(whole) * 10_000_000n + BigInt(padded);
};

const formatExactBalance = (bal) => {
  const num = parseFloat(bal);
  if (isNaN(num)) return "0";
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 7 });
};

describe("Stellar Pay Utils", () => {
  it("validates correct Stellar address", () => {
    expect(isValidAddress("GB6B6QNFB2XQDJKEYYMQV4ESVJMSFLZPZUBYP4HQCM3S2WKUKFHQFFTV")).toBe(true);
  });

  it("rejects invalid Stellar address", () => {
    expect(isValidAddress("invalid")).toBe(false);
  });

  it("converts 1 XLM to stroops correctly", () => {
    expect(toStroops("1")).toBe(10_000_000n);
  });

  it("formats balance correctly", () => {
    expect(formatExactBalance("9758.868146")).toBe("9,758.868146");
  });

  it("returns 0 for invalid balance", () => {
    expect(formatExactBalance("abc")).toBe("0");
  });
});