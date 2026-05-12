// Mock authentication for demo mode when database is not available
export const mockUsers = [
  {
    id: "demo-admin-1",
    email: "admin@school.com",
    password: "123456", // In production, this would be hashed
    role: "ADMIN",
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-teacher-1", 
    email: "teacher@school.com",
    password: "123456",
    role: "TEACHER",
    createdAt: new Date().toISOString()
  }
];

export const authenticateMock = (email: string, password: string) => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: `demo-token-${user.id}-${Date.now()}`
    };
  }
  return null;
};
