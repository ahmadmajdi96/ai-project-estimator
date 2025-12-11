import { useState } from "react";
import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Phone, Star, Search, GripVertical } from "lucide-react";
import { useCandidates, useAddCandidate, useUpdateCandidateStage, useJobPostings } from "@/hooks/useHR";

const stages = [
  { id: "applied", label: "Applied", color: "bg-blue-500" },
  { id: "screening", label: "Screening", color: "bg-yellow-500" },
  { id: "interview", label: "Interview", color: "bg-purple-500" },
  { id: "assessment", label: "Assessment", color: "bg-orange-500" },
  { id: "offer", label: "Offer", color: "bg-green-500" },
  { id: "hired", label: "Hired", color: "bg-emerald-500" },
  { id: "rejected", label: "Rejected", color: "bg-red-500" },
];

export default function HRCandidatesPage() {
  const { data: candidates, isLoading } = useCandidates();
  const { data: jobs } = useJobPostings();
  const addCandidate = useAddCandidate();
  const updateStage = useUpdateCandidateStage();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_posting_id: "",
    source: "",
  });

  const handleAddCandidate = async () => {
    if (!newCandidate.first_name || !newCandidate.last_name || !newCandidate.email) return;
    
    await addCandidate.mutateAsync(newCandidate);
    setIsAddDialogOpen(false);
    setNewCandidate({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      job_posting_id: "",
      source: "",
    });
  };

  const getCandidatesByStage = (stage: string) => {
    return candidates?.filter((c: any) => 
      c.stage === stage &&
      (searchTerm === "" || 
        c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];
  };

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.setData("candidateId", candidateId);
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData("candidateId");
    if (candidateId) {
      await updateStage.mutateAsync({ id: candidateId, stage: newStage });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
            <p className="text-muted-foreground">Manage your recruitment pipeline</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
                <DialogDescription>Enter the candidate's information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      value={newCandidate.first_name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input
                      value={newCandidate.last_name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newCandidate.phone}
                    onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Position</Label>
                  <Select
                    value={newCandidate.job_posting_id}
                    onValueChange={(value) => setNewCandidate({ ...newCandidate, job_posting_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs?.map((job: any) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select
                    value={newCandidate.source}
                    onValueChange={(value) => setNewCandidate({ ...newCandidate, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How did they find us?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="indeed">Indeed</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="website">Company Website</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCandidate} disabled={addCandidate.isPending}>
                  {addCandidate.isPending ? "Adding..." : "Add Candidate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading candidates...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="min-w-[250px]"
                onDrop={(e) => handleDrop(e, stage.id)}
                onDragOver={handleDragOver}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                      {stage.label}
                      <Badge variant="secondary" className="ml-auto">
                        {getCandidatesByStage(stage.id).length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 min-h-[200px]">
                    {getCandidatesByStage(stage.id).map((candidate: any) => (
                      <div
                        key={candidate.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate.id)}
                        className="p-3 bg-muted/50 rounded-lg cursor-move hover:bg-muted transition-colors border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">
                              {candidate.first_name} {candidate.last_name}
                            </p>
                            {candidate.job_posting?.title && (
                              <p className="text-xs text-muted-foreground">{candidate.job_posting.title}</p>
                            )}
                          </div>
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{candidate.email}</span>
                          </div>
                          {candidate.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {candidate.phone}
                            </div>
                          )}
                        </div>
                        {candidate.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < candidate.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {getCandidatesByStage(stage.id).length === 0 && (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        No candidates
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </HRLayout>
  );
}
