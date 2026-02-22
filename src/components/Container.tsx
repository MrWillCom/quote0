import { Box } from 'ink'
import type React from 'react'

export default function Container({
  ...props
}: React.ComponentProps<typeof Box>) {
  return <Box borderStyle="round" flexDirection="column" {...props} />
}
