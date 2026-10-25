import { useI18n } from '../../i18n'
import { glossary, formulas } from '../../content/glossary'
import { experimentsByMethod } from '../../content/experiments'
import { METHODS } from '../../content/methods'
import { Button } from '../ui/Button'
import { SectionHeading } from '../ui/SectionHeading'
import { Equation } from '../ui/Equation'

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function LearningLibrary() {
  const { d, lang } = useI18n()
  const id = lang === 'id'

  const worksheet = () => {
    const lines = [
      id ? '# Lembar Kerja Eksperimen Terpandu — KawruhBhumi Lab' : '# Guided Experiments Worksheet — KawruhBhumi Lab',
      '',
      id ? 'Nama / kelompok: ____________________  Tanggal: __________' : 'Name / group: ____________________  Date: __________',
      '',
    ]
    METHODS.forEach((method) => {
      const info = d.methods.list[method.id]
      lines.push(`## ${info.name} (${info.abbr})`, '')
      experimentsByMethod[method.id].forEach((experiment, index) => {
        lines.push(`### ${index + 1}. ${experiment.title[lang]}`)
        lines.push(`**${id ? 'Pertanyaan' : 'Question'}:** ${experiment.question[lang]}`, '')
        experiment.steps.forEach((step, stepIndex) => lines.push(`${stepIndex + 1}. ${step[lang]}`))
        lines.push('', `**${id ? 'Prediksi saya' : 'My prediction'}:** ________________________________`, '')
      })
    })
    downloadText(`kawruhbhumi-worksheet-${lang}.md`, lines.join('\n'))
  }

  const answerKey = () => {
    const lines = [
      id ? '# Kunci Jawaban Eksperimen Terpandu — KawruhBhumi Lab' : '# Guided Experiments Answer Key — KawruhBhumi Lab',
      '',
      id ? 'Gunakan sebagai pembanding, bukan satu-satunya jawaban benar.' : 'Use as a comparison, not as the only correct answer.',
      '',
    ]
    METHODS.forEach((method) => {
      const info = d.methods.list[method.id]
      lines.push(`## ${info.name} (${info.abbr})`, '')
      experimentsByMethod[method.id].forEach((experiment, index) => {
        lines.push(`### ${index + 1}. ${experiment.title[lang]}`)
        lines.push(`**${id ? 'Pertanyaan' : 'Question'}:** ${experiment.question[lang]}`)
        lines.push(`**${id ? 'Pengamatan yang diharapkan' : 'Expected observation'}:** ${experiment.observe[lang]}`, '')
      })
    })
    downloadText(`kawruhbhumi-answer-key-${lang}.md`, lines.join('\n'))
  }

  return (
    <section id="learning-library" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <SectionHeading label={d.learning.label} title={d.learning.guidedTitle} subtitle={d.learning.guidedSub} />

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-gs-panel/70 p-5">
          <h3 className="text-base font-semibold text-gs-ice">{d.learning.glossaryTitle}</h3>
          <p className="mt-1 text-xs leading-relaxed text-gs-mist">{d.learning.glossarySub}</p>
          <dl className="mt-4 space-y-3">
            {glossary.map((item) => (
              <div key={item.term} className="border-t border-black/8 pt-2.5 first:border-0 first:pt-0">
                <dt className="text-xs font-semibold text-gs-ice">
                  {item.term}
                  {item.symbol && <span className="gs-number ml-1.5 font-normal text-gs-cyan">{item.symbol}</span>}
                </dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-gs-mist">{item.body[lang]}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-black/10 bg-gs-panel/70 p-5">
          <h3 className="text-base font-semibold text-gs-ice">{d.learning.formulaTitle}</h3>
          <p className="mt-1 text-xs leading-relaxed text-gs-mist">{d.learning.formulaSub}</p>
          <div className="mt-4 space-y-3">
            {formulas.map((item) => (
              <div key={item.latex} className="border-t border-black/8 pt-2.5 first:border-0 first:pt-0">
                <h4 className="text-xs font-semibold text-gs-ice">{item.title[lang]}</h4>
                <div className="mt-1 overflow-x-auto rounded-lg bg-gs-deep/60 px-2 py-1">
                  <Equation latex={item.latex} />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gs-mist">{item.body[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-gs-cyan/20 bg-gs-cyan/5 p-5">
        <h3 className="text-base font-semibold text-gs-ice">{d.learning.teacherTitle}</h3>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-gs-mist">{d.learning.teacherSub}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={worksheet}>
            {d.learning.teacherWorksheet}
          </Button>
          <Button variant="secondary" size="sm" onClick={answerKey}>
            {d.learning.teacherKey}
          </Button>
          <span className="text-xs leading-relaxed text-gs-mist">{d.learning.teacherDownloadHint}</span>
        </div>
        <ul className="mt-3 grid gap-2 text-xs leading-relaxed text-gs-mist md:grid-cols-3">
          {d.learning.teacherIdeas.map((idea) => (
            <li key={idea} className="rounded-lg border border-black/10 bg-gs-panel/60 p-3">
              {idea}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
