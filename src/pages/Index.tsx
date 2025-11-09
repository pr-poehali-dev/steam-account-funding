import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function Index() {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [email, setEmail] = useState('');

  const regions = [
    { name: 'Турция', flag: '🇹🇷', price: 'от 500₽' },
    { name: 'Аргентина', flag: '🇦🇷', price: 'от 600₽' },
    { name: 'Казахстан', flag: '🇰🇿', price: 'от 400₽' },
    { name: 'США', flag: '🇺🇸', price: 'от 800₽' },
  ];

  const features = [
    { icon: 'Zap', title: 'Быстро', desc: 'Пополнение за 5 минут' },
    { icon: 'Globe', title: 'Любой регион', desc: 'Работаем со всеми странами' },
    { icon: 'Shield', title: 'Безопасно', desc: 'Гарантия возврата' },
    { icon: 'DollarSign', title: 'Выгодно', desc: 'Лучшие цены на рынке' },
  ];

  const reviews = [
    { name: 'Алексей М.', rating: 5, text: 'Быстрое пополнение, все прошло отлично!' },
    { name: 'Мария К.', rating: 5, text: 'Сменила регион за 10 минут, рекомендую!' },
    { name: 'Дмитрий П.', rating: 5, text: 'Лучший сервис, пользуюсь уже год' },
  ];

  const faqs = [
    { q: 'Как быстро происходит пополнение?', a: 'Обычно пополнение занимает от 5 до 15 минут после подтверждения оплаты.' },
    { q: 'Безопасно ли менять регион аккаунта?', a: 'Да, мы используем официальные методы смены региона через поддержку Steam.' },
    { q: 'Какие способы оплаты вы принимаете?', a: 'Принимаем карты РФ, СБП, электронные кошельки и криптовалюту.' },
    { q: 'Есть ли гарантия возврата?', a: 'Да, если услуга не была оказана, мы возвращаем 100% суммы.' },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-text">GE.PAY</h1>
            <nav className="hidden md:flex gap-6">
              <a href="#topup" className="hover:text-primary transition-colors">Пополнение</a>
              <a href="#region" className="hover:text-primary transition-colors">Смена региона</a>
              <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
              <a href="#contacts" className="hover:text-primary transition-colors">Контакты</a>
            </nav>
            <Button className="gradient-primary hover-scale border-0">
              Войти
            </Button>
          </div>
        </div>
      </header>

      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-secondary opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 gradient-accent border-0 text-white">
              Работаем с 2020 года
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Пополнение Steam
              <br />
              <span className="gradient-text">без ограничений</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Быстрое пополнение Steam для любого региона. Меняем регион аккаунта за 10 минут.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-primary hover-scale border-0 text-lg px-8">
                <Icon name="Wallet" className="mr-2" size={20} />
                Пополнить сейчас
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 hover-scale">
                <Icon name="MapPin" className="mr-2" size={20} />
                Сменить регион
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="hover-scale border-border/50 bg-card/80 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Icon name={feature.icon} className="text-white" size={24} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="topup" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Пополнить <span className="gradient-text">Steam</span>
              </h3>
              <p className="text-muted-foreground">
                Выберите сумму и получите средства на аккаунт за 5 минут
              </p>
            </div>

            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle>Форма пополнения</CardTitle>
                <CardDescription>Заполните данные для быстрого пополнения</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email или логин Steam</Label>
                  <Input
                    id="email"
                    placeholder="example@steam.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Выберите сумму пополнения</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['500₽', '1000₽', '2000₽', '3000₽', '5000₽', '10000₽'].map((amount) => (
                      <Button
                        key={amount}
                        variant={topUpAmount === amount ? 'default' : 'outline'}
                        onClick={() => setTopUpAmount(amount)}
                        className={topUpAmount === amount ? 'gradient-primary border-0' : ''}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-amount">Или введите свою сумму</Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Минимум 100₽"
                    className="bg-input border-border"
                  />
                </div>

                <Button className="w-full gradient-primary hover-scale border-0 text-lg py-6">
                  <Icon name="CreditCard" className="mr-2" size={20} />
                  Перейти к оплате
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="region" className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Смена <span className="gradient-text">региона</span>
              </h3>
              <p className="text-muted-foreground">
                Меняем регион Steam быстро и безопасно
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {regions.map((region, idx) => (
                <Card key={idx} className="hover-scale border-border/50 bg-card/80 backdrop-blur">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{region.flag}</span>
                        <div>
                          <CardTitle>{region.name}</CardTitle>
                          <CardDescription className="text-primary font-semibold">
                            {region.price}
                          </CardDescription>
                        </div>
                      </div>
                      <Button className="gradient-primary border-0">
                        Выбрать
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Info" size={24} className="text-primary" />
                  Как это работает?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                  <li>Выбираете нужный регион и оплачиваете услугу</li>
                  <li>Передаете нам данные для входа в аккаунт (безопасно)</li>
                  <li>Мы меняем регион через официальную поддержку Steam</li>
                  <li>Получаете аккаунт с новым регионом за 10-30 минут</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Отзывы</span> клиентов
            </h3>
            <p className="text-muted-foreground">Что говорят о нас пользователи</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reviews.map((review, idx) => (
              <Card key={idx} className="hover-scale border-border/50 bg-card/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{review.name}</CardTitle>
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Icon key={i} name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <CardDescription className="text-base">{review.text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Часто задаваемые <span className="gradient-text">вопросы</span>
              </h3>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border border-border/50 rounded-lg px-6 bg-card/80 backdrop-blur">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section id="contacts" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-4">
                  Остались <span className="gradient-text">вопросы?</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Свяжитесь с нами удобным способом
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-16 hover-scale" size="lg">
                    <Icon name="Send" className="mr-2" size={20} />
                    Telegram
                  </Button>
                  <Button variant="outline" className="h-16 hover-scale" size="lg">
                    <Icon name="Mail" className="mr-2" size={20} />
                    Email
                  </Button>
                  <Button variant="outline" className="h-16 hover-scale" size="lg">
                    <Icon name="MessageCircle" className="mr-2" size={20} />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground">
              © 2024 GE.PAY. Все права защищены.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Политика конфиденциальности
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Условия использования
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
