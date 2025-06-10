
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Users, Calendar, Settings, Clock, CalendarDays, Stethoscope } from 'lucide-react';
import AppSidebar from '@/components/layout/AppSidebar';
import PatientList from '@/components/patients/PatientList';
import StaffList from '@/components/staff/StaffList';
import AppointmentList from '@/components/appointments/AppointmentList';
import SpecialtyList from '@/components/specialties/SpecialtyList';
import WorkShiftList from '@/components/shifts/WorkShiftList';
import WorkScheduleList from '@/components/schedules/WorkScheduleList';

const Dashboard: React.FC = () => {
  const { session } = useAuth();
  const [activeSection, setActiveSection] = useState('patients');

  // Only admin should see the full admin dashboard
  if (session?.role !== 'admin') {
    return null;
  }

  const menuItems = [
    {
      id: 'patients',
      title: 'Pacientes',
      icon: Users,
      onClick: () => setActiveSection('patients'),
      isActive: activeSection === 'patients',
    },
    {
      id: 'staff',
      title: 'Personal Médico',
      icon: Stethoscope,
      onClick: () => setActiveSection('staff'),
      isActive: activeSection === 'staff',
    },
    {
      id: 'appointments',
      title: 'Citas',
      icon: Calendar,
      onClick: () => setActiveSection('appointments'),
      isActive: activeSection === 'appointments',
    },
    {
      id: 'specialties',
      title: 'Especialidades',
      icon: Settings,
      onClick: () => setActiveSection('specialties'),
      isActive: activeSection === 'specialties',
    },
    {
      id: 'shifts',
      title: 'Turnos de Trabajo',
      icon: Clock,
      onClick: () => setActiveSection('shifts'),
      isActive: activeSection === 'shifts',
    },
    {
      id: 'schedules',
      title: 'Horarios',
      icon: CalendarDays,
      onClick: () => setActiveSection('schedules'),
      isActive: activeSection === 'schedules',
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'patients':
        return <PatientList />;
      case 'staff':
        return <StaffList />;
      case 'appointments':
        return <AppointmentList />;
      case 'specialties':
        return <SpecialtyList />;
      case 'shifts':
        return <WorkShiftList />;
      case 'schedules':
        return <WorkScheduleList />;
      default:
        return <PatientList />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-white">
        <AppSidebar menuItems={menuItems} title="Panel de Administración" />
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header with sidebar trigger */}
          <header className="bg-white shadow-sm border-b border-blue-100 p-3 lg:p-4 xl:p-6 shrink-0">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <SidebarTrigger className="lg:hidden shrink-0 h-9 w-9" />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-blue-900 truncate">
                  Bienvenido/a, {session?.name}
                </h1>
                <p className="text-blue-600 mt-1 text-sm lg:text-base hidden sm:block">
                  Sistema de gestión médica - Panel de administración
                </p>
                <p className="text-blue-600 mt-1 text-xs sm:hidden">
                  Panel de administración
                </p>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-3 lg:p-4 xl:p-6 overflow-auto">
            <div className="max-w-full h-full">
              <div className="bg-white rounded-lg shadow-lg h-full overflow-hidden">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
