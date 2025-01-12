<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page padding>
    <q-card>
    <q-toolbar class="q-px-md">
    <div class="row justify-between items-center" style="width: 100%;">
    <!-- Bouton à gauche -->
    <q-btn
      label="Nouveau Contrat"
      color="primary"
      class="text-center"
      @click="openAddDialog"
    />

    <!-- Barre de recherche et bouton à droite -->
    <div class="row items-center">
      <q-input
        v-model="search"
        outlined
        dense
        placeholder="Rechercher un contrat"
        clearable
        @input="filterContrats"
        class="q-mr-sm"
      >
        <template v-slot:append>
          <q-icon name="search"
          @click="filterContrats"/>

        </template>
      </q-input>
      <q-btn
        label="Réinitialiser"
        color="primary"
        class="q-ml-sm"
        @click="resetSearch"
          />
        </div>
      </div>
    </q-toolbar>

      <q-table
        :rows="filteredContrats"
        :columns="columns"
        row-key="id"
        no-data-label="Aucun contrat disponible"
        flat
        bordered
        :pagination="pagination"
        @update:pagination="val => pagination = val"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn class="text-center q-mx-sm"
              title="Modifier le contrat"
              icon="edit"
              color="primary"
              @click="editContrat(props.row)" />
            <q-btn
              title="Supprimer le contrat"
              icon="delete"
              color="negative"
              @click="deleteContrat(props.row.id)" />
          </q-td>
        </template>
        <template v-slot:top-right>
          <q-btn
            class="q-mx-sm"
            title="Exporter en fichier Excel"
            color="primary"
            icon-right="archive"
            no-caps
            @click="exportTable" />
          <q-btn
            title="Télécharger en fichier PDF"
            color="primary"
            icon="picture_as_pdf"
            no-caps
            @click="exportToPDF" />
        </template>
      </q-table>

      <q-dialog v-model="isDialogOpen">
        <q-card style="width: 80vw; max-width: 600px; height: 70vh; max-height: 500px;">
          <q-card-section>
            <div class="text-h6 text-center">{{ dialogTitle }}</div>
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="contratForm.libelle"
              label="Nom Contrat"
              outlined
              required
            />
            <q-select
              v-model="contratForm.locataire_id"
              :options="locataires"
              option-value="id"
              option-label="nomComplet"
              emit-value
              map-options
              label="Locataire"
              outlined
              required
            />
            <q-select
              v-model="contratForm.bien_id"
              :options="biens"
              option-value="id"
              option-label="type"
              emit-value
              map-options
              label="Bien"
              outlined
              required
              @update:model-value="onContratChange"
            />
             <q-input
                v-model="contratForm.loyer_mensuel"
                label="Loyer Mensuel"
                type="number"
                outlined
                readonly
                required
              />

            <q-input
              v-model="contratForm.date_debut"
              label="Date de début"
              type="date"
              outlined
              required
            />
            <q-input
              v-model="contratForm.date_fin"
              label="Date de fin"
              type="date"
              outlined
              required
            />

            <q-select
              v-model="contratForm.etat"
              :options="['Actif', 'Terminé', 'Annulé']"
              label="État du contrat"
              outlined
              required
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Annuler" color="negative" @click="isDialogOpen = false" />
            <q-btn label="Enregistrer" color="primary" @click="saveContrat" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </q-page>
</template>

<script>
import axios from 'axios';
import { exportFile } from 'quasar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? '' : String(formatted);
  return `"${formatted.split('"').join('""')}"`;
}

export default {
  created() {
    this.fetchContrats();
    this.fetchLocataires();
    this.fetchBiens();
  },
  data() {
    return {
      contrats: [],
      filteredContrats: [],
      locataires: [],
      biens: [],
      search: '',
      columns: [
        { name: 'id', required: true, label: 'ID', align: 'left', field: row => row.id, sortable: true },
        { name: 'libelle', label: 'Nom Contrat', align: 'left', field: 'libelle' },
        { name: 'nom_locataires', label: 'Locataire', align: 'left', field: 'nom_locataires' },
        { name: 'nom_bien', label: 'Bien', align: 'left', field: 'nom_bien' },
        { name: 'date_debut', label: 'Date de début', align: 'left', field: 'date_debut', format: val => new Date(val).toLocaleDateString(), sortable: true },
        { name: 'date_fin', label: 'Date de fin', align: 'left', field: 'date_fin', format: val => new Date(val).toLocaleDateString(), sortable: true },
        { name: 'loyer_mensuel', label: 'Loyer Mensuel', align: 'left', field: 'loyer_mensuel' },
        { name: 'adresse', label: 'Adresse', align: 'left', field: 'adresse' },
        { name: 'etat', label: 'État', align: 'left', field: 'etat' },
        { name: 'actions', label: 'Actions', align: 'center' }
      ],
      pagination: { page: 1, rowsPerPage: 10 },
      isDialogOpen: false,
      dialogTitle: 'Ajouter Contrat',
      contratForm: { id: null, locataire_id: '', bien_id: '', date_debut: '', date_fin: '', loyer_mensuel: '', etat: '', libelle:'' }
    };
  },
  methods: {

     watch: {
        'contratForm.bien_id': function(newVal) {
          this.onContratChange();
        }
      },

      // Quand un bien est sélectionné
  onContratChange() {
      const bien = this.biens.find(b => b.id === this.contratForm.bien_id);
      if (bien) {
        this.contratForm.loyer_mensuel = bien.loyer_mensuel; // Assurez-vous que le champ existe dans `biens`
      } else {
        this.contratForm.loyer_mensuel = ''; // Réinitialiser si aucun bien sélectionné
      }
    },

    async fetchLocataires() {
      try {
        const response = await axios.get("http://localhost:2000/api/locataires");
        this.locataires = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des locataires :", error);
      }
    },
    async fetchBiens() {
      try {
        const response = await axios.get("http://localhost:2000/api/biens");
        this.biens = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des biens :", error);
      }
    },
    async fetchContrats() {
      try {
        const response = await axios.get('http://localhost:2000/api/contrats');
        this.contrats = response.data;
        this.filteredContrats = [...this.contrats];
      } catch (error) {
        console.error('Erreur lors de la récupération des contrats :', error);
      }
    },

    filterContrats() {
  const lowerSearch = this.search.toLowerCase().trim();
  if (!lowerSearch) {
    this.filteredContrats = [...this.contrats];
    return;
  }

  this.filteredContrats = this.contrats.filter(contrat => {
    return (
      (contrat.nom_locataires?.toLowerCase().includes(lowerSearch) || '') ||
      (contrat.nom_bien?.toLowerCase().includes(lowerSearch) || '') ||
      (contrat.libelle?.toLowerCase().includes(lowerSearch) || '') ||
      (contrat.adresse?.toLowerCase().includes(lowerSearch) || '') ||
      (String(contrat.loyer_mensuel)?.toLowerCase().includes(lowerSearch) || '') || // Convertit le nombre en chaîne
      (contrat.etat?.toLowerCase().includes(lowerSearch) || '')
      );
    });
  },

  resetSearch() {
    this.search = '';
    this.filteredContrats = [...this.contrats];
  },

    /*filterContrats() {
      const lowerSearch = this.search.toLowerCase();
      this.filteredContrats = this.contrats.filter(contrat => {
        return (
          contrat.nom_locataires?.toLowerCase().includes(lowerSearch) ||
          contrat.nom_bien?.toLowerCase().includes(lowerSearch) ||
          contrat.adresse?.toLowerCase().includes(lowerSearch) ||
          contrat.etat?.toLowerCase().includes(lowerSearch)
        );
      });
    },
    */
    /*resetSearch() {
      this.search = '';
      this.filteredContrats = [...this.contrats];
    },*/
    openAddDialog() {
      this.dialogTitle = 'Ajouter Contrat';
      this.contratForm = { id: null, locataire_id: '', bien_id: '', date_debut: '', date_fin: '', loyer_mensuel: '', adresse: '', etat: '' ,libelle:''};
      this.isDialogOpen = true;
    },
    editContrat(contrat) {
      this.dialogTitle = 'Modifier Contrat';
      this.contratForm = { ...contrat };
      this.isDialogOpen = true;
    },
    async saveContrat() {
      try {
        if (this.contratForm.id) {
          await axios.put(`http://localhost:2000/api/contrats/${this.contratForm.id}`, this.contratForm);
        } else {
          await axios.post('http://localhost:2000/api/contrats', this.contratForm);
        }
        this.isDialogOpen = false;
        this.fetchContrats();
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du contrat :", error);
      }
    },
    async deleteContrat(id) {
      try {
        const confirmed = await new Promise(resolve => {
          this.$q.dialog({
            title: 'Confirmation',
            message: 'Êtes-vous sûr de vouloir supprimer ce contrat ?',
            ok: { label: 'Confirmer', color: 'negative' },
            cancel: { label: 'Annuler', color: 'primary' },
            persistent: true
          }).onOk(() => resolve(true)).onCancel(() => resolve(false));
        });
        if (confirmed) {
          await axios.delete(`http://localhost:2000/api/contrats/${id}`);
          this.$q.notify({ type: 'positive', message: 'Contrat supprimé avec succès.' });
          this.fetchContrats();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du contrat :', error);
      }
    },

    exportTable() {
      const rows = this.contrats;
      const columns = this.columns.filter(col => col.name !== 'actions');
      const content = [
        columns.map(col => wrapCsvValue(col.label)),
        ...rows.map(row =>
          columns.map(col =>
            wrapCsvValue(typeof col.field === 'function' ? col.field(row) : row[col.field || col.name])
          ).join(',')
        )
      ].join('\r\n');
      exportFile('contrats-export.csv', content, 'text/csv');
    },

    exportToPDF() {
      if (!this.contrats || this.contrats.length === 0) {
        this.$q.notify({ message: 'Aucune donnée à exporter.', color: 'negative', icon: 'warning' });
        return;
      }
      const doc = new jsPDF();
      const columns = this.columns.filter(col => col.name !== 'actions').map(col => ({ header: col.label, dataKey: col.name }));
      const rows = this.contrats.map(contrat => {
        const row = {};
        this.columns.forEach(col => {
          if (col.name !== 'actions') {
            row[col.name] = typeof col.field === 'function' ? col.field(contrat) : contrat[col.field || col.name];
          }
        });
        return row;
      });
      doc.text('Liste des Contrats', 14, 10);
      doc.autoTable({ columns, body: rows, startY: 20, theme: 'grid' });
      doc.save('contrats-export.pdf');
    }
  }
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
