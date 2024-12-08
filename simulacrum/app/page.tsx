'use client'

import Image from 'next/image'
import styles from './page.module.css'
import { ApplicationContext } from '@simulacrum/common/context'
import { Dnd5e, SelectClassLevel } from '@simulacrum/rulesets/dnd-5e'
import { CharacterRecord } from '@simulacrum/common/character/character'
import { CharacterOptions, Characters } from '@simulacrum/common/character'
import { Fighter, Fighter2, Fighter3 } from '@simulacrum/rulesets/dnd-5e/class/class-fighter'
import { ProgressionTables } from '@simulacrum/common'
import { Archery, SelectFightingStyle } from '@simulacrum/rulesets/dnd-5e/archetype/fighting-style'

export default function Home() {
  const context: ApplicationContext = { ruleset: Dnd5e }
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
  }
  character = Characters.buildCharacterDefinition(character, context)
  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter), context)
  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectFightingStyle, Archery), context)
  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter2), context)
  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter3), context)
  console.log('character', character)

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
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

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
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
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
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
