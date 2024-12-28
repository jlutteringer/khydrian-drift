import * as React from 'react'
import { CharacterSection } from '@simulacrum/ui/character/CharacterSection'
import { Bessemer } from '@bessemer/framework'
import { Application } from '@simulacrum/common/application'

const CharactersPage = () => {
  const application = Bessemer.getApplication<Application>()
  console.log('application', application)

  return <CharacterSection />
}

export default CharactersPage
