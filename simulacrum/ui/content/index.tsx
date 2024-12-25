import { Codex } from '@bessemer/core'
import { ContentLabel } from '@bessemer/core/codex/component/ContentLabel'

export namespace ContentLabels {
  export const CharactersTitle = Codex.label('characters.title', 'Characters')
  export const CharactersCreate = Codex.label('characters.create', 'Create a Character')
  export const CharacterBuilderTitle = Codex.label('characterBuilder.title', 'Character Builder')
}

export namespace ContentLabelComponents {
  export const CharactersTitle = <ContentLabel content={ContentLabels.CharactersTitle} />
  export const CharactersCreate = <ContentLabel content={ContentLabels.CharactersCreate} />
  export const CharacterBuilderTitle = <ContentLabel content={ContentLabels.CharacterBuilderTitle} />
}
