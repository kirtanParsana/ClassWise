"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Loader2, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import type { Section } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useCollection } from "@/firebase/firestore/use-collection";
import {
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase";

export default function SectionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();

  // ✅ Correct Firestore usage
  const { data: sections, loading } =
    useCollection<Section>(collection(db, "sections"));

  const filteredSections = sections?.filter(section =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (!selectedSection) return;

    deleteDocumentNonBlocking(
      doc(db, "sections", selectedSection.id)
    );

    toast({
      title: "Success",
      description: "Section deleted successfully.",
    });

    setIsDeleteAlertOpen(false);
    setSelectedSection(null);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const sectionId =
      selectedSection?.id ??
      doc(collection(db, "sections")).id;

    const newSection: Section = {
      id: sectionId,
      name: formData.get("name") as string,
      strength: Number(formData.get("strength")),
    };

    setDocumentNonBlocking(
      doc(db, "sections", sectionId),
      newSection,
      { merge: true }
    );

    toast({
      title: "Success",
      description: `Section ${selectedSection ? "updated" : "added"}.`,
    });

    setIsFormOpen(false);
    setSelectedSection(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-headline">Sections</CardTitle>
              <CardDescription>
                Manage all academic sections.
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sections..."
                  className="pl-8 w-[240px]"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section Name</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSections
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .map(section => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">
                        {section.name}
                      </TableCell>
                      <TableCell>{section.strength}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSection(section);
                                setIsFormOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedSection(section);
                                setIsDeleteAlertOpen(true);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">
              {selectedSection ? "Edit Section" : "Add New Section"}
            </DialogTitle>
            <DialogDescription>
              {selectedSection
                ? "Update the details of the section."
                : "Fill in the details for the new section."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Section Name</Label>
                <Input
                  name="name"
                  defaultValue={selectedSection?.name}
                  placeholder="e.g., A, B, C1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Strength</Label>
                <Input
                  name="strength"
                  type="number"
                  defaultValue={selectedSection?.strength}
                  placeholder="e.g., 60"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedSection ? "Save Changes" : "Add Section"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete section &quot;
              {selectedSection?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
