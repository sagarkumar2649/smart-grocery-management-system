/**
 * Format a number as Indian Rupees using the en-IN locale.
 * Output examples: ₹10, ₹1,250, ₹1,25,000
 */
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}

/**
 * Compact formatter for table cells — no decimals when value is whole.
 */
export function formatINRCompact(amount: number): string {
  if (Number.isInteger(amount)) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return inrFormatter.format(amount);
}
