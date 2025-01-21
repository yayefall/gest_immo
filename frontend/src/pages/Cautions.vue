<!-- eslint-disable vue/multi-word-component-names -->

<template>
  <q-page padding>
    <q-card>
      <q-toolbar>
        <q-btn
          label="Nouvelle Caution"
          color="primary"
          class="text-center"
          @click="openDialog"
        />
      </q-toolbar>

      <!-- QTable pour afficher la liste des cautions -->
      <q-table
        :rows="cautions"
        :columns="columns"
        row-key="caution_id"
        no-data-label="Aucune caution disponible"
        flat
        bordered
        :pagination="pagination"
        @update:pagination="val => pagination = val"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <!--  <q-btn
              title="Modifier"
              icon="edit"
              color="primary"
              @click="editCaution(props.row)"
            />-->
            <q-btn
              title="Supprimer"
              icon="delete"
              color="negative"
              @click="openDeleteDialog(props.row.caution_id)"
            />
          </q-td>
        </template>
      </q-table>

      <!-- Dialogue Modal -->
      <q-dialog v-model="isDialogOpen" persistent>
        <q-card style="width: 80vw; max-width: 600px; height: 70vh; max-height: 500px;">
          <q-card-section>
            <div class="text-h6 texte-center"> Nouvelle Caution</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="addCaution">
              <q-select
                v-model="cautionForm.contrat_id"
                :options="contrats"
                option-value="id"
                option-label="libelle"
                emit-value
                map-options
                label="Contrat"
                outlined
                @update:model-value="onContratChange"
              />

              <q-input
                v-model="cautionForm.loyer_mensuel"
                label="Loyer Mensuel"
                type="number"
                outlined
                required
                readonly
              />
              <q-input
                v-model="cautionForm.montant"
                label="Montant"
                type="number"
                required
                class="q-mb-md"
                outlined
              />
              <q-input
                v-model="cautionForm.date_depot"
                label="Date de Dépôt"
                type="date"
                required
                class="q-mb-md"
                outlined
              />
            </q-form>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Annuler" color="negative" @click="closeDialog" />
            <q-btn label="Ajouter" color="primary" @click="addCaution" />
          </q-card-actions>
        </q-card>
      </q-dialog>

  <!-- Dialogue Modal de suppression -->

      <q-dialog v-model="isDeleteDialogOpen" persistent>
        <q-card>
          <q-card-section class="text-h6">Confirmer la suppression</q-card-section>
          <q-card-section>
            <p>Êtes-vous sûr de vouloir supprimer cette caution ? Cette action est irréversible.</p>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn  label="Annuler" color="primary" @click="isDeleteDialogOpen = false" />
            <q-btn  label="Confirmer" color="negative" @click="confirmDelete" />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <!-- Dialogue Fin du Modal  -->

    </q-card>
  </q-page>
</template>

<script>
import axios from "axios";
import jsPDF from "jspdf";


export default {
  data() {
    return {
      isDeleteDialogOpen: false, // Contrôle de la boîte de dialogue de suppression
      cautionToDelete: null, //
      cautions: [],
      contrats: [],
      isDialogOpen: false,
      pagination: { rowsPerPage: 10 },
      columns: [
        { name: "caution_id", label: "Numéro", align: "left", field: "caution_id" },
        { name: "nom_locataire", label: "Locataire", align: "left", field: "nom_locataire" },
        { name: "loyer_mensuel", label: "Loyer Mensuel", align: "left", field: "loyer_mensuel" },
        { name: "montant", label: "Caution", align: "left", field: "montant" },
        {
          name: "date_depot",
          label: "Date de Dépôt",
          align: "left",
          field: "date_depot",
          format: val => new Date(val).toLocaleDateString(),
          sortable: true,
        },
        { name: "contrat_libelle", label: "Contrat", align: "left", field: "contrat_libelle" },
        { name: "actions", label: "Actions", align: "center" },
      ],
      cautionForm: {
        id: null,
        montant: 0,
        loyer_mensuel: 0,
        date_depot: "",
        contrat_id: "",
      },
    };
  },
  created() {
    this.fetchCautions();

  },
  methods: {
    onContratChange() {
      const contrat = this.contrats.find(c => c.id === this.cautionForm.contrat_id);
      this.cautionForm.loyer_mensuel = contrat ? contrat.loyer_mensuel : 0;
    },
    async fetchCautions() {
      try {
        const cautionsResponse = await axios.get("http://localhost:2000/api/cautions");
        this.cautions = cautionsResponse.data;

        const contratsResponse = await axios.get("http://localhost:2000/api/contrats");
        this.contrats = contratsResponse.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    },
    openDialog() {
      this.isDialogOpen = true;
    },
    closeDialog() {
      this.isDialogOpen = false;
      this.resetForm();
    },
    resetForm() {
      this.cautionForm = {
        id: null,
        montant: 0,
        loyer_mensuel: 0,
        date_depot: "",
        contrat_id: "",
      };
    },


    editCaution(caution) {
      this.cautionForm = { ...caution };
      this.openDialog();
    },

    // Fonction pour ouvrir la boîte de dialogue de confirmation
    openDeleteDialog(cautionId) {
      this.cautionToDelete = cautionId;
      this.isDeleteDialogOpen = true;
    },
    // Fonction pour confirmer la suppression
    async confirmDelete() {
      try {
        await axios.delete(`http://localhost:2000/api/cautions/${this.cautionToDelete}`);
        this.$q.notify({ type: "positive", message: "Caution supprimée avec succès !" });
        this.fetchCautions(); // Recharger les cautions
      } catch (error) {
        console.error("Erreur lors de la suppression de la caution :", error);
        this.$q.notify({ type: "negative", message: "Erreur lors de la suppression." });
      } finally {
        this.isDeleteDialogOpen = false; // Fermer la boîte de dialogue
        this.cautionToDelete = null;
      }
    },

   /* generateCautionReceipt(caution) {
  const doc = new jsPDF();

  // Ajouter une bordure autour du reçu
  doc.rect(10, 10, 190, 220);

  // Titre principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Reçu de Caution", 105, 20, { align: "center" });

  // Ligne de séparation sous le titre
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);

  // Section des informations générales
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Détails de la caution :", 20, 35);

  doc.setFont("helvetica", "italic");
  doc.text(`Numéro de Caution :`, 20, 45);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.caution_id || "N/A"}`, 70, 45);  // Ajout d'un fallback "N/A"

  doc.setFont("helvetica", "italic");
  doc.text(`Nom du Locataire :`, 20, 55);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.nom_locataire || "Inconnu"}`, 70, 55);  // Ajout d'un fallback "Inconnu"

  doc.setFont("helvetica", "italic");
  doc.text(`Montant de la Caution :`, 20, 65);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.montant ? caution.montant + " FCFA" : "Montant non défini"}`, 70, 65);

  doc.setFont("helvetica", "italic");
  doc.text(`Loyer Mensuel :`, 20, 75);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.loyer_mensuel ? caution.loyer_mensuel + " FCFA" : "Loyer non défini"}`, 70, 75);

  doc.setFont("helvetica", "italic");
  doc.text(`Date de Dépôt :`, 20, 85);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.date_depot ? new Date(caution.date_depot).toLocaleDateString() : "Date non définie"}`, 70, 85);

  doc.setFont("helvetica", "italic");
  doc.text(`Libellé du Contrat :`, 20, 95);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.contrat_libelle || "Libellé non défini"}`, 70, 95);

  // Ligne de séparation après les informations générales
  doc.setLineWidth(0.2);
  doc.line(20, 105, 190, 105);

  // Date et signature
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Date d'émission : ${new Date().toLocaleDateString()}`, 20, 115);

  doc.text("Signature :", 20, 130);
  doc.line(50, 130, 120, 130); // Ligne pour la signature

  // Pied de page
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("Merci pour votre confiance.", 105, 200, { align: "center" });

  // Sauvegarde du fichier
  const fileName = `Recu_Caution_${caution.nom_locataire || "Inconnu"}_${new Date(caution.date_depot).toLocaleDateString()}.pdf`;
  doc.save(fileName);
},*/

async addCaution() {
  try {
    let response;
    if (this.cautionForm.id) {
      // Mise à jour d'une caution existante
      response = await axios.put(
        `http://localhost:2000/api/cautions/${this.cautionForm.id}`, this.cautionForm );
      this.$q.notify({ type: "positive", message: "Caution mise à jour avec succès !" });
    } else {
      // Ajout d'une nouvelle caution
      response = await axios.post("http://localhost:2000/api/cautions", this.cautionForm);
      this.$q.notify({ type: "positive", message: "Caution ajoutée avec succès !" });

      // Génération du reçu uniquement pour une nouvelle caution
     this.generateCautionReceipt(response.data);

    }

    this.fetchCautions();
    this.closeDialog();
  } catch (error) {
    console.error("Erreur lors de l’ajout de la caution :", error);
    this.$q.notify({ type: "negative", message: "Erreur lors de l'ajout ou de la mise à jour." });
  }
},

generateCautionReceipt(caution) {
  console.log(caution);  // Afficher les données pour déboguer
  const doc = new jsPDF();

  // Ajouter une bordure autour du reçu
  doc.rect(10, 10, 190, 220);

   // Configuration de la page
   const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Titre principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Reçu de Caution", 105, 20, { align: "center" });

  // Ligne de séparation sous le titre
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);

  // Section des informations générales
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Détails de la caution :", 20, 35);

  doc.setFont("helvetica", "italic");
  doc.text(`Numéro de Caution :`, 20, 45);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.caution_id || "N/A"}`, 70, 45);  // Ajout d'un fallback "N/A"

  doc.setFont("helvetica", "italic");
  doc.text(`Nom du Locataire :`, 20, 55);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.nom_locataire || "Inconnu"}`, 70, 55);  // Ajout d'un fallback "Inconnu"

  doc.setFont("helvetica", "italic");
  doc.text(`Montant de la Caution :`, 20, 65);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.montant ? caution.montant + " FCFA" : "Montant non défini"}`, 70, 65);

  doc.setFont("helvetica", "italic");
  doc.text(`Loyer Mensuel :`, 20, 75);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.loyer_mensuel ? caution.loyer_mensuel + " FCFA" : "Loyer non défini"}`, 70, 75);

  doc.setFont("helvetica", "italic");
  doc.text(`Date de Dépôt :`, 20, 85);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.date_depot ? new Date(caution.date_depot).toLocaleDateString() : "Date non définie"}`, 70, 85);

  doc.setFont("helvetica", "italic");
  doc.text(`Libellé du Contrat :`, 20, 95);
  doc.setFont("helvetica", "bold");
  doc.text(`${caution.contrat_libelle || "Libellé non défini"}`, 70, 95);

  // Ligne de séparation après les informations générales
  doc.setLineWidth(0.2);
  doc.line(20, 105, 190, 105);

  // Date et signature
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Date d'émission : ${new Date().toLocaleDateString()}`, 20, 115);

  doc.text("Signature :", 20, 130);
  doc.line(50, 130, 120, 130); // Ligne pour la signature

  // Pied de page
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("Merci pour votre confiance.", 105, 200, { align: "center" });

  // Sauvegarde du fichier
  const fileName = `Recu_Caution_${caution.nom_locataire || "Inconnu"}_${new Date(caution.date_depot).toLocaleDateString()}.pdf`;
  doc.save(fileName);
},







  },

};
</script>

<style scoped>
.q-btn {
  margin-right: 10px;
}
</style>
