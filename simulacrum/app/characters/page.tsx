import * as React from 'react'
import { CharacterSection } from '@simulacrum/ui/character/CharacterSection'
import { Bessemer } from '@bessemer/framework'
import { ApplicationContext } from '@simulacrum/common/application'

const CharactersPage = () => {
  const application = Bessemer.getApplication<ApplicationContext>()

  return <CharacterSection />
}

export default CharactersPage
