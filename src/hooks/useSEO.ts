import { useEffect } from 'react';

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

/**
 * Dynamic SEO Manager hook to update document title and meta tags
 */
export function useSEO({ title, description, keywords, ogImage }: SEOOptions) {
  useEffect(() => {
    // Update Title
    const defaultTitle = 'LUMO - Tanzania\'s Trusted Multi-Vendor Escrow Marketplace';
    const finalTitle = title ? `${title} | LUMO Marketplace` : defaultTitle;
    document.title = finalTitle;

    // Helper to update or create meta tag
    const setMetaTag = (nameOrProperty: string, value: string, isProperty = false) => {
      const attributeName = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attributeName}="${nameOrProperty}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attributeName, nameOrProperty);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', value);
    };

    // Update Description
    if (description) {
      setMetaTag('description', description);
      setMetaTag('og:description', description, true);
      setMetaTag('twitter:description', description);
    }

    // Update Keywords
    if (keywords) {
      setMetaTag('keywords', keywords);
    } else {
      setMetaTag('keywords', 'LUMO, Tanzania ecommerce, Dar es Salaam online shop, M-Pesa escrow, phones, electronics, Kariakoo online');
    }

    // Update Open Graph Title & Image
    setMetaTag('og:title', finalTitle, true);
    setMetaTag('twitter:title', finalTitle);

    if (ogImage) {
      setMetaTag('og:image', ogImage, true);
      setMetaTag('twitter:image', ogImage);
    }
  }, [title, description, keywords, ogImage]);
}
