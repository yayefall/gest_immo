<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page padding>
    <q-card>
      <q-toolbar>
        <q-btn label="Ajouter Propriétaire" color="primary" @click="openAddDialog" />
      </q-toolbar>

      <q-table
        :rows="proprietaires"
        :columns="columns"
        row-key="id"
        no-data-label="Aucun propriétaire disponible"
        flat
        bordered
        :pagination="pagination"
        @update:pagination="val => pagination = val"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              class="q-mx-sm"
              icon="edit"
              color="primary"
              @click="editProprietaire(props.row)"
            />
            <q-btn
              icon="delete"
              color="negative"
              @click="deleteProprietaire(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>

      <q-dialog v-model="isDialogOpen">
        <q-card style="width: 80vw; max-width: 600px; height: 70vh; max-height: 500px;">
          <q-card-section>
            <div class="text-h6 text-center">{{ dialogTitle }}</div>
          </q-card-section>

          <q-card-section>
            <q-input v-model="proprietaireForm.nomComplet" flat label="Nom" />
            <q-input v-model="proprietaireForm.email" label="Email" />
            <q-input v-model="proprietaireForm.telephone" label="Téléphone" type="tel" />
            <q-input v-model="proprietaireForm.adresse" label="Adresse" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Annuler" color="negative" @click="isDialogOpen = false" />
            <q-btn label="Sauvegarder" color="primary" @click="saveProprietaire" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </q-page>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      proprietaires: [],
      columns: [
        { name: "id", label: "Numero", align: "left", field: "id", sortable: true },
        { name: "nomComplet", label: "Nom", align: "left", field: "nomComplet" },
        { name: "email", label: "Email", align: "left", field: "email" },
        { name: "telephone", label: "Téléphone", align: "left", field: "telephone" },
        { name: "adresse", label: "Adresse", align: "left", field: "adresse" },
        { name: "actions", label: "Actions", align: "center" },
      ],
      pagination: { page: 1, rowsPerPage: 10 },
      isDialogOpen: false,
      dialogTitle: "Ajouter Propriétaire",
      proprietaireForm: {
        id: null,
        nomComplet: "",
        email: "",
        telephone: "",
        adresse: "",
      },
    };
  },
  created() {
    this.fetchProprietaires();
  },
  methods: {
    async fetchProprietaires() {
      try {
        const response = await axios.get("http://localhost:2000/api/proprietaires");
        this.proprietaires = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des propriétaires :", error);
      }
    },
    openAddDialog() {
      this.dialogTitle = "Ajouter Propriétaire";
      this.proprietaireForm = {
        id: null,
        nomComplet: "",
        email: "",
        telephone: "",
        adresse: "",
      };
      this.isDialogOpen = true;
    },
    editProprietaire(proprietaire) {
      this.dialogTitle = "Modifier Propriétaire";
      this.proprietaireForm = { ...proprietaire };
      this.isDialogOpen = true;
    },
    async saveProprietaire() {
      try {
        if (this.proprietaireForm.id) {
          await axios.put(`http://localhost:2000/api/proprietaires/${this.proprietaireForm.id}`, this.proprietaireForm);
        } else {
          await axios.post("http://localhost:2000/api/proprietaires", this.proprietaireForm);
        }
        this.isDialogOpen = false;
        this.fetchProprietaires();
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du propriétaire :", error);
      }
    },
    async deleteProprietaire(id) {
      try {
        const confirmed = await new Promise((resolve) => {
          this.$q
            .dialog({
              title: "Confirmation",
              message: "Êtes-vous sûr de vouloir supprimer ce propriétaire ?",
              ok: { label: "Confirmer", color: "negative" },
              cancel: { label: "Annuler", color: "primary" },
              persistent: true,
            })
            .onOk(() => resolve(true))
            .onCancel(() => resolve(false));
        });

        if (confirmed) {
          await axios.delete(`http://localhost:2000/api/proprietaires/${id}`);
          this.$q.notify({ type: "positive", message: "Propriétaire supprimé avec succès." });
          this.fetchProprietaires();
        }
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        this.$q.notify({ type: "negative", message: "Erreur lors de la suppression du propriétaire." });
      }
    },
  },
};
</script>

<style scoped>
/* Ajoutez des styles personnalisés si nécessaire */
</style>
