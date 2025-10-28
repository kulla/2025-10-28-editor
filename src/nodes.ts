import * as S from './schema'

const Text = S.string()

const Paragraph = S.wrapper(Text)

const Content = S.array(Paragraph)

const MultipleChoiceExercide = S.object({
  exercise: Content,
  answers: S.array(
    S.object({
      text: Text,
      isCorrect: S.boolean(),
    }),
  ),
})

const Document = S.array(S.union(Content, MultipleChoiceExercide))

export const Root = S.wrapper(Document)
