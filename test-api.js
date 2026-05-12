// Simple API test script
const API_URL = "http://localhost:3000";

// Test data
const testStudent = {
  name: "John Doe",
  email: "john.doe@test.com",
  gradeLevel: 10
};

const testClass = {
  name: "Math 101",
  gradeLevel: 10,
  academicYear: "2024-2025"
};

// Test functions
async function testAPI() {
  console.log("🧪 Testing School Management API...\n");

  try {
    // Test health endpoint
    console.log("1. Testing health endpoint...");
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health:", healthData);
    console.log("");

    // Test registration (create admin user)
    console.log("2. Testing user registration...");
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@school.com",
        password: "admin123",
        role: "ADMIN"
      })
    });
    
    if (registerResponse.status === 409) {
      console.log("✅ Admin user already exists");
    } else {
      const registerData = await registerResponse.json();
      console.log("✅ Registration:", registerData);
    }
    console.log("");

    // Test login
    console.log("3. Testing login...");
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@school.com",
        password: "admin123"
      })
    });
    const loginData = await loginResponse.json();
    console.log("✅ Login:", loginData);
    const token = loginData.token;
    console.log("");

    // Test adding a student
    console.log("4. Testing add student...");
    const addStudentResponse = await fetch(`${API_URL}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(testStudent)
    });
    const addedStudent = await addStudentResponse.json();
    console.log("✅ Added student:", addedStudent);
    const studentId = addedStudent.id;
    console.log("");

    // Test getting students
    console.log("5. Testing get students...");
    const getStudentsResponse = await fetch(`${API_URL}/students`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const students = await getStudentsResponse.json();
    console.log("✅ Students list:", students.length, "students");
    console.log("");

    // Test updating a student
    console.log("6. Testing update student...");
    const updateStudentResponse = await fetch(`${API_URL}/students/${studentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: "John Doe Updated",
        email: "john.doe@test.com",
        gradeLevel: 11
      })
    });
    const updatedStudent = await updateStudentResponse.json();
    console.log("✅ Updated student:", updatedStudent);
    console.log("");

    // Test creating a class
    console.log("7. Testing create class...");
    const createClassResponse = await fetch(`${API_URL}/classes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(testClass)
    });
    const createdClass = await createClassResponse.json();
    console.log("✅ Created class:", createdClass);
    const classId = createdClass.id;
    console.log("");

    // Test getting classes
    console.log("8. Testing get classes...");
    const getClassesResponse = await fetch(`${API_URL}/classes`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const classes = await getClassesResponse.json();
    console.log("✅ Classes list:", classes.length, "classes");
    console.log("");

    // Test assigning student to class
    console.log("9. Testing assign student to class...");
    const assignResponse = await fetch(`${API_URL}/students/${studentId}/class`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ classId })
    });
    const assignedStudent = await assignResponse.json();
    console.log("✅ Assigned student to class:", assignedStudent);
    console.log("");

    // Test deleting student
    console.log("10. Testing delete student...");
    const deleteStudentResponse = await fetch(`${API_URL}/students/${studentId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (deleteStudentResponse.status === 204) {
      console.log("✅ Student deleted successfully");
    }
    console.log("");

    // Test deleting class
    console.log("11. Testing delete class...");
    const deleteClassResponse = await fetch(`${API_URL}/classes/${classId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (deleteClassResponse.status === 204) {
      console.log("✅ Class deleted successfully");
    }
    console.log("");

    console.log("🎉 All API tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\nMake sure the API server is running on http://localhost:3000");
  }
}

// Run tests
testAPI();
