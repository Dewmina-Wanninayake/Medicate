// src/middleware/auth.js

const protect = (req, res, next) => {
  // EMERGENCY BYPASS: Manually creating a user object
  // This tells the rest of your app that "Dr. Test" is logged in
  req.user = { 
    userId: "640a1b2c3d4e6f6g7h8i9j0", // A fake MongoDB-style ID
    role: "doctor", 
    name: "Dr. Test2" 
  };
  
  console.log("⚠️ AUTH BYPASS ACTIVE: Skipping JWT check for testing.");
  next(); // Go straight to the controller!
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // Since we hardcoded 'doctor' above, this will always pass for 'doctor'
    next();
  };
};

module.exports = { protect, authorize };