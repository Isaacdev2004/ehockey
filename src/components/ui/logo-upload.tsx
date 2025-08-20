"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, X, Check } from 'lucide-react';

interface LogoUploadProps {
  onUploadComplete?: () => void;
}

interface LogoFile {
  id: string;
  file: File;
  name: string;
  type: 'league' | 'team' | 'sponsor';
  variant?: 'primary' | 'secondary' | 'full' | 'verified' | 'circle';
  teamId?: string;
  alt: string;
  width?: number;
  height?: number;
  preview: string;
}

export function LogoUpload({ onUploadComplete }: LogoUploadProps) {
  const { toast } = useToast();
  const [logoFiles, setLogoFiles] = useState<LogoFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newLogoFiles: LogoFile[] = acceptedFiles.map((file, index) => {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      
      // Auto-detect logo variant based on filename
      let variant: 'primary' | 'secondary' | 'full' | 'verified' | 'circle' | undefined;
      if (fileName.toLowerCase().includes('ehockey') && fileName.toLowerCase().includes('net')) {
        variant = 'full';
      } else if (fileName.toLowerCase().includes('ehockey') && !fileName.toLowerCase().includes('net')) {
        variant = 'primary';
      } else if (fileName.toLowerCase().includes('eh ') || fileName.toLowerCase().includes('eh_')) {
        variant = 'secondary';
      } else if (fileName.toLowerCase().includes('verified')) {
        variant = 'verified';
      } else if (fileName.toLowerCase().includes('circle')) {
        variant = 'circle';
      }

      return {
        id: `logo-${Date.now()}-${index}`,
        file,
        name: fileName,
        type: 'league' as const,
        variant,
        alt: fileName,
        preview: URL.createObjectURL(file),
      };
    });

    setLogoFiles(prev => [...prev, ...newLogoFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    multiple: true
  });

  const updateLogoFile = (id: string, updates: Partial<LogoFile>) => {
    setLogoFiles(prev => prev.map(logo => 
      logo.id === id ? { ...logo, ...updates } : logo
    ));
  };

  const removeLogoFile = (id: string) => {
    setLogoFiles(prev => {
      const logo = prev.find(l => l.id === id);
      if (logo) {
        URL.revokeObjectURL(logo.preview);
      }
      return prev.filter(l => l.id !== id);
    });
  };

  const uploadLogos = async () => {
    if (logoFiles.length === 0) {
      toast({
        title: "No logos to upload",
        description: "Please add some logo files first.",
        variant: "warning",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload each logo file
      const uploadPromises = logoFiles.map(async (logoFile) => {
        // In a real implementation, you'd upload the file to a storage service
        // For now, we'll simulate the upload
        const formData = new FormData();
        formData.append('file', logoFile.file);
        formData.append('name', logoFile.name);
        formData.append('type', logoFile.type);
        formData.append('alt', logoFile.alt);
        if (logoFile.teamId) formData.append('teamId', logoFile.teamId);
        if (logoFile.width) formData.append('width', logoFile.width.toString());
        if (logoFile.height) formData.append('height', logoFile.height.toString());

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return the logo data
        return {
          id: logoFile.id,
          name: logoFile.name,
          type: logoFile.type,
          teamId: logoFile.teamId,
          url: logoFile.preview, // In real implementation, this would be the uploaded URL
          alt: logoFile.alt,
          width: logoFile.width,
          height: logoFile.height,
        };
      });

      const uploadedLogos = await Promise.all(uploadPromises);

      // Save to database
      const response = await fetch('/api/logos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadedLogos[0]), // For now, just upload the first one
      });

      if (!response.ok) {
        throw new Error('Failed to save logo to database');
      }

      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${uploadedLogos.length} logo(s)`,
        variant: "success",
      });

      // Clear the files
      setLogoFiles([]);
      onUploadComplete?.();

    } catch (error) {
      console.error('Error uploading logos:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload logos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const importLogoSheet = async () => {
    // This would handle importing the logo sheet from the client
    toast({
      title: "Logo sheet import",
      description: "Logo sheet import functionality will be implemented when you provide the sheet.",
      variant: "info",
    });
  };

  return (
    <div className="space-y-6">
      {/* Logo Sheet Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Import Logo Sheet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Import all team logos and league branding from your logo sheet.
          </p>
          <Button onClick={importLogoSheet} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Logo Sheet
          </Button>
        </CardContent>
      </Card>

      {/* Individual Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Individual Logos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-primary">Drop the logo files here...</p>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  Drag & drop logo files here, or click to select files
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PNG, JPG, JPEG, GIF, SVG
                </p>
              </div>
            )}
          </div>

          {/* Logo Files List */}
          {logoFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Logo Files ({logoFiles.length})</h3>
              <div className="grid gap-4">
                {logoFiles.map((logoFile) => (
                  <div key={logoFile.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                      <img
                        src={logoFile.preview}
                        alt={logoFile.alt}
                        className="w-16 h-16 object-contain border rounded"
                      />
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 space-y-3">
                                             <div className="grid grid-cols-2 gap-3">
                         <div>
                           <Label htmlFor={`name-${logoFile.id}`}>Name</Label>
                           <Input
                             id={`name-${logoFile.id}`}
                             value={logoFile.name}
                             onChange={(e) => updateLogoFile(logoFile.id, { name: e.target.value })}
                             placeholder="Logo name"
                           />
                         </div>
                         <div>
                           <Label htmlFor={`type-${logoFile.id}`}>Type</Label>
                           <Select
                             value={logoFile.type}
                             onValueChange={(value: 'league' | 'team' | 'sponsor') => 
                               updateLogoFile(logoFile.id, { type: value })
                             }
                           >
                             <SelectTrigger>
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="league">League</SelectItem>
                               <SelectItem value="team">Team</SelectItem>
                               <SelectItem value="sponsor">Sponsor</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                         <div>
                           <Label htmlFor={`variant-${logoFile.id}`}>Variant</Label>
                           <Select
                             value={logoFile.variant || ''}
                             onValueChange={(value: 'primary' | 'secondary' | 'full' | 'verified' | 'circle') => 
                               updateLogoFile(logoFile.id, { variant: value })
                             }
                           >
                             <SelectTrigger>
                               <SelectValue placeholder="Select variant" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="primary">Primary (EHOCKEY)</SelectItem>
                               <SelectItem value="secondary">Secondary (EH)</SelectItem>
                               <SelectItem value="full">Full (EHOCKEY.NET)</SelectItem>
                               <SelectItem value="verified">Verified Badge</SelectItem>
                               <SelectItem value="circle">Circle</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                         <div>
                           <Label htmlFor={`alt-${logoFile.id}`}>Alt Text</Label>
                           <Input
                             id={`alt-${logoFile.id}`}
                             value={logoFile.alt}
                             onChange={(e) => updateLogoFile(logoFile.id, { alt: e.target.value })}
                             placeholder="Alternative text for accessibility"
                           />
                         </div>
                       </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`width-${logoFile.id}`}>Width (px)</Label>
                          <Input
                            id={`width-${logoFile.id}`}
                            type="number"
                            value={logoFile.width || ''}
                            onChange={(e) => updateLogoFile(logoFile.id, { 
                              width: e.target.value ? parseInt(e.target.value) : undefined 
                            })}
                            placeholder="Auto"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`height-${logoFile.id}`}>Height (px)</Label>
                          <Input
                            id={`height-${logoFile.id}`}
                            type="number"
                            value={logoFile.height || ''}
                            onChange={(e) => updateLogoFile(logoFile.id, { 
                              height: e.target.value ? parseInt(e.target.value) : undefined 
                            })}
                            placeholder="Auto"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeLogoFile(logoFile.id)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <Button 
                onClick={uploadLogos} 
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Upload {logoFiles.length} Logo{logoFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
