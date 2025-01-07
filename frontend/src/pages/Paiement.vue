<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page padding>
    <q-card>
      <q-toolbar>
        <q-btn
          label="Nouveau Paiement"
          color="primary"
          class="text-center"
          @click="openAddDialog"
        />
      </q-toolbar>

      <q-table
        :rows="paiements"
        :columns="columns"
        row-key="id"
        no-data-label="Aucun paiement disponible"
        flat
        bordered
        :pagination="pagination"
        @update:pagination="val => pagination = val"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              class="text-center q-mx-sm"
              title="Modifier le paiement"
              icon="edit"
              color="primary"
              @click="editPaiement(props.row)"
            />
            <q-btn
              title="Supprimer le paiement"
              icon="delete"
              color="negative"
              @click="deletePaiement(props.row.id)"
            />
          </q-td>
        </template>
        <template v-slot:top-right>
          <q-btn
            class="q-mx-sm"
            title="Exporter en fichier Excel"
            color="primary"
            icon-right="archive"
            no-caps
            @click="exportTable"
          />
          <q-btn
            title="Télécharger en fichier PDF"
            color="primary"
            icon="picture_as_pdf"
            no-caps
            @click="exportToPDF"
          />
        </template>
      </q-table>

      <q-dialog v-model="isDialogOpen">
        <q-card style="width: 80vw; max-width: 600px;">
          <q-card-section>
            <div class="text-h6">{{ dialogTitle }}</div>
          </q-card-section>
          <q-card-section>
            <q-select
              v-model="paiementForm.contrat_id"
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
              v-model="paiementForm.montant_total"
              label="Loyer Mensuel"
              type="number"
              outlined
              required
              readonly
            />
            <q-input
              v-model="paiementForm.montant_paye"
              label="Montant Payé"
              type="number"
              outlined
              required
            />
            <q-input
              v-model="paiementForm.date_paiement"
              label="Date de Paiement"
              type="date"
              outlined
              required
            />

            <q-select
              v-model="paiementForm.mois"
              :options="moisOptions"
              label="Mois payé"
              outlined
              multiple
              emit-value
              map-options
              clearable
              required
              @input="onMoisChange"
            />
            <q-input
              v-model="paiementForm.montant_restant"
              label="Montant Restant"
              outlined
              readonly
            />
            <q-select
              v-model="paiementForm.methode_paiement"
              :options="['Espèces','Orange Money','Wave']"
              label="Méthode de Paiement"
              outlined
              required
            />
            <q-select
              v-model="paiementForm.statut"
              :options="['payé', 'avance']"
              label="Statut"
              outlined
              required
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Annuler" color="negative" @click="isDialogOpen = false" />
            <q-btn label="Enregistrer" color="primary" @click="savePaiement" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </q-page>
</template>
<script>
import axios from "axios";
import { exportFile } from "quasar";
import jsPDF from "jspdf";
import "jspdf-autotable";

function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? '' : String(formatted);
  return `"${formatted.split('"').join('""')}"`;
}
export default {
  created() {
    this.fetchPaiements();
    this.fetchContrats();
    this.fetchLocataires();
  },
  data() {
    return {
      locataires: [],
      paiements: [],
      contrats: [],
      mois: [],
      columns: [
        { name: "libelle", label: "Contrat", align: "left", field: "libelle" },
        { name: "nom_locataire", label: "Locataire", align: "left", field: "nom_locataire" },
        { name: "montant_total", label: "Loyer Mensuel", align: "left", field: "montant_total" },
        { name: "montant_paye", label: "Montant Payé", align: "left", field: "montant_paye" },
        { name: "mois", label: "Mois", align: "left", field: "mois", format: val => (Array.isArray(val) ? val.join(", ") : val) },
        { name: "montant_restant", label: "Montant Restant", align: "left", field: "montant_restant" },
        { name: 'date_paiement', label: 'Date de Paiement', align: 'left', field: 'date_paiement', format: val => new Date(val).toLocaleDateString(), sortable: true },
        { name: "methode_paiement", label: "Méthode de Paiement", align: "left", field: "methode_paiement" },
        { name: "statut", label: "Statut", align: "left", field: "statut" },
        { name: "actions", label: "Actions", align: "center" },
      ],
      pagination: { page: 1, rowsPerPage: 10 },
      isDialogOpen: false,
      dialogTitle: "Ajouter Paiement",
      paiementForm: {
        contrat_id: null,
        montant_paye: 0,
        montant_restant: 0,
        montant_total: 0,  // Champ pour le montant total
        date_paiement: "",
        methode_paiement: "",
        statut: "",
        mois: [],
      },
      moisOptions: [
        { label: "Janvier", value: "01" },
        { label: "Février", value: "02" },
        { label: "Mars", value: "03" },
        { label: "Avril", value: "04" },
        { label: "Mai", value: "05" },
        { label: "Juin", value: "06" },
        { label: "Juillet", value: "07" },
        { label: "Août", value: "08" },
        { label: "Septembre", value: "09" },
        { label: "Octobre", value: "10" },
        { label: "Novembre", value: "11" },
        { label: "Décembre", value: "12" },
      ],
    };
  },

  methods: {

  // Quand un contrat est sélectionné
  onContratChange() {
      const contrat = this.contrats.find(c => c.id === this.paiementForm.contrat_id);
      if (contrat) {
        this.paiementForm.montant_total = contrat.montant_total;
        this.calculateMontantRestant();  // Recalcule le montant restant
      }
    },

    // Quand un ou plusieurs mois sont sélectionnés
    onMoisChange() {
      this.calculateMontantRestant();  // Recalcule le montant restant à chaque changement
    },

    // Calcul du montant total en fonction des mois sélectionnés
    calculateMontantRestant() {
      if (this.paiementForm.mois.length >= 2) {
        const contrat = this.contrats.find(c => c.id === this.paiementForm.contrat_id);
        if (contrat) {
          this.paiementForm.montant_total = contrat.montant_total * this.paiementForm.mois.length;
        }
      }
    },
    // ajouter un paiement

 async savePaiement() {
   try {
    // Vérifier le contrat sélectionné
    const contrat = this.contrats.find(c => c.id === this.paiementForm.contrat_id);
    if (!contrat) {
      this.$q.notify({ type: 'negative', message: 'Contrat introuvable.' });
      return;
    }

    if (!contrat.montant_total) {
      this.$q.notify({ type: 'negative', message: 'Montant total du contrat introuvable.' });
      return;
    }

    // Validation du montant payé
    if (!this.paiementForm.montant_paye || isNaN(parseFloat(this.paiementForm.montant_paye))) {
      this.$q.notify({ type: 'negative', message: 'Le montant payé doit être un nombre valide.' });
      return;
    }

    // Calcul du montant restant
    const montantRestant = parseFloat(contrat.montant_total) - parseFloat(this.paiementForm.montant_paye);
    this.paiementForm.montant_restant = montantRestant;

    // Vérification de la validité de "mois"
    if (!this.paiementForm.mois || (Array.isArray(this.paiementForm.mois) && this.paiementForm.mois.length === 0)) {
      this.$q.notify({ type: 'negative', message: 'Veuillez sélectionner un mois valide.' });
      return;
    }

    // Récupérer les informations du locataire
    const locataireResponse = await axios.get(`http://localhost:2000/api/locataires/${contrat.locataire_id}`);
    if (!locataireResponse.data || !locataireResponse.data.nomComplet) {
      this.$q.notify({ type: 'negative', message: 'Nom du locataire introuvable.' });
      return;
    }

    const locataire = {
      id: contrat.locataire_id,
      nomComplet: locataireResponse.data.nomComplet,
    };

    // Préparer les données du paiement
    const paiement = {
      ...this.paiementForm,
      locataire_id: contrat.locataire_id,
      nom_locataire: locataire.nomComplet,
      mois: Array.isArray(this.paiementForm.mois)
        ? this.paiementForm.mois.join(",")
        : this.paiementForm.mois,
      //statut: montantRestant > 0 ? 'avance' : 'payé',
      statut: this.paiementForm.montant_paye < this.paiementForm.montant_total ? "avance" : "payé",
    };

    // Envoyer les données au serveur
    const response = await axios.post('http://localhost:2000/api/paiement', paiement);

    // Notification de succès
    this.$q.notify({ type: 'positive', message: 'Paiement ajouté avec succès !' });
    this.isDialogOpen = false;

    // Actualiser la liste des paiements
    await this.fetchPaiements();

    // Générer automatiquement la facture
    this.generateInvoice({
      ...paiement,
      contrat_libelle: contrat.libelle,
    });

  } catch (error) {
    console.error("Erreur lors de l'ajout du paiement :", error);

    if (error.response) {
      this.$q.notify({
        type: 'negative',
        message: error.response.data.message || "Erreur lors de l'ajout du paiement.",
      });
    } else {
      this.$q.notify({ type: 'negative', message: "Erreur réseau. Veuillez réessayer." });
    }
  }
},

    async savePaiements() {
      try {
        // Vérifier le contrat sélectionné
        const contrat = this.contrats.find(c => c.id === this.paiementForm.contrat_id);
        if (!contrat) {
          this.$q.notify({ type: 'negative', message: 'Contrat introuvable.' });
          return;
        }

        // Calculer automatiquement le montant restant
        const montantRestant = contrat.montant_total - this.paiementForm.montant_paye;
        this.paiementForm.montant_restant = montantRestant;

        // Faire une requête pour récupérer les informations du locataire à partir de locataire_id
        const locataireResponse = await axios.get(`http://localhost:2000/api/locataires/${contrat.locataire_id}`);

        if (!locataireResponse.data || !locataireResponse.data.nomComplet) {
          this.$q.notify({ type: 'negative', message: 'Nom du locataire introuvable.' });
          return;
        }

        // Ajouter les informations du locataire dans le paiement
        const locataire = {
          id: contrat.locataire_id,
          nomComplet: locataireResponse.data.nomComplet // Nom complet du locataire récupéré
        };

        // Préparer les données du paiement
        const paiement = {
          ...this.paiementForm,
          locataire_id: contrat.locataire_id, // ID du locataire
          nom_locataire: locataire.nomComplet, // Nom du locataire
          mois: Array.isArray(this.paiementForm.mois)
            ? this.paiementForm.mois.join(",")
            : this.paiementForm.mois,
        };

        console.log("Données envoyées au serveur :", paiement);

        // Si le statut est "payé partiellement", ajuster le montant restant
        if (paiement.statut === 'avance') {
          const montantRestant = contrat.montant_total - paiement.montant_paye;
          paiement.montant_restant = montantRestant;
        }

        // Envoyer les données au serveur
        const response = await axios.post('http://localhost:2000/api/paiement', paiement);
        console.log(response);
        // Notification de succès
        this.$q.notify({ type: 'positive', message: 'Paiement ajouté avec succès !' });
        this.isDialogOpen = false;

        // Actualiser la liste des paiements
        await this.fetchPaiements();

        // Générer automatiquement la facture
        this.generateInvoice({
          ...paiement,
          contrat_libelle: contrat.libelle,
        });

      } catch (error) {
        console.error("Erreur lors de l'ajout du paiement :", error);

        // Gestion des erreurs de réponse serveur
        if (error.response) {
          this.$q.notify({
            type: 'negative',
            message: error.response.data.message || "Erreur lors de l'ajout du paiement.",
          });
        } else {
          // Erreur réseau ou autre
          this.$q.notify({ type: 'negative', message: "Erreur réseau. Veuillez réessayer." });
        }
      }
    },

    // Génération de la facture

    generateInvoice(paiement) {
     const doc = new jsPDF();

  // Configuration de la page
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // En-tête de la facture
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE DE PAIEMENT", pageWidth / 2, 20, { align: "center" });

  // Sous-en-tête
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Date : ${new Date().toLocaleDateString()}`, 20, 30);

  // Cadre des informations
  doc.setDrawColor(0); // Couleur de bordure noire
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 40, pageWidth - 60, 80, 10, 10);

  // Informations sur le paiement
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Locataire : ${paiement.nom_locataire}`, 20, 50);
  doc.text(`Date de Paiement : ${new Date(paiement.date_paiement).toLocaleDateString()}`, 20, 60);
  doc.text(`Montant Total : ${paiement.montant_total} FCFA`, 20, 70);
  doc.text(`Montant Payé : ${paiement.montant_paye} FCFA`, 20, 80);
  doc.text(`Montant Restant : ${paiement.montant_restant} FCFA`, 20, 90);
  doc.text(`Mois Payé : ${paiement.mois}`, 20, 100);
  doc.text(`Méthode de Paiement : ${paiement.methode_paiement}`, 20, 110);

  // Table des détails (si applicable)
  // Ajouter un cadre pour de futurs détails ou tableaux si besoin

  // Signature
  doc.setFontSize(12);
  doc.text("Signature :", 20, 130);

  // Pied de page
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Merci pour votre paiement.", pageWidth / 2, pageHeight - 20, { align: "center" });

  // Sauvegarde du fichier
  const fileName = `Facture_${paiement.nom_locataire}_${new Date(paiement.date_paiement).toLocaleDateString()}.pdf`;
  doc.save(fileName);

  this.$q.notify({
    type: "positive",
    message: "Facture générée avec succès."
  });
},



    async fetchPaiements() {
      try {
        const response = await axios.get('http://localhost:2000/api/paiement');
        this.paiements = response.data.map(paiement => {
          const locataire = this.locataires.find(l => l.id === paiement.locataire_id);
          return {
            ...paiement,
            nomComplet: locataire ? locataire.nomComplet : 'Inconnu' // Ajouter le nom du locataire
          };
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des paiements :', error);
      }
    },

    async fetchLocataires() {
      try {
        const response = await axios.get('http://localhost:2000/api/locataires');
        this.locataires = response.data.map(locataire => ({
          id: locataire.id,
          nomComplet: locataire.nomComplet, // Nom du locataire
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des contrats :', error);
      }
    },

    async fetchContrats() {
      try {
        const response = await axios.get('http://localhost:2000/api/contrats');
        this.contrats = response.data.map(contrat => ({
          id: contrat.id,
          libelle: contrat.libelle, // Libellé du contrat
          locataire_id: contrat.locataire_id, // ID du locataire
          montant_total: contrat.loyer_mensuel // Montant total du contrat
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des contrats :', error);
      }
    },

    openAddDialog() {
      this.dialogTitle = "Ajouter Paiement";
      this.paiementForm = {
        contrat_id: null,
        montant_paye: 0,
        montant_restant: 0,
        montant_total: 0,  // Champ pour le montant total
        date_paiement: "",
        methode_paiement: "",
        statut: "",
        mois: [],
      };
      this.isDialogOpen = true;
    },

    editPaiement(paiement) {
      this.dialogTitle = 'Modifier Paiement';
      this.paiementForm = { ...paiement };
      this.isDialogOpen = true;
    },


    async deletePaiement(id) {
  console.log('ID reçu pour suppression :', id);

  // Vérification de l'ID
  if (!id || typeof id !== 'number') {
    this.$q.notify({ type: 'negative', message: 'ID du paiement invalide. Impossible de supprimer.' });
    return;
  }

  try {
    // Demande de confirmation
    const confirmed = await this.$q.dialog({
      title: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer ce paiement ?',
      ok: { label: 'Oui', color: 'negative' },
      cancel: { label: 'Non', color: 'primary' },
      persistent: true,
    }).onOk(() => true).onCancel(() => false);

    // Si l'utilisateur confirme la suppression
    if (confirmed) {
      await axios.delete(`http://localhost:2000/api/paiement/${id}`);
      this.paiements = this.paiements.filter(p => p.id !== id); // Mise à jour locale
      this.$q.notify({ type: 'positive', message: 'Paiement supprimé avec succès.' });
    } else {
      this.$q.notify({ type: 'info', message: 'Suppression annulée.' });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du paiement :", error);

    // Gestion des erreurs
    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        this.$q.notify({ type: 'negative', message: 'Paiement introuvable. Suppression impossible.' });
      } else if (status === 401 || status === 403) {
        this.$q.notify({ type: 'negative', message: 'Vous n\'êtes pas autorisé à effectuer cette action.' });
      } else {
        this.$q.notify({ type: 'negative', message: 'Une erreur est survenue lors de la suppression.' });
      }
    } else {
      this.$q.notify({ type: 'negative', message: 'Erreur réseau. Veuillez réessayer.' });
    }
  }
},

   exportTable() {
      const rows = this.paiements;
      const columns = this.columns.filter(col => col.name !== 'actions');
      const content = [
        columns.map(col => wrapCsvValue(col.label)),
        ...rows.map(row =>
          columns.map(col =>
            wrapCsvValue(typeof col.field === 'function' ? col.field(row) : row[col.field || col.name])
          ).join(',')
        )
      ].join('\r\n');
      exportFile('Paiement-export.csv', content, 'text/csv');
    },
    exportToPDF() {
      if (!this.paiements || this.paiements.length === 0) {
        this.$q.notify({ message: 'Aucune donnée à exporter.', color: 'negative', icon: 'warning' });
        return;
      }
      const doc = new jsPDF();
      const columns = this.columns.filter(col => col.name !== 'actions').map(col => ({ header: col.label, dataKey: col.name }));
      const rows = this.paiements.map(paiement => {
        const row = {};
        this.columns.forEach(col => {
          if (col.name !== 'actions') {
            row[col.name] = typeof col.field === 'function' ? col.field(paiement) : paiement[col.field || col.name];
          }
        });
        return row;
      });
      doc.text('Liste des Paiements', 14, 10);
      doc.autoTable({ columns, body: rows, startY: 20, theme: 'grid' });
      doc.save('Paiements-export.pdf');
    }

  },
};
</script>
