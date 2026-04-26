export function YamlPreview({ yaml, onDownload }) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">YAML Preview</h2>
        <button
          onClick={onDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded transition-colors"
        >
          Download 01-netcfg.yaml
        </button>
      </div>
      <pre className="flex-1 bg-gray-900 text-green-400 text-sm rounded-lg p-4 overflow-auto font-mono leading-relaxed whitespace-pre">
        {yaml}
      </pre>
    </div>
  )
}
