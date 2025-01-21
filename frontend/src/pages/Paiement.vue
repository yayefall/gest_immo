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
           <!-- <q-btn
              class="text-center q-mx-sm"
              title="Modifier le paiement"
              icon="edit"
              color="primary"
              @click="editPaiement(props.row)"
            />-->
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
              @update:model-value="onMoisChange"
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
              v-model="paiementForm.methode_paiement"
              :options="['Espèces','Orange Money','Wave']"
              label="Méthode de Paiement"
              outlined
              required
            />
            <q-select
              v-model="paiementForm.statut"
              :options="['payé', 'avance','payer_plus']"
              label="Statut"
              outlined
              required
            />
            <q-input
              v-model="paiementForm.montant_restant"
              label="Montant Restant"
              outlined
              readonly
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
      pagination: { page: 1, rowsPerPage: 5 },
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
        this.calculateMontantTotal();  // Recalcule le montant restant
      }
    },

    // Quand un ou plusieurs mois sont sélectionnés
    onMoisChange() {
      this.calculateMontantTotal();  // Recalcule le montant restant à chaque changement
    },

    // Calcul du montant total en fonction des mois sélectionnés
    calculateMontantTotal() {
  const contrat = this.contrats.find(c => c.id === this.paiementForm.contrat_id);
  if (!contrat) {
    this.$q.notify({ type: 'negative', message: 'Contrat introuvable.' });
    return;
  }

  // Vérifier si des mois sont sélectionnés
  const moisSelectionnes = Array.isArray(this.paiementForm.mois) ? this.paiementForm.mois.length : 0;

  if (moisSelectionnes > 0) {
    // Calculer le montant total en fonction du nombre de mois sélectionnés
    this.paiementForm.montant_total = contrat.montant_total * moisSelectionnes;
  } else {
    // Réinitialiser le montant total si aucun mois n'est sélectionné
    this.paiementForm.montant_total = contrat.montant_total;
  }
},

    // ajouter un paiement

    async savePaiement() {
    try {
    const contrat = this.contrats.find(c => c.id === this.paiementForm.contrat_id);
    if (!contrat) {
      return this.$q.notify({ type: 'negative', message: 'Contrat introuvable.' });
    }

    const montantPaye = parseFloat(this.paiementForm.montant_paye);
    if (isNaN(montantPaye) || montantPaye <= 0) {
      return this.$q.notify({ type: 'negative', message: 'Le montant payé doit être un nombre valide supérieur à zéro.' });
    }

    // Calculer le montant total en fonction des mois sélectionnés
    this.calculateMontantTotal();

    const montantTotal = parseFloat(this.paiementForm.montant_total);

    const statut = this.paiementForm.statut;
    if (!['avance', 'payé', 'payer_plus'].includes(statut)) {
      return this.$q.notify({ type: 'negative', message: 'Statut de paiement invalide.' });
    }

    // Calculer le montant restant ou le surplus
    let montantRestant = 0;
    if (statut === 'avance') {
      montantRestant = montantTotal - montantPaye;
      if (montantRestant < 0) {
        return this.$q.notify({ type: 'negative', message: 'Le montant payé dépasse le montant total pour une avance.' });
      }
    } else if (statut === 'payé') {
      if (montantPaye !== montantTotal) {
        return this.$q.notify({ type: 'negative', message: 'Pour payer entièrement, le montant payé doit être égal au montant total.' });
      }
      montantRestant = 0;
    } else if (statut === 'payer_plus') {
      montantRestant = montantPaye - montantTotal;
      if (montantRestant <= 0) {
        return this.$q.notify({ type: 'negative', message: 'Pour payer plus, le montant payé doit dépasser le montant total.' });
      }
    }

    const locataireResponse = await axios.get(`http://localhost:2000/api/locataires/${contrat.locataire_id}`);
    const locataire = locataireResponse.data;
    if (!locataire || !locataire.nomComplet) {
      return this.$q.notify({ type: 'negative', message: 'Nom du locataire introuvable.' });
    }

    const paiement = {
      ...this.paiementForm,
      locataire_id: contrat.locataire_id,
      nom_locataire: locataire.nomComplet,
      mois: Array.isArray(this.paiementForm.mois) ? this.paiementForm.mois.join(",") : this.paiementForm.mois,
      montant_restant: statut === 'payer_plus' ? null : montantRestant, // `null` si "payer_plus"
      montant_surplus: statut === 'payer_plus' ? montantRestant : null, // Montant surplus si "payer_plus"
      statut,
    };

    const response = await axios.post('http://localhost:2000/api/paiement', paiement);

    this.$q.notify({ type: 'positive', message: 'Paiement enregistré avec succès !' });
    this.isDialogOpen = false;
    await this.fetchPaiements();

    this.generateInvoice({
      ...paiement,
      contrat_libelle: contrat.libelle,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du paiement :", error);
    const message = error.response?.data?.message || 'Erreur réseau. Veuillez réessayer.';
    this.$q.notify({ type: 'negative', message });
  }
},



    // Génération de la facture
generateInvoice(paiement) {
  const doc = new jsPDF();

   // Ajouter une bordure autour du reçu
  doc.rect(10, 10, 190, 250);

  // Configuration de la page
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Titre de la facture
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE DE PAIEMENT", pageWidth / 2, 20, { align: "center" });

  // Ligne de séparation sous le titre
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(20, 25, pageWidth - 20, 25);

  // Informations générales (Locataire et Date)
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Facturé à : ${paiement.nom_locataire}`, 20, 35);
  doc.text(`Date : ${new Date().toLocaleDateString()}`, pageWidth - 70, 35, { align: "right" });

  // Encadré des détails de paiement
  doc.setDrawColor(0); // Couleur de bordure noire
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 45, pageWidth - 30, 100, 5, 5);

  // Titre des détails de paiement
  doc.setFont("helvetica", "bold");
  doc.text("Détails du paiement :", 20, 55);

  // Détails du paiement
  doc.setFont("helvetica", "normal");
  doc.text(`Date de Paiement : ${new Date(paiement.date_paiement).toLocaleDateString()}`, 20, 65);
  doc.text(`Mois Payé : ${paiement.mois}`, 20, 75);
  doc.text(`Méthode de Paiement : ${paiement.methode_paiement}`, 20, 85);
  doc.text(`Loyer Mensuel : ${paiement.montant_total} FCFA`, 20, 95);
  doc.text(`Montant Payé : ${paiement.montant_paye} FCFA`, 20, 105);

  // Afficher les montants spécifiques selon le statut
  if (paiement.statut === "avance") {
    doc.text(`Montant Restant : ${paiement.montant_restant} FCFA`, 20, 115);
  } else if (paiement.statut === "payer_plus") {
    doc.text(`Montant Surplus : ${paiement.montant_paye - paiement.montant_total} FCFA`, 20, 115);
  }

  // Ligne de séparation entre les sections
  doc.setLineWidth(0.2);
  doc.line(20, 125, pageWidth - 20, 125);

  // Section de signature
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Signature :", 20, 140);
  doc.line(50, 140, 120, 140); // Ligne pour la signature

  // Pied de page
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Merci pour votre paiement. Votre fidélité nous est précieuse.", pageWidth / 2, pageHeight - 20, { align: "center" });

  // Sauvegarde du fichier
  const fileName = `Facture_${paiement.nom_locataire}_${new Date(paiement.date_paiement).toLocaleDateString()}.pdf`;
  doc.save(fileName);

  // Notification de succès
  this.$q.notify({
    type: "positive",
    message: "Facture générée avec succès."
  });
},


// lister tous les paiements
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
//lister tous les contrats
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
// lister les tous les contrats
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
// ouvrir le dialogue
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
// Modifier un paiement
    editPaiement(paiement) {
      this.dialogTitle = 'Modifier Paiement';
      this.paiementForm = { ...paiement };
      this.isDialogOpen = true;
    },
// suppression de paiement

   async deletePaiement(id) {
       console.log('ID reçu pour suppression :', id);

  // Vérification de l'ID
    if (!id || typeof id !== 'number') {
    this.$q.notify({ type: 'negative', message: 'ID du paiement invalide. Impossible de supprimer.' });
    return;
  }

  try {
    // Demande de confirmation
    const confirmed = await new Promise(resolve => {
          this.$q.dialog({
            title: 'Confirmation',
            message: 'Êtes-vous sûr de vouloir supprimer ce contrat ?',
            ok: { label: 'Confirmer', color: 'negative' },
            cancel: { label: 'Annuler', color: 'primary' },
            persistent: true
          }).onOk(() => resolve(true)).onCancel(() => resolve(false));
        });
    // Si l'utilisateur confirme la suppression
    if (confirmed) {
      await axios.delete(`http://localhost:2000/api/paiement/${id}`);
      this.paiements = this.paiements.filter(p => p.id !== id); // Mise à jour locale
      this.$q.notify({ type: 'positive', message: 'Paiement supprimé avec succès.' });
      this.fetchPaiements() ;
    } else {
      this.$q.notify({ type: 'info', message: 'Suppression annulée.' });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du paiement :", error);

  }
},
// exporter  les données du paiement en fichier excel
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
    // exporter  les données du paiement en pdf

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
