import type { Course, Faculty, Room, ScheduleEntry, Conflict, Timeslot, Day } from './types';
import { PlaceHolderImages } from './placeholder-images';

const facultyImages = PlaceHolderImages.reduce((acc, img) => {
  acc[img.id] = { url: img.imageUrl, hint: img.imageHint };
  return acc;
}, {} as Record<string, { url: string; hint: string }>);

// Timeslot data is now defined locally to avoid Firestore permission issues.
export const localTimeslots: Timeslot[] = [
    { id: 'TS1', name: '9-10', day: 'Monday', order: 1 },
    { id: 'TS2', name: '10-11', day: 'Monday', order: 2 },
    { id: 'TS3', name: '11-12', day: 'Monday', order: 3 },
    { id: 'TS4', name: '12-1', day: 'Monday', order: 4 },
    { id: 'TS5', name: '2-3', day: 'Monday', order: 5 },
    { id: 'TS6', name: '3-4', day: 'Monday', order: 6 },
    { id: 'TS7', name: '4-5', day: 'Monday', order: 7 },
    { id: 'TS8', name: '9-10', day: 'Tuesday', order: 1 },
    { id: 'TS9', name: '10-11', day: 'Tuesday', order: 2 },
    { id: 'TS10', name: '11-12', day: 'Tuesday', order: 3 },
    { id: 'TS11', name: '12-1', day: 'Tuesday', order: 4 },
    { id: 'TS12', name: '2-3', day: 'Tuesday', order: 5 },
    { id: 'TS13', name: '3-4', day: 'Tuesday', order: 6 },
    { id: 'TS14', name: '4-5', day: 'Tuesday', order: 7 },
    { id: 'TS15', name: '9-10', day: 'Wednesday', order: 1 },
    { id: 'TS16', name: '10-11', day: 'Wednesday', order: 2 },
    { id: 'TS17', name: '11-12', day: 'Wednesday', order: 3 },
    { id: 'TS18', name: '12-1', day: 'Wednesday', order: 4 },
    { id: 'TS19', name: '2-3', day: 'Wednesday', order: 5 },
    { id: 'TS20', name: '3-4', day: 'Wednesday', order: 6 },
    { id: 'TS21', name: '4-5', day: 'Wednesday', order: 7 },
    { id: 'TS22', name: '9-10', day: 'Thursday', order: 1 },
    { id: 'TS23', name: '10-11', day: 'Thursday', order: 2 },
    { id: 'TS24', name: '11-12', day: 'Thursday', order: 3 },
    { id: 'TS25', name: '12-1', day: 'Thursday', order: 4 },
    { id: 'TS26', name: '2-3', day: 'Thursday', order: 5 },
    { id: 'TS27', name: '3-4', day: 'Thursday', order: 6 },
    { id: 'TS28', name: '4-5', day: 'Thursday', order: 7 },
    { id: 'TS29', name: '9-10', day: 'Friday', order: 1 },
    { id: 'TS30', name: '10-11', day: 'Friday', order: 2 },
    { id: 'TS31', name: '11-12', day: 'Friday', order: 3 },
    { id: 'TS32', name: '12-1', day: 'Friday', order: 4 },
    { id: 'TS33', name: '2-3', day: 'Friday', order: 5 },
    { id: 'TS34', name: '3-4', day: 'Friday', order: 6 },
    { id: 'TS35', name: '4-5', day: 'Friday', order: 7 }
];


// Mock data is kept for components that are not yet migrated to Firebase.
export const mockFaculty: Faculty[] = [
  { id: 'F1', name: 'Dr. Evelyn Reed', email: 'e.reed@university.edu', department: 'Computer Science', avatarUrl: facultyImages['faculty-1'].url, avatarHint: facultyImages['faculty-1'].hint },
  { id: 'F2', name: 'Dr. Samuel Mercer', email: 's.mercer@university.edu', department: 'Computer Science', avatarUrl: facultyImages['faculty-2'].url, avatarHint: facultyImages['faculty-2'].hint },
  { id: 'F3', name: 'Dr. Clara Bennett', email: 'c.bennett@university.edu', department: 'Electrical Engineering', avatarUrl: facultyImages['faculty-3'].url, avatarHint: facultyImages['faculty-3'].hint },
  { id: 'F4', name: 'Dr. Marcus Thorne', email: 'm.thorne@university.edu', department: 'Mathematics', avatarUrl: facultyImages['faculty-4'].url, avatarHint: facultyImages['faculty-4'].hint },
  { id: 'F5', name: 'Dr. Anika Sharma', email: 'a.sharma@university.edu', department: 'Computer Science', avatarUrl: facultyImages['faculty-5'].url, avatarHint: facultyImages['faculty-5'].hint },
  { id: 'F6', name: 'Dr. Kenji Tanaka', email: 'k.tanaka@university.edu', department: 'Physics', avatarUrl: facultyImages['faculty-6'].url, avatarHint: facultyImages['faculty-6'].hint },
];

export const mockCourses: Course[] = [
  { id: 'C1', name: 'Introduction to AI', code: 'CS101', credits: 3, facultyId: 'F1', requiresLab: false },
  { id: 'C2', name: 'Data Structures', code: 'CS201', credits: 4, facultyId: 'F2', requiresLab: true },
  { id: 'C3', name: 'Digital Circuits', code: 'EE205', credits: 3, facultyId: 'F3', requiresLab: true },
  { id: 'C4', name: 'Calculus III', code: 'MA301', credits: 4, facultyId: 'F4', requiresLab: false },
  { id: 'C5', name: 'Machine Learning', code: 'CS405', credits: 3, facultyId: 'F1', requiresLab: true },
  { id: 'C6', name: 'Algorithms', code: 'CS301', credits: 3, facultyId: 'F2', requiresLab: false },
  { id: 'C7', name: 'Quantum Physics', code: 'PH401', credits: 3, facultyId: 'F6', requiresLab: false },
];

export const mockRooms: Room[] = [
  { id: 'R1', name: 'Hall A', capacity: 120, isLab: false },
  { id: 'R2', name: 'Hall B', capacity: 80, isLab: false },
  { id: 'R3', name: 'CS Lab 1', capacity: 40, isLab: true },
  { id: 'R4', name: 'EE Lab', capacity: 30, isLab: true },
  { id: 'R5', name: 'Room 201', capacity: 50, isLab: false },
  { id: 'R6', name: 'Physics Lab', capacity: 25, isLab: true },
];

export const mockSchedule: ScheduleEntry[] = [
];

export const mockConflicts: Conflict[] = [
    { 
        id: 'CONF1', 
        description: "Dr. Evelyn Reed is scheduled for 'Introduction to AI' (CS101) in Hall A and 'Machine Learning' (CS405) in CS Lab 1 at the same time.",
        involved: ['Dr. Evelyn Reed', 'CS101', 'CS405'],
        type: "Faculty Overlap",
    },
    {
        id: 'CONF2',
        description: "CS Lab 1 is booked for 'Data Structures' (CS201) and a special workshop simultaneously.",
        involved: ['CS Lab 1', 'CS201', 'Special Workshop'],
        type: "Room Double Booking",
    },
    {
        id: 'CONF3',
        description: "Digital Circuits (EE205), a lab course, has been assigned to Hall B, which is a lecture hall without lab equipment.",
        involved: ['EE205', 'Hall B'],
        type: "Resource Mismatch",
    }
];

// DEPRECATED: These helpers will no longer work correctly with live data.
// Components should fetch related data directly or use context/props.
export const getFacultyName = (id: string) => mockFaculty.find(f => f.id === id)?.name || 'Unknown Faculty';
export const getCourseName = (id: string) => mockCourses.find(c => c.id === id)?.name || 'Unknown Course';
export const getCourseCode = (id: string) => mockCourses.find(c => c.id === id)?.code || 'N/A';
export const getRoomName = (id: string) => mockRooms.find(r => r.id === id)?.name || 'Unknown Room';
