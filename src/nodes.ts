import { schema } from './schema'

const Text = schema({ kind: 'string' })

const Paragraph = schema({ kind: 'wrapper', child: Text })

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
export const Root = schema({ kind: 'wrapper', child: Document })
