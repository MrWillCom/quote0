#!/usr/bin/env node

import 'dotenv/config'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Box, render, Text } from 'ink'
import { getDeviceStatus } from './actions.js'
import { styles } from './helpers.js'

yargs(hideBin(process.argv))
  .command(
    'status',
    'Check the status of the device',
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
                <Text dimColor>Device ID:</Text> {response.deviceId}
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
    'serve',
    'Start pushing updates regularly to the device',
    yargs => yargs,
    argv => {
      console.log('Not implemented yet')
    },
  )
  .demandCommand(1, 'You need to specify a command')
  .parse()
