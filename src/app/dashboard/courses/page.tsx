// 'use client';

// import { useState } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { PlusCircle, MoreHorizontal, Loader2, Search, AlertTriangle } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter
// } from '@/components/ui/dialog';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog"
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import type { Course, Faculty } from '@/lib/types';
// import { useToast } from '@/hooks/use-toast';
// import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
// import { collection, doc, deleteDoc } from 'firebase/firestore';
// import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';

// export default function CoursesPage() {
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const { toast } = useToast();
//   const firestore = useFirestore();

//   const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
//   const { data: courses, isLoading: isLoadingCourses } = useCollection<Course>(coursesQuery);

//   const facultyQuery = useMemoFirebase(() => collection(firestore, 'faculties'), [firestore]);
//   const { data: faculty, isLoading: isLoadingFaculty } = useCollection<Faculty>(facultyQuery);

//   const getFacultyInfo = (id: string) => {
//     const facultyMember = faculty?.find(f => f.id === id);
//     return {
//         name: facultyMember?.name || 'Unassigned',
//         exists: !!facultyMember
//     }
//   }

//   const handleAddClick = () => {
//     setSelectedCourse(null);
//     setIsFormOpen(true);
//   };

//   const handleEditClick = (course: Course) => {
//     setSelectedCourse(course);
//     setIsFormOpen(true);
//   };
  
//   const handleDeleteClick = (course: Course) => {
//     setSelectedCourse(course);
//     setIsDeleteAlertOpen(true);
//   };
  
//   const handleDeleteConfirm = () => {
//     if (selectedCourse) {
//       const docRef = doc(firestore, 'courses', selectedCourse.id);
//       deleteDocumentNonBlocking(docRef);
//       toast({ title: "Success", description: "Course deleted successfully." });
//     }
//     setIsDeleteAlertOpen(false);
//     setSelectedCourse(null);
//   };
  
//   const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     const courseId = selectedCourse ? selectedCourse.id : doc(collection(firestore, 'courses')).id;
    
//     const newCourseData: Course = {
//       id: courseId,
//       name: formData.get('name') as string,
//       code: formData.get('code') as string,
//       credits: parseInt(formData.get('credits') as string, 10),
//       facultyId: formData.get('facultyId') as string,
//       requiresLab: formData.get('type') === 'lab',
//     };

//     const docRef = doc(firestore, 'courses', courseId);
    
//     if (selectedCourse) {
//       setDocumentNonBlocking(docRef, newCourseData, { merge: true });
//       toast({ title: "Success", description: "Course updated successfully." });
//     } else {
//       setDocumentNonBlocking(docRef, newCourseData, {});
//       toast({ title: "Success", description: "Course added successfully." });
//     }
    
//     setIsFormOpen(false);
//     setSelectedCourse(null);
//   };

//   const filteredCourses = courses?.filter(course =>
//     course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     course.code.toLowerCase().includes(searchTerm.toLowerCase())
//   );
  
//   const isFacultyAssigned = (facultyId: string) => {
//     return faculty?.some(f => f.id === facultyId);
//   }

//   return (
//     <>
//       <Card>
//         <CardHeader>
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <CardTitle className="font-headline">Courses</CardTitle>
//               <CardDescription>Manage all academic courses offered.</CardDescription>
//             </div>
//             <div className="flex flex-col sm:flex-row items-center gap-2">
//               <div className="relative w-full sm:w-auto">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   type="search"
//                   placeholder="Search courses..."
//                   className="pl-8 sm:w-[200px] lg:w-[300px]"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <Button size="sm" onClick={handleAddClick} className="w-full sm:w-auto">
//                 <PlusCircle className="h-4 w-4 mr-2" />
//                 Add Course
//               </Button>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           {(isLoadingCourses || isLoadingFaculty) ? (
//              <div className="flex justify-center items-center h-64">
//               <Loader2 className="h-8 w-8 animate-spin text-primary" />
//              </div>
//           ) : (
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Course Name</TableHead>
//                 <TableHead>Code</TableHead>
//                 <TableHead>Credits</TableHead>
//                 <TableHead>Assigned Faculty</TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead><span className="sr-only">Actions</span></TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredCourses?.sort((a, b) => a.name.localeCompare(b.name)).map((course) => {
//                 const facultyInfo = getFacultyInfo(course.facultyId);
//                 return (
//                 <TableRow key={course.id}>
//                   <TableCell className="font-medium">{course.name}</TableCell>
//                   <TableCell>{course.code}</TableCell>
//                   <TableCell>{course.credits}</TableCell>
//                   <TableCell>
//                     {facultyInfo.exists ? (
//                         facultyInfo.name
//                     ) : (
//                         <span className="flex items-center gap-2 text-destructive font-semibold">
//                             <AlertTriangle className="h-4 w-4" />
//                             {facultyInfo.name}
//                         </span>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     <Badge variant={course.requiresLab ? "destructive" : "outline"}>
//                       {course.requiresLab ? "Lab" : "Classroom"}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button aria-haspopup="true" size="icon" variant="ghost">
//                           <MoreHorizontal className="h-4 w-4" />
//                           <span className="sr-only">Toggle menu</span>
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                         <DropdownMenuItem onSelect={() => handleEditClick(course)}>Edit</DropdownMenuItem>
//                         <DropdownMenuItem onSelect={() => handleDeleteClick(course)} className="text-destructive">Delete</DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               )})}
//             </TableBody>
//           </Table>
//           )}
//         </CardContent>
//       </Card>
      
//       {/* Form Dialog */}
//       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle className="font-headline">{selectedCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
//             <DialogDescription>
//               {selectedCourse ? 'Update the details of the course.' : 'Fill in the details for the new course.'}
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleFormSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="name">Course Name</Label>
//               <Input id="name" name="name" defaultValue={selectedCourse?.name} required />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="code">Course Code</Label>
//                 <Input id="code" name="code" defaultValue={selectedCourse?.code} required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="credits">Credits</Label>
//                 <Input id="credits" name="credits" type="number" defaultValue={selectedCourse?.credits} required />
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="facultyId">Assigned Faculty</Label>
//                 <Select name="facultyId" defaultValue={selectedCourse && isFacultyAssigned(selectedCourse.facultyId) ? selectedCourse.facultyId : undefined} required>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a faculty member" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {faculty?.map(f => (
//                       <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="type">Type</Label>
//                 <Select name="type" defaultValue={selectedCourse?.requiresLab ? 'lab' : 'classroom'} required>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select course type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="classroom">Classroom</SelectItem>
//                     <SelectItem value="lab">Lab</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
//               <Button type="submit">{selectedCourse ? 'Save Changes' : 'Add Course'}</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
      
//       {/* Delete Confirmation */}
//       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the course "{selectedCourse?.name}".
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }
"use client";

import { useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  MoreHorizontal,
  Loader2,
  Search,
  AlertTriangle,
  Check,
  ChevronsUpDown,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { Course } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/client";
import {
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase";
import { useMasterData } from "@/context/master-data-context";

export default function CoursesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [facultySearchTerm, setFacultySearchTerm] = useState("");
  const [isFacultyPickerOpen, setIsFacultyPickerOpen] = useState(false);

  const { toast } = useToast();
  const { courses, faculty, loading } = useMasterData();

  const filteredCourses = (courses ?? []).filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFacultyInfo = (id: string) => {
    const f = (faculty ?? []).find((x) => x.id === id);
    return { name: f?.name ?? "Unassigned", exists: !!f };
  };

  const selectedFacultyName = useMemo(
    () => (faculty ?? []).find((f) => f.id === selectedFacultyId)?.name ?? "",
    [faculty, selectedFacultyId]
  );

  const filteredFaculty = useMemo(() => {
    const term = facultySearchTerm.trim().toLowerCase();
    if (!term) return faculty ?? [];
    return (faculty ?? []).filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.email.toLowerCase().includes(term) ||
        f.department.toLowerCase().includes(term)
    );
  }, [faculty, facultySearchTerm]);

  const openAddCourseDialog = () => {
    setSelectedCourse(null);
    setSelectedFacultyId("");
    setFacultySearchTerm("");
    setIsFormOpen(true);
  };

  const openEditCourseDialog = (course: Course) => {
    setSelectedCourse(course);
    setSelectedFacultyId(course.facultyId);
    setFacultySearchTerm(getFacultyInfo(course.facultyId).name);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedCourse) return;
    deleteDocumentNonBlocking(doc(db, "courses", selectedCourse.id));
    toast({ title: "Success", description: "Course deleted successfully." });
    setIsDeleteAlertOpen(false);
    setSelectedCourse(null);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFacultyId) {
      toast({
        title: "Select faculty",
        description: "Please select a faculty member before saving.",
        variant: "destructive",
      });
      return;
    }
    const formData = new FormData(e.currentTarget);

    const courseId =
      selectedCourse?.id ?? doc(collection(db, "courses")).id;

    const newCourse: Course = {
      id: courseId,
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      credits: Number(formData.get("credits")),
      facultyId: selectedFacultyId,
      requiresLab: formData.get("type") === "lab",
    };

    setDocumentNonBlocking(doc(db, "courses", courseId), newCourse, {
      merge: true,
    });

    toast({
      title: "Success",
      description: selectedCourse
        ? "Course updated successfully."
        : "Course added successfully.",
    });

    setIsFormOpen(false);
    setSelectedCourse(null);
    setSelectedFacultyId("");
    setFacultySearchTerm("");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-headline">Courses</CardTitle>
              <CardDescription>
                Manage all academic courses offered.
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-8 w-[240px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button onClick={openAddCourseDialog}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Course
              </Button>
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
                  <TableHead>Code</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => {
                  const f = getFacultyInfo(course.facultyId);
                  return (
                    <TableRow key={course.id}>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>
                        {f.exists ? (
                          f.name
                        ) : (
                          <span className="flex items-center gap-1 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            {f.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            course.requiresLab ? "destructive" : "outline"
                          }
                        >
                          {course.requiresLab ? "Lab" : "Lecture"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                openEditCourseDialog(course);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedCourse(course);
                                setIsDeleteAlertOpen(true);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
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

      {/* Form dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setSelectedCourse(null);
            setSelectedFacultyId("");
            setFacultySearchTerm("");
            setIsFacultyPickerOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? "Edit Course" : "Add Course"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Name"
              defaultValue={selectedCourse?.name}
              required
            />
            <Input
              name="code"
              placeholder="Code"
              defaultValue={selectedCourse?.code}
              required
            />
            <Input
              name="credits"
              type="number"
              placeholder="Credits"
              defaultValue={selectedCourse?.credits}
              required
            />

            <input type="hidden" name="facultyId" value={selectedFacultyId} />

            <div className="space-y-2">
              <Label>Faculty</Label>
              <Popover
                open={isFacultyPickerOpen}
                onOpenChange={setIsFacultyPickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isFacultyPickerOpen}
                    className="w-full justify-between"
                  >
                    {selectedFacultyName || "Select faculty"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3">
                  <Input
                    placeholder="Type 1-2 letters to search faculty..."
                    value={facultySearchTerm}
                    onChange={(e) => setFacultySearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {filteredFaculty.length > 0 ? (
                      filteredFaculty.map((f) => (
                        <Button
                          key={f.id}
                          type="button"
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => {
                            setSelectedFacultyId(f.id);
                            setFacultySearchTerm(f.name);
                            setIsFacultyPickerOpen(false);
                          }}
                        >
                          <Check
                            className={`h-4 w-4 ${
                              selectedFacultyId === f.id
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          <span className="truncate">{f.name}</span>
                        </Button>
                      ))
                    ) : (
                      <p className="px-2 py-1 text-sm text-muted-foreground">
                        No faculty found.
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Select
              name="type"
              defaultValue={selectedCourse?.requiresLab ? "lab" : "classroom"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Course type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classroom">Lecture</SelectItem>
                <SelectItem value="lab">Lab</SelectItem>
              </SelectContent>
            </Select>

            <DialogFooter>
              <Button type="submit">
                {selectedCourse ? "Save Changes" : "Add Course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

