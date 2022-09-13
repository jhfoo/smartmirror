<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">
          SMARTMirror
        </v-card-title>
        <v-card-text>
          x
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

const CalendarId = 'family17470737614425992610@group.calendar.google.com'
const ApiBaseUrl = 'https://smartmirror.kungfoo.info'

export default {
  name: 'IndexPage',
  async mounted() {
    let resp = await axios.get(ApiBaseUrl + '/api/calendar/' + CalendarId + '/event/list')
    console.log(resp.data)
  }
}
</script>
