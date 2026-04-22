import { Text } from 'ink'
import { UncontrolledTextInput } from 'ink-text-input'
import React from 'react'
import Container from '../../components/Container'
import ListItem from '../../components/ListItem'
import { SectionList } from '../../components/Section'

export interface AuthPromptProps {
  initialValue: string
  onSubmit: (value: string) => void
  submitted: boolean
}

export default function AuthPrompt({ initialValue, onSubmit, submitted }: AuthPromptProps) {
  return (
    <Container>
      <SectionList>
        <ListItem>
          <Text>Authentication</Text>
        </ListItem>
        {!submitted ? (
          <UncontrolledTextInput
            initialValue={initialValue}
            onSubmit={onSubmit}
            placeholder="API key..."
            mask="*"
          />
        ) : (
          <Text dimColor>API key saved</Text>
        )}
      </SectionList>
    </Container>
  )
}
