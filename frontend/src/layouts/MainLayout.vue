<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

   <!-- Bouton de sortis  -->
       <q-btn
        to="/"
        v-if="$route.fullPath.includes('/login')"
        icon="arrow_back"
        flat
        danse
        label="Back"
        />
        <!-- Bouton pour  pour le menu -->
        <q-btn
        v-if="showMenu"
        flat
        dense icon="menu"
        @click="drawer = !drawer" />
      <!--  <q-toolbar-title  v-if="showMenu">Gestion de Stock</q-toolbar-title>-->

      <!-- C'est pour afficher le titre differents-->
        <q-toolbar-title class="absolute-center">
        {{ title }}
        </q-toolbar-title>
      <!-- Bouton  pour login -->
       <q-btn
        v-if="showLoginButton"
        to="/login"
        class="absolute-right q-pr-sm"
        icon="account_circle"
        no-caps
        flat
        label="Login"
      />


 <!-- Lien vers la bouton de deconnexion -->
    <q-bar
    v-if="showButton"
      color="primary"
      class="absolute-right q-pr-md q-mt-sm"
       >
       <q-btn
        no-caps
        flat
        label="Login"
        icon="account_circle"
        />

        <q-menu>
          <q-list dense style="min-width: 120px">
            <q-item clickable v-close-popup>
              <q-item-section>Infos</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup  to="/login">
              <q-item-section >Deconnexion</q-item-section>
            </q-item>
            </q-list>
            </q-menu>
            </q-bar>


      </q-toolbar>
      <div class="q-px-lg q-pt-xl q-mb-md">
      <!--  <div class="text-subtitlel">{{ todaysDate }}</div>-->
      </div>
    </q-header>

 <!-- Menu latéral -->

 <q-drawer show-if-above v-model="drawer" side="left"
           bordered v-if="showMenu" :width="300" :breakpoint="600">
      <q-list>
        <!--  <q-img class="q-ml-md q-mt-md" src="../assets/Frame_101-removebg-preview.png" style="max-width: 100px;" />-->

         <!-- Lien vers la page dashboard -->
        <q-item clickable v-ripple to="/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Tableau de Bord</q-item-section>
          </q-item>

         <!-- Lien vers la page profil -->
         <q-item clickable v-ripple to="/profil">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>Profil</q-item-section>
         </q-item>
       <!-- Lien vers la page Client-->
         <q-item clickable v-ripple to="/biens">
           <q-item-section avatar>
            <q-icon name="assessment" />
            </q-item-section>
            <q-item-section>Biens</q-item-section>
          </q-item>

           <!-- Gestion des Produits -->
           <q-item clickable v-ripple to="/contrats">
          <q-item-section avatar>
            <q-icon name="inventory" />
          </q-item-section>
          <q-item-section>Contrats</q-item-section>
        </q-item>
         <!-- Ajout des des versements-->
       <!-- <q-item clickable v-ripple to="/factures">
          <q-item-section avatar>
            <q-icon name="add_box" />
          </q-item-section>
          <q-item-section>Factures</q-item-section>
        </q-item>-->

        <!-- Gesttion des locataires  <q-icon name="shopping_cart" /> -->
        <q-item clickable v-ripple to="/locataires">
          <q-item-section avatar>
            <q-icon name="sync_alt" />
          </q-item-section>
          <q-item-section>Locataires</q-item-section>
        </q-item>
          <!-- gestion des paiements-->
        <q-item clickable v-ripple to="/paiements">
          <q-item-section avatar>
            <q-icon name="post_add" />
          </q-item-section>
          <q-item-section>Paiements</q-item-section>
        </q-item>

        <!-- Proprietaires   <q-icon name="sync_alt" />  -->
        <q-item clickable v-ripple to="/proprietaires">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>Proprietaires</q-item-section>
        </q-item>

        <!-- Rapports et Mouvement entree -->
        <!-- <q-item clickable v-ripple to="/mesVersement">
          <q-item-section avatar>
            <q-icon name="arrow_downward" />
          </q-item-section>
          <q-item-section>Mes Versements</q-item-section>
        </q-item> -->


        <!-- la page des clients non payers  -->
       <!--  <q-item clickable v-ripple to="/nonPayer">
          <q-item-section avatar>
            <q-icon name="assessment" />
          </q-item-section>
          <q-item-section>Produits Impayés</q-item-section>
        </q-item>-->

     <!-- Rapports et Mouvement sortie -->
        <!-- <q-item clickable v-ripple to="/mouvement_stock/sortie">
          <q-item-section avatar>
            <q-icon name="arrow_upward" />
          </q-item-section>
          <q-item-section>Sortie de stock</q-item-section>
        </q-item>-->

        <!-- Paramètres de l'Application -->
        <!--  <q-item clickable v-ripple to="/parametre">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Paramètres</q-item-section>
        </q-item> -->
      </q-list>

    </q-drawer>

    <!-- lien pour les contenus general -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { date } from "quasar";
import { defineComponent } from 'vue'



export default defineComponent({
  name: 'MainLayout',

  data() {
    return {
      drawer: false, // Contrôle l'ouverture du menu latéral
    };
  },

  computed:{
    todaysDate() {
      // eslint-disable-next-line prefer-const
      let timeStamp = Date.now();
      return date.formatDate(timeStamp, "dddd D MMMM");
    },
    // eslint-disable-next-line vue/return-in-computed-property
    showMenu() {
        const pagesWithoutLogin = ['index','login']; // Pages où le bouton ne doit pas apparaître
        return !pagesWithoutLogin.includes(this.$route.name);
      },
    showButton() {
        const pagesWithoutLogin = ['index','login']; // Pages où le bouton ne doit pas apparaître
        return !pagesWithoutLogin.includes(this.$route.name);
      },
    showLoginButton() {
        const pagesWithoutLogin = ['login','profil','biens','contrats','factures','dashboard','locataires','paiements','proprietaires']; // Pages où le bouton ne doit pas apparaître
        return !pagesWithoutLogin.includes(this.$route.name);
      },
    // eslint-disable-next-line vue/return-in-computed-property
    title(){
      console.log(this.$route)
      const currentPath = this.$route.fullPath
      if (currentPath === '/login') return 'Login'
      else if (currentPath === '/profil') return 'Profils'
      else if (currentPath === '/dashboard') return 'Tableau de Bord'
      else if (currentPath==='/biens') return ' Biens'
      else if (currentPath==='/contrats') return ' Contrats'
      else if (currentPath==='/factures') return ' Factaires'
      else if (currentPath==='/locataires') return ' Locataires '
      else if (currentPath==='/paiements') return ' Paiements '
      else if (currentPath==='/proprietaires') return ' Proprietaires'







    },



  }
})
</script>

<style scoped>
.q-drawer {
  background-color: #f5f5f5;
}
.q-toolbar-title {
  font-weight: bold;
}

</style>

