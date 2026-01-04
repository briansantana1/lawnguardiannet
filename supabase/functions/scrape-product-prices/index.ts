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
  priceSource?: string; // "live" | "search" | "link"
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

const retailerDomains: Record<string, string[]> = {
  "Home Depot": ["homedepot.com"],
  "Lowe's": ["lowes.com"],
  "Amazon": ["amazon.com"],
  "Ace Hardware": ["acehardware.com"],
};

// Extract price from text - improved regex to find product prices
const extractPrice = (text: string): string | null => {
  // Look for common price patterns, prefer prices that look like product prices ($XX.XX)
  const patterns = [
    /\$\d{1,3}(?:,\d{3})*\.\d{2}/g, // $39.99, $1,299.99
    /\$\d{1,3}(?:,\d{3})*/g, // $39, $1,299
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Filter out very small prices (likely shipping) and very large prices (likely bundles)
      const validPrices = matches.filter(p => {
        const num = parseFloat(p.replace(/[$,]/g, ''));
        return num >= 10 && num <= 500; // Reasonable range for lawn products
      });
      if (validPrices.length > 0) {
        return validPrices[0];
      }
      // If no prices in range, return first match
      return matches[0];
    }
  }
  return null;
};

const matchesRetailer = (url: string, retailerName: string): boolean => {
  const domains = retailerDomains[retailerName] || [];
  return domains.some((d) => url.toLowerCase().includes(d));
};

// Scrape a specific product page directly for accurate pricing
const scrapeProductPage = async (url: string, apiKey: string): Promise<{ price: string | null; title: string | null }> => {
  try {
    console.log(`Scraping product page: ${url}`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 2000, // Wait for dynamic content
      }),
    });

    if (!response.ok) {
      console.log(`Failed to scrape ${url}: ${response.status}`);
      return { price: null, title: null };
    }

    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || '';
    const metadata = data.data?.metadata || data.metadata || {};
    
    const price = extractPrice(markdown);
    const title = metadata.title || null;
    
    console.log(`Scraped price from ${url}: ${price}`);
    return { price, title };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { price: null, title: null };
  }
};

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

    // Build search query - be specific about the product
    const searchQuery = `${productName} lawn ${productType || ''} buy price`.trim();

    // Use Firecrawl search to find product pages
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 15,
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
            url: r.searchUrl(productName),
            available: false,
            logo: r.logo,
            priceSource: 'link'
          }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Search returned ${searchData.data?.length || 0} results`);

    // Collect retailer product URLs from search results
    const retailerUrls: Record<string, { url: string; title: string; searchPrice: string | null }> = {};
    
    for (const result of searchData.data || []) {
      const url = result.url || '';
      
      for (const retailer of retailers) {
        if (retailerUrls[retailer.name]) continue;
        if (!matchesRetailer(url, retailer.name)) continue;
        
        // Check if this is a product page (not a search/category page)
        const isProductPage = 
          (retailer.name === 'Amazon' && url.includes('/dp/')) ||
          (retailer.name === 'Home Depot' && url.includes('/p/')) ||
          (retailer.name === "Lowe's" && url.includes('/pd/')) ||
          (retailer.name === 'Ace Hardware' && url.includes('/product/'));
        
        const markdown = result.markdown || '';
        const description = result.description || '';
        const searchPrice = extractPrice(markdown) || extractPrice(description);
        
        retailerUrls[retailer.name] = {
          url,
          title: result.title || productName,
          searchPrice
        };
        
        console.log(`Found ${retailer.name} URL: ${url} (product page: ${isProductPage}, search price: ${searchPrice})`);
      }
    }

    // For each retailer with a product page URL, scrape directly for accurate price
    const results: ProductResult[] = [];
    const scrapePromises: Promise<void>[] = [];
    
    for (const retailer of retailers) {
      const urlInfo = retailerUrls[retailer.name];
      
      if (urlInfo) {
        // Check if it's a product page worth scraping
        const url = urlInfo.url;
        const isProductPage = 
          (retailer.name === 'Amazon' && url.includes('/dp/')) ||
          (retailer.name === 'Home Depot' && url.includes('/p/')) ||
          (retailer.name === "Lowe's" && url.includes('/pd/')) ||
          (retailer.name === 'Ace Hardware' && url.includes('/product/'));
        
        if (isProductPage && !urlInfo.searchPrice) {
          // Scrape the product page for accurate price
          const scrapePromise = scrapeProductPage(url, apiKey).then(({ price, title }) => {
            results.push({
              retailer: retailer.name,
              productName: title || urlInfo.title,
              price: price,
              url: url,
              available: Boolean(price),
              logo: retailer.logo,
              priceSource: price ? 'live' : 'link'
            });
          });
          scrapePromises.push(scrapePromise);
        } else {
          // Use the price from search results
          results.push({
            retailer: retailer.name,
            productName: urlInfo.title,
            price: urlInfo.searchPrice,
            url: urlInfo.url,
            available: Boolean(urlInfo.searchPrice),
            logo: retailer.logo,
            priceSource: urlInfo.searchPrice ? 'search' : 'link'
          });
        }
      } else {
        // No URL found, provide direct search link
        results.push({
          retailer: retailer.name,
          productName: productName,
          price: null,
          url: retailer.searchUrl(productName),
          available: false,
          logo: retailer.logo,
          priceSource: 'link'
        });
      }
    }

    // Wait for all scrape operations to complete
    await Promise.all(scrapePromises);

    // Ensure all retailers are in results
    const resultRetailers = new Set(results.map(r => r.retailer));
    for (const retailer of retailers) {
      if (!resultRetailers.has(retailer.name)) {
        results.push({
          retailer: retailer.name,
          productName: productName,
          price: null,
          url: retailer.searchUrl(productName),
          available: false,
          logo: retailer.logo,
          priceSource: 'link'
        });
      }
    }

    console.log('Final results:', results.map(r => ({ retailer: r.retailer, price: r.price, source: r.priceSource })));

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
          logo: r.logo,
          priceSource: 'link'
        }))
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
