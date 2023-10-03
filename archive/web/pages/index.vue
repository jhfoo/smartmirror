<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">
          SMARTMirror
        </v-card-title>
        <v-card-text>
          <div v-for="event in events">
            <div>{{event.summary}}</div>
            <div>{{formatDateTime(event.start.dateTime)}}</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            nuxt
            to="/inspire"
          >
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import axios from 'axios'
import dayjs from 'dayjs'

const CalendarId = 'family17470737614425992610@group.calendar.google.com'
const ApiBaseUrl = 'https://smartmirror.kungfoo.info'

export default {
  name: 'IndexPage',
  data() {
    return {
      events: [],
    }
  },
  mounted() {
    this.syncEvents()
    setTimeout(() => {
      this.syncEvents()
    }, 2 * 60 * 1000);
  },
  methods: {
    async syncEvents() {
      try {
        let resp = await axios.get(ApiBaseUrl + '/api/calendar/' + CalendarId + '/event/list')
        console.log(resp.data)
        this.events = resp.data.items
      } catch (err) {
        console.error(err)
      }
    },
    formatDateTime(dt) {
      return dayjs(dt).format('DD MMM HH:mm')
    }
  }
}
</script>
