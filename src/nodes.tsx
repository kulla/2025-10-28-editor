import clsx from 'clsx'
import { pushIndex } from './index-path'
import * as S from './schema'
import { render } from './transformations/render'

const Text = S.string()

const Paragraph = S.wrap({
  wrapped: Text,
  wrapIso: {
    to: (s) => ({ type: 'paragraph' as const, value: s }),
    from: (p) => p.value,
  },
  htmlTag: 'p',
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
        firstFieldKey: 'text',
      }),
      defaultLength: 2,
    }),
  },
  fieldOrder: ['exercise', 'answers'],
  render({ node, store, pos, className }) {
    const key = node.key

    return (
      <div
        id={key}
        key={key}
        className={clsx('exercise multipleChoice', className)}
        data-key={key}
      >
        <div>
          <strong>Multiple Choice Exercise</strong>
        </div>
        <div>
          {render({ key: node.value.exercise, store, pos: pushIndex(pos, 0) })}
        </div>
        <div>
          {render({ key: node.value.answers, store, pos: pushIndex(pos, 1) })}
        </div>
      </div>
    )
  },
})

// Note: UnionSchema is not implemented in schema.ts, so this part is left as-is
const Document = S.array({
  item: S.union({
    options: [Paragraph, MultipleChoiceExercise] as const,
    getOption: (value) =>
      'type' in value ? Paragraph : MultipleChoiceExercise,
  }),
})

export type Root = typeof Root
export const Root = S.wrap({
  wrapped: Document,
  wrapIso: { to: (s) => s, from: (s) => s },
})
