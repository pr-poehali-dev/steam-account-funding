import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { User, logout } from '@/lib/auth';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [user.id]);

  const loadTransactions = async () => {
    try {
      const result = await api.getTransactions(user.id);
      if (result.transactions) {
        setTransactions(result.transactions);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (user.first_name) {
      return user.first_name[0] + (user.last_name?.[0] || '');
    }
    return user.username?.[0]?.toUpperCase() || 'U';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: 'В обработке', className: 'bg-yellow-500/20 text-yellow-500' },
      completed: { label: 'Завершено', className: 'bg-green-500/20 text-green-500' },
      failed: { label: 'Ошибка', className: 'bg-red-500/20 text-red-500' },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-border/50 bg-card/80 backdrop-blur h-fit">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.photo_url} alt={user.first_name} />
                  <AvatarFallback className="text-2xl gradient-primary text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">
                {user.first_name} {user.last_name}
              </CardTitle>
              {user.username && (
                <CardDescription className="text-base">@{user.username}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg gradient-primary">
                <p className="text-sm text-white/80 mb-1">Баланс бонусов</p>
                <p className="text-3xl font-bold text-white">{user.balance.toFixed(2)} ₽</p>
              </div>
              <Button onClick={logout} variant="outline" className="w-full">
                <Icon name="LogOut" className="mr-2" size={18} />
                Выйти
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border/50 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="History" size={24} />
                История операций
              </CardTitle>
              <CardDescription>Все ваши транзакции и операции</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Загрузка...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Package" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Операций пока нет</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Совершите первое пополнение или смену региона
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${transaction.type === 'topup' ? 'gradient-primary' : 'gradient-secondary'} flex items-center justify-center`}>
                            <Icon
                              name={transaction.type === 'topup' ? 'Wallet' : 'MapPin'}
                              size={20}
                              className="text-white"
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{transaction.description}</p>
                            {transaction.steam_login && (
                              <p className="text-sm text-muted-foreground">
                                Логин: {transaction.steam_login}
                              </p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString('ru-RU')}
                        </span>
                        {transaction.amount && (
                          <span className="font-semibold text-primary">
                            {transaction.amount} ₽
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
