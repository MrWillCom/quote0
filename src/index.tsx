#!/usr/bin/env node

import 'dotenv/config'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Box, render, Text } from 'ink'
import { getDeviceStatus, pushImage } from './actions'
import { inkPropsHelpers } from './utils'
import fs from 'node:fs/promises'
import ky from 'ky'
import path from 'node:path'
import React from 'react'
import Spinner from 'ink-spinner'
import satori from 'satori'
import hardcoded from './hardcoded'
import sharp from 'sharp'

yargs(hideBin(process.argv))
  .command(
    'status',
    'Check device status',
    yargs => yargs,
    async argv => {
      try {
        const response = await getDeviceStatus()

        render(
          <Box borderStyle="round" flexDirection="column">
            <Box
              justifyContent="space-between"
              width="100%"
              borderStyle="single"
              {...inkPropsHelpers.border('bottom')}
              borderDimColor
              paddingX={1}
            >
              <Box gap={1}>
                <Text>{response.alias}</Text>
                <Text dimColor>{response.location}</Text>
                <Text dimColor>{response.status.battery}</Text>
              </Box>
              <Text>
                <Text dimColor>Device ID: </Text>
                {response.deviceId}
              </Text>
            </Box>
            <Box flexDirection="column" paddingX={1}>
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>Status</Text>
                <Text>{response.status.current}</Text>
              </Box>
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>Last Render</Text>
                <Text>{response.renderInfo.last}</Text>
              </Box>
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>Next Render (Battery)</Text>
                <Text>{response.renderInfo.next.battery}</Text>
              </Box>
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>Next Render (Power)</Text>
                <Text>{response.renderInfo.next.power}</Text>
              </Box>
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>Current Images</Text>
                <Text>{response.renderInfo.current.image.length}</Text>
              </Box>
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>Version</Text>
                <Text>
                  <Text dimColor>v</Text>
                  {response.status.version}
                </Text>
              </Box>
            </Box>
          </Box>,
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
          <Box flexDirection="column" borderStyle="round">
            <Box
              justifyContent="space-between"
              borderStyle="single"
              {...inkPropsHelpers.border('bottom')}
              borderDimColor
              paddingX={1}
            >
              <Text>Downloading…</Text>
              <Text dimColor>
                {progresses.filter(p => p.done).length}/{toDownload.length}
              </Text>
            </Box>
            <Box flexDirection="column" paddingX={1}>
              {toDownload.map(({ filename }, i) => (
                <Box justifyContent="space-between" key={i}>
                  <Text>
                    {progresses[i]!.done ? (
                      <Text dimColor>✓</Text>
                    ) : (
                      <Spinner />
                    )}{' '}
                    {filename}
                  </Text>
                  <Text>{Math.round(progresses[i]!.percent * 100)}%</Text>
                </Box>
              ))}
            </Box>
          </Box>
        )
      }

      render(<Main />)
    },
  )
  .command(
    'serve',
    'Start periodically rendering and pushing images',
    yargs => yargs,
    async argv => {
      const steps = [
        'SVG Rendering',
        'SVG Saving',
        'PNG Conversion',
        'PNG Saving',
        'Base64 Encoding',
        'Pushing to Device',
      ]

      const Main = () => {
        const [currentStep, setCurrentStep] = React.useState<number>(-1)
        const addStep = () => {
          setCurrentStep(prev => prev + 1)
        }

        React.useEffect(() => {
          ;(async () => {
            addStep()
            const svg = await satori(
              <div
                style={{
                  width: hardcoded.quote0Width,
                  height: hardcoded.quote0Height,
                  color: 'black',
                  backgroundColor: 'white',
                  fontFamily: 'Departure Mono',
                  fontSize: '11px',
                  lineHeight: '12px',
                }}
              >
                hello, world
              </div>,
              {
                width: hardcoded.quote0Width,
                height: hardcoded.quote0Height,
                fonts: [
                  {
                    name: 'Departure Mono',
                    data: await fs.readFile(
                      path.join('cache/resources', 'DepartureMono-Regular.otf'),
                    ),
                    weight: 400,
                    style: 'normal',
                  },
                ],
              },
            )
            addStep()
            await fs.writeFile('cache/out.svg', svg)

            addStep()
            const png = await sharp(Buffer.from(svg)).png().toBuffer()
            addStep()
            await fs.writeFile('cache/out.png', png)

            addStep()
            const pngBase64 = png.toString('base64')

            addStep()
            await pushImage({ image: pngBase64, ditherType: 'NONE' })

            addStep()
          })()
        }, [])

        return (
          <Box flexDirection="column" borderStyle="round">
            <Box
              borderStyle="single"
              {...inkPropsHelpers.border('bottom')}
              borderDimColor
              paddingX={1}
            >
              <Text>Progress</Text>
            </Box>
            <Box flexDirection="column" paddingX={1}>
              {steps.map((step, i) => (
                <Box key={i} justifyContent="space-between">
                  <Text>
                    {currentStep === i ? (
                      <Spinner />
                    ) : (
                      <Text dimColor>{currentStep > i ? '✓' : ' '}</Text>
                    )}{' '}
                    {step}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        )
      }

      render(<Main />)
    },
  )
  .demandCommand(1, 'Please specify a command')
  .parse()
