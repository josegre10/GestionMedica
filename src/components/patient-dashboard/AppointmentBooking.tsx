
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Stethoscope, Plus } from 'lucide-react';
import { getSpecialties, getMedicalStaff, getAppointments, saveAppointments, getUsers } from '@/services/localStorage';
import { Specialty, MedicalStaff, Appointment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AppointmentBooking: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [medicalStaff, setMedicalStaff] = useState<MedicalStaff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<MedicalStaff[]>([]);
  const [formData, setFormData] = useState({
    specialtyId: '',
    medicalStaffId: '',
    date: '',
    time: '',
    notes: ''
  });

  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.specialtyId) {
      const filtered = medicalStaff.filter(staff => staff.specialtyId === formData.specialtyId);
      setFilteredStaff(filtered);
      // Reset medical staff selection if current selection doesn't match specialty
      if (formData.medicalStaffId && !filtered.find(staff => staff.id === formData.medicalStaffId)) {
        setFormData(prev => ({ ...prev, medicalStaffId: '' }));
      }
    } else {
      setFilteredStaff([]);
      setFormData(prev => ({ ...prev, medicalStaffId: '' }));
    }
  }, [formData.specialtyId, medicalStaff]);

  const loadData = () => {
    setSpecialties(getSpecialties());
    setMedicalStaff(getMedicalStaff());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.specialtyId || !formData.medicalStaffId || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Check if appointment date is in the future
    const selectedDateTime = new Date(formData.date + ' ' + formData.time);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      toast({
        title: "Error",
        description: "La fecha y hora de la cita debe ser en el futuro",
        variant: "destructive",
      });
      return;
    }

    // Check if there's already an appointment at this time with this doctor
    const existingAppointments = getAppointments();
    const conflictingAppointment = existingAppointments.find(app => 
      app.medicalStaffId === formData.medicalStaffId &&
      app.date === formData.date &&
      app.time === formData.time &&
      app.status === 'scheduled'
    );

    if (conflictingAppointment) {
      toast({
        title: "Error",
        description: "Ya existe una cita programada para esta fecha y hora con este médico",
        variant: "destructive",
      });
      return;
    }

    // Find patient ID (assuming session userId corresponds to patient)
    const users = getUsers();
    const patientUser = users.find(u => u.id === session?.userId && u.role === 'patient');
    
    if (!patientUser) {
      toast({
        title: "Error",
        description: "No se pudo identificar el paciente",
        variant: "destructive",
      });
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientId: patientUser.id,
      medicalStaffId: formData.medicalStaffId,
      specialtyId: formData.specialtyId,
      date: formData.date,
      time: formData.time,
      status: 'scheduled',
      notes: formData.notes || undefined,
      emailSent: true, // Simulate email sending
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedAppointments = [...existingAppointments, newAppointment];
    saveAppointments(updatedAppointments);

    toast({
      title: "Cita solicitada",
      description: "Tu cita ha sido programada correctamente. Se ha enviado un email de confirmación.",
    });

    // Reset form
    setFormData({
      specialtyId: '',
      medicalStaffId: '',
      date: '',
      time: '',
      notes: ''
    });
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum tomorrow
    return today.toISOString().split('T')[0];
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Solicitar Nueva Cita</h2>
        <p className="text-blue-600">
          Completa el formulario para programar tu cita médica
        </p>
      </div>

      <Card className="bg-white shadow-lg border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Plus className="h-5 w-5 mr-2" />
            Nueva Cita Médica
          </CardTitle>
          <CardDescription className="text-blue-600">
            Selecciona la especialidad, médico y horario para tu cita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="specialtyId" className="text-blue-900 flex items-center mb-2">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Especialidad *
                </Label>
                <Select 
                  value={formData.specialtyId} 
                  onValueChange={(value) => setFormData({...formData, specialtyId: value})}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="medicalStaffId" className="text-blue-900 flex items-center mb-2">
                  <User className="h-4 w-4 mr-2" />
                  Médico *
                </Label>
                <Select 
                  value={formData.medicalStaffId} 
                  onValueChange={(value) => setFormData({...formData, medicalStaffId: value})}
                  disabled={!formData.specialtyId}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder={
                      formData.specialtyId 
                        ? "Selecciona un médico" 
                        : "Primero selecciona una especialidad"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date" className="text-blue-900 flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Fecha *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  min={getMinDate()}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="time" className="text-blue-900 flex items-center mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Hora *
                </Label>
                <Select 
                  value={formData.time} 
                  onValueChange={(value) => setFormData({...formData, time: value})}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTimeSlots().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-blue-900 mb-2 block">
                Notas adicionales
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="border-blue-200 focus:border-blue-500"
                placeholder="Describe síntomas o información adicional (opcional)"
                rows={4}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                <Plus className="h-4 w-4 mr-2" />
                Solicitar Cita
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentBooking;
