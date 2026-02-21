import 'dotenv/config'

async function main() {
  const url =
    'https://dot.mindreset.tech/api/authV2/open/device/' +
    process.env.QUOTE0_DEVICEID +
    '/status'
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.QUOTE0_API_KEY,
    },
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.error(error)
  }
}

await main()
