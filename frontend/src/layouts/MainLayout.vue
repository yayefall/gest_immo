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
             <!--  <q-item clickable v-close-popup>
                <q-item-section v-if="user && user.nomComplet">
                  <q-icon name="account_circle" class="q-mr-sm" />
                 {{ user.nomComplet || "Utilisateur " }}
                </q-item-section>
              </q-item>-->

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
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Biens</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/cautions">
          <q-item-section avatar>
            <q-icon name="receipt_long" />
          </q-item-section>
          <q-item-section>Cautions</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/contrats">
          <q-item-section avatar>
            <q-icon name="gavel" />
          </q-item-section>
          <q-item-section>Contrats</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/locataires">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>Locataires</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/paiements">
          <q-item-section avatar>
            <q-icon name="credit_card" />
          </q-item-section>
          <q-item-section>Paiements</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/profil">
          <q-item-section avatar>
            <q-icon name="person_pin" />
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
            <q-icon name="space_dashboard" />
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
        "cautions"
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
      if (currentPath === "/cautions") return "Cautions";

      return "Gestion Immobilier";
    });

    onMounted(async () => {
      try {
        const response = await axios.get('http://localhost:2000/api/userConnect', {
          withCredentials: true,
        });
        if (response.data.success) {
          user.value = response.data.user;
          isLoggedIn.value = true;
        } else {
          isLoggedIn.value = false;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
          isLoggedIn.value = false;
    }
  });

    // Vérifier l'utilisateur connecté lors du montage du composant
   const logout = async () => {
   try {
    const response = await axios.post('http://localhost:2000/api/logout', {}, {
      withCredentials: true,
    });
    if (response.data.success) {
      isLoggedIn.value = false;
      user.value = null;
      router.push('/login'); // Redirige vers la page de connexion
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};

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



  }
};
</script>



