import { Box } from 'ink'
import { inkPropsHelpers } from '../utils'
import React from 'react'

function Section({
  isLast,
  ...props
}: React.ComponentProps<typeof Box> & { isLast?: boolean }) {
  return (
    <Box
      {...(isLast !== true && {
        borderStyle: 'single',
        borderDimColor: true,
        ...inkPropsHelpers.border('bottom'),
      })}
      paddingX={1}
      flexDirection="column"
      {...props}
    />
  )
}

function SectionList({ children }: { children: React.ReactNode }) {
  const arrayChildren = React.Children.toArray(children)
  return (
    <>
      {...arrayChildren.map((child, i) => (
        <Section isLast={i === arrayChildren.length - 1}>{child}</Section>
      ))}
    </>
  )
}

export { Section, SectionList }
export default Section
