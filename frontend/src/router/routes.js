
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name:'index',component: () => import('pages/IndexPage.vue') },
      { path: '/dashboard', name:'dashboard', component: () => import('pages/Dashboard.vue') },
      { path: '/login', name:'login',component: () => import('pages/Login.vue') },
      { path: '/profil', name:'profil',component: () => import('pages/Profil.vue') },
      { path: '/biens', name:'biens',component: () => import('pages/Bien.vue') },
      { path: '/contrats', name:'contrats',component: () => import('pages/Contrat.vue') },
      { path: '/cautions', name:'cautions',component: () => import('src/pages/Cautions.vue') },
      { path: '/locataires', name:'locataires',component: () => import('pages/Locataire.vue') },
      { path: '/paiements', name:'paiements',component: () => import('pages/Paiement.vue') },
      { path: '/proprietaires', name:'proprietaires',component: () => import('pages/Proprietaire.vue') },


    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
