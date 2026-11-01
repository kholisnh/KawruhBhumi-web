import { en } from '../i18n/en'
import { id } from '../i18n/id'
import type { Lang } from '../i18n'
import { experimentsByMethod } from './experiments'
import { METHODS, methodById, type MethodId } from './methods'

const dicts = { en, id }

export function scenarioCodeFor(methodId: MethodId, scenarioId: string): string {
  return `#${methodById(methodId).route}?scenario=${scenarioId}`
}

function header(lang: Lang, key: 'worksheet' | 'answerKey'): string[] {
  const d = dicts[lang]
  const title = key === 'worksheet' ? d.learning.teacherWorksheetTitle : d.learning.teacherKeyTitle
  const intro =
    key === 'worksheet'
      ? d.learning.teacherWorksheetIntro
      : d.learning.teacherKeyIntro
  return [`# ${title}`, '', intro, '']
}

export function buildWorksheet(lang: Lang): string {
  const d = dicts[lang]
  const lines = header(lang, 'worksheet')
  lines.push(d.learning.teacherNameLine, '')
  METHODS.forEach((method) => {
    const info = d.methods.list[method.id]
    lines.push(`## ${info.name} (${info.abbr})`, '')
    experimentsByMethod[method.id].forEach((experiment, index) => {
      lines.push(`### ${index + 1}. ${experiment.title[lang]}`)
      lines.push(`**${d.learning.questionLabel}:** ${experiment.question[lang]}`, '')
      experiment.steps.forEach((step, stepIndex) => lines.push(`${stepIndex + 1}. ${step[lang]}`))
      lines.push(
        '',
        `**${d.learning.scenarioCode}:** \`${scenarioCodeFor(method.id, experiment.scenarioId)}\``,
        '',
        `**${d.learning.predictionLabel}:** ________________________________`,
        '',
      )
    })
  })
  return lines.join('\n')
}

export function buildAnswerKey(lang: Lang): string {
  const d = dicts[lang]
  const lines = header(lang, 'answerKey')
  METHODS.forEach((method) => {
    const info = d.methods.list[method.id]
    lines.push(`## ${info.name} (${info.abbr})`, '')
    experimentsByMethod[method.id].forEach((experiment, index) => {
      lines.push(`### ${index + 1}. ${experiment.title[lang]}`)
      lines.push(`**${d.learning.questionLabel}:** ${experiment.question[lang]}`)
      lines.push(`**${d.learning.scenarioCode}:** \`${scenarioCodeFor(method.id, experiment.scenarioId)}\``)
      lines.push(`**${d.learning.expectedLabel}:** ${experiment.observe[lang]}`, '')
    })
  })
  return lines.join('\n')
}
