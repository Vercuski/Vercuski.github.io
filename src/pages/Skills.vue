<template>
  <v-container fill-height fluid>
    <br/>
    <v-row class="align-center justify-center">
      <span class="text-h4 text-center" style="font-weight: bold">SKILLS</span>
    </v-row>
    <br/>
    <v-row class="align-center justify-center">
      <span class="text-h6 text-center" style="font-weight: bold">
        A list of skills I've picked up over the years, ranked top to bottom of
        familiarity.
      </span>
    </v-row>
    <br/><br/>
    <v-row class="align-start justify-center">
      <v-col
        v-for="heading in headings"
        :key="heading"
        class="align-center justify-center"
      >
        <span style="font-weight: bold">{{ heading }}</span
        ><br />
        <span
          v-for="badge in badges.filter((x) => x.Heading === heading)"
          :key="badge.Text"
        >
          <v-chip size="large" class="my-1" label>
            <span class="text-body-1">{{ badge.Text }}</span> </v-chip
          ><br />
        </span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
class Badge {
  Heading: string;
  Text: string;

  constructor(heading: string, text: string) {
    this.Heading = heading;
    this.Text = text;
  }
}

let badges: Array<Badge> = [
  new Badge("Languages", "C#"),
  new Badge("Languages", "SQL"),
  new Badge("Languages", "Typescript"),
  new Badge("Languages", "Javascript"),
  new Badge("Languages", "Powershell"),
  new Badge("Languages", "Markdown"),
  new Badge("Languages", "C++"),
  new Badge("Languages", "C"),

  new Badge("Databases", "MSSQL"),
  new Badge("Databases", "MySQL"),
  new Badge("Databases", "MongoDB"),
  new Badge("Databases", "CosmosDB"),
  new Badge("Databases", "PostgreSQL"),
  new Badge("Databases", "Firebase"),
  new Badge("Databases", "SQLite"),

  new Badge("Frameworks", ".NET"),
  new Badge("Frameworks", "Blazor"),
  new Badge("Frameworks", "VueJS"),
  new Badge("Frameworks", "Node.JS"),
  new Badge("Frameworks", "Bootstrap"),
  new Badge("Frameworks", "Vuetify"),
  new Badge("Frameworks", "CSS"),
  new Badge("Frameworks", "SASS"),

  new Badge("Tools", "Visual Studio"),
  new Badge("Tools", "Git"),
  new Badge("Tools", "VSCode"),
  new Badge("Tools", "Docker"),
  new Badge("Tools", "Jira"),
  new Badge("Tools", "Postman"),
  new Badge("Tools", "RabbitMQ"),
  new Badge("Tools", "MassTransit"),
  new Badge("Tools", "Nginx"),
  new Badge("Tools", "Redis"),

  new Badge("OS", "Windows"),
  new Badge("OS", "Linux"),
  new Badge("OS", "*nix"),
  new Badge("OS", "Raspberry PI"),

  new Badge("Security", "OAuth"),
  new Badge("Security", "JWT"),
  new Badge("Security", "OpenID"),

  new Badge("Architectures", "Onion"),
  new Badge("Architectures", "Clean"),
  new Badge("Architectures", "Event Driven"),
  new Badge("Architectures", "Microservice"),
  new Badge("Architectures", "Modular Monolith"),
  new Badge("Architectures", "Hexagonal"),
  new Badge("Architectures", "Vertical Slice"),
  new Badge("Architectures", "Cloud Native"),

  new Badge("Cloud Providers", "Azure"),
  new Badge("Cloud Providers", "AWS"),
  new Badge("Cloud Providers", "GCP"),

  new Badge("DevOps", "Azure DevOps"),
  new Badge("DevOps", "Github"),
  new Badge("DevOps", "BitBucket"),
  new Badge("DevOps", "Octopus"),

  new Badge("Networking", "Topology"),
  new Badge("Networking", "DNS"),
  new Badge("Networking", "Load Balancing"),
  new Badge("Networking", "Firewalls"),
  new Badge("Networking", "Email & SMTP"),
  new Badge("Networking", "TCP/IP & UDP"),
  new Badge("Networking", "Routing"),
  new Badge("Networking", "Hardware"),
];

const headings = [...new Set(badges.map((item) => item.Heading))];
</script>
