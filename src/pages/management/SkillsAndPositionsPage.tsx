import { useState } from 'react';
import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useSkills, useAddSkill, useUpdateSkill, useDeleteSkill } from '@/hooks/useSkills';
import { usePositions, useAddPosition, useUpdatePosition, useDeletePosition } from '@/hooks/usePositions';
import { useDepartments } from '@/hooks/useDepartments';

export default function SkillsAndPositionsPage() {
  const [skillDialog, setSkillDialog] = useState(false);
  const [positionDialog, setPositionDialog] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [editingPosition, setEditingPosition] = useState<any>(null);

  const { data: skills } = useSkills();
  const { data: positions } = usePositions();
  const { data: departments } = useDepartments();
  const addSkill = useAddSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const addPosition = useAddPosition();
  const updatePosition = useUpdatePosition();
  const deletePosition = useDeletePosition();

  const [skillForm, setSkillForm] = useState({ name: '', category: '', description: '' });
  const [positionForm, setPositionForm] = useState({
    title: '',
    department_id: '',
    description: '',
    seniority_level: '' as any,
  });

  const handleSkillSubmit = () => {
    if (!skillForm.name.trim()) return;

    if (editingSkill) {
      updateSkill.mutate({ id: editingSkill.id, ...skillForm }, {
        onSuccess: () => {
          setSkillDialog(false);
          resetSkillForm();
        },
      });
    } else {
      addSkill.mutate(skillForm, {
        onSuccess: () => {
          setSkillDialog(false);
          resetSkillForm();
        },
      });
    }
  };

  const handlePositionSubmit = () => {
    if (!positionForm.title.trim()) return;

    const data = {
      ...positionForm,
      department_id: positionForm.department_id || undefined,
      seniority_level: positionForm.seniority_level || undefined,
    };

    if (editingPosition) {
      updatePosition.mutate({ id: editingPosition.id, ...data }, {
        onSuccess: () => {
          setPositionDialog(false);
          resetPositionForm();
        },
      });
    } else {
      addPosition.mutate(data, {
        onSuccess: () => {
          setPositionDialog(false);
          resetPositionForm();
        },
      });
    }
  };

  const resetSkillForm = () => {
    setSkillForm({ name: '', category: '', description: '' });
    setEditingSkill(null);
  };

  const resetPositionForm = () => {
    setPositionForm({ title: '', department_id: '', description: '', seniority_level: '' });
    setEditingPosition(null);
  };

  const handleEditSkill = (skill: any) => {
    setEditingSkill(skill);
    setSkillForm({
      name: skill.name,
      category: skill.category || '',
      description: skill.description || '',
    });
    setSkillDialog(true);
  };

  const handleEditPosition = (position: any) => {
    setEditingPosition(position);
    setPositionForm({
      title: position.title,
      department_id: position.department_id || '',
      description: position.description || '',
      seniority_level: position.seniority_level || '',
    });
    setPositionDialog(true);
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      Junior: 'bg-blue-500/10 text-blue-500',
      Mid: 'bg-green-500/10 text-green-500',
      Senior: 'bg-purple-500/10 text-purple-500',
      Lead: 'bg-orange-500/10 text-orange-500',
      Director: 'bg-red-500/10 text-red-500',
    };
    return colors[level] || 'bg-muted text-muted-foreground';
  };

  return (
    <ManagementLayout title="Skills & Positions">
      <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold">Skills & Positions</h1>
              <p className="text-muted-foreground">Manage organizational skills catalog and position definitions</p>
            </div>

            <Tabs defaultValue="skills" className="w-full">
              <TabsList>
                <TabsTrigger value="skills">Skills Catalog</TabsTrigger>
                <TabsTrigger value="positions">Positions</TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Skills</CardTitle>
                    <Dialog open={skillDialog} onOpenChange={(open) => { setSkillDialog(open); if (!open) resetSkillForm(); }}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                           <div>
                            <Label>Name *</Label>
                            <Input
                              value={skillForm.name}
                              onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., React, Project Management"
                            />
                          </div>
                          <div>
                            <Label>Category</Label>
                            <Input
                              value={skillForm.category}
                              onChange={(e) => setSkillForm(prev => ({ ...prev, category: e.target.value }))}
                              placeholder="e.g., Technical, Leadership"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={skillForm.description}
                              onChange={(e) => setSkillForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe this skill..."
                            />
                          </div>
                          <Button onClick={handleSkillSubmit} className="w-full">
                            {editingSkill ? 'Update' : 'Add'} Skill
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skills?.map((skill) => (
                          <TableRow key={skill.id}>
                            <TableCell className="font-medium">{skill.name}</TableCell>
                            <TableCell>
                              {skill.category && (
                                <Badge variant="outline">{skill.category}</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {skill.description}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditSkill(skill)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteSkill.mutate(skill.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="positions" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Positions</CardTitle>
                    <Dialog open={positionDialog} onOpenChange={(open) => { setPositionDialog(open); if (!open) resetPositionForm(); }}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Position
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingPosition ? 'Edit Position' : 'Add New Position'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Title *</Label>
                            <Input
                              value={positionForm.title}
                              onChange={(e) => setPositionForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g., Senior Software Engineer"
                            />
                          </div>
                          <div>
                            <Label>Department</Label>
                            <Select
                              value={positionForm.department_id}
                              onValueChange={(value) => setPositionForm(prev => ({ ...prev, department_id: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments?.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Seniority Level</Label>
                            <Select
                              value={positionForm.seniority_level}
                              onValueChange={(value) => setPositionForm(prev => ({ ...prev, seniority_level: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                {['Junior', 'Mid', 'Senior', 'Lead', 'Director'].map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={positionForm.description}
                              onChange={(e) => setPositionForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe this position..."
                            />
                          </div>
                          <Button onClick={handlePositionSubmit} className="w-full">
                            {editingPosition ? 'Update' : 'Add'} Position
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positions?.map((position) => (
                          <TableRow key={position.id}>
                            <TableCell className="font-medium">{position.title}</TableCell>
                            <TableCell>
                              {position.seniority_level && (
                                <Badge className={getLevelColor(position.seniority_level)}>
                                  {position.seniority_level}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {position.description}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditPosition(position)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deletePosition.mutate(position.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
      </div>
    </ManagementLayout>
  );
}
