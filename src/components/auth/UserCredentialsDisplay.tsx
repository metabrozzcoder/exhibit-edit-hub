import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Eye, EyeOff, User, Mail, Shield, Key } from 'lucide-react';
import { toast } from 'sonner';

interface UserCredentialsDisplayProps {
  user: {
    name: string;
    email: string;
    role: string;
    department?: string;
  };
  password: string;
  onClose: () => void;
}

export default function UserCredentialsDisplay({ user, password, onClose }: UserCredentialsDisplayProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCredentials = async () => {
    const credentials = `Name: ${user.name}
Email: ${user.email}
Password: ${password}
Role: ${user.role}
Department: ${user.department || 'Not specified'}

Please change your password after first login.`;

    try {
      await navigator.clipboard.writeText(credentials);
      setCopied(true);
      toast.success('Credentials copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy credentials');
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success('Password copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy password');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <User className="h-5 w-5" />
          User Created Successfully
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            Save these credentials securely. The user will need them to login from any device.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <User className="h-3 w-3" />
              Name
            </Label>
            <Input value={user.name} readOnly className="bg-muted" />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-3 w-3" />
              Email (Login Username)
            </Label>
            <Input value={user.email} readOnly className="bg-muted" />
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Key className="h-3 w-3" />
              Temporary Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                readOnly
                className="bg-yellow-50 border-yellow-200 font-mono pr-20"
              />
              <div className="absolute right-1 top-1 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleCopyPassword}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Role & Department
            </Label>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">{user.role}</Badge>
              {user.department && <Badge variant="outline">{user.department}</Badge>}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions for the user:</h4>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Go to the ARIMUS login page</li>
            <li>2. Enter the email and password provided</li>
            <li>3. Change the password immediately after login</li>
            <li>4. Users can login from any device with these credentials</li>
          </ol>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleCopyCredentials} 
            className="flex-1"
            variant={copied ? "default" : "outline"}
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy All Credentials'}
          </Button>
          <Button onClick={onClose} variant="secondary">
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}