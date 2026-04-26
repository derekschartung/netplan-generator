import { useState, useMemo } from 'react'
import { InterfaceForm, defaultIface } from './components/InterfaceForm'
import { YamlPreview } from './components/YamlPreview'
import { buildNetplan } from './utils/buildNetplan'

const initialIfaces = [{ ...defaultIface, dhcp: true }]

export default function App() {
  const [ifaces, setIfaces] = useState(initialIfaces)
  const [dark, setDark] = useState(false)
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
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Netplan Generator</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Build Ubuntu Netplan YAML configurations visually</p>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className="text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {dark ? '☀ Light' : '☾ Dark'}
          </button>
        </header>

        <main className="flex flex-1 gap-0 overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
          <div className="w-1/2 overflow-y-auto p-6 border-r border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Network Interfaces</h2>
            <InterfaceForm ifaces={ifaces} onChange={setIfaces} />
          </div>

          <div className="w-1/2 flex flex-col p-6">
            <YamlPreview yaml={yaml} onDownload={download} />
          </div>
        </main>
      </div>
    </div>
  )
}
