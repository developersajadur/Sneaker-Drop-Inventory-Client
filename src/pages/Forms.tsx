import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, UserPlus, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createUser, getUsers } from '@/api/users';
import { createDrop } from '@/api/drops';
import type { User } from '@/api/users';

type Tab = 'user' | 'drop';

export default function Forms() {
  const [activeTab, setActiveTab] = useState<Tab>('user');

  const tabs = [
    { id: 'user' as Tab, label: 'Create User', icon: UserPlus },
    { id: 'drop' as Tab, label: 'Create Drop', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Actions</h1>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'user' && <CreateUserForm />}
        {activeTab === 'drop' && <CreateDropForm />}
      </div>
    </div>
  );
}

/* ── Create User Form ── */
function CreateUserForm() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const mutation = useMutation({
    mutationFn: () => createUser(username),
    onSuccess: (user) => {
      toast.success(`User "${user.username}" created!`);
      setUsername('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message ?? 'Failed to create user');
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim().length >= 2) mutation.mutate();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={2}
            maxLength={30}
            className="flex-1 h-9 rounded-md border border-gray-700 bg-gray-800 px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" disabled={username.trim().length < 2 || mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create'
            )}
          </Button>
        </form>

        {/* Recent users */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Recent users</p>
          {usersLoading ? (
            <p className="text-xs text-gray-500">Loading...</p>
          ) : users && users.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {users.slice(0, 20).map((u: User) => (
                <Badge key={u.id} variant="secondary" className="text-xs">
                  {u.username}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-600">No users yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Create Drop Form ── */
function CreateDropForm() {
  const [title, setTitle] = useState('');
  const [totalStock, setTotalStock] = useState('');
  const [startsAt, setStartsAt] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      createDrop({ title, totalStock: Number(totalStock), startsAt: new Date(startsAt).toISOString() }),
    onSuccess: (drop) => {
      toast.success(`Drop "${drop.title}" created!`);
      setTitle('');
      setTotalStock('');
      setStartsAt('');
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message ?? 'Failed to create drop');
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create Drop</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title && totalStock && startsAt) mutation.mutate();
          }}
          className="space-y-3"
        >
          <div>
            <label className="text-xs text-gray-400 block mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. Air Jordan 1 Retro High"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-700 bg-gray-800 px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Total Stock</label>
            <input
              type="number"
              placeholder="100"
              min={1}
              value={totalStock}
              onChange={(e) => setTotalStock(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-700 bg-gray-800 px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-700 bg-gray-800 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary scheme-dark"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!title || !totalStock || !startsAt || mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Creating Drop...
              </>
            ) : (
              'Create Drop'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
