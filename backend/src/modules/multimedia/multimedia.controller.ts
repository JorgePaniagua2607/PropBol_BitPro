import type { Request, Response } from 'express'
import {
  getPublicationMultimediaService,
  registerImagesService,
  registerVideoFileService,
  registerVideoLinkService
} from './multimedia.service.js'
import type {
  ImageUploadItemInput,
  RegisterImagesBody,
  RegisterVideoFileBody,
  RegisterVideoLinkBody,
  VideoUploadItemInput
} from './multimedia.types.js'

type AuthenticatedRequest = Request & {
  user?: {
    id?: number
    email?: string
    correo?: string
  }
}

const parsePublicacionId = (req: Request): number => {
  const publicacionId = Number(req.params.publicacionId)

  if (!Number.isInteger(publicacionId) || publicacionId <= 0) {
    throw new Error('ID de publicación no válido')
  }

  return publicacionId
}

const getAuthenticatedUserId = (req: AuthenticatedRequest): number => {
  const usuarioId = Number(req.user?.id)

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error('Usuario no autenticado')
  }

  return usuarioId
}

const getErrorStatus = (message: string): number => {
  switch (message) {
    case 'Usuario no autenticado':
      return 401
    case 'La publicación no existe':
      return 404
    case 'La publicación no pertenece al usuario autenticado':
      return 403
    default:
      return 400
  }
}

const handleControllerError = (error: unknown, res: Response) => {
  const message =
    error instanceof Error ? error.message : 'Error interno del servidor'

  const status = getErrorStatus(message)
  res.status(status).json({ message })
}

export const getPublicationMultimediaController = async (
  req: Request,
  res: Response
) => {
  try {
    const publicacionId = parsePublicacionId(req)
    const usuarioId = getAuthenticatedUserId(req as AuthenticatedRequest)

    const result = await getPublicationMultimediaService({
      publicacionId,
      usuarioId
    })

    res.json({
      message: 'Multimedia obtenida correctamente',
      data: result
    })
  } catch (error) {
    handleControllerError(error, res)
  }
}

export const registerVideoLinkController = async (
  req: Request,
  res: Response
) => {
  try {
    const publicacionId = parsePublicacionId(req)
    const usuarioId = getAuthenticatedUserId(req as AuthenticatedRequest)
    const { videoUrl } = req.body as Partial<RegisterVideoLinkBody>

    const result = await registerVideoLinkService({
      publicacionId,
      usuarioId,
      videoUrl: typeof videoUrl === 'string' ? videoUrl : ''
    })

    res.status(201).json({
      message: 'Video registrado correctamente',
      data: result
    })
  } catch (error) {
    handleControllerError(error, res)
  }
}

export const registerImagesController = async (
  req: Request,
  res: Response
) => {
  try {
    const publicacionId = parsePublicacionId(req)
    const usuarioId = getAuthenticatedUserId(req as AuthenticatedRequest)
    const { images } = req.body as Partial<RegisterImagesBody>

    const normalizedImages: ImageUploadItemInput[] = Array.isArray(images)
      ? images
      : []

    const result = await registerImagesService({
      publicacionId,
      usuarioId,
      images: normalizedImages
    })

    res.status(201).json({
      message: 'Imágenes registradas correctamente',
      data: result
    })
  } catch (error) {
    handleControllerError(error, res)
  }
}

export const registerVideoFileController = async (
  req: Request,
  res: Response
) => {
  try {
    const publicacionId = parsePublicacionId(req)
    const usuarioId = getAuthenticatedUserId(req as AuthenticatedRequest)
    const { video } = req.body as Partial<RegisterVideoFileBody>

    const normalizedVideo: VideoUploadItemInput =
      video && typeof video === 'object'
        ? {
            url: typeof video.url === 'string' ? video.url : '',
            extension:
              typeof video.extension === 'string' ? video.extension : '',
            pesoMb: typeof video.pesoMb === 'number' ? video.pesoMb : 0
          }
        : {
            url: '',
            extension: '',
            pesoMb: 0
          }

    const result = await registerVideoFileService({
      publicacionId,
      usuarioId,
      video: normalizedVideo
    })

    res.status(201).json({
      message: 'Video subido correctamente',
      data: result
    })
  } catch (error) {
    handleControllerError(error, res)
  }
}