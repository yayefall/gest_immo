<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page padding>
    <q-card>
      <q-toolbar>
        <q-btn
          label="Nouveau Profil"
          color="primary"
          @click="openAddDialog"
        />
      </q-toolbar>

      <q-table
      :rows="users"
      :columns="columns"
      row-key="id"
      no-data-label="Aucun profils disponible"
      flat
      bordered
      :pagination="pagination"
      @update:pagination="val => pagination = val"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              class="q-mx-sm"
              title="Modifier le Profil"
              icon="edit"
              color="primary"
              @click="editUser(props.row)"
            />
            <q-btn
              title="Supprimer le Profil"
              icon="delete"
              color="negative"
              @click="deleteUser(props.row.id)"
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

      <!-- Dialogue pour ajouter/modifier un utilisateur -->
      <q-dialog v-model="isDialogOpen">
        <q-card style="width: 80vw; max-width: 600px;">
          <q-card-section>
            <div class="text-h6 text-center">{{ dialogTitle }}</div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-model="userForm.nomComplet"
              label="Nom Complet"
              outlined
              required
            />
            <q-input
              v-model="userForm.username"
              label="Nom d'utilisateur"
              outlined
              required
            />
            <q-input
              v-model="userForm.email"
              label="Email"
              type="email"
              outlined
              required
            />
            <q-input
              v-model="userForm.password"
              label="Mot de passe"
              outlined
              :type="passwordVisible ? 'text' : 'password'"
              required
            >
              <template v-slot:append>
                <q-icon
                  :name="passwordVisible ? 'visibility' : 'visibility_off'"
                  @click="passwordVisible = !passwordVisible"
                />
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Annuler" color="negative" @click="isDialogOpen = false" />
            <q-btn label="Enregistrer" color="primary" @click="saveUser" />
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
  data() {
    return {
      users: [],
      columns: [
        { name: 'id', required: true, label: 'ID', align: 'left', field: row => row.id, sortable: true },
        { name: 'nomComplet', label: 'Nom Complet', align: 'left', field: 'nomComplet' },
        { name: 'username', label: 'Nom d\'utilisateur', align: 'left', field: 'username' },
        { name: 'email', label: 'Email', align: 'left', field: 'email' },
        { name: 'is_active', label: 'Statut', align: 'center', field: row => (row.is_active ? 'Actif' : 'Inactif') },
        { name: 'actions', label: 'Actions', align: 'center' }
      ],
      pagination: { page: 1, rowsPerPage: 10 },
      isDialogOpen: false,
      dialogTitle: '',
      userForm: { id: null, nomComplet: '', username: '', email: '', password: '', is_active: true },
      passwordVisible: false
    };
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get("http://localhost:2000/api/users");
        this.users = response.data;
        console.log('user:', this.users);
      } catch (error) {
        console.error("Erreur lors de la récupération des propriétaires :", error);
      }
    },
    openAddDialog() {
      this.dialogTitle = 'Ajouter Profil';
      this.userForm = { id: null, nomComplet: '', username: '', email: '', password: '', is_active: true };
      this.isDialogOpen = true;
    },
    editUser(user) {
      this.dialogTitle = 'Modifier Profil';
      this.userForm = { ...user, password: '' };
      this.isDialogOpen = true;
    },
    async saveUser() {
      try {
        if (this.userForm.id) {
          await axios.put(`http://localhost:2000/api/users/${this.userForm.id}`, this.userForm);
        } else {
          await axios.post('http://localhost:2000/api/users', this.userForm);
        }
        this.isDialogOpen = false;
        this.fetchUsers();
        this.$q.notify({ type: 'positive', message: 'Utilisateur enregistré avec succès.' });
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
        this.$q.notify({ type: 'negative', message: 'Erreur lors de l\'enregistrement de l\'utilisateur.' });
      }
    },

    async deleteUser(id) {
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
          await axios.delete(`http://localhost:2000/api/users/${id}`);
          this.$q.notify({ type: 'positive', message: 'utilisateur supprimé avec succès.' });
          this.fetchUsers();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du utilisateur :', error);
      }
    },

  exportTable() {
      const rows = this.users;
      const columns = this.columns.filter(col => col.name !== 'actions');
      const content = [
        columns.map(col => wrapCsvValue(col.label)),
        ...rows.map(row =>
          columns.map(col =>
            wrapCsvValue(typeof col.field === 'function' ? col.field(row) : row[col.field || col.name])
          ).join(',')
        )
      ].join('\r\n');
      exportFile('users-export.csv', content, 'text/csv');
    },
    exportToPDF() {
      const doc = new jsPDF();
      const columns = this.columns.filter(col => col.name !== 'actions').map(col => ({ header: col.label, dataKey: col.name }));
      const rows = this.users.map(user => {
        const row = {};
        this.columns.forEach(col => {
          if (col.name !== 'actions') {
            row[col.name] = typeof col.field === 'function' ? col.field(user) : user[col.field || col.name];
          }
        });
        return row;
      });
      doc.text('Liste des Utilisateurs', 14, 10);
      doc.autoTable({ columns, body: rows, startY: 20, theme: 'grid' });
      doc.save('users-export.pdf');
    }
  }
};
</script>
