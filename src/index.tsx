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
import fs from 'node:fs/promises'

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
    'device',
    'Manage devices',
    yargs =>
      yargs
        .command(
          'list',
          'List all devices',
          yargs => yargs,
          async argv => {
            try {
              const devices = await quote0.device.list()

              const Main = () => (
                <Container>
                  <SectionList>
                    <ListItem
                      trailing={
                        <Text dimColor>
                          {devices.length}/{devices.length}
                        </Text>
                      }
                    >
                      <Text>Devices</Text>
                    </ListItem>
                    {...devices.length === 0
                      ? [
                          <ListItem>
                            <Text dimColor>No devices found</Text>
                          </ListItem>,
                        ]
                      : devices.map(device => (
                          <Box flexDirection="column">
                            <ListItem trailing={<Text>{device.id}</Text>}>
                              <Text dimColor>ID</Text>
                            </ListItem>
                            <ListItem trailing={<Text>{device.series}</Text>}>
                              <Text dimColor>Series</Text>
                            </ListItem>
                            <ListItem trailing={<Text>{device.model}</Text>}>
                              <Text dimColor>Model</Text>
                            </ListItem>
                            <ListItem trailing={<Text>{device.edition}</Text>}>
                              <Text dimColor>Edition</Text>
                            </ListItem>
                          </Box>
                        ))}
                  </SectionList>
                </Container>
              )

              render(<Main />)
            } catch (error) {
              console.error(error)
            }
          },
        )
        .command(
          'status <device-id>',
          'Check device status',
          yargs =>
            yargs.positional('device-id', {
              describe: 'Device ID to check status for',
              type: 'string',
            }),
          async argv => {
            try {
              const response = await quote0.device.status({
                deviceId: argv.deviceId!,
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
                        ['Battery', response.status.battery],
                        ['Wi-Fi', response.status.wifi],
                        ['Last Render', response.renderInfo.last],
                        [
                          'Next Render (Battery)',
                          response.renderInfo.next.battery,
                        ],
                        ['Next Render (Power)', response.renderInfo.next.power],
                        [
                          'Current Images',
                          response.renderInfo.current.image.length,
                        ],
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
        ),
    async argv => {},
  )
  .command(
    'content',
    'Manage content',
    yargs =>
      yargs
        .command(
          'next <device-id>',
          'Switch to next content',
          yargs =>
            yargs.positional('device-id', {
              describe: 'Device ID to switch content for',
              type: 'string',
            }),
          async argv => {
            try {
              const response = await quote0.content.next({
                deviceId: argv.deviceId!,
              })

              render(
                <Container>
                  <SectionList>
                    <Text>Next Content</Text>
                    <Text>{response.message}</Text>
                  </SectionList>
                </Container>,
              )
            } catch (error) {
              console.error(error)
            }
          },
        )
        .command(
          'image <device-id>',
          'Push an image to device',
          yargs =>
            yargs
              .positional('device-id', {
                describe: 'Device ID to push image to',
                type: 'string',
              })
              .option('f', {
                alias: 'file',
                describe: 'Path to image file',
                type: 'string',
                demandOption: true,
              })
              .option('refresh-now', {
                describe: 'Whether to refresh the device immediately',
                type: 'boolean',
              })
              .option('link', {
                describe: 'Optional link to open when image is tapped',
                type: 'string',
              })
              .option('border', {
                describe: 'Whether to add a border around the image',
                type: 'number',
                // TODO: manually listing choices is not practical, we need type exports from sdk
                choices: [0, 1],
              })
              .option('dither-type', {
                describe: 'Dithering algorithm to use',
                type: 'string',
                choices: ['DIFFUSION', 'ORDERED', 'NONE'],
              })
              .option('dither-kernel', {
                describe:
                  'Dithering kernel to use (if dither-type is DIFFUSION)',
                type: 'string',
                choices: [
                  'THRESHOLD',
                  'ATKINSON',
                  'BURKES',
                  'FLOYD_STEINBERG',
                  'SIERRA2',
                  'STUCKI',
                  'JARVIS_JUDICE_NINKE',
                  'DIFFUSION_ROW',
                  'DIFFUSION_COLUMN',
                  'DIFFUSION_2D',
                ],
              })
              .option('task-key', {
                describe: 'Optional task key to track rendering status',
                type: 'string',
              }),
          async argv => {
            const file = await fs.readFile(argv.f)
            const base64 = file.toString('base64')

            const response = await quote0.content.pushImage(
              { deviceId: argv.deviceId! },
              {
                image: base64,
                refreshNow: argv.refreshNow,
                link: argv.link,
                // choices are limited but yargs cannot narrow the type
                // so let's fuck typescript
                // @ts-expect-error
                border: argv.border,
                // @ts-expect-error
                ditherType: argv.ditherType,
                // @ts-expect-error
                ditherKernel: argv.ditherKernel,
                taskKey: argv.taskKey,
              },
            )

            const Main = () => {
              return (
                <Container>
                  <SectionList>
                    <Text>Push Image</Text>
                    <ListItem>
                      <Text>{response.message}</Text>
                    </ListItem>
                  </SectionList>
                </Container>
              )
            }

            render(<Main />)
          },
        ),
    async argv => {},
  )
  .demandCommand(1, 'Please specify a command')
  .strict()
  .parse()
