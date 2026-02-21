export const styles = {
  border: (...directions: ('top' | 'right' | 'bottom' | 'left')[]) => {
    return {
      borderTop: directions.includes('top'),
      borderRight: directions.includes('right'),
      borderBottom: directions.includes('bottom'),
      borderLeft: directions.includes('left'),
    }
  },
}
