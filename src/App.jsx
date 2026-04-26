import { useState, useMemo } from 'react'
import { InterfaceForm, defaultIface } from './components/InterfaceForm'
import { YamlPreview } from './components/YamlPreview'
import { buildNetplan } from './utils/buildNetplan'

const initialIfaces = [{ ...defaultIface, dhcp: true }]

export default function App() {
  const [ifaces, setIfaces] = useState(initialIfaces)
  const yaml = useMemo(() => buildNetplan(ifaces), [ifaces])

  function download() {
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '01-netcfg.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Netplan Generator</h1>
        <p className="text-sm text-gray-500">Build Ubuntu Netplan YAML configurations visually</p>
      </header>

      <main className="flex flex-1 gap-0 overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
        <div className="w-1/2 overflow-y-auto p-6 border-r border-gray-200">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Network Interfaces</h2>
          <InterfaceForm ifaces={ifaces} onChange={setIfaces} />
        </div>

        <div className="w-1/2 flex flex-col p-6">
          <YamlPreview yaml={yaml} onDownload={download} />
        </div>
      </main>
    </div>
  )
}
