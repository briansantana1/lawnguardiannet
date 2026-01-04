import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductResult {
  retailer: string;
  productName: string;
  price: string | null;
  url: string;
  available: boolean;
  error?: string;
  logo?: string;
}

const retailers = [
  {
    name: "Home Depot",
    searchUrl: (query: string) => `https://www.homedepot.com/s/${encodeURIComponent(query)}`,
    logo: "🏠"
  },
  {
    name: "Lowe's",
    searchUrl: (query: string) => `https://www.lowes.com/search?searchTerm=${encodeURIComponent(query)}`,
    logo: "🔧"
  },
  {
    name: "Amazon",
    searchUrl: (query: string) => `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
    logo: "📦"
  },
  {
    name: "Ace Hardware",
    searchUrl: (query: string) => `https://www.acehardware.com/search?query=${encodeURIComponent(query)}`,
    logo: "🔨"
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, productType } = await req.json();
    
    if (!productName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Product name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching for prices: ${productName} (${productType})`);

    // Build search query
    const searchQuery = `${productName} lawn ${productType || ''}`.trim();

    // Use Firecrawl search to find product information
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${searchQuery} price buy`,
        limit: 10,
        scrapeOptions: {
          formats: ['markdown']
        }
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Firecrawl search error:', searchData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: searchData.error || 'Failed to search for products',
          retailers: retailers.map(r => ({
            retailer: r.name,
            productName: productName,
            price: null,
            url: r.searchUrl(searchQuery),
            available: false,
            logo: r.logo
          }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Search results received:', searchData);

    // Parse results to extract price information
    const results: ProductResult[] = [];
    const processedRetailers = new Set<string>();

    // Try to match search results to our known retailers
    for (const result of searchData.data || []) {
      const url = result.url?.toLowerCase() || '';
      
      for (const retailer of retailers) {
        const retailerDomain = retailer.name.toLowerCase().replace(/['\s]/g, '');
        
        if (url.includes(retailerDomain) || url.includes(retailerDomain.replace(' ', ''))) {
          if (!processedRetailers.has(retailer.name)) {
            processedRetailers.add(retailer.name);
            
            // Try to extract price from markdown content
            const markdown = result.markdown || '';
            const priceMatch = markdown.match(/\$[\d,]+\.?\d*/);
            
            results.push({
              retailer: retailer.name,
              productName: result.title || productName,
              price: priceMatch ? priceMatch[0] : null,
              url: result.url || retailer.searchUrl(searchQuery),
              available: true,
              logo: (retailer as any).logo
            });
          }
        }
      }
    }

    // Add fallback links for retailers not found in search results
    for (const retailer of retailers) {
      if (!processedRetailers.has(retailer.name)) {
        results.push({
          retailer: retailer.name,
          productName: productName,
          price: null,
          url: retailer.searchUrl(searchQuery),
          available: false,
          logo: (retailer as any).logo
        });
      }
    }

    console.log('Processed results:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results,
        searchQuery
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping prices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape prices';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        retailers: retailers.map(r => ({
          retailer: r.name,
          productName: 'Product',
          price: null,
          url: r.searchUrl('lawn care'),
          available: false,
          logo: r.logo
        }))
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
