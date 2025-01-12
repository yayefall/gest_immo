<template>
  <q-page padding class="flex flex-center">

    <q-card class="q-pa-lg login-card" v-if="!isLoggedIn">
      <q-card class="welcome-card ">
      <h1 class="text-h6 text-center">Bienvenue dans notre Agence Immobilier !</h1>
      <p class="text-subtitle1 text-center">Nous sommes ravis de vous compter parmis Nous.</p>
    </q-card>
    <q-separator />
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
            :rules="[val => !!val || 'Mot de passe est requis']"
            :type="passwordVisible ? 'text' : 'password'"
            required
          >
            <template v-slot:append>
              <q-icon
                :name="passwordVisible ? 'visibility' : 'visibility_off'"
                @click="passwordVisible = !passwordVisible"
              />
            </template>
          </q-input>

          <div class="q-pa-md q-gutter-sm">
            <q-btn
              type="submit"
              label="Connecter"
              color="primary"
              class="q-mt-md"
              :disable="!username || !password"
              :loading="isLoading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import axios from "axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";



export default defineComponent({
  name: "LoginPage",
  setup() {
    const $q = useQuasar(); // Initialiser $q
    const username = ref("");
    const password = ref("");
    const passwordVisible = ref(false);
    const isLoggedIn = ref(false);
    const isLoading = ref(false);
    const user = ref(null);
    const router = useRouter()

    // Vérifier si l'utilisateur est déjà connecté au chargement de la page
  /* onMounted(() => {
      const token = localStorage.getItem("auth-token");
      if (token) {
        axios
          .get("http://localhost:2000/api/userConnete", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            user.value = response.data.user;
            isLoggedIn.value = true;
          })
          .catch(() => {
            logout();
          });
      }
    });*/


  const submitLogin = async () => {
      isLoading.value = true;
      try {
        const response = await axios.post("http://localhost:2000/api/login", {
          username: username.value,
          password: password.value,
        });

        // Sauvegarder le token et infos utilisateur
        localStorage.setItem("auth-token", response.data.token);
        user.value = response.data.user;
        isLoggedIn.value = true;

        // Réinitialiser les champs du formulaire
        username.value = "";
        password.value = "";

        // Rediriger vers la page dashboard
        router.push("/dashboard");
      } catch (error) {
        // Afficher l'erreur dans la console pour mieux comprendre
        console.error("Erreur lors de la connexion :", error);

        const message =
          error.response?.status === 401
            ? "Nom d'utilisateur ou mot de passe incorrect."
            : error.response?.status === 500
            ? "Erreur interne du serveur. Veuillez réessayer plus tard."
            : "Une erreur inconnue s'est produite.";

        $q.notify({
          type: "negative",
          message,
        });
      } finally {
        isLoading.value = false;
      }

    };


    return {
      username,
      password,
      isLoggedIn,
      passwordVisible,
      submitLogin,
      isLoading,
    };
  },
});
</script>

<style scoped>
/* Arrière-plan général */
.login-page {
  background: linear-gradient(to right, #e3f2fd, #fce4ec);
  height: 100vh;
}

/* Style de la carte principale */
.login-card {
  max-width: 500px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
}

.flex {
  display: flex;
}

.flex-center {
  justify-content: center;
  align-items: center;
  height: 100vh;
}
/* Carte d'accueil */
.welcome-card {
  background: linear-gradient(135deg, #42a5f5, #ab47bc);
  color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Boutons personnalisés */
.btn-styled {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.btn-styled:hover {
  transform: scale(1.05);
}

/* Entrées stylisées */
.input-styled {
  border-radius: 8px;
}

/* Texte de la section Connexion */
.text-secondary {
  color: #6a1b9a;
  font-weight: bold;
}
</style>






<!--<template>
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
            :rules="[val => !!val || 'Mot de passe est requis']"
            :type="passwordVisible ? 'text' : 'password'"
            required
           >
           <template v-slot:append>
            <q-icon
               :name="passwordVisible ? 'visibility' : 'visibility_off'"
               @click="passwordVisible = !passwordVisible"
            />
          </template>
         </q-input>

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
 import { defineComponent , ref} from 'vue';
 import axios from "axios";



 export default defineComponent({
   name: 'LoginPage',

   data() {
     return {
       username: '',
       password: '',
       passwordVisible: false,
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
 </style> -->
