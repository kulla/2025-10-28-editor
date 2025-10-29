import * as S from './schema'

const Text = S.string()

const Paragraph = S.wrap({
  wrapped: Text,
  wrapIso: {
    to: (s) => ({ type: 'paragraph' as const, value: s }),
    from: (p) => p.value,
  },
})

const Content = S.array({ item: Paragraph })

const MultipleChoiceExercise = S.object({
  fields: {
    exercise: Content,
    answers: S.array({
      item: S.object({
        fields: {
          isCorrect: S.boolean(),
          text: Text,
        },
        fieldOrder: ['isCorrect', 'text'],
      }),
    }),
  },
  fieldOrder: ['exercise', 'answers'],
})

// Note: UnionSchema is not implemented in schema.ts, so this part is left as-is
const Document = S.array({
  item: S.union({
    options: [Paragraph, MultipleChoiceExercise] as const,
    getOption: (value) =>
      (typeof 'type') in value ? Paragraph : MultipleChoiceExercise,
  }),
})

export type Root = typeof Root
export const Root = S.wrap({
  wrapped: Document,
  wrapIso: { to: (s) => s, from: (s) => s },
})
