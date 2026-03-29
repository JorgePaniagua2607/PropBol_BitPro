'use client'

import { useState, useEffect, useMemo } from 'react'
import { useOrdenamiento } from '../../hooks/useOrdenamiento'
import { MenuOrdenamiento } from './ordenamiento/MenuOrdenamiento'
import { TarjetaInmueble } from './TarjetaInmueble'
import { Inmueble } from '../../types/inmueble'

// Simulación de filtros (para futura integración)
interface FiltrosActivos {
  precioMin?: number
  precioMax?: number
  zona?: string
}

export const ResultadosBusqueda = () => {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtros] = useState<FiltrosActivos>({})

  // Cargar inmuebles desde el backend
  useEffect(() => {
    fetch('http://localhost:5000/api/inmuebles')
      .then((res) => res.json())
      .then((data: { ok: boolean; data: Inmueble[] }) => {
        if (data.ok) setInmuebles(data.data)
        setCargando(false)
      })
      .catch((error) => {
        console.error('Error fetching properties:', error)
        setCargando(false)
      })
  }, [])

  // Filtrado de inmuebles en el cliente
  const inmueblesFiltrados = useMemo<Inmueble[]>(() => {
    let resultado = [...inmuebles]

    if (filtros.precioMin !== undefined) {
      resultado = resultado.filter((i) => {
        const p = typeof i.precio === 'string' ? parseFloat(i.precio) : i.precio
        return p >= filtros.precioMin!
      })
    }
    if (filtros.precioMax !== undefined) {
      resultado = resultado.filter((i) => {
        const p = typeof i.precio === 'string' ? parseFloat(i.precio) : i.precio
        return p <= filtros.precioMax!
      })
    }
    if (filtros.zona) {
      resultado = resultado.filter((i) => {
        const zona = i.ubicacion?.zona?.toLowerCase() ?? ''
        return zona.includes(filtros.zona!.toLowerCase())
      })
    }

    return resultado
  }, [inmuebles, filtros])

  // Hook de ordenamiento
  const { ordenActual, cambiarOrden, inmueblesOrdenados } = useOrdenamiento({
    inmuebles: inmueblesFiltrados
  })

  if (cargando) return <p className="p-8 text-gray-500 text-center">Cargando propiedades...</p>

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MenuOrdenamiento
        ordenActual={ordenActual}
        onOrdenChange={cambiarOrden}
        totalResultados={inmueblesOrdenados.length}
      />

      {inmueblesOrdenados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {inmueblesOrdenados.map((inmueble) => (
            <TarjetaInmueble key={inmueble.id} inmueble={inmueble} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {inmuebles.length === 0
              ? 'No se encontraron propiedades.'
              : 'No se encontraron propiedades con los filtros actuales.'}
          </p>
        </div>
      )}
    </div>
  )
}
