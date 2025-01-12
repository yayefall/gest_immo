<!-- eslint-disable vue/multi-word-component-names -->

<template>
  <q-page padding>
    <q-card>
      <q-toolbar>
        <q-btn label="Nouveau Bien"
          color="primary"
          class="text-center"
          @click="openAddDialog" />
      </q-toolbar>

      <q-table
        :rows="biens"
        :columns="columns"
        row-key="id"
        no-data-label="Aucun bien disponible"
        flat
        bordered
        :pagination="pagination"
        @update:pagination="val => pagination = val"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn class="text-center q-mx-sm"
              title="Modifier le bien"
              icon="edit"
              color="primary"
              @click="editBien(props.row)" />
            <q-btn
              title="Supprimer le bien"
              icon="delete"
              color="negative"
              @click="deleteBien(props.row.id)" />
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
  <q-select
    v-model="bienForm.type"
    :options="types"
    label="Type"
    outlined
    required
  />
  <q-input
    v-model="bienForm.adresse"
    label="Adresse"
    outlined
    required
  />
  <q-input
    v-model="bienForm.superficie"
    label="Superficie (m²)"
    type="number"
    outlined
    required
  />
  <q-input
    v-model="bienForm.nombre_pieces"
    label="Nombre de pièces"
    type="number"
    outlined
    required
  />
  <q-input
    v-model="bienForm.loyer_mensuel"
    label="Loyer Mensuel"
    type="number"
    outlined
    required
  />
  <q-select
    v-model="bienForm.proprietaire_id"
    :options="proprietaires"
    option-value="id"
    option-label="nom_proprietaire"
    emit-value
    map-options
    label="Propriétaire"
    outlined
    required
  />
</q-card-section>



          <q-card-actions align="right">
            <q-btn label="Annuler" color="negative" @click="isDialogOpen = false" />
            <q-btn label="Enregistrer" color="primary" @click="saveBien" />
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
    this.fetchBiens();
    this.fetchProprietaires();
  },
  data() {
    return {
      biens: [],
      proprietaires: [],
      types: ['Appartement', 'Maison', 'Bureau', 'Terrain'], // Exemples de types de biens
      columns: [
        { name: 'id', required: true, label: 'ID', align: 'left', field: row => row.id, sortable: true },
        { name: 'type', label: 'Type', align: 'left', field: 'type' },
        { name: 'adresse', label: 'Adresse', align: 'left', field: 'adresse' },
        { name: 'superficie', label: 'Superficie (m²)', align: 'left', field: 'superficie', sortable: true },
        { name: 'nombre_pieces', label: 'Nombre de pièces', align: 'left', field: 'nombre_pieces' },
        { name: 'loyer_mensuel', label: 'Loyer Mensuel', align: 'left', field: 'loyer_mensuel' },
        { name: 'nom_proprietaire', label: 'Propriétaire ', align: 'left', field: 'nom_proprietaire' },
        { name: 'actions', label: 'Actions', align: 'center' }
      ],
      pagination: { page: 1, rowsPerPage: 10 },
      isDialogOpen: false,
      dialogTitle: 'Ajouter Bien',
      bienForm: { id: null, type: '', adresse: '', superficie: '', nombre_pieces: '', loyer_mensuel: '', proprietaire_id: '' }
    };
  },
  methods: {

    async fetchProprietaires() {
    try {
      const response = await axios.get("http://localhost:2000/api/proprietaires");
      this.proprietaires = response.data.map(proprietaire => ({
      id: proprietaire.id, // Assuming `id` is the key for proprietor ID
      nom_proprietaire: proprietaire.nomComplet // Assuming `nom` holds the owner's name
}));

    } catch (error) {
      console.error("Erreur lors de la récupération des propriétaires :", error);
    }
  },

    async fetchBiens() {
      try {
        const response = await axios.get('http://localhost:2000/api/biens');
        this.biens = response.data;
        this.fetchProprietaires;
      } catch (error) {
        console.error('Erreur lors de la récupération des biens :', error);
      }
    },
    openAddDialog() {
      this.dialogTitle = 'Ajouter Bien';
      this.bienForm = { id: null, type: '', adresse: '', superficie: '', nombre_pieces: '', loyer_mensuel: '', proprietaire_id: '' };
      this.isDialogOpen = true;
    },
    editBien(bien) {
      this.dialogTitle = 'Modifier Bien';
      this.bienForm = { ...bien };
      this.isDialogOpen = true;
    },
    validateBienForm() {
    const { type, adresse, superficie, nombre_pieces, loyer_mensuel, proprietaire_id } = this.bienForm;

    if (!type || !adresse || !superficie || !nombre_pieces || !loyer_mensuel || !proprietaire_id) {
    this.$q.notify({
      color: 'negative',
      message: 'Tous les champs sont obligatoires.',
    });
    return false;
  }

  return true;
},

async saveBien() {
  if (!this.validateBienForm()) {
    return;
  }

  try {
    if (this.bienForm.id) {
      await axios.put(`http://localhost:2000/api/biens/${this.bienForm.id}`, this.bienForm);
    } else {
      await axios.post('http://localhost:2000/api/biens', this.bienForm);
    }
    this.isDialogOpen = false;
    this.fetchBiens();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du bien :", error);
      this.$q.notify({
        color: 'negative',
        message: "Erreur lors de l'enregistrement du bien.",
      });
    }
  },


    async deleteBien(id) {
      try {
        const confirmed = await new Promise(resolve => {
          this.$q.dialog({
            title: 'Confirmation',
            message: 'Êtes-vous sûr de vouloir supprimer ce bien ?',
            ok: { label: 'Confirmer', color: 'negative' },
            cancel: { label: 'Annuler', color: 'primary' },
            persistent: true
          }).onOk(() => resolve(true)).onCancel(() => resolve(false));
        });
        if (confirmed) {
          await axios.delete(`http://localhost:2000/api/biens/${id}`);
          this.$q.notify({ type: 'positive', message: 'Bien supprimé avec succès.' });
          this.fetchBiens();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du bien :', error);
      }
    },

    exportTable() {
      const rows = this.biens;
      const columns = this.columns.filter(col => col.name !== 'actions');
      const content = [
        columns.map(col => wrapCsvValue(col.label)),
        ...rows.map(row =>
          columns.map(col =>
            wrapCsvValue(typeof col.field === 'function' ? col.field(row) : row[col.field || col.name])
          ).join(',')
        )
      ].join('\r\n');
      exportFile('biens-export.csv', content, 'text/csv');
    },

    exportToPDF() {
      if (!this.biens || this.biens.length === 0) {
        this.$q.notify({ message: 'Aucune donnée à exporter.', color: 'negative', icon: 'warning' });
        return;
      }
      const doc = new jsPDF();
      const columns = this.columns.filter(col => col.name !== 'actions').map(col => ({ header: col.label, dataKey: col.name }));
      const rows = this.biens.map(bien => {
        const row = {};
        this.columns.forEach(col => {
          if (col.name !== 'actions') {
            row[col.name] = typeof col.field === 'function' ? col.field(bien) : bien[col.field || col.name];
          }
        });
        return row;
      });
      doc.text('Liste des Biens', 14, 10);
      doc.autoTable({ columns, body: rows, startY: 20, theme: 'grid' });
      doc.save('biens-export.pdf');
    }
  }
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
