import { Equation } from './Equation'

export interface VariableRow {
  sym: string
  meaning: string
  unit: string
}

interface VariableTableProps {
  symbolLabel: string
  meaningLabel: string
  unitLabel: string
  rows: VariableRow[]
}

export function VariableTable({ symbolLabel, meaningLabel, unitLabel, rows }: VariableTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-black/10">
      <table className="w-full min-w-[420px] text-left text-xs">
        <thead>
          <tr className="border-b border-black/10 bg-gs-deep/80 text-xs tracking-wider text-gs-mist uppercase">
            <th className="px-3 py-2 font-semibold">{symbolLabel}</th>
            <th className="px-3 py-2 font-semibold">{meaningLabel}</th>
            <th className="px-3 py-2 font-semibold whitespace-nowrap">{unitLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.sym} className="border-b border-black/8 last:border-0">
              <td className="px-3 py-1.5 whitespace-nowrap">
                <Equation latex={row.sym} block={false} />
              </td>
              <td className="px-3 py-1.5 text-gs-mist">{row.meaning}</td>
              <td className="gs-number px-3 py-1.5 whitespace-nowrap text-gs-mist">{row.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
