import { createRouter, createWebHistory } from 'vue-router';
import LoginLayout from '@/layout/LoginLayout.vue';
import MainLayout from '@/layout/MainLayout.vue';
import Login from '@/views/Login/Login.vue';
import RecuperarContrasena from '@/views/Login/RecuperarContrasena.vue';
import Inicio from '@/views/Inicio.vue';
import InventarioBienes from '@/views/InventarioBienes.vue';
import Incorporaciones from '@/views/Incorporaciones.vue';
import Desincorporaciones from '@/views/Desincorporaciones.vue';
import Movimientos from '@/views/Movimientos.vue';
import Mantenimiento from '@/views/Mantenimiento.vue';
import Presupuestos from '@/views/Presupuestos.vue';
import Dependencias from '@/views/Dependencias.vue';
import Cargos from '@/views/Cargos.vue';
import Personal from '@/views/Personal.vue';
import Usuarios from '@/views/Usuarios.vue';
import InventarioBienesKPIs from '@/views/KPIs/InventarioBienesKPIs.vue';
import PresupuestosKPIs from '@/views/KPIs/PresupuestosKPIs.vue';
import PersonalKPIs from '@/views/KPIs/PersonalKPIs.vue';
import MantenimientoKPIs from '@/views/KPIs/MantenimientoKPIs.vue';
import DesincorporacionesKPIs from '@/views/KPIs/DesincorporacionesKPIs.vue';

const routes = [
  {
    path: '/login',
    name: 'LoginLayout',
    component: LoginLayout,
    meta: { autenticado: false },
    children: [
      {
        path: '',
        name: 'Login',
        component: Login
      },
      {
        path: '/recuperar-contrasena',
        name: 'RecuperarContrasena',
        component: RecuperarContrasena
      }
    ],
  },
  {
    path: '/',
    name: 'MainLayout',
    component: MainLayout,
    meta: { autenticado: true },
    children: [
      { 
        path: '',
        name: 'Placeholder',
        redirect: '/inicio' 
      },
      {
        path: 'inicio',
        name: 'Inicio',
        component: Inicio
      },
      {
        path: 'inventario',
        children: [
          {
            path: '',
            name: 'InventarioBienes',
            component: InventarioBienes
          },
          {
            path: 'estadisticas',
            name: 'InventarioBienesKPIs',
            component: InventarioBienesKPIs
          }
        ]
      },
      {
        path: 'incorporaciones',
        name: 'Incorporaciones',
        component: Incorporaciones
      },
      {
        path: 'desincorporaciones',
        meta: { roles: ['Administrador', 'Supervisor'] },
        children: [
          {
            path: '',
            name: 'Desincorporaciones',
            component: Desincorporaciones
          },
          {
            path: 'estadisticas',
            name: 'DesincorporacionesKPIs',
            component: DesincorporacionesKPIs
          }
        ]
      },
      {
        path: 'movimientos',
        name: 'Movimientos',
        component: Movimientos,
        meta: { roles: ['Administrador', 'Supervisor'] }
        
      },
      {
        path: 'mantenimiento',
        children: [
          {
            path: '',
            name: 'Mantenimiento',
            component: Mantenimiento
          },
          {
            path: 'estadisticas',
            name: 'MantenimientoKPIs',
            component: MantenimientoKPIs
          }
        ]
      },
      {
        path: 'presupuestos',
        meta: { roles: ['Administrador'] },
        children: [
          {
            path: '',
            name: 'Presupuestos',
            component: Presupuestos,
          },
          {
            path: 'estadisticas',
            name: 'PresupuestosKPIs',
            component: PresupuestosKPIs
          }
        ]
      },
      {
        path: 'dependencias',
        name: 'Dependencias',
        component: Dependencias,
        meta: { roles: ['Administrador'] }
      },
      {
        path: 'cargos',
        name: 'Cargos',
        component: Cargos,
        meta: { roles: ['Administrador'] }
      },
      {
        path: 'personal',
        meta: { roles: ['Administrador'] },
        children: [
          {
            path: '',
            name: 'Personal',
            component: Personal,
          },
          {
            path: 'estadisticas',
            name: 'PersonalKPIs',
            component: PersonalKPIs,
          }
        ]
      },
      {
        path: 'usuarios',
        name: 'Usuarios',
        component: Usuarios,
        meta: { roles: ['Administrador'] }
      }
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
	const userData = JSON.parse(localStorage.getItem('user_session'));
  const isAuthenticated = userData && userData.autenticado;
  const userRole = userData?.usuario.rol;

  if (to.meta.autenticado && !isAuthenticated) {
    return next('/login');
  }
	if (!to.meta.autenticado && isAuthenticated) {
    return next('/inicio')
	}

  const requiredRoles = to.meta.roles;
  
  if (isAuthenticated && requiredRoles) {
    if (requiredRoles.includes(userRole)) {
      next();
    } else {
      next('/inicio'); 
    }
  } else {
    next();
  }
});

export default router;