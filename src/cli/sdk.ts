export async function sdkData<T>(result: Promise<{ data: T }>): Promise<T> {
  const { data } = await result
  return data
}
