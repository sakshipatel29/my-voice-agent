import { db } from "@/lib/firebaseAdmin";

export async function initializeDatabase() {
  try {
    // Create users collection with a sample doctor
    await db.collection("users").doc("sample-doctor").set({
      name: "Dr. Sarah Smith",
      email: "sarah.smith@example.com",
      userType: "doctor",
      expertise: "General Medicine",
      createdAt: new Date().toISOString()
    });

    // Create a sample patient
    await db.collection("users").doc("sample-patient").set({
      name: "John Doe",
      email: "john.doe@example.com",
      userType: "patient",
      createdAt: new Date().toISOString()
    });

    // Create a sample conversation note
    await db.collection("conversation_notes").add({
      doctorName: "Dr. Sarah Smith",
      doctorExpertise: "General Medicine",
      patientName: "John Doe",
      conversation: "Initial consultation about seasonal allergies",
      summary: "Patient reported seasonal allergies with symptoms of sneezing and runny nose",
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    // Create a sample patient interaction
    await db.collection("patient_interactions").add({
      userId: "sample-patient",
      disease: "Seasonal Allergies",
      age: 30,
      severity: "Mild",
      symptoms: "Sneezing, runny nose, itchy eyes",
      doctorName: "Dr. Sarah Smith",
      doctorExpertise: "General Medicine",
      agentResponse: "Based on your symptoms, it appears to be seasonal allergies. I recommend trying over-the-counter antihistamines and avoiding known allergens.",
      finalized: true,
      createdAt: new Date().toISOString()
    });

    // Create a sample note
    await db.collection("notes").add({
      content: "Follow up with John Doe about allergy medication effectiveness",
      timestamp: new Date()
    });

    console.log("Database initialized successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error initializing database:", error);
    return { success: false, error };
  }
} 