import { useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * Drag-and-drop / click-to-upload component.
 * Uploads to Supabase Storage and calls onUpload with the public URL.
 *
 * Props:
 *   bucket     {string}   Supabase Storage bucket name
 *   pathPrefix {string}   Folder prefix, e.g. 'maintenance/photos'
 *   accept     {string}   MIME types, e.g. 'image/*'
 *   multiple   {boolean}
 *   onUpload   {(urls: string[]) => void}
 */
export default function FileUpload({ bucket = 'documents', pathPrefix = 'uploads', accept = 'image/*', multiple = false, onUpload }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)

  async function uploadFiles(files) {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)
    try {
      const urls = []
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()
        const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(path, file, { contentType: file.type, upsert: false })
        if (uploadErr) throw uploadErr
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        urls.push(data.publicUrl)
      }
      if (onUpload) onUpload(urls)
    } catch (err) {
      setError(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    uploadFiles(e.dataTransfer.files)
  }

  return (
    <div className='flex flex-col gap-2'>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragging ? 'border-brand-terra bg-orange-50' : 'border-gray-300 hover:border-brand-terra'
        }`}
      >
        <p className='text-sm text-gray-500'>
          {uploading ? 'Uploading...' : 'Drag & drop or click to upload'}
        </p>
        <input
          ref={inputRef}
          type='file'
          accept={accept}
          multiple={multiple}
          className='hidden'
          onChange={e => uploadFiles(e.target.files)}
        />
      </div>
      {error && (
        <p className='text-xs text-red-600'>{error}</p>
      )}
    </div>
  )
}
