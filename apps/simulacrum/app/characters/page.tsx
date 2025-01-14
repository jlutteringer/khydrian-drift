import { use } from 'react'
import { CharacterSection } from '@simulacrum/ui/character/CharacterSection'
import { ApplicationContext } from '@simulacrum/common/application'
import { BessemerNext } from '@bessemer/framework-next'

const CharactersPage = () => {
  const application = use(BessemerNext.getApplication<ApplicationContext>())

  return <CharacterSection />
}

export default CharactersPage
