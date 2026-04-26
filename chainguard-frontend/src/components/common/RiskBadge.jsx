import { getRiskLevel, RISK_COLORS } from '../../config'

export default function RiskBadge({ score, label }) {
  const level = getRiskLevel(score)
  const colors = RISK_COLORS[level]
  const displayLabel = label || level.charAt(0).toUpperCase() + level.slice(1)

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
      style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.text }} />
      {score !== undefined && <span className="tabular-nums">{score}</span>}
      <span>{displayLabel}</span>
    </span>
  )
}
