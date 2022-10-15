<template>
  <div>
    <svg-icon icon-class="link" @click="goto" />
  </div>
</template>

<script>
export default {
  name: 'GoAdminDoc',
  data() {
    return {
      url: 'http://10.44.200.24:81/www'
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>
