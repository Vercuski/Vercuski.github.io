<template>
  <div class="maincontent">
    <h1>{{ greeting }}</h1>
  </div>
</template>

<script setup lang="ts">
enum TimeOfDay {
  Morning = 'Good morning',
  Afternoon = 'Good afternoon',
  Evening = 'Good evening',
  Night = 'Hope you are having a good night'
}

const hour = new Date().getHours();
let timeOfDay: TimeOfDay;
switch (true) {
  case (hour >= 5 && hour < 12):
    timeOfDay = TimeOfDay.Morning;
    break;
  case (hour >= 12 && hour < 17):
    timeOfDay = TimeOfDay.Afternoon;
    break;
  case (hour >= 17 && hour < 21):
    timeOfDay = TimeOfDay.Evening;
    break;
  default:
    timeOfDay = TimeOfDay.Night;
    break;
}
const greeting = timeOfDay + ", I'm Scott Vercuski";
</script>
