<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-layout view="hHh lpR fFf">
    <!-- Contenu principal du tableau de bord -->
    <q-page-container>
      <q-page class="q-pa-md q-mt-md">
        <!-- Cartes de Statistiques -->
        <div class="row q-col-gutter-md">
          <q-card class="col-12 col-md-4 text-center bg-primary text-white">
            <q-card-section>
              <div class="text-h6">Locataires</div>
              <div class="text-caption">{{ stats.locataire }}</div>
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-4 text-center bg-secondary text-white ">
            <q-card-section>
              <div class="text-h6">Paiement</div>
              <div class="text-caption">{{ stats.paiement }}</div>
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-4 text-center bg-accent text-white">
            <q-card-section>
              <div class="text-h6">Revenue</div>
              <div class="text-caption">{{ stats.revenue }}</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Section de Graphiques -->
        <div class="row q-mt-md">
          <div class="col-12 col-md-6">
            <q-card>
              <q-card-section>
                <div class="text-h6"> Trafic des Locataires</div>
                <canvas id="monthlySalesChart"></canvas>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <q-card>
              <q-card-section>
                <div class="text-h6"> Paiement Mensuelles </div>
                <canvas id="userTrafficChart"></canvas>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import axios from "axios";
import { Chart, BarController, LineController, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement } from "chart.js";

// Enregistrer les composants de Chart.js
Chart.register(BarController, LineController, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement);

export default {
  data() {
    return {
      stats: {
        locataire: 0,
        revenue: 0,
        paiement: 0,
      },
      salesData: [], // Données pour les ventes mensuelles
      userTrafficData: [], // Données pour le trafic utilisateur
    };
  },
  methods: {
    async fetchDashboardData() {
      try {
        // Appel à l'API pour récupérer les statistiques globales
        console.log("Fetching stats...");
    const statsResponse = await axios.get("http://localhost:2000/api/stats");
    console.log("les statiques Response:", statsResponse.data);
    this.stats = statsResponse.data;
 // Appel à l'API pour récupérer les commandes globales
    console.log("Fetching sales data...");
    const salesResponse = await axios.get("http://localhost:2000/api/paiement");
    console.log("les commandes Response:", salesResponse.data);
    this.salesData = salesResponse.data;
 // Appel à l'API pour récupérer les clients globales
    console.log("Fetching user traffic data...");
    const trafficResponse = await axios.get("http://localhost:2000/api/locataires");
    console.log("les Clients Traffic Response:", trafficResponse.data);
    this.userTrafficData = trafficResponse.data;


        // Initialisation des graphiques après récupération des données
        this.initCharts();
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    },

    initCharts() {
      // Ventes Mensuelles
      const monthlySalesCtx = document.getElementById("monthlySalesChart").getContext("2d");
      // eslint-disable-next-line no-new
      new Chart(monthlySalesCtx, {
        type: "bar",
        data: {
          labels: this.salesData.map((item) => item.month),
          datasets: [
            {
              label: "Locataires ",
              data: this.salesData.map((item) => item.total_locataires),
              backgroundColor: "#42A5F5",
            },
          ],
        },
        options: { responsive: true },
      });

      // Trafic des Utilisateurs
      const userTrafficCtx = document.getElementById("userTrafficChart").getContext("2d");
      // eslint-disable-next-line no-new
      new Chart(userTrafficCtx, {
        type: "line",
        data: {
          labels: this.userTrafficData.map((item) => item.month),
          datasets: [
            {
              label: "Paiement (cfa)",
              data: this.userTrafficData.map((item) => item.total),
              borderColor: "#66BB6A",
              fill: false,
            },
          ],
        },
        options: { responsive: true },
      });
    },
  },
  mounted() {
    this.fetchDashboardData(); // Récupérer les données à partir de l'API
  },
};
</script>

<style scoped>
.q-page {
  background-color: #f9f9f9;
}
.q-card {
  padding: 16px;
}
</style>
