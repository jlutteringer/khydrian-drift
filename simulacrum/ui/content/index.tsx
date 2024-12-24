import { Codex } from '@bessemer/codex'
import { ContentLabelComponent } from '@bessemer/codex/component/ContentLabelComponent'

export namespace ContentLabels {
  export const CharactersTitle = Codex.label('characters.title', 'Characters')
  export const CharactersCreate = Codex.label('characters.create', 'Create a Character')
  export const CharacterBuilderTitle = Codex.label('characterBuilder.title', 'Character Builder')
}

export namespace ContentLabelComponents {
  export const CharactersTitle = <ContentLabelComponent content={ContentLabels.CharactersTitle} />
  export const CharactersCreate = <ContentLabelComponent content={ContentLabels.CharactersCreate} />
  export const CharacterBuilderTitle = <ContentLabelComponent content={ContentLabels.CharacterBuilderTitle} />
}
