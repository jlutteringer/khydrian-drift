import Image from 'next/image'
import React from 'react'
import { Bessemer } from '@bessemer/framework'
import { ApplicationContext } from '@simulacrum/common/application'
import { CharacterRecord } from '@simulacrum/common/character/character'
import { ProgressionTables } from '@simulacrum/common'
import { CharacterOptions, Characters } from '@simulacrum/common/character'
import { SelectClassLevel } from '@simulacrum/rulesets/dnd-5e'
import { Archery, SelectFightingStyle } from '@simulacrum/rulesets/dnd-5e/archetype/fighting-style'
import { Fighter, Fighter2, Fighter3 } from '@simulacrum/rulesets/dnd-5e/class/class-fighter'

export default function Home() {
  const application = Bessemer.getApplication<ApplicationContext>()
  let character: CharacterRecord = {
    name: 'Bob the Fighter',
    level: 3,
    initialValues: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      wisdom: 11,
      intelligence: 12,
      charisma: 8,
    },
    selections: ProgressionTables.empty(3),
    selectedAbilities: [],
  }
  character = Characters.buildCharacterDefinition(character, application)
  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter), application)
  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectFightingStyle, Archery), application)
  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter2), application)
  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter3), application)

  return (
    <div>
      <main>
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div>
          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  )
}
