
<template>
  <q-page padding class=" flex flex-center">
    <div class="welcome-page q-pa-md flex flex-center">
    <q-card class="welcome-card q-pa-lg">
      <q-img src="path/to/welcome-image.jpg" style="max-width: 100px;" />
      <h1 class="text-h6 text-center">Bienvenue sur notre Agence Immobilier !</h1>
      <p class="text-subtitle1 text-center">Nous sommes ravis de vous compter parmis Nous. Découvrez ce que nous avons à offrir.</p>

      <div class="q-mt-md flex flex-center">
        <q-btn label="Contactez-nous" color="primary" to="/" />
      </div>
    </q-card>
  </div>

  </q-page>
</template>
<script>
export default {
  methods: {
    goTo(route) {
      this.$router.push({ name: route });
    },
  },
};
</script>

<style scoped>
.welcome-page {
  background-color: #f5f5f5;
}

.welcome-card {
  max-width: 500px;
  text-align: center;
}
</style>

