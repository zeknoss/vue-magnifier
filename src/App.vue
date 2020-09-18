<template>
  <div id="app">
      <vue-magnifier
          src="https://picsum.photos/500/500?image=1071"
          src-large="https://picsum.photos/1000/1000?image=1071"
      />
  </div>
</template>

<script>

import VueMagnifier from "@/components/vue-magnifier";
export default {
  name: 'App',
  components: {
      VueMagnifier
  }
}
</script>

