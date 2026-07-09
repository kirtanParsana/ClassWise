export type Course = {
  id: string;
  name: string;
  code: string;
  credits: number;
  facultyId: string;
  requiresLab: boolean;
};

export type Faculty = {
  id: string;
  name: string;
  email: string;
  department: string;
  avatarUrl: string;
  avatarHint: string;
};

export type Room = {
  id: string;
  name: string;
  capacity: number;
  isLab: boolean;
};

export type Section = {
  id: string;
  name: string;
  strength: number;
};

export type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export const AllDays: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export type Timeslot = {
  id: string;
  name: string;
  day: Day;
  order: number;
};

export type ScheduleEntry = {
  courseId: string;
  roomId: string;
  facultyId: string;
  day: Day;
  timeslot: string; // This will now be the name of the timeslot, e.g. "9-10"
  section: string;
};

export type Conflict = {
  id: string;
  description: string;
  involved: string[]; // e.g., ['Faculty A', 'Room 101']
  type: "Faculty Overlap" | "Room Double Booking" | "Resource Mismatch";
}
