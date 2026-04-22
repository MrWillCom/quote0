import { Box, Text } from 'ink'
import Container from '../../components/Container'
import ListItem from '../../components/ListItem'
import { SectionList } from '../../components/Section'
import type { CliResult } from '../types'

export function ResultView({ result }: { result: CliResult }) {
  if (result.type === 'device-list') {
    return (
      <Container>
        <SectionList>
          <ListItem
            trailing={
              <Text dimColor>
                {result.devices.length}/{result.devices.length}
              </Text>
            }
          >
            <Text>Devices</Text>
          </ListItem>
          {result.devices.length === 0 ? (
            <ListItem>
              <Text dimColor>No devices found</Text>
            </ListItem>
          ) : (
            result.devices.map(device => (
              <Box key={device.id} flexDirection="column">
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
            ))
          )}
        </SectionList>
      </Container>
    )
  }

  if (result.type === 'device-status') {
    const { device } = result

    return (
      <Container>
        <SectionList>
          <ListItem
            trailing={
              <Text>
                <Text dimColor>Device ID: </Text>
                {device.deviceId}
              </Text>
            }
          >
            <Box gap={1}>
              <Text>{device.alias ?? 'Unnamed device'}</Text>
              {device.location && <Text dimColor>{device.location}</Text>}
              <Text dimColor>{device.status.battery}</Text>
            </Box>
          </ListItem>
          <Box flexDirection="column">
            {[
              ['Status', device.status.current],
              ['Battery', device.status.battery],
              ['Wi-Fi', device.status.wifi],
              ['Last Render', device.renderInfo.last],
              ['Next Render (Battery)', device.renderInfo.next.battery],
              ['Next Render (Power)', device.renderInfo.next.power],
              ['Current Images', String(device.renderInfo.current.image.length)],
              ['Version', `v${device.status.version}`],
            ].map(([label, value]) => (
              <ListItem key={label} trailing={<Text>{value}</Text>}>
                <Text dimColor>{label}</Text>
              </ListItem>
            ))}
          </Box>
        </SectionList>
      </Container>
    )
  }

  if (result.type === 'content-next') {
    return (
      <Container>
        <SectionList>
          <Text>Next Content</Text>
          <ListItem>
            <Text>{result.response.message}</Text>
          </ListItem>
        </SectionList>
      </Container>
    )
  }

  return (
    <Container>
      <SectionList>
        <Text>Push Image</Text>
        <ListItem trailing={<Text dimColor>{result.file}</Text>}>
          <Text>{result.response.message}</Text>
        </ListItem>
      </SectionList>
    </Container>
  )
}

export function ErrorView({ message, code }: { message: string; code: string }) {
  return (
    <Container>
      <SectionList>
        <ListItem trailing={<Text dimColor>{code}</Text>}>
          <Text>Error</Text>
        </ListItem>
        <ListItem>
          <Text>{message}</Text>
        </ListItem>
      </SectionList>
    </Container>
  )
}
