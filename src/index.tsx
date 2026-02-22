#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Box, render, Text } from 'ink'
import Quote0 from './api'
import Container from './components/Container'
import { SectionList } from './components/Section'
import ListItem from './components/ListItem'
import { UncontrolledTextInput } from 'ink-text-input'
import config from './config'
import React from 'react'

const quote0 = new Quote0({
  apiKey: config.get('apiKey', ''),
})

yargs(hideBin(process.argv))
  .scriptName('quote0')
  .command(
    'auth',
    'Enter and save API key',
    yargs => yargs,
    async argv => {
      const Main = () => {
        const [submitted, setSubmitted] = React.useState(false)

        return (
          <Container>
            <SectionList>
              <ListItem>
                <Text>Authentication</Text>
              </ListItem>
              {!submitted ? (
                <UncontrolledTextInput
                  initialValue={config.get('apiKey', '')}
                  onSubmit={v => {
                    if (v.length === 0) {
                      config.delete('apiKey')
                      setSubmitted(true)
                    } else {
                      config.set('apiKey', v)
                      setSubmitted(true)
                    }
                  }}
                  placeholder="API key…"
                  mask="*"
                />
              ) : (
                <Text dimColor>API key saved</Text>
              )}
            </SectionList>
          </Container>
        )
      }

      render(<Main />)
    },
  )
  .command(
    'status',
    'Check device status',
    yargs => yargs,
    async argv => {
      try {
        const response = await quote0.device.status({
          deviceId: 'ABCDABCDABCD',
        })

        render(
          <Container>
            <SectionList>
              <ListItem
                trailing={
                  <Text>
                    <Text dimColor>Device ID: </Text>
                    {response.deviceId}
                  </Text>
                }
              >
                <Box gap={1}>
                  <Text>{response.alias}</Text>
                  <Text dimColor>{response.location}</Text>
                  <Text dimColor>{response.status.battery}</Text>
                </Box>
              </ListItem>
              <Box flexDirection="column">
                {...[
                  ['Status', response.status.current],
                  ['Last Render', response.renderInfo.last],
                  ['Next Render (Battery)', response.renderInfo.next.battery],
                  ['Next Render (Power)', response.renderInfo.next.power],
                  ['Current Images', response.renderInfo.current.image.length],
                  [
                    'Version',
                    <Text>
                      <Text dimColor>v</Text>
                      {response.status.version}
                    </Text>,
                  ],
                ].map(([k, v]) => (
                  <ListItem trailing={<Text>{v}</Text>}>
                    <Text dimColor>{k}</Text>
                  </ListItem>
                ))}
              </Box>
            </SectionList>
          </Container>,
        )
      } catch (error) {
        console.error(error)
      }
    },
  )
  .command(
    'image',
    'Push an image to device',
    yargs => yargs,
    async argv => {
      const Main = () => {
        return (
          <Container>
            <SectionList>
              <ListItem>
                <Text>Progress</Text>
              </ListItem>
              <Box justifyContent="center" alignItems="center">
                <Text dimColor>To be implemented</Text>
              </Box>
            </SectionList>
          </Container>
        )
      }

      render(<Main />)
    },
  )
  .demandCommand(1, 'Please specify a command')
  .parse()
