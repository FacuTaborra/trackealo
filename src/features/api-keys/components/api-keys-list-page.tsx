'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconKey, IconPlus, IconTrash, IconCopy, IconCheck } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getApiKeys } from '../data/get-api-keys';
import { createApiKeyAction } from '../actions/create-api-key';
import { deleteApiKeyAction } from '../actions/delete-api-key';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant='outline' size='sm' onClick={handleCopy}>
      {copied ? (
        <IconCheck className='mr-2 size-4 text-green-500' />
      ) : (
        <IconCopy className='mr-2 size-4' />
      )}
      {copied ? 'Copiado' : 'Copiar'}
    </Button>
  );
}

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
}

export function ApiKeysListPage() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  const { data: apiKeys = [], isLoading, error } = useQuery({
    queryKey: ['api-keys'],
    queryFn: getApiKeys
  });

  const { mutate: createKey, isPending: isCreating } = useMutation({
    mutationFn: async (name: string) => {
      const result = await createApiKeyAction({ name });
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) throw new Error('Nombre invalido');
      return result?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setCreateDialogOpen(false);
      setNewKeyName('');
      if (data?.key) {
        setRevealedKey(data.key);
        setShowKeyDialog(true);
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al crear la API key');
    }
  });

  const { mutate: deleteKey } = useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteApiKeyAction({ id });
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) throw new Error('Datos invalidos');
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key revocada');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al revocar');
    }
  });

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center p-8'>
        <p className='text-muted-foreground'>Cargando API keys...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-1 items-center justify-center p-8'>
        <p className='text-destructive'>Error al cargar las API keys.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>API Keys</h2>
          <p className='text-muted-foreground text-sm mt-1'>
            Generá claves para acceder a la API de Trackealo desde scripts o integraciones externas.
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className='mr-2 size-4' />
              Generar clave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva API Key</DialogTitle>
              <DialogDescription>
                Dale un nombre descriptivo para identificar esta clave.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 pt-2'>
              <div className='space-y-2'>
                <Label htmlFor='key-name'>Nombre</Label>
                <Input
                  id='key-name'
                  placeholder='Ej: Script mensual, n8n, Zapier...'
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newKeyName.trim()) {
                      createKey(newKeyName.trim());
                    }
                  }}
                />
              </div>
              <Button
                className='w-full'
                disabled={!newKeyName.trim() || isCreating}
                onClick={() => createKey(newKeyName.trim())}
              >
                {isCreating ? 'Generando...' : 'Generar clave'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog que muestra la clave recién generada */}
      <Dialog
        open={showKeyDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowKeyDialog(false);
            setRevealedKey(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tu nueva API Key</DialogTitle>
            <DialogDescription>
              Copiá esta clave ahora. No se volverá a mostrar.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 pt-2'>
            <div className='bg-muted rounded-md p-3 font-mono text-sm break-all'>
              {revealedKey}
            </div>
            <CopyButton text={revealedKey ?? ''} />
            <p className='text-muted-foreground text-xs'>
              Guardá esta clave en un lugar seguro. Una vez que cierres este
              dialog, no podrás verla de nuevo.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {apiKeys.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-8'>
          <IconKey className='text-muted-foreground mb-3 size-10' />
          <p className='text-muted-foreground text-center'>
            No tenés API keys generadas. Creá una para conectar Trackealo con
            scripts o integraciones externas.
          </p>
        </div>
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Prefijo</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead>Último uso</TableHead>
                <TableHead className='w-[80px]' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className='font-medium'>{key.name}</TableCell>
                  <TableCell>
                    <Badge variant='secondary' className='font-mono'>
                      {key.key_prefix}...
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>
                    {formatDate(key.created_at)}
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>
                    {formatDate(key.last_used_at)}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='ghost' size='icon' className='size-8'>
                          <IconTrash className='size-4 text-destructive' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revocar API key</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que querés revocar la clave{' '}
                            <span className='font-semibold'>{key.name}</span>?
                            Cualquier integración que la use dejará de funcionar.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteKey(key.id)}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          >
                            Revocar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
