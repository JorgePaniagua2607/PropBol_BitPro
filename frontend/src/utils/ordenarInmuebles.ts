import { Inmueble, EstadoOrdenamiento, OrdenDireccion, OrdenFecha } from '../types/inmueble'

/**
 * Tarea 4: Función para ordenar por fecha (más reciente a más antiguo)
 * Se mantiene como utilidad independiente según los requisitos de la tarea.
 */
export const ordenarPorFecha = (inmuebles: Inmueble[]): Inmueble[] => {
  return [...inmuebles].sort((a, b) => {
    return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
  })
}

/**
 * Ordena un array de inmuebles según el estado de ordenamiento.
 * Aplica ordenamiento simultáneo: Fecha/Popularidad → Precio → Superficie
 *
 * @param inmuebles - Array de inmuebles a ordenar
 * @param estado - Estado de ordenamiento con fecha, precio y superficie
 * @returns Nuevo array ordenado
 */
export const ordenarInmuebles = (inmuebles: Inmueble[], estado: EstadoOrdenamiento): Inmueble[] => {
  if (!inmuebles || inmuebles.length === 0) {
    return []
  }

  return [...inmuebles].sort((a, b) => {
    // 1. Clasificar por fecha/popularidad (criterio primario)
    const comparacionFecha = compararPorFecha(a, b, estado.fecha)
    if (comparacionFecha !== 0) return comparacionFecha

    // 2. Ordenar por precio (criterio secundario)
    const precioA = typeof a.precio === 'string' ? parseFloat(a.precio) : a.precio
    const precioB = typeof b.precio === 'string' ? parseFloat(b.precio) : b.precio
    const comparacionPrecio = compararNumerico(precioA, precioB, estado.precio)
    if (comparacionPrecio !== 0) return comparacionPrecio

    // 3. Ordenar por superficie (criterio terciario)
    const superficieA = a.superficieM2 ?? 0
    const superficieB = b.superficieM2 ?? 0
    return compararNumerico(superficieA, superficieB, estado.superficie)
  })
}

/**
 * Compara dos inmuebles por fecha o popularidad
 */
function compararPorFecha(a: Inmueble, b: Inmueble, criterio: OrdenFecha): number {
  const timeA = new Date(a.fechaPublicacion).getTime()
  const timeB = new Date(b.fechaPublicacion).getTime()

  if (criterio === 'mas-recientes') {
    return timeB - timeA // Descendente
  } else if (criterio === 'mas-antiguos') {
    return timeA - timeB // Ascendente
  } else {
    // mas-populares
    const popA = a.popularidad ?? 0
    const popB = b.popularidad ?? 0
    return popB - popA // Descendente
  }
}

/**
 * Compara dos valores numéricos con dirección
 */
function compararNumerico(valorA: number, valorB: number, direccion: OrdenDireccion): number {
  if (direccion === 'menor-a-mayor') {
    return valorA - valorB
  } else {
    return valorB - valorA
  }
}

/**
 * Versión simplificada para ordenar por un solo criterio
 * (mantiene compatibilidad con código legado)
 */
export const ordenarPorCriterio = (
  inmuebles: Inmueble[],
  criterio: 'fecha' | 'popularidad' | 'precio' | 'superficie',
  ascendente: boolean = true
): Inmueble[] => {
  if (!inmuebles || inmuebles.length === 0) {
    return []
  }

  return [...inmuebles].sort((a, b) => {
    let valorA: number
    let valorB: number

    switch (criterio) {
      case 'fecha':
        valorA = new Date(a.fechaPublicacion).getTime()
        valorB = new Date(b.fechaPublicacion).getTime()
        break
      case 'popularidad':
        valorA = a.popularidad ?? 0
        valorB = b.popularidad ?? 0
        break
      case 'precio':
        valorA = typeof a.precio === 'string' ? parseFloat(a.precio) : a.precio
        valorB = typeof b.precio === 'string' ? parseFloat(b.precio) : b.precio
        break
      case 'superficie':
        valorA = a.superficieM2 ?? 0
        valorB = b.superficieM2 ?? 0
        break
      default:
        return 0
    }

    return ascendente ? valorA - valorB : valorB - valorA
  })
}
