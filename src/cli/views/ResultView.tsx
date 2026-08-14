import { Box, Text } from 'ink'
import { Table } from '@kud/ink-ui'
import Container from '../../components/Container'
import ListItem from '../../components/ListItem'
import { SectionList } from '../../components/Section'
import type { Timezone } from '../../client'
import type { CliResult, DeviceStatusResult } from '../types'

type TimezoneTableRow = {
  [key: string]: string | number
  key: string
  name: string
  utcOffsetMinutes: number
  utcOffsetLabel: string
}

function toTimezoneRows(timezones: Timezone[]): TimezoneTableRow[] {
  return timezones.map(timezone => ({
    key: timezone.key,
    name: timezone.name,
    utcOffsetMinutes: timezone.utcOffsetMinutes,
    utcOffsetLabel: timezone.utcOffsetLabel,
  }))
}

function displayValue(value: unknown) {
  if (value == null || value === '') {
    return '-'
  }

  return String(value)
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
}

function statusRows(device: DeviceStatusResult['device']) {
  const status = asRecord(device.status)
  const renderInfo = asRecord(device.renderInfo)
  const next = asRecord(renderInfo?.next)
  const current = asRecord(renderInfo?.current)
  const images = current?.image

  return [
    ['Status', displayValue(status?.current)],
    ['Battery', displayValue(status?.battery)],
    ['Wi-Fi', displayValue(status?.wifi)],
    ['Last Render', displayValue(renderInfo?.last)],
    ['Next Render (Battery)', displayValue(next?.battery)],
    ['Next Render (Power)', displayValue(next?.power)],
    ['Current Images', String(Array.isArray(images) ? images.length : 0)],
    ['Version', status?.version != null ? `v${String(status.version)}` : '-'],
  ] as const
}

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
            result.devices.map((device, index) => (
              <Box key={device.id ?? index} flexDirection="column">
                <ListItem trailing={<Text>{displayValue(device.id)}</Text>}>
                  <Text dimColor>ID</Text>
                </ListItem>
                <ListItem trailing={<Text>{displayValue(device.series)}</Text>}>
                  <Text dimColor>Series</Text>
                </ListItem>
                <ListItem trailing={<Text>{displayValue(device.model)}</Text>}>
                  <Text dimColor>Model</Text>
                </ListItem>
                <ListItem trailing={<Text>{displayValue(device.edition)}</Text>}>
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
    const status = asRecord(device.status)

    return (
      <Container>
        <SectionList>
          <ListItem
            trailing={
              <Text>
                <Text dimColor>Serial Number: </Text>
                {displayValue(device.deviceId)}
              </Text>
            }
          >
            <Box gap={1}>
              <Text>{device.alias ?? 'Unnamed device'}</Text>
              {device.location && <Text dimColor>{device.location}</Text>}
              <Text dimColor>{displayValue(status?.battery)}</Text>
            </Box>
          </ListItem>
          <Box flexDirection="column">
            {statusRows(device).map(([label, value]) => (
              <ListItem key={label} trailing={<Text>{value}</Text>}>
                <Text dimColor>{label}</Text>
              </ListItem>
            ))}
          </Box>
        </SectionList>
      </Container>
    )
  }

  if (result.type === 'device-settings') {
    const { settings } = result

    return (
      <Container>
        <SectionList>
          <ListItem trailing={<Text dimColor>{result.deviceId}</Text>}>
            <Text>Device Settings</Text>
          </ListItem>
          <Box flexDirection="column">
            {[
              ['Alias', settings.alias ?? '-'],
              ['Location', settings.location ?? '-'],
              ['Timezone', settings.timezone ?? '-'],
              [
                'Interval (Power)',
                settings.interval?.powerMs != null ? `${settings.interval.powerMs} ms` : '-',
              ],
              [
                'Interval (Battery)',
                settings.interval?.batteryMs != null ? `${settings.interval.batteryMs} ms` : '-',
              ],
              [
                'Sleep',
                settings.sleep != null
                  ? settings.sleep.enabled
                    ? `${settings.sleep.start} - ${settings.sleep.end}`
                    : 'Disabled'
                  : '-',
              ],
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

  if (result.type === 'device-settings-update') {
    return (
      <Container>
        <SectionList>
          <Text>Update Device Settings</Text>
          <ListItem>
            <Text>{result.response.message}</Text>
          </ListItem>
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

  if (result.type === 'content-text') {
    return (
      <Container>
        <SectionList>
          <Text>Push Text</Text>
          <ListItem>
            <Text>{result.response.message}</Text>
          </ListItem>
        </SectionList>
      </Container>
    )
  }

  if (result.type === 'timezone-list') {
    return (
      <Container>
        <SectionList>
          <ListItem
            trailing={
              <Text dimColor>
                {result.timezones.length}/{result.timezones.length}
              </Text>
            }
          >
            <Text>Timezones</Text>
          </ListItem>
          {result.timezones.length === 0 ? (
            <ListItem>
              <Text dimColor>No timezones found</Text>
            </ListItem>
          ) : (
            <Table
              columns={[
                { key: 'key', header: 'Key' },
                { key: 'name', header: 'Name' },
                { key: 'utcOffsetLabel', header: 'Offset' },
                { key: 'utcOffsetMinutes', header: 'Minutes' },
              ]}
              data={toTimezoneRows(result.timezones)}
            />
          )}
        </SectionList>
      </Container>
    )
  }

  if (result.type === 'content-list') {
    return (
      <Container>
        <SectionList>
          <ListItem
            trailing={
              <Text dimColor>
                {result.tasks.length}/{result.tasks.length}
              </Text>
            }
          >
            <Text>Tasks</Text>
          </ListItem>
          {result.tasks.length === 0 ? (
            <ListItem>
              <Text dimColor>No tasks found</Text>
            </ListItem>
          ) : (
            result.tasks.map((task, index) => (
              <Box key={task.key ?? index} flexDirection="column">
                <ListItem trailing={<Text>{displayValue(task.type)}</Text>}>
                  <Text dimColor>{task.key ?? '(no key)'}</Text>
                </ListItem>
                {task.title != null && (
                  <ListItem trailing={<Text>{displayValue(task.title)}</Text>}>
                    <Text dimColor>Title</Text>
                  </ListItem>
                )}
                {task.message != null && (
                  <ListItem trailing={<Text>{displayValue(task.message)}</Text>}>
                    <Text dimColor>Message</Text>
                  </ListItem>
                )}
              </Box>
            ))
          )}
        </SectionList>
      </Container>
    )
  }

  if (result.type === 'content-canvas') {
    return (
      <Container>
        <SectionList>
          <Text>Push Canvas</Text>
          <ListItem trailing={<Text dimColor>{result.file}</Text>}>
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
