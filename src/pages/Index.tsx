import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import TelegramLoginButton from '@/components/TelegramLoginButton';
import Profile from '@/components/Profile';
import { getStoredUser, User } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const [topupAmount, setTopupAmount] = useState('');
  const [steamLogin, setSteamLogin] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [topupProgress, setTopupProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [supportMessage, setSupportMessage] = useState('');
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    if (user && activeTab === 'support') {
      loadSupportMessages();
    }
  }, [user, activeTab]);

  const loadSupportMessages = async () => {
    if (!user) return;
    try {
      const result = await api.getSupportMessages(user.id);
      if (result.messages) {
        setSupportMessages(result.messages);
      }
    } catch (error) {
      console.error('Failed to load support messages:', error);
    }
  };

  const handleAuth = (authUser: User) => {
    setUser(authUser);
    setShowAuthDialog(false);
    toast({
      title: 'Успешный вход!',
      description: `Добро пожаловать, ${authUser.first_name}!`,
    });
  };

  const handleTopup = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (!steamLogin || !topupAmount) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setTopupProgress(0);

    try {
      const result = await api.createTransaction({
        user_id: user.id,
        type: 'topup',
        amount: parseFloat(topupAmount),
        steam_login: steamLogin,
      });

      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setTopupProgress(i);
      }

      toast({
        title: 'Успешно!',
        description: `Пополнение на ${topupAmount}₽ обрабатывается`,
      });

      setSteamLogin('');
      setTopupAmount('');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заявку',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setTopupProgress(0), 1000);
    }
  };

  const handleRegionChange = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (!steamLogin || !selectedRegion) {
      toast({
        title: 'Ошибка',
        description: 'Выберите регион и укажите логин',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setTopupProgress(0);

    try {
      await api.createTransaction({
        user_id: user.id,
        type: 'region_change',
        steam_login: steamLogin,
        region: selectedRegion,
      });

      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setTopupProgress(i);
      }

      toast({
        title: 'Успешно!',
        description: `Заявка на смену региона на ${selectedRegion} принята`,
      });

      setSteamLogin('');
      setSelectedRegion('');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заявку',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setTopupProgress(0), 1000);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !supportMessage.trim()) return;

    try {
      const result = await api.sendSupportMessage(user.id, supportMessage);
      if (result.success) {
        setSupportMessage('');
        loadSupportMessages();
        toast({
          title: 'Сообщение отправлено',
          description: 'Оператор ответит вам в ближайшее время',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    }
  };

  if (activeTab === 'profile' && user) {
    return <Profile user={user} />;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border backdrop-blur-md bg-background/90 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Icon name="Gamepad2" size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold">GE.PAY</h1>
            </div>
            
            <nav className="hidden md:flex gap-1">
              <Button
                variant={activeTab === 'home' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('home')}
                className={activeTab === 'home' ? 'gradient-primary border-0' : ''}
              >
                <Icon name="Home" size={18} className="mr-2" />
                Главная
              </Button>
              <Button
                variant={activeTab === 'topup' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('topup')}
                className={activeTab === 'topup' ? 'gradient-primary border-0' : ''}
              >
                <Icon name="Wallet" size={18} className="mr-2" />
                Пополнение
              </Button>
              <Button
                variant={activeTab === 'region' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('region')}
                className={activeTab === 'region' ? 'gradient-primary border-0' : ''}
              >
                <Icon name="MapPin" size={18} className="mr-2" />
                Смена региона
              </Button>
              <Button
                variant={activeTab === 'support' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('support')}
                className={activeTab === 'support' ? 'gradient-primary border-0' : ''}
              >
                <Icon name="MessageCircle" size={18} className="mr-2" />
                Поддержка
              </Button>
            </nav>

            {user ? (
              <Button
                variant="outline"
                onClick={() => setActiveTab('profile')}
                className="gap-2"
              >
                <Icon name="User" size={18} />
                {user.first_name}
              </Button>
            ) : (
              <Button onClick={() => setShowAuthDialog(true)} className="gradient-primary border-0">
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            )}
          </div>
        </div>
      </header>

      {activeTab === 'home' && (
        <>
          <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0 gradient-secondary opacity-5"></div>
            <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Icon name="Zap" size={16} />
                <span className="text-sm font-semibold">Работаем с 2020 года • 50,000+ довольных клиентов</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-bold mb-6">
                Пополнение Steam
                <br />
                <span className="gradient-text">быстро и надёжно</span>
              </h2>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Моментальное пополнение Steam для любого региона. Смена региона за 10 минут.
                Безопасно, выгодно, с поддержкой 24/7
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setActiveTab('topup')}
                  className="gradient-primary border-0 text-lg px-8 h-14"
                >
                  <Icon name="Wallet" className="mr-2" size={22} />
                  Пополнить сейчас
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setActiveTab('region')}
                  className="text-lg px-8 h-14"
                >
                  <Icon name="Globe" className="mr-2" size={22} />
                  Сменить регион
                </Button>
              </div>
            </div>
          </section>

          <section className="py-16 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { icon: 'Clock', title: '5-15 минут', desc: 'Среднее время пополнения' },
                  { icon: 'Shield', title: '100% гарантия', desc: 'Возврат при любой проблеме' },
                  { icon: 'Headphones', title: '24/7 поддержка', desc: 'Всегда на связи' },
                  { icon: 'Percent', title: 'Бонусы 3%', desc: 'На каждое пополнение' },
                ].map((item, idx) => (
                  <Card key={idx} className="text-center border-border/50 bg-card/80 backdrop-blur">
                    <CardHeader>
                      <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4">
                        <Icon name={item.icon} className="text-white" size={32} />
                      </div>
                      <CardTitle className="text-2xl">{item.title}</CardTitle>
                      <CardDescription className="text-base">{item.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'topup' && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold mb-4">
                Пополнение <span className="gradient-text">Steam</span>
              </h3>
              <p className="text-muted-foreground text-lg">
                Получите средства на аккаунт за 5-15 минут
              </p>
            </div>

            <Card className="border-border/50 bg-card/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl">Форма пополнения</CardTitle>
                <CardDescription>Заполните данные и получите средства моментально</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="steam-login" className="text-base">Логин Steam</Label>
                  <Input
                    id="steam-login"
                    placeholder="Введите ваш логин Steam"
                    value={steamLogin}
                    onChange={(e) => setSteamLogin(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Выберите сумму</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['500', '1000', '2000', '3000', '5000', '10000'].map((amount) => (
                      <Button
                        key={amount}
                        variant={topupAmount === amount ? 'default' : 'outline'}
                        onClick={() => setTopupAmount(amount)}
                        className={`h-14 text-lg ${topupAmount === amount ? 'gradient-primary border-0' : ''}`}
                      >
                        {amount}₽
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-amount" className="text-base">Или своя сумма</Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Минимум 100₽"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                {isProcessing && topupProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Обработка пополнения...</span>
                      <span>{topupProgress}%</span>
                    </div>
                    <Progress value={topupProgress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={handleTopup}
                  disabled={isProcessing}
                  className="w-full h-14 gradient-primary border-0 text-lg"
                >
                  {isProcessing ? (
                    <>
                      <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Icon name="CreditCard" className="mr-2" size={20} />
                      Пополнить на {topupAmount || '0'}₽
                    </>
                  )}
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                  Бонус 3% начисляется автоматически на баланс после пополнения
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {activeTab === 'region' && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold mb-4">
                Смена <span className="gradient-text">региона</span> Steam
              </h3>
              <p className="text-muted-foreground text-lg">
                Меняем регион безопасно через официальную поддержку Steam
              </p>
            </div>

            <Card className="border-border/50 bg-card/90 backdrop-blur mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Заявка на смену региона</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="region-login" className="text-base">Логин Steam</Label>
                  <Input
                    id="region-login"
                    placeholder="Введите ваш логин Steam"
                    value={steamLogin}
                    onChange={(e) => setSteamLogin(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Выберите регион</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Выберите страну" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Турция">🇹🇷 Турция (от 500₽)</SelectItem>
                      <SelectItem value="Аргентина">🇦🇷 Аргентина (от 600₽)</SelectItem>
                      <SelectItem value="Казахстан">🇰🇿 Казахстан (от 400₽)</SelectItem>
                      <SelectItem value="США">🇺🇸 США (от 800₽)</SelectItem>
                      <SelectItem value="Индия">🇮🇳 Индия (от 450₽)</SelectItem>
                      <SelectItem value="Бразилия">🇧🇷 Бразилия (от 550₽)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isProcessing && topupProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Обработка заявки...</span>
                      <span>{topupProgress}%</span>
                    </div>
                    <Progress value={topupProgress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={handleRegionChange}
                  disabled={isProcessing}
                  className="w-full h-14 gradient-primary border-0 text-lg"
                >
                  {isProcessing ? (
                    <>
                      <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Icon name="MapPin" className="mr-2" size={20} />
                      Сменить регион
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Icon name="Info" size={24} className="text-primary" />
                  Как работает смена региона?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                  <li>Вы выбираете нужный регион и отправляете заявку</li>
                  <li>Мы связываемся с официальной поддержкой Steam</li>
                  <li>Регион меняется через официальную процедуру (безопасно)</li>
                  <li>Получаете уведомление о завершении (10-30 минут)</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {activeTab === 'support' && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold mb-4">
                <span className="gradient-text">Поддержка</span> 24/7
              </h3>
              <p className="text-muted-foreground text-lg">
                Ответим на любые вопросы в течение 5 минут
              </p>
            </div>

            <Card className="border-border/50 bg-card/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageCircle" size={24} />
                  Чат с поддержкой
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user ? (
                  <div className="text-center py-12">
                    <Icon name="Lock" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Войдите, чтобы связаться с поддержкой
                    </p>
                    <Button onClick={() => setShowAuthDialog(true)} className="gradient-primary border-0">
                      Войти через Telegram
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="h-96 overflow-y-auto space-y-3 p-4 border border-border rounded-lg bg-background/50">
                      {supportMessages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          Начните диалог с поддержкой
                        </div>
                      ) : (
                        supportMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                msg.is_admin
                                  ? 'bg-card border border-border'
                                  : 'gradient-primary text-white'
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p className={`text-xs mt-1 ${msg.is_admin ? 'text-muted-foreground' : 'text-white/70'}`}>
                                {new Date(msg.created_at).toLocaleTimeString('ru-RU')}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Введите ваше сообщение..."
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        className="resize-none"
                        rows={2}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!supportMessage.trim()}
                        className="gradient-primary border-0 px-6"
                      >
                        <Icon name="Send" size={20} />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Вход в аккаунт</DialogTitle>
            <DialogDescription>
              Войдите через Telegram, чтобы пользоваться всеми возможностями сервиса
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <TelegramLoginButton onAuth={handleAuth} />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
          </p>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Icon name="Gamepad2" size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold">GE.PAY</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Надёжный сервис пополнения Steam с 2020 года
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Услуги</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-primary cursor-pointer">Пополнение Steam</p>
                <p className="hover:text-primary cursor-pointer">Смена региона</p>
                <p className="hover:text-primary cursor-pointer">Поддержка 24/7</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Информация</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-primary cursor-pointer">О нас</p>
                <p className="hover:text-primary cursor-pointer">FAQ</p>
                <p className="hover:text-primary cursor-pointer">Отзывы</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Icon name="Send" size={16} />
                  Telegram
                </p>
                <p className="flex items-center gap-2">
                  <Icon name="Mail" size={16} />
                  Email
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 GE.PAY. Все права защищены
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary">Политика конфиденциальности</a>
              <a href="#" className="hover:text-primary">Условия использования</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
