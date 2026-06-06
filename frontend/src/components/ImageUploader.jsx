import { useState } from 'react'

export default function ImageUploader({ onUpload, label = 'Choose Image File', category = 'General' }) {
  const [status, setStatus] = useState('')
  const [preview, setPreview] = useState('')

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setStatus('Uploading…')
    setPreview('')

    try {
      // 1. Get a fresh CSRF token (legacy compatibility)
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' })
      if (!csrfRes.ok) throw new Error('Could not obtain CSRF token')
      const { csrfToken } = await csrfRes.json()

      // 2. Build multipart form and include category metadata
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category || 'General')

      // 3. Upload with CSRF token in header
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined,
        body: formData,
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Upload failed')
      }

      const url = result.url
      setStatus('✅ Uploaded successfully')
      setPreview(url)
      onUpload(url)
    } catch (error) {
      setStatus('❌ ' + (error.message || 'Upload failed'))
      setPreview('')
      onUpload('')
    }
  }

  return (
    <div className="image-uploader">
      <label className="upload-label">
        <span className="upload-icon">📁</span> {label}
        <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} />
      </label>
      {status && <p className="upload-status">{status}</p>}
      {preview && (
        <div className="upload-preview">
          <img src={preview} alt="Uploaded preview" />
          <p className="upload-preview-url">{preview}</p>
        </div>
      )}
    </div>
  )
}
