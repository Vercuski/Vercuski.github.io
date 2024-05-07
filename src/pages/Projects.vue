<template>
  <v-container fill-height fluid>
    <br/>
    <v-row class="align-center justify-center">
      <span class="text-h4 text-center" style="font-weight: bold">PROJECTS</span>
    </v-row>
    <v-row class="align-center justify-center">
      <v-col align-self="center" cols="4" offset="1">
        <v-card Class="my-12 mx-auto" Style="max-width: 420px">
          <v-card-item Orientation="Orientation.Horizontal" JustifyContent="JustifyContent.Start" Gap="1rem" Class="rz-p-4">
            <v-row> 
              <v-col>
                <a href="https://github.com/Vercuski/MESSAGING.Template" target="_blank"><img src="../assets/icons/messagingicon.webp" Style="width: 100px; height: 100px; border-radius: 50%;" /></a>
              </v-col> 
              <v-col>
                  <p class="d flex mt-2 my-0 text-overline">Repository Name</p>
                  <p class="text-body-1"><b>Messaging.Template</b></p>
                  <p class="d flex mt-2 my-0 text-overline">Location</p>
                  <p class="text-body-1"><b>GitHub</b></p>
              </v-col>
            </v-row>
          </v-card-item>
          <v-card class="rz-background-color-primary-light rz-shadow-0 rz-border-radius-0 rz-p-8" style="margin: 1rem calc(-1 * var(--rz-card-padding));">
              <p TextStyle="TextStyle.H6" class="rz-color-on-primary-light"><strong>Description</strong></p>
              <p TextStyle="TextStyle.Body1" class="rz-color-on-primary-light">Template for simple message structures to be used for a messaging system.</p>
              <br />
              <v-row Gap="0">
                  <v-col SizeSM="6">
                      <p TextStyle="TextStyle.Overline" class="rz-color-on-primary-light rz-display-flex rz-mt-4 rz-mb-0">Framework</p>
                      <p TextStyle="TextStyle.Body1" class="rz-color-on-primary-light"><b>.NET Core 8</b></p>
                  </v-col>
                  <v-col SizeSM="6">
                      <p TextStyle="TextStyle.Overline" class="rz-color-on-primary-light rz-display-flex rz-mt-4 rz-mb-0">Language</p>
                      <p TextStyle="TextStyle.Body1" class="rz-color-on-primary-light"><b>C#</b></p>
                  </v-col>
              </v-row>
          </v-card>
          <v-row Orientation="Orientation.Horizontal" JustifyContent="JustifyContent.End" Gap="0">
              <a href="https://github.com/Vercuski/MESSAGING.Template" target="_blank"><img src="../assets/icons/github-mark.png" Style="width: 32px; height: 32px;" /></a>
          </v-row>
      </v-card>
    </v-col>
  </v-row>
</v-container>
</template>

<script lang="ts" setup>
  //
</script>