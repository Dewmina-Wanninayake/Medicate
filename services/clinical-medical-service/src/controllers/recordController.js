const MedicalRecord = require('../models/MedicalRecord');
const path = require('path');

// POST /api/records/upload  — patient uploads a document
async function uploadRecord(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { title, description, recordType } = req.body;
    const record = await MedicalRecord.create({
      patientId: req.userId,
      title: title || req.file.originalname,
      description,
      recordType: recordType || 'uploaded_document',
      filePath: req.file.path,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedBy: req.userId,
      uploadedByRole: req.userRole,
    });

    const recordObj = record.toObject();
    // Use posix.basename to handle paths correctly regardless of platform
    recordObj.fileUrl = `/uploads/${path.posix.basename(record.filePath.replace(/\\/g, '/'))}`;
    
    console.log(`[Records] File uploaded: ${recordObj.fileName}, stored at: ${record.filePath}, URL: ${recordObj.fileUrl}`);
    res.status(201).json(recordObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/records  — patient views own records; doctor can view a patient's records
async function getRecords(req, res) {
  try {
    let filter = {};

    if (req.userRole === 'patient') {
      filter.patientId = req.userId;
    } else if (req.userRole === 'doctor') {
      // Doctor can query by patientId (e.g. ?patientId=xxx)
      const { patientId } = req.query;
      if (!patientId) return res.status(400).json({ error: 'patientId query param required for doctors' });
      filter.patientId = patientId;
    } else if (req.userRole === 'admin') {
      if (req.query.patientId) filter.patientId = req.query.patientId;
    }

    const records = await MedicalRecord.find(filter).sort({ createdAt: -1 });
    const recordsWithUrl = records.map(record => {
      const recordObj = record.toObject();
      if (recordObj.filePath) {
        // Ensure path uses forward slashes before getting basename
        const cleanPath = recordObj.filePath.replace(/\\/g, '/');
        recordObj.fileUrl = `/uploads/${path.posix.basename(cleanPath)}`;
      }
      return recordObj;
    });
    console.log(`[Records] Returning ${recordsWithUrl.length} records for user ${req.userId}`);
    res.json(recordsWithUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/records/:id
async function getRecordById(req, res) {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    // Access control: patient can only see own records; doctor any; admin any
    if (req.userRole === 'patient' && record.patientId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const recordObj = record.toObject();
    if (recordObj.filePath) {
      recordObj.fileUrl = `/uploads/${path.basename(recordObj.filePath)}`;
    }

    res.json(recordObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/records/:id — update title/description
async function updateRecord(req, res) {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    // Access control: only owner or admin can update
    if (req.userRole === 'patient' && record.patientId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, description, recordType } = req.body;
    if (title) record.title = title;
    if (description !== undefined) record.description = description;
    if (recordType) record.recordType = recordType;

    await record.save();
    
    const recordObj = record.toObject();
    if (recordObj.filePath) {
      recordObj.fileUrl = `/uploads/${path.basename(recordObj.filePath)}`;
    }
    
    res.json(recordObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// DELETE /api/records/:id
async function deleteRecord(req, res) {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    // Access control: only owner or admin can delete
    if (req.userRole === 'patient' && record.patientId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medical record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { uploadRecord, getRecords, getRecordById, deleteRecord, updateRecord };
