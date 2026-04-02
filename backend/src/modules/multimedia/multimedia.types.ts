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

export interface DeleteMultimediaInput {
  publicacionId: number
  usuarioId: number
  multimediaId: number
}

export interface PublishPropertyInput {
  publicacionId: number
  usuarioId: number
  confirmacionPublicacion: boolean
}

export interface PublishPropertyBody {
  confirmacionPublicacion: boolean
}