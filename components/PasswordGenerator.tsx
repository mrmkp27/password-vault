import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onPasswordGenerated }) => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copyText, setCopyText] = useState('Copy');

  const generatePassword = () => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charSet = lower + upper;
    if (includeNumbers) charSet += numbers;
    if (includeSymbols) charSet += symbols;

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    setPassword(newPassword);
    onPasswordGenerated(newPassword);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopyText('Copied!');

    // After 2 seconds, reset the button text and clear the password
    setTimeout(() => {
      setCopyText('Copy');
      setPassword(''); // Clears the password in this component's input
      onPasswordGenerated(''); // Clears the password in the parent dashboard state
    }, 2000); // 2000 milliseconds = 2 seconds
  };

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center space-x-2">
        <Input type="text" value={password} readOnly placeholder="Generate a password" />
        <Button onClick={copyToClipboard}>{copyText}</Button>
      </div>
      <div className="space-y-2">
        <Label>Length: {length}</Label>
        <Slider 
          defaultValue={[16]} 
          max={32} 
          min={8} 
          step={1}
          onValueChange={(value) => setLength(value[0])}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="numbers" checked={includeNumbers} onCheckedChange={() => setIncludeNumbers(!includeNumbers)} />
        <Label htmlFor="numbers">Include Numbers</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="symbols" checked={includeSymbols} onCheckedChange={() => setIncludeSymbols(!includeSymbols)} />
        <Label htmlFor="symbols">Include Symbols</Label>
      </div>
      <Button onClick={generatePassword} className="w-full">Generate</Button>
    </div>
  );
};

export default PasswordGenerator;