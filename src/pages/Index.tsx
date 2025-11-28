import { Header } from '@/components/layout/Header';
import { ComponentCard } from '@/components/calculator/ComponentCard';
import { PriceSummary } from '@/components/calculator/PriceSummary';
import { useCalculatorStore } from '@/store/calculatorStore';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

const Index = () => {
  const { components } = useCalculatorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(components.map((c) => c.category));
    return Array.from(cats);
  }, [components]);

  const filteredComponents = useMemo(() => {
    return components.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [components, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 lg:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Professional Software Cost Calculator
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Build Your Perfect
            <span className="gradient-text block">Software Quote</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the components you need and get an instant, detailed price estimate for your project.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          {/* Components Section */}
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in stagger-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !selectedCategory
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Components Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredComponents.map((component, index) => (
                <div
                  key={component.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${(index + 2) * 0.05}s` }}
                >
                  <ComponentCard component={component} />
                </div>
              ))}
            </div>

            {filteredComponents.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No components found matching your search.
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:block animate-fade-in stagger-2">
            <PriceSummary />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
