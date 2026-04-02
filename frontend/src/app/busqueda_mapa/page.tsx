'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, List as ListIcon, LayoutGrid } from 'lucide-react'
import { useProperties } from '@/hooks/useProperties'
import { usePropertySearch } from '@/hooks/usePropertySearch'
import FilterBar from '@/components/filters/FilterBar'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'
import type { PropertyMapPin, PropertyType } from '@/types/property'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

function mapCategoriaToTipo(raw: unknown): PropertyType {
  const s = String(raw ?? '').toUpperCase()
  if (s.includes('DEPART')) return 'departamento'
  if (s.includes('TERREN')) return 'terreno'
  if (s.includes('LOCAL') || s.includes('OFICIN')) return 'local'
  return 'casa'
}

function normalizeToMapPins(raw: unknown): PropertyMapPin[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  return raw.map((item: Record<string, unknown>, i: number) => ({
    id: String(item.id ?? i),
    lat: Number(item.lat ?? item.latitud ?? -17.392418841841394),
    lng: Number(item.lng ?? item.longitud ?? -66.1461583463333),
    price: Number(item.price ?? item.precio ?? 0),
    currency:
      item.currency === 'BOB' || item.moneda === 'BOB' ? 'BOB' : 'USD',
    type: mapCategoriaToTipo(item.categoria ?? item.type ?? item.tipo),
    title: String(item.title ?? item.titulo ?? 'Sin título'),
    thumbnailUrl:
      typeof item.thumbnailUrl === 'string'
        ? item.thumbnailUrl
        : typeof item.imagen === 'string'
          ? item.imagen
          : undefined
  }))
}

export default function BusquedaMapaPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  )
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const { properties, isLoading, error: propertiesError } = useProperties()
  const { data, loading, searchProperties } = usePropertySearch()

  const displayProperties = useMemo(
    () => normalizeToMapPins(data) ?? properties,
    [data, properties]
  )

  const listLoading = isLoading || loading
  const combinedError = propertiesError

  useEffect(() => {
    void searchProperties()
  }, [searchProperties])

  useEffect(() => {
    if (!hoveredId) return
    const timeout = setTimeout(() => {
      setSelectedPropertyId(hoveredId)
    }, 200)
    return () => clearTimeout(timeout)
  }, [hoveredId])

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <div className="shrink-0">
        <FilterBar />
        {loading && (
          <div className="px-4 py-1 text-xs text-orange-500 animate-pulse font-medium border-b border-stone-100 bg-stone-50">
            Actualizando resultados según filtros guardados…
          </div>
        )}
      </div>

      <main className="flex flex-1 overflow-hidden relative">
        <aside
          className={`bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300 ${
            isSidebarOpen ? 'w-full md:w-[450px]' : 'w-0'
          }`}
        >
          {isSidebarOpen && (
            <>
              <div className="p-3 border-b border-stone-200 flex items-center bg-stone-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Ocultar
                </button>
              </div>

              <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-slate-900">
                    Lista de Inmuebles
                  </h2>
                  <p className="text-xs text-stone-400 font-medium mt-0.5">
                    {displayProperties.length} encontrado
                    {displayProperties.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex bg-stone-100 p-1 rounded-md border border-stone-200 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-[#ea580c] shadow-sm'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-[#ea580c] shadow-sm'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <ListIcon size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-stone-50 no-scrollbar">
                {listLoading ? (
                  <div className="flex justify-center items-center h-full text-stone-500 text-sm font-medium animate-pulse">
                    Cargando propiedades…
                  </div>
                ) : displayProperties.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div
                    className={`gap-4 ${
                      viewMode === 'grid'
                        ? 'flex flex-col'
                        : 'divide-y divide-gray-100 flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm'
                    }`}
                  >
                    {displayProperties.map((property) => {
                      const isSelected = selectedPropertyId === property.id
                      const priceLabel =
                        property.currency === 'USD'
                          ? `$${property.price.toLocaleString('es-BO')} USD`
                          : `Bs ${property.price.toLocaleString('es-BO')}`

                      return (
                        <div
                          key={property.id}
                          onMouseEnter={() => setHoveredId(property.id)}
                          onClick={() => setSelectedPropertyId(property.id)}
                          className={`cursor-pointer transition-all duration-200 rounded-xl ${
                            viewMode === 'list' ? 'py-1 px-2' : ''
                          } ${
                            isSelected
                              ? 'ring-2 ring-[#ea580c] shadow-md bg-orange-50/50'
                              : 'hover:border-stone-300 hover:shadow-sm'
                          } ${viewMode === 'grid' ? 'bg-white border border-stone-100 p-3 shadow-sm' : ''}`}
                        >
                          <PropertyRow
                            title={property.title}
                            price={priceLabel}
                            size={`${property.type} • mapa`}
                            contactType="whatsapp"
                            image={property.thumbnailUrl ?? ''}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

        <section className="flex-1 relative bg-stone-200">
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-0 top-4 z-[1000] bg-white text-black shadow-md rounded-r-md flex flex-col items-center py-4 px-2 gap-4 hover:bg-stone-50 transition-colors"
            >
              <ChevronRight size={16} />
              <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-bold tracking-widest uppercase text-stone-600">
                Inmuebles
              </span>
              <ListIcon size={16} className="text-stone-500" />
            </button>
          )}

          <div className="absolute inset-0">
            <MapView
              properties={displayProperties}
              selectedId={selectedPropertyId}
              onSelect={setSelectedPropertyId}
              isLoading={listLoading}
              error={combinedError}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
