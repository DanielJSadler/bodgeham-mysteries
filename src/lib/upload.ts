export async function uploadImageFile(file: File, generateUploadUrl: () => Promise<string>) {
  const uploadUrl = await generateUploadUrl()
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!response.ok) {
    throw new Error('Could not upload image.')
  }

  const result = (await response.json()) as { storageId: string }
  return result.storageId
}
