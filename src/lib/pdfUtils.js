import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { supabase } from './supabase'

/**
 * Embeds a base64 signature image into an existing lease PDF and returns
 * the modified PDF as a Uint8Array.
 *
 * @param {string} pdfUrl  - Public URL of the unsigned lease PDF in Supabase Storage
 * @param {string} sigDataUrl - Base64 data URL of the signature (from SignaturePad)
 * @param {string} tenantName - Tenant's full name for the typed signature block
 * @param {Date}   signedAt  - Timestamp of signing
 * @returns {Promise<Uint8Array>} Signed PDF bytes
 */
export async function embedSignature(pdfUrl, sigDataUrl, tenantName, signedAt) {
  const response = await fetch(pdfUrl)
  const existingPdfBytes = await response.arrayBuffer()

  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const pages = pdfDoc.getPages()
  const lastPage = pages[pages.length - 1]
  const { width } = lastPage.getSize()

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontSize = 10

  // Strip data URL header to get raw base64
  const base64Data = sigDataUrl.replace(/^data:image\/(png|jpeg);base64,/, '')
  const sigBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
  const sigImage = await pdfDoc.embedPng(sigBytes)

  const sigWidth = 200
  const sigHeight = 60
  const sigX = 60
  const sigY = 80

  lastPage.drawImage(sigImage, {
    x: sigX,
    y: sigY,
    width: sigWidth,
    height: sigHeight,
  })

  lastPage.drawLine({
    start: { x: sigX, y: sigY - 2 },
    end: { x: sigX + sigWidth, y: sigY - 2 },
    thickness: 0.5,
    color: rgb(0.2, 0.2, 0.2),
  })

  const signedLabel = `Tenant: ${tenantName}   Signed: ${signedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`

  lastPage.drawText(signedLabel, {
    x: sigX,
    y: sigY - 16,
    size: fontSize,
    font,
    color: rgb(0.2, 0.2, 0.2),
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

/**
 * Uploads signed PDF bytes to Supabase Storage under leases/<leaseId>-signed.pdf
 * and returns the public URL.
 *
 * @param {string} leaseId
 * @param {Uint8Array} pdfBytes
 * @returns {Promise<string>} Public URL
 */
export async function uploadSignedLease(leaseId, pdfBytes) {
  const path = `leases/${leaseId}-signed.pdf`

  const { error } = await supabase.storage
    .from('documents')
    .upload(path, pdfBytes, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (error) throw error

  const { data } = supabase.storage.from('documents').getPublicUrl(path)
  return data.publicUrl
}
