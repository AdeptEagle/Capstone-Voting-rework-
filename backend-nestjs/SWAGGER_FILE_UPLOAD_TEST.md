# 📸 Swagger File Upload Testing Guide

## 🚀 **How to Test File Uploads in Swagger**

### **Step 1: Access Swagger UI**
1. Open your browser
2. Go to: `http://localhost:3001/api`
3. You'll see the **Voting System API v2.0** documentation

### **Step 2: Find File Upload Endpoints**
Look for the **"File Upload"** section in the Swagger UI. You'll see these endpoints:

- `POST /file-upload/upload/image` - Upload candidate photos
- `POST /file-upload/upload/document` - Upload documents
- `GET /file-upload/stats` - Get upload statistics
- `GET /file-upload/test` - Test service health

### **Step 3: Test Image Upload**
1. **Click on** `POST /file-upload/upload/image`
2. **Click "Try it out"** button
3. **Upload a test image**:
   - Click **"Choose File"** button
   - Select any image file (JPG, PNG, GIF, WebP)
   - **Maximum size**: 5MB
   - Click **"Execute"**
4. **Check the response**:
   ```json
   {
     "success": true,
     "message": "Image uploaded successfully",
     "file": {
       "originalName": "test-image.jpg",
       "filename": "uuid-generated-name.jpg",
       "mimetype": "image/jpeg",
       "size": 123456,
       "url": "/uploads/images/uuid-generated-name.jpg",
       "type": "image",
       "uploadedAt": "2025-08-03T10:48:11.160Z"
     }
   }
   ```

### **Step 4: Test Document Upload**
1. **Click on** `POST /file-upload/upload/document`
2. **Click "Try it out"** button
3. **Upload a test document**:
   - Click **"Choose File"** button
   - Select any document (PDF, DOC, DOCX, TXT)
   - **Maximum size**: 5MB
   - Click **"Execute"**
4. **Check the response** similar to image upload

### **Step 5: Check Upload Statistics**
1. **Click on** `GET /file-upload/stats`
2. **Click "Try it out"** then **"Execute"**
3. **View the statistics**:
   ```json
   {
     "totalFiles": 2,
     "images": 1,
     "documents": 1,
     "maxFileSize": "5MB",
     "allowedImageTypes": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
     "allowedDocumentTypes": [".pdf", ".doc", ".docx", ".txt"]
   }
   ```

### **Step 6: Test Service Health**
1. **Click on** `GET /file-upload/test`
2. **Click "Try it out"** then **"Execute"**
3. **Should return**:
   ```json
   {
     "success": true,
     "message": "File upload service is working correctly",
     "service": "FileUploadService",
     "timestamp": "2025-08-03T10:48:11.160Z"
   }
   ```

---

## 📋 **Test File Requirements**

### **✅ Supported Image Types:**
- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`

### **✅ Supported Document Types:**
- `.pdf`
- `.doc`
- `.docx`
- `.txt`

### **⚠️ File Size Limits:**
- **Maximum size**: 5MB per file
- **Validation**: Automatic file type and size checking

---

## 🎯 **Expected Results**

### **✅ Successful Upload:**
- File saved to `uploads/images/` or `uploads/documents/`
- Unique filename generated (UUID-based)
- URL returned for accessing the file
- File info including size, type, and upload timestamp

### **❌ Failed Upload (Common Issues):**
- **File too large**: "File size too large. Maximum size: 5MB"
- **Invalid file type**: "Invalid file type. Allowed types: .jpg, .jpeg, .png, .gif, .webp"
- **No file selected**: "No file uploaded"

---

## 🔗 **Accessing Uploaded Files**

After successful upload, you can access files at:
- **Images**: `http://localhost:3001/uploads/images/filename.jpg`
- **Documents**: `http://localhost:3001/uploads/documents/filename.pdf`

---

## 🎉 **Ready to Test!**

**Open your browser and go to**: `http://localhost:3001/api`

**Then follow the steps above to test file uploads directly in Swagger!** 🚀 