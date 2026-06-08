import { useState } from 'react'

export default function ImageUploader({ onUpload, label = 'Upload image' }) {
  const [status, setStatus] = useState('')
  const [preview, setPreview] = useState('')

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setStatus('Uploading...')
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.error || response.statusText || 'Upload failed')
      }
      const url = result.url
      setStatus('Upload successful')
      setPreview(url)
      onUpload(url)
    } catch (error) {
      setStatus(error.message || 'Upload failed')
      setPreview('')
      onUpload('')
    }
  }

  return (
    <div className="image-uploader">
      <label className="upload-label">
        {label}
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </label>
      {status && <p className="upload-status">{status}</p>}
      {preview && (
        <div className="upload-preview">
          <img src={preview} alt="Uploaded preview" />
          <p>{preview}</p>
        </div>
      )}
    </div>
  )
}
