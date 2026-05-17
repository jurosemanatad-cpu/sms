// Mock data store for demo mode (when database is not available)
// This runs entirely in-memory and resets on server restart.

type MockRole = "ADMIN" | "TEACHER" | "STUDENT";

interface MockUser {
  id: string;
  email: string;
  password: string;
  role: MockRole;
  isApproved: boolean;
  name?: string;
  gradeLevel?: number;
  subjectSpecialty?: string;
  studentId?: string;
  createdAt: string;
}

// Seed users for instant demo login
export const mockUsers: MockUser[] = [
  {
    id: "demo-admin-1",
    email: "admin@school.com",
    password: "123456",
    role: "ADMIN",
    isApproved: true,
    name: "Demo Admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-teacher-1",
    email: "teacher@school.com",
    password: "123456",
    role: "TEACHER",
    isApproved: true,
    name: "Demo Teacher",
    subjectSpecialty: "Mathematics",
    createdAt: new Date().toISOString()
  }
];

// In-memory mock students (for pending approvals, etc.)
export const mockStudents: any[] = [];

export const isMockMode = () => {
  // Will be set to true by db-check when connection fails
  return (global as any).__MOCK_MODE__ === true;
};

export const setMockMode = (value: boolean) => {
  (global as any).__MOCK_MODE__ = value;
};

export const authenticateMock = (email: string, password: string) => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) return null;

  if (!user.isApproved) {
    return { error: "Account pending admin approval." };
  }

  const { password: _, ...userWithoutPassword } = user;
  return {
    user: {
      ...userWithoutPassword,
      studentId: user.studentId
    },
    token: `demo-token-${user.id}-${Date.now()}`
  };
};

export const registerMock = (
  email: string,
  password: string,
  role: MockRole,
  name: string,
  gradeLevel?: number,
  subjectSpecialty?: string
) => {
  // Check for duplicate
  if (mockUsers.find(u => u.email === email)) {
    return { error: "User already exists" };
  }

  const newId = `mock-${role.toLowerCase()}-${Date.now()}`;
  const studentId = role === "STUDENT" ? `mock-student-${Date.now()}` : undefined;

  const newUser: MockUser = {
    id: newId,
    email,
    password, // plain text in mock mode only
    role,
    isApproved: role !== "STUDENT", // Students require admin approval
    name,
    gradeLevel,
    subjectSpecialty,
    studentId,
    createdAt: new Date().toISOString()
  };

  mockUsers.push(newUser);

  // Also add to mock students list
  if (role === "STUDENT" && studentId) {
    mockStudents.push({
      id: studentId,
      userId: newId,
      name,
      email,
      gradeLevel,
      classId: null,
      class: null,
      createdAt: new Date().toISOString()
    });
  }

  if (role === "STUDENT") {
    return { message: "Registration submitted. Waiting for admin approval." };
  }

  const { password: _, ...userWithoutPassword } = newUser;
  return {
    user: userWithoutPassword,
    token: `demo-token-${newId}-${Date.now()}`
  };
};

export const getPendingMockStudents = () => {
  return mockUsers
    .filter(u => u.role === "STUDENT" && !u.isApproved)
    .map(u => ({
      id: u.id,
      email: u.email,
      createdAt: u.createdAt,
      student: mockStudents.find(s => s.userId === u.id) || null
    }));
};

export const approveMockStudent = (userId: string) => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return null;
  user.isApproved = true;
  return { message: "Student approved", user };
};
