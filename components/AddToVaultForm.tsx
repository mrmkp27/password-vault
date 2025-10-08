import React, { useState } from 'react';
import { encryptData } from '../lib/crypto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddToVaultFormProps {
  passwordToSave: string;
  onSave: () => void;
  onPasswordSaved: () => void; // <-- ADD THIS NEW PROP
}

const AddToVaultForm: React.FC<AddToVaultFormProps> = ({ passwordToSave, onSave, onPasswordSaved }) => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !passwordToSave) {
      alert('Please generate a password first.');
      return;
    }

    const { iv, content: encryptedPassword } = await encryptData(passwordToSave);

    const response = await fetch('/api/vault', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title, username, url, password: encryptedPassword, notes: iv }),
    });

    if (response.ok) {
      alert('Saved to vault!');
      setTitle('');
      setUsername('');
      setUrl('');
      onSave();
      onPasswordSaved(); // <-- CALL THE NEW PROP FUNCTION HERE
    } else {
      alert('Failed to save.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Google" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username">Username/Email</Label>
        <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g., m@example.com" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="url">URL</Label>
        <Input id="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g., https://google.com" />
      </div>
      <p className="text-sm"><strong>Password:</strong> {passwordToSave || 'Generate one above'}</p>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        Save to Vault
      </Button>
    </form>
  );
};

export default AddToVaultForm;