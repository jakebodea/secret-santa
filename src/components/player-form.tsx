import { useForm } from '@tanstack/react-form'
import { useRef, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { importParticipants } from '../lib/import-utils'
import type { Player } from '../lib/types'

interface PlayerFormProps {
  onAddPlayer: (player: Player) => void
  onImport: (players: Player[]) => void
  existingPlayers: Player[]
}

export function PlayerForm({ onAddPlayer, onImport, existingPlayers }: PlayerFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = async (file: File) => {
    setIsImporting(true)
    setImportError(null)

    try {
      const result = await importParticipants(file)

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      if (result.success && result.players) {
        onImport(result.players)
        setImportError(null)
        setIsImportDialogOpen(false)
      } else {
        setImportError(result.error || 'Failed to import participants')
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processFile(file)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Validate file type
    const fileName = file.name.toLowerCase()
    const extension = fileName.split('.').pop()
    if (extension !== 'csv' && extension !== 'xlsx' && extension !== 'xls') {
      setImportError('Please upload a CSV or Excel file (.csv, .xlsx, .xls)')
      return
    }

    await processFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDropZoneClick = () => {
    fileInputRef.current?.click()
  }

  // Convert text to Title Case
  const toTitleCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
    onSubmit: async ({ value }) => {
      // Check for duplicate names
      const duplicate = existingPlayers.find(
        (p) => p.name.toLowerCase() === value.name.toLowerCase()
      )
      if (duplicate) {
        alert('A player with this name already exists!')
        return
      }

      // Create new player
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: toTitleCase(value.name.trim()),
        email: value.email.trim().toLowerCase(),
        isAdmin: existingPlayers.length === 0, // First player is admin
      }

      onAddPlayer(newPlayer)

      // Reset form
      form.reset()

      // Focus on name input after adding player
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 0)
    },
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl sm:text-2xl font-normal tracking-wide">Add Participant</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Name is required' : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  ref={nameInputRef}
                  id="name"
                  type="text"
                  placeholder="Enter name"
                  value={field.state.value}
                  onChange={(e) => {
                    const normalizedValue = toTitleCase(e.target.value)
                    field.handleChange(normalizedValue)
                  }}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Email is required'
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return 'Please enter a valid email'
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={field.state.value}
                  onKeyDown={(e) => {
                    // Prevent space key from being entered
                    if (e.key === ' ') {
                      e.preventDefault()
                    }
                  }}
                  onChange={(e) => {
                    // Remove spaces from email (handles paste and other cases)
                    const valueWithoutSpaces = e.target.value.replace(/\s/g, '')
                    field.handleChange(valueWithoutSpaces)
                  }}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting} className="h-10 sm:h-11 px-4 sm:px-5">
                {isSubmitting ? 'Adding...' : 'Add Player'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>

      {/* Import Dialog */}
      <Dialog 
        open={isImportDialogOpen} 
        onOpenChange={(open) => {
          setIsImportDialogOpen(open)
          if (!open) {
            setImportError(null)
            setIsDragging(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Participants</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file with your participants. The file must contain the following columns:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Required columns info */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Required columns:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>name</strong> - Participant name</li>
                <li><strong>email</strong> - Participant email address</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Column names are case-insensitive. The first participant in the file will be set as admin.
              </p>
            </div>

            {/* File drop zone */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isImporting}
            />

            <div
              onClick={handleDropZoneClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors
                ${isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30'
                }
                ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isImporting ? (
                <div className="space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Processing file...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports .csv, .xlsx, .xls files
                    </p>
                  </div>
                </div>
              )}
            </div>

            {importError && (
              <p className="text-sm text-destructive font-light tracking-wide">
                {importError}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

