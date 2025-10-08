import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { ThemeToggle } from "@/components/ThemeToggle";
import PasswordGenerator from "@/components/PasswordGenerator";
import AddToVaultForm from "@/components/AddToVaultForm";
import { decryptData } from "../lib/crypto"; // Assuming crypto is in the root lib folder
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Eye } from "lucide-react";

// Define a type for our vault items
interface VaultItem {
  _id: string;
  title: string;
  username: string;
  password: string; // Encrypted
  notes: string; // This holds the IV
  url?: string;
}

const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [newlyGeneratedPassword, setNewlyGeneratedPassword] = useState("");
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- New State for Edit Modal ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<VaultItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    username: "",
    url: "",
  });
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState("");

  const fetchVaultItems = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const response = await fetch("/api/vault", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const { data } = await response.json();
      setVaultItems(data);
    } else {
      localStorage.removeItem("token");
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]); 

  useEffect(() => {
    fetchVaultItems();
  }, [fetchVaultItems]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleCopyPassword = async (item: VaultItem) => {
    try {
      const decryptedPassword = await decryptData(item.password, item.notes);
      navigator.clipboard.writeText(decryptedPassword);
      alert(`Password for "${item.title}" copied to clipboard!`);
    } catch (error) {
      console.error("Decryption failed:", error);
      alert("Could not decrypt password.");
    }
  };

  // --- New Function for Deleting ---
  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }
    const token = localStorage.getItem("token");
    await fetch(`/api/vault/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchVaultItems(); // Refresh the list
  };

  // --- New Function for Viewing Password ---
  const handleViewPassword = async (item: VaultItem) => {
    try {
      const password = await decryptData(item.password, item.notes);
      setDecryptedPassword(password);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Decryption failed:", error);
      alert("Could not decrypt password.");
    }
  };

  // --- New Functions for Editing ---
  const handleEditClick = (item: VaultItem) => {
    setCurrentItem(item);
    setEditFormData({
      title: item.title,
      username: item.username,
      url: item.url || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/vault/${currentItem._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editFormData),
    });
    setIsEditDialogOpen(false);
    fetchVaultItems(); // Refresh the list
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white border-b dark:bg-slate-950 dark:border-slate-800">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800 dark:text-slate-200">
              Secure Vault
            </h1>
            <ThemeToggle />
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </nav>
      </header>

      <main className="container mx-auto p-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordGenerator
                onPasswordGenerated={setNewlyGeneratedPassword}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Save New Password</CardTitle>
              <CardDescription>
                Save the generated password to your vault.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddToVaultForm
                passwordToSave={newlyGeneratedPassword}
                onSave={fetchVaultItems}
                onPasswordSaved={() => setNewlyGeneratedPassword('')}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <Card>
  <CardHeader>
    <CardTitle>Saved Passwords</CardTitle>
  </CardHeader>
  <CardContent>
    {/* --- 1. ADD THE SEARCH INPUT FIELD HERE --- */}
    <Input
      type="text"
      placeholder="Search by title or username..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="mb-4"
    />

    <ul className="space-y-4">
      {/* --- 2. ADD THE .filter() METHOD HERE --- */}
      {vaultItems
        .filter((item) => {
          if (searchTerm === "") {
            return true; // If search is empty, show all items
          }
          // Check if search term is in the title or username (case-insensitive)
          return (
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.username.toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
        .map((item) => (
          <li
            key={item._id}
            className="flex items-center justify-between p-3 bg-slate-100 rounded-md dark:bg-slate-800"
          >
            <div>
              <strong className="text-gray-900 dark:text-slate-200">
                {item.title}
              </strong>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {item.username}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleCopyPassword(item)}
                className="bg-green-600 hover:bg-green-700"
              >
                Copy
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleViewPassword(item)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEditClick(item)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(item._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
    </ul>
  </CardContent>
</Card>
      </main>

      {/* --- Edit Dialog/Modal --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vault Item</DialogTitle>
            <DialogDescription>
              Make changes to your saved item here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editFormData.username}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, username: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={editFormData.url}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, url: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Password</DialogTitle>
            <DialogDescription>
              This is your decrypted password. Close this window to keep it secure.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center font-mono text-lg p-4 bg-slate-100 dark:bg-slate-800 rounded-md break-all">
              {decryptedPassword}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
