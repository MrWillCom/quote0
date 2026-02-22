#!/usr/bin/env node

import 'dotenv/config'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Box, render, Text } from 'ink'
import { getDeviceStatus } from './actions'
import fs from 'node:fs/promises'
import ky from 'ky'
import path from 'node:path'
import React from 'react'
import Spinner from 'ink-spinner'
import Container from './components/Container'
import { SectionList } from './components/Section'
import ListItem from './components/ListItem'

yargs(hideBin(process.argv))
  .command(
    'status',
    'Check device status',
    yargs => yargs,
    async argv => {
      try {
        const response = await getDeviceStatus()

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
    'prepare',
    'Download necessary resources',
    yargs => yargs,
    async argv => {
      const toDownload: { filename: string; url: string }[] = [
        {
          filename: 'DepartureMono-Regular.otf',
          url: 'https://departuremono.com/assets/DepartureMono-Regular.otf',
        },
      ]

      await fs.mkdir('cache/resources', { recursive: true })

      const Main = () => {
        const [progresses, setProgresses] = React.useState<
          {
            percent: number
            done: boolean
          }[]
        >(toDownload.map(() => ({ percent: 0, done: false })))

        React.useEffect(() => {
          ;(async () => {
            await Promise.all(
              toDownload.map(async ({ filename, url }, i) => {
                const buffer = await ky
                  .get(url, {
                    onDownloadProgress: progress => {
                      setProgresses(prev => {
                        const t = [...prev]
                        t[i]!.percent = progress.percent
                        return t
                      })
                    },
                  })
                  .bytes()

                await fs.writeFile(
                  path.join('cache/resources', filename),
                  buffer,
                )

                setProgresses(prev => {
                  const t = [...prev]
                  t[i]!.done = true
                  return t
                })
              }),
            )
          })()
        }, [])

        return (
          <Container>
            <SectionList>
              <ListItem
                trailing={
                  <Text dimColor>
                    {progresses.filter(p => p.done).length}/{toDownload.length}
                  </Text>
                }
              >
                <Text>
                  {progresses.filter(p => !p.done).length === 0
                    ? 'Done'
                    : 'Downloading…'}
                </Text>
              </ListItem>
              <Box flexDirection="column">
                {...toDownload.map(({ filename }, i) => (
                  <ListItem
                    key={i}
                    leading={
                      progresses[i]!.done ? (
                        <Text dimColor>✓</Text>
                      ) : (
                        <Spinner />
                      )
                    }
                    trailing={
                      !progresses[i]!.done && (
                        <Text>{Math.round(progresses[i]!.percent * 100)}%</Text>
                      )
                    }
                  >
                    <Text>{filename}</Text>
                  </ListItem>
                ))}
              </Box>
            </SectionList>
          </Container>
        )
      }

      render(<Main />)
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
