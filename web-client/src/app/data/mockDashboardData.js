export const mockDoctors = [
  { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiology", verified: true, patients: 156, revenue: "12,450" },
  { id: 2, name: "Dr. Michael Chen", specialty: "Neurology", verified: false, patients: 89, revenue: "8,200" },
  { id: 3, name: "Dr. Emily Wilson", specialty: "Pediatrics", verified: true, patients: 210, revenue: "15,100" },
];

export const mockAllPatients = [
  { id: 101, name: "Alice Thompson", age: 28, lastVisit: "2024-03-12", condition: "Hypertension", history: ["Mild fever", "Blood pressure monitoring"] },
  { id: 102, name: "Robert Miller", age: 45, lastVisit: "2024-03-10", condition: "Diabetes Type 2", history: ["Insulin adjustment", "Annual checkup"] },
  { id: 103, name: "James Anderson", age: 62, lastVisit: "2024-03-08", condition: "Stable Angina", history: ["Stress test completed", "Medication refill"] },
];

export const mockMessages = [
  { id: 1, sender: "Alice Thompson", content: "Doctor, should I continue the meds?", time: "2h ago", unread: true },
  { id: 2, sender: "Lab Services", content: "Blood results for Robert Miller are ready.", time: "4h ago", unread: false },
  { id: 3, sender: "System", content: "Your license verification is complete.", time: "1d ago", unread: false },
];

export const mockSystemOversight = {
  activeUsers: 2450,
  pendingAppointments: 124,
  totalServices: 8,
  serverStatus: "Optimal",
  recentPayments: [
    { id: "P1", user: "Alice Thompson", amount: "$150", date: "2024-04-15", status: "Completed" },
    { id: "P2", user: "Robert Miller", amount: "$80", date: "2024-04-14", status: "Completed" },
    { id: "P3", user: "James Anderson", amount: "$210", date: "2024-04-14", status: "Processing" },
  ]
};

export const mockReports = [
  { id: "R1", title: "Complete Blood Count", type: "Lab Result", date: "2024-04-10", doctor: "Dr. Sarah Johnson", status: "Reviewed", patient: "Alice Thompson" },
  { id: "R2", title: "Chest X-Ray", type: "Radiology", date: "2024-04-12", doctor: "Dr. Michael Chen", status: "Pending", patient: "Alice Thompson" },
  { id: "R3", title: "Lipid Profile", type: "Lab Result", date: "2024-04-14", doctor: "Dr. Sarah Johnson", status: "Pending", patient: "Robert Miller" },
];
