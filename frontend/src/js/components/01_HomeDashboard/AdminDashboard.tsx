// Bibliotecas
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { FiBarChart2, FiMapPin, FiUserCheck, FiUsers } from 'react-icons/fi';
import { AppDispatch, RootState } from '@/store/store';

// Types
import { Empleados, Departamentos, User, Ubicaciones } from '@/@types/mainTypes';

// Styles
import '@styles/01_HomeDashboard/AdminDashboard.css';
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { setListEmpleados } from '@/store/administrador/Empleados/empleadosReducer';
import { getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/administrador/Departamentos/departamentosReducer';
import { getUsers } from '@/store/administrador/Users/usersActions';
import { setListUsuarios } from '@/store/administrador/Users/usersReducer';
import { getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { setListUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesReducer';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);


const AdminDashboard: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();
  const fetchedRef = useRef({
    empleados: false,
    departamentos: false,
    usuarios: false,
    ubicaciones: false,
  });

  // Get empleados from Redux store
  const empleados = useSelector(
    (state: RootState) => state.empleados.empleados
  );

  const departamentos = useSelector(
    (state: RootState) => state.departamentos.departamentos
  );

  const usuarios = useSelector(
    (state: RootState) => state.users.users
  );

  const ubicaciones = useSelector(
    (state: RootState) => state.ubicaciones.ubicaciones
  );

  const stats = useMemo(() => {
    const empleadosActivos = empleados.reduce((acc, emp: Empleados) => acc + (emp.estatus_activo ? 1 : 0), 0);
    const usuariosActivos = usuarios.reduce((acc, usr: User) => acc + (usr.estatus_activo ? 1 : 0), 0);
    const ubicacionesActivas = ubicaciones.reduce((acc, ub: Ubicaciones) => acc + (ub.estatus_activo ? 1 : 0), 0);

    return {
      empleadosActivos,
      empleadosInactivos: empleados.length - empleadosActivos,
      usuariosActivos,
      usuariosInactivos: usuarios.length - usuariosActivos,
      ubicacionesActivas,
      ubicacionesInactivas: ubicaciones.length - ubicacionesActivas,
    };
  }, [empleados, usuarios, ubicaciones]);

  const {
    empleadosActivos,
    empleadosInactivos,
    usuariosActivos,
    usuariosInactivos,
    ubicacionesActivas,
    ubicacionesInactivas,
  } = stats;

  // Cargar los empleados, departamentos, usuarios y ubicaciones desde la API
  useEffect(() => {
    const loadData = async () => {
      const tasks: Promise<void>[] = [];

      if (empleados.length === 0 && !fetchedRef.current.empleados) {
        fetchedRef.current.empleados = true;
        tasks.push((async () => {
          const resultAction = await dispatch(getEmpleados()).unwrap();
          if (resultAction.success && resultAction.empleados) {
            dispatch(setListEmpleados(resultAction.empleados));
          }
        })());
      }

      if (departamentos.length === 0 && !fetchedRef.current.departamentos) {
        fetchedRef.current.departamentos = true;
        tasks.push((async () => {
          const resultAction = await dispatch(getDepartamentos()).unwrap();
          if (resultAction.success && resultAction.departamentos) {
            dispatch(setListDepartamentos(resultAction.departamentos));
          }
        })());
      }

      if (usuarios.length === 0 && !fetchedRef.current.usuarios) {
        fetchedRef.current.usuarios = true;
        tasks.push((async () => {
          const resultAction = await dispatch(getUsers()).unwrap();
          if (resultAction.success && resultAction.users) {
            dispatch(setListUsuarios(resultAction.users));
          }
        })());
      }

      if (ubicaciones.length === 0 && !fetchedRef.current.ubicaciones) {
        fetchedRef.current.ubicaciones = true;
        tasks.push((async () => {
          const resultAction = await dispatch(getUbicaciones()).unwrap();
          if (resultAction.success && resultAction.ubicaciones) {
            dispatch(setListUbicaciones(resultAction.ubicaciones));
          }
        })());
      }

      await Promise.allSettled(tasks);
    };

    loadData();
  }, [dispatch, empleados.length, departamentos.length, usuarios.length, ubicaciones.length]);


  // Transform data for bar chart: Employee count by department
  const barChartData = useMemo(() => {
    if (!empleados || empleados.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Cantidad de Empleados',
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      };
    }

    const empleadosPorDepartamento = new Map<number, number>();
    empleados.forEach((emp: Empleados) => {
      if (emp.id_departamento != null) {
        empleadosPorDepartamento.set(
          emp.id_departamento,
          (empleadosPorDepartamento.get(emp.id_departamento) || 0) + 1
        );
      }
    });

    const sortedDepts = departamentos
      .map((dept: Departamentos) => {
        const count = dept.id_departamento
          ? (empleadosPorDepartamento.get(dept.id_departamento) || 0)
          : 0;
        return { name: dept.nombre_departamento, count };
      })
      .sort((a, b) => b.count - a.count);

    return {
      labels: sortedDepts.map((d) => d.name),
      datasets: [
        {
          label: 'Cantidad de Empleados',
          data: sortedDepts.map((d) => d.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(251, 191, 36, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(139, 92, 246, 1)',
          ],
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [empleados, departamentos]);

  // Transform data for pie chart: Active vs Inactive employees
  const pieChartData = useMemo(() => {
    if (!empleados || empleados.length === 0) {
      return {
        labels: ['Activos', 'Inactivos'],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
            borderColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
            borderWidth: 2,
          },
        ],
      };
    }

    const activos = empleados.filter(
      (emp: Empleados) => emp.estatus_activo === true
    ).length;
    const inactivos = empleados.length - activos;

    return {
      labels: ['Activos', 'Inactivos'],
      datasets: [
        {
          data: [activos, inactivos],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
          borderWidth: 2,
        },
      ],
    };
  }, [empleados]);

  // Transform data for pie chart: Active vs Inactive users
  const userStatusData = useMemo(() => {
    if (!usuarios || usuarios.length === 0) {
      return {
        labels: ['Activos', 'Inactivos'],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(245, 158, 11, 0.8)'],
            borderColor: ['rgba(59, 130, 246, 1)', 'rgba(245, 158, 11, 1)'],
            borderWidth: 2,
          },
        ],
      };
    }

    const activos = usuarios.filter((usr: User) => usr.estatus_activo === true).length;
    const inactivos = usuarios.length - activos;

    return {
      labels: ['Activos', 'Inactivos'],
      datasets: [
        {
          data: [activos, inactivos],
          backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(245, 158, 11, 0.8)'],
          borderColor: ['rgba(59, 130, 246, 1)', 'rgba(245, 158, 11, 1)'],
          borderWidth: 2,
        },
      ],
    };
  }, [usuarios]);

  // Transform data for pie chart: Active vs Inactive locations
  const locationsStatusData = useMemo(() => {
    if (!ubicaciones || ubicaciones.length === 0) {
      return {
        labels: ['Activas', 'Inactivas'],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: ['rgba(139, 92, 246, 0.8)', 'rgba(107, 114, 128, 0.8)'],
            borderColor: ['rgba(139, 92, 246, 1)', 'rgba(107, 114, 128, 1)'],
            borderWidth: 2,
          },
        ],
      };
    }

    const activas = ubicaciones.filter(
      (ub: Ubicaciones) => ub.estatus_activo === true
    ).length;
    const inactivas = ubicaciones.length - activas;

    return {
      labels: ['Activas', 'Inactivas'],
      datasets: [
        {
          data: [activas, inactivas],
          backgroundColor: ['rgba(139, 92, 246, 0.8)', 'rgba(107, 114, 128, 0.8)'],
          borderColor: ['rgba(139, 92, 246, 1)', 'rgba(107, 114, 128, 1)'],
          borderWidth: 2,
        },
      ],
    };
  }, [ubicaciones]);

  const pieLabelCallback = (context: any) => {
    const total = context.dataset.data.reduce(
      (a: number, b: number) => a + b,
      0
    );
    const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : '0.0';
    return `${context.label}: ${context.parsed} (${percentage}%)`;
  };

  // Chart options memoized to avoid object recreation on each render
  const barChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 12 },
          padding: 15,
        },
      },
      title: {
        display: false,
        text: 'Empleados por Departamento',
        font: { size: 14, weight: 'bold' as const },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }), []);

  const pieChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 12 },
          padding: 15,
        },
      },
      title: {
        display: false,
        text: 'Estado de Empleados',
        font: { size: 14, weight: 'bold' as const },
      },
      tooltip: {
        callbacks: {
          label: pieLabelCallback,
        },
      },
    },
  }), []);

  const userStatusOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 12 },
          padding: 15,
        },
      },
      title: {
        display: false,
        text: 'Estado de Usuarios',
        font: { size: 14, weight: 'bold' as const },
      },
      tooltip: {
        callbacks: {
          label: pieLabelCallback,
        },
      },
    },
  }), []);

  const locationsStatusOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 12 },
          padding: 15,
        },
      },
      title: {
        display: false,
        text: 'Estado de Ubicaciones',
        font: { size: 14, weight: 'bold' as const },
      },
      tooltip: {
        callbacks: {
          label: pieLabelCallback,
        },
      },
    },
  }), []);

  // Loading state
  if (!empleados || empleados.length === 0) {
    return (
      <div className="admin-dashboard">
        <p className="loading-message">Cargando datos de empleados...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <h4>Total Empleados</h4>
          <p>{empleados.length}</p>
        </div>
        <div className="admin-kpi-card">
          <h4>Total Departamentos</h4>
          <p>{departamentos.length}</p>
        </div>
        <div className="admin-kpi-card">
          <h4>Total Usuarios</h4>
          <p>{usuarios.length}</p>
        </div>
        <div className="admin-kpi-card">
          <h4>Total Ubicaciones</h4>
          <p>{ubicaciones.length}</p>
        </div>
      </div>

      <div className="charts-container">
        {/* Bar Chart: Employees by Department */}
        <div className="chart-card chart-card--bar">
          <h3><FiBarChart2 className="chart-icon" /> Empleados por Departamento</h3>
          <p className="chart-summary">Total de departamentos: {departamentos.length}</p>
          <div className="chart-canvas">
            <Bar data={barChartData} options={barChartOptions} height={100} />
          </div>
        </div>

        {/* Pie Chart: Active vs Inactive Employees */}
        <div className="chart-card chart-card--empleados">
          <h3><FiUsers className="chart-icon" /> Estado de Empleados</h3>
          <p className="chart-summary">Total de empleados: {empleados.length} | Activos: {empleadosActivos} | Inactivos: {empleadosInactivos}</p>
          <div className="chart-canvas">
            <Pie data={pieChartData} options={pieChartOptions} height={100} />
          </div>
        </div>

        {/* Pie Chart: Active vs Inactive Users */}
        <div className="chart-card chart-card--usuarios">
          <h3><FiUserCheck className="chart-icon" /> Estado de Usuarios</h3>
          <p className="chart-summary">Total de usuarios: {usuarios.length} | Activos: {usuariosActivos} | Inactivos: {usuariosInactivos}</p>
          <div className="chart-canvas">
            <Pie data={userStatusData} options={userStatusOptions} height={100} />
          </div>
        </div>

        {/* Pie Chart: Active vs Inactive Locations */}
        <div className="chart-card chart-card--ubicaciones">
          <h3><FiMapPin className="chart-icon" /> Estado de Ubicaciones</h3>
          <p className="chart-summary">Total de ubicaciones: {ubicaciones.length} | Activas: {ubicacionesActivas} | Inactivas: {ubicacionesInactivas}</p>
          <div className="chart-canvas">
            <Pie data={locationsStatusData} options={locationsStatusOptions} height={100} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
