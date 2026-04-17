const MedicalRecord = require('../models/MedicalRecord');
const cloudinary    = require('../config/cloudinary');

// ─── Helper: Upload file buffer to Cloudinary ──────────────────────────────
// PDFs use resource_type 'raw', images use 'image'
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype === 'application/pdf' ? 'raw' : 'image';

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'medical-records', resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else       resolve(result);
      }
    );

    stream.end(buffer); // Send file buffer into the stream
  });
};

// ─── POST /api/records/upload ──────────────────────────────────────────────
// Protected | Patient & Doctor | Upload a medical file to Cloudinary + save to DB
exports.uploadRecord = async (req, res) => {
  try {
    // Ensure a file was attached to the request
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, description, category, patientId } = req.body;

    // title and patientId are mandatory fields
    if (!title || !patientId) {
      return res.status(400).json({ success: false, message: 'Title and patientId are required' });
    }

    // Upload file to Cloudinary and get back URL + public_id
    const result   = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

    // Save record metadata to MongoDB (not the file itself)
    const record = await MedicalRecord.create({
      patientId,
      uploadedBy:   req.user.userId,
      uploaderRole: req.user.role,
      title,
      description:  description || '',
      fileUrl:      result.secure_url, // Cloudinary URL to access the file
      filePublicId: result.public_id,  // Cloudinary ID to delete the file later
      fileType,
      fileName:     req.file.originalname,
      fileSize:     req.file.size,
      category:     category || 'other'
    });

    res.status(201).json({ success: true, data: record });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/records/patient/:patientId ───────────────────────────────────
// Protected | Patient & Doctor | Get all records for a patient (newest first)
exports.getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Patients can only view their own records, doctors can view any
    if (req.user.role === 'patient' && req.user.userId !== patientId) {
      return res.status(403).json({ success: false, message: 'You can only view your own records' });
    }

    const records = await MedicalRecord.find({ patientId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/records/:id ──────────────────────────────────────────────────
// Protected | Patient & Doctor | Get a single record by ID
exports.getSingleRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Patients can only view their own records, doctors can view any
    if (req.user.role === 'patient' && record.patientId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: record });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/records/:id ───────────────────────────────────────────────
// Protected | Patient & Doctor | Delete record from DB + remove file from Cloudinary
exports.deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Only the original uploader can delete the record
    if (record.uploadedBy !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own uploaded records' });
    }

    // Delete file from Cloudinary first (PDFs are 'raw', images are 'image')
    const resourceType = record.fileType === 'pdf' ? 'raw' : 'image';
    await cloudinary.uploader.destroy(record.filePublicId, { resource_type: resourceType });

    // Then remove the record from MongoDB
    await record.deleteOne();
    res.status(200).json({ success: true, message: 'Record deleted successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};