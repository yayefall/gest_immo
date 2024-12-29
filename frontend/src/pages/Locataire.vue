<!-- eslint-disable vue/multi-word-component-names -->

<template>
  <q-page padding>
    <q-card>
      <q-toolbar>
        <q-btn label="Nouveau Locataire"
          color="primary"
          class="text-center"
          @click="openAddDialog" />
      </q-toolbar>

      <q-table
        :rows="locataires"
        :columns="columns"
        row-key="id"
        no-data-label="Aucun locataire disponible"
        flat
        bordered
        :pagination="pagination"
        @update:pagination="val => pagination = val"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn class="text-center q-mx-sm"
              title="Modifier le locataire"
              icon="edit"
              color="primary"
              @click="editLocataire(props.row)" />
            <q-btn
              title="Supprimer le locataire"
              icon="delete"
              color="negative"
              @click="deleteLocataire(props.row.id)" />
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
            <div class="text-h6">{{ dialogTitle }}</div>
          </q-card-section>

          <q-card-section>
            <q-input v-model="locataireForm.nomComplet" label="Nom Complet" outlined required />
            <q-input v-model="locataireForm.email" label="Email" type="email" outlined required />
            <q-input v-model="locataireForm.telephone" label="Téléphone" type="tel" outlined required />
            <q-input v-model="locataireForm.adresse" label="Adresse" outlined required />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Annuler" color="negative" @click="isDialogOpen = false" />
            <q-btn label="Enregistrer" color="primary" @click="saveLocataire" />
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
    this.fetchLocataires();
  },
  data() {
    return {
      locataires: [],
      columns: [
        { name: 'id', required: true, label: 'ID', align: 'left', field: row => row.id, sortable: true },
        { name: 'nomComplet', label: 'Nom Complet', align: 'left', field: 'nomComplet' },
        { name: 'email', label: 'Email', align: 'left', field: 'email' },
        { name: 'telephone', label: 'Téléphone', align: 'left', field: 'telephone' },
        { name: 'adresse', label: 'Adresse', align: 'left', field: 'adresse' },
        { name: 'actions', label: 'Actions', align: 'center' }
      ],
      pagination: { page: 1, rowsPerPage: 10 },
      isDialogOpen: false,
      dialogTitle: 'Ajouter Locataire',
      locataireForm: { id: null, nomComplet: '', email: '', telephone: '', adresse: '' }
    };
  },
  methods: {
    async fetchLocataires() {
  try {
    const response = await axios.get('http://localhost:2000/api/locataires');
    this.locataires = response.data;
    this.$q.notify({
      type: 'positive',
      message: 'Liste des locataires récupérée avec succès.',
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des locataires :', error);
    this.$q.notify({
      type: 'negative',
      message: 'Erreur lors de la récupération des locataires.',
    });
  }
},

    openAddDialog() {
      this.dialogTitle = 'Ajouter Locataire';
      this.locataireForm = { id: null, nomComplet: '', email: '', telephone: '', adresse: '' };
      this.isDialogOpen = true;
    },
    editLocataire(locataire) {
      this.dialogTitle = 'Modifier Locataire';
      this.locataireForm = { ...locataire };
      this.isDialogOpen = true;
    },
    async saveLocataire() {
      try {
        if (this.locataireForm.id) {
          await axios.put(`http://localhost:2000/api/locataires/${this.locataireForm.id}`, this.locataireForm);
        } else {
          await axios.post('http://localhost:2000/api/locataires', this.locataireForm);
        }
        this.isDialogOpen = false;
        this.fetchLocataires();
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du locataire :", error);
      }
    },
    async deleteLocataire(id) {
      try {
        const confirmed = await new Promise(resolve => {
          this.$q.dialog({
            title: 'Confirmation',
            message: 'Êtes-vous sûr de vouloir supprimer ce locataire ?',
            ok: { label: 'Confirmer', color: 'negative' },
            cancel: { label: 'Annuler', color: 'primary' },
            persistent: true
          }).onOk(() => resolve(true)).onCancel(() => resolve(false));
        });
        if (confirmed) {
          await axios.delete(`http://localhost:2000/api/locataires/${id}`);
          this.$q.notify({ type: 'positive', message: 'Locataire supprimé avec succès.' });
          this.fetchLocataires();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du locataire :', error);
      }
    },
    exportTable() {
      const rows = this.locataires;
      const columns = this.columns.filter(col => col.name !== 'actions');
      const content = [
        columns.map(col => wrapCsvValue(col.label)),
        ...rows.map(row =>
          columns.map(col =>
            wrapCsvValue(typeof col.field === 'function' ? col.field(row) : row[col.field || col.name])
          ).join(',')
        )
      ].join('\r\n');
      exportFile('locataires-export.csv', content, 'text/csv');
    },
    exportToPDF() {
      const doc = new jsPDF();
      const columns = this.columns.filter(col => col.name !== 'actions').map(col => ({ header: col.label, dataKey: col.name }));
      const rows = this.locataires.map(locataire => {
        const row = {};
        this.columns.forEach(col => {
          if (col.name !== 'actions') {
            row[col.name] = typeof col.field === 'function' ? col.field(locataire) : locataire[col.field || col.name];
          }
        });
        return row;
      });
      doc.text('Liste des Locataires', 14, 10);
      doc.autoTable({ columns, body: rows, startY: 20, theme: 'grid' });
      doc.save('locataires-export.pdf');
    }
  }
};

</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
