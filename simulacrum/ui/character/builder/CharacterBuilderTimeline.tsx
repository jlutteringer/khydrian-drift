import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from '@mui/lab'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { AbilityIcon, CharacterOptionIcon, DescriptiveEffectIcon } from '@simulacrum/ui/icon'
import { Block, Check, HorizontalRule, MoreHoriz, QuestionMark } from '@mui/icons-material'
import { Objects } from '@bessemer/cornerstone'
import { CharacterBuilderState } from '@simulacrum/ui/character/builder/use-character-builder'
import { Abilities, ProgressionTables, ResourcePools, Traits } from '@simulacrum/common'
import { CharacterProgressionEntry } from '@simulacrum/common/character/character-progression'
import {
  DescriptiveEffect,
  Effect,
  EffectSource,
  EffectSourceType,
  EffectTypeEnum,
  GainAbilityEffect,
  GainResourcePoolEffect,
  GainTraitEffect,
} from '@simulacrum/common/effect'
import { SvgIconOwnProps } from '@mui/material/SvgIcon/SvgIcon'
import { Application } from '@simulacrum/common/application'
import { Bessemer } from '@bessemer/framework'

export const CharacterBuilderTimeline = ({ characterBuilder }: { characterBuilder: CharacterBuilderState }) => {
  return (
    <>
      <Timeline position="right">
        {ProgressionTables.getEntries(characterBuilder.progressionTable).map(([level, entry]) => {
          return (
            <CharacterBuilderTimelineEntry
              key={entry.key}
              entry={entry}
              level={level}
              characterBuilder={characterBuilder}
            />
          )
        })}
      </Timeline>
    </>
  )
}

const CharacterBuilderTimelineEntry = ({
  entry,
  level,
  characterBuilder,
}: {
  entry: CharacterProgressionEntry
  level: number
  characterBuilder: CharacterBuilderState
}) => {
  const application = Bessemer.getApplication<Application>()

  let timeLineContentHeader = <></>
  if (Objects.isPresent(entry.option)) {
    if (Objects.isPresent(entry.selection)) {
      const selectedTrait = Traits.getTrait(entry.selection.selection, application)
      timeLineContentHeader = <Typography variant="subtitle1">{selectedTrait.name}</Typography>
    } else {
      timeLineContentHeader = <Typography variant="subtitle1">Select Option</Typography>
    }
  }

  return (
    <TimelineItem>
      <TimelineOppositeContent
        sx={{ m: 'auto 0' }}
        align="right"
        variant="body2"
        color="text.secondary"
      >
        <EffectSourceLabel
          source={entry.source}
          level={level}
        />
      </TimelineOppositeContent>
      <CharacterBuilderTimelineSeparator
        value={Objects.isPresent(entry.option) ? entry.selection : undefined}
        active={characterBuilder.selectedEntry?.key === entry.key}
        disabled={false}
        onClick={() => characterBuilder.selectEntry(entry)}
      />
      <TimelineContent sx={{ m: 'auto 0' }}>
        {timeLineContentHeader}

        <List
          sx={{
            padding: 0,
          }}
        >
          {/* JOHN bad key */}
          {entry.effects.map((effect, index) => {
            return (
              <CharacterBuilderEffect
                key={index}
                effect={effect}
              />
            )
          })}
        </List>
      </TimelineContent>
    </TimelineItem>
  )
}

const CharacterBuilderEffect = ({ effect }: { effect: Effect }) => {
  return (
    <ListItem
      sx={{
        padding: 0,
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: '25px',
        }}
      >
        <EffectIcon
          effect={effect}
          fontSize="small"
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2">
            <EffectLabel effect={effect} />
          </Typography>
        }
      />
    </ListItem>
  )
}

const EffectIcon = (props: { effect: Effect } & SvgIconOwnProps) => {
  switch (props.effect.type) {
    case EffectTypeEnum.Descriptive:
      return <DescriptiveEffectIcon {...props} />
    case EffectTypeEnum.GainCharacterOption:
      return <CharacterOptionIcon {...props} />
    case EffectTypeEnum.GainTrait:
      return <QuestionMark {...props} />
    case EffectTypeEnum.GainCharacteristic:
      return <QuestionMark {...props} />
    case EffectTypeEnum.ModifyCharacteristic:
      return <QuestionMark {...props} />
    case EffectTypeEnum.GainAbility:
      return <AbilityIcon {...props} />
    case EffectTypeEnum.ModifyAbility:
      return <QuestionMark {...props} />
    case EffectTypeEnum.GainResourcePool:
      return <QuestionMark {...props} />
    case EffectTypeEnum.ModifyResourcePool:
      return <QuestionMark {...props} />
  }
}

const EffectLabel = ({ effect }: { effect: Effect }) => {
  const context = Bessemer.getApplication<Application>()

  switch (effect.type) {
    case EffectTypeEnum.Descriptive:
      return (effect as DescriptiveEffect).description
    case EffectTypeEnum.GainCharacterOption:
      return '???'
    case EffectTypeEnum.GainTrait:
      return Traits.getTrait((effect as GainTraitEffect).trait, context).name
    case EffectTypeEnum.GainCharacteristic:
      return '???'
    case EffectTypeEnum.ModifyCharacteristic:
      return '???'
    case EffectTypeEnum.GainAbility:
      return Abilities.getAbility((effect as GainAbilityEffect).ability, context).name
    case EffectTypeEnum.ModifyAbility:
      return '???'
    case EffectTypeEnum.GainResourcePool:
      return ResourcePools.getResourcePool((effect as GainResourcePoolEffect).resourcePool, context).name
    case EffectTypeEnum.ModifyResourcePool:
      return '???'
  }
}

// JOHN this could be more efficient
const EffectSourceLabel = ({ source, level }: { source: EffectSource; level: number }) => {
  const context = Bessemer.getApplication<Application>()

  switch (source.type) {
    case EffectSourceType.Ruleset:
      return `Level ${level}`
    case EffectSourceType.Trait:
      return Traits.getTrait(source.trait, context).name
    case EffectSourceType.Ability:
      return Abilities.getAbility(source.ability, context).name
  }
}

const CharacterBuilderTimelineSeparator = (props: { value: any; active: boolean; disabled: boolean; onClick: () => void }) => {
  return (
    <TimelineSeparator>
      <TimelineConnector />
      <CharacterBuilderTimelineDot {...props} />
      <TimelineConnector />
    </TimelineSeparator>
  )
}

const CharacterBuilderTimelineDot = ({
  value,
  active,
  disabled,
  onClick,
}: {
  value: any | null | undefined
  active: boolean
  disabled: boolean
  onClick: () => void
}) => {
  if (disabled) {
    return (
      <TimelineDot>
        <Block />
      </TimelineDot>
    )
  }

  if (Objects.isPresent(value)) {
    return (
      <TimelineDot
        color="primary"
        variant={active ? 'filled' : 'outlined'}
        onClick={onClick}
        sx={{
          cursor: 'pointer',
        }}
      >
        <Check />
      </TimelineDot>
    )
  } else if (Objects.isUndefined(value)) {
    return (
      <TimelineDot
        color="primary"
        variant={active ? 'filled' : 'outlined'}
      >
        <HorizontalRule />
      </TimelineDot>
    )
  } else {
    return (
      <TimelineDot
        color="primary"
        variant={active ? 'filled' : 'outlined'}
        onClick={onClick}
        sx={{
          cursor: 'pointer',
        }}
      >
        <MoreHoriz />
      </TimelineDot>
    )
  }
}
