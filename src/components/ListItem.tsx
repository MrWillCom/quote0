import { Box, Text } from 'ink'

export default function ListItem({
  leading,
  children,
  trailing,
  ...props
}: React.ComponentProps<typeof Box> & {
  leading?: React.ReactNode
  children?: React.ReactNode
  trailing?: React.ReactNode
}) {
  return (
    <Box justifyContent="space-between" {...props}>
      <Box>
        {leading && (
          <>
            {leading}
            <Text> </Text>
          </>
        )}
        {children}
      </Box>
      <Box>{trailing}</Box>
    </Box>
  )
}
