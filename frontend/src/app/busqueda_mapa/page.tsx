'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, List as ListIcon, LayoutGrid } from 'lucide-react'

// === HOOKS ===
import { useProperties } from '@/hooks/useProperties'
import { usePropertySearch } from '@/hooks/usePropertySearch'

// === COMPONENTES ===
import FilterBar from '@/components/FilterBar'
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'

// Carga dinámica del mapa
const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function BusquedaMapaPage() {
  // === UI States ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // === Data Hooks ===
  const { properties, isLoading } = useProperties() // Segunda versión
  const { data: searchData, loading: searchLoading, searchProperties } = usePropertySearch() // Primera versión

  // === Inicialización de búsqueda (primera versión) ===
  useEffect(() => {
    searchProperties()
  }, [])

  // === Hover effect para sincronizar con mapa (segunda versión) ===
  useEffect(() => {
    if (!hoveredId) return
    const timeout = setTimeout(() => setSelectedPropertyId(hoveredId), 200)
    return () => clearTimeout(timeout)
  }, [hoveredId])

  // Fusionamos datos: usamos searchData si existe, sino properties
  const mergedProperties = searchData && searchData.length > 0 ? searchData : properties
  const loading = searchLoading || isLoading

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Barra de filtros */}
      <FilterBar />

      <main className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300 ${
            isSidebarOpen ? 'w-full md:w-[450px]' : 'w-0'
          }`}
        >
          {isSidebarOpen && (
            <>
              {/* Botón ocultar */}
              <div className="p-3 border-b border-stone-200 flex items-center bg-stone-50 shrink-0">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Ocultar
                </button>
              </div>

              {/* Cabecera de lista */}
              <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-slate-900">Lista de Inmuebles</h2>
                  <p className="text-xs text-stone-400 font-medium mt-0.5">
                    {mergedProperties.length} encontrado{mergedProperties.length !== 1 ? 's' : ''}
                  </p>
                  {loading && (
                    <span className="text-xs text-orange-500 animate-pulse font-medium mt-1">
                      Actualizando resultados...
                    </span>
                  )}
                </div>

                {/* Toggle de vistas */}
                <div className="flex bg-stone-100 p-1 rounded-md border border-stone-200 shadow-inner">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <ListIcon size={18} />
                  </button>
                </div>
              </div>

              {/* Contenido scrollable */}
              <div className="flex-1 overflow-y-auto p-4 bg-stone-50 no-scrollbar">
                {loading ? (
                  <div className="flex justify-center items-center h-full text-stone-500 text-sm font-medium animate-pulse">
                    Cargando propiedades...
                  </div>
                ) : mergedProperties.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div
                    className={`gap-4 ${
                      viewMode === 'grid'
                        ? 'flex flex-col'
                        : 'divide-y divide-gray-100 flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm'
                    }`}
                  >
                    {mergedProperties.map((prop: any) => {
                      const isSelected = selectedPropertyId === prop.id
                      return (
                        <div
                          key={prop.id}
                          onMouseEnter={() => setHoveredId(prop.id)}
                          onClick={() => setSelectedPropertyId(prop.id)}
                          className={`cursor-pointer transition-all duration-200 rounded-xl ${
                            viewMode === 'list' ? 'py-1 px-2' : ''
                          } ${isSelected ? 'ring-2 ring-[#ea580c] shadow-md bg-orange-50/50' : 'hover:border-stone-300 hover:shadow-sm'}`}
                        >
                          {viewMode === 'grid' ? (
                            <PropertyCard
                              imagen="" 
                              estado={prop.type || prop.modoInmueble}
                              precio={prop.currency === 'USD' ? `$${prop.price.toLocaleString("es-BO")} USD` : `Bs ${prop.price.toLocaleString("es-BO")}`}
                              descripcion={prop.title}
                              camas={prop.camas || 3}
                              banos={prop.banos || 2}
                              metros={prop.metros || 150}
                            />
                          ) : (
                            <PropertyRow
                              title={prop.title}
                              price={prop.currency === 'USD' ? `$${prop.price.toLocaleString("es-BO")} USD` : `Bs ${prop.price.toLocaleString("es-BO")}`}
                              size="3 Dorm. • 150 m²"
                              contactType="whatsapp"
                              image=""
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

        {/* Área del mapa */}
        <section className="flex-1 relative bg-stone-200">
          {!isSidebarOpen && (
            <button
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
              properties={mergedProperties}
              selectedId={selectedPropertyId}
              onSelect={setSelectedPropertyId}
              isLoading={loading}
            />
          </div>
        </section>
      </main>
    </div>
  )
}