#!/usr/bin/env node

import 'dotenv/config'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Box, render, Text } from 'ink'
import { getDeviceStatus, pushImage } from './actions.js'
import { styles } from './helpers.js'
import fs from 'node:fs/promises'
import ky from 'ky'
import path from 'node:path'
import React from 'react'
import Spinner from 'ink-spinner'
import satori from 'satori'
import hardcoded from './hardcoded.js'
import sharp from 'sharp'

yargs(hideBin(process.argv))
  .command(
    'status',
    '检查设备状态',
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
              {...styles.border('bottom')}
              borderDimColor
            >
              <Box gap={1}>
                <Text>{response.alias}</Text>
                <Text dimColor>{response.location}</Text>
                <Text dimColor>{response.status.battery}</Text>
              </Box>
              <Text>
                <Text dimColor>设备序列号：</Text>
                {response.deviceId}
              </Text>
            </Box>
            <Box flexDirection="column">
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>状态</Text>
                <Text>{response.status.current}</Text>
              </Box>
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>上次渲染</Text>
                <Text>{response.renderInfo.last}</Text>
              </Box>
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>下次渲染（电池）</Text>
                <Text>{response.renderInfo.next.battery}</Text>
              </Box>
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>下次渲染（电源）</Text>
                <Text>{response.renderInfo.next.power}</Text>
              </Box>
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>当前图像</Text>
                <Text>共 {response.renderInfo.current.image.length} 张</Text>
              </Box>
              <Box justifyContent="space-between" width="100%">
                <Text dimColor>版本</Text>
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
    '准备必要的资源，如字体',
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
              {...styles.border('bottom')}
              borderDimColor
            >
              <Text>正在下载…</Text>
              <Text dimColor>
                {progresses.filter(p => p.done).length}/{toDownload.length}
              </Text>
            </Box>
            {toDownload.map(({ filename }, i) => (
              <Box justifyContent="space-between" key={i}>
                <Text>
                  {progresses[i]!.done ? <Text dimColor>✓</Text> : <Spinner />}{' '}
                  {filename}
                </Text>
                <Text>{Math.round(progresses[i]!.percent * 100)}%</Text>
              </Box>
            ))}
          </Box>
        )
      }

      render(<Main />)
    },
  )
  .command(
    'serve',
    '开始周期性渲染并推送至设备',
    yargs => yargs,
    async argv => {
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
      await fs.writeFile('cache/out.svg', svg)

      const png = await sharp(Buffer.from(svg)).png().toBuffer()
      await fs.writeFile('cache/out.png', png)

      const pngBase64 = png.toString('base64')

      await pushImage({ image: pngBase64, ditherType: 'NONE' })
    },
  )
  .demandCommand(1, '请指定命令')
  .parse()
