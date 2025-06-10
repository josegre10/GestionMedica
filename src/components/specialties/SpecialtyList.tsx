
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Specialty } from '@/types';
import { getSpecialties, saveSpecialties } from '@/services/localStorage';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash, Settings } from 'lucide-react';

const SpecialtyList: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = () => {
    setSpecialties(getSpecialties());
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setEditingSpecialty(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentSpecialties = getSpecialties();
    
    if (editingSpecialty) {
      const updatedSpecialties = currentSpecialties.map(s => 
        s.id === editingSpecialty.id 
          ? { ...s, ...formData, updatedAt: new Date().toISOString() }
          : s
      );
      saveSpecialties(updatedSpecialties);
      toast({
        title: "Especialidad actualizada",
        description: "La especialidad se ha actualizado correctamente",
      });
    } else {
      const newSpecialty: Specialty = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveSpecialties([...currentSpecialties, newSpecialty]);
      toast({
        title: "Especialidad agregada",
        description: "La especialidad se ha agregado correctamente",
      });
    }
    
    loadSpecialties();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      name: specialty.name,
      description: specialty.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (specialtyId: string) => {
    const currentSpecialties = getSpecialties();
    const updatedSpecialties = currentSpecialties.filter(s => s.id !== specialtyId);
    saveSpecialties(updatedSpecialties);
    loadSpecialties();
    toast({
      title: "Especialidad eliminada",
      description: "La especialidad se ha eliminado correctamente",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-blue-900">Gestión de Especialidades</CardTitle>
              <CardDescription>Administra las especialidades médicas del sistema</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Especialidad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-blue-900">
                    {editingSpecialty ? 'Editar Especialidad' : 'Nueva Especialidad'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSpecialty ? 'Modifica los datos de la especialidad' : 'Ingresa los datos de la nueva especialidad'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Especialidad</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="Ej: Cardiología, Neurología..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                      placeholder="Describe la especialidad médica..."
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    {editingSpecialty ? 'Actualizar' : 'Agregar'} Especialidad
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialties.map((specialty) => (
                <TableRow key={specialty.id}>
                  <TableCell className="font-medium">{specialty.name}</TableCell>
                  <TableCell>{specialty.description}</TableCell>
                  <TableCell>{new Date(specialty.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(specialty)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(specialty.id)}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecialtyList;
