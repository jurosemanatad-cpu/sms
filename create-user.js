const API_URL = "https://sms-api-3y9r.onrender.com";

async function createUser() {
  try {
    console.log("🔧 Creating user account...\n");
    
    // Create admin user
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@school.com",
        password: "123456",
        role: "ADMIN"
      })
    });

    if (response.status === 201) {
      const data = await response.json();
      console.log("✅ User created successfully!");
      console.log("📧 Email:", data.user.email);
      console.log("👤 Role:", data.user.role);
      console.log("🔑 Password: 123456");
      console.log("🌐 Login at: https://sms-web-gn32.onrender.com");
    } else if (response.status === 409) {
      console.log("✅ User already exists!");
      console.log("📧 Email: admin@school.com");
      console.log("🔑 Password: 123456");
      console.log("🌐 Login at: https://sms-web-gn32.onrender.com");
    } else {
      const error = await response.json();
      console.log("❌ Error:", error.message);
    }
  } catch (error) {
    console.error("❌ Failed:", error.message);
  }
}

createUser();
