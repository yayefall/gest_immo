<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar  v-if="showBack">
        <!-- Bouton de retour
        <q-btn
          to="/"
          icon="arrow_back"
          flat
          dense
          label="Back"
          v-if="showBack"
        />-->

        <!-- Bouton pour le menu -->
        <q-btn
          v-if="showMenu"
          flat
          dense
          icon="menu"
          @click="drawer = !drawer"
        />

        <!-- Titre -->
        <q-toolbar-title class="absolute-center">{{ title }}</q-toolbar-title>

        <!-- Bouton pour la connexion -->
        <q-btn
          v-if="showLoginButton"
          to="/login"
          class="absolute-right q-pr-sm"
          icon="account_circle"
          no-caps
          flat
          label="Login"
        />

        <!-- Menu utilisateur avec déconnexion -->
        <q-bar v-if="showButton" color="primary" class="absolute-right q-pr-md">
          <q-btn no-caps flat icon="account_circle" title="login" label="Login"/>

          <q-menu>
            <q-list dense style="min-width: 150px">
              <!-- Nom de l'utilisateur -->
              <q-item clickable v-close-popup>
                <q-item-section>
                  <q-icon name="account_circle" class="q-mr-sm" />
                  {{ user?.nompComplet || "Utilisateur " }}
                </q-item-section>
              </q-item>

              <q-separator />

              <!-- Option de déconnexion -->
              <q-item clickable v-close-popup @click="logout">
                <q-item-section>
                  <q-icon name="logout" class="q-mr-sm" />
                  Déconnexion
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-bar>
      </q-toolbar>
    </q-header>

    <!-- Menu latéral -->
    <q-drawer
      show-if-above
      v-model="drawer"
      side="left"
      bordered
      v-if="showMenu"
      :width="300"
    >
      <q-list>
        <q-item clickable v-ripple to="/biens">
          <q-item-section avatar>
            <q-icon name="assessment" />
          </q-item-section>
          <q-item-section>Biens</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/contrats">
          <q-item-section avatar>
            <q-icon name="inventory" />
          </q-item-section>
          <q-item-section>Contrats</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/locataires">
          <q-item-section avatar>
            <q-icon name="sync_alt" />
          </q-item-section>
          <q-item-section>Locataires</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/paiements">
          <q-item-section avatar>
            <q-icon name="post_add" />
          </q-item-section>
          <q-item-section>Paiements</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/profil">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>Profil</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/proprietaires">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>Propriétaires</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Tableau de Bord</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Contenu de la page -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";


export default {
  name: "MainLayout",
  setup() {
    const drawer = ref(false);
    const isLoggedIn = ref(false);
    const user = ref(null);
    const router = useRouter();
    const $q = useQuasar(); // Initialiser $q



    const showBack = computed(() => {
      const pagesWithoutLogin = [  "login",];
   return !pagesWithoutLogin.includes(router.currentRoute.value.name);
    });

    const showMenu = computed(() => {
      const pagesWithoutLogin = ["index", "login"];
      return !pagesWithoutLogin.includes(router.currentRoute.value.name);
    });

    const showButton = computed(() => {
      const pagesWithoutLogin = ["index", "login"];
      return !pagesWithoutLogin.includes(router.currentRoute.value.name);
    });

    const showLoginButton = computed(() => {
      const pagesWithoutLogin = [
        "login",
        "profil",
        "biens",
        "contrats",
        "dashboard",
        "locataires",
        "paiements",
        "proprietaires",
      ];
      return !pagesWithoutLogin.includes(router.currentRoute.value.name);
    });

    const title = computed(() => {
      const currentPath = router.currentRoute.value.fullPath;
      if (currentPath === "/login") return "Login";
      if (currentPath === "/profil") return "Profils";
      if (currentPath === "/dashboard") return "Tableau de Bord";
      if (currentPath === "/biens") return "Biens";
      if (currentPath === "/contrats") return "Contrats";
      if (currentPath === "/factures") return "Factures";
      if (currentPath === "/locataires") return "Locataires";
      if (currentPath === "/paiements") return "Paiements";
      if (currentPath === "/proprietaires") return "Propriétaires";
      return "Gestion Immobilier";
    });


   onMounted(() => {
      const token = localStorage.getItem("auth-token");
      if (token) {
        axios
      .get("http://localhost:2000/api/userConnete", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data && response.data.user) {
          user.value = response.data.user; // Assurez-vous que `response.data.user` existe
          isLoggedIn.value = true;
        } else {
          console.error("Réponse inattendue de l'API :", response.data);
          logout();
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des informations utilisateur :", error);
        $q.notify({
          type: "negative",
          message: "Impossible de récupérer les informations utilisateur. Veuillez vous reconnecter.",
        });
        logout();
      });
  } else {
    console.warn("Aucun token trouvé dans localStorage.");
    logout();
  }
});

const logout = () => {
      localStorage.removeItem("auth-token");
      user.value = null;
      isLoggedIn.value = false;
     // $q.notify({
        //type: "info",
        //message: "Vous êtes déconnecté.",
     // });
      router.push("/login");
    };

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
    });
*/
    return {
      drawer,
      isLoggedIn,
      user,
      showBack,
      showMenu,
      showButton,
      showLoginButton,
      title,
      logout,
    };
  },
};
</script>



