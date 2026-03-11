// Returns card heat class based on total reaction count
export function heatClass(totalReactions: number): string {
  if (totalReactions >= 8) return "border-purple-400/50 bg-purple-500/[0.07] shadow-[0_0_20px_rgba(168,85,247,0.12)]";
  if (totalReactions >= 4) return "border-purple-500/30 bg-purple-500/[0.04]";
  if (totalReactions >= 1) return "border-white/8";
  return "border-white/5";
}
