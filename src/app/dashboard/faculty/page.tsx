'use client';

import { useState, type FormEvent } from 'react';
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  PlusCircle,
  MoreHorizontal,
  Loader2,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";

import type { Faculty } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { collection, doc } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { useCollection } from '@/firebase/firestore/use-collection';
import {
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';

type PendingCsvRow = {
  id: string;
  name: string;
  email: string;
  department: string;
  selected: boolean;
};

export default function FacultyPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [pendingRows, setPendingRows] = useState<PendingCsvRow[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const { toast } = useToast();

  // ✅ Correct Firestore usage
  const { data: faculty, loading } =
    useCollection<Faculty>(collection(db, 'faculties'));

  const handleClearAllFaculty = async () => {
    if (!faculty?.length || isClearing) return;
    setIsClearing(true);
    try {
      await Promise.all(
        faculty.map((f) =>
          deleteDocumentNonBlocking(doc(db, "faculties", f.id))
        )
      );
      toast({
        title: "Faculty cleared",
        description: "All current faculty have been removed.",
      });
    } catch (error) {
      console.error("Failed to clear faculty", error);
      toast({
        title: "Clear failed",
        description: "Could not clear all faculty.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleCsvImport = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

      // Expect header: name,email,department
      const [headerLine, ...dataLines] = lines;
      const header = headerLine.toLowerCase();
      const hasExpectedColumns =
        header.includes("name") &&
        header.includes("email") &&
        header.includes("department");

      if (!hasExpectedColumns) {
        toast({
          title: "Invalid CSV format",
          description: "Expected columns: name, email, department.",
          variant: "destructive",
        });
        return;
      }

      const rows: PendingCsvRow[] = dataLines
        .map((line, index) => {
          const cells = line.split(",").map((c) => c.trim());
          if (cells.length < 3) return null;
          const [name, email, department] = cells;
          if (!name || !email || !department) return null;
          return {
            id: `row-${index}`,
            name,
            email,
            department,
            selected: true,
          };
        })
        .filter((r): r is PendingCsvRow => r !== null);

      if (!rows.length) {
        toast({
          title: "No valid rows",
          description: "CSV did not contain any valid faculty rows.",
          variant: "destructive",
        });
        return;
      }

      setPendingRows(rows);
      setIsReviewOpen(true);
    } catch (error) {
      console.error("CSV parse failed", error);
      toast({
        title: "Import failed",
        description: "Could not read CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    const selected = pendingRows.filter((r) => r.selected);
    if (!selected.length) {
      toast({
        title: "Nothing selected",
        description: "Select at least one faculty to import.",
      });
      return;
    }

    setIsImporting(true);
    try {
      await Promise.all(
        selected.map(async (row) => {
          const facultyRef = doc(collection(db, "faculties"));
          const id = facultyRef.id;

          const newFaculty: Faculty = {
            id,
            name: row.name,
            email: row.email,
            department: row.department,
            avatarUrl: `https://picsum.photos/seed/${id}/100/100`,
            avatarHint: "person portrait",
          };

          await setDocumentNonBlocking(facultyRef, newFaculty, { merge: true });
        })
      );

      toast({
        title: "Import complete",
        description: `Imported ${selected.length} faculty records from CSV.`,
      });
      setPendingRows([]);
      setIsReviewOpen(false);
    } catch (error) {
      console.error("CSV import failed", error);
      toast({
        title: "Import failed",
        description: "Could not import selected faculty.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!selectedFaculty) return;

    deleteDocumentNonBlocking(
      doc(db, 'faculties', selectedFaculty.id)
    );

    toast({
      title: "Success",
      description: "Faculty member deleted.",
    });

    setIsDeleteAlertOpen(false);
    setSelectedFaculty(null);
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFaculty) return;

    const formData = new FormData(e.currentTarget);
    const updatedFaculty: Faculty = {
      ...selectedFaculty,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      department: formData.get("department") as string,
    };

    setDocumentNonBlocking(
      doc(db, "faculties", selectedFaculty.id),
      updatedFaculty,
      { merge: true }
    );

    toast({
      title: "Success",
      description: "Faculty member updated.",
    });

    setIsFormOpen(false);
    setSelectedFaculty(null);
  };

  const filteredFaculty = faculty?.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-headline">Faculty</CardTitle>
              <CardDescription>
                Manage all faculty members and their details.
              </CardDescription>
            </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search faculty..."
                  className="pl-8 w-full sm:w-[240px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={isImporting}
                >
                  <label className="cursor-pointer">
                    {isImporting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Importing…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Upload CSV
                      </span>
                    )}
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleCsvImport(file);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isClearing || !faculty?.length}
                  onClick={handleClearAllFaculty}
                >
                  {isClearing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Clearing…
                    </>
                  ) : (
                    "Clear all faculty"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredFaculty
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .map(f => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <Image
                              src={f.avatarUrl}
                              alt={f.name}
                              width={40}
                              height={40}
                            />
                            <AvatarFallback>
                              {f.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{f.name}</span>
                        </div>
                      </TableCell>

                      <TableCell>{f.department}</TableCell>
                      <TableCell>{f.email}</TableCell>

                      <TableCell>
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
                                setSelectedFaculty(f);
                                setIsFormOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedFaculty(f);
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

      {/* CSV review dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">
              Choose faculty to import
            </DialogTitle>
            <DialogDescription>
              Select which rows from the CSV you want to add as faculty.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-72 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Checkbox
                        checked={row.selected}
                        onCheckedChange={(checked) => {
                          setPendingRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, selected: Boolean(checked) }
                                : r
                            )
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.department}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReviewOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmImport} disabled={isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing…
                </>
              ) : (
                "Import selected"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit faculty dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">Edit Faculty</DialogTitle>
            <DialogDescription>
              Update faculty member details.
            </DialogDescription>
          </DialogHeader>
          {selectedFaculty && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="faculty-name">Name</Label>
                <Input
                  id="faculty-name"
                  name="name"
                  defaultValue={selectedFaculty.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty-email">Email</Label>
                <Input
                  id="faculty-email"
                  name="email"
                  type="email"
                  defaultValue={selectedFaculty.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty-department">Department</Label>
                <Input
                  id="faculty-department"
                  name="department"
                  defaultValue={selectedFaculty.department}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setSelectedFaculty(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
              This will permanently delete &quot;
              {selectedFaculty?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
