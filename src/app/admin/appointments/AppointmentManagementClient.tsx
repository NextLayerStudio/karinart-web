'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppointmentDetailModal from './AppointmentDetailModal';
import BeautyAppointmentDetailModal, {
  type BeautyAppointment,
} from './BeautyAppointmentDetailModal';
import ManualAppointmentModal from './ManualAppointmentModal';

interface VoucherTooltipProps {
  voucherCode: string;
  voucherType: string | null;
}

function VoucherTooltip({ voucherCode, voucherType }: VoucherTooltipProps) {
  const [voucherInfo, setVoucherInfo] = useState<any>(null);
  const [tooltipText, setTooltipText] = useState(`Použitý voucher: ${voucherCode} (${voucherType === 'discount' ? 'Zľavový kód' : 'Darčekový poukaz'})`);

  useEffect(() => {
    const fetchVoucherDetails = async () => {
      try {
        const response = await fetch(`/api/admin/vouchers/${encodeURIComponent(voucherCode)}`);

        if (response.ok) {
          const data = await response.json();
          setVoucherInfo(data.voucher);
          
          // Update tooltip with detailed information
          const details = voucherType === 'discount' 
            ? data.voucher.type === 'percentage' 
              ? `${data.voucher.value}% zľava`
              : `${data.voucher.value}€ zľava`
            : `${data.voucher.balance}€ hodnota`;
          
          setTooltipText(`Použitý voucher: ${voucherCode}\n${voucherType === 'discount' ? 'Zľavový kód' : 'Darčekový poukaz'}\n${details}`);
        }
      } catch (error) {
        console.error('Error fetching voucher details:', error);
      }
    };

    if (voucherCode) {
      fetchVoucherDetails();
    }
  }, [voucherCode, voucherType]);

  return (
    <div className="ml-2" title={tooltipText}>
      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
      </svg>
    </div>
  );
}

interface Appointment {
  id: string;
  fullName: string;
  email: string;
  confirmAdult: boolean;
  placement: string;
  size: string;
  color: string;
  description: string;
  notes: string | null;
  contactPreferenceEmail: boolean;
  contactPreferenceInstagram: boolean;
  contactPreferencePhone: boolean;
  instagram: string | null;
  phone: string | null;
  agreeMarketing: boolean;
  agreePrivacy: boolean;
  allergies: boolean;
  allergyDescription: string | null;
  healthIssues: boolean;
  healthIssueDescription: string | null;
  voucherCode: string | null;
  voucherType: string | null;
  imageUrl: string | null;
  appointmentDate: string;
  appointmentTime: string;
  duration: number | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'rescheduled';
  createdAt: string;
  hasConflicts?: boolean;
}

interface AppointmentManagementClientProps {
  appointments: Appointment[];
  beautyAppointments: BeautyAppointment[];
  username: string;
}

export default function AppointmentManagementClient({
  appointments,
  beautyAppointments,
  username
}: AppointmentManagementClientProps) {
  const [activeTab, setActiveTab] = useState<'tattoo' | 'beauty'>('tattoo');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedBeautyAppointment, setSelectedBeautyAppointment] =
    useState<BeautyAppointment | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleManualAppointmentCreated = () => {
    // Refresh the page to show the new appointment
    window.location.reload();
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Naozaj chcete vymazať tento termín? Táto akcia sa nedá vrátiť späť.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Termín úspešne vymazaný');
          window.location.reload();
        } else {
          alert('Failed to delete appointment: ' + result.error);
        }
      } else {
        alert('Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error deleting appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'rescheduled':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const visibleAppointments = activeTab === 'tattoo' ? appointments : [];
  const visibleBeautyAppointments = activeTab === 'beauty' ? beautyAppointments : [];
  const totalCount = activeTab === 'tattoo' ? appointments.length : beautyAppointments.length;
  const pendingCount =
    activeTab === 'tattoo'
      ? appointments.filter((a) => a.status === 'pending').length
      : beautyAppointments.filter((a) => a.status === 'pending').length;
  const confirmedCount =
    activeTab === 'tattoo'
      ? appointments.filter((a) => a.status === 'confirmed').length
      : beautyAppointments.filter((a) => a.status === 'confirmed').length;
  const rejectedCount =
    activeTab === 'tattoo'
      ? appointments.filter((a) => a.status === 'rejected').length
      : beautyAppointments.filter((a) => a.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Vitajte, {username}!
            </h2>
            <p className="text-white/80 text-sm sm:text-base">
              Spravujte žiadosti o termíny — tetovanie aj beauty. Beauty termíny po potvrdení
              automaticky blokujú kalendár podľa trvania služby.
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('tattoo')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'tattoo'
                  ? 'bg-[#c2a4df] text-black'
                  : 'bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              Tetovanie ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('beauty')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'beauty'
                  ? 'bg-[#c2a4df] text-black'
                  : 'bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              Beauty ({beautyAppointments.length})
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#c2a4df]/20 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-white/60 text-xs sm:text-sm">Všetky termíny</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{totalCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-white/60 text-xs sm:text-sm">Čakajúce</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{pendingCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-white/60 text-xs sm:text-sm">Potvrdené</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{confirmedCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-white/60 text-xs sm:text-sm">Zamietnuté</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{rejectedCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Appointment Button */}
          {activeTab === 'tattoo' && (
          <div className="mb-6">
            <button
              onClick={() => setShowManualModal(true)}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Pridať manuálny termín</span>
            </button>
          </div>
          )}

          {/* Appointments Table */}
          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              {activeTab === 'tattoo' ? 'Žiadosti o tetovanie' : 'Žiadosti o beauty termín'}
            </h3>
            
            {activeTab === 'tattoo' && visibleAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#c2a4df]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Žiadne žiadosti o termín</h4>
                <p className="text-white/60">Keď dostanete nové žiadosti, zobrazia sa tu.</p>
              </div>
            ) : activeTab === 'beauty' && visibleBeautyAppointments.length === 0 ? (
              <div className="text-center py-12">
                <h4 className="text-xl font-semibold text-white mb-2">Žiadne beauty rezervácie</h4>
                <p className="text-white/60">Keď zákazník rezervuje cez beauty formulár, zobrazí sa tu.</p>
              </div>
            ) : activeTab === 'tattoo' ? (
              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <table className="w-full text-left hidden lg:table">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-4 text-sm font-semibold text-white/60">Meno</th>
                      <th className="p-4 text-sm font-semibold text-white/60">Dátum</th>
                      <th className="p-4 text-sm font-semibold text-white/60">Čas</th>
                      <th className="p-4 text-sm font-semibold text-white/60">Status</th>
                      <th className="p-4 text-sm font-semibold text-white/60">Akcie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(appointment => (
                      <tr key={appointment.id} className="border-b border-white/5">
                        <td className="p-4 text-white">
                          <div className="flex items-center">
                            {appointment.fullName}
                            {appointment.voucherCode && (
                              <VoucherTooltip voucherCode={appointment.voucherCode} voucherType={appointment.voucherType} />
                            )}
                            {appointment.hasConflicts && (
                              <div className="ml-2" title="Tento termín má konflikt s iným termínom">
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-white/80">{formatDate(appointment.appointmentDate)}</td>
                        <td className="p-4 text-white/80">{formatTime(appointment.appointmentTime)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="p-4 space-x-2">
                          <button
                            onClick={() => setSelectedAppointment(appointment)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            Zobraziť
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            Vymazať
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {appointments.map(appointment => (
                    <div key={appointment.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <h4 className="text-white font-medium">{appointment.fullName}</h4>
                          {appointment.voucherCode && (
                            <VoucherTooltip voucherCode={appointment.voucherCode} voucherType={appointment.voucherType} />
                          )}
                          {appointment.hasConflicts && (
                            <div className="ml-2" title="Tento termín má konflikt s iným termínom">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="text-sm text-white/60 mb-3">
                        <p>{formatDate(appointment.appointmentDate)} o {formatTime(appointment.appointmentTime)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedAppointment(appointment)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          Zobraziť
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          Vymazať
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left hidden lg:table">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-4 text-sm font-semibold text-white/60">Meno</th>
                      <th className="p-4 text-sm font-semibold text-white/60">Služba</th>
                      <th className="p-4 text-sm font-semibold text-white/60">Dátum</th>
                      <th className="p-4 text-sm font-semibold text-white/60">Čas</th>
                      <th className="p-4 text-sm font-semibold text-white/60">Status</th>
                      <th className="p-4 text-sm font-semibold text-white/60">Akcie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beautyAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b border-white/5">
                        <td className="p-4 text-white">{appointment.fullName}</td>
                        <td className="p-4 text-white/80">{appointment.serviceTitle}</td>
                        <td className="p-4 text-white/80">{formatDate(appointment.appointmentDate)}</td>
                        <td className="p-4 text-white/80">{formatTime(appointment.appointmentTime)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedBeautyAppointment(appointment)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            Zobraziť
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="lg:hidden space-y-4">
                  {beautyAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{appointment.fullName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-[#c2a4df] text-sm mb-1">{appointment.serviceTitle}</p>
                      <p className="text-sm text-white/60 mb-3">
                        {formatDate(appointment.appointmentDate)} o {formatTime(appointment.appointmentTime)}
                      </p>
                      <button
                        onClick={() => setSelectedBeautyAppointment(appointment)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Zobraziť
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {selectedBeautyAppointment && (
        <BeautyAppointmentDetailModal
          appointment={selectedBeautyAppointment}
          onClose={() => setSelectedBeautyAppointment(null)}
        />
      )}

      {showManualModal && (
        <ManualAppointmentModal
          onClose={() => setShowManualModal(false)}
          onAppointmentCreated={handleManualAppointmentCreated}
        />
      )}
    </div>
  );
} 