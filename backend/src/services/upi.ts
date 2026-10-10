export function buildUpiUri(p: { vpa: string; name: string; amount: number }): string {
  const params = new URLSearchParams({
    pa: p.vpa,
    pn: p.name,
    am: String(p.amount),
    cu: "INR",
  });
  return `upi://pay?${params.toString()}`;
}
