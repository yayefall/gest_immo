<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page padding class="flex flex-center">
    <q-card class="q-pa-lg login-card">
      <q-card-section class="text-center">
        <div class="text-h5">Connexion</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="submitLogin">
          <q-input
            v-model="username"
            label="Username"
            outlined
            class="q-mb-md"
            :rules="[val => !!val || 'Username est requis']"
            required
          />
          <q-input
            v-model="password"
            label="Mot de passe"
            outlined
            class="q-mb-md"
            type="password"
            :rules="[val => !!val || 'Mot de passe est requis']"
            required
          />
          <div class="q-pa-md q-gutter-sm">
            <q-btn
              type="submit"
              label="Connecter"
              color="primary"
              class="q-mt-md"
              :disable="!username || !password"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

 <script>
 import { defineComponent } from 'vue';
 import axios from "axios";

 export default defineComponent({
   name: 'LoginPage',


   data() {
     return {
       username: '',
       password: '',

     };
   },


     methods: {

    async submitLogin() {
      try {
        const response = await axios.post("http://localhost:2000/api/login", {
          username: this.username,
          password: this.password,
        });
        this.$q.notify({
          type: "positive",
          message: "Connexion réussie!",
        });
        localStorage.setItem("auth-token", response.data.token);
        this.$router.push("/dashboard");
      } catch (error) {
        if (error.response?.status === 401) {
          this.$q.notify({
            type: "negative",
            message: "Nom d'utilisateur ou mot de passe incorrect.",
          });
        } else {
          this.$q.notify({
            type: "negative",
            message: "Erreur interne du serveur. Veuillez réessayer plus tard.",
          });
        }
        console.error("Erreur de connexion:", error);
      }
    },

   },


 })
 </script>
 <style scoped>
 .login-card {
   max-width: 500px;
   width: 100%;
 }

 .flex {
   display: flex;
 }

 .flex-center {
   justify-content: center;
   align-items: center;
   height: 100vh;
 }
 </style>
