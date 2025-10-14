import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const Generator = () => {
  const [theme, setTheme] = useState('');
  const [geo, setGeo] = useState('');
  const [domain, setDomain] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLanding, setGeneratedLanding] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!theme || !geo || !domain) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/afb307cd-2053-48e4-9055-5ee5a148c327', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme, geo, domain }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации');
      }

      setGeneratedLanding(data);
      toast({
        title: 'Готово!',
        description: 'Лендинг успешно создан',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewLanding = async () => {
    if (!generatedLanding) return;

    try {
      const response = await fetch(
        `https://functions.poehali.dev/24b78c6a-7175-4351-9647-3b3a3572a3b2?domain=${generatedLanding.domain}`
      );
      const data = await response.json();

      if (data.html_content) {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(data.html_content);
          newWindow.document.close();
        }
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Генератор лендингов
            </h1>
            <p className="text-xl text-muted-foreground">
              Создайте уникальный лендинг с помощью AI за секунды
            </p>
          </div>

          <Card className="mb-8 shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Sparkles" size={24} className="text-primary" />
                Настройки лендинга
              </CardTitle>
              <CardDescription>
                Опишите тему, укажите геолокацию и домен
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Тема бизнеса</Label>
                <Input
                  id="theme"
                  placeholder="Например: Доставка пиццы, Стоматология, Фитнес-клуб"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="geo">Геолокация</Label>
                <Input
                  id="geo"
                  placeholder="Например: Москва, Санкт-Петербург, Новосибирск"
                  value={geo}
                  onChange={(e) => setGeo(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Домен сайта</Label>
                <Input
                  id="domain"
                  placeholder="Например: pizza-moscow.ru"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Icon name="Wand2" className="mr-2 h-5 w-5" />
                    Сгенерировать лендинг
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedLanding && (
            <Card className="shadow-xl border-0 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={24} className="text-accent" />
                  Лендинг создан!
                </CardTitle>
                <CardDescription>
                  Домен: <span className="font-semibold text-foreground">{generatedLanding.domain}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">ID лендинга</p>
                    <p className="font-mono text-lg">{generatedLanding.landing_id}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">URL предпросмотра</p>
                    <p className="font-mono text-sm truncate">{generatedLanding.preview_url}</p>
                  </div>
                </div>

                <Button
                  onClick={handleViewLanding}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Icon name="Eye" className="mr-2 h-5 w-5" />
                  Просмотреть лендинг
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Icon name="Zap" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Быстрая генерация</h3>
              <p className="text-sm text-muted-foreground">
                Создание лендинга за секунды с помощью AI
              </p>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Icon name="Layout" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Готовые страницы</h3>
              <p className="text-sm text-muted-foreground">
                Terms, Privacy, Cookies и Blog включены
              </p>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Icon name="CheckSquare" size={48} className="mx-auto mb-4 text-accent" />
              <h3 className="font-semibold text-lg mb-2">Форма заказа</h3>
              <p className="text-sm text-muted-foreground">
                С редиректом на Thank You страницу
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
