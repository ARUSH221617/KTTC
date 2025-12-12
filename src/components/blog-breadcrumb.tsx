import React from 'react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export function BlogBreadcrumb({ items }: BreadcrumbProps) {
  // Generate JSON-LD for breadcrumbs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kttcintl.com'}${item.href}` : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          {items.map((item, index) => {
             const isLast = index === items.length - 1;
             return (
               <React.Fragment key={item.label}>
                 <BreadcrumbItem>
                    {isLast || !item.href ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink asChild>
                            <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                    )}
                 </BreadcrumbItem>
                 {!isLast && <BreadcrumbSeparator />}
               </React.Fragment>
             )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
