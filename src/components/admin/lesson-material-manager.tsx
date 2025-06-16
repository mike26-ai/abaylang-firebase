
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Video, Headphones, Puzzle, PlusCircle, Download, Search, Edit2, Trash2, UploadCloud } from "lucide-react" // Changed Filter to UploadCloud
import { useToast } from "@/hooks/use-toast"
import { db, storage } from "@/lib/firebase" // Import storage
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, Timestamp } from "firebase/firestore"
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Storage imports
import type { LessonMaterial } from "@/lib/types"
import { format } from "date-fns"
import { Spinner } from "@/components/ui/spinner"
import { Progress } from "@/components/ui/progress" // For upload progress

const iconMap: Record<LessonMaterial['type'], React.ReactElement> = {
  document: <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  audio: <Headphones className="w-4 h-4" />,
  interactive: <Puzzle className="w-4 h-4" />,
}

export function LessonMaterialManager() {
  const [materials, setMaterials] = useState<LessonMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterLevel, setFilterLevel] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newMaterial, setNewMaterial] = useState<Partial<Omit<LessonMaterial, 'id' | 'createdAt' | 'downloadUrl'>>>({
    title: "",
    type: "document",
    category: "",
    level: "beginner",
    description: "",
    fileName: "",
    fileSize: ""
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const { toast } = useToast()

  const fetchMaterials = async () => {
    setIsLoading(true)
    try {
      const materialsCol = collection(db, "lessonMaterials")
      const q = query(materialsCol, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const fetchedMaterials = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<LessonMaterial, 'id'>;
        return {
          id: doc.id,
          ...data,
        } as LessonMaterial;
      });
      setMaterials(fetchedMaterials)
    } catch (error) {
      console.error("Error fetching materials:", error)
      toast({ title: "Error", description: "Could not fetch lesson materials.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setNewMaterial(prev => ({
        ...prev,
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
      }));
    } else {
      setFile(null);
      setNewMaterial(prev => ({ ...prev, fileName: "", fileSize: ""}));
    }
  }

  const resetForm = () => {
    setNewMaterial({ title: "", type: "document", category: "", level: "beginner", description: "", fileName: "", fileSize: "" });
    setFile(null);
    setUploadProgress(null);
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title || !newMaterial.type || !newMaterial.category || !newMaterial.level || !newMaterial.description) {
      toast({ title: "Missing Fields", description: "Please fill in all required textual fields.", variant: "destructive" });
      return;
    }
    if (!file && newMaterial.type !== 'interactive') { // Interactive might not need a file
        toast({ title: "Missing File", description: "Please select a file to upload for this material type.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let fileDownloadUrl = "#placeholder_url"; // Default for interactive or if no file
      let uploadedFileName = newMaterial.fileName;
      let uploadedFileSize = newMaterial.fileSize;

      if (file) {
        const filePath = `lesson-materials/${Date.now()}_${file.name}`;
        const fileStorageRef = storageRef(storage, filePath);
        const uploadTask = uploadBytesResumable(fileStorageRef, file);

        await new Promise<void>((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    toast({ title: "Upload Failed", description: error.message, variant: "destructive"});
                    reject(error);
                },
                async () => {
                    fileDownloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    uploadedFileName = file.name;
                    uploadedFileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
                    resolve();
                }
            );
        });
      }

      const materialToAdd: Omit<LessonMaterial, 'id'> = {
        title: newMaterial.title!,
        type: newMaterial.type!,
        category: newMaterial.category!,
        level: newMaterial.level!,
        description: newMaterial.description!,
        downloadUrl: fileDownloadUrl,
        fileName: uploadedFileName,
        fileSize: uploadedFileSize,
        duration: newMaterial.type === 'video' || newMaterial.type === 'audio' ? newMaterial.duration : undefined,
        createdAt: serverTimestamp() as Timestamp,
      };

      await addDoc(collection(db, "lessonMaterials"), materialToAdd);

      toast({ title: "Success", description: "Lesson material added." });
      setIsAddDialogOpen(false);
      resetForm();
      fetchMaterials(); 
    } catch (error) {
      console.error("Error adding material:", error);
      // Toast for upload error is handled in the uploadTask error callback
      if (!file || (error as any)?.code !== 'storage/unknown') { // Avoid double toast for storage errors
        toast({ title: "Error", description: "Could not add lesson material.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = material.title.toLowerCase().includes(searchLower) ||
      material.description.toLowerCase().includes(searchLower) ||
      material.category.toLowerCase().includes(searchLower) ||
      (material.fileName && material.fileName.toLowerCase().includes(searchLower));
    const matchesType = filterType === "all" || material.type === filterType
    const matchesLevel = filterLevel === "all" || material.level === filterLevel
    return matchesSearch && matchesType && matchesLevel
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
        <p className="ml-2 text-muted-foreground">Loading materials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 border rounded-lg bg-card">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Lesson Material</DialogTitle>
              <DialogDescription>Fill in the details for the new learning resource.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMaterial} className="space-y-4 py-2">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={newMaterial.title || ""} onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={newMaterial.description || ""} onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={newMaterial.category || ""} onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })} placeholder="e.g., Grammar, Vocabulary" required />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newMaterial.type || "document"} onValueChange={(value) => setNewMaterial({ ...newMaterial, type: value as LessonMaterial['type'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="interactive">Interactive (No file upload)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={newMaterial.level || "beginner"} onValueChange={(value) => setNewMaterial({ ...newMaterial, level: value as LessonMaterial['level'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newMaterial.type === "video" || newMaterial.type === "audio") && (
                  <div>
                    <Label htmlFor="duration">Duration (e.g., 15:24)</Label>
                    <Input id="duration" value={newMaterial.duration || ""} onChange={(e) => setNewMaterial({ ...newMaterial, duration: e.target.value })} />
                  </div>
                )}
              </div>
              {newMaterial.type !== 'interactive' && (
                 <div>
                    <Label htmlFor="file">Material File</Label>
                    <Input id="file" type="file" onChange={handleFileChange} />
                    {file && <p className="text-xs text-muted-foreground mt-1">Selected: {file.name} ({(file.size / (1024*1024)).toFixed(2)} MB)</p>}
                 </div>
              )}
              {uploadProgress !== null && uploadProgress >= 0 && (
                <div className="space-y-1">
                    <Label>Upload Progress</Label>
                    <Progress value={uploadProgress} className="w-full h-2" />
                    <p className="text-xs text-muted-foreground text-right">{Math.round(uploadProgress)}%</p>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" onClick={resetForm}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" className="mr-2" /> : <UploadCloud className="mr-2 h-4 w-4"/>}
                  {isSubmitting ? (uploadProgress !== null ? 'Uploading...' : 'Processing...') : 'Add Material'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredMaterials.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium text-foreground">No materials found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or add new materials.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {iconMap[material.type]}
                      {material.title}
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{material.description}</p>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{material.type}</Badge></TableCell>
                  <TableCell>{material.category}</TableCell>
                  <TableCell><Badge variant="outline">{material.level}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{material.fileName || "N/A"}</TableCell>
                  <TableCell>{format(material.createdAt.toDate(), "PP")}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        asChild={material.downloadUrl !== "#placeholder_url"}
                        disabled={material.downloadUrl === "#placeholder_url"}
                    >
                      {material.downloadUrl !== "#placeholder_url" ? (
                        <a href={material.downloadUrl} target="_blank" rel="noopener noreferrer" title="Download Material">
                            <Download className="h-4 w-4" />
                        </a>
                      ) : (
                        <Download className="h-4 w-4 text-muted-foreground" /> // Show disabled or placeholder icon
                      )}
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled title="Edit (Coming Soon)">
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" disabled title="Delete (Coming Soon)">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
