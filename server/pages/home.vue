<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-6">
        <div class="row">
          <div class="col-3" align="right">
            <div align="center">
              <div class="DoWBlock">{{NowMonth}}</div>
              <div class="text-h1">{{NowDay}}</div>
              <div class="DoWBlock">{{NowDayOfWeek}}</div>
            </div>
          </div>
          <div class="col-9" align="left">
            <div align="center">
              <div class="TimeBlock">{{NowTime}}</div>
            </div>
          </div>
        </div>
        <div class="row q-pt-md">
          <div class="col-6">
            <q-img src="/images/weather-sunny.jpg" height="400px">
              <div class="text-h6">
                {{WeatherNow.name}}
              </div>
              <div class="absolute-bottom TempMax">
                <div style="float:left">{{WeatherNow.MinTemp}}</div>
                <div style="float:right">{{WeatherNow.MaxTemp}}</div>
                <div style="clear:both"/>
              </div>
            </q-img>

            <div class="q-ma-md WeatherSummary">{{WeatherNow.summary}}</div>
          </div>
          <div class="col-6">
            <div class="q-ml-md">
              <q-img src="/images/weather-mostlyclear-night.jpg" height="400px">
                <div class="text-h6">
                  {{WeatherLater.name}}
                </div>
                <div class="absolute-bottom TempMax">
                  <div style="float:left">{{WeatherLater.MinTemp}}</div>
                  <div style="float:right">{{WeatherLater.MaxTemp}}</div>
                  <div style="clear:both"/>
                </div>
              </q-img>

              <div class="q-ma-md WeatherSummary">{{WeatherLater.summary}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-1">&nbsp;</div>
      <div class="col-5">
        <div class="text-h3 text-yellow q-mb-md">Today</div>
        <div v-for="item in ItemsToday">
          <div class="EventTitle">{{item.summary}}</div>
          <div class="EventSubtitle">
            <div class="text-grey" style="float:right">{{getDate(item.start).format('HH:mm')}} - {{getDate(item.end).format('HH:mm')}}</div>
            <div style="clear:both"/>
          </div>
          <q-separator class="q-mt-md" />
        </div>

        <div class="text-h3 q-my-md text-blue">Upcoming</div>
        <div v-for="item in ItemsSoon">
          <div class="text-grey-4 q-mt-md EventTitle">{{item.summary}}</div>
          <div class="EventSubtitle">
            <div class="text-grey" style="float:left">{{getDate(item.start).format('ddd DD MMM')}}</div>
            <div class="text-grey" style="float:right">{{getDate(item.start).format('HH:mm')}} - {{getDate(item.end).format('HH:mm')}}</div>
            <div style="clear:both"/>
          </div>
          <q-separator class="q-mt-md" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.WeatherSummary {
  font-size: 1.5rem;
  line-height: 1.8rem;
}
.TempMax {
  font-size: 3rem;
  line-height: 3rem;
}
.EventTitle {
  font-size: 2.8rem;
  line-height: 2.8rem;
  overflow: hidden;
  scroll-y: none;
  white-space: nowrap;
}
.EventSubtitle {
  padding-top: 10px;
  font-size: 1.8rem;
  line-height: 1.8rem;
}
.TimeBlock {
  font-size: 12rem;
  line-height: 12rem;
}
.DoWBlock {
  font-size: 2.5rem;
  line-height: 2.5rem;
}
</style>

<script setup>
import axios from 'axios'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import { ref } from 'vue'
import xml2js from 'xml2js'

const items = ref([]) 
const ItemsToday = ref([])
const ItemsSoon = ref([])
const weather = ref({})
const now = ref(null)
const NowDay = ref ('')
const NowMonth = ref('')
const NowTime = ref('')
const NowDayOfWeek = ref('')
const WeatherNow = ref({
  MinTemp: '',
  MaxTemp: '',
  summary: '',
})
const WeatherLater = ref({})

const MAX_SUMMARY_LEN = 30

let timer = null
let WeatherCountdown = 0

dayjs.extend(isToday)
await refreshCalendarEvents(true)

function truncateString(str, num) {
  // If the length of str is less than or equal to num
  // just return str--don't truncate it.
  if (str.length <= num) {
    return str
  }
  // Return str truncated with '...' concatenated to the end of str.
  return str.slice(0, num) + '...'
}

function getDate(item) {
  if ('dateTime' in item) {
    return dayjs(item.dateTime)
  }
  // else
  return dayjs(item.date)
}

function simplifyWeatherData(parent, index) {
  return {
    name: parent['time-layout'][0]['start-valid-time'][index]['$']['period-name'],
    MinTemp: parent['parameters'][0]['temperature'][0]['value'][index],
    MaxTemp: parent['parameters'][0]['temperature'][1]['value'][index],
    summary: parent['parameters'][0]['wordedForecast'][0]['text'][index],

  }
}

async function refreshCalendarEvents(isIgnoreDups = false) {
  const MAX_EVENTS = 5
  const REFRESH_SEC = 60

  // in case there are multiple timers
  if (!isIgnoreDups && timer === null) {
    return
  }
  timer = null

  try {
    // update now
    now.value = dayjs()
    NowDay.value = now.value.format('DD')
    NowMonth.value = now.value.format('MMM')
    NowTime.value = now.value.format('hh:mm')
    NowDayOfWeek.value = now.value.format('dddd')
    console.log(`now.value: ${now.value.format('DD')}`)

    const events = await getCalendarEvents()
    console.log(`refreshCalendarEvents(): ${events.length} events`)
    ItemsToday.value = events.filter((item) => {
      const StartDateTime = dayjs(item.start.dateTime ? item.start.dateTime : item.start.date)
      return StartDateTime.isToday()
    })
    ItemsSoon.value = events.filter((item) => {
      const StartDateTime = dayjs(item.start.dateTime ? item.start.dateTime : item.start.date)
      return !StartDateTime.isToday()
    }).slice(0,MAX_EVENTS - ItemsToday.value.length)

    WeatherCountdown--
    if (WeatherCountdown <= 0) {
      WeatherCountdown = 10
      const resp = await axios.get('https://forecast.weather.gov/MapClick.php?lat=33.082&lon=-96.7614&unit=1&lg=english&FcstType=dwml')
      const XmlParser = new xml2js.Parser()
      const WeatherRaw = await XmlParser.parseStringPromise(resp.data)
      weather.value = WeatherRaw.dwml.data
      console.log(JSON.stringify(weather.value,null,2))

      WeatherNow.value = simplifyWeatherData(weather.value[0], 0)
      WeatherLater.value = simplifyWeatherData(weather.value[0], 1)
      console.log(WeatherNow.value)
      // console.log(JSON.stringify(weather.value.dwml.head,null,2))
    }
  } catch (err) {
    console.error(err)
  }

  if (timer != null) {
    console.log(`WARNING: Duplicate timer call detected`)
    return
  } 
  // timer = setTimeout(async() => {
  //   refreshCalendarEvents()
  // }, REFRESH_SEC * 1000)
}

async function getCalendarEvents () {
  const resp = await axios.get('https://smartmirror.kungfoo.info/api/calendar/list')
  // console.log(resp.data.data.items)
  return resp.data.data.items
}
</script>