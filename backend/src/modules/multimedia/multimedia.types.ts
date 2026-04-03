export type MultimediaType = 'IMAGEN' | 'VIDEO'

export interface PublicacionRecord {
  id: number
  usuarioId: number
  titulo: string
}

export interface MultimediaRecord {
  id: number
  publicacionId: number
  tipo: MultimediaType
  url: string
  pesoMb: number | null
}

export interface GetPublicationMultimediaInput {
  publicacionId: number
  usuarioId: number
}

export interface ImageUploadItemInput {
  url: string
  extension: string
  pesoMb: number
}

export interface RegisterImagesInput {
  publicacionId: number
  usuarioId: number
  images: ImageUploadItemInput[]
}

export interface RegisterImagesBody {
  images: ImageUploadItemInput[]
}

export interface VideoUploadItemInput {
  url: string
  extension: string
  pesoMb: number
}

export interface RegisterVideoFileInput {
  publicacionId: number
  usuarioId: number
  video: VideoUploadItemInput
}

export interface RegisterVideoFileBody {
  video: VideoUploadItemInput
}

export interface RegisterVideoLinkInput {
  publicacionId: number
  usuarioId: number
  videoUrl: string
}

export interface RegisterVideoLinkBody {
  videoUrl: string
}