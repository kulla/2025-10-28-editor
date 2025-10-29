import { schema } from './schema'
import { Iso } from './utils/types'

const Text = schema({ kind: 'string' })

const Paragraph = schema({
  kind: 'wrapper',
  child: Text,
  wrapChild: {
    to: (s: string) => ({ type: 'paragraph' as const, value: s }),
    from: (p: { type: 'paragraph'; value: string }) => p.value,
  } as Iso<string, { type: 'paragraph'; value: string }>,
})

const Content = schema({ kind: 'array', item: Paragraph })

const MultipleChoiceExercise = schema({
  kind: 'object',
  fields: {
    exercise: Content,
    answers: schema({
      kind: 'array',
      item: schema({
        kind: 'object',
        fields: {
          isCorrect: schema({ kind: 'boolean' }),
          text: Text,
        },
        fieldOrder: ['isCorrect', 'text'],
      }),
    }),
  },
  fieldOrder: ['exercise', 'answers'],
})

const Document = schema({
  kind: 'array',
  item: schema({
    kind: 'union',
    options: [Paragraph, MultipleChoiceExercise],
    getOption: (value) =>
      typeof value === 'string' ? Paragraph : MultipleChoiceExercise,
  }),
})

export type Root = typeof Root
export const Root = schema({
  kind: 'wrapper',
  child: Document,
  wrapChild: { to: (s) => s, from: (s) => s },
})
