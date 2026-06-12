import BaseClient from '../base'

export interface Timezone {
  key: string
  name: string
  utcOffsetMinutes: number
  utcOffsetLabel: string
}

class TimezoneModule extends BaseClient {
  async list() {
    const response = (await this.fetchApi(`/authV2/open/timezones`)) as Timezone[]

    return response
  }
}

export default TimezoneModule
