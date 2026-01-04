import { useEffect, useState } from "react";
import { ExternalLink, Loader2, DollarSign, Search, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductResult {
  retailer: string;
  productName: string;
  price: string | null;
  url: string;
  available: boolean;
  logo?: string;
}

interface PriceComparisonProps {
  productName: string;
  productType: string;
}

export function PriceComparison({ productName, productType }: PriceComparisonProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset when user picks a different chemical/product type
  useEffect(() => {
    setResults([]);
    setSearched(false);
    setError(null);
    setLoading(false);
  }, [productName, productType]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('scrape-product-prices', {
        body: { productName, productType }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.success) {
        setResults(data.data || []);
        toast({
          title: "Prices Found",
          description: `Found results from ${data.data?.length || 0} retailers.`,
        });
      } else {
        setError(data.error || 'Failed to fetch prices');
        // Still show fallback retailer links
        if (data.retailers) {
          setResults(data.retailers);
        }
      }
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('Failed to fetch prices. Showing direct links instead.');
      // Show default retailer links as fallback
      setResults([
        { retailer: "Home Depot", productName, price: null, url: `https://www.homedepot.com/s/${encodeURIComponent(productName)}`, available: false, logo: "🏠" },
        { retailer: "Lowe's", productName, price: null, url: `https://www.lowes.com/search?searchTerm=${encodeURIComponent(productName)}`, available: false, logo: "🔧" },
        { retailer: "Amazon", productName, price: null, url: `https://www.amazon.com/s?k=${encodeURIComponent(productName)}`, available: false, logo: "📦" },
        { retailer: "Ace Hardware", productName, price: null, url: `https://www.acehardware.com/search?query=${encodeURIComponent(productName)}`, available: false, logo: "🔨" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Sort results by price (lowest first), putting null prices at end
  const sortedResults = [...results].sort((a, b) => {
    if (!a.price && !b.price) return 0;
    if (!a.price) return 1;
    if (!b.price) return -1;
    const priceA = parseFloat(a.price.replace(/[$,]/g, ''));
    const priceB = parseFloat(b.price.replace(/[$,]/g, ''));
    return priceA - priceB;
  });

  const lowestPrice = sortedResults.find(r => r.price)?.price;

  if (!searched) {
    return (
      <div className="mt-6 p-4 rounded-xl bg-lawn-50 border border-lawn-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Compare Prices</h4>
              <p className="text-sm text-muted-foreground">
                Search for "{productName}" across major retailers
              </p>
            </div>
          </div>
          <Button onClick={handleSearch} disabled={loading} variant="scan">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Compare Prices
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Card className="border-lawn-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-primary" />
              Price Comparison
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSearch}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Searching for: {productName}
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Searching retailers...</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedResults.map((result, index) => (
                <a
                  key={`${result.retailer}-${index}`}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{result.logo || "🛒"}</span>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {result.retailer}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {result.productName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {result.price ? (
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">
                          {result.price}
                        </p>
                        {result.price === lowestPrice && (
                          <Badge variant="default" className="text-xs bg-lawn-600">
                            Lowest
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        View Price
                      </Badge>
                    )}
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Prices are fetched in real-time and may vary. Click to view on retailer site.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
