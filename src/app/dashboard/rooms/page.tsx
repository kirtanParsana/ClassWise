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
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";

import type { Room } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useMasterData } from "@/context/master-data-context";

export default function RoomsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();

  const { rooms, loading } = useMasterData();

  const filteredRooms = (rooms ?? []).filter((room: Room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (!selectedRoom) return;

    deleteDocumentNonBlocking(doc(db, "rooms", selectedRoom.id));
    toast({ title: "Success", description: "Room deleted successfully." });

    setIsDeleteAlertOpen(false);
    setSelectedRoom(null);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const roomId =
      selectedRoom?.id ?? doc(collection(db, "rooms")).id;

    const newRoomData: Room = {
      id: roomId,
      name: formData.get("name") as string,
      capacity: Number(formData.get("capacity")),
      isLab: formData.get("isLab") === "on",
    };

    setDocumentNonBlocking(
      doc(db, "rooms", roomId),
      newRoomData,
      { merge: true }
    );

    toast({
      title: "Success",
      description: selectedRoom
        ? "Room updated successfully."
        : "Room added successfully.",
    });

    setIsFormOpen(false);
    setSelectedRoom(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-headline">
                Rooms & Labs
              </CardTitle>
              <CardDescription>
                Manage all classrooms, labs, and facilities.
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  className="pl-8 w-[240px]"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Room
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
                  <TableHead>Room Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .map(room => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">
                        {room.name}
                      </TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            room.isLab ? "destructive" : "outline"
                          }
                        >
                          {room.isLab ? "Lab" : "Classroom"}
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
                            <DropdownMenuLabel>
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRoom(room);
                                setIsFormOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedRoom(room);
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
            <DialogTitle>
              {selectedRoom ? "Edit Room" : "Add Room"}
            </DialogTitle>
            <DialogDescription>
              Enter room details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Room Name"
              defaultValue={selectedRoom?.name}
              required
            />
            <Input
              name="capacity"
              type="number"
              placeholder="Capacity"
              defaultValue={selectedRoom?.capacity}
              required
            />

            <div className="flex items-center gap-2">
              <Checkbox
                id="isLab"
                name="isLab"
                defaultChecked={selectedRoom?.isLab}
              />
              <Label htmlFor="isLab">This is a lab</Label>
            </div>

            <DialogFooter>
              <Button type="submit">
                {selectedRoom ? "Save Changes" : "Add Room"}
              </Button>
            </DialogFooter>
          </form>
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
              Delete this room?
            </AlertDialogTitle>
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
    </>
  );
}
