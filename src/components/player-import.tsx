import { useRef, useState } from 'react'
import { Button } from './ui/button'
import { Upload } from 'lucide-react'
import { importParticipants } from '../lib/import-utils'
import type { Player } from '../lib/types'

interface PlayerImportProps {
  onImport: (players: Player[]) => void
}

export function PlayerImport({ onImport }: PlayerImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setError(null)

    try {
      const result = await importParticipants(file)

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      if (result.success && result.players) {
        onImport(result.players)
        setError(null)
      } else {
        setError(result.error || 'Failed to import participants')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsImporting(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isImporting}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isImporting}
        className="w-full h-10 sm:h-11 px-4 sm:px-5"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isImporting ? 'Importing...' : 'Import from CSV/Excel'}
      </Button>
      {error && (
        <p className="text-sm text-destructive font-light tracking-wide">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground font-light tracking-wide">
        Upload a file with "name" and "email" columns. The first row will be set as admin.
      </p>
    </div>
  )
}

